/**
 * tests/stores.test.ts - Zustand Store 状态管理测试
 * English Fun Zone
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { GameType } from '@/types/game';

// 每个测试前重置 Store
beforeEach(() => {
  useGameStore.setState({
    activeGame: null,
    gameState: 'idle',
  });
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('useGameStore', () => {
  describe('游戏会话生命周期', () => {
    it('初始状态 → idle', () => {
      expect(useGameStore.getState().gameState).toBe('idle');
      expect(useGameStore.getState().activeGame).toBeNull();
    });

    it('startGame → playing 状态', () => {
      useGameStore.getState().startGame('spelling');
      const state = useGameStore.getState();

      expect(state.gameState).toBe('playing');
      expect(state.activeGame).not.toBeNull();
      expect(state.activeGame!.type).toBe('spelling');
      expect(state.activeGame!.score).toBe(0);
      expect(state.activeGame!.combo).toBe(0);
      expect(state.activeGame!.maxCombo).toBe(0);
      expect(state.activeGame!.correctCount).toBe(0);
      expect(state.activeGame!.totalCount).toBe(0);
      expect(state.activeGame!.startTime).toBeGreaterThan(0);
      expect(state.activeGame!.answerLog).toEqual([]);
    });

    it('支持 4 种游戏类型', () => {
      const types: GameType[] = ['spelling', 'match', 'grammar', 'listen'];
      types.forEach(type => {
        useGameStore.setState({ activeGame: null, gameState: 'idle' });
        useGameStore.getState().startGame(type);
        expect(useGameStore.getState().activeGame!.type).toBe(type);
      });
    });

    it('addScore 累加分数', () => {
      useGameStore.getState().startGame('spelling');
      useGameStore.getState().addScore(15);
      expect(useGameStore.getState().activeGame!.score).toBe(15);

      useGameStore.getState().addScore(20);
      expect(useGameStore.getState().activeGame!.score).toBe(35);

      useGameStore.getState().addScore(0);
      expect(useGameStore.getState().activeGame!.score).toBe(35);
    });

    it('addScore 无活跃游戏时不变', () => {
      useGameStore.getState().addScore(10);
      expect(useGameStore.getState().activeGame).toBeNull();
    });

    it('incrementCombo → combo+1, correctCount+1, totalCount+1, maxCombo更新', () => {
      useGameStore.getState().startGame('grammar');

      useGameStore.getState().incrementCombo();
      expect(useGameStore.getState().activeGame!.combo).toBe(1);
      expect(useGameStore.getState().activeGame!.correctCount).toBe(1);
      expect(useGameStore.getState().activeGame!.totalCount).toBe(1);
      expect(useGameStore.getState().activeGame!.maxCombo).toBe(1);

      useGameStore.getState().incrementCombo();
      useGameStore.getState().incrementCombo();
      expect(useGameStore.getState().activeGame!.combo).toBe(3);
      expect(useGameStore.getState().activeGame!.maxCombo).toBe(3);
    });

    it('resetCombo → combo=0, totalCount+1', () => {
      useGameStore.getState().startGame('listen');
      useGameStore.getState().incrementCombo();
      useGameStore.getState().incrementCombo();
      expect(useGameStore.getState().activeGame!.combo).toBe(2);

      useGameStore.getState().resetCombo();
      expect(useGameStore.getState().activeGame!.combo).toBe(0);
      expect(useGameStore.getState().activeGame!.totalCount).toBe(3); // 之前2次正确+1次错误
      // maxCombo 不受影响
      expect(useGameStore.getState().activeGame!.maxCombo).toBe(2);
    });

    it('recordAnswer → 记录答题日志', () => {
      useGameStore.getState().startGame('spelling');
      useGameStore.getState().recordAnswer({
        questionId: 'q1',
        correct: true,
        timeSpent: 3.5,
        userAnswer: 'cat',
        correctAnswer: 'cat',
      });

      const log = useGameStore.getState().activeGame!.answerLog;
      expect(log).toHaveLength(1);
      expect(log[0].correct).toBe(true);
      expect(log[0].timeSpent).toBe(3.5);
    });

    it('endGame → 返回最终状态并设 ended', () => {
      useGameStore.getState().startGame('spelling');
      useGameStore.getState().addScore(50);
      useGameStore.getState().incrementCombo();
      useGameStore.getState().incrementCombo();
      useGameStore.getState().incrementCombo();

      const result = useGameStore.getState().endGame();
      expect(result).not.toBeNull();
      expect(result!.score).toBe(50);
      expect(result!.maxCombo).toBe(3);
      expect(useGameStore.getState().gameState).toBe('ended');
    });

    it('endGame 无活跃游戏 → null', () => {
      const result = useGameStore.getState().endGame();
      expect(result).toBeNull();
    });

    it('pauseGame / resumeGame 切换', () => {
      useGameStore.getState().startGame('spelling');
      useGameStore.getState().pauseGame();
      expect(useGameStore.getState().gameState).toBe('paused');

      useGameStore.getState().resumeGame();
      expect(useGameStore.getState().gameState).toBe('playing');
    });
  });

  describe('getScore / getCombo', () => {
    it('无活跃游戏 → 0', () => {
      expect(useGameStore.getState().getScore()).toBe(0);
      expect(useGameStore.getState().getCombo()).toBe(0);
    });

    it('有活跃游戏 → 正确返回', () => {
      useGameStore.getState().startGame('match');
      useGameStore.getState().addScore(100);
      expect(useGameStore.getState().getScore()).toBe(100);
    });
  });

  describe('完整游戏流程模拟', () => {
    it('拼词大作战 60秒流程', () => {
      useGameStore.getState().startGame('spelling');

      // 模拟答题：对、对、对、错、对、对
      const actions = [
        { correct: true, points: 10 },  // combo=1
        { correct: true, points: 10 },  // combo=2
        { correct: true, points: 15 },  // combo=3, ×1.5
        { correct: false },              // combo=0
        { correct: true, points: 10 },  // combo=1
        { correct: true, points: 10 },  // combo=2
      ];

      actions.forEach(a => {
        if (a.correct) {
          useGameStore.getState().incrementCombo();
          useGameStore.getState().addScore(a.points || 10);
        } else {
          useGameStore.getState().resetCombo();
        }
      });

      const state = useGameStore.getState();
      expect(state.activeGame!.score).toBe(55);
      expect(state.activeGame!.maxCombo).toBe(3);
      expect(state.activeGame!.correctCount).toBe(5);
      expect(state.activeGame!.totalCount).toBe(6);
    });
  });
});

describe('useSettingsStore', () => {
  describe('默认值', () => {
    it('默认美式发音', () => {
      expect(useSettingsStore.getState().accent).toBe('us');
    });

    it('默认开启音效', () => {
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('默认开启动画', () => {
      expect(useSettingsStore.getState().animationEnabled).toBe(true);
    });

    it('默认关闭音乐', () => {
      expect(useSettingsStore.getState().musicEnabled).toBe(false);
    });
  });

  describe('切换操作', () => {
    it('toggleAccent → us↔uk', () => {
      expect(useSettingsStore.getState().accent).toBe('us');
      useSettingsStore.getState().toggleAccent();
      expect(useSettingsStore.getState().accent).toBe('uk');
      useSettingsStore.getState().toggleAccent();
      expect(useSettingsStore.getState().accent).toBe('us');
    });

    it('setAccent 直接设置', () => {
      useSettingsStore.getState().setAccent('uk');
      expect(useSettingsStore.getState().accent).toBe('uk');
      useSettingsStore.getState().setAccent('us');
      expect(useSettingsStore.getState().accent).toBe('us');
    });

    it('toggleSound → 开关切换', () => {
      useSettingsStore.getState().toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
      useSettingsStore.getState().toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('toggleAnimation → 开关切换', () => {
      useSettingsStore.getState().toggleAnimation();
      expect(useSettingsStore.getState().animationEnabled).toBe(false);
    });

    it('toggleMusic → 开关切换', () => {
      useSettingsStore.getState().toggleMusic();
      expect(useSettingsStore.getState().musicEnabled).toBe(true);
    });

    it('reset → 恢复默认', () => {
      useSettingsStore.getState().setAccent('uk');
      useSettingsStore.getState().toggleSound();
      useSettingsStore.getState().toggleAnimation();
      useSettingsStore.getState().reset();

      expect(useSettingsStore.getState().accent).toBe('us');
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
      expect(useSettingsStore.getState().animationEnabled).toBe(true);
      expect(useSettingsStore.getState().musicEnabled).toBe(false);
    });
  });

  describe('持久化', () => {
    it('设置变更后存到 localStorage', () => {
      useSettingsStore.getState().setAccent('uk');
      // Zustand persist 中间件会自动保存
      // 验证 localStorage 中有数据
      const raw = localStorage.getItem('english-game-settings');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.state.accent).toBe('uk');
    });
  });
});
