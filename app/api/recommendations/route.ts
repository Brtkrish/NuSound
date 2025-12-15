import { getTopTracks, getRelatedArtists, getArtistTopTracks, getNewReleases } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(request: Request) {
    const cookies = parse(request.headers.get('cookie') || '');
    const access_token = cookies.access_token;

    if (!access_token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        console.log("Fetching seeds with token:", access_token ? "Present" : "Missing");
        // 1. Get Seeds (Top Tracks)
        const topTracksRes = await getTopTracks(access_token);
        console.log("Top Tracks Status:", topTracksRes.status);

        if (!topTracksRes.ok) {
            const err = await topTracksRes.text();
            console.error("Top Tracks Error:", err);
            throw new Error(`Failed to fetch seeds: ${topTracksRes.status} ${err}`);
        }

        const topTracksData = await topTracksRes.json();

        if (!topTracksData.items) {
            console.error("No items in Top Tracks:", topTracksData);
            throw new Error('No top tracks found or invalid format');
        }

        const seeds = topTracksData.items.map((t: any) => t.artists[0].id);
        console.log("Seeds (IDs):", seeds);

        // 2. "Deep Graph" Discovery Engine (Metadata-Based)
        let recsData;
        try {
            console.log("Starting Deep Graph Engine...");

            // A. Multi-Seed Selection
            // Pick 3 random artists from Top Tracks to ensure variety
            const allSeedIds = topTracksData.items.map((t: any) => t.artists[0].id);
            const shuffledSeeds = allSeedIds.sort(() => 0.5 - Math.random());
            const selectedSeeds = shuffledSeeds.slice(0, 3);

            console.log("Selected Seeds:", selectedSeeds);

            // B. Graph Expansion (Related Artists)
            let artistPool: string[] = [...selectedSeeds];

            await Promise.all(selectedSeeds.map(async (seedId: string) => {
                const relatedRes = await getRelatedArtists(access_token, seedId);
                if (relatedRes.ok) {
                    const relatedData = await relatedRes.json();
                    if (relatedData.artists) {
                        // Take top 4 related artists per seed
                        const relatedIds = relatedData.artists.slice(0, 4).map((a: any) => a.id);
                        artistPool.push(...relatedIds);
                    }
                }
            }));

            // Deduplicate Artist Pool
            artistPool = Array.from(new Set(artistPool));
            console.log(`Expanded to ${artistPool.length} Artists in Graph`);

            // C. Track Collection & Filtering
            let candidateTracks: any[] = [];

            // Fetch top tracks for all artists in the pool (Parallel)
            await Promise.all(artistPool.map(async (artistId) => {
                const tracksRes = await getArtistTopTracks(access_token, artistId);
                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    if (tracksData.tracks) {
                        // Filter for "Hidden Gems" (Popularity < 80) 
                        // and also include some popular ones (Popularity > 50) to keep it balanced
                        const validTracks = tracksData.tracks.filter((t: any) => t.popularity < 80);
                        candidateTracks.push(...validTracks);
                    }
                }
            }));

            console.log(`Collected ${candidateTracks.length} Candidate Tracks`);

            if (candidateTracks.length === 0) throw new Error("Deep Graph found no tracks");

            // D. Shuffle and Curate
            // Deduplicate by ID
            const uniqueTracks = Array.from(new Map(candidateTracks.map(t => [t.id, t])).values());

            // Shuffle
            const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5);

            // Return Top 20
            recsData = { tracks: shuffledTracks.slice(0, 20) };
            console.log("Graph Engine Success. Returning", recsData.tracks.length, "tracks.");

        } catch (e) {
            console.error("Deep Graph Engine failed, switching to fallback:", e);
            const fallbackRes = await getNewReleases(access_token);
            const fallbackData = await fallbackRes.json();

            // Map Albums to Track format (New Releases are Albums)
            const tracks = fallbackData.albums.items.map((album: any) => ({
                id: album.id,
                name: album.name,
                artists: album.artists,
                album: album,
                popularity: 50
            }));
            recsData = { tracks };
        }

        // 3. Format Response to match our App's Schema
        const formattedTracks = recsData.tracks.map((t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0].name,
            album: t.album.name,
            coverUrl: t.album.images[0]?.url,
            duration: '0:00', // Spotify returns duration_ms, simplifying for now
            popularity: t.popularity,
        }));

        return NextResponse.json(formattedTracks);
    } catch (error: any) {
        console.error("Recommendations API Error:", error);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
}
