/**
 * config/challenges.ts - 每日挑战池定义
 * English Fun Zone
 */
import type { ChallengeDefinition } from '@/types/game';

/** 每日挑战池 */
export const CHALLENGE_POOL: ChallengeDefinition[] = [
  {
    key: 'spelling_combo_10',
    name: '拼词连击',
    description: '拼词大作战中达成10连击',
    target: 10,
    icon: '🔥',
    gameType: 'spelling',
  },
  {
    key: 'grammar_perfect',
    name: '语法满分',
    description: '语法改错单局正确率100%',
    target: 100,
    icon: '💯',
    gameType: 'grammar',
  },
  {
    key: 'listen_speed',
    name: '闪电听力',
    description: '听音选词平均3秒内作答',
    target: 3,
    icon: '⚡',
    gameType: 'listen',
  },
  {
    key: 'match_no_hint',
    name: '独立通关',
    description: '不使用提示完成连连看一关',
    target: 1,
    icon: '🧠',
    gameType: 'match',
  },
  {
    key: 'total_score_500',
    name: '五百分',
    description: '单日总分达到500',
    target: 500,
    icon: '🎯',
  },
  {
    key: 'total_score_1000',
    name: '千分达人',
    description: '单日总分达到1000',
    target: 1000,
    icon: '💎',
  },
  {
    key: 'play_all_games',
    name: '全能挑战',
    description: '完成全部4款游戏各1局',
    target: 4,
    icon: '⭐',
  },
  {
    key: 'combo_any_15',
    name: '连击挑战',
    description: '任意游戏中达成15连击',
    target: 15,
    icon: '💥',
  },
  {
    key: 'spelling_score_200',
    name: '拼词高手',
    description: '拼词大作战单局得分200+',
    target: 200,
    icon: '✍️',
    gameType: 'spelling',
  },
  {
    key: 'games_5',
    name: '五局挑战',
    description: '完成5局游戏',
    target: 5,
    icon: '🎮',
  },
];

/** 每日挑战数量 */
export const DAILY_CHALLENGE_COUNT = 3;

/**
 * 从挑战池随机抽取 N 个挑战
 * 基于日期做确定性随机（确保同一天同一用户看到相同挑战）
 */
export function pickDailyChallenges(seed: number): ChallengeDefinition[] {
  // Fisher-Yates 部分洗牌（只洗前 N 个）
  const pool = [...CHALLENGE_POOL];
  const count = Math.min(DAILY_CHALLENGE_COUNT, pool.length);

  // 确定性伪随机（基于 seed）
  let rng = seed;
  const pseudoRandom = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng - 1) / 2147483646;
  };

  for (let i = pool.length - 1; i > 0 && count > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

/**
 * 生成每日种子（基于日期字符串）
 */
export function getDailySeed(dateStr?: string): number {
  const date = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
