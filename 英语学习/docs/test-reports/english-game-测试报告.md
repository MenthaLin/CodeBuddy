# 测试报告：English Fun Zone — 英语学习休闲游戏合集

> 版本：v1.0 | 日期：2026-06-15 | 作者：tester-agent

---

## 1. 总览

| 指标 | 数值 |
|------|------|
| 测试文件数 | 6 |
| 用例总数 | **190** |
| 通过 | **190** ✅ |
| 失败 | **0** |
| 执行时间 | ~2.8s |
| 测试框架 | Vitest 4.1.9 + @testing-library/react 16.x |

---

## 2. 测试覆盖详情

### 2.1 difficulty-engine.test.ts — 难度引擎测试
**33 个用例全部通过**

| 测试类别 | 用例数 | 说明 |
|----------|--------|------|
| 升级逻辑 | 6 | ≥80% 升级、≥90% 快速升级、防抖动(需连续2局) |
| 降级逻辑 | 4 | ≤40% 降级、不受防抖动限制 |
| 保持等级 | 4 | 40%-80% 保持 |
| 边界测试 | 6 | A1 不降、C2 不升、默认值行为 |
| 等级顺序完整性 | 2 | A1→C2 连续升级、C2→A1 连续降级 |
| placementScoreToLevel | 6 | 总分→等级映射 (270→C2, 240→C1, 195→B2, 150→B1, 90→A2, <90→A1) |
| getLevelIndex | 1 | 6 级索引映射 |
| compareLevel | 3 | 等级比较运算 |
| maxLevel | 1 | 取较高等级 |

### 2.2 scoring-engine.test.ts — 计分引擎测试
**34 个用例全部通过**

| 测试类别 | 用例数 | 说明 |
|----------|--------|------|
| Combo 倍率 | 5 | 0-2→×1.0, 3-5→×1.5, 6-9→×1.8, 10+→×2.0, 连续递增 |
| 分数计算 | 6 | 基础分×倍率、自定义基础分、边界0分 |
| 时间奖励 (拼词) | 5 | 剩余秒数×2、0秒、负数保护、四舍五入 |
| 速度奖励 (听音) | 6 | (10-用时)×1、超时保护、自定义限时 |
| Combo 等级文字 | 6 | '' / GOOD! / NICE! / GREAT! / AMAZING! / PERFECT! |
| Combo 颜色 | 6 | gray→yellow→orange→red→purple→amber |

### 2.3 word-utils.test.ts — 词库工具测试
**30 个用例全部通过**

| 测试类别 | 用例数 | 说明 |
|----------|--------|------|
| getWordBank | 3 | 数据加载、字段完整性、缓存机制 |
| getWordsByLevel | 4 | 按等级筛选、不存在等级→空、各等级有数据 |
| pickRandomWords | 5 | 指定数量、超出处理、allowLower、count=0 |
| shuffleArray | 4 | 长度不变、元素完整、不修改原数组、边界 |
| shuffleLetters | 4 | 长度正确、集合一致、确保打乱、单字母 |
| getGrammarBank | 2 | 加载、字段完整性 |
| getGrammarByLevel | 2 | 等级筛选、超出处理 |
| generateDistractors | 5 | 数量、不包含正确词、来自词库、空词库 |

### 2.4 game-logic.test.ts — 游戏逻辑测试
**42 个用例全部通过**

| 游戏模块 | 用例数 | 说明 |
|----------|--------|------|
| 拼词大作战 | 12 | Combo计分、时间惩罚(错-3s/跳过-5s)、时间奖励(×2)、乱序字母、A1/B1/C1 单词长度映射 |
| 单词连连看 | 10 | BFS连通检测(0拐弯/1拐弯/2拐弯/不连通)、围墙隔离、相同点、网格/配对数量映射 |
| 语法改错 | 6 | 数据完整性、correction不在distractors(BUG标记)、C2无语法题(BUG标记)、难度映射 |
| 听音选词 | 8 | 干扰项生成、速度奖励、每题限时10s、A1/C1难度映射 |
| 等级变化联动 | 5 | 拼词升级、语法降级、听音保持、A1/C2边界 |

### 2.5 stores.test.ts — 状态管理测试
**25 个用例全部通过**

| Store | 用例数 | 说明 |
|-------|--------|------|
| useGameStore 生命周期 | 11 | idle→playing, 4种游戏类型, addScore累加, incrementCombo, resetCombo, recordAnswer, endGame, pause/resume |
| useGameStore 完整流程 | 1 | 拼词大作战60秒模拟(对/对/对/错/对/对) |
| useGameStore getScore/getCombo | 2 | 空状态/活跃状态 |
| useSettingsStore 默认值 | 4 | accent='us', soundEnabled=true, animationEnabled=true, musicEnabled=false |
| useSettingsStore 切换 | 6 | toggleAccent(us↔uk), setAccent, toggleSound, toggleAnimation, toggleMusic, reset |
| useSettingsStore 持久化 | 1 | localStorage 写入验证 |

### 2.6 components.test.tsx — 组件渲染测试
**26 个用例全部通过**

| 组件 | 用例数 | 说明 |
|------|--------|------|
| GameCard | 8 | 4种游戏类型渲染、名称/图标/描述、最佳分数、已玩局数、统计区显示逻辑 |
| ComboIndicator | 5 | combo<2不渲染、combo≥2显示、GOOD!/GREAT!/PERFECT! 等级 |
| DifficultyBadge | 6 | 6种等级渲染、sm不显示中文、lg尺寸、showLabel=false |
| ErrorBoundary | 6 | 正常渲染、游戏/路由/fatal 错误捕获、自定义fallback |
| ResultPanel | 1 | 导入验证 |

---

## 3. 发现的问题

### 3.1 🐛 BUG：calculateSpeedBonus 未处理负数输入
- **文件**：`src/lib/scoring-engine.ts` → `calculateSpeedBonus()`
- **严重度**：低
- **描述**：当传入负数用时，`Math.max(0, (10 - (-1)) * 1)` 返回 11 而非 0
- **复现**：`calculateSpeedBonus(-1)` → 预期 0，实际 11
- **建议**：在函数开头添加 `if (answerTime < 0) return 0;`

### 3.2 🐛 BUG：语法题 g_a1_001 的 correction 不在 distractors 中
- **文件**：`src/data/grammar-questions.json` → id="g_a1_001"
- **严重度**：中
- **描述**：`correction="goes"` 不在 `distractors=["go","went","going"]` 中，导致前端无法渲染正确选项
- **建议**：将 distractors 改为 `["go","goes","went","going"]`

### 3.3 ⚠️ 覆盖缺口：C2 级别语法题缺失
- **文件**：`src/data/grammar-questions.json`
- **严重度**：中
- **描述**：词库中没有任何 level="C2" 的语法题目，C2 用户无法进行语法改错游戏
- **建议**：补充 10+ 道 C2 级别语法题（虚拟语气、倒装、习语等）

### 3.4 ⚠️ 数据偏差：B1 单词长度与设计文档不一致
- **文件**：`src/data/words.json` → B1 级别
- **严重度**：低
- **描述**：设计文档规定 B1 拼词 5-7 字母，但实际词库中 B1 单词为 8-9 字母（beautiful=9, important=9, adventure=9 等）
- **建议**：统一设计文档或词库数据

### 3.5 ⚠️ 覆盖缺口：useAuthStore 和 useProfileStore 未测试
- **描述**：这两个 Store 强依赖 Supabase Auth，在纯前端单元测试中无法模拟完整认证流程
- **建议**：通过集成测试或 E2E 测试覆盖

---

## 4. 覆盖缺口总结

| 缺口类型 | 模块 | 原因 | 建议 |
|----------|------|------|------|
| [数据问题] | C2语法题 | 词库缺失 | 补充 C2 级别语法题 |
| [数据问题] | B1单词长度 | 数据与设计不符 | 统一文档或数据 |
| [数据问题] | g_a1_001 distractors | correction 不在选项中 | 修复 distractors 数据 |
| [代码问题] | calculateSpeedBonus | 负数输入未处理 | 添加负数保护 |
| [覆盖缺口] | useAuthStore | 依赖 Supabase Auth | 需集成测试覆盖 |
| [覆盖缺口] | useProfileStore | 依赖 Supabase | 需集成测试覆盖 |
| [覆盖缺口] | API 接口 | 无后端接口 | 当前为纯前端项目 |
| [覆盖缺口] | Web Speech API | 浏览器 API | 需 E2E 测试覆盖 |
| [覆盖缺口] | 拖拽交互 | 复杂用户交互 | 需 E2E 测试覆盖 |

---

## 5. 建议

1. **优先修复**：BUG 3.1 (calculateSpeedBonus) 和 BUG 3.2 (distractors 数据)
2. **补充数据**：C2 语法题、C2 单词（当前词库也缺 C2 单词）
3. **数据对齐**：统一 B1 单词长度与设计文档要求
4. **后续测试**：增加 E2E 测试覆盖 Web Speech API 降级、拖拽交互、完整游戏流程
5. **测试基础设施**：当前 vitest.config 已就绪，`npm test` 可直接运行全量测试

---

## 6. 测试执行命令

```bash
# 运行全部测试
cd client && npm test

# 监听模式
npm run test:watch

# 带覆盖率
npm run test:coverage
```

---

> **测试文件清单**：
> - `tests/difficulty-engine.test.ts` — 33 用例
> - `tests/scoring-engine.test.ts` — 34 用例
> - `tests/word-utils.test.ts` — 30 用例
> - `tests/game-logic.test.ts` — 42 用例
> - `tests/stores.test.ts` — 25 用例
> - `tests/components.test.tsx` — 26 用例
