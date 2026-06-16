/**
 * types/user.ts - 用户相关类型定义
 * English Fun Zone
 */
import type { Level } from './game';

/** 用户档案 */
export interface UserProfile {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  level: Level;
  totalScore: number;
  totalGamesPlayed: number;
  isPlacementDone: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** 用户认证会话 */
export interface UserSession {
  user: AuthUser | null;
  profile: UserProfile | null;
  isGuest: boolean;
}

/** 认证用户 */
export interface AuthUser {
  id: string;
  email?: string;
  createdAt?: string;
}

/** 游客数据（localStorage 存储结构） */
export interface GuestData {
  level: Level;
  totalScore: number;
  totalGamesPlayed: number;
  isPlacementDone: boolean;
  placementResult?: {
    vocabScore: number;
    grammarScore: number;
    listenScore: number;
    totalScore: number;
    resultLevel: Level;
  };
  gameHistory: GameHistoryEntry[];
  achievements: string[];
  settings: UserSettings;
}

/** 游戏历史条目（游客模式本地存储） */
export interface GameHistoryEntry {
  gameType: string;
  score: number;
  correctCount: number;
  totalCount: number;
  maxCombo: number;
  difficulty: string;
  timestamp: number;
}

/** 用户设置 */
export interface UserSettings {
  accent: 'us' | 'uk';
  soundEnabled: boolean;
  animationEnabled: boolean;
  musicEnabled: boolean;
}
