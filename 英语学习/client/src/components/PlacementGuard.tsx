/**
 * components/PlacementGuard.tsx - 定级检查守卫
 * English Fun Zone
 */
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface Props {
  children: ReactNode;
}

/**
 * 定级守卫：未完成定级的用户引导到定级页
 * 定级页和认证页不需要守卫
 */
export default function PlacementGuard({ children }: Props) {
  const profile = useAuthStore(s => s.profile);
  const location = useLocation();

  // 如果用户档案存在但未完成定级，且当前不在定级页
  if (profile && !profile.isPlacementDone && location.pathname !== '/placement') {
    return <Navigate to="/placement" replace />;
  }

  return <>{children}</>;
}
