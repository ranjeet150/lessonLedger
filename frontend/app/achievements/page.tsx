'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AchievementsGrid from '@/components/AchievementsGrid';
import { Trophy } from 'lucide-react';

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { user } = getStoredAuth();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">Achievements</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Earn NFT-backed achievements as you progress through your learning journey
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Your Achievements</h2>
          <AchievementsGrid />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-2">🏆</div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Milestone NFTs</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Earn NFTs by completing learning milestones and topics
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">🔥</div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Streak NFTs</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Maintain daily study streaks to unlock special streak achievements
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-2">👥</div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Contributor NFTs</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Contribute roadmaps and help the community earn reputation NFTs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
