'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Award, Trophy, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  nftId?: string;
  earnedAt: string;
}

export default function AchievementsGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data } = await api.getAchievements();
      if (data) {
        setAchievements(data as Achievement[]);
      }
      setLoading(false);
    };

    fetchAchievements();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'streak':
        return <Zap className="w-8 h-8 text-orange-500" />;
      case 'contributor':
        return <Award className="w-8 h-8 text-purple-500" />;
      default:
        return <Award className="w-8 h-8 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-sm">Loading achievements...</div>;
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm sm:text-base text-gray-500">No achievements yet. Keep learning!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-words">{achievement.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{achievement.description}</p>
            </div>
            <div className="flex-shrink-0">
              {getIcon(achievement.type)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 gap-2">
            <span className="text-xs text-gray-500 truncate">
              {new Date(achievement.earnedAt).toLocaleDateString()}
            </span>
            {achievement.nftId && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                NFT Minted
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
