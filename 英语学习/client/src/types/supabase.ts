/**
 * types/supabase.ts - Supabase 数据库行类型定义
 * English Fun Zone
 */

/** profiles 表 */
export interface ProfileRow {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  level: string;
  total_score: number;
  total_games_played: number;
  is_placement_done: boolean;
  created_at: string;
  updated_at: string;
}

/** game_records 表 */
export interface GameRecordRow {
  id: number;
  user_id: string;
  game_type: string;
  score: number;
  correct_count: number;
  total_count: number;
  max_combo: number;
  difficulty: string;
  duration_seconds: number;
  level_changed: boolean;
  old_level: string | null;
  new_level: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** achievements 表 */
export interface AchievementRow {
  id: number;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

/** daily_challenges 表 */
export interface DailyChallengeRow {
  id: number;
  user_id: string;
  challenge_date: string;
  challenge_key: string;
  progress: number;
  target: number;
  completed: boolean;
}

/** placement_tests 表 */
export interface PlacementTestRow {
  id: number;
  user_id: string;
  result_level: string;
  vocab_score: number;
  grammar_score: number;
  listen_score: number;
  total_score: number;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Supabase Database 完整类型 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProfileRow, 'id'>>;
      };
      game_records: {
        Row: GameRecordRow;
        Insert: Omit<GameRecordRow, 'id' | 'created_at'>;
        Update: Partial<Omit<GameRecordRow, 'id'>>;
      };
      achievements: {
        Row: AchievementRow;
        Insert: Omit<AchievementRow, 'id' | 'unlocked_at'>;
        Update: Partial<Omit<AchievementRow, 'id'>>;
      };
      daily_challenges: {
        Row: DailyChallengeRow;
        Insert: Omit<DailyChallengeRow, 'id'>;
        Update: Partial<Omit<DailyChallengeRow, 'id'>>;
      };
      placement_tests: {
        Row: PlacementTestRow;
        Insert: Omit<PlacementTestRow, 'id' | 'created_at'>;
        Update: Partial<Omit<PlacementTestRow, 'id'>>;
      };
    };
  };
}
