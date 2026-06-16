const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联脚本（游戏需要）
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求限流
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 100,             // 最多 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '请求过于频繁，请稍后再试' }
});
app.use('/api', limiter);

// 解析请求体
app.use(express.json({ limit: '1mb' }));

// 静态文件服务（前端页面）
app.use(express.static(path.join(__dirname, '..')));

// API 路由
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// 404 处理
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: 'API 端点不存在' });
  } else {
    // SPA fallback：返回 index.html
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err.message);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 扫雷游戏服务器已启动: http://localhost:${PORT}`);
  console.log(`📋 API 健康检查: http://localhost:${PORT}/api/health`);
});
