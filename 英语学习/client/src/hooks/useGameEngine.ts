/**
 * hooks/useGameEngine.ts - 游戏生命周期管理 Hook
 * English Fun Zone
 */
import { useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useChallengeStore } from '@/stores/useChallengeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { GameType, GameResult, AnswerLogEntry } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';

interface UseGameEngineReturn {
  /** 开始游戏 */
  startGame: (type: GameType) => void;
  /** 正确答题 */
  handleCorrect: (entry: AnswerLogEntry, points?: number) => void;
  /** 错误答题 */
  handleWrong: (entry: AnswerLogEntry) => void;
  /** 结束游戏并结算 */
  finishGame: () => Promise<{
    result: GameResult;
    levelChanged: boolean;
    newAchievements: AchievementDefinition[];
  } | null>;
  /** 暂停 */
  pause: () => void;
  /** 恢复 */
  resume: () => void;
}

export function useGameEngine(): UseGameEngineReturn {
  const startTimeRef = useRef<number>(0);

  const startGame = useCallback((type: GameType) => {
    startTimeRef.current = Date.now();
    useGameStore.getState().startGame(type);
  }, []);

  const handleCorrect = useCallback((entry: AnswerLogEntry, points?: number) => {
    const store = useGameStore.getState();
    store.incrementCombo();
    store.recordAnswer(entry);

    if (points !== undefined) {
      store.addScore(points);
    }
  }, []);

  const handleWrong = useCallback((entry: AnswerLogEntry) => {
    const store = useGameStore.getState();
    store.resetCombo();
    store.recordAnswer(entry);
  }, []);

  const finishGame = useCallback(async () => {
    const activeGame = useGameStore.getState().endGame();
    if (!activeGame) return null;

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    const result: GameResult = {
      sessionId: Date.now().toString(36),
      gameType: activeGame.type,
      score: activeGame.score,
      correctCount: activeGame.correctCount,
      totalCount: activeGame.totalCount,
      accuracy: activeGame.totalCount > 0
        ? activeGame.correctCount / activeGame.totalCount
        : 0,
      maxCombo: activeGame.maxCombo,
      duration,
      difficulty: useAuthStore.getState().profile?.level || 'A2',
      levelChanged: false,
      details: {},
      answerLog: activeGame.answerLog,
    };

    // 处理结算（等级变化 + 成就检测）
    const profileStore = useProfileStore.getState();
    const { levelChanged, newLevel, direction, newAchievements } =
      await profileStore.handleGameResult(result);

    result.levelChanged = levelChanged;
    if (levelChanged) {
      result.oldLevel = result.difficulty;
      result.newLevel = newLevel;
    }

    // 更新每日挑战
    const avgTime = activeGame.totalCount > 0
      ? activeGame.answerLog.reduce((sum, a) => sum + a.timeSpent, 0) / activeGame.totalCount
      : 0;

    await useChallengeStore.getState().checkAndUpdate(
      activeGame.type,
      {
        combo: activeGame.maxCombo,
        score: activeGame.score,
        accuracy: result.accuracy,
        avgTime,
        noHint: (result.details as { noHint?: boolean })?.noHint || false,
      },
    );

    return { result, levelChanged, newAchievements };
  }, []);

  const pause = useCallback(() => {
    useGameStore.getState().pauseGame();
  }, []);

  const resume = useCallback(() => {
    useGameStore.getState().resumeGame();
  }, []);

  return { startGame, handleCorrect, handleWrong, finishGame, pause, resume };
}
