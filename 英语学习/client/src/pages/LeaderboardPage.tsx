/**
 * pages/LeaderboardPage.tsx - 排行榜 [P2]
 * English Fun Zone
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import type { Level } from '@/types/game';

// 模拟排行榜数据
const mockLeaderboard = [
  { rank: 1, name: 'WordMaster', score: 15800, level: 'C2' as Level, games: 156 },
  { rank: 2, name: 'GrammarQueen', score: 14200, level: 'C1' as Level, games: 132 },
  { rank: 3, name: 'ListenPro', score: 12800, level: 'C1' as Level, games: 98 },
  { rank: 4, name: 'SpellKing', score: 11500, level: 'B2' as Level, games: 87 },
  { rank: 5, name: 'VocabStar', score: 10200, level: 'B2' as Level, games: 76 },
  { rank: 6, name: 'EnglishFan', score: 8900, level: 'B1' as Level, games: 65 },
  { rank: 7, name: 'DailyPlayer', score: 7600, level: 'B1' as Level, games: 54 },
  { rank: 8, name: 'NewLearner', score: 5200, level: 'A2' as Level, games: 43 },
  { rank: 9, name: 'QuickThink', score: 4800, level: 'B1' as Level, games: 38 },
  { rank: 10, name: 'RisingStar', score: 3500, level: 'A2' as Level, games: 25 },
];

type Period = 'week' | 'total';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('total');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">🏅 排行榜</h1>
        <p className="text-gray-500 text-sm mt-1">全球玩家比拼</p>
      </div>

      {/* 切换 */}
      <div className="flex justify-center gap-2">
        {(['total', 'week'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'total' ? '总榜' : '周榜'}
          </button>
        ))}
      </div>

      {/* 前三名 */}
      <div className="grid grid-cols-3 gap-4">
        {mockLeaderboard.slice(0, 3).map((player, idx) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className={`card text-center ${
              idx === 0 ? 'ring-2 ring-amber-400 bg-gradient-to-b from-amber-50' :
              idx === 1 ? 'ring-2 ring-gray-300' : 'ring-2 ring-orange-300'
            }`}
          >
            <div className="text-3xl mb-2">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
            </div>
            <div className="font-bold text-gray-700 text-sm truncate">{player.name}</div>
            <div className="text-lg font-bold text-primary-600">{player.score.toLocaleString()}</div>
            <DifficultyBadge level={player.level} size="sm" />
          </motion.div>
        ))}
      </div>

      {/* 排行榜列表 */}
      <div className="card divide-y divide-gray-100">
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium pb-3 px-2">
          <div className="col-span-2">排名</div>
          <div className="col-span-4">玩家</div>
          <div className="col-span-3 text-right">总分</div>
          <div className="col-span-3 text-right">等级</div>
        </div>

        {mockLeaderboard.map((player, idx) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-12 gap-2 items-center py-3 px-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="col-span-2">
              <span className={`font-bold ${
                player.rank <= 3 ? 'text-amber-500 text-lg' : 'text-gray-500 text-sm'
              }`}>
                {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}
              </span>
            </div>
            <div className="col-span-4 font-medium text-gray-700 text-sm truncate">
              {player.name}
            </div>
            <div className="col-span-3 text-right font-semibold text-gray-800 text-sm">
              {player.score.toLocaleString()}
            </div>
            <div className="col-span-3 text-right">
              <DifficultyBadge level={player.level} size="sm" showLabel={false} />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        登录并完成更多游戏来提升排名！
      </p>
    </div>
  );
}
