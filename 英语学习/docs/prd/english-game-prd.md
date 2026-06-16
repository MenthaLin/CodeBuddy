# PRD：English Fun Zone — 英语学习休闲游戏合集

> 版本：v1.0 | 日期：2026-06-15 | 作者：pm-agent
> 状态：待确认

---

## 1. 背景与目标

### 1.1 要解决的问题
当前市场上英语学习工具偏重应试或课程模式，缺乏一款**轻量级、游戏化、自适应难度**的 Web 端英语学习产品。用户需要一个打开浏览器就能玩、能在娱乐中自然提升英语水平的游戏合集。

### 1.2 业务目标
- 打造一款零门槛（无需注册即可体验）的英语学习休闲游戏 Web 应用
- 通过自适应难度引擎（A1-C2）满足不同水平用户需求
- MVP 阶段覆盖单词、语法、听力、发音四大核心技能
- 通过连击、成就、每日挑战等游戏化机制提升用户留存

### 1.3 目标用户
| 用户画像 | 描述 | 核心诉求 |
|---------|------|---------|
| 学生群体 | 初中/高中/大学生，备考需求 | 背单词、练语法 |
| 职场人士 | 需要英语工作沟通 | 听力、发音、实用词汇 |
| 英语爱好者 | 喜欢英语，自我提升 | 趣味学习，碎片时间 |

---

## 2. 用户故事

| 优先级 | 角色 | 需求 | 目的 |
|--------|------|------|------|
| P0 | 新用户 | 首次打开进行快速定级测试，获得初始难度等级 | 获得个性化学习起点 |
| P0 | 学习者 | 玩"拼词大作战"游戏，限时拼写单词 | 在紧张刺激中巩固单词拼写 |
| P0 | 学习者 | 玩"单词连连看"游戏，配对英文-中文释义 | 通过配对消除巩固词汇记忆 |
| P0 | 学习者 | 玩"语法改错"游戏，点击句子中错误处修正 | 提升语法识别和纠错能力 |
| P0 | 学习者 | 玩"听音选词"游戏，听发音选正确单词 | 训练听力辨别能力 |
| P0 | 学习者 | 游戏结束后查看得分、连击和正确率 | 了解自己的表现 |
| P0 | 系统 | 根据正确率自动升降用户难度等级 | 实现自适应学习路径 |
| P1 | 学习者 | 完成每日挑战任务，获得额外奖励 | 养成每日学习习惯 |
| P1 | 学习者 | 解锁成就徽章，查看成就收集进度 | 获得成就感，提升留存 |
| P1 | 学习者 | 查看每周学习报告，了解学习趋势 | 跟踪学习进度 |
| P1 | 用户 | 注册/登录账号，同步学习数据 | 跨设备同步学习记录 |
| P2 | 学习者 | 查看排行榜，与全球用户比拼 | 增加社交竞争动力 |
| P2 | 学习者 | 自定义头像和昵称 | 个性化体验 |
| P2 | 学习者 | 选择特定主题（商务/旅游/学术等）进行专项训练 | 满足特定场景需求 |

---

## 3. 功能列表

### 3.1 P0（必须实现）

- [ ] **F1 - 快速定级测试**
  - 描述：用户首次使用时进行 20 题测试，覆盖单词/语法/听力各维度的不同难度题目
  - 验收标准：
    - 20 题完成后自动计算等级（A1/A2/B1/B2/C1/C2）
    - 结果展示：总得分、各维度得分、建议等级
    - 可跳过定级（默认 A2 起步），跳过后可在设置中重新定级

- [ ] **F2 - 拼词大作战（Spelling Rush）**
  - 描述：限时 60 秒内，屏幕显示乱序字母，玩家拼出正确单词。正确连击加分，答错/跳过扣时。难度决定单词复杂度。
  - 验收标准：
    - 字母块可点击排列，支持拖拽和点击两种交互
    - 倒计时 60 秒，连击（Combo）≥3 时额外加分
    - 正确音效 + 得分飘字动画；错误时震动反馈
    - 每局结束后展示：得分、最大连击、正确率、正确/错误单词列表
    - 难度映射：A1→3-4字母，B1→5-7字母，C1→8+字母

- [ ] **F3 - 单词连连看（Word Match）**
  - 描述：网格中散布英文单词和中文释义，点击配对消除。关卡制，难度递增（网格变大、词量增加）。
  - 验收标准：
    - 6×6 ~ 10×10 网格，英文-中文成对出现
    - 必须通过可连通的路径（最多2个拐弯）消除
    - 关卡制：完成当前关卡解锁下一关
    - 支持提示道具（每局限用 3 次）
    - 每关限时，超时失败
    - 难度映射：A1→6×6/6对，B1→8×8/12对，C1→10×10/18对

- [ ] **F4 - 语法改错（Grammar Fix）**
  - 描述：展示一句含有语法错误的英文句子，玩家点击错误单词/位置并选择正确修正。
  - 验收标准：
    - 句子中的错误处以高亮/下划线标示可点击区域
    - 点击错误处弹出修正选项（4选1），选择正确修正
    - 支持错误类型：时态、主谓一致、冠词、介词、拼写、词性
    - 每轮 10 句，可跳过（不扣分但无加分）
    - 答对+10分，连续答对触发 Combo 加分
    - 难度映射：A1→简单时态/拼写，B1→复杂时态/从句，C1→虚拟语气/倒装

- [ ] **F5 - 听音选词（Listen & Pick）**
  - 描述：Web Speech API 朗读一个单词，从 4 个选项中选出正确单词。
  - 验收标准：
    - 自动播放发音（可点击重播，最多3次）
    - 4 个选项包含正确单词 + 3 个干扰项（近音/近形词）
    - 每轮 10 题，每题限时 10 秒
    - 答对+10分，速度越快加分越多
    - 支持美式/英式发音切换
    - 难度映射：A1→简单单音节词，B1→多音节词，C1→学术/低频词

- [ ] **F6 - 自适应难度引擎**
  - 描述：核心算法，根据每局正确率自动调整用户难度等级。
  - 验收标准：
    - 正确率 ≥ 80% → 难度 +1（最高 C2）
    - 正确率 ≤ 40% → 难度 -1（最低 A1）
    - 40% < 正确率 < 80% → 保持当前难度
    - 每局结束后即时计算并更新
    - 难度等级持久化存储到 Supabase

- [ ] **F7 - 游客模式与数据持久化**
  - 描述：未登录用户可游玩，数据存 localStorage；登录后数据同步到 Supabase。
  - 验收标准：
    - 游客可直接玩游戏，定级结果和进度存 localStorage
    - 登录后自动合并/迁移本地数据到云端
    - 登录用户跨设备同步等级、成就、报告数据

### 3.2 P1（应该实现）

- [ ] **F8 - 每日挑战（Daily Challenge）**
  - 描述：每日生成 3 个挑战任务（如"拼词连击10次""语法改错全对"），完成后获得额外经验奖励。
  - 验收标准：每日 0 点刷新，完成进度可视化，奖励即时发放

- [ ] **F9 - 成就徽章系统**
  - 描述：预设 20+ 成就徽章（如"初出茅庐""连击大师""百词斩""全勤一周"等）。
  - 验收标准：达成条件自动解锁，徽章展示在个人页，未解锁显示灰色剪影

- [ ] **F10 - 每周学习报告**
  - 描述：每周一生成学习报告，展示本周游戏次数、总得分、正确率趋势、等级变化。
  - 验收标准：可视化图表（折线图/柱状图），可分享截图

- [ ] **F11 - 用户注册/登录**
  - 描述：支持邮箱注册和 Google OAuth 登录。
  - 验收标准：Supabase Auth 集成，注册后自动合并游客数据

- [ ] **F12 - 设置页面**
  - 描述：用户可设置发音偏好（美式/英式）、音效开关、重新定级测试。
  - 验收标准：设置项持久化，重新定级后清除旧等级重新测试

### 3.3 P2（可选实现）

- [ ] **F13 - 全球排行榜**
  - 描述：按总分/连击/成就数排名，支持周榜和总榜。
- [ ] **F14 - 主题专项训练**
  - 描述：按商务/旅游/学术/日常等主题筛选题目，针对薄弱维度训练。
- [ ] **F15 - 自定义头像和昵称**
  - 描述：预设头像库 + 可编辑昵称。
- [ ] **F16 - 好友挑战**
  - 描述：邀请好友比拼同一关卡得分。

---

## 4. 页面/路由清单

| 路由 | 页面名称 | 优先级 | 说明 |
|------|---------|--------|------|
| `/` | 首页/游戏大厅 | P0 | 4款游戏入口卡片、每日挑战入口、导航栏 |
| `/placement` | 定级测试 | P0 | 20题快速定级流程 |
| `/game/spelling` | 拼词大作战 | P0 | 游戏主界面 + 结算面板 |
| `/game/match` | 单词连连看 | P0 | 游戏主界面 + 关卡选择 + 结算面板 |
| `/game/grammar` | 语法改错 | P0 | 游戏主界面 + 结算面板 |
| `/game/listen` | 听音选词 | P0 | 游戏主界面 + 结算面板 |
| `/result/:gameId` | 游戏结算页 | P0 | 得分详情、正确率、Combo、等级变化 |
| `/profile` | 个人中心 | P1 | 等级、成就、学习报告入口 |
| `/profile/achievements` | 成就展示 | P1 | 徽章收集墙 |
| `/profile/report` | 每周报告 | P1 | 学习数据可视化 |
| `/settings` | 设置 | P1 | 发音/音效偏好、重新定级 |
| `/auth/login` | 登录 | P1 | 邮箱 + Google OAuth |
| `/auth/register` | 注册 | P1 | 邮箱注册 |
| `/leaderboard` | 排行榜 | P2 | 周榜/总榜 |

---

## 5. 数据模型设计

### 5.1 数据库表（Supabase PostgreSQL）

```sql
-- 用户表（扩展 Supabase Auth）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nickname TEXT,
  avatar_url TEXT,
  level TEXT DEFAULT 'A2' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏记录表
CREATE TABLE game_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('spelling','match','grammar','listen')),
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 成就表
CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- 每日挑战记录
CREATE TABLE daily_challenges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, challenge_date, challenge_key)
);

-- 定级测试记录
CREATE TABLE placement_tests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  result_level TEXT NOT NULL,
  vocab_score INTEGER NOT NULL,
  grammar_score INTEGER NOT NULL,
  listen_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 前端状态（Zustand Store）

```typescript
// 核心状态结构
interface GameState {
  // 用户
  user: User | null;
  isGuest: boolean;
  
  // 难度
  currentLevel: Level; // 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'
  isPlacementDone: boolean;
  
  // 当前游戏会话
  activeGame: {
    type: GameType;
    score: number;
    combo: number;
    maxCombo: number;
    correctCount: number;
    totalCount: number;
    startTime: number;
  } | null;
  
  // 设置
  settings: {
    accent: 'us' | 'uk';
    soundEnabled: boolean;
  };
}
```

### 5.3 词库数据结构

```typescript
interface WordEntry {
  id: string;
  word: string;           // 英文单词
  chinese: string;        // 中文释义
  level: Level;           // 难度等级
  phonetic?: string;      // 音标
  partOfSpeech?: string;  // 词性
  audioUrl?: string;      // 预录音频URL（备用）
}

interface GrammarQuestion {
  id: string;
  incorrectSentence: string;   // 含错误的句子
  correctSentence: string;     // 正确句子
  errorWord: string;           // 错误单词
  correction: string;          // 正确形式
  errorType: string;           // 错误类型
  level: Level;
  distractors: string[];       // 干扰选项
}
```

---

## 6. 游戏核心逻辑

### 6.1 自适应难度算法

```
每局结束后：
  accuracy = correctCount / totalCount
  
  if accuracy >= 0.80:
    newLevel = min(currentLevel + 1, C2)
  else if accuracy <= 0.40:
    newLevel = max(currentLevel - 1, A1)
  else:
    newLevel = currentLevel
  
  if newLevel != currentLevel:
    展示等级升降动画
    更新 profiles.level
```

### 6.2 连击计分系统

```
基础分 = 10
Combo 加成：
  combo < 3:   ×1.0
  combo 3-5:   ×1.5
  combo 6-9:   ×1.8
  combo 10+:   ×2.0

拼词大作战额外规则：
  时间奖励 = 剩余秒数 × 2（加入总分）

听音选词额外规则：
  速度奖励 = (10 - 答题用时) × 1（每题）
```

### 6.3 拼词大作战流程

```
1. 从词库中按当前等级随机抽取单词
2. 将单词字母随机打乱显示
3. 用户点击/拖拽字母块排列
4. 提交 → 比对正确性
   - 正确：Combo+1，加分，下一个词
   - 错误：Combo归零，扣3秒，字母重新打乱
5. 支持「跳过」按钮（扣5秒，不扣Combo）
6. 60秒结束 → 结算面板
```

### 6.4 单词连连看流程

```
1. 根据等级生成 N×N 网格（含英文+中文成对）
2. 用户点击两个格子
   - 同为英-中配对 → 检查路径连通性（≤2拐弯）
   - 连通 → 消除，加分，检测是否全部消除
   - 不连通 → 提示"无法连通"
3. 全部消除 → 过关，下一关难度递增
4. 提示道具：自动高亮一对可消除的配对
5. 限时结束 → 失败
```

### 6.5 语法改错流程

```
1. 从题库按等级抽取10句含错句子
2. 显示句子，错误处可点击（高亮标记）
3. 点击 → 弹出4个修正选项
4. 选择 → 判断正确性
   - 正确：+10分，Combo+1
   - 错误：不扣分，Combo归零，显示正确答案
5. 跳过 → Combo归零，不扣分
6. 10题结束 → 结算
```

### 6.6 听音选词流程

```
1. 从词库按等级抽取10个单词
2. Web Speech API 朗读单词（可重播3次）
3. 显示4个选项（正确+3干扰近音词）
4. 用户选择
   - 正确：+10分 + 速度奖励，Combo+1
   - 错误：不扣分，Combo归零
5. 10题结束 → 结算
```

### 6.7 每日挑战生成逻辑

```
每日0点刷新，从预设挑战池随机抽取3个：
  挑战池示例：
  - spelling_combo_10: 拼词连击达到10次
  - grammar_perfect: 语法改错全对
  - listen_speed: 听音选词平均3秒内作答
  - match_no_hint: 连连看不使用提示过关
  - total_score_500: 单日总分达到500
  - play_all_games: 完成全部4款游戏各1局
```

---

## 7. 非功能性需求

### 7.1 性能
- 首屏加载 ≤ 3 秒（Lighthouse Performance ≥ 90）
- 游戏内交互响应 ≤ 100ms（动画帧率 60fps）
- 词库数据本地缓存，减少网络请求
- 图片/静态资源 CDN 加速

### 7.2 安全
- Supabase Row Level Security 保护用户数据
- 游客数据仅存本地，不上传服务端
- 登录使用 Supabase Auth（邮箱验证 + OAuth）
- 输入校验防 XSS

### 7.3 兼容性
- 支持 Chrome 90+、Firefox 90+、Safari 15+、Edge 90+
- 响应式设计：桌面端（≥1024px）优先，平板（≥768px）可用，移动端（≥375px）基本可用
- Web Speech API 降级方案：浏览器不支持时使用预录音频文件

### 7.4 可用性
- 所有游戏提供新手引导（首次进入时交互式教程）
- 游戏内支持键盘快捷键（拼词：Enter提交，Esc跳过）
- 音效/动画可关闭（无障碍考虑）
- 色盲友好配色（连连看配对颜色不仅靠颜色区分）

### 7.5 可维护性
- TypeScript 严格模式
- 组件化架构，游戏逻辑与 UI 分离
- 词库/题库以 JSON 文件管理，便于扩展

---

## 8. 验收标准总览

### 8.1 核心流程验收

**场景1：新用户首次体验**
```
Given 用户首次访问 English Fun Zone
When  用户点击「开始定级测试」
Then  系统展示20道涵盖单词/语法/听力的定级题目
And   完成后展示定级结果和建议等级
And   用户被引导至游戏大厅
```

**场景2：拼词大作战完整流程**
```
Given 用户等级为 B1
When  用户进入拼词大作战并点击开始
Then  显示60秒倒计时和乱序字母
And   用户拼对单词后 Combo 计数+1，分数增加
And   用户拼错后 Combo 归零，时间扣3秒
And   60秒结束后展示结算面板（得分/连击/正确率/等级变化）
```

**场景3：难度自适应升级**
```
Given 用户等级为 A2，刚完成一局拼词大作战
When  正确率达到 85%（≥80%）
Then  用户等级升至 B1
And   结算面板展示升级动画
And   下次游戏题目难度为 B1 级别
```

**场景4：难度自适应降级**
```
Given 用户等级为 B2，刚完成一局语法改错
When  正确率为 30%（≤40%）
Then  用户等级降至 B1
And   结算面板展示降级提示
```

**场景5：游客转登录用户数据迁移**
```
Given 游客已完成定级（B1）并玩了3局游戏
When  用户注册/登录账号
Then  本地 localStorage 中的等级和游戏记录迁移到 Supabase
And   之后游戏数据在云端同步
```

**场景6：每日挑战完成**
```
Given 今日挑战包含「拼词连击10次」
When  用户在拼词大作战中达成10连击
Then  挑战进度更新为完成
And   用户获得额外经验奖励
```

---

## 9. 附录

### 9.1 成就徽章清单（初版）

| 徽章 Key | 名称 | 达成条件 |
|----------|------|---------|
| first_game | 初出茅庐 | 完成任意1局游戏 |
| combo_10 | 连击新星 | 单局达成10连击 |
| combo_30 | 连击大师 | 单局达成30连击 |
| spelling_100 | 百词斩 | 累计拼对100个单词 |
| match_50 | 连连看达人 | 完成50关连连看 |
| grammar_100 | 语法纠察官 | 累计修正100个语法错误 |
| listen_100 | 顺风耳 | 累计听音选对100题 |
| all_games | 全能选手 | 完成全部4款游戏各1局 |
| streak_7 | 全勤一周 | 连续7天完成每日挑战 |
| score_10000 | 万分户 | 累计总分达到10000 |
| level_b2 | B2 进阶者 | 达到 B2 等级 |
| level_c1 | C1 高手 | 达到 C1 等级 |
| level_c2 | C2 大师 | 达到 C2 等级 |
| perfect_grammar | 语法满分 | 语法改错单局100%正确率 |
| speed_demon | 闪电侠 | 听音选词平均2秒内作答 |
| no_hint_match | 独立通关 | 不使用提示完成连连看一关 |
| placement_first | 摸底完毕 | 完成定级测试 |
| welcome_week | 新手周 | 注册7天内完成10局游戏 |

### 9.2 技术依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式 |
| Zustand | 4.x | 状态管理 |
| React Router | 6.x | 路由 |
| @supabase/supabase-js | 2.x | 数据库/认证 |
| Web Speech API | 浏览器内置 | 语音合成（发音） |
| Framer Motion | (建议) | 游戏动画 |
| Recharts | (建议) | 报告图表 |

### 9.3 文件结构预估

```
client/
├── src/
│   ├── components/        # 通用组件
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── GameCard.tsx
│   │   ├── ComboIndicator.tsx
│   │   ├── DifficultyBadge.tsx
│   │   └── ResultPanel.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PlacementTest.tsx
│   │   ├── games/
│   │   │   ├── SpellingRush.tsx
│   │   │   ├── WordMatch.tsx
│   │   │   ├── GrammarFix.tsx
│   │   │   └── ListenPick.tsx
│   │   ├── ResultPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AchievementsPage.tsx
│   │   ├── ReportPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── stores/
│   │   ├── useGameStore.ts
│   │   ├── useAuthStore.ts
│   │   └── useSettingsStore.ts
│   ├── hooks/
│   │   ├── useDifficulty.ts
│   │   ├── useCombo.ts
│   │   ├── useTimer.ts
│   │   └── useSpeech.ts
│   ├── data/
│   │   ├── words.json
│   │   ├── grammar-questions.json
│   │   └── achievements.json
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── difficulty-engine.ts
│   │   └── scoring.ts
│   └── types/
│       └── index.ts
└── ...
```

---

> **下一步**：PRD 确认后，由 architect-agent 进行架构设计。
