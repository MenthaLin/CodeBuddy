/**
 * Supabase 直连 API 封装（GitHub Pages 静态版本，无需后端服务器）
 */

const SUPABASE_URL = 'https://wdkwrimlronzjrgvbbtx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka3dyaW1scm9uempyZ3ZiYnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDM0MDcsImV4cCI6MjA5NTQ3OTQwN30.UVr9zhySSR_hOGoM7qWRrsRq_DXhGFmQ5lBAlducVxE';

function getDb() {
  if (typeof supabase !== 'undefined') {
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  throw new Error('Supabase SDK 未加载，请刷新页面');
}

// ============ 用户 API ============

export const userApi = {
  async login(nickname, supabaseUid) {
    const db = getDb();
    const trimmed = nickname.trim();

    // 检查昵称唯一性
    const { data: existing } = await db
      .from('minesweeper_users')
      .select('id')
      .eq('nickname', trimmed)
      .neq('id', supabaseUid)
      .maybeSingle();

    if (existing) {
      throw new Error('昵称已被占用');
    }

    // Upsert 用户
    const { data: user, error } = await db
      .from('minesweeper_users')
      .upsert({ id: supabaseUid, nickname: trimmed })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 获取统计
    const stats = await _getStats(db, supabaseUid);

    return { success: true, data: { user, stats } };
  },

  async logout() {
    return { success: true, data: {} };
  },

  async getProfile(supabaseUid) {
    const db = getDb();
    const { data: user, error } = await db
      .from('minesweeper_users')
      .select('*')
      .eq('id', supabaseUid)
      .single();

    if (error) throw new Error(error.message);
    const stats = await _getStats(db, supabaseUid);
    return { success: true, data: { user, stats } };
  },

  async getStats(supabaseUid) {
    const db = getDb();
    const stats = await _getStats(db, supabaseUid);
    return { success: true, data: stats };
  }
};

// ============ 游戏记录 API ============

export const gameApi = {
  async submitRecord(supabaseUid, difficulty, result, timeSeconds) {
    const db = getDb();

    // 验证用户
    const { data: user } = await db
      .from('minesweeper_users')
      .select('id')
      .eq('id', supabaseUid)
      .maybeSingle();

    if (!user) {
      throw new Error('用户不存在，请先登录');
    }

    const { data: record, error } = await db
      .from('minesweeper_records')
      .insert({
        user_id: supabaseUid,
        difficulty,
        result,
        time_seconds: Math.round(timeSeconds)
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 检查新纪录
    let isNewBest = false;
    if (result === 'win') {
      const { data: prevBest } = await db
        .from('minesweeper_records')
        .select('time_seconds')
        .eq('user_id', supabaseUid)
        .eq('difficulty', difficulty)
        .eq('result', 'win')
        .lt('time_seconds', Math.round(timeSeconds))
        .limit(1);

      isNewBest = !prevBest || prevBest.length === 0;

      if (isNewBest) {
        const { data: allWins } = await db
          .from('minesweeper_records')
          .select('time_seconds')
          .eq('user_id', supabaseUid)
          .eq('difficulty', difficulty)
          .eq('result', 'win')
          .neq('id', record.id);

        isNewBest = !allWins || allWins.every(r => r.time_seconds >= Math.round(timeSeconds));
      }
    }

    return { success: true, data: { record, isNewBest } };
  },

  async getRecords(supabaseUid, difficulty = '', limit = 50, offset = 0) {
    const db = getDb();
    let query = db
      .from('minesweeper_records')
      .select('*', { count: 'exact' })
      .eq('user_id', supabaseUid)
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: records, count, error } = await query;
    if (error) throw new Error(error.message);

    return { success: true, data: { records: records || [], total: count } };
  }
};

// ============ 排行榜 API ============

export const leaderboardApi = {
  async getLeaderboard(difficulty = 'easy', limit = 50, offset = 0) {
    const db = getDb();

    // 尝试 RPC
    try {
      const { data: rpcData, error: rpcErr } = await db.rpc('get_minesweeper_leaderboard', {
        p_difficulty: difficulty,
        p_limit: limit,
        p_offset: offset
      });

      if (!rpcErr && rpcData) {
        return {
          success: true,
          data: {
            leaderboard: rpcData.map((item, i) => ({
              rank: offset + i + 1,
              nickname: item.player_name,
              time_seconds: item.best_time,
              completed_at: item.completed_at
            }))
          }
        };
      }
    } catch (e) { /* fallback to direct query */ }

    // 兜底：直接查询 + 去重
    const { data: records, error } = await db
      .from('minesweeper_records')
      .select('id, time_seconds, completed_at, user_id')
      .eq('difficulty', difficulty)
      .eq('result', 'win')
      .order('time_seconds', { ascending: true })
      .limit(200);

    if (error) throw new Error(error.message);

    // 获取所有用户昵称
    const userIds = [...new Set((records || []).map(r => r.user_id))];
    const { data: users } = await db
      .from('minesweeper_users')
      .select('id, nickname')
      .in('id', userIds);

    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u.nickname; });

    // 去重（每个用户只保留最佳成绩）
    const seen = new Set();
    const leaderboard = [];
    let rank = offset + 1;
    for (const r of (records || [])) {
      if (seen.has(r.user_id)) continue;
      seen.add(r.user_id);
      leaderboard.push({
        rank: rank++,
        nickname: userMap[r.user_id] || 'Unknown',
        time_seconds: r.time_seconds,
        completed_at: r.completed_at
      });
    }

    // 分页
    const paged = leaderboard.slice(offset, offset + limit);
    return { success: true, data: { leaderboard: paged } };
  }
};

// ============ 内部工具 ============

async function _getStats(db, userId) {
  const { data: records, error } = await db
    .from('minesweeper_records')
    .select('difficulty, result, time_seconds')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const stats = {
    total_games: records?.length || 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    best_easy: null,
    best_medium: null,
    best_hard: null
  };

  for (const r of (records || [])) {
    if (r.result === 'win') {
      stats.wins++;
      const key = 'best_' + r.difficulty;
      if (!stats[key] || r.time_seconds < stats[key]) {
        stats[key] = r.time_seconds;
      }
    } else {
      stats.losses++;
    }
  }

  if (stats.total_games > 0) {
    stats.win_rate = Math.round((stats.wins / stats.total_games) * 100);
  }

  return stats;
}
