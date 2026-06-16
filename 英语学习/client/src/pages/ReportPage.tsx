/**
 * pages/ReportPage.tsx - 每周报告 [P1]
 * English Fun Zone
 */
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '@/stores/useAuthStore';
import { GAME_NAMES, GAME_THEME_COLORS } from '@/config/constants';

// 模拟数据
const weeklyData = [
  { day: '周一', score: 320, games: 4 },
  { day: '周二', score: 180, games: 2 },
  { day: '周三', score: 450, games: 5 },
  { day: '周四', score: 0, games: 0 },
  { day: '周五', score: 280, games: 3 },
  { day: '周六', score: 520, games: 6 },
  { day: '周日', score: 150, games: 2 },
];

const gameTypeData = [
  { name: '拼词', value: 35 },
  { name: '连连看', value: 25 },
  { name: '语法', value: 20 },
  { name: '听音', value: 20 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

export default function ReportPage() {
  const { profile } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">📊 每周学习报告</h1>
        <p className="text-gray-500 text-sm mt-1">了解你的学习趋势</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总分', value: '2,100', color: 'text-blue-600' },
          { label: '总局数', value: '22', color: 'text-green-600' },
          { label: '平均正确率', value: '72%', color: 'text-purple-600' },
          { label: '最高连击', value: '18', color: 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 每日得分柱状图 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">每日得分</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} name="得分" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 游戏分布饼图 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">游戏分布</h3>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={gameTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {gameTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {gameTypeData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 建议 */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-700 mb-2">💡 学习建议</h3>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• 语法正确率偏低，建议多玩语法改错</li>
          <li>• 周四没有学习记录，保持每日学习习惯</li>
          <li>• 连击表现不错，继续挑战更高记录！</li>
        </ul>
      </div>
    </div>
  );
}
