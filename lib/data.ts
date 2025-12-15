
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  popularity: number; // 0-100
  previewUrl?: string; // Add this line
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  topTracks: Track[];
}

export const MOCK_USER: User = {
  id: 'user_1',
  name: 'Alex Melophile',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  topTracks: [
    {
      id: 't1',
      title: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
      duration: '4:03',
      popularity: 85,
    },
    {
      id: 't2',
      title: 'The Less I Know The Better',
      artist: 'Tame Impala',
      album: 'Currents',
      coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
      duration: '3:36',
      popularity: 90,
    },
    {
      id: 't3',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      coverUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
      duration: '3:20',
      popularity: 95,
    },
  ],
};

export const RECOMMENDED_TRACKS: Track[] = [
  {
    id: 'r1',
    title: 'Space Song',
    artist: 'Beach House',
    album: 'Depression Cherry',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop',
    duration: '5:20',
    popularity: 70, // Slightly less popular ("hidden gem")
    previewUrl: 'https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17?cid=cfe923b2d660439caf2b557b21f31221',
  },
  {
    id: 'r2',
    title: 'After Dark',
    artist: 'Mr. Kitty',
    album: 'Time',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=300&h=300&fit=crop',
    duration: '4:17',
    popularity: 65,
     previewUrl: 'https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17?cid=cfe923b2d660439caf2b557b21f31221',
  },
  {
    id: 'r3',
    title: 'Resonance',
    artist: 'Home',
    album: 'Odyssey',
    coverUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=300&h=300&fit=crop',
    duration: '3:32',
    popularity: 60,
     previewUrl: 'https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17?cid=cfe923b2d660439caf2b557b21f31221',
  },
   {
    id: 'r4',
    title: 'Instant Crush',
    artist: 'Daft Punk ft. Julian Casablancas',
    album: 'Random Access Memories',
    coverUrl: 'https://images.unsplash.com/photo-1621360841052-929e2c5420d4?w=300&h=300&fit=crop',
    duration: '5:37',
    popularity: 78,
     previewUrl: 'https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17?cid=cfe923b2d660439caf2b557b21f31221',
  },
    {
    id: 'r5',
    title: 'Chamber of Reflection',
    artist: 'Mac DeMarco',
    album: 'Salad Days',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    duration: '3:51',
    popularity: 72,
     previewUrl: 'https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17?cid=cfe923b2d660439caf2b557b21f31221',
  },
];

export const getRecommendations = async (): Promise<Track[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return RECOMMENDED_TRACKS;
}
