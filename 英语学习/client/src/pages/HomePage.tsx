/**
 * pages/HomePage.tsx - 首页/游戏大厅 [P0]
 * English Fun Zone
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameCard from '@/components/common/GameCard';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChallengeStore } from '@/stores/useChallengeStore';
import { GAME_ICONS, GAME_NAMES } from '@/config/constants';
import type { GameType } from '@/types/game';

const GAME_TYPES: GameType[] = ['spelling', 'match', 'grammar', 'listen'];

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, isGuest } = useAuthStore();
  const { challenges, definitions, loadDailyChallenges } = useChallengeStore();

  useEffect(() => {
    loadDailyChallenges();
  }, [loadDailyChallenges]);

  const gameStats = {
    spelling: { bestScore: 0, totalPlayed: 0 },
    match: { bestScore: 0, totalPlayed: 0 },
    grammar: { bestScore: 0, totalPlayed: 0 },
    listen: { bestScore: 0, totalPlayed: 0 },
  };

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              🎮 English Fun Zone
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              在游戏中提升英语，快乐学习每一天
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-xs text-white/70">当前等级</div>
                <DifficultyBadge level={profile.level} size="md" />
              </div>
            )}
            {isGuest && !profile?.isPlacementDone && (
              <button
                onClick={() => navigate('/placement')}
                className="bg-white text-primary-700 px-5 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors"
              >
                📋 开始定级测试
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 游戏入口卡片 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 选择游戏</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_TYPES.map((type, idx) => (
            <GameCard
              key={type}
              gameType={type}
              bestScore={gameStats[type].bestScore}
              totalPlayed={gameStats[type].totalPlayed}
              delay={idx}
            />
          ))}
        </div>
      </section>

      {/* 每日挑战 */}
      {challenges.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📅 每日挑战</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {challenges.map((challenge, idx) => {
              const def = definitions.find(d => d.key === challenge.challengeKey);
              if (!def) return null;
              const progress = challenge.progress;
              const target = challenge.target;
              const percent = Math.min(100, Math.round((progress / target) * 100));

              return (
                <motion.div
                  key={challenge.challengeKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card ${challenge.completed ? 'ring-2 ring-green-400' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{def.icon}</span>
                    <span className="font-semibold text-gray-700 text-sm">{def.name}</span>
                    {challenge.completed && <span className="text-green-500">✅</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{def.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {progress}/{target}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* 快速操作 */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate('/profile/achievements')}
          className="btn-secondary text-sm"
        >
          🏆 我的成就
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="btn-secondary text-sm"
        >
          🏅 排行榜
        </button>
        {!profile?.isPlacementDone && (
          <button
            onClick={() => navigate('/placement')}
            className="btn-accent text-sm"
          >
            📋 重新定级
          </button>
        )}
      </div>
    </div>
  );
}
