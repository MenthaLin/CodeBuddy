/**
 * hooks/useCombo.ts - 连击系统 Hook
 * English Fun Zone
 */
import { useCallback } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  calculateScore,
  getComboLevel,
  getComboColor,
} from '@/lib/scoring-engine';
import { playCorrectSound, playComboSound } from '@/lib/audio-manager';

interface UseComboReturn {
  /** 当前连击数 */
  combo: number;
  /** 最大连击数 */
  maxCombo: number;
  /** 连击等级文字 */
  comboLevel: string;
  /** 连击等级颜色类 */
  comboColor: string;
  /** 当前倍率 */
  multiplier: number;
  /** 处理正确答题 */
  onCorrect: () => number; // 返回得分
  /** 处理错误答题 */
  onWrong: () => void;
  /** 检查是否触发连击显示 */
  shouldShowCombo: boolean;
}

export function useCombo(): UseComboReturn {
  const combo = useGameStore(s => s.activeGame?.combo || 0);
  const maxCombo = useGameStore(s => s.activeGame?.maxCombo || 0);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);

  const comboLevel = getComboLevel(combo);
  const comboColor = getComboColor(combo);
  const multiplier = 1; // 由 scoring-engine 计算

  const shouldShowCombo = combo >= 3;

  const onCorrect = useCallback(() => {
    const store = useGameStore.getState();
    store.incrementCombo();
    const newCombo = store.getCombo();
    const points = calculateScore(newCombo);

    // 播放音效
    if (soundEnabled) {
      if (newCombo >= 3) {
        playComboSound(newCombo);
      } else {
        playCorrectSound();
      }
    }

    return points;
  }, [soundEnabled]);

  const onWrong = useCallback(() => {
    useGameStore.getState().resetCombo();
  }, []);

  return {
    combo,
    maxCombo,
    comboLevel,
    comboColor,
    multiplier,
    onCorrect,
    onWrong,
    shouldShowCombo,
  };
}
