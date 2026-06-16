/**
 * pages/AchievementsPage.tsx - 成就展示 [P1]
 * English Fun Zone
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from '@/stores/useProfileStore';
import { getAchievementStatuses } from '@/lib/achievement-checker';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
  RARITY_NAMES,
} from '@/config/achievements';
import type { AchievementStatus } from '@/types/achievement';

export default function AchievementsPage() {
  const { unlockedAchievements, loadAchievements } = useProfileStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const statuses = getAchievementStatuses(unlockedAchievements, {
    totalGamesPlayed: profile?.totalGamesPlayed || 0,
    totalScore: profile?.totalScore || 0,
    currentLevel: profile?.level || 'A2',
    maxCombo: 0,
  });

  const unlocked = statuses.filter(s => s.unlocked);
  const locked = statuses.filter(s => !s.unlocked);

  // 按分类分组
  const categories = ['game', 'combo', 'score', 'level', 'special', 'streak'];
  const categoryNames: Record<string, string> = {
    game: '游戏', combo: '连击', score: '分数', level: '等级', special: '特殊', streak: '坚持',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">🏆 成就徽章</h1>
        <p className="text-gray-500 text-sm mt-1">
          已解锁 {unlocked.length}/{statuses.length}
        </p>
      </div>

      {/* 进度条 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((unlocked.length / statuses.length) * 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* 按分类展示 */}
      {categories.map(cat => {
        const catStatuses = statuses.filter(s => s.definition.category === cat);
        if (catStatuses.length === 0) return null;

        return (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              {categoryNames[cat] || cat}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {catStatuses.map((status, idx) => (
                <AchievementBadgeItem key={status.definition.key} status={status} index={idx} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementBadgeItem({ status, index }: { status: AchievementStatus; index: number }) {
  const { definition, unlocked, progress, target } = status;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-white rounded-2xl p-3 text-center border-2 ${
        unlocked
          ? `${RARITY_BORDER_COLORS[definition.rarity]}`
          : 'border-gray-200'
      } ${unlocked ? 'shadow-md' : 'opacity-60'}`}
    >
      <div className={`text-3xl mb-1 ${unlocked ? '' : 'grayscale'}`}>
        {definition.icon}
      </div>
      <div className="text-xs font-semibold text-gray-700 truncate">
        {definition.name}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {definition.description}
      </div>
      {!unlocked && progress !== undefined && target !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full"
              style={{ width: `${Math.min(100, (progress / target) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{progress}/{target}</div>
        </div>
      )}
      <div className={`text-xs mt-1 ${unlocked ? 'text-amber-500' : 'text-gray-400'}`}>
        {RARITY_NAMES[definition.rarity]}
      </div>
    </motion.div>
  );
}
