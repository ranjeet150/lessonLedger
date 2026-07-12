'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Streak {
  id: string;
  currentCount: number;
  maxCount: number;
  lastActiveAt: string;
}

export default function StreakCard() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      const { data, error } = await api.getStreak();
      if (data) {
        setStreak(data as Streak);
      }
      setLoading(false);
    };

    fetchStreak();
  }, []);

  if (loading) return <div className="p-4 bg-gray-100 rounded animate-pulse h-24 sm:h-32" />;

  return (
    <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-4xl sm:text-5xl font-bold mb-2">🔥</div>
        <h3 className="text-base sm:text-lg font-semibold mb-2">Current Streak</h3>
        <p className="text-3xl sm:text-4xl font-bold">{streak?.currentCount || 0}</p>
        <p className="text-xs sm:text-sm mt-2 opacity-90">days in a row</p>
        <p className="text-xs mt-2 opacity-75">Best: {streak?.maxCount || 0} days</p>
      </div>
    </div>
  );
}
