/**
 * types/game.ts - 游戏相关类型定义
 * English Fun Zone
 */

/** 难度等级 */
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** 游戏类型 */
export type GameType = 'spelling' | 'match' | 'grammar' | 'listen';

/** 游戏配置 */
export interface GameConfig {
  type: GameType;
  duration: number;              // 游戏时长（秒），0 表示无限制
  questionsPerRound: number;     // 每轮题目数
  baseScore: number;             // 基础分
  comboThresholds: ComboThreshold[];
}

/** 连击阈值与加成 */
export interface ComboThreshold {
  minCombo: number;
  multiplier: number;
}

/** 游戏会话 */
export interface GameSession {
  id: string;
  config: GameConfig;
  state: 'idle' | 'playing' | 'paused' | 'ended';
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  totalCount: number;
  startTime: number;
  elapsedTime: number;
  questions: Question[];
  currentQuestionIndex: number;
  /** 各游戏详情数据 */
  details: Record<string, unknown>;
}

/** 游戏题目 */
export interface Question {
  id: string;
  type: GameType;
  difficulty: Level;
  /** 各游戏不同的提示数据 */
  prompt: unknown;
  correctAnswer: unknown;
  options?: unknown[];
}

/** 游戏结算结果 */
export interface GameResult {
  sessionId: string;
  gameType: GameType;
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  maxCombo: number;
  duration: number;
  difficulty: Level;
  levelChanged: boolean;
  oldLevel?: Level;
  newLevel?: Level;
  details: Record<string, unknown>;
  /** 答对/答错详情列表 */
  answerLog: AnswerLogEntry[];
}

/** 答题记录 */
export interface AnswerLogEntry {
  questionId: string;
  correct: boolean;
  timeSpent: number;         // 秒
  userAnswer?: string;
  correctAnswer: string;
}

/** 拼词大作战 - 单词条目 */
export interface WordEntry {
  id: string;
  word: string;
  chinese: string;
  level: Level;
  phonetic?: string;
  partOfSpeech?: string;
  audioUrl?: string;
}

/** 语法改错 - 语法题目 */
export interface GrammarQuestion {
  id: string;
  incorrectSentence: string;
  correctSentence: string;
  errorWord: string;
  correction: string;
  errorType: string;
  level: Level;
  distractors: string[];
  /** 错误词在句子中的起始位置 */
  errorIndex: number;
  /** 错误词的长度 */
  errorLength: number;
}

/** 连连看 - 网格配置 */
export interface MatchGridConfig {
  size: number;               // N×N
  pairs: number;              // 配对数量
  timeLimit: number;          // 关卡时间限制
  level: number;              // 关卡号
}

/** 连连看 - 格子数据 */
export interface MatchCell {
  id: string;
  row: number;
  col: number;
  text: string;               // 显示文本
  type: 'english' | 'chinese';
  pairId: string;             // 配对ID（英-中共享）
  eliminated: boolean;
  wordEntry: WordEntry;
}

/** 路径点 */
export interface PathPoint {
  row: number;
  col: number;
}

/** 定级测试题目 */
export interface PlacementQuestion {
  id: string;
  type: 'vocab' | 'grammar' | 'listen';
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: Level;
}

/** 定级测试结果 */
export interface PlacementResult {
  vocabScore: number;
  grammarScore: number;
  listenScore: number;
  totalScore: number;
  resultLevel: Level;
}

/** 难度等级映射 */
export interface LevelMapping {
  spellingLetters: [number, number];  // [min, max] 字母数
  matchGridSize: number;
  matchPairs: number;
  grammarTypes: string[];
  wordComplexity: 'simple' | 'moderate' | 'complex';
}

/** 游戏状态（用于 useGameStore） */
export interface ActiveGameState {
  type: GameType;
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  totalCount: number;
  startTime: number;
  answerLog: AnswerLogEntry[];
}

/** 游戏会话记录（存入数据库） */
export interface GameRecord {
  id?: number;
  userId?: string;
  gameType: GameType;
  score: number;
  correctCount: number;
  totalCount: number;
  maxCombo: number;
  difficulty: Level;
  durationSeconds: number;
  levelChanged: boolean;
  oldLevel?: Level;
  newLevel?: Level;
  details?: Record<string, unknown>;
  createdAt?: string;
}

/** 每日挑战 */
export interface DailyChallenge {
  id?: number;
  userId?: string;
  challengeDate: string;
  challengeKey: string;
  progress: number;
  target: number;
  completed: boolean;
}

/** 挑战定义 */
export interface ChallengeDefinition {
  key: string;
  name: string;
  description: string;
  target: number;
  icon: string;
  gameType?: GameType;
}
