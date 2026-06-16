# 技术设计文档：English Fun Zone — 英语学习休闲游戏合集

> 版本：v1.0 | 日期：2026-06-15 | 作者：architect-agent
> 基于 PRD v1.0（pm-agent）

---

## 1. 技术栈

| 层 | 技术 | 版本 | 用途 | 标记 |
|----|------|------|------|------|
| 前端框架 | React | 18.x | UI 渲染 | [新增] |
| 类型系统 | TypeScript | 5.x | 类型安全，严格模式 | [新增] |
| 样式方案 | Tailwind CSS | 3.x | 原子化 CSS + 响应式 | [新增] |
| 状态管理 | Zustand | 4.x | 客户端状态（分片 Store） | [新增] |
| 路由 | React Router | 6.x | SPA 路由 + 懒加载 | [新增] |
| 后端服务 | Supabase | 2.x | Auth + PostgreSQL + RLS | [新增] |
| 动画库 | Framer Motion | 10.x | 游戏交互动画、页面过渡 | [新增] |
| 图表库 | Recharts | 2.x | 学习报告可视化 | [新增] |
| 语音合成 | Web Speech API | 浏览器内置 | 听音选词发音 | [复用] |
| 构建工具 | Vite | 5.x | 开发服务器 + 生产构建 | [新增] |
| 代码规范 | ESLint + Prettier | - | 代码风格统一 | [新增] |

### 1.1 新增依赖清单

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.0",
    "@supabase/supabase-js": "^2.43.0",
    "framer-motion": "^10.18.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 2. 完整项目目录结构

```
english-game/
├── index.html                          # Vite 入口 HTML
├── package.json
├── tsconfig.json                       # TypeScript 严格模式配置
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env                                # Supabase 环境变量
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
│
├── public/
│   ├── favicon.svg
│   ├── audio/                          # [新增] 预录音频（降级方案）
│   │   ├── us/                         # 美式发音
│   │   └── uk/                         # 英式发音
│   └── images/
│       └── achievements/               # [新增] 成就徽章图标
│
├── src/
│   ├── main.tsx                        # 应用入口
│   ├── App.tsx                         # 根组件（路由 + 布局）
│   ├── index.css                       # Tailwind 指令 + 全局样式
│   │
│   ├── types/                          # [新增] 全局类型定义
│   │   ├── index.ts                    # 统一导出
│   │   ├── game.ts                     # 游戏相关类型
│   │   ├── user.ts                     # 用户相关类型
│   │   ├── achievement.ts              # 成就相关类型
│   │   └── supabase.ts                 # Supabase 数据库行类型
│   │
│   ├── config/                         # [新增] 全局配置
│   │   ├── constants.ts                # 游戏常量（等级映射、分数规则）
│   │   ├── achievements.ts             # 成就徽章定义清单
│   │   └── challenges.ts               # 每日挑战池定义
│   │
│   ├── lib/                            # [新增] 工具库
│   │   ├── supabase.ts                 # Supabase 客户端单例
│   │   ├── difficulty-engine.ts        # 自适应难度核心算法
│   │   ├── scoring-engine.ts           # 连击计分系统
│   │   ├── word-utils.ts               # 词库加载/筛选工具
│   │   ├── audio-manager.ts            # 音频管理（Web Speech API + 降级）
│   │   ├── storage-adapter.ts          # localStorage ↔ Supabase 适配器
│   │   └── achievement-checker.ts      # 成就条件检测引擎
│   │
│   ├── stores/                         # [新增] Zustand 状态管理
│   │   ├── useAuthStore.ts             # 认证状态（游客/登录）
│   │   ├── useGameStore.ts             # 游戏运行时状态
│   │   ├── useProfileStore.ts          # 用户档案（等级/分数/成就）
│   │   ├── useSettingsStore.ts         # 用户设置（发音/音效）
│   │   └── useChallengeStore.ts        # 每日挑战状态
│   │
│   ├── hooks/                          # [新增] 自定义 Hooks
│   │   ├── useDifficulty.ts            # 难度管理 Hook
│   │   ├── useCombo.ts                 # 连击系统 Hook
│   │   ├── useTimer.ts                 # 倒计时 Hook
│   │   ├── useSpeech.ts                # Web Speech API Hook（含降级）
│   │   ├── useSupabaseQuery.ts         # Supabase 数据查询 Hook
│   │   ├── useAchievement.ts           # 成就检测 Hook
│   │   ├── useSound.ts                 # 音效管理 Hook
│   │   └── useKeyboard.ts             # 键盘快捷键 Hook
│   │
│   ├── components/                     # [新增] 通用组件
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx           # 全局布局（导航栏 + 内容区）
│   │   │   ├── Navbar.tsx              # 顶部导航栏
│   │   │   ├── BottomNav.tsx           # 移动端底部导航
│   │   │   └── PageTransition.tsx      # 页面过渡动画包装
│   │   │
│   │   ├── common/
│   │   │   ├── GameCard.tsx            # 游戏入口卡片
│   │   │   ├── DifficultyBadge.tsx     # 难度等级徽章
│   │   │   ├── ComboIndicator.tsx      # 连击指示器
│   │   │   ├── ScorePopup.tsx          # 得分飘字动画
│   │   │   ├── Timer.tsx               # 倒计时组件
│   │   │   ├── ProgressBar.tsx         # 进度条
│   │   │   ├── Modal.tsx               # 通用弹窗
│   │   │   ├── Button.tsx              # 通用按钮
│   │   │   ├── LoadingSpinner.tsx      # 加载指示器
│   │   │   ├── ErrorBoundary.tsx       # 错误边界
│   │   │   └── EmptyState.tsx          # 空状态占位
│   │   │
│   │   ├── game/
│   │   │   ├── GameHeader.tsx          # 游戏顶部栏（分数/连击/计时）
│   │   │   ├── ResultPanel.tsx         # 结算面板
│   │   │   ├── LevelChangeAnimation.tsx # 等级升降动画
│   │   │   ├── GameTutorial.tsx        # 新手引导遮罩
│   │   │   └── SkipButton.tsx          # 跳过按钮
│   │   │
│   │   ├── spelling/                   # [新增] 拼词大作战组件
│   │   │   ├── LetterBlock.tsx         # 可拖拽字母块
│   │   │   ├── LetterSlot.tsx          # 字母放置槽
│   │   │   └── SpellingBoard.tsx       # 拼词面板
│   │   │
│   │   ├── match/                      # [新增] 单词连连看组件
│   │   │   ├── MatchGrid.tsx           # 配对网格
│   │   │   ├── MatchCell.tsx           # 单个格子
│   │   │   └── ConnectionLine.tsx      # 路径连线 SVG
│   │   │
│   │   ├── grammar/                    # [新增] 语法改错组件
│   │   │   ├── SentenceDisplay.tsx     # 句子展示
│   │   │   ├── ErrorSpot.tsx           # 可点击错误点
│   │   │   └── CorrectionOptions.tsx   # 修正选项弹窗
│   │   │
│   │   ├── listen/                     # [新增] 听音选词组件
│   │   │   ├── PlayButton.tsx          # 播放按钮
│   │   │   └── WordOptions.tsx         # 四选一选项
│   │   │
│   │   └── profile/                    # [新增] 个人中心组件
│   │       ├── LevelCard.tsx           # 等级卡片
│   │       ├── AchievementBadge.tsx    # 成就徽章
│   │       └── ReportChart.tsx         # 报告图表
│   │
│   ├── pages/                          # [新增] 页面组件
│   │   ├── HomePage.tsx                # 首页/游戏大厅 [P0]
│   │   ├── PlacementPage.tsx           # 定级测试 [P0]
│   │   ├── games/
│   │   │   ├── SpellingRush.tsx        # 拼词大作战 [P0]
│   │   │   ├── WordMatch.tsx           # 单词连连看 [P0]
│   │   │   ├── GrammarFix.tsx          # 语法改错 [P0]
│   │   │   └── ListenPick.tsx          # 听音选词 [P0]
│   │   ├── ResultPage.tsx              # 游戏结算页 [P0]
│   │   ├── ProfilePage.tsx             # 个人中心 [P1]
│   │   ├── AchievementsPage.tsx        # 成就展示 [P1]
│   │   ├── ReportPage.tsx              # 每周报告 [P1]
│   │   ├── SettingsPage.tsx            # 设置 [P1]
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx           # 登录 [P1]
│   │   │   └── RegisterPage.tsx        # 注册 [P1]
│   │   └── LeaderboardPage.tsx         # 排行榜 [P2]
│   │
│   ├── data/                           # [新增] 静态数据（JSON）
│   │   ├── words.json                  # 分级词库
│   │   ├── grammar-questions.json      # 语法题库
│   │   ├── placement-questions.json    # 定级测试题库
│   │   └── achievements.json           # 成就定义
│   │
│   └── styles/                         # [新增] 样式增强
│       └── animations.css              # 关键帧动画（飘字、震动）
│
├── supabase/                           # [新增] Supabase 配置
│   └── migrations/
│       └── 001_create_english_game_tables.sql
│
└── docs/
    ├── prd/
    │   └── english-game-prd.md
    ├── architecture/
    │   └── english-game-设计文档.md
    └── plans/
        └── 2026-06-15-english-game-design.md
```

---

## 3. 组件树与层级关系

### 3.1 页面级组件树

```
<App>
├── <ErrorBoundary>
│   └── <BrowserRouter>
│       └── <AppLayout>
│           ├── <Navbar>                        # 全局导航
│           │   ├── Logo
│           │   ├── NavLinks                    # 游戏/成就/排行
│           │   ├── <DifficultyBadge>           # 当前等级
│           │   └── UserMenu                    # 登录/头像
│           │
│           ├── <PageTransition>                # Framer Motion 过渡
│           │   └── <Routes>
│           │       ├── / → <HomePage>
│           │       │   ├── HeroBanner          # 欢迎横幅
│           │       │   ├── <GameCard> ×4       # 4款游戏入口
│           │       │   ├── DailyChallengePanel # 每日挑战
│           │       │   └── QuickStats          # 快速统计
│           │       │
│           │       ├── /placement → <PlacementPage>
│           │       │   ├── <ProgressBar>
│           │       │   ├── QuestionCard ×20    # 定级题目
│           │       │   └── PlacementResult     # 定级结果
│           │       │
│           │       ├── /game/spelling → <SpellingRush>
│           │       │   ├── <GameHeader>        # 分数/连击/倒计时
│           │       │   ├── <SpellingBoard>     # 字母拼写区
│           │       │   │   ├── <LetterSlot> ×N
│           │       │   │   └── <LetterBlock> ×N
│           │       │   ├── <ComboIndicator>
│           │       │   ├── <SkipButton>
│           │       │   └── <ResultPanel>       # 游戏结束弹出
│           │       │       └── <LevelChangeAnimation>
│           │       │
│           │       ├── /game/match → <WordMatch>
│           │       │   ├── <GameHeader>
│           │       │   ├── <MatchGrid>
│           │       │   │   ├── <MatchCell> ×(N×N)
│           │       │   │   └── <ConnectionLine>
│           │       │   ├── HintButton
│           │       │   └── <ResultPanel>
│           │       │
│           │       ├── /game/grammar → <GrammarFix>
│           │       │   ├── <GameHeader>
│           │       │   ├── <SentenceDisplay>
│           │       │   │   └── <ErrorSpot> ×N
│           │       │   ├── <CorrectionOptions>
│           │       │   └── <ResultPanel>
│           │       │
│           │       ├── /game/listen → <ListenPick>
│           │       │   ├── <GameHeader>
│           │       │   ├── <PlayButton>
│           │       │   ├── <WordOptions>       # 4个选项
│           │       │   └── <ResultPanel>
│           │       │
│           │       ├── /result/:gameId → <ResultPage>
│           │       │   ├── ScoreSummary
│           │       │   ├── ComboChart
│           │       │   ├── AnswerReview        # 正确/错误单词列表
│           │       │   └── LevelChangeDisplay
│           │       │
│           │       ├── /profile → <ProfilePage>
│           │       │   ├── <LevelCard>
│           │       │   ├── StatsGrid           # 游戏统计
│           │       │   ├── RecentGames
│           │       │   └── AchievementPreview
│           │       │
│           │       ├── /profile/achievements → <AchievementsPage>
│           │       │   └── <AchievementBadge> ×20+
│           │       │
│           │       ├── /profile/report → <ReportPage>
│           │       │   └── <ReportChart>       # Recharts 图表
│           │       │
│           │       ├── /settings → <SettingsPage>
│           │       │   ├── AccentToggle        # 美式/英式
│           │       │   ├── SoundToggle
│           │       │   └── RePlacementButton
│           │       │
│           │       ├── /auth/login → <LoginPage>
│           │       ├── /auth/register → <RegisterPage>
│           │       └── /leaderboard → <LeaderboardPage>
│           │
│           └── <BottomNav>                     # 移动端导航
```

---

## 4. 数据流设计

### 4.1 Zustand Store 拆分

```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                       │
├─────────────────┬─────────────────┬───────────────────┤
│  useAuthStore   │  useGameStore   │ useProfileStore    │
│                 │                 │                    │
│ - user: User?   │ - activeGame    │ - level: Level     │
│ - session       │ - score: number │ - totalScore       │
│ - isGuest       │ - combo: number │ - isPlacementDone  │
│ - login()       │ - maxCombo      │ - achievements[]   │
│ - logout()      │ - correctCount  │ - fetchProfile()   │
│ - migrateData() │ - totalCount    │ - syncToCloud()    │
│                 │ - startGame()   │                    │
│                 │ - addScore()    │                    │
│                 │ - endGame()     │                    │
├─────────────────┼─────────────────┼───────────────────┤
│useSettingsStore │useChallengeStore │  (持久化中间件)     │
│                 │                 │                    │
│ - accent        │ - challenges[]  │ localStorage ↔     │
│ - soundEnabled  │ - fetchDaily()  │ Supabase 自动同步   │
│ - animationOn   │ - updateProgress│                    │
└─────────────────┴─────────────────┴───────────────────┘
```

### 4.2 数据流架构图

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  React   │────▶│   Zustand    │────▶│  localStorage│
│  组件    │◀────│   Stores     │◀────│  (游客模式)   │
└──────────┘     └──────┬───────┘     └─────────────┘
                        │
                  ┌─────▼─────┐
                  │  storage-  │  游客→登录数据合并
                  │  adapter   │
                  └─────┬─────┘
                        │
                  ┌─────▼─────┐
                  │  Supabase │
                  │  Client   │
                  └─────┬─────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
      ┌─────▼────┐ ┌───▼────┐ ┌───▼────┐
      │  Auth    │ │  DB    │ │  RLS   │
      │  (JWT)   │ │(PostgreSQL)│(策略) │
      └──────────┘ └────────┘ └────────┘
```

### 4.3 游客模式 → 登录数据迁移流程

```
1. 游客游玩 → 数据存 localStorage (key: "english-game-guest")
2. 游客注册/登录
3. useAuthStore.login() 触发
4. storage-adapter.migrateLocalToCloud()
   ├── 读取 localStorage 数据
   ├── 检查 Supabase 是否有旧数据
   ├── 合并策略：取等级高的、取总分累加、取成就并集
   ├── 写入 Supabase
   └── 清除 localStorage 游客数据
5. 后续所有数据直接读写 Supabase
```

---

## 5. 路由配置与懒加载方案

### 5.1 路由配置

```typescript
// src/router/index.tsx
import { lazy } from 'react';

const HomePage = lazy(() => import('@/pages/HomePage'));
const PlacementPage = lazy(() => import('@/pages/PlacementPage'));
const SpellingRush = lazy(() => import('@/pages/games/SpellingRush'));
const WordMatch = lazy(() => import('@/pages/games/WordMatch'));
const GrammarFix = lazy(() => import('@/pages/games/GrammarFix'));
const ListenPick = lazy(() => import('@/pages/games/ListenPick'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ReportPage = lazy(() => import('@/pages/ReportPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));

export const routes = [
  { path: '/', element: <HomePage />, priority: 'P0' },
  { path: '/placement', element: <PlacementPage />, priority: 'P0' },
  { path: '/game/spelling', element: <SpellingRush />, priority: 'P0' },
  { path: '/game/match', element: <WordMatch />, priority: 'P0' },
  { path: '/game/grammar', element: <GrammarFix />, priority: 'P0' },
  { path: '/game/listen', element: <ListenPick />, priority: 'P0' },
  { path: '/result/:gameId', element: <ResultPage />, priority: 'P0' },
  { path: '/profile', element: <ProfilePage />, priority: 'P1' },
  { path: '/profile/achievements', element: <AchievementsPage />, priority: 'P1' },
  { path: '/profile/report', element: <ReportPage />, priority: 'P1' },
  { path: '/settings', element: <SettingsPage />, priority: 'P1' },
  { path: '/auth/login', element: <LoginPage />, priority: 'P1' },
  { path: '/auth/register', element: <RegisterPage />, priority: 'P1' },
  { path: '/leaderboard', element: <LeaderboardPage />, priority: 'P2' },
];
```

### 5.2 懒加载策略

- **路由级懒加载**：所有页面使用 `React.lazy()` + `<Suspense fallback={<LoadingSpinner />}>`
- **Vite 自动代码分割**：每个 `lazy(() => import(...))` 产生独立 chunk
- **预加载策略**：首页加载后，使用 `<link rel="prefetch">` 预加载高频页面（4款游戏页）
- **Suspense 边界**：路由层和游戏组件层各设置一层 Suspense

### 5.3 路由守卫

```typescript
// 定级检查守卫
function PlacementGuard({ children }) {
  const { isPlacementDone } = useProfileStore();
  const location = useLocation();
  
  // 未定级且不在定级页 → 引导定级
  if (!isPlacementDone && location.pathname !== '/placement') {
    return <Navigate to="/placement" />;
  }
  return children;
}
```

---

## 6. 游戏引擎核心抽象

### 6.1 游戏基类接口

4 款游戏共享以下核心流程，提取为通用 Hook 和工具函数：

```typescript
// types/game.ts
interface GameConfig {
  type: GameType;                    // 'spelling'|'match'|'grammar'|'listen'
  duration: number;                  // 游戏时长（秒），0 表示无限制
  questionsPerRound: number;         // 每轮题目数
  baseScore: number;                 // 基础分
  comboThresholds: ComboThreshold[]; // 连击阈值
}

interface GameSession {
  id: string;
  config: GameConfig;
  state: 'idle' | 'playing' | 'paused' | 'ended';
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  totalCount: number;
  startTime: number;
  elapsedTime: number;
  questions: Question[];
  currentQuestionIndex: number;
}

interface Question {
  id: string;
  type: GameType;
  difficulty: Level;
  prompt: unknown;     // 各游戏不同
  correctAnswer: unknown;
  options?: unknown[]; // 选择题时使用
}

interface GameResult {
  sessionId: string;
  gameType: GameType;
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  maxCombo: number;
  duration: number;
  difficulty: Level;
  levelChanged: boolean;
  oldLevel?: Level;
  newLevel?: Level;
  details: Record<string, unknown>;
}
```

### 6.2 通用游戏 Hooks

| Hook | 职责 | 共用游戏 |
|------|------|----------|
| `useGameEngine(config)` | 游戏生命周期管理（开始/暂停/结束） | 全部4款 |
| `useTimer(duration, onEnd)` | 倒计时管理 | 拼词/连连看/听音 |
| `useCombo()` | 连击计数与加成计算 | 全部4款 |
| `useScoring(baseScore, comboRules)` | 分数计算引擎 | 全部4款 |
| `useQuestionBank(gameType, level)` | 按等级抽取题目 | 全部4款 |

### 6.3 各游戏特有逻辑

```
拼词大作战 (SpellingRush):
├── 共用：useGameEngine, useTimer(60s), useCombo, useScoring
├── 特有：
│   ├── useLetterShuffle(word)     → Fisher-Yates 打乱算法
│   ├── useDragDrop()              → 拖拽排序
│   ├── useKeyboard()              → Enter提交, Esc跳过
│   └── 时间惩罚：错误扣3秒，跳过扣5秒

单词连连看 (WordMatch):
├── 共用：useGameEngine, useTimer(关卡限时), useCombo, useScoring
├── 特有：
│   ├── usePathFinder(grid)        → BFS 路径搜索（≤2拐弯）
│   ├── useGridGenerator(level)    → 网格生成（6×6~10×10）
│   └── HintSystem                 → 高亮可配对组合

语法改错 (GrammarFix):
├── 共用：useGameEngine, useCombo, useScoring
├── 特有：
│   ├── useErrorHighlighter()      → 错误位置标记
│   └── CorrectionPopup            → 4选1修正选项

听音选词 (ListenPick):
├── 共用：useGameEngine, useTimer(10s/题), useCombo, useScoring
├── 特有：
│   ├── useSpeech(word, accent)    → Web Speech API 封装
│   ├── useAudioFallback(url)      → 预录音频降级
│   └── useDistractorGen(word)     → 近音/近形干扰项生成
```

---

## 7. 自适应难度引擎详细设计

### 7.1 核心算法

```typescript
// lib/difficulty-engine.ts

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_MAPPING: Record<Level, {
  spellingLetters: [number, number];  // [min, max] 字母数
  matchGridSize: number;             // 网格大小
  matchPairs: number;                // 配对数量
  grammarTypes: string[];            // 语法类型
  wordComplexity: 'simple' | 'moderate' | 'complex';
}> = {
  'A1': { spellingLetters: [3,4], matchGridSize: 6, matchPairs: 6,
          grammarTypes: ['spelling','simple_tense'],
          wordComplexity: 'simple' },
  'A2': { spellingLetters: [4,5], matchGridSize: 6, matchPairs: 8,
          grammarTypes: ['spelling','simple_tense','articles'],
          wordComplexity: 'simple' },
  'B1': { spellingLetters: [5,7], matchGridSize: 8, matchPairs: 12,
          grammarTypes: ['tense','preposition','subject_verb'],
          wordComplexity: 'moderate' },
  'B2': { spellingLetters: [6,8], matchGridSize: 8, matchPairs: 15,
          grammarTypes: ['tense','clause','preposition','word_form'],
          wordComplexity: 'moderate' },
  'C1': { spellingLetters: [7,10], matchGridSize: 10, matchPairs: 18,
          grammarTypes: ['subjunctive','inversion','clause','word_form'],
          wordComplexity: 'complex' },
  'C2': { spellingLetters: [8,12], matchGridSize: 10, matchPairs: 20,
          grammarTypes: ['subjunctive','inversion','idiom','nuance'],
          wordComplexity: 'complex' },
};

/**
 * 计算新等级
 * @param currentLevel 当前等级
 * @param accuracy 正确率 (0-1)
 * @param gamesInCurrentLevel 当前等级已完成局数（防抖动）
 */
export function calculateNewLevel(
  currentLevel: Level,
  accuracy: number,
  gamesInCurrentLevel: number = 1
): { newLevel: Level; changed: boolean; direction: 'up' | 'down' | 'none' } {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  
  if (accuracy >= 0.80 && currentIndex < LEVEL_ORDER.length - 1) {
    // 需要连续2局 ≥80% 才升级（防抖动）
    if (gamesInCurrentLevel >= 2 || accuracy >= 0.90) {
      return {
        newLevel: LEVEL_ORDER[currentIndex + 1],
        changed: true,
        direction: 'up',
      };
    }
  }
  
  if (accuracy <= 0.40 && currentIndex > 0) {
    return {
      newLevel: LEVEL_ORDER[currentIndex - 1],
      changed: true,
      direction: 'down',
    };
  }
  
  return { newLevel: currentLevel, changed: false, direction: 'none' };
}

/**
 * 定级测试分数 → 等级映射
 */
export function placementScoreToLevel(scores: {
  vocab: number;
  grammar: number;
  listen: number;
}): Level {
  const total = scores.vocab + scores.grammar + scores.listen;
  const maxPerSection = 100;
  const maxTotal = maxPerSection * 3;
  const percentage = total / maxTotal;
  
  if (percentage >= 0.90) return 'C2';
  if (percentage >= 0.80) return 'C1';
  if (percentage >= 0.65) return 'B2';
  if (percentage >= 0.50) return 'B1';
  if (percentage >= 0.30) return 'A2';
  return 'A1';
}
```

### 7.2 难度引擎调用时机

```
游戏结束 → ResultPanel
  │
  ├── 1. 计算 accuracy = correctCount / totalCount
  ├── 2. 调用 calculateNewLevel(currentLevel, accuracy)
  ├── 3. 若 changed:
  │   ├── 更新 useProfileStore.level
  │   ├── 显示 <LevelChangeAnimation>
  │   ├── 更新 Supabase profiles.level
  │   └── 记录 game_records (level_changed, old_level, new_level)
  └── 4. 保存游戏记录到 Supabase/localStorage
```

---

## 8. Supabase 集成方案

### 8.1 客户端初始化

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### 8.2 环境变量

```env
VITE_SUPABASE_URL=https://wdkwrimlronzjrgvbbtx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka3dyaW1scm9uempyZ3ZiYnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDM0MDcsImV4cCI6MjA5NTQ3OTQwN30.UVr9zhySSR_hOGoM7qWRrsRq_DXhGFmQ5lBAlducVxE
```

### 8.3 Auth 集成

- **认证方式**：邮箱密码注册 + Google OAuth
- **游客模式**：不触发 Auth，数据存 localStorage
- **Session 管理**：`supabase.auth.onAuthStateChange()` 监听登录状态
- **自动创建 Profile**：数据库触发器 `on_auth_user_created` 自动插入 profiles 行

### 8.4 RLS 策略总结

| 表 | SELECT | INSERT | UPDATE | DELETE |
|----|--------|--------|--------|--------|
| profiles | 本人 | 本人 | 本人 | ❌ |
| game_records | 本人 | 本人 | ❌ | ❌ |
| achievements | 本人 | 本人 | ❌ | ❌ |
| daily_challenges | 本人 | 本人 | 本人 | ❌ |
| placement_tests | 本人 | 本人 | ❌ | ❌ |

### 8.5 数据库表结构（已创建）

已在 Supabase 完成以下 5 张表的创建：

| 表名 | 主键 | 外键 | 核心字段 |
|------|------|------|----------|
| `profiles` | id UUID → auth.users | - | nickname, avatar_url, level, total_score, total_games_played, is_placement_done |
| `game_records` | id BIGSERIAL | user_id → profiles.id | game_type, score, correct_count, total_count, max_combo, difficulty, duration_seconds, level_changed, old_level, new_level, details(JSONB) |
| `achievements` | id BIGSERIAL | user_id → profiles.id | achievement_key, unlocked_at, UNIQUE(user_id, achievement_key) |
| `daily_challenges` | id BIGSERIAL | user_id → profiles.id | challenge_date, challenge_key, progress, target, completed, UNIQUE(user_id, date, key) |
| `placement_tests` | id BIGSERIAL | user_id → profiles.id | result_level, vocab_score, grammar_score, listen_score, total_score, details(JSONB) |

**索引**：user_id、game_type、created_at DESC、challenge_date 均已建立索引。

---

## 9. 性能优化策略

### 9.1 加载性能

| 策略 | 目标 | 实现方式 |
|------|------|----------|
| 路由懒加载 | 首屏 JS < 200KB | React.lazy + Suspense |
| Vite 代码分割 | 按游戏拆分 chunk | 动态 import() |
| 词库按需加载 | 减少初始包体积 | 按等级分段 JSON，fetch on demand |
| 预加载关键路由 | 减少导航延迟 | `<link rel="prefetch">` 4款游戏页 |
| Tailwind Purge | 最小化 CSS | JIT 模式，仅包含使用的类 |
| 静态资源 CDN | 加速加载 | 音频/图标部署到 Supabase Storage |

### 9.2 运行时性能

| 策略 | 目标 | 实现方式 |
|------|------|----------|
| React.memo | 减少不必要渲染 | GameCard, MatchCell, LetterBlock |
| useMemo/useCallback | 避免重复计算 | 计分引擎、路径查找 |
| 虚拟化（如需） | 长列表优化 | 排行榜、成就墙 |
| requestAnimationFrame | 60fps 动画 | 倒计时、连击动画、飘字 |
| Web Worker（预留） | 路径计算不阻塞 UI | 连连看 BFS 搜索 |
| Zustand 选择器 | 精准订阅 | `useGameStore(s => s.score)` |

### 9.3 数据策略

| 策略 | 说明 |
|------|------|
| 词库客户端缓存 | 首次加载后存 localStorage，版本号控制更新 |
| 游戏记录批量写入 | 游戏结束一次性写入，游戏中不频繁请求 |
| Supabase Realtime（预留） | 排行榜实时更新（P2 功能） |
| 乐观更新 | 成就解锁先更新 UI，后台同步 |

---

## 10. 错误边界与降级方案

### 10.1 错误边界层级

```
<ErrorBoundary type="fatal">          # 根级别：捕获未处理异常
  └── <ErrorBoundary type="route">   # 路由级别：页面级错误
      └── <ErrorBoundary type="game"> # 游戏级别：单局游戏错误
```

### 10.2 降级矩阵

| 场景 | 检测方式 | 降级方案 |
|------|----------|----------|
| Web Speech API 不可用 | `!window.speechSynthesis` | 使用预录音频文件（`/public/audio/`） |
| Supabase 连接失败 | fetch 超时/错误 | 自动切换 localStorage 模式，提示用户 |
| 词库加载失败 | fetch error | 显示重试按钮 + 内置最小词库（50词） |
| 浏览器不支持 WebP | Canvas 检测 | 降级 PNG/JPG |
| localStorage 满 | QuotaExceededError | LRU 淘汰旧数据，提示清理 |
| JavaScript 被禁用 | `<noscript>` | 显示"请启用 JavaScript" |
| 游戏中途崩溃 | ErrorBoundary 捕获 | 保存当前进度到 sessionStorage，恢复 |

### 10.3 Web Speech API 降级实现

```typescript
// hooks/useSpeech.ts
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  function speak(word: string, accent: 'us' | 'uk') {
    if (supported) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent === 'us' ? 'en-US' : 'en-GB';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } else {
      // 降级：播放预录音频
      const audio = new Audio(`/audio/${accent}/${word}.mp3`);
      audio.play().catch(() => {
        // 音频也不可用时静默失败
        console.warn('Audio playback not available');
      });
    }
  }
  
  return { speak, supported };
}
```

---

## 11. 安全策略

| 策略 | 实现 |
|------|------|
| XSS 防护 | React 默认转义 + DOMPurify（如有富文本） |
| CSRF | Supabase Auth 自动处理 |
| 数据隔离 | RLS 策略确保用户只能访问自己的数据 |
| 输入校验 | TypeScript 类型 + zod 运行时校验 |
| 环境变量 | `.env` 不提交 Git，`.env.example` 作为模板 |
| API Key 安全 | 仅使用 anon key，不暴露 service_role key 到前端 |

---

## 12. 与现有系统的集成点

### 12.1 项目独立性

本项目（`英语学习/`）是一个全新的独立项目，与工作区中其他项目（`通讯/`、`记账/`、`电影/`、`扫雷/` 等）无代码依赖关系。

### 12.2 Supabase 共享

本项目使用与 `记账/` 项目相同的 Supabase 实例，但使用独立的表命名空间（`profiles`、`game_records`、`achievements`、`daily_challenges`、`placement_tests`），不会产生冲突。

### 12.3 技术栈对齐

- React 18 + Vite 5 与工作区内其他前端项目保持一致
- TypeScript 严格模式配置可参考 `记账/` 项目的 tsconfig
- Tailwind 配置可参考工作区已有的 Tailwind 项目

---

## 13. 开发阶段规划

### Phase 1：基础设施（第1-2天）
- [ ] 项目脚手架搭建（Vite + React + TS + Tailwind）
- [ ] 路由配置 + 懒加载
- [ ] Zustand Store 初始化
- [ ] Supabase 客户端初始化 + 环境变量
- [ ] 通用组件（Layout, Navbar, GameCard, ErrorBoundary）
- [ ] 类型定义完整

### Phase 2：核心引擎（第3-4天）
- [ ] 自适应难度引擎
- [ ] 连击计分系统
- [ ] 通用游戏 Hook（useGameEngine, useTimer, useCombo）
- [ ] 词库加载 + 缓存
- [ ] Web Speech API + 降级方案
- [ ] localStorage ↔ Supabase 适配器

### Phase 3：游戏实现 P0（第5-8天）
- [ ] 定级测试页面 + 题库
- [ ] 拼词大作战
- [ ] 单词连连看（含 BFS 路径搜索）
- [ ] 语法改错
- [ ] 听音选词
- [ ] 结算页面 + ResultPanel

### Phase 4：P1 功能（第9-11天）
- [ ] 用户注册/登录
- [ ] 游客数据迁移
- [ ] 每日挑战
- [ ] 成就徽章系统
- [ ] 个人中心 + 设置
- [ ] 每周报告（Recharts）

### Phase 5：P2 + 打磨（第12-14天）
- [ ] 排行榜
- [ ] 主题专项训练
- [ ] 动画打磨（Framer Motion）
- [ ] 性能优化
- [ ] 浏览器兼容测试
- [ ] 响应式适配

---

> **数据库状态**：✅ 5张表已在 Supabase 创建完成，含 RLS 策略、索引和触发器。
>
> **下一步**：由 developer-agent 按 Phase 1 → Phase 5 顺序进行开发实现。
