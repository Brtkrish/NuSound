
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const AUTHORIZATION_ENDPOINT = `https://accounts.spotify.com/authorize`;

export const getAuthorizationUrl = () => {
    const scope = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'streaming',
        'user-read-email',
        'user-read-private'
    ].join(' ');

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: client_id!,
        scope: scope,
        redirect_uri: redirect_uri!,
    });

    return `${AUTHORIZATION_ENDPOINT}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirect_uri!,
        }),
    });

    return response.json();
};

export const getTopTracks = async (access_token: string) => {
    return fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5', {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

export const getUserProfile = async (access_token: string) => {
    return fetch('https://api.spotify.com/v1/me', {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 1. Get Related Artists (The "Radio" Logic)
export const getRelatedArtists = async (access_token: string, artist_id: string) => {
    return fetch(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 2. Get Top Tracks for an Artist
export const getArtistTopTracks = async (access_token: string, artist_id: string) => {
    return fetch(`https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=from_token`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const getNewReleases = async (access_token: string) => {
    return fetch('https://api.spotify.com/v1/browse/new-releases?limit=10', {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 3. Get Audio Features for Tracks (The "Sonic Fingerprint")
export const getAudioFeatures = async (access_token: string, track_ids: string[]) => {
    // Spotify allows up to 100 IDs per call
    const ids = track_ids.slice(0, 100).join(',');
    return fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 4. Library Management (Likes)
export const checkSavedTracks = async (access_token: string, track_ids: string[]) => {
    const ids = track_ids.join(',');
    return fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const saveTrack = async (access_token: string, track_id: string) => {
    return fetch(`https://api.spotify.com/v1/me/tracks?ids=${track_id}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const removeTrack = async (access_token: string, track_id: string) => {
    return fetch(`https://api.spotify.com/v1/me/tracks?ids=${track_id}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const getSavedTracks = async (access_token: string, limit: number = 50, offset: number = 0) => {
    return fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 5. Playlist Management
export const getUserPlaylists = async (access_token: string) => {
    return fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const createPlaylist = async (access_token: string, user_id: string, name: string, description: string, isPublic: boolean) => {
    return fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description,
            public: isPublic,
        }),
    });
}

export const addTracksToPlaylist = async (access_token: string, playlist_id: string, track_uris: string[]) => {
    return fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: track_uris,
        }),
    });
}

export const getPlaylistTracks = async (access_token: string, playlist_id: string) => {
    return fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=20`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

// 6. Search & Recommendations
export const searchTracks = async (access_token: string, query: string, limit: number = 5) => {
    const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString(),
    });
    return fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const getRecommendationsBySeeds = async (access_token: string, seedTracks: string[], seedArtists: string[] = [], limit: number = 20) => {
    const params = new URLSearchParams({
        seed_tracks: seedTracks.join(','),
        limit: limit.toString(),
        market: 'from_token',
    });
    if (seedArtists.length > 0) {
        params.append('seed_artists', seedArtists.join(','));
    }
    return fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}
