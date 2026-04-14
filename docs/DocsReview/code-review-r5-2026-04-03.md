# 代码审查 Round 5

日期：2026-04-03
审查范围：`tactics-canvas-24/src/` 全部源码——R4 后续复检
对照来源：R4 审查文档 + 01-07 文档基线

---

## 代码变更概要

对比 R4，本轮检测到以下**实质性变更**：

### 新增/重构

| 变更 | 位置 | 说明 |
|---|---|---|
| 新增 `EditorPreferences` 系统 | `lib/editor-preferences.ts` (96行) | 5 项首选项（制式、球场风格、球员风格、导出格式、导出清晰度），localStorage 持久化 |
| 设置页功能化 | `pages/SettingsV2.tsx` (440行) | 显示偏好和导出偏好现在可实际修改，存入 `editor-preferences` |
| `playerPlacementTeam` 字段 | `tactics.ts` L126 + `useEditorState.ts` + LeftPanel + MobileToolbar | 新增"新增球员默认队伍"选择器（主队/客队），替代原先的自动分配逻辑 |
| `createBlankEditorState` 使用偏好 | `mockProjects.ts` L542 | 新建项目时从 `editor-preferences` 读取默认制式、风格等 |
| `createDefaultExportConfig` 使用偏好 | `export-config.ts` L22 | 导出对话框默认值来自 `editor-preferences` |

### 修复项（对比 R3/R4 issues）

| R3/R4 编号 | 状态 | 说明 |
|---|---|---|
| CR3-03 | ✅ 已修复 | `addPlayerAt` L359 default name 改为中文 `${team === 'home' ? '主队' : '客队'}球员 ${teamCount + 1}` |
| CR3-09 | ⚠️ 设计变更 | preset/formation 入口现在**有意只建 home 队**，配合手动切换 `playerPlacementTeam` 使用（见下方分析） |
| CR4-02 | ✅ 已修复 | `EditorSeed.presetId` 已改为 `string \| null`（L56），类型一致 |

### 未修复项

| R3/R4 编号 | 状态 |
|---|---|
| CR3-01 | ❌ `DashboardV2.normalizeProjectName` 死函数（但内容已从 `鏂板缓` 改为 `新建`） |
| CR3-02 | ❌ `mockProjects.ts` `cloneStep` 死函数残留 |
| CR3-04 | ❌ `addTextAt` L404 default text 仍为英文 `'Text'` |
| CR3-07/08 | ❌ ball tool 单击移动无 undo 记录 |
| CR4-01 | ❌ `removeSelectedArea` 缺少 length 短路保护 |
| CR4-03 | ❌ `buildInitialSnapshot` 首次 mount 执行两次 |
| CR4-04 | ❌ `addTextAt`/`addLine`/`addAreaAt` 在 `commitState` 外创建对象 |
| CR4-05 | ❌ Ghost trail 功能空转 |

---

## 新发现的问题

### CR5-01 `TacticsEditor` 中乱码检测逻辑冗余且存在功能漏洞

**严重度：🟢 低（代码冗余 + 逻辑错误，但被下游 normalize 覆盖）**

**文件：** `TacticsEditor.tsx` L153-158

```ts
const currentProjectName = !state.projectName.trim()
    ? '新建战术板'
    : state.projectName.includes('鏂板缓')
      ? '新建战术板'
      : state.projectName;
const displayProjectName = normalizeProjectNameValue(currentProjectName);
```

**问题：**

1. 这段手动检测 `includes('鏂板缓')` 的逻辑**与下游 `normalizeProjectNameValue()` 完全重复**。`normalizeProjectNameValue` 已经处理了空值和 legacy 乱码名。
2. 手动检测只覆盖了一种乱码模式 `'鏂板缓'`，而 `project-name.ts` 覆盖了三种（`'閺傛澘缂?'`, `'鏂板缓鎴樻湳鏉?'`, `'鏂板缓鎴樻湳鏉�'`）。
3. 至关重要的是：**`includes('鏂板缓')` 使用的是子串匹配**，而 `normalizeProjectNameValue` 使用的是**精确 Set 匹配**。这意味着如果用户的项目名碰巧包含 `'鏂板缓'` 子串但不完全等于 Set 中的任何值，手动检测会把它改成 `'新建战术板'`，但 `normalizeProjectNameValue` 不会。最终因为 `normalizeProjectNameValue` 是最后一道处理，所以不会造成实际 bug——但前置的手动逻辑仍然是多余的。

**修复建议：** 删除 L153-157，直接使用：
```ts
const displayProjectName = normalizeProjectNameValue(state.projectName);
```

---

### CR5-02 `DashboardV2.normalizeProjectName` 死函数修改后引入假阳性逻辑

**严重度：⚪ 代码质量（死代码，不影响运行时）**

**文件：** `DashboardV2.tsx` L45-51

```ts
function normalizeProjectName(name: string) {
  if (!name.trim()) {
    return '新建战术板';
  }
  return name.includes('新建') ? '新建战术板' : name;
}
```

**问题：**

1. 该函数从未被任何代码调用（死代码），DashboardV2 中实际使用的是 L163/L356 的 `normalizeProjectNameValue`。
2. L50 的 `name.includes('新建')` 会将任何包含 `'新建'` 子串的合法项目名（如 `"新建的进攻战术"`）错误地替换为 `'新建战术板'`——但因为是死代码所以不会触发。
3. 该函数与 `project-name.ts` 的职责完全重叠。

**修复建议：** 直接删除 L45-51 的整个函数。

---

### CR5-03 `applyFormation` 和 `regenerateFieldFormat` 只构建 home 队——away 球员被清空

**严重度：🟡 中（功能行为变更，可能不符合用户预期）**

**文件：** `useEditorState.ts`

```ts
// applyFormation L934
currentStep.players = buildPlayersForFormation(formation, 'home');

// regenerateFieldFormat L666
players: buildPlayersForFormation(defaultFormation, 'home'),
```

**分析：**

这两处之前各自构建了 `[...home, ...away]` 两支球队，R5 中改为只构建 home 队。这的确和新增的 `playerPlacementTeam` 机制一致——用户可以切换到 away 队手动添加球员。

但是，以下场景可能不符合预期：

| 场景 | 行为 | 用户体验 |
|---|---|---|
| 用户在 LeftPanel 点击某个阵型 | **所有现有球员（包括 away）被替换为纯 home 阵型** | away 球员突然消失，用户可能困惑 |
| 用户切换制式并选择"重新生成球员" | 同上，只生成 home | 已有的 away 球员被清除 |

同时 `applyFormation` 还会重置 `currentStep.lines/texts/areas`（L935-937），所以这是一个**全步骤重置**操作，away 球员消失可以算是该操作的副作用。

**标记为设计决策，非 bug。但建议以下改进：**
- 在 UI 层（阵型面板点击时）增加文字提示："应用阵型会替换当前步骤的全部球员和线路。"
- 或：`applyFormation` 只替换 `team === state.playerPlacementTeam` 的球员，保留另一队。

---

### CR5-04 `playerPlacementTeam` 进入 autosave 依赖列表——切换队伍选择器会触发 autosave

**严重度：🟢 低**

**文件：** `useEditorState.ts` L203-218

```ts
  }, [
    dragAutosaveRevision,
    projectId,
    state.currentStepIndex,
    state.fieldFormat,
    // ...
    state.playerPlacementTeam,  // ← L212
    // ...
    state.steps,
  ]);
```

**问题：**

`playerPlacementTeam` 只是一个 UI 控件状态（选择下次添加球员属于哪个队），不是项目内容数据。将它放入 autosave 依赖意味着：

- 用户每次在 LeftPanel 或 MobileToolbar 切换"主队/客队"时，都会触发 1.5s 防抖的 `saveDraftState`。
- 产生不必要的 localStorage 写入。

**修复建议：** 从 autosave 依赖数组中移除 `state.playerPlacementTeam`。`playerPlacementTeam` 仍然会被保存到草稿中（因为它是 `EditorState` 的一部分，`saveDraftState` 序列化整个 state），它只是不需要*触发*保存。

---

### CR5-05 `clearAllLocalProjectData` 清除了 `editor-preferences` 键——设置偏好不应被项目清理删除

**严重度：🟢 低（设计决策边界问题）**

**文件：** `mockProjects.ts` L341-363

```ts
function getManagedProjectStorageKeys() {
  // ...
  if (
    key === PROJECT_INDEX_KEY ||
    key === PROJECT_STORAGE_READY_KEY ||
    key === NEW_PROJECT_DRAFT_KEY ||
    key === EDITOR_PREFERENCES_STORAGE_KEY ||  // ← L353
    key === WORKSPACE_STORAGE_KEY ||
    key.startsWith(PROJECT_STORAGE_PREFIX) ||
    key.startsWith(PROJECT_DRAFT_PREFIX)
  ) {
    keys.push(key);
  }
}
```

**问题：**

- `EDITOR_PREFERENCES_STORAGE_KEY`（`tactics-canvas:preferences:v1`）被列入 "managed project storage keys"。
- 当用户在设置页点击"清除所有本地数据"时，`clearAllLocalProjectData` 会删除 `editor-preferences`，导致用户自定义的显示偏好（默认制式、球场风格等）一并被重置。
- 设置页 L95 用 `getEditorPreferences()` 重新读取，得到的是 defaults，UI 不会错误——但**用户的偏好设置丢失了**。
- Settings 页描述为"清除项目、草稿和设置"，所以从文案角度看包含 preferences 是合理的。但如果用户只想清理项目数据、保留自己的显示偏好，当前无法做到。

**标注为设计决策。若需区分：** 从 `getManagedProjectStorageKeys` 中移除 `EDITOR_PREFERENCES_STORAGE_KEY`。

---

## 综合问题优先级表

### 功能性 Bug

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟡 中 | CR3-07/08 | 足球单击移动（ball 工具）不产生 undo 记录 | R3 | 小 |
| 🟡 中 | CR5-03 | `applyFormation`/`regenerateFieldFormat` 清空 away 球员（标记为设计决策） | R5 | 中（如需修复） |
| 🟢 低 | CR4-01 | `removeSelectedArea` 缺少 length 短路保护 | R4 | 极小 |

### 中文化遗漏

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟢 低 | CR3-04 | `addTextAt` default text 仍为英文 `'Text'` | R3 | 极小 |

### 代码卫生

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟢 低 | CR5-01 | `TacticsEditor` 乱码检测冗余与 `normalizeProjectNameValue` 重复 | R5 | 极小 |
| 🟢 低 | CR5-02 | `DashboardV2.normalizeProjectName` 死函数 | R3→R5 | 极小 |
| 🟢 低 | CR3-02 | `mockProjects.ts` `cloneStep` 死函数 | R3 | 极小 |
| 🟢 低 | CR5-04 | `playerPlacementTeam` 不应触发 autosave | R5 | 极小 |

### 设计决策

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| ⚪ 评审 | CR5-05 | `clearAllLocalProjectData` 连同 preferences 一起清除 | R5 | 极小 |
| ⚪ 优化 | CR4-05 | Ghost trail 导出开关功能空转 | R4 | 中 |

---

## R3→R5 修复闭环追踪

| 编号 | 问题 | R3 | R4 | R5 |
|---|---|---|---|---|
| CR3-01 | 乱码检测不一致 | ❌ | ❌ | ❌（文案微调但本质不变） |
| CR3-02 | `cloneStep` 死函数 | ❌ | ❌ | ❌ |
| CR3-03 | 新球员默认名英文 | ❌ | ❌ | ✅ 中文化 |
| CR3-04 | 新文本默认名英文 | ❌ | ❌ | ❌ |
| CR3-05 | `onBeginPlayerMove` 命名 | ❌ | ❌ | ❌（命名未改） |
| CR3-07/08 | ball 工具单击无 undo | ❌ | ❌ | ❌ |
| CR3-09 | preset 只建 home | ❌ | ❌ | ⚠️ 设计变更 |
| CR4-01 | `removeSelectedArea` 缺保护 | — | ❌ | ❌ |
| CR4-02 | `presetId` 类型不匹配 | — | ❌ | ✅ |
| CR4-03 | `buildInitialSnapshot` 双执行 | — | ❌ | ❌ |
| CR4-04 | 对象创建位置不一致 | — | ❌ | ❌ |
| CR4-05 | Ghost trail 空转 | — | ❌ | ❌ |

---

## 总结

### 积极变化

1. **`EditorPreferences` 系统完整落地**——`editor-preferences.ts` + SettingsV2 + `createBlankEditorState` + `createDefaultExportConfig`，闭环可用。
2. **`playerPlacementTeam` 机制**完整接入 Desktop/Tablet/Mobile 三态布局，用户可以控制新增球员归属哪个队。
3. **CR3-03 修复**——新球员名称已中文化。
4. **CR4-02 修复**——`EditorSeed.presetId` 类型修正为 `string | null`。

### 剩余最高优先级

1. **CR3-07/08**（ball 工具 undo 缺失）—— 唯一一个真正的功能 bug，3 行代码可修。
2. **CR3-04**（`addTextAt` default text 英文 `'Text'`）—— 1 行代码。
3. **CR5-01**（TacticsEditor 冗余乱码检测）—— 删除 5 行代码。
4. **CR5-02 + CR3-02**（两处死函数）—— 各删一个函数。

以上 5 项加起来不超过 15 行改动，建议一次性清理。
