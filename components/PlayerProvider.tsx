'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of the context
interface PlayerContextType {
    deviceId: string | null;
    player: any;
    isPaused: boolean;
    currentTrack: any;
    isActive: boolean;
    playTrack: (uri: string) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children, token }: { children: ReactNode; token: string | undefined }) => {
    const [player, setPlayer] = useState<any>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any>(null);

    useEffect(() => {
        if (!token) return;

        // Load the Spotify Web Playback SDK script
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'NuSound Web Player',
                getOAuthToken: (cb: any) => { cb(token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }: any) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            player.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline', device_id);
                setDeviceId(null);
            });

            player.addListener('player_state_changed', (state: any) => {
                if (!state) {
                    return;
                }
                setIsActive(true);
                setIsPaused(state.paused);
                setCurrentTrack(state.track_window.current_track);
            });

            player.addListener('initialization_error', ({ message }: any) => {
                console.error('Failed to initialize:', message);
            });

            player.addListener('authentication_error', ({ message }: any) => {
                console.error('Failed to authenticate:', message);
            });

            player.addListener('account_error', ({ message }: any) => {
                console.error('Failed to validate Spotify account', message);
            });

            player.connect();
        };

        return () => {
            // Cleanup
        };
    }, [token]);

    const playTrack = async (uri: string) => {
        if (!deviceId) {
            console.error("Device ID not ready");
            return;
        }

        if (!token) {
            console.error("No access token available");
            return;
        }

        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
    };

    return (
        <PlayerContext.Provider value={{ deviceId, player, isPaused, currentTrack, isActive, playTrack }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

// Add types for Window
declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: any;
    }
}
