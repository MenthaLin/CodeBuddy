/**
 * App.tsx - 根组件（路由 + 布局）
 * English Fun Zone
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PlacementGuard from '@/components/PlacementGuard';

// 懒加载页面
const HomePage = lazy(() => import('@/pages/HomePage'));
const PlacementPage = lazy(() => import('@/pages/PlacementPage'));
const SpellingRush = lazy(() => import('@/pages/games/SpellingRush'));
const WordMatch = lazy(() => import('@/pages/games/WordMatch'));
const GrammarFix = lazy(() => import('@/pages/games/GrammarFix'));
const ListenPick = lazy(() => import('@/pages/games/ListenPick'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ReportPage = lazy(() => import('@/pages/ReportPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));

/**
 * 根组件
 * 3层 ErrorBoundary：根级 → 路由级 → 游戏级（在各游戏组件内部）
 */
export default function App() {
  return (
    <ErrorBoundary type="fatal">
      <ErrorBoundary type="route">
        <Routes>
          <Route element={<AppLayout />}>
            {/* P0 路由 */}
            <Route path="/" element={
              <Suspense fallback={<LoadingSpinner text="加载大厅..." />}>
                <PlacementGuard><HomePage /></PlacementGuard>
              </Suspense>
            } />
            <Route path="/placement" element={
              <Suspense fallback={<LoadingSpinner text="加载定级..." />}>
                <PlacementPage />
              </Suspense>
            } />
            <Route path="/game/spelling" element={
              <Suspense fallback={<LoadingSpinner text="加载拼词..." />}>
                <PlacementGuard><SpellingRush /></PlacementGuard>
              </Suspense>
            } />
            <Route path="/game/match" element={
              <Suspense fallback={<LoadingSpinner text="加载连连看..." />}>
                <PlacementGuard><WordMatch /></PlacementGuard>
              </Suspense>
            } />
            <Route path="/game/grammar" element={
              <Suspense fallback={<LoadingSpinner text="加载语法..." />}>
                <PlacementGuard><GrammarFix /></PlacementGuard>
              </Suspense>
            } />
            <Route path="/game/listen" element={
              <Suspense fallback={<LoadingSpinner text="加载听音..." />}>
                <PlacementGuard><ListenPick /></PlacementGuard>
              </Suspense>
            } />
            <Route path="/result/:gameId" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ResultPage />
              </Suspense>
            } />

            {/* P1 路由 */}
            <Route path="/profile" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ProfilePage />
              </Suspense>
            } />
            <Route path="/profile/achievements" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AchievementsPage />
              </Suspense>
            } />
            <Route path="/profile/report" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReportPage />
              </Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsPage />
              </Suspense>
            } />
            <Route path="/auth/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/auth/register" element={
              <Suspense fallback={<LoadingSpinner />}>
                <RegisterPage />
              </Suspense>
            } />

            {/* P2 路由 */}
            <Route path="/leaderboard" element={
              <Suspense fallback={<LoadingSpinner />}>
                <LeaderboardPage />
              </Suspense>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-gray-700 mb-2">页面未找到</h1>
                <p className="text-gray-500 mb-6">你访问的页面不存在</p>
                <a href="/" className="btn-primary">返回首页</a>
              </div>
            } />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
