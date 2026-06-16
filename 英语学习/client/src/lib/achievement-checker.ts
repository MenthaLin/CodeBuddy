/**
 * lib/achievement-checker.ts - 成就条件检测引擎
 * English Fun Zone
 */
import type { GameResult, Level } from '@/types/game';
import type { AchievementDefinition, AchievementStatus } from '@/types/achievement';
import { ACHIEVEMENT_DEFINITIONS } from '@/config/achievements';
import { LEVEL_ORDER } from '@/config/constants';

/**
 * 检测游戏结算后新解锁的成就
 * @param result 游戏结算结果
 * @param currentAchievements 当前已解锁的成就 key 列表
 * @param totalGamesPlayed 累计游戏局数
 * @param totalScore 累计总分
 * @param currentLevel 当前等级
 * @returns 新解锁的成就定义列表
 */
export function checkNewAchievements(
  result: GameResult,
  currentAchievements: string[],
  totalGamesPlayed: number,
  totalScore: number,
  currentLevel: Level,
): AchievementDefinition[] {
  const unlocked: AchievementDefinition[] = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // 已解锁的跳过
    if (currentAchievements.includes(def.key)) continue;

    if (evaluateCondition(def, result, totalGamesPlayed, totalScore, currentLevel)) {
      unlocked.push(def);
    }
  }

  return unlocked;
}

/**
 * 评估单个成就条件
 */
function evaluateCondition(
  def: AchievementDefinition,
  result: GameResult,
  totalGamesPlayed: number,
  totalScore: number,
  currentLevel: Level,
): boolean {
  const { condition } = def;

  switch (condition.type) {
    case 'total_games':
      return totalGamesPlayed >= condition.target;

    case 'all_games_played':
      return true; // 外部判断（需跟踪所有游戏类型）

    case 'max_combo':
      return result.maxCombo >= condition.target;

    case 'correct_words': {
      if (condition.gameType && condition.gameType !== result.gameType) return false;
      return result.correctCount >= condition.target;
    }

    case 'match_levels':
      return result.gameType === 'match' && result.correctCount >= condition.target;

    case 'total_score':
      return totalScore >= condition.target;

    case 'reach_level': {
      const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
      return currentIdx >= condition.target;
    }

    case 'perfect_game': {
      if (condition.gameType && condition.gameType !== result.gameType) return false;
      return result.accuracy >= 1.0;
    }

    case 'avg_speed': {
      if (condition.gameType && condition.gameType !== result.gameType) return false;
      const avgTime = result.duration / result.totalCount;
      return avgTime <= condition.target;
    }

    case 'placement_done':
      return true; // 外部判断

    case 'daily_streak':
      return true; // 外部判断（需连续天数跟踪）

    case 'games_in_week':
      return totalGamesPlayed >= condition.target;

    default:
      return false;
  }
}

/**
 * 获取所有成就状态（已解锁/未解锁 + 进度）
 */
export function getAchievementStatuses(
  unlockedKeys: string[],
  stats: {
    totalGamesPlayed: number;
    totalScore: number;
    currentLevel: Level;
    maxCombo: number;
  },
): AchievementStatus[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    const unlocked = unlockedKeys.includes(def.key);
    let progress = 0;
    let target = def.condition.target;

    switch (def.condition.type) {
      case 'total_games':
      case 'games_in_week':
        progress = stats.totalGamesPlayed;
        break;
      case 'total_score':
        progress = stats.totalScore;
        break;
      case 'max_combo':
        progress = stats.maxCombo;
        break;
      case 'reach_level':
        progress = LEVEL_ORDER.indexOf(stats.currentLevel);
        break;
      default:
        target = def.condition.target;
    }

    return {
      definition: def,
      unlocked,
      progress: Math.min(progress, target),
      target,
    };
  });
}
