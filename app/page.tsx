import { cookies } from 'next/headers';
import { getUserProfile, getTopTracks } from '@/lib/spotify';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Sparkles, Play, LogIn } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');

  let user = null;
  let topTracks = [];

  if (accessToken) {
    try {
      const [userRes, tracksRes] = await Promise.all([
        getUserProfile(accessToken.value),
        getTopTracks(accessToken.value)
      ]);

      if (userRes.ok && tracksRes.ok) {
        user = await userRes.json();
        const tracksData = await tracksRes.json();
        topTracks = tracksData.items || [];
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            {user ? (
              <>Hi, <span className="gradient-text">{user.display_name.split(' ')[0]}</span>.</>
            ) : (
              <>Hi, <span className="gradient-text">Music Lover</span>.</>
            )}
            <br />
            Ready for <span className="font-serif italic font-light text-[#b0fb5d]">something else?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-md">
            We know you're tired of the same old rotation. Let's find your next obsession.
          </p>
          <div className="flex gap-4 pt-4">
            {accessToken ? (
              <Link href="/discover">
                <AnimatedButton icon={<Sparkles className="w-5 h-5" />}>
                  Discover Now
                </AnimatedButton>
              </Link>
            ) : (
              <a href="/api/auth/login">
                <AnimatedButton icon={<LogIn className="w-5 h-5" />}>
                  Connect Spotify
                </AnimatedButton>
              </a>
            )}
          </div>
        </div>

        {/* User Card */}
        {user && (
          <GlassCard className="w-full max-w-sm flex items-center gap-4 bg-white/5 border-white/10">
            {user.images?.[0] && <img src={user.images[0].url} alt="User" className="w-16 h-16 rounded-full object-cover border-2 border-[#b0fb5d]" />}
            <div>
              <h3 className="font-bold text-lg">{user.display_name}</h3>
              <p className="text-sm text-gray-400">Spotify Connected</p>
            </div>
          </GlassCard>
        )}
      </section>

      {/* "Tired Of" Section */}
      {topTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Heavy Rotation</h2>
            <p className="text-gray-500 text-sm">We'll use these as seeds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTracks.map((track: any, i: number) => (
              <GlassCard key={track.id} hoverEffect className="group relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img src={track.album.images[0].url} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity blur-md" />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                    <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold truncate group-hover:text-[#b0fb5d] transition-colors">{track.name}</h3>
                    <p className="text-sm text-gray-300 truncate">{track.artists[0].name}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
