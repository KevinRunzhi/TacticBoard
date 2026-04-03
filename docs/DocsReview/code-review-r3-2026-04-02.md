# 代码审查 Round 3

日期：2026-04-02
审查范围：`tactics-canvas-24/src/` 全部源码（R2 修复后的第三轮全量审查）
对照来源：01-07 文档基线 + R1/R2 审查

---

## R2 修复确认

| R2 编号 | 问题 | 修复状态 |
|---|---|---|
| CR2-01 | `normalizeProjectName` 乱码检测散落多处 | ⚠️ 部分修复。新增了 `lib/project-name.ts` 统一工具，但 `DashboardV2.tsx` L45-51 和 `TacticsEditor.tsx` L152-156 仍保留了旧的 `includes('鏂板缓')` 内联检测——详见 [CR3-01](#cr3-01) |
| CR2-03 | `cloneStepFrame` 与 `cloneStep` 实现重复 | ⚠️ 部分修复。`cloneStepFrame` 已抽到 `lib/step-frame.ts` 并在 `useEditorState.ts` 和 `mockProjects.ts:cloneEditorState` (L170) 中使用，但 `mockProjects.ts` L151-163 仍保留了一个**未被引用的** `cloneStep` 本地函数——详见 [CR3-02](#cr3-02) |
| CR2-04 | 步骤缺少删除和重排操作 | ✅ 已实现 `deleteCurrentStep`、`duplicateCurrentStep`、`moveCurrentStep`，且 `BottomStepBar` 已自动传入，三态布局均已接入 |
| CR2-05 | 线路、文本、球员缺少添加/删除操作 | ✅ 全部补齐——详见下方功能覆盖度表 |
| CR2-06 | PitchCanvas 需要独立审查 | ✅ 已完成审查——详见本轮发现 |
| CR2-08 | mockTeams/mockTemplates 文件未删除 | ✅ 已删除，`data/` 目录下只剩 `mockData.ts` 和 `mockProjects.ts` |
| CR2-09 | totalBytes 计算不精确 | ✅ L802 已改为 `new Blob([key, value]).size`  |

---

## 新增功能确认

本轮发现以下新增功能实现（R2 之后新增）：

| 功能 | 实现状态 | 位置 |
|---|---|---|
| 球员添加（点击画布创建） | ✅ | `useEditorState.ts` L340-370, `PitchCanvas.tsx` L437-441 |
| 球员删除 | ✅ | `useEditorState.ts` L372-390, `RightPanel.tsx` L264 |
| 文本添加（点击画布创建） | ✅ | `useEditorState.ts` L392-416, `PitchCanvas.tsx` L453-457 |
| 文本编辑（内容/样式/坐标） | ✅ | `useEditorState.ts` L418-460, `RightPanel.tsx` L269-313 |
| 文本删除 | ✅ | `useEditorState.ts` L442-460, `RightPanel.tsx` L311 |
| 文本拖拽移动 | ✅ | `useEditorState.ts` L850-860, `PitchCanvas.tsx` L371-378, L403-405 |
| 线路添加（两点确认式） | ✅ | `useEditorState.ts` L462-493, `PitchCanvas.tsx` L459-471 |
| 线路属性编辑（类型/坐标） | ✅ | `useEditorState.ts` L495-517, `RightPanel.tsx` L316-363 |
| 线路删除 | ✅ | `useEditorState.ts` L519-537, `RightPanel.tsx` L361 |
| 线路选择（画布点击） | ✅ | `PitchCanvas.tsx` L389-393, L746-767 |
| 足球独立拖拽移动 | ✅ | `useEditorState.ts` L862-870, `PitchCanvas.tsx` L359-369, L411-413, L443-451 |
| 步骤复制（在当前步骤后插入副本） | ✅ | `useEditorState.ts` L751-776 |
| 步骤删除（≥2 步时可删） | ✅ | `useEditorState.ts` L778-797 |
| 步骤移动（左移/右移） | ✅ | `useEditorState.ts` L799-824 |
| `cloneStepFrame` 统一入 `lib/step-frame.ts` | ✅ | `lib/step-frame.ts` L7-19 |
| `normalizeProjectNameValue` 统一入 `lib/project-name.ts` | ✅ | `lib/project-name.ts` L9-21 |
| `EditorState` 新增 `selectedLineId` / `selectedTextId` | ✅ | `types/tactics.ts` L127-128 |
| 选择互斥（选任何一类对象自动取消其他三类） | ✅ | `useEditorState.ts` L233-271 |
| `renumberStepFrames` 自动重编标签 | ✅ | `useEditorState.ts` L71-76 |
| 画布球拖拽工具 (`ball`) | ✅ | `LeftPanel.tsx` L97, `PitchCanvas.tsx` L359-369, L443-451 |

---

## 新发现的问题

### Bug（运行时会出错或行为异常）

<a id="cr3-01"></a>
#### CR3-01 乱码检测逻辑三处不一致，`DashboardV2` 未使用统一函数

**文件：**
- `lib/project-name.ts` — 统一工具，使用 **精确匹配** `Set.has()`
- `TacticsEditor.tsx` L152-156 — 使用 **`includes('鏂板缓')`** 子串匹配
- `DashboardV2.tsx` L45-51 — 使用 **`includes('鏂板缓')`** 子串匹配

**问题：**
1. `lib/project-name.ts` 检测的是三个完整的乱码字符串（`Set.has`），但 `TacticsEditor.tsx` 和 `DashboardV2.tsx` 用的是 `includes('鏂板缓')` 部分匹配——行为不同。
2. `DashboardV2.tsx` L11 已经导入了 `normalizeProjectNameValue` 并在 L163、L356 使用了，但 L45-51 的 `normalizeProjectName` 函数是旧版逻辑的残留，目前没有被任何地方调用（搜索确认这个函数**未被使用**）。
3. `TacticsEditor.tsx` L152-156 先做了 `includes('鏂板缓')` 检测产出 `currentProjectName`，然后 L157 再对它调用 `normalizeProjectNameValue`。这导致了**双重过滤**：先用宽松条件过滤一遍，再用严格条件过滤一遍。虽然功能上兜底正确，但逻辑冗余且容易引起混乱。

**影响：** 低。功能上不会出错（双重过滤比单重更严），但代码可维护性差。

**修复建议：**
- 删除 `DashboardV2.tsx` L45-51 未使用的 `normalizeProjectName` 函数
- 将 `TacticsEditor.tsx` L152-156 简化为直接使用 `normalizeProjectNameValue(state.projectName)`

<a id="cr3-02"></a>
#### CR3-02 `mockProjects.ts` 中 `cloneStep` 本地函数已成为死代码

**文件：** `mockProjects.ts` L151-163

```ts
function cloneStep(step: StepFrame, index: number): StepFrame {
  // ... 与 lib/step-frame.ts 中的 cloneStepFrame 完全相同
}
```

**问题：**
- 这个函数在文件内**没有被任何位置调用**。所有引用都已改为导入的 `cloneStepFrame`（L12, L170, L221, L236, L244, L257, L517, L576）。
- 它是 R2 修复时的遗留产物。

**影响：** 无。纯死代码。

**修复建议：** 删除 L151-163。

#### CR3-03 `addPlayerAt` 创建球员的默认名是英文，与全中文 UI 不一致

**文件：** `useEditorState.ts` L348-356

```ts
const nextPlayer: Player = {
  id: createPlayerId(),
  number: teamCount + 1,
  name: `Player ${teamCount + 1}`,  // <-- 英文
  position: 'SUB',
  team,
  x,
  y,
};
```

**问题：**
- 整个应用 UI 是中文的（"球员属性"、"主队"、"客队"），但新添加的球员名称默认是英文 `Player N`。
- `mockData.ts` 中的预设球员都用中文名（张伟、李强...）。

**影响：** 低。不影响功能，但用户体验不一致。

**修复建议：** 改为 `name: \`球员 ${teamCount + 1}\`` 或 `name: \`球员${teamCount + 1}\``。

#### CR3-04 `addTextAt` 创建文本的默认内容是英文 `'Text'`

**文件：** `useEditorState.ts` L393-399

```ts
const nextText: TextNote = {
  id: createTextId(),
  text: 'Text',  // <-- 英文
  x,
  y,
  style: 'body',
};
```

**问题：** 同 CR3-03，与中文 UI 不一致。

**修复建议：** 改为 `text: '文本'`。

#### CR3-05 拖拽生命周期回调命名为 `onBeginPlayerMove` / `onEndPlayerMove` 但实际用于所有对象

**文件：** `PitchCanvas.tsx` L48-49, L354, L363, L375, L384, L421

```ts
// Props interface:
onBeginPlayerMove?: () => void;
onEndPlayerMove?: () => void;

// 实际使用：
handlePlayerMouseDown  → onBeginPlayerMove()    // 球员拖拽开始
handleBallMouseDown    → onBeginPlayerMove()    // 足球拖拽开始
handleTextMouseDown    → onBeginPlayerMove()    // 文本拖拽开始
handleAreaMouseDown    → onBeginPlayerMove()    // 区域拖拽开始
handleSvgMouseUp       → onEndPlayerMove()      // 任何对象拖拽结束
```

**问题：**
- 回调名称暗示只用于球员移动，但实际上用于**所有四种对象的拖拽**生命周期管理。
- `useEditorState.ts` 中 `beginPlayerMove` / `endPlayerMove` 的实现控制的是 `isDraggingPlayerRef`，它会**抑制自动保存**。这个抑制对 text、area、ball 拖拽同样生效——行为正确，但命名有误导性。

**影响：** 无功能影响。命名问题，可在重构时统一为 `onBeginDrag` / `onEndDrag`。

#### CR3-06 `handleBallMouseDown` 仅在 `currentTool === 'ball'` 时触发，但足球始终可见

**文件：** `PitchCanvas.tsx` L359-369

```ts
const handleBallMouseDown = (e: React.MouseEvent) => {
  if (spaceHeld || currentTool !== 'ball') return;  // <-- 必须是 ball 工具
  // ...
};
```

**问题：**
- 足球始终显示在画布上，但**只有切换到"足球"工具时才能拖动它**。如果当前工具是"选择"，点击足球没有反应。
- 对比：球员在"选择"工具下可以直接拖拽。
- 这是一个**设计选择**还是 bug 取决于文档要求。当前行为意味着用户如果想移动足球，必须先切到球工具，这增加了操作步骤。

**影响：** 低。不是 bug，但可能影响操作流畅度。

**建议：** 考虑在 `select` 工具下也允许拖拽足球，或至少在文档中明确这是预期行为。

---

### 逻辑隐患

#### CR3-07 `handleBgClick` 中 `ball` 工具的行为：点空白处移动球 vs 拖拽球的语义冲突

**文件：** `PitchCanvas.tsx` L443-451

```ts
if (currentTool === 'ball') {
  setPendingLineStart(null);
  onSelectPlayer(null);
  onSelectLine(null);
  onSelectText(null);
  onSelectArea(null);
  onMoveBall(point.x, point.y);  // <-- 点击空白处直接瞬移球
  return;
}
```

**问题：**
- 当 `currentTool === 'ball'` 时，既能拖拽球（通过 `handleBallMouseDown`），也能点空白处瞬移球。
- **但** `onMoveBall` 直接用 `setState` 而不是 `commitState`（L862-870），这意味着**点击空白处瞬移球不会产生 undo 历史记录**。
- 相比之下，球员拖拽通过 `beginPlayerMove` 手动推入 undo stack（L876）。但点击空白移球绕过了这个机制。

**影响：** 中。用户点击空白处移动足球后，无法撤销这个操作。

**修复建议：** 要么将 `moveBall` 改为使用 `commitState`（但会导致拖拽中每帧都推 undo），要么在 `handleBgClick` 中的球工具分支里手动调用 `beginPlayerMove` + `moveBall` + `endPlayerMove` 来确保单次点击也产生 undo 记录。

#### CR3-08 `movePlayer` / `moveText` / `moveArea` / `moveBall` 都使用 `setState` 而非 `commitState`

**文件：** `useEditorState.ts` L826-870

**问题：**
- 这四个 move 函数直接使用 `setState`（不推 undo），依赖 `beginPlayerMove` / `endPlayerMove` 的生命周期手动管理 undo。
- 这在**拖拽场景**下是正确的（拖拽开始时 push undo，中间帧不 push，拖拽结束后不需要额外 push）。
- 但 `handleBgClick` 中 `ball` 工具分支（L443-451）直接调用 `onMoveBall` 时**没有**触发 `beginPlayerMove/endPlayerMove` 生命周期。
- `handleBgClick` 中 `player` 工具分支（L437-441）调用的是 `onAddPlayer`，它使用 `commitState`，所以**自带 undo**。

**影响：** 同 CR3-07。球的单击移动缺少 undo。

#### CR3-09 `buildInitialSnapshot` 的 preset 入口只修改 home 队

**文件：** `useEditorState.ts` L116-139

```ts
if (seed?.presetId) {
  // ...
  const homePlayers = buildPlayersForFormation(formation, 'home');
  const step = blankState.steps[0];
  return {
    state: {
      ...blankState,
      steps: [{
        ...step,
        players: [...homePlayers, ...step.players.filter((player) => player.team === 'away')],
      }, ...blankState.steps.slice(1)],
    },
    // ...
  };
}
```

**问题：**
- 当通过快捷阵型入口创建新项目时，只为 home 队应用阵型，away 队保留 `blankState` 的球员。
- 但 `createBlankEditorState` 创建的空白状态 `steps[0].players` 是空数组（`createEmptyStep()` 返回 `players: []`），所以 `step.players.filter(p => p.team === 'away')` 结果为空。
- 因此最终视图只有 home 队球员，**没有 away 队**。

**影响：** 中偏低。通过快捷阵型入口进入编辑器时，只有一支队伍的球员显示在画布上。用户可能觉得困惑。

**修复建议：** 在 preset 入口也为 away 队构建默认球员：
```ts
const awayPlayers = buildPlayersForFormation(formation, 'away');
players: [...homePlayers, ...awayPlayers],
```

#### CR3-10 `applyFormation` 只影响当前步骤，不影响其他步骤

**文件：** `useEditorState.ts` L921-950

**问题：**
- `applyFormation` 只修改 `currentStepIndex` 对应的步骤，其他步骤的球员位置不变。
- 对比 `regenerateFieldFormat`（L641-684）会重建**所有步骤**。
- 这是**预期行为**——阵型应用只改当前步骤，制式切换重建全部。但应确认文档是否要求阵型应用影响所有步骤。

**影响：** 无（如果是预期行为的话）。

---

### 性能观察

#### CR3-11 `PitchCanvas` 的 `handleContainerMouseDown` 和 `handleSvgMouseDown` 职责重叠

**文件：** `PitchCanvas.tsx` L302-334 和 L487-500

**问题：**
- 容器层和 SVG 层都有 mousedown 处理，都会尝试启动 panning。
- 当 space 按住时，两个处理都会尝试 `setIsPanning(true)` 和设置 `panStart`。SVG 层会 `stopPropagation` 阻止冒泡，所以实际上两者不会同时触发。
- 但 SVG 层的条件判断（L496）非常长，包含了工具类型检测 (`currentTool !== 'zone' && !isLineTool && currentTool !== 'player' && currentTool !== 'ball' && currentTool !== 'text'`)，这与容器层的逻辑重复。

**影响：** 无功能影响。代码可读性问题。

---

## 功能覆盖度对照（更新版）

### 编辑器核心能力

| 对象 | 添加 | 移动 | 编辑属性 | 删除 | 选择 |
|---|---|---|---|---|---|
| Player | ✅ `addPlayerAt` | ✅ `movePlayer` | ✅ `updateSelectedPlayer` | ✅ `removeSelectedPlayer` | ✅ `selectPlayer` |
| Ball | — | ✅ `moveBall` | — | — | — |
| Line | ✅ `addLine` / `addLineFromTool` | ❌ (无拖拽移动) | ✅ `updateSelectedLine` | ✅ `removeSelectedLine` | ✅ `selectLine` |
| Text | ✅ `addTextAt` | ✅ `moveText` | ✅ `updateSelectedText` | ✅ `removeSelectedText` | ✅ `selectText` |
| Area | ✅ `addAreaAt` | ✅ `moveArea` | ✅ `updateSelectedArea` | ✅ `removeSelectedArea` | ✅ `selectArea` |

| 步骤操作 | 状态 |
|---|---|
| 添加步骤（末尾追加） | ✅ `addStep` |
| 复制步骤（在当前后插入） | ✅ `duplicateCurrentStep` |
| 删除步骤（≥2 步时） | ✅ `deleteCurrentStep` |
| 移动步骤（左/右） | ✅ `moveCurrentStep` |
| 切换步骤 | ✅ `setStep` |
| 播放/暂停 | ✅ `togglePlay` |

### 线路的"移动"说明

线路（TacticsLine）没有拖拽移动功能——这是合理的设计：线路是两点确定的矢量箭头，不是单点对象。用户可以通过 RightPanel 的坐标输入修改起点/终点位置。如果需要"拖拽移动线路"，需要实现整体平移（同时移动 from 和 to 坐标），当前版本未实现。

### 页面与壳层

| 功能 | 状态 |
|---|---|
| 工作台页面 | ✅ |
| 项目页面 | ✅ |
| 设置页面 | ✅ |
| 编辑器壳层（三态布局） | ✅ |
| 本地保存（草稿 + 正式） | ✅ |
| PNG 导出 | ✅ |
| GIF 导出 | ✅ |
| 导出配置对话框 | ✅ |
| 制式切换对话框 | ✅ |
| 参考底图生命周期 | ✅ |
| 撤销/重做 | ✅ |

---

## 建议优先级

| 优先级 | 编号 | 问题 | 工作量 |
|---|---|---|---|
| 🟡 **中** | CR3-07 / CR3-08 | 足球单击移动缺少 undo 记录 | 小 |
| 🟡 **中** | CR3-09 | preset 入口只有 home 队球员 | 小 |
| 🟢 **低** | CR3-01 | 乱码检测三处不一致 + DashboardV2 死函数 | 极小 |
| 🟢 **低** | CR3-02 | `cloneStep` 死函数残留 | 极小 |
| 🟢 **低** | CR3-03 | 新球员默认名英文 | 极小 |
| 🟢 **低** | CR3-04 | 新文本默认内容英文 | 极小 |
| 🟢 **低** | CR3-05 | 拖拽回调命名 | 重构 |
| 🟢 **低** | CR3-06 | 足球只能用 ball 工具拖拽 | 设计决策 |
| ⚪ **优化** | CR3-11 | 容器/SVG 双层 mousedown 处理重叠 | 重构 |

---

## 总结

### 与 R2 对比的进展

| 维度 | R2 状态 | R3 状态 |
|---|---|---|
| 编辑对象 CRUD 覆盖 | 只有 Area 完整 | **Player / Ball / Line / Text / Area 全部覆盖** |
| 步骤管理 | 只有添加和切换 | **添加 / 复制 / 删除 / 移动全部实现** |
| 选择互斥 | 只有 Player / Area | **Player / Line / Text / Area 四类互斥** |
| 拖拽对象类型 | Player / Area | **Player / Ball / Text / Area 四类** |
| 死代码 | mockTeams.ts / mockTemplates.ts 残留 | **已删除** |
| 工具库统一 | 乱码检测散落、cloneStep 重复 | `project-name.ts` / `step-frame.ts` 已创建（少量残留） |

### 当前状态评价

代码已经完成了**编辑器核心功能的全面覆盖**。R2 报告中的高优先级问题（CR2-04、CR2-05）全部解决。剩余问题主要是：
1. **两个中等 bug**：足球单击移动缺 undo、preset 入口缺 away 队
2. **少量死代码和命名不一致**：不影响功能

架构层面，代码质量从 R1 到 R3 有了显著提升。编辑器的对象模型完整度已经可以支撑 V1 基线交付。
