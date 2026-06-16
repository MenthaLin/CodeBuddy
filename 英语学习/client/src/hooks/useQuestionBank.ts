/**
 * hooks/useQuestionBank.ts - 出题/难度匹配 Hook
 * English Fun Zone
 */
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  getWordBank,
  pickRandomWords,
  getGrammarByLevel,
  shuffleLetters,
  generateDistractors,
} from '@/lib/word-utils';
import type { GameType, Level, WordEntry, GrammarQuestion } from '@/types/game';
import { LEVEL_MAPPING } from '@/config/constants';

interface UseQuestionBankReturn {
  /** 获取拼词题目 */
  getSpellingWord: () => WordEntry | null;
  /** 获取连连看配对 */
  getMatchPairs: () => { pairs: WordEntry[]; gridSize: number; pairCount: number };
  /** 获取语法题目 */
  getGrammarQuestions: (count?: number) => GrammarQuestion[];
  /** 获取听音选词题目 */
  getListenQuestion: () => { word: WordEntry; options: string[] } | null;
  /** 获取当前等级配置 */
  getLevelConfig: () => ReturnType<typeof getLevelConfigFn>;
}

function getLevelConfigFn() {
  const profile = useAuthStore.getState().profile;
  const level: Level = profile?.level || 'A2';
  return LEVEL_MAPPING[level];
}

export function useQuestionBank(): UseQuestionBankReturn {
  const getCurrentLevel = useCallback((): Level => {
    return useAuthStore.getState().profile?.level || 'A2';
  }, []);

  const getSpellingWord = useCallback((): WordEntry | null => {
    const level = getCurrentLevel();
    const config = LEVEL_MAPPING[level];
    const words = pickRandomWords(level, 50, true);

    // 筛选符合字母数范围的单词
    const [min, max] = config.spellingLetters;
    const filtered = words.filter(
      w => w.word.length >= min && w.word.length <= max,
    );

    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }, [getCurrentLevel]);

  const getMatchPairs = useCallback(() => {
    const level = getCurrentLevel();
    const config = LEVEL_MAPPING[level];
    const pairCount = config.matchPairs;
    const words = pickRandomWords(level, pairCount, true);

    return {
      pairs: words.slice(0, pairCount),
      gridSize: config.matchGridSize,
      pairCount: pairCount,
    };
  }, [getCurrentLevel]);

  const getGrammarQuestions = useCallback((count: number = 10) => {
    const level = getCurrentLevel();
    return getGrammarByLevel(level, count);
  }, [getCurrentLevel]);

  const getListenQuestion = useCallback(() => {
    const level = getCurrentLevel();
    const words = pickRandomWords(level, 1, true);
    if (words.length === 0) return null;

    const correctWord = words[0];
    const wordBank = getWordBank();
    const distractors = generateDistractors(correctWord.word, wordBank, 3);

    return {
      word: correctWord,
      options: [correctWord.word, ...distractors].sort(
        () => Math.random() - 0.5,
      ),
    };
  }, [getCurrentLevel]);

  const getLevelConfig = useCallback(() => {
    return getLevelConfigFn();
  }, []);

  return {
    getSpellingWord,
    getMatchPairs,
    getGrammarQuestions,
    getListenQuestion,
    getLevelConfig,
  };
}
