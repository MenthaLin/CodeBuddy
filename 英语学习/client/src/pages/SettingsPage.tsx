/**
 * pages/SettingsPage.tsx - 设置 [P1]
 * English Fun Zone
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    accent, soundEnabled, animationEnabled, musicEnabled,
    toggleAccent, toggleSound, toggleAnimation, toggleMusic, setAccent,
  } = useSettingsStore();
  const { isGuest, signOut } = useAuthStore();

  const settings = [
    {
      label: '发音偏好',
      description: '选择美式或英式发音',
      value: accent === 'us' ? '🇺🇸 美式' : '🇬🇧 英式',
      action: toggleAccent,
    },
    {
      label: '音效',
      description: '游戏音效开关',
      value: soundEnabled ? '开启' : '关闭',
      action: toggleSound,
    },
    {
      label: '动画效果',
      description: '游戏动画和过渡效果',
      value: animationEnabled ? '开启' : '关闭',
      action: toggleAnimation,
    },
    {
      label: '背景音乐',
      description: '大厅背景音乐',
      value: musicEnabled ? '开启' : '关闭',
      action: toggleMusic,
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">⚙️ 设置</h1>

      {/* 偏好设置 */}
      <div className="card divide-y divide-gray-100">
        {settings.map((setting, idx) => (
          <motion.div
            key={setting.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <div className="font-medium text-gray-700">{setting.label}</div>
              <div className="text-xs text-gray-400">{setting.description}</div>
            </div>
            <button
              onClick={setting.action}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                setting.value === '开启' || setting.value.includes('美式')
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {setting.value}
            </button>
          </motion.div>
        ))}
      </div>

      {/* 操作 */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/placement')}
          className="w-full btn-secondary"
        >
          📋 重新定级测试
        </button>

        {!isGuest && (
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="w-full btn-danger"
          >
            🚪 退出登录
          </button>
        )}
      </div>
    </div>
  );
}
