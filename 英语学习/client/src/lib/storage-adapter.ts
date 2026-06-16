/**
 * lib/storage-adapter.ts - localStorage ↔ Supabase 适配器
 * English Fun Zone
 *
 * 当 Supabase 未配置时，所有云端操作自动降级为静默跳过（localStorage 仍正常）。
 */
import { supabase, hasSupabase } from './supabase';
import type { Level, GameRecord, GameResult } from '@/types/game';
import type { GuestData, UserSettings, GameHistoryEntry } from '@/types/user';
import { STORAGE_KEYS } from '@/config/constants';

// ===== localStorage 操作 =====

/** 获取游客数据 */
export function getGuestData(): GuestData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_DATA);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('读取游客数据失败:', e);
  }
  return getDefaultGuestData();
}

/** 保存游客数据 */
export function saveGuestData(data: Partial<GuestData>): void {
  try {
    const current = getGuestData();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEYS.GUEST_DATA, JSON.stringify(merged));
  } catch (e) {
    console.error('保存游客数据失败:', e);
  }
}

/** 获取默认游客数据 */
function getDefaultGuestData(): GuestData {
  return {
    level: 'A2',
    totalScore: 0,
    totalGamesPlayed: 0,
    isPlacementDone: false,
    gameHistory: [],
    achievements: [],
    settings: getDefaultSettings(),
  };
}

/** 获取游客设置 */
export function getGuestSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return getDefaultSettings();
}

/** 保存游客设置 */
export function saveGuestSettings(settings: Partial<UserSettings>): void {
  const current = getGuestSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
}

/** 默认设置 */
export function getDefaultSettings(): UserSettings {
  return {
    accent: 'us',
    soundEnabled: true,
    animationEnabled: true,
    musicEnabled: false,
  };
}

/** 添加游客游戏记录 */
export function addGuestGameRecord(record: GameHistoryEntry): void {
  const data = getGuestData();
  data.gameHistory.unshift(record);
  // 只保留最近100条
  if (data.gameHistory.length > 100) {
    data.gameHistory = data.gameHistory.slice(0, 100);
  }
  data.totalGamesPlayed += 1;
  data.totalScore += record.score;
  saveGuestData(data);
}

// ===== Supabase 操作 =====

/** 保存游戏记录到 Supabase */
export async function saveGameRecord(userId: string, result: GameResult): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('game_records').insert({
    user_id: userId,
    game_type: result.gameType,
    score: result.score,
    correct_count: result.correctCount,
    total_count: result.totalCount,
    max_combo: result.maxCombo,
    difficulty: result.difficulty,
    duration_seconds: result.duration,
    level_changed: result.levelChanged,
    old_level: result.oldLevel || null,
    new_level: result.newLevel || null,
    details: result.details,
  });

  if (error) {
    console.error('保存游戏记录失败:', error);
    throw error;
  }
}

/** 更新用户等级 */
export async function updateUserLevel(userId: string, level: Level): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .update({ level, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('更新用户等级失败:', error);
  }
}

/** 更新用户总分 */
export async function updateUserScore(userId: string, addScore: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('increment_score', {
    user_id: userId,
    score_increment: addScore,
  });

  if (error) {
    console.error('更新用户总分失败:', error);
  }
}

/** 获取用户档案 */
export async function fetchProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('获取用户档案失败:', error);
  }

  return data;
}

/** 获取用户成就 */
export async function fetchAchievements(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId);

  if (error) {
    console.error('获取成就失败:', error);
    return [];
  }

  return data.map(a => a.achievement_key);
}

/** 解锁成就 */
export async function unlockAchievement(
  userId: string,
  achievementKey: string,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('achievements').insert({
    user_id: userId,
    achievement_key: achievementKey,
  });

  if (error) {
    if (error.code === '23505') {
      // 已解锁（唯一约束冲突）
      return false;
    }
    console.error('解锁成就失败:', error);
    return false;
  }

  return true;
}

/** 获取每日挑战 */
export async function fetchDailyChallenges(userId: string, dateStr: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_date', dateStr);

  if (error) {
    console.error('获取每日挑战失败:', error);
    return [];
  }

  return data;
}

/** 更新每日挑战进度 */
export async function updateChallengeProgress(
  userId: string,
  dateStr: string,
  challengeKey: string,
  progress: number,
  target: number,
): Promise<void> {
  if (!supabase) return;
  const completed = progress >= target;

  const { error } = await supabase.from('daily_challenges').upsert({
    user_id: userId,
    challenge_date: dateStr,
    challenge_key: challengeKey,
    progress,
    target,
    completed,
  }, {
    onConflict: 'user_id,challenge_date,challenge_key',
  });

  if (error) {
    console.error('更新挑战进度失败:', error);
  }
}

/** 保存定级测试结果 */
export async function savePlacementResult(
  userId: string,
  resultLevel: Level,
  vocabScore: number,
  grammarScore: number,
  listenScore: number,
  totalScore: number,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('placement_tests').insert({
    user_id: userId,
    result_level: resultLevel,
    vocab_score: vocabScore,
    grammar_score: grammarScore,
    listen_score: listenScore,
    total_score: totalScore,
  });

  if (error) {
    console.error('保存定级结果失败:', error);
  }

  // 同时更新用户档案的定级状态
  await supabase
    .from('profiles')
    .update({ is_placement_done: true, level: resultLevel, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

// ===== 游客 → 登录数据迁移 =====

/**
 * 游客数据迁移到 Supabase
 * 策略：取等级高的、取总分累加、取成就并集
 */
export async function migrateGuestToCloud(userId: string): Promise<void> {
  if (!supabase) return;
  const guestData = getGuestData();

  // 如果游客没有有效数据，跳过
  if (guestData.totalGamesPlayed === 0 && !guestData.isPlacementDone) {
    return;
  }

  try {
    // 获取云端的档案
    const cloudProfile = await fetchProfile(userId);

    // 合并等级（取高的）
    let finalLevel = guestData.level;
    if (cloudProfile) {
      const levelOrder: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const guestIdx = levelOrder.indexOf(guestData.level);
      const cloudIdx = levelOrder.indexOf(cloudProfile.level as Level);
      finalLevel = levelOrder[Math.max(guestIdx, cloudIdx)];
    }

    // 更新档案
    await supabase.from('profiles').upsert({
      id: userId,
      level: finalLevel,
      total_score: (cloudProfile?.total_score || 0) + guestData.totalScore,
      total_games_played: (cloudProfile?.total_games_played || 0) + guestData.totalGamesPlayed,
      is_placement_done: guestData.isPlacementDone || cloudProfile?.is_placement_done || false,
      updated_at: new Date().toISOString(),
    });

    // 迁移游戏记录（最近50条）
    const recordsToMigrate = guestData.gameHistory.slice(0, 50);
    if (recordsToMigrate.length > 0) {
      const rows = recordsToMigrate.map(r => ({
        user_id: userId,
        game_type: r.gameType,
        score: r.score,
        correct_count: r.correctCount,
        total_count: r.totalCount,
        max_combo: r.maxCombo,
        difficulty: r.difficulty,
        duration_seconds: 0,
        level_changed: false,
      }));

      await supabase.from('game_records').insert(rows);
    }

    // 迁移成就
    if (guestData.achievements.length > 0) {
      const achievementRows = guestData.achievements.map(key => ({
        user_id: userId,
        achievement_key: key,
      }));

      await supabase.from('achievements').upsert(achievementRows, {
        onConflict: 'user_id,achievement_key',
        ignoreDuplicates: true,
      });
    }

    // 清除游客数据
    localStorage.removeItem(STORAGE_KEYS.GUEST_DATA);

    console.log('游客数据迁移成功');
  } catch (error) {
    console.error('游客数据迁移失败:', error);
  }
}
