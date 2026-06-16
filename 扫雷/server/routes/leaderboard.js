const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * GET /api/leaderboard
 * 获取排行榜（按难度筛选，仅胜利记录，按时间升序）
 */
router.get('/', async (req, res) => {
  try {
    const { difficulty = 'easy', limit = 20, offset = 0 } = req.query;

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ success: false, error: '无效的难度参数' });
    }

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    // 使用窗口函数获取每个用户的最佳时间
    const { data, error } = await supabaseAdmin.rpc('get_leaderboard', {
      p_difficulty: difficulty,
      p_limit: parsedLimit,
      p_offset: parsedOffset
    });

    if (error) {
      // 如果 RPC 不存在，使用直接查询
      const { data: records, error: queryError, count } = await supabaseAdmin
        .from('game_records')
        .select(`
          id,
          time_seconds,
          completed_at,
          user:user_id ( nickname )
        `, { count: 'exact' })
        .eq('difficulty', difficulty)
        .eq('result', 'win')
        .order('time_seconds', { ascending: true })
        .range(parsedOffset, parsedOffset + parsedLimit - 1);

      if (queryError) throw queryError;

      // 去重：每个用户只保留最佳时间
      const seen = new Set();
      const leaderboard = [];
      for (const record of (records || [])) {
        const nickname = record.user?.nickname || '未知玩家';
        if (!seen.has(nickname)) {
          seen.add(nickname);
          leaderboard.push({
            rank: leaderboard.length + 1 + parsedOffset,
            nickname,
            time_seconds: record.time_seconds,
            completed_at: record.completed_at
          });
        }
      }

      return res.json({
        success: true,
        data: { leaderboard, total: count || 0, limit: parsedLimit, offset: parsedOffset }
      });
    }

    res.json({
      success: true,
      data: { leaderboard: data || [], total: data?.length || 0, limit: parsedLimit, offset: parsedOffset }
    });
  } catch (err) {
    console.error('获取排行榜失败:', err.message);
    res.status(500).json({ success: false, error: '获取排行榜失败' });
  }
});

module.exports = router;
