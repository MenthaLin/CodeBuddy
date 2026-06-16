/**
 * 扫雷游戏 - API 接口测试
 * 
 * 测试方式：
 *   1. 启动后端服务器: node server/server.js
 *   2. 运行测试: node tests/api.test.js
 * 
 * 测试范围：参数校验、请求格式、错误处理、正常流程
 * （数据库相关测试需要 Supabase 环境支持，此处测试 API 层的参数校验）
 */

const http = require('http');

// ============================================
// 测试框架
// ============================================
const tests = [];
let passed = 0;
let failed = 0;
let startTime = Date.now();

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || '断言失败');
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || '值不应为 null/undefined');
  }
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message || '期望为 true');
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(message || `期望包含 "${substring}"，实际 "${str}"`);
  }
}

// ============================================
// HTTP 请求辅助
// ============================================
const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ============================================
// 测试用例
// ============================================

// ========== 健康检查 ==========

test('A01: 健康检查 - 正常返回', async () => {
  const res = await request('GET', '/api/health');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertEquals(res.body.data.status, 'ok');
  assertNotNull(res.body.data.timestamp);
});

// ========== 用户登录 ==========

test('A02: 登录 - 缺少昵称', async () => {
  const res = await request('POST', '/api/user/login', { supabase_uid: 'test-uid-123' });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A03: 登录 - 缺少 supabase_uid', async () => {
  const res = await request('POST', '/api/user/login', { nickname: '测试玩家' });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A04: 登录 - 空请求体', async () => {
  const res = await request('POST', '/api/user/login', {});
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A05: 登录 - 昵称包含非法字符（HTML标签）', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'test<script>alert(1)</script>',
    supabase_uid: 'test-uid-123'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A06: 登录 - 昵称包含特殊符号', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'test@#$%^&*()',
    supabase_uid: 'test-uid-123'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A07: 登录 - 昵称超过50字符', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'a'.repeat(51),
    supabase_uid: 'test-uid-123'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A08: 登录 - 昵称刚好50字符（边界值）', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'a'.repeat(50),
    supabase_uid: 'test-uid-boundary-50'
  });
  // 50字符应该通过格式校验（但可能因数据库不存在该用户而500）
  // 我们只验证不返回400格式错误
  assertTrue(res.status !== 400 || res.body.error.includes('格式') === false,
    '50字符昵称应通过格式校验');
});

test('A09: 登录 - 昵称1字符（边界值）', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'A',
    supabase_uid: 'test-uid-boundary-1'
  });
  // 1字符应通过格式校验
  assertTrue(res.status !== 400 || !res.body.error.includes('格式不正确'),
    '1字符昵称应通过格式校验');
});

test('A10: 登录 - 昵称仅含中文', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: '测试玩家',
    supabase_uid: 'test-uid-chinese'
  });
  // 纯中文应通过格式校验
  assertTrue(res.status !== 400 || !res.body.error.includes('格式不正确'),
    '纯中文昵称应通过格式校验');
});

test('A11: 登录 - 昵称含下划线和数字', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: 'player_001',
    supabase_uid: 'test-uid-underscore'
  });
  // 下划线和数字应通过格式校验
  assertTrue(res.status !== 400 || !res.body.error.includes('格式不正确'),
    '含下划线和数字的昵称应通过格式校验');
});

// ========== 退出登录 ==========

test('A12: 退出登录 - 正常返回', async () => {
  const res = await request('POST', '/api/user/logout');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
});

test('A13: 退出登录 - 带空请求体', async () => {
  const res = await request('POST', '/api/user/logout', {});
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
});

// ========== 用户信息 ==========

test('A14: 获取用户信息 - 缺少 supabase_uid', async () => {
  const res = await request('GET', '/api/user/profile');
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A15: 获取用户信息 - 用户不存在', async () => {
  const res = await request('GET', '/api/user/profile?supabase_uid=nonexistent-user-99999');
  assertEquals(res.status, 404);
  assertTrue(res.body.success === false);
});

test('A16: 获取用户统计 - 缺少 supabase_uid', async () => {
  const res = await request('GET', '/api/user/stats');
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

// ========== 游戏记录 ==========

test('A17: 提交记录 - 缺少 supabase_uid', async () => {
  const res = await request('POST', '/api/game/record', {
    difficulty: 'easy',
    result: 'win',
    time_seconds: 30
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A18: 提交记录 - 无效难度', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'impossible',
    result: 'win',
    time_seconds: 30
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A19: 提交记录 - 难度为空', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: '',
    result: 'win',
    time_seconds: 30
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A20: 提交记录 - 无效结果', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'draw',
    time_seconds: 30
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A21: 提交记录 - 结果为 lose (无效值)', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'lose', // 有效值只有 win/loss
    time_seconds: 30
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A22: 提交记录 - 负时间', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'win',
    time_seconds: -1
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A23: 提交记录 - 时间超限', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'win',
    time_seconds: 100000
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A24: 提交记录 - 时间刚好0（边界值）', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'loss',
    time_seconds: 0
  });
  // 0 秒 loss 应该通过时间校验（反作弊只针对 easy win < 1秒）
  assertTrue(res.status !== 400 || !res.body.error.includes('时间'),
    '0秒 loss 应通过时间校验');
});

test('A25: 提交记录 - 时间不是数字', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'win',
    time_seconds: 'fast'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A26: 提交记录 - easy 胜利时间 0.5 秒（反作弊）', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'win',
    time_seconds: 0.5
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
  assertTrue(res.body.error.includes('异常'));
});

test('A27: 提交记录 - 缺少 time_seconds', async () => {
  const res = await request('POST', '/api/game/record', {
    supabase_uid: 'test-uid-123',
    difficulty: 'easy',
    result: 'win'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

// ========== 获取游戏记录 ==========

test('A28: 获取记录 - 缺少 supabase_uid', async () => {
  const res = await request('GET', '/api/game/records');
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A29: 获取记录 - 有效请求（用户不存在但参数正确）', async () => {
  const res = await request('GET', '/api/game/records?supabase_uid=test-nonexistent&limit=5');
  // 用户不存在也应返回200（空记录列表）
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertTrue(Array.isArray(res.body.data.records));
});

test('A30: 获取记录 - 带难度筛选', async () => {
  const res = await request('GET', '/api/game/records?supabase_uid=test-nonexistent&difficulty=easy&limit=5');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertTrue(Array.isArray(res.body.data.records));
});

test('A31: 获取记录 - 无效难度筛选', async () => {
  const res = await request('GET', '/api/game/records?supabase_uid=test-nonexistent&difficulty=extreme');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  // 无效难度被忽略，返回所有难度
});

test('A32: 获取记录 - limit 超限自动截断', async () => {
  const res = await request('GET', '/api/game/records?supabase_uid=test-nonexistent&limit=999');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  // limit 最大100
  assertTrue(res.body.data.limit <= 100);
});

test('A33: 获取记录 - 负 offset', async () => {
  const res = await request('GET', '/api/game/records?supabase_uid=test-nonexistent&offset=-1');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  // 负 offset 被 parseInt 转为 0
});

// ========== 排行榜 ==========

test('A34: 排行榜 - 正常请求 (easy)', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=easy&limit=10');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertTrue(Array.isArray(res.body.data.leaderboard));
});

test('A35: 排行榜 - 正常请求 (medium)', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=medium&limit=10');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertTrue(Array.isArray(res.body.data.leaderboard));
});

test('A36: 排行榜 - 正常请求 (hard)', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=hard&limit=10');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertTrue(Array.isArray(res.body.data.leaderboard));
});

test('A37: 排行榜 - 无效难度', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=extreme');
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A38: 排行榜 - 默认难度（无参数）', async () => {
  const res = await request('GET', '/api/leaderboard');
  // 默认使用 easy
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
});

test('A39: 排行榜 - limit 超限', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=easy&limit=999');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  // limit 最大100
  assertTrue(res.body.data.limit <= 100);
});

test('A40: 排行榜 - 带 offset', async () => {
  const res = await request('GET', '/api/leaderboard?difficulty=easy&limit=5&offset=0');
  assertEquals(res.status, 200);
  assertTrue(res.body.success);
  assertEquals(res.body.data.offset, 0);
});

// ========== 404 和错误处理 ==========

test('A41: 404 - 不存在的 API 端点', async () => {
  const res = await request('GET', '/api/nonexistent-endpoint');
  assertEquals(res.status, 404);
  assertTrue(res.body.success === false);
});

test('A42: 404 - 错误请求方法', async () => {
  // GET 一个只接受 POST 的端点
  const res = await request('GET', '/api/user/login');
  // Express 默认返回 404 或 405，取决于路由定义
  // 这里只验证不会崩溃
  assertTrue(res.status >= 400 && res.status < 500,
    `期望 4xx 状态码，实际 ${res.status}`);
});

test('A43: 请求体过大 - 应被 express.json limit 拦截', async () => {
  const largeStr = 'x'.repeat(2 * 1024 * 1024); // 2MB
  const res = await request('POST', '/api/user/login', {
    nickname: 'test',
    supabase_uid: largeStr
  });
  // 应该返回 413 或处理为错误
  assertTrue(res.status >= 400, `期望 4xx/5xx，实际 ${res.status}`);
});

// ========== 安全测试 ==========

test('A44: 安全 - SQL 注入尝试', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: "test'; DROP TABLE users; --",
    supabase_uid: 'test-sql-injection'
  });
  // 应被昵称正则拦截
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A45: 安全 - XSS 尝试', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: '<img src=x onerror=alert(1)>',
    supabase_uid: 'test-xss'
  });
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A46: 安全 - NoSQL 注入尝试', async () => {
  const res = await request('POST', '/api/user/login', {
    nickname: '{"$gt": ""}',
    supabase_uid: 'test-nosql'
  });
  // 应被昵称正则拦截（含特殊字符）
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

test('A47: 安全 - 请求体为空对象', async () => {
  const res = await request('POST', '/api/game/record', {});
  assertEquals(res.status, 400);
  assertTrue(res.body.success === false);
});

// ========== 速率限制 ==========

test('A48: 速率限制 - 多次请求不触发限流（正常范围）', async () => {
  // 发送 5 个快速请求，应在限流范围内（100次/分钟）
  const results = [];
  for (let i = 0; i < 5; i++) {
    const res = await request('GET', '/api/health');
    results.push(res.status);
  }
  // 所有请求应成功
  for (const status of results) {
    assertEquals(status, 200);
  }
});

// ========== 综合场景 ==========

test('A49: 综合 - 完整记录提交流程（参数校验层面）', async () => {
  // 测试所有 difficulty 的有效值
  for (const diff of ['easy', 'medium', 'hard']) {
    const res = await request('POST', '/api/game/record', {
      supabase_uid: 'test-integration',
      difficulty: diff,
      result: 'loss',
      time_seconds: 60
    });
    // 用户不存在时会返回404，这是预期行为（验证了参数校验通过）
    assertTrue(res.status === 404, `${diff} loss 应通过参数校验，实际 ${res.status}`);
  }
});

test('A50: 综合 - 所有难度排行榜可用', async () => {
  for (const diff of ['easy', 'medium', 'hard']) {
    const res = await request('GET', `/api/leaderboard?difficulty=${diff}&limit=5`);
    assertEquals(res.status, 200);
    assertTrue(res.body.success);
    assertTrue(Array.isArray(res.body.data.leaderboard));
  }
});

// ============================================
// 执行测试
// ============================================
async function runTests() {
  // 先检查服务器是否启动
  let serverRunning = false;
  try {
    await request('GET', '/api/health');
    serverRunning = true;
  } catch (err) {
    // 服务器未启动
  }

  if (!serverRunning) {
    console.log('⚠️  后端服务器未启动 (localhost:3000)');
    console.log('⚠️  请先运行: node server/server.js');
    console.log('⚠️  将跳过 API 测试');
    process.exit(0);
  }

  console.log('🧪 扫雷游戏 - API 接口测试');
  console.log('='.repeat(60));

  for (const { name, fn } of tests) {
    try {
      await fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (err) {
      failed++;
      console.log(`❌ ${name}`);
      console.log(`   错误: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('='.repeat(60));
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败, ${tests.length} 总计`);
  console.log(`⏱ 执行时间: ${elapsed}s`);
  console.log(`📈 通过率: ${Math.round(passed / tests.length * 100)}%`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests();
