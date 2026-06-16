/**
 * stores/useGameStore.ts - 游戏运行时状态管理
 * English Fun Zone
 */
import { create } from 'zustand';
import { v4Id } from '@/lib/utils';
import type { GameType, ActiveGameState, AnswerLogEntry } from '@/types/game';

interface GameState {
  /** 当前活跃游戏 */
  activeGame: ActiveGameState | null;
  /** 游戏状态 */
  gameState: 'idle' | 'playing' | 'paused' | 'ended';

  /** 开始游戏 */
  startGame: (type: GameType) => void;
  /** 添加分数 */
  addScore: (points: number) => void;
  /** 增加连击 */
  incrementCombo: () => void;
  /** 重置连击 */
  resetCombo: () => void;
  /** 记录答题 */
  recordAnswer: (entry: AnswerLogEntry) => void;
  /** 结束游戏 */
  endGame: () => ActiveGameState | null;
  /** 暂停游戏 */
  pauseGame: () => void;
  /** 恢复游戏 */
  resumeGame: () => void;
  /** 获取当前得分 */
  getScore: () => number;
  /** 获取当前连击 */
  getCombo: () => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeGame: null,
  gameState: 'idle',

  startGame: (type: GameType) => {
    set({
      activeGame: {
        type,
        score: 0,
        combo: 0,
        maxCombo: 0,
        correctCount: 0,
        totalCount: 0,
        startTime: Date.now(),
        answerLog: [],
      },
      gameState: 'playing',
    });
  },

  addScore: (points: number) => {
    set((state) => {
      if (!state.activeGame) return state;
      return {
        activeGame: {
          ...state.activeGame,
          score: state.activeGame.score + points,
        },
      };
    });
  },

  incrementCombo: () => {
    set((state) => {
      if (!state.activeGame) return state;
      const newCombo = state.activeGame.combo + 1;
      return {
        activeGame: {
          ...state.activeGame,
          combo: newCombo,
          maxCombo: Math.max(state.activeGame.maxCombo, newCombo),
          correctCount: state.activeGame.correctCount + 1,
          totalCount: state.activeGame.totalCount + 1,
        },
      };
    });
  },

  resetCombo: () => {
    set((state) => {
      if (!state.activeGame) return state;
      return {
        activeGame: {
          ...state.activeGame,
          combo: 0,
          totalCount: state.activeGame.totalCount + 1,
        },
      };
    });
  },

  recordAnswer: (entry: AnswerLogEntry) => {
    set((state) => {
      if (!state.activeGame) return state;
      return {
        activeGame: {
          ...state.activeGame,
          answerLog: [...state.activeGame.answerLog, entry],
        },
      };
    });
  },

  endGame: () => {
    const { activeGame } = get();
    set({ gameState: 'ended' });
    return activeGame;
  },

  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),

  getScore: () => get().activeGame?.score || 0,
  getCombo: () => get().activeGame?.combo || 0,
}));
