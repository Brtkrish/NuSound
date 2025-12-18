import { cookies } from 'next/headers';
import { getUserPlaylists, getSavedTracks, getUserProfile, getTopTracks, getRelatedArtists, getArtistTopTracks, getNewReleases, getPlaylistTracks } from './spotify';

export async function getSessionToken() {
    const cookieStore = await cookies();

    let rawToken = '';

    // 1. Try to assemble chunked token
    const chunkCount = cookieStore.get('sp_token_chunks')?.value;
    if (chunkCount) {
        const count = parseInt(chunkCount, 10);
        for (let i = 0; i < count; i++) {
            const chunk = cookieStore.get(`sp_token.${i}`)?.value;
            if (chunk) rawToken += chunk;
        }
    } else {
        // 2. Try single token
        rawToken = cookieStore.get('sp_token')?.value || '';

        // 3. Fallback: try to manually find chunks if count is missing
        if (!rawToken) {
            const firstChunk = cookieStore.get('sp_token.0')?.value;
            if (firstChunk) {
                rawToken = firstChunk;
                let nextIndex = 1;
                while (true) {
                    const nextChunk = cookieStore.get(`sp_token.${nextIndex}`)?.value;
                    if (!nextChunk) break;
                    rawToken += nextChunk;
                    nextIndex++;
                }
            }
        }
    }

    // 4. Decode the result (since we Base64 encoded it in the callback)
    if (rawToken) {
        try {
            return Buffer.from(rawToken, 'base64').toString('utf-8');
        } catch (e) {
            console.error("Token decoding failed, returning raw", e);
            return rawToken; // Fallback to raw if it wasn't encoded
        }
    }

    // 5. Legacy Fallback
    return cookieStore.get('access_token')?.value || null;
}

// ... (Keep the rest of your export functions: getPlaylistsAction, etc. exactly as they were) ...
// (Do not delete the other functions in this file)