# 代码审查 Round 4

日期：2026-04-02
审查范围：`tactics-canvas-24/src/` 全部源码——R3 后续全量复检
对照来源：R3 审查文档 + 01-07 文档基线

---

## 审查结论

经全量逐文件比对，核心源码（`useEditorState.ts`、`mockProjects.ts`、`TacticsEditor.tsx`、`PitchCanvas.tsx`、`types/tactics.ts`、`lib/step-frame.ts`、`lib/project-name.ts`、`data/mockData.ts`）内容与 R3 审查时**完全一致**。以下所有文件也确认无变化：`Index.tsx`、`DashboardV2.tsx`、`ProjectsV2.tsx`、`SettingsV2.tsx`、`BottomStepBar.tsx`、`LeftPanel.tsx`、`RightPanel.tsx`、`MobileStepsDrawer.tsx`、`ExportConfigDialog.tsx`、`export-config.ts`、`tactics-export.ts`、`workspace.ts`。

**R3 提出的全部问题均未修复。**

本轮在更深层次审查中发现了 R3 遗漏的 **4 个新问题**。

---

## R3 遗留问题追踪

| R3 编号 | 问题 | 当前状态 |
|---|---|---|
| CR3-01 | 乱码检测逻辑三处不一致，`DashboardV2.normalizeProjectName` 死函数 | ❌ 未修复 |
| CR3-02 | `mockProjects.ts` 中 `cloneStep` 死函数残留 | ❌ 未修复 |
| CR3-03 | `addPlayerAt` 默认名英文 `Player N` | ❌ 未修复 |
| CR3-04 | `addTextAt` 默认内容英文 `Text` | ❌ 未修复 |
| CR3-05 | 拖拽回调命名 `onBeginPlayerMove` 但实际管理所有对象 | ❌ 未修复（命名问题） |
| CR3-06 | 足球只能在 ball 工具下拖拽 | ❌ 未修复（设计决策） |
| CR3-07/08 | 足球单击移动缺少 undo 记录 | ❌ 未修复 |
| CR3-09 | preset 入口只生成 home 队球员，away 队为空 | ❌ 未修复 |

---

## 新发现的问题（R3 遗漏）

### CR4-01 `removeSelectedArea` 缺少"未实际删除"的短路保护

**文件：** `useEditorState.ts` L593-608

```ts
const removeSelectedArea = useCallback(() => {
    commitState((currentState) => {
      if (!currentState.selectedAreaId) return currentState; // ← 仅检查选中态
      // ...
      nextStep.areas = (nextStep.areas ?? []).filter(
        (area) => area.id !== currentState.selectedAreaId
      );
      // ← 缺少: if (filtered.length === original.length) return currentState;
      nextSteps[currentState.currentStepIndex] = nextStep;
      return { ...currentState, selectedAreaId: null, steps: nextSteps };
    });
  }, [commitState]);
```

**对比其他三个 remove 函数：**

| 函数 | 删除前检查 `length` 是否变化 |
|---|---|
| `removeSelectedPlayer` (L372-390) | ✅ L379: `if (filteredPlayers.length === nextStep.players.length) return currentState;` |
| `removeSelectedText` (L442-460) | ✅ L449: `if (filteredTexts.length === nextStep.texts.length) return currentState;` |
| `removeSelectedLine` (L519-537) | ✅ L526: `if (filteredLines.length === nextStep.lines.length) return currentState;` |
| **`removeSelectedArea` (L593-608)** | ❌ 无此检查 |

**影响：**

- 当 `selectedAreaId` 指向一个在**当前步骤**中不存在的区域对象（例如切步骤后选择态残留），调用 `removeSelectedArea` 仍会执行 `commitState`，产出一条空 undo 记录。
- 同时 `selectedAreaId` 被清为 `null`，虽然最终结果可接受，但 undo 栈里多了一条无意义的快照。

**修复建议：** 在 `nextStep.areas = ...filter(...)` 之后增加一行：
```ts
if (nextStep.areas.length === (currentState.steps[currentState.currentStepIndex].areas ?? []).length) return currentState;
```

---

### CR4-02 `Index.tsx` 向 `TacticsEditor` 传递 `presetId={null}` 存在类型不匹配

**文件：** `Index.tsx` L12, L45

```ts
// Index.tsx
const presetId = searchParams.get('presetId'); // → string | null

// ...
<TacticsEditor
  projectId={projectId}
  presetId={presetId}  // ← string | null 传给 presetId?: string
  mode={mode}
/>
```

**文件：** `TacticsEditor.tsx` L34-38

```ts
interface TacticsEditorProps {
  projectId?: string;
  presetId?: string;   // ← 声明为 optional string，不含 null
  mode?: EditorEntryMode;
}
```

**问题：**
- `searchParams.get()` 返回 `string | null`，但 `TacticsEditorProps.presetId` 类型是 `string | undefined`（optional，不含 `null`）。
- 如果 TypeScript `strictNullChecks` 开启，这会产生类型错误：`Type 'string | null' is not assignable to type 'string | undefined'`。
- **运行时不受影响**——`null` 在下游的 `seed?.presetId ?? null` 判断中能正确处理。但这是一个潜在的编译隐患。

**修复建议：**
方案 A：在 `Index.tsx` 中写 `presetId={presetId ?? undefined}`。
方案 B：将 `TacticsEditorProps.presetId` 改为 `presetId?: string | null`。

---

### CR4-03 `useEditorState` 首次渲染时 `buildInitialSnapshot` 被执行两次

**文件：** `useEditorState.ts` L161-181

```ts
// 第一次：同步初始化 ref（render 阶段）
const initialSnapshotRef = useRef<InitialEditorSnapshot | null>(null);
if (!initialSnapshotRef.current) {
  initialSnapshotRef.current = buildInitialSnapshot(projectId, workspace, mode, seed);
}
const [state, setState] = useState(() => initialSnapshotRef.current?.state ?? ...);

// 第二次：useEffect 在 mount 时触发（commit 阶段）
useEffect(() => {
  const nextSnapshot = buildInitialSnapshot(projectId, workspace, mode, normalizedSeed);
  setState(nextSnapshot.state);
  // ...
}, [mode, normalizedSeed, projectId, workspace]);
```

**问题：**
- 组件首次 mount 时，`buildInitialSnapshot` 在 ref 初始化时执行一次，在 `useEffect` 中**再执行一次**。
- `buildInitialSnapshot` 内部会调用 `loadSavedEditorState` → `ensureProjectStorage` → 多次 `localStorage` 读写。
- 第二次执行的 `setState` 会触发一次不必要的 re-render（state 值相同时 React 会 bail out，但这取决于对象引用是否相同——这里每次都创建新对象，所以 **会触发 re-render**）。

**影响：** 低。性能浪费（双倍 localStorage 读取 + 一次无意义 re-render），但不会导致错误行为。

**修复建议：** 在 `useEffect` 中增加首次跳过逻辑：
```ts
const isFirstMount = useRef(true);
useEffect(() => {
  if (isFirstMount.current) {
    isFirstMount.current = false;
    return;
  }
  // ... rebuild snapshot
}, [mode, normalizedSeed, projectId, workspace]);
```

---

### CR4-04 `addTextAt` 和 `addLine` 在 `commitState` 外部创建对象——闭包时机安全但模式不一致

**文件：** `useEditorState.ts`

| 函数 | 对象创建位置 | 是否在 commitState 内部 |
|---|---|---|
| `addPlayerAt` (L340-370) | 内部 | ✅ |
| `addTextAt` (L392-416) | **外部** L393-399 | ❌ |
| `addLine` (L462-487) | **外部** L463-470 | ❌ |
| `addAreaAt` (L539-567) | **外部** L540-550 | ❌ |

**问题：**
- `addPlayerAt` 在 `commitState` 回调内部创建新对象（L341-356），这保证了 ID 生成和 state 读取在同一个事务中。
- `addTextAt`、`addLine`、`addAreaAt` 在 `commitState` 外部创建对象。`nextText`/`nextLine`/`nextArea` 的 ID 在调用时就已确定，然后传入闭包。

**运行时是否有 bug？**

**目前没有。** 原因是：
1. ID 用 `Date.now()` + `Math.random()` 生成，碰撞概率极低。
2. 即使快速连续调用，React 的 batching 机制保证 `commitState` 内的 `setState` 是序列化的，对象不会丢失。
3. 但如果未来某个场景需要在 `commitState` 内读取 `currentState` 来决定新对象的属性（例如根据已有文本数量自动编号），外部创建的模式就会出问题。

**影响：** 无直接 bug。代码风格不一致，增加了后续维护的认知负担。

**建议：** 将对象创建统一移到 `commitState` 内部，与 `addPlayerAt` 保持一致。

---

## 全量功能覆盖度复检

在 R3 基础上再次确认：

### 编辑器 CRUD 矩阵

| 对象 | 创建 | 拖拽移动 | 属性编辑 | 删除 | 选择互斥 | 删除保护(`length` check) |
|---|---|---|---|---|---|---|
| Player | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ball | — | ✅ | — | — | — | — |
| Line | ✅ | ❌(坐标编辑) | ✅ | ✅ | ✅ | ✅ |
| Text | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Area | ✅ | ✅ | ✅ | ✅ | ✅ | **❌ CR4-01** |

### 步骤管理

| 操作 | 实现 | 三态布局覆盖 |
|---|---|---|
| 添加 | ✅ | Desktop ✅ / Tablet ✅ / Mobile ✅ |
| 复制 | ✅ | Desktop ✅ / Tablet ✅ / Mobile ✅ |
| 删除 | ✅ | Desktop ✅ / Tablet ✅ / Mobile ✅ |
| 左移/右移 | ✅ | Desktop ✅ / Tablet ✅ / Mobile ✅ |
| 播放/暂停 | ✅ | Desktop ✅ / Tablet ✅ / Mobile ✅ |

### 导出系统

| 项目 | 状态 |
|---|---|
| PNG 导出 | ✅ |
| GIF 导出（桌面端） | ✅ |
| 15s 时长约束 | ✅ |
| 导出配置对话框 | ✅ |
| 参考底图导出开关 | ✅ |
| 残影导出开关 | ✅（data-export-role 标记已就位，但画布未渲染残影 SVG）|

> [!WARNING]
> **残影渲染缺失：** `ExportConfigDialog` 提供了"导出上一帧残影"开关（`includeGhostTrail`），`export-config.ts` 中 `applyExportConfigToSvg` 也会根据此配置移除 `[data-export-role="ghost-trail"]` 节点。但 `PitchCanvas.tsx` 的 SVG 渲染中**没有生成任何 `data-export-role="ghost-trail"` 的元素**。这意味着即使用户开启残影导出，导出结果中也不会有残影——开关存在但功能空转。

### 持久化与路由

| 项目 | 状态 |
|---|---|
| 草稿自动保存（防抖 1.5s） | ✅ |
| 拖拽期间抑制自动保存 | ✅ |
| 手动保存到正式项目 | ✅ |
| 首次保存后 URL 替换 | ✅ |
| 返回工作台保存与通知 | ✅ |
| 项目重命名/复制/删除 | ✅ |
| 制式切换三选一对话框 | ✅ |
| 撤销/重做（50 步上限） | ✅ |

---

## 综合问题优先级表

### 功能性 Bug

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟡 中 | CR3-07/08 | 足球单击移动（ball 工具点空白区域）不产生 undo 记录 | R3 | 小 |
| 🟡 中 | CR3-09 | 快捷阵型入口只构建 home 队，away 队为空 | R3 | 小 |
| 🟢 低 | CR4-01 | `removeSelectedArea` 缺少 length 短路保护，可能产生空 undo 记录 | R4 | 极小 |

### 功能空转

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟡 中 | CR4-05 | Ghost trail 导出开关存在但画布未渲染残影 SVG，功能空转 | R4 | 中 |

### 代码质量

| 级别 | 编号 | 问题 | 来源 | 工作量 |
|---|---|---|---|---|
| 🟢 低 | CR3-01 | 乱码检测三处不一致 + DashboardV2 `normalizeProjectName` 死函数 | R3 | 极小 |
| 🟢 低 | CR3-02 | `mockProjects.ts` 中 `cloneStep` 死函数 | R3 | 极小 |
| 🟢 低 | CR3-03/04 | 新球员默认名英文 / 新文本默认内容英文 | R3 | 极小 |
| 🟢 低 | CR4-02 | `Index.tsx` 传 `null` 给 `presetId?: string`，`strictNullChecks` 下会报错 | R4 | 极小 |
| ⚪ 优化 | CR4-03 | `buildInitialSnapshot` 首次 mount 执行两次 | R4 | 小 |
| ⚪ 优化 | CR4-04 | `addTextAt`/`addLine`/`addAreaAt` 在 `commitState` 外创建对象，风格不一致 | R4 | 小 |
| ⚪ 优化 | CR3-05 | 拖拽回调命名 `onBeginPlayerMove` 管理所有对象 | R3 | 重构 |

---

## 总结

### 与 R3 对比

**代码零变化。** R3 报告的 9 个问题原封不动。

### 本轮新增发现

| # | 发现 |
|---|---|
| CR4-01 | `removeSelectedArea` 缺少删除保护（其他三个 remove 都有） |
| CR4-02 | `presetId` 类型 `string | null` → `string | undefined` 不匹配 |
| CR4-03 | 初始化时 `buildInitialSnapshot` 双重执行 |
| CR4-04 | 三个 add 函数在闭包外创建对象，与 `addPlayerAt` 风格不一致 |
| CR4-05 | Ghost trail 导出开关功能空转（画布无残影渲染） |

### 建议修复顺序

1. **先修 CR3-07/08 + CR3-09**（两个中等 bug，都是小改动）
2. **修 CR4-01**（一行代码）
3. **清理 CR3-01/02/03/04 + CR4-02**（全部是极小改动，一次性做完）
4. **评审 CR4-05**（残影功能是要在 V1 实现还是标记为 V2，决定后要么实现残影渲染，要么禁用/隐藏开关）
5. **优化项 CR4-03/04** 可留到后续重构
