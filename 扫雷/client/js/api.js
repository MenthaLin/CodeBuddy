/**
 * 后端 API 调用封装
 */

const API_BASE = '/api';

/**
 * 通用 fetch 封装
 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `请求失败 (${response.status})`);
    }

    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('网络连接失败，请检查服务器是否启动');
    }
    throw err;
  }
}

/**
 * 用户 API
 */
export const userApi = {
  /**
   * 用户登录（昵称）
   */
  login(nickname, supabaseUid) {
    return request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ nickname, supabase_uid: supabaseUid })
    });
  },

  /**
   * 退出登录
   */
  logout() {
    return request('/user/logout', { method: 'POST' });
  },

  /**
   * 获取用户信息和统计
   */
  getProfile(supabaseUid) {
    return request(`/user/profile?supabase_uid=${encodeURIComponent(supabaseUid)}`);
  },

  /**
   * 获取用户统计
   */
  getStats(supabaseUid) {
    return request(`/user/stats?supabase_uid=${encodeURIComponent(supabaseUid)}`);
  }
};

/**
 * 游戏记录 API
 */
export const gameApi = {
  /**
   * 提交游戏记录
   */
  submitRecord(supabaseUid, difficulty, result, timeSeconds) {
    return request('/game/record', {
      method: 'POST',
      body: JSON.stringify({
        supabase_uid: supabaseUid,
        difficulty,
        result,
        time_seconds: timeSeconds
      })
    });
  },

  /**
   * 获取用户游戏历史
   */
  getRecords(supabaseUid, difficulty = '', limit = 50, offset = 0) {
    let path = `/game/records?supabase_uid=${encodeURIComponent(supabaseUid)}&limit=${limit}&offset=${offset}`;
    if (difficulty) {
      path += `&difficulty=${encodeURIComponent(difficulty)}`;
    }
    return request(path);
  }
};

/**
 * 排行榜 API
 */
export const leaderboardApi = {
  /**
   * 获取排行榜
   */
  getLeaderboard(difficulty = 'easy', limit = 50, offset = 0) {
    return request(`/leaderboard?difficulty=${encodeURIComponent(difficulty)}&limit=${limit}&offset=${offset}`);
  }
};
