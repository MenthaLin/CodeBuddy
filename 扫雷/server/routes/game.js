const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_RESULTS = ['win', 'loss'];

/**
 * POST /api/game/record
 * 提交游戏记录
 */
router.post('/record', async (req, res) => {
  try {
    const { supabase_uid, difficulty, result, time_seconds } = req.body;

    // 参数校验
    if (!supabase_uid) {
      return res.status(400).json({ success: false, error: '缺少用户标识' });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ success: false, error: '无效的难度参数' });
    }
    if (!VALID_RESULTS.includes(result)) {
      return res.status(400).json({ success: false, error: '无效的游戏结果' });
    }
    if (typeof time_seconds !== 'number' || time_seconds < 0 || time_seconds > 99999) {
      return res.status(400).json({ success: false, error: '无效的游戏时间' });
    }

    // 反作弊：easy 模式胜利时间不应小于 1 秒
    if (result === 'win' && difficulty === 'easy' && time_seconds < 1) {
      return res.status(400).json({ success: false, error: '游戏时间异常' });
    }

    // 验证用户存在
    const { data: user } = await supabaseAdmin
      .from('minesweeper_users')
      .select('id')
      .eq('id', supabase_uid)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在，请先登录' });
    }

    // 插入记录
    const { data: record, error } = await supabaseAdmin
      .from('minesweeper_records')
      .insert({
        user_id: supabase_uid,
        difficulty,
        result,
        time_seconds: Math.round(time_seconds)
      })
      .select()
      .single();

    if (error) throw error;

    // 检查是否为新最佳记录
    let isNewBest = false;
    if (result === 'win') {
      const { data: prevBest } = await supabaseAdmin
        .from('minesweeper_records')
        .select('time_seconds')
        .eq('user_id', supabase_uid)
        .eq('difficulty', difficulty)
        .eq('result', 'win')
        .lt('time_seconds', Math.round(time_seconds))
        .limit(1);

      // 如果没有比当前更快的记录，就是新纪录
      isNewBest = !prevBest || prevBest.length === 0;

      // 双重确认：检查是否有其他记录比当前更快
      if (isNewBest) {
        const { data: allWins } = await supabaseAdmin
          .from('minesweeper_records')
          .select('time_seconds')
          .eq('user_id', supabase_uid)
          .eq('difficulty', difficulty)
          .eq('result', 'win')
          .neq('id', record.id);

        const fasterExists = allWins.some(r => r.time_seconds < Math.round(time_seconds));
        isNewBest = !fasterExists;
      }
    }

    res.json({
      success: true,
      data: { record, is_new_best: isNewBest }
    });
  } catch (err) {
    console.error('提交游戏记录失败:', err.message);
    res.status(500).json({ success: false, error: '提交游戏记录失败' });
  }
});

/**
 * GET /api/game/records
 * 获取用户游戏历史
 */
router.get('/records', async (req, res) => {
  try {
    const { supabase_uid, difficulty, limit = 20, offset = 0 } = req.query;

    if (!supabase_uid) {
      return res.status(400).json({ success: false, error: '缺少用户标识' });
    }

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    let query = supabaseAdmin
      .from('minesweeper_records')
      .select('*', { count: 'exact' })
      .eq('user_id', supabase_uid)
      .order('completed_at', { ascending: false })
      .range(parsedOffset, parsedOffset + parsedLimit - 1);

    if (difficulty && VALID_DIFFICULTIES.includes(difficulty)) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: records, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: { records: records || [], total: count || 0, limit: parsedLimit, offset: parsedOffset }
    });
  } catch (err) {
    console.error('获取游戏记录失败:', err.message);
    res.status(500).json({ success: false, error: '获取游戏记录失败' });
  }
});

module.exports = router;
