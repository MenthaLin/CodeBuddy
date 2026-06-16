/**
 * components/layout/Navbar.tsx - 顶部导航栏
 * English Fun Zone
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { GAME_ICONS, GAME_NAMES } from '@/config/constants';

/** 导航链接配置 */
const NAV_LINKS = [
  { path: '/', label: '游戏大厅', icon: '🏠' },
  { path: '/game/spelling', label: GAME_NAMES.spelling, icon: GAME_ICONS.spelling },
  { path: '/game/match', label: GAME_NAMES.match, icon: GAME_ICONS.match },
  { path: '/game/grammar', label: GAME_NAMES.grammar, icon: GAME_ICONS.grammar },
  { path: '/game/listen', label: GAME_NAMES.listen, icon: GAME_ICONS.listen },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isGuest, user, profile, signOut } = useAuthStore();
  const isPlacementDone = useProfileStore(s => useAuthStore.getState().profile?.isPlacementDone);

  const currentPath = location.pathname;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🎮</span>
            <span className="text-xl font-extrabold text-gradient hidden sm:inline">
              English Fun Zone
            </span>
            <span className="text-lg font-extrabold text-gradient sm:hidden">
              EFZ
            </span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 no-underline ${
                  currentPath === link.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* 右侧：等级徽章 + 用户菜单 */}
          <div className="flex items-center gap-3">
            {profile && (
              <DifficultyBadge level={profile.level} size="sm" />
            )}

            {/* 用户菜单 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isGuest ? (
                  <span className="text-sm text-gray-500">👤 游客</span>
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.nickname || user?.email?.split('@')[0] || '用户'}
                  </span>
                )}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {isGuest ? (
                      <>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/auth/login'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          🔑 登录
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/auth/register'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ✨ 注册
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          👤 个人中心
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/profile/achievements'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          🏆 成就
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ⚙️ 设置
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await signOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          🚪 退出登录
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端展开菜单 */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-2 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium no-underline ${
                      currentPath === link.path
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
