# 代码审查 Round 6 — 全量代码审查 + 浏览器实测

日期：2026-04-14
审查范围：`tactics-canvas-24/src/` 全部源码 + 浏览器高强度用户模拟测试
对照来源：R5 审查文档 + 浏览器实测

---

## 审查方法

1. **静态代码审查**：逐文件比对 R5 以来的变更
2. **浏览器实测**：启动 `npm run dev`，在浏览器中模拟高强度用户操作：
   - 工作台 → 新建空白项目 → 编辑器全功能验证
   - 添加球员（主/客队）、文本、足球、区域、线路
   - 步骤管理（添加/删除）
   - 撤销/重做
   - 保存 → 返回工作台 → 重新打开已保存项目
   - 快捷阵型入口（4-3-3 preset）

---

## 代码变更摘要（R5 → R6）

| 变更 | 位置 | 说明 |
|---|---|---|
| 重构 `buildInitialSnapshot` 项目加载 | `useEditorState.ts` L84-106 | 移除 `getMockProjectById` + `createEditorStateFromProject`，改用 `loadProjectEditorState` 直读 |
| 新增 `loadProjectEditorState` 函数 | `mockProjects.ts` L593-602 | 从项目记录直接加载 `EditorState`，无需中间 `MockProject` 模型 |
| 引入 `getGifConstraintMessage` | `TacticsEditor.tsx` L18 | 新增 GIF 约束提示工具函数导入 |
| 移除 `createEditorStateFromProject` 导入 | `useEditorState.ts` L22 | 不再从 `mockProjects` 导入此函数 |

### R5 修复追踪

| R5 编号 | 状态 |
|---|---|
| CR3-04 (`addTextAt` 英文 `'Text'`) | ❌ 仍未修复 |
| CR5-01 (TacticsEditor 冗余乱码检测) | ❌ 仍未修复 |
| CR5-02 (DashboardV2 死函数) | ❌ 仍未修复 |
| CR3-02 (mockProjects `cloneStep` 死函数) | ❌ 仍未修复 |
| CR5-04 (`playerPlacementTeam` 触发 autosave) | ❌ 仍未修复 |

---

## 新发现的问题

### CR6-01 🔴 `project?.space` 引用未定义变量 — 编译通过但逻辑错误

**严重度：🔴 高（变量引用错误，当前被可选链掩盖）**

**文件：** `useEditorState.ts` L88-93

```ts
if (savedState) {
  return {
    state: {
      ...savedState,
      space: savedState.space ?? project?.space ?? workspace,  // ← BUG
    },
    entrySource: 'project-draft',
  };
}
```

**问题：**

- `project` 变量**不存在于 `buildInitialSnapshot` 函数作用域中**。
- 在 R5 之前，这里是 `const project = getMockProjectById(projectId)` 获取的局部变量。R6 重构移除了该行，改为 `loadProjectEditorState(projectId)`，但忘了更新 L90 处的引用。
- TypeScript 编译通过是因为 `project?.space` 的 `?.` 操作符在 `project` 为 `undefined` 时静默返回 `undefined`，然后 `?? workspace` 兜底。
- **当前不会崩溃**，但代码意图是"优先用 savedState 的 space，其次用 project record 的 space，最后用默认 workspace"——中间那层 fallback 已经失效。

**实际运行时影响：**

- 如果用户打开一个**有 draft 的已保存项目**，且 draft 的 `space` 字段为 `null/undefined`，本应从 project record 读取 space 值。但现在这个中间 fallback **完全空转**，直接跳到 `workspace` 默认值。
- 由于 `workspace` 固定为 `'personal'`，且 `savedState.space` 在 `normalizeEditorState` 中被设为 `'personal'`，所以**当前实际不会到达 `project?.space`**——但这是一个明确的逻辑漏洞。

**修复建议：**

```ts
const savedState = loadSavedEditorState(projectId);
if (savedState) {
  const projectState = loadProjectEditorState(projectId);
  return {
    state: {
      ...savedState,
      space: savedState.space ?? projectState?.space ?? workspace,
    },
    entrySource: 'project-draft',
  };
}
```

或更简洁地直接使用 `workspace`：
```ts
space: savedState.space ?? workspace,
```

---

### CR6-02 线路工具交互存在可用性问题

**严重度：🟡 中（功能可用但用户难以发现正确操作方式）**

**浏览器测试发现：**

在测试中，线路工具（跑位线路）需要**两次点击**（起点 + 终点）来创建一条线。测试者尝试了多次点击才成功创建一条线路。

**原因分析：** `PitchCanvas.tsx` L473-484 的线路创建逻辑要求用户先点击空白区域设置起点（存入 `pendingLineStart`），然后再点击第二个点。但如果第一次点击时**命中了球员、文本或其他对象**（因为 `stopPropagation`），起点不会被设置，用户会误以为工具没反应。

**建议改进：**
- 添加视觉指引：当 `pendingLineStart` 存在时，在画布上显示一个起点标记（如闪烁的小圆点）
- 或在工具栏区域显示提示文字："请点击球场选择起点"→"请点击球场选择终点"

---

## 浏览器实测结果

### 测试矩阵

| 测试项 | 结果 | 备注 |
|---|---|---|
| 工作台加载 | ✅ | 三个入口卡片正常，布局完整 |
| 新建空白项目 | ✅ | 编辑器加载无报错 |
| 添加球员（主队） | ✅ | 名称"主队球员 1"，蓝色 |
| 切换客队 + 添加球员 | ✅ | 名称"客队球员 1"，红色 |
| 添加足球 | ✅ | 球工具点击移动足球 |
| 添加文本 | ✅ | 功能正常，**但默认文本为英文 `Text`** |
| 添加区域 | ✅ | 矩形区域正常渲染 |
| 添加线路 | ⚠️ | 功能可用但需两次精确点击，用户引导不足 |
| 步骤添加/删除 | ✅ | +按钮和删除均正常 |
| 撤销/重做 | ✅ | 按钮响应正确 |
| 保存项目 | ✅ | Toast 提示正常 |
| 返回工作台 | ✅ | 返回通知卡片显示"已保存并返回工作台" |
| 重新打开已保存项目 | ✅ | 所有对象（球员、文本、区域）完整保留 |
| 快捷阵型 4-3-3 | ✅ | 11 名球员正确排列，中文名称 |
| 控制台错误 | ✅ | 全程无 JS 运行时错误 |

### 测试截图确认

- 编辑器中可见：两名球员（蓝+红）、足球、"Text" 文本标注、蓝色矩形区域 ✅
- 工作台中可见：刚保存的项目卡片带"刚保存"标签、6 个正式项目 ✅
- 4-3-3 快捷入口正常跳转到编辑器 ✅

---

## 综合问题优先级表

### 功能性 Bug

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🔴 高 | **CR6-01** | `project?.space` 引用未定义变量（`buildInitialSnapshot` 重构遗漏） | R6 | 1 行 |
| 🟡 中 | CR3-07/08 | 足球单击移动不产生 undo 记录 | R3 | 小 |
| 🟡 中 | CR6-02 | 线路工具交互可用性问题（缺视觉引导） | R6 | 中 |

### 中文化 / UI 打磨

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟢 低 | CR3-04 | `addTextAt` 默认文本仍为英文 `'Text'` | R3 | 1 行 |

### 代码卫生

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟢 低 | CR5-01 | TacticsEditor L153-157 冗余乱码检测 | R5 | 删 5 行 |
| 🟢 低 | CR5-02 | DashboardV2 `normalizeProjectName` 死函数 | R5 | 删 7 行 |
| 🟢 低 | CR3-02 | mockProjects `cloneStep` 死函数 | R3 | 删 12 行 |
| 🟢 低 | CR4-01 | `removeSelectedArea` 缺 length 短路保护 | R4 | 1 行 |
| ⚪ 优化 | CR5-04 | `playerPlacementTeam` 触发不必要的 autosave | R5 | 删 1 行 |

---

## R3→R6 修复追踪汇总

| 编号 | 问题 | R3 | R4 | R5 | R6 |
|---|---|---|---|---|---|
| CR3-01 | 乱码检测不一致 | ❌ | ❌ | ❌ | ❌ |
| CR3-02 | `cloneStep` 死函数 | ❌ | ❌ | ❌ | ❌ |
| CR3-03 | 新球员默认名英文 | ❌ | ❌ | ✅ | ✅ |
| CR3-04 | 新文本默认名英文 | ❌ | ❌ | ❌ | ❌ |
| CR3-07/08 | ball undo 缺失 | ❌ | ❌ | ❌ | ❌ |
| CR3-09 | preset 只建 home | ❌ | ❌ | ⚠️设计变更 | ⚠️设计变更 |
| CR4-01 | removeArea 缺保护 | — | ❌ | ❌ | ❌ |
| CR4-02 | presetId 类型不匹配 | — | ❌ | ✅ | ✅ |
| CR4-05 | Ghost trail 空转 | — | ❌ | ❌ | ❌ |
| CR5-01 | 冗余乱码检测 | — | — | ❌ | ❌ |
| CR5-02 | Dashboard 死函数 | — | — | ❌ | ❌ |
| CR5-04 | placement team autosave | — | — | ❌ | ❌ |
| **CR6-01** | **`project?.space` 引用未定义** | — | — | — | **🔴 新增** |
| **CR6-02** | **线路工具可用性** | — | — | — | **🟡 新增** |

---

## 总结

### 整体评估

**应用核心流程已稳定。** 经浏览器高强度实测验证：

- ✅ 新建→编辑→保存→重新打开的完整闭环正常
- ✅ 全部 5 种编辑对象（球员/足球/文本/线路/区域）均可创建和操作
- ✅ 步骤管理完整可用
- ✅ 撤销/重做功能正常
- ✅ 阵型快捷入口正常
- ✅ 全程无 JS 运行时错误

### 必须立即修复

**CR6-01**（`project?.space` 引用未定义变量）—— 这是 R6 重构引入的回归 bug，虽然当前不会崩溃（被 `?.` 和 `??` 双重掩盖），但属于逻辑错误，应在合入前修复。修复方式为改为 `loadProjectEditorState(projectId)?.space` 或直接移除该 fallback。

### 建议顺带清理

- `addTextAt` 默认文本改为中文（`'文本'`）—— 1 行
- 删除 `TacticsEditor` L153-157 冗余乱码检测 —— 5 行
- 删除 `DashboardV2.normalizeProjectName` 死函数 —— 7 行
- 删除 `mockProjects.cloneStep` 死函数 —— 12 行

**以上全部加起来约 25 行改动，建议一次性清理完毕。**
