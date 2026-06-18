const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db');

// 昵称校验正则：中文、英文、数字、下划线，1-50字符
const NICKNAME_REGEX = /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,50}$/;

/**
 * POST /api/user/login
 * 用户登录（昵称）
 */
router.post('/login', async (req, res) => {
  try {
    const { nickname, supabase_uid } = req.body;

    // 参数校验
    if (!nickname || !supabase_uid) {
      return res.status(400).json({ success: false, error: '缺少昵称或用户标识' });
    }

    const trimmedNickname = nickname.trim();
    if (!NICKNAME_REGEX.test(trimmedNickname)) {
      return res.status(400).json({
        success: false,
        error: '昵称格式不正确（仅支持中文、英文、数字、下划线，1-50字符）'
      });
    }

    // 检查昵称是否已被其他人使用
    const { data: existingUser } = await supabaseAdmin
      .from('minesweeper_users')
      .select('id, nickname')
      .eq('nickname', trimmedNickname)
      .single();

    if (existingUser && existingUser.id !== supabase_uid) {
      return res.status(409).json({ success: false, error: '昵称已被占用' });
    }

    // 如果已存在同 ID 用户，更新昵称；否则创建新用户
    const { data: currentUser } = await supabaseAdmin
      .from('minesweeper_users')
      .select('id')
      .eq('id', supabase_uid)
      .single();

    let user;
    if (currentUser) {
      // 更新昵称
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('minesweeper_users')
        .update({ nickname: trimmedNickname })
        .eq('id', supabase_uid)
        .select()
        .single();
      if (updateErr) throw updateErr;
      user = updated;
    } else {
      // 创建新用户
      const { data: created, error: createErr } = await supabaseAdmin
        .from('minesweeper_users')
        .insert({ id: supabase_uid, nickname: trimmedNickname })
        .select()
        .single();
      if (createErr) throw createErr;
      user = created;
    }

    // 获取用户统计
    const stats = await getUserStats(supabase_uid);

    res.json({
      success: true,
      data: { user, stats }
    });
  } catch (err) {
    console.error('登录失败:', err.message);
    res.status(500).json({ success: false, error: '登录失败，请重试' });
  }
});

/**
 * POST /api/user/logout
 * 退出登录（客户端清理即可，服务端记录日志）
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, data: { message: '已退出' } });
});

/**
 * GET /api/user/profile
 * 获取用户信息和统计
 */
router.get('/profile', async (req, res) => {
  try {
    const { supabase_uid } = req.query;
    if (!supabase_uid) {
      return res.status(400).json({ success: false, error: '缺少用户标识' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('minesweeper_users')
      .select('*')
      .eq('id', supabase_uid)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const stats = await getUserStats(supabase_uid);

    res.json({ success: true, data: { user, stats } });
  } catch (err) {
    console.error('获取用户信息失败:', err.message);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

/**
 * GET /api/user/stats
 * 获取用户统计数据
 */
router.get('/stats', async (req, res) => {
  try {
    const { supabase_uid } = req.query;
    if (!supabase_uid) {
      return res.status(400).json({ success: false, error: '缺少用户标识' });
    }

    const stats = await getUserStats(supabase_uid);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('获取统计失败:', err.message);
    res.status(500).json({ success: false, error: '获取统计失败' });
  }
});

/**
 * 获取用户统计数据的辅助函数
 */
async function getUserStats(userId) {
  const { data: records, error } = await supabaseAdmin
    .from('minesweeper_records')
    .select('difficulty, result, time_seconds')
    .eq('user_id', userId);

  if (error) throw error;

  const total_games = records.length;
  const wins = records.filter(r => r.result === 'win').length;
  const losses = total_games - wins;
  const win_rate = total_games > 0 ? Math.round((wins / total_games) * 1000) / 10 : 0;

  // 各难度最佳时间
  const bestTimes = {};
  ['easy', 'medium', 'hard'].forEach(diff => {
    const winRecords = records.filter(r => r.difficulty === diff && r.result === 'win');
    bestTimes[`best_${diff}`] = winRecords.length > 0
      ? Math.min(...winRecords.map(r => r.time_seconds))
      : null;
  });

  return {
    total_games,
    wins,
    losses,
    win_rate,
    best_easy: bestTimes.best_easy,
    best_medium: bestTimes.best_medium,
    best_hard: bestTimes.best_hard
  };
}

module.exports = router;
