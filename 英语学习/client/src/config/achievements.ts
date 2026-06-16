/**
 * config/achievements.ts - 成就徽章定义清单
 * English Fun Zone
 */
import type { AchievementDefinition } from '@/types/achievement';

/** 全部成就定义 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ===== 游戏类 =====
  {
    key: 'first_game',
    name: '初出茅庐',
    description: '完成任意1局游戏',
    icon: '🎮',
    category: 'game',
    condition: { type: 'total_games', target: 1 },
    rarity: 'common',
  },
  {
    key: 'all_games',
    name: '全能选手',
    description: '完成全部4款游戏各1局',
    icon: '⭐',
    category: 'game',
    condition: { type: 'all_games_played', target: 4 },
    rarity: 'rare',
  },
  {
    key: 'games_50',
    name: '游戏达人',
    description: '累计完成50局游戏',
    icon: '🎯',
    category: 'game',
    condition: { type: 'total_games', target: 50 },
    rarity: 'rare',
  },
  {
    key: 'games_100',
    name: '百局玩家',
    description: '累计完成100局游戏',
    icon: '🏆',
    category: 'game',
    condition: { type: 'total_games', target: 100 },
    rarity: 'epic',
  },

  // ===== 连击类 =====
  {
    key: 'combo_10',
    name: '连击新星',
    description: '单局达成10连击',
    icon: '🔥',
    category: 'combo',
    condition: { type: 'max_combo', target: 10 },
    rarity: 'common',
  },
  {
    key: 'combo_20',
    name: '连击达人',
    description: '单局达成20连击',
    icon: '💥',
    category: 'combo',
    condition: { type: 'max_combo', target: 20 },
    rarity: 'rare',
  },
  {
    key: 'combo_30',
    name: '连击大师',
    description: '单局达成30连击',
    icon: '⚡',
    category: 'combo',
    condition: { type: 'max_combo', target: 30 },
    rarity: 'epic',
  },

  // ===== 分数类 =====
  {
    key: 'spelling_100',
    name: '百词斩',
    description: '累计拼对100个单词',
    icon: '✍️',
    category: 'score',
    condition: { type: 'correct_words', target: 100, gameType: 'spelling' },
    rarity: 'rare',
  },
  {
    key: 'grammar_100',
    name: '语法纠察官',
    description: '累计修正100个语法错误',
    icon: '📝',
    category: 'score',
    condition: { type: 'correct_words', target: 100, gameType: 'grammar' },
    rarity: 'rare',
  },
  {
    key: 'listen_100',
    name: '顺风耳',
    description: '累计听音选对100题',
    icon: '👂',
    category: 'score',
    condition: { type: 'correct_words', target: 100, gameType: 'listen' },
    rarity: 'rare',
  },
  {
    key: 'match_50',
    name: '连连看达人',
    description: '完成50关连连看',
    icon: '🧩',
    category: 'score',
    condition: { type: 'match_levels', target: 50 },
    rarity: 'rare',
  },
  {
    key: 'score_10000',
    name: '万分户',
    description: '累计总分达到10000',
    icon: '💰',
    category: 'score',
    condition: { type: 'total_score', target: 10000 },
    rarity: 'epic',
  },

  // ===== 等级类 =====
  {
    key: 'level_b2',
    name: 'B2 进阶者',
    description: '达到 B2 等级',
    icon: '📈',
    category: 'level',
    condition: { type: 'reach_level', target: 3 }, // B2 index
    rarity: 'rare',
  },
  {
    key: 'level_c1',
    name: 'C1 高手',
    description: '达到 C1 等级',
    icon: '🎓',
    category: 'level',
    condition: { type: 'reach_level', target: 4 }, // C1 index
    rarity: 'epic',
  },
  {
    key: 'level_c2',
    name: 'C2 大师',
    description: '达到 C2 等级',
    icon: '👑',
    category: 'level',
    condition: { type: 'reach_level', target: 5 }, // C2 index
    rarity: 'legendary',
  },

  // ===== 特殊类 =====
  {
    key: 'perfect_grammar',
    name: '语法满分',
    description: '语法改错单局100%正确率',
    icon: '💯',
    category: 'special',
    condition: { type: 'perfect_game', target: 1, gameType: 'grammar' },
    rarity: 'epic',
  },
  {
    key: 'speed_demon',
    name: '闪电侠',
    description: '听音选词平均2秒内作答',
    icon: '⚡',
    category: 'special',
    condition: { type: 'avg_speed', target: 2, gameType: 'listen' },
    rarity: 'rare',
  },
  {
    key: 'placement_first',
    name: '摸底完毕',
    description: '完成定级测试',
    icon: '📋',
    category: 'special',
    condition: { type: 'placement_done', target: 1 },
    rarity: 'common',
  },
  {
    key: 'streak_7',
    name: '全勤一周',
    description: '连续7天完成每日挑战',
    icon: '📅',
    category: 'streak',
    condition: { type: 'daily_streak', target: 7 },
    rarity: 'epic',
  },
  {
    key: 'welcome_week',
    name: '新手周',
    description: '注册7天内完成10局游戏',
    icon: '🌟',
    category: 'special',
    condition: { type: 'games_in_week', target: 10 },
    rarity: 'rare',
  },
];

/** 稀有度颜色映射 */
export const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-400',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500',
};

/** 稀有度边框颜色 */
export const RARITY_BORDER_COLORS: Record<string, string> = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400',
};

/** 稀有度文字颜色 */
export const RARITY_TEXT_COLORS: Record<string, string> = {
  common: 'text-gray-500',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-amber-600',
};

/** 稀有度中文名 */
export const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};
