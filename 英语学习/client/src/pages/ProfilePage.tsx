/**
 * pages/ProfilePage.tsx - 个人中心 [P1]
 * English Fun Zone
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import ProgressBar from '@/components/common/ProgressBar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { GAME_ICONS, GAME_NAMES } from '@/config/constants';
import { formatNumber } from '@/lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, isGuest, user } = useAuthStore();
  const { unlockedAchievements, loadAchievements } = useProfileStore();

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">请先登录查看个人中心</p>
        <button onClick={() => navigate('/auth/login')} className="btn-primary mt-4">
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            {isGuest ? '👤' : '🎮'}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isGuest ? '游客' : (profile.nickname || user?.email?.split('@')[0] || '用户')}
            </h2>
            <div className="mt-2">
              <DifficultyBadge level={profile.level} size="md" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{formatNumber(profile.totalScore)}</div>
          <div className="text-xs text-gray-500 mt-1">总分</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{profile.totalGamesPlayed}</div>
          <div className="text-xs text-gray-500 mt-1">总局数</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-600">{unlockedAchievements.length}</div>
          <div className="text-xs text-gray-500 mt-1">成就</div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/profile/achievements')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold text-gray-700">成就徽章</h3>
          <p className="text-xs text-gray-500">已解锁 {unlockedAchievements.length} 个</p>
        </button>
        <button
          onClick={() => navigate('/profile/report')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-700">学习报告</h3>
          <p className="text-xs text-gray-500">查看学习趋势</p>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="font-semibold text-gray-700">设置</h3>
          <p className="text-xs text-gray-500">发音/音效偏好</p>
        </button>
        <button
          onClick={() => navigate('/placement')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-700">重新定级</h3>
          <p className="text-xs text-gray-500">重新评估水平</p>
        </button>
      </div>
    </div>
  );
}
