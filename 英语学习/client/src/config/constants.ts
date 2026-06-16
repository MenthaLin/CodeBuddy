/**
 * config/constants.ts - 游戏常量配置
 * English Fun Zone
 */
import type { Level, LevelMapping, ComboThreshold, GameConfig } from '@/types/game';

/** 等级排序数组 */
export const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** 等级名称映射 */
export const LEVEL_NAMES: Record<Level, string> = {
  'A1': '入门',
  'A2': '基础',
  'B1': '进阶',
  'B2': '中级',
  'C1': '高级',
  'C2': '精通',
};

/** 等级颜色映射 */
export const LEVEL_COLORS: Record<Level, string> = {
  'A1': 'bg-green-500',
  'A2': 'bg-green-600',
  'B1': 'bg-blue-500',
  'B2': 'bg-blue-700',
  'C1': 'bg-purple-600',
  'C2': 'bg-amber-500',
};

/** 难度等级映射配置 */
export const LEVEL_MAPPING: Record<Level, LevelMapping> = {
  'A1': {
    spellingLetters: [3, 4],
    matchGridSize: 6,
    matchPairs: 6,
    grammarTypes: ['spelling', 'simple_tense'],
    wordComplexity: 'simple',
  },
  'A2': {
    spellingLetters: [4, 5],
    matchGridSize: 6,
    matchPairs: 8,
    grammarTypes: ['spelling', 'simple_tense', 'articles'],
    wordComplexity: 'simple',
  },
  'B1': {
    spellingLetters: [5, 7],
    matchGridSize: 8,
    matchPairs: 12,
    grammarTypes: ['tense', 'preposition', 'subject_verb'],
    wordComplexity: 'moderate',
  },
  'B2': {
    spellingLetters: [6, 8],
    matchGridSize: 8,
    matchPairs: 15,
    grammarTypes: ['tense', 'clause', 'preposition', 'word_form'],
    wordComplexity: 'moderate',
  },
  'C1': {
    spellingLetters: [7, 10],
    matchGridSize: 10,
    matchPairs: 18,
    grammarTypes: ['subjunctive', 'inversion', 'clause', 'word_form'],
    wordComplexity: 'complex',
  },
  'C2': {
    spellingLetters: [8, 12],
    matchGridSize: 10,
    matchPairs: 20,
    grammarTypes: ['subjunctive', 'inversion', 'idiom', 'nuance'],
    wordComplexity: 'complex',
  },
};

/** 连击阈值与加成 */
export const COMBO_THRESHOLDS: ComboThreshold[] = [
  { minCombo: 0, multiplier: 1.0 },
  { minCombo: 3, multiplier: 1.5 },
  { minCombo: 6, multiplier: 1.8 },
  { minCombo: 10, multiplier: 2.0 },
];

/** 基础分数 */
export const BASE_SCORE = 10;

/** 各游戏默认配置 */
export const GAME_CONFIGS: Record<string, GameConfig> = {
  spelling: {
    type: 'spelling',
    duration: 60,
    questionsPerRound: 0,     // 无限，由时间控制
    baseScore: BASE_SCORE,
    comboThresholds: COMBO_THRESHOLDS,
  },
  match: {
    type: 'match',
    duration: 0,              // 关卡制，不同关卡不同时间
    questionsPerRound: 0,
    baseScore: BASE_SCORE,
    comboThresholds: COMBO_THRESHOLDS,
  },
  grammar: {
    type: 'grammar',
    duration: 0,              // 不限时
    questionsPerRound: 10,
    baseScore: BASE_SCORE,
    comboThresholds: COMBO_THRESHOLDS,
  },
  listen: {
    type: 'listen',
    duration: 0,              // 每题10秒
    questionsPerRound: 10,
    baseScore: BASE_SCORE,
    comboThresholds: COMBO_THRESHOLDS,
  },
};

/** 连连看关卡时间配置 */
export const MATCH_LEVEL_TIMES: Record<number, number> = {
  6: 120,
  8: 150,
  10: 180,
};

/** 拼词大作战 - 错误扣秒 */
export const SPELLING_PENALTY = {
  wrong: 3,
  skip: 5,
};

/** 拼词大作战 - 时间奖励（剩余秒数 × 系数） */
export const SPELLING_TIME_BONUS_MULTIPLIER = 2;

/** 听音选词 - 每题限时 */
export const LISTEN_QUESTION_TIME = 10;

/** 听音选词 - 速度奖励公式 (10 - 用时) × 系数 */
export const LISTEN_SPEED_BONUS_MULTIPLIER = 1;

/** 听音选词 - 最大重播次数 */
export const LISTEN_MAX_REPLAY = 3;

/** 定级测试题目数 */
export const PLACEMENT_QUESTION_COUNT = 20;

/** 本地存储键名 */
export const STORAGE_KEYS = {
  GUEST_DATA: 'english-game-guest',
  SETTINGS: 'english-game-settings',
  WORD_CACHE: 'english-game-words',
  PLACEMENT_DONE: 'english-game-placement-done',
  GAME_PROGRESS: 'english-game-progress',
} as const;

/** 正确率阈值 */
export const ACCURACY_THRESHOLDS = {
  LEVEL_UP: 0.80,            // ≥80% 升级
  LEVEL_DOWN: 0.40,          // ≤40% 降级
  LEVEL_UP_FAST: 0.90,       // ≥90% 快速升级（仅需1局）
  LEVEL_UP_GAMES_NEEDED: 2,  // 通常需要连续2局达标才升级
} as const;

/** 游戏名称映射 */
export const GAME_NAMES: Record<string, string> = {
  spelling: '拼词大作战',
  match: '单词连连看',
  grammar: '语法改错',
  listen: '听音选词',
};

/** 游戏图标映射（emoji） */
export const GAME_ICONS: Record<string, string> = {
  spelling: '🧩',
  match: '🔗',
  grammar: '✏️',
  listen: '🎧',
};

/** 游戏描述 */
export const GAME_DESCRIPTIONS: Record<string, string> = {
  spelling: '限时拼写单词，用乱序字母拼出正确答案',
  match: '配对英文单词和中文释义，消除所有配对过关',
  grammar: '找出句子中的语法错误，选择正确的修正方案',
  listen: '听发音选单词，训练听力辨别能力',
};

/** 游戏主题色 */
export const GAME_THEME_COLORS: Record<string, string> = {
  spelling: 'from-blue-500 to-cyan-400',
  match: 'from-emerald-500 to-green-400',
  grammar: 'from-violet-500 to-purple-400',
  listen: 'from-rose-500 to-pink-400',
};
