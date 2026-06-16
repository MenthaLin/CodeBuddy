-- ============================================
-- 扫雷游戏 - Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 注意：id 使用 TEXT 类型而非 UUID，兼容前端生成的自定义 ID

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss')),
  time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_leaderboard ON game_records(difficulty, result, time_seconds) WHERE result = 'win';
CREATE INDEX IF NOT EXISTS idx_game_records_user_stats ON game_records(user_id, difficulty, result);

-- 4. 启用 Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 5. RLS 策略 - users 表（宽松策略，不依赖 auth.uid()，项目使用自定义认证）
CREATE POLICY "users_read_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_all" ON users FOR UPDATE USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT WITH CHECK (true);

-- 6. RLS 策略 - game_records 表
CREATE POLICY "records_read_all" ON game_records FOR SELECT USING (true);
CREATE POLICY "records_insert_all" ON game_records FOR INSERT WITH CHECK (true);
