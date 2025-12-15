
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
        'user-read-recently-played'
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
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

export const getUserProfile = async (access_token: string) => {
    return fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const getRecommendations = async (access_token: string, seed_tracks: string[]) => {
    if (!seed_tracks.length) return null;

    const params = new URLSearchParams({
        seed_tracks: seed_tracks.slice(0, 5).join(','), // Max 5 seeds
        limit: '10',
        min_popularity: '20', // Discover hidden gems
        max_popularity: '70',
    });

    return fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}
