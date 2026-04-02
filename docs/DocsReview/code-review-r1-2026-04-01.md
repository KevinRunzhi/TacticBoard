# 代码审查 Round 1

日期：2026-04-01
审查范围：`tactics-canvas-24/src/` 全部已修改代码
对照来源：01-07 文档基线（R4.1 + R5.1 修复后版本）

---

## 总结

路由清理和页面重组方向正确。旧的登录 / 注册 / 分享 / 球队 / 模板页面已从路由中移除，壳层拆分（App Shell + Editor Shell）符合文档要求。

发现 **15 个问题**，按严重度分布：

| 严重度 | 数量 |
|---|---|
| Bug（运行时会出错） | 3 |
| 逻辑隐患（不出错但行为不正确） | 5 |
| 文档–代码不一致 | 4 |
| 残留清理 | 3 |

---

## Bug（运行时会出错）

### CR1-01 `useEditorState` resume 模式传入 `undefined` 给 `loadSavedEditorState`，永远找不到草稿

文件：`hooks/useEditorState.ts` L95-103

```ts
if (mode === 'resume') {
  const savedState = loadSavedEditorState(projectId);
  // ...
}
```

问题：

- `mode === 'resume'` 只在 `!projectId` 时才被设置（`Index.tsx` L18-21 的逻辑）。
- 所以进到这个分支时，`projectId` 必定是 `undefined`。
- `loadSavedEditorState(undefined)` → `readDraftRecord(undefined)` → 读 `NEW_PROJECT_DRAFT_KEY`。
- 这本身是正确的——它读的是"新建未命名项目的草稿"。

**但** `buildInitialState` 中，只有当 `projectId` 存在时才会走 L49-60 的早返回（它也会调 `loadSavedEditorState`）。resume 模式走到 L95 之前，如果 `seed` 参数有值，会先被 L62-93 的 seed 分支截胡。

**真正的 bug**：Dashboard 的"恢复草稿"按钮导航到 `/editor?mode=resume`，此时没有任何 seed 参数，所以可以正确走到 L95。**但** 如果用户通过 `/editor?mode=resume&presetId=xxx` 这种组合访问，seed 分支会先生效，完全跳过草稿恢复。`Index.tsx` L19 做了 `!hasSeedSource` 的保护，但用户手动构造 URL 时这个保护无效——`Index.tsx` 只在有 seed 时把 mode 设为 `'new'`，在 `buildInitialState` 内部，seed 分支并不检查 mode。

影响：中。正常使用不会触发，但边窗口 URL 构造会导致 resume 静默失效。

建议：

- 在 `buildInitialState` 中，让 `mode === 'resume'` 的判断优先于 seed 分支。或者在 seed 分支前加 `if (mode !== 'resume')` 保护。

### CR1-02 `clearAllLocalProjectData` 清除后又写入空索引和 `ready` 标记，导致 `STORAGE_READY_KEY` 被清除后又重新创建

文件：`data/mockProjects.ts` L804-828

```ts
managedKeys.forEach((key) => {
  window.localStorage.removeItem(key);
});

writeProjectIndex([]);
window.localStorage.setItem(PROJECT_STORAGE_READY_KEY, 'cleared');
```

问题：

- `getManagedProjectStorageKeys()` 会收集 `PROJECT_STORAGE_READY_KEY` 和 `PROJECT_INDEX_KEY`。
- 然后 `forEach` 把它们全部删除。
- 紧接着又写入了空的 `PROJECT_INDEX_KEY` 和 `PROJECT_STORAGE_READY_KEY = 'cleared'`。
- 这意味着如果用户清除数据后刷新页面，`ensureProjectStorage` 会看到 `storageReady = 'cleared'`（truthy），然后检查 index 是否存在——它存在（空数组），所以直接返回。
- 但如果在清除后、刷新前，有其他代码（比如 Settings 页的 `refreshSummary`）调用了 `ensureProjectStorage()`，不会重新播种。

**最终效果是**：清除数据后 seed 数据不会回来。这**可能是有意的设计**（清除就是清除），但如果用户预期"清除后回到初始示例状态"就会困惑。

影响：低。行为本身不是 crash，但与文档 `acceptance-checklist.md` §4 「素材导入后复制到本地存储」和设置页提示"不会保留示例数据"一致。标记为已知行为即可。

### CR1-03 `movePlayer` 和 `moveArea` 绕过 `commitState`，不进入撤销栈但会触发自动保存

文件：`hooks/useEditorState.ts` L461-483

```ts
const movePlayer = useCallback((playerId, x, y) => {
  setState(s => { ... });   // 直接 setState，不走 commitState
}, []);

const moveArea = useCallback((areaId, x, y) => {
  setState(s => { ... });   // 同上
}, []);
```

问题：

- `movePlayer` 和 `moveArea` 使用 `setState` 而不是 `commitState`，所以单帧移动不进入撤销栈——这是合理的（拖拽期间不应每帧都压栈）。
- **但** `autosaveSignature` 依赖 `state.steps`，而 `movePlayer`/`moveArea` 会修改 `steps` 里的对象坐标。
- 所以拖拽过程中，每次 `setState` 都会触发 `autosaveSignature` 变化，进而触发去抖自动保存（1500ms 后）。
- 在连续高频拖拽时，这会导致大量 `JSON.stringify` 计算和 localStorage 写盘。

影响：中。在低端 Android 设备上可能造成拖拽卡顿。

建议：

- 在拖拽过程中（`isDraggingPlayerRef.current === true`）暂停自动保存。在 `endPlayerMove` 后再触发一次保存。
- 或者让自动保存 effect 检查 `isDraggingPlayerRef.current`，为 true 时跳过。

---

## 逻辑隐患（不出错但行为不正确）

### CR1-04 `Workspace` 类型仍保留 `'team'`，但 V1 不做团队空间

文件：`types/workspace.ts` L1

```ts
export type Workspace = 'personal' | 'team';
```

对照：

- ADR-001：V1 不做账号体系、不做团队空间。
- `WorkspaceProvider` 硬编码为 `'personal'`，`setWorkspace` 是空函数。
- `normalizeWorkspace` 在 `mockProjects.ts` 中把 `'team'` 强制映射为 `'personal'`。

问题：

- 类型层面仍然允许 `'team'`，测试文件里还有 `setWorkspace('team')` 的测试用例。
- 虽然运行时不会出问题（因为 normalizeWorkspace 会兜住），但类型定义与产品方向不一致，测试在测一个 V1 不存在的能力。

建议：

- 把 `Workspace` 改为 `type Workspace = 'personal'`，或者在 V1 分支去掉 `'team'`。
- 清理测试中的 `'team'` 相关用例。

### CR1-05 `ExportConfig` 缺少 `includeGhostTrail` 和 `includeStepInfo` 字段

文件：`types/tactics.ts` L80-86

```ts
export interface ExportConfig {
  format: ExportFormat;
  ratio: ExportRatio;
  includeTitle: boolean;
  includeMatchInfo: boolean;
  includeReferenceImage: boolean;
}
```

对照：

- domain-model §10 ExportConfig 字段有 `includeTitle`、`includeStepInfo`、`includeMatchInfo`、`transparentBackground`。
- editor.md §4/§6 规定残影导出默认不导出，需显式开启。R5.1-02 也指出需要 `includeGhostTrail`。
- `export-config.ts` 的 `applyExportConfigToSvg` 有处理 `match-title` 和 `match-info` 的逻辑，但没有残影和步骤信息的处理。

缺失字段：

- `includeStepInfo`
- `includeGhostTrail`
- `transparentBackground`

建议：

- 在 `ExportConfig` 接口中补入这三个布尔字段，并在 `DEFAULT_EXPORT_CONFIG` 和 `applyExportConfigToSvg` 中增加对应处理逻辑。

### CR1-06 `ExportFormat` 只有 `'png'`，缺少 `'gif'`

文件：`types/tactics.ts` L5

```ts
export type ExportFormat = 'png';
```

对照：

- scope-v1 明确 V1 纳入 Windows 基础 GIF 导出。
- domain-model §10 `ExportConfig.format` 为 `'png' | 'gif'`。

建议：

- 改为 `export type ExportFormat = 'png' | 'gif'`。
- GIF 导出的实际实现可以后续再做，但类型定义需要先对齐。

### CR1-07 `addStep` 复制当前步骤时保留了对象引用相同的 `id`，但没有调用 `cloneStep`

文件：`hooks/useEditorState.ts` L447-459

```ts
const addStep = useCallback(() => {
  commitState(s => {
    const currentStep = s.steps[s.currentStepIndex];
    const newStep = {
      ...currentStep,
      id: `step-${Date.now()}`,
      label: `第 ${s.steps.length + 1} 步`,
      description: '',
    };
    // ...
  });
}, [commitState]);
```

问题：

- `newStep = { ...currentStep }` 是浅拷贝。`newStep.players` 和 `currentStep.players` 指向同一个数组引用。
- domain-model §4 "对象身份规则" 要求"从某一帧复制到下一帧时，保留的对象应复用同一 id"——对象 id 保持一致是正确的。
- **但浅拷贝意味着修改 `newStep.players[0].x` 会同时修改 `currentStep.players[0].x`！**
- `cloneStep` 函数已经存在于 `mockProjects.ts` 中，但这里没有使用它。

影响：高。修改新步骤中的球员位置会回溯破坏原步骤的数据，直接违反 domain-model §3 "当前帧删除对象不应回溯破坏更早步骤"。

建议：

- 使用 `cloneStep` 或等价的深拷贝来创建新步骤。

### CR1-08 `applyFormation` 只替换 home 队球员，away 队被保留但不会匹配新阵型

文件：`hooks/useEditorState.ts` L532-556

```ts
const awayPlayers = currentStep.players.filter((player) => player.team === 'away');
currentStep.players = [...buildPlayersForFormation(formation, 'home'), ...awayPlayers];
currentStep.lines = [];
```

问题：

- 应用阵型时，home 队被完全重建，但 away 队的球员 id、数量和位置完全保留不变。
- 如果用户从 11v11 切到 5v5 并选了新阵型，home 队变成 5 人，但 away 队仍然是 11 人。
- 清空了 lines 但没清空 areas 和 texts。

影响：中。会导致场上球员数量不对称，视觉上混乱。

建议：

- 同时重建 away 队（`regenerateFieldFormat` 做到了这一点，但 `applyFormation` 没做）。
- 或者至少在 `applyFormation` 前检查阵型的 fieldFormat 是否与当前 fieldFormat 一致，不一致时给出制式切换提示（与 editor.md §4 的三选一规则对齐）。

---

## 文档–代码不一致

### CR1-09 `ReferenceImage` 字段与 domain-model 不一致

| domain-model §4 ReferenceImage | 代码 `types/tactics.ts` ReferenceImage |
|---|---|
| `cropRect` | ❌ 缺失 |
| `transform` | ❌ 缺失（用 `scale` + `offsetX` + `offsetY` 代替） |
| `opacity` | ✅ |
| `locked` | ✅ |
| `visible` | ✅ |

补充字段：

- 代码多了 `name`、`scale`、`offsetX`、`offsetY`，这些在 domain-model 中没有。

影响：低。代码的字段设计更贴近实际实现需求，但与文档的字段建议不一致。

建议：

- 回写 domain-model，把 `transform` 细化为 `scale`、`offsetX`、`offsetY`；补入 `name`；`cropRect` 如果 V1 不做裁切则标为 optional。

### CR1-10 `Player` 接口字段与 domain-model `PlayerObject` 不一致

| domain-model §4 PlayerObject | 代码 `types/tactics.ts` Player |
|---|---|
| `teamSide` (`home` / `away`) | `team` (`home` / `away`)——名字不同 |
| `displayName` | `name`——名字不同 |
| `positionTag` | `position`——名字不同 |
| `colorToken` | ❌ 缺失 |
| `avatarLocalUri` | ❌ 缺失 |
| `number` (number) | ✅ |

影响：中。开发阶段如果有人看文档写新模块，会用 `teamSide` / `displayName` / `positionTag`，与现有代码不兼容。

建议：

- 统一字段命名。由于代码已经在使用 `team`/`name`/`position`，建议回写 domain-model 统一为代码现用名。

### CR1-11 `TacticsLine` 字段与 domain-model `LineObject` 差距较大

| domain-model §4 LineObject | 代码 `types/tactics.ts` TacticsLine |
|---|---|
| `semanticType` | `type` |
| `pathType` | ❌ 缺失 |
| `points` | 用 `fromX/fromY/toX/toY` 代替 |
| `strokeColor` | ❌ 缺失 |
| `strokeWidth` | ❌ 缺失 |
| `strokeStyle` | ❌ 缺失 |
| `startAttachmentId` | `fromId`——名字不同 |
| `endAttachmentId` | `toId`——名字不同 |

影响：中。线路系统字段差异最大，后续开发线路属性调整功能时会完全对不上。

建议：

- 代码接口和文档需要双向对齐。`fromX/fromY/toX/toY` 的直线模型需要评估是否足够（文档设计了 `polyline` 类型），如果 V1 只做直线则在文档中标注。

### CR1-12 `TextNote` 字段与 domain-model `TextObject` 差距较大

| domain-model §4 TextObject | 代码 `types/tactics.ts` TextNote |
|---|---|
| `preset` (`title` / `body` / `emphasis`) | `style` (`title` / `body` / `emphasis`)——名字不同 |
| `fontSize` | ❌ 缺失 |
| `color` | ❌ 缺失 |
| `weight` | ❌ 缺失 |
| `textAlign` | ❌ 缺失 |
| `backgroundStyle` | ❌ 缺失 |
| `borderStyle` | ❌ 缺失 |
| `opacity` | ❌ 缺失 |

影响：低。V1 的文本对象可能先用预设样式，细粒度属性后续再加。但接口名 `TextNote` 与文档名 `TextObject` 不一致。

---

## 残留清理

### CR1-13 `data/mockTeams.ts` 和 `data/mockTemplates.ts` 仍在被引用

文件：`hooks/useEditorState.ts` L15-16

```ts
import { createEditorStateFromTeamPreset } from '@/data/mockTeams';
import { createEditorStateFromTemplate } from '@/data/mockTemplates';
```

问题：

- V1 移除了球队页和模板页，但 `useEditorState` 仍然导入了 `mockTeams` 和 `mockTemplates` 的函数。
- `buildInitialState` 中 L62-93 仍然有 `if (seed?.teamId)` 和 `if (seed?.templateId)` 的分支。
- `Index.tsx` 仍然读取 `searchParams.get('teamId')` 和 `searchParams.get('templateId')`。
- 虽然当前 UI 没有入口触发这些路径，但代码仍然存在，增加了维护成本和 bundle 体积。

建议：

- 考虑移除 `mockTeams.ts`、`mockTemplates.ts` 和相关导入/分支。
- 或如果想保留扩展性，至少标注清楚这些是"V2 预留"代码。

### CR1-14 `data/mockData.ts` 可能包含旧方向的大量数据

文件：`data/mockData.ts`（10KB）

问题：

- 这个文件未被详细审查，但从 `useEditorState.ts` 的导入来看，它提供了 `buildPlayersForFormation`、`getFormationById`、`getFormationsByFormat`、`defaultSteps` 等函数。
- 这些是编辑器核心依赖，应保留。
- 但文件大小（10KB）暗示里面可能还有旧方向的数据。

建议：

- 后续审查确认 `mockData.ts` 中是否有不再需要的旧导出函数或数据结构。

### CR1-15 `NotFound.tsx` 文案仍为英文，且缺少返回项目页入口

文件：`pages/NotFound.tsx` L15-17

```tsx
<p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
<a href="/" className="text-primary underline hover:text-primary/90">
  Return to Home
</a>
```

对照：

- routing-and-shells §4 要求"错误态至少给出返回工作台和项目页两个出口"。
- 产品面向中文用户，文案应统一为中文。

建议：

- 把文案改为中文。
- 增加"返回项目页"链接。

---

## 建议优先级

| 优先级 | 编号 | 问题 |
|---|---|---|
| **高** | CR1-07 | `addStep` 浅拷贝导致步骤间对象共享引用，修改新步骤会破坏旧步骤 |
| **高** | CR1-03 | 拖拽期间高频触发 `autosaveSignature` 计算和 localStorage 写盘 |
| **高** | CR1-08 | `applyFormation` 不更新 away 队，制式切换后场上人数不对称 |
| **中** | CR1-01 | resume 模式可被 seed 参数截胡 |
| **中** | CR1-05 | ExportConfig 缺字段（ghostTrail / stepInfo / transparentBg） |
| **中** | CR1-06 | ExportFormat 缺 `'gif'` |
| **中** | CR1-10 | Player 字段名与 domain-model 不一致 |
| **中** | CR1-11 | TacticsLine 字段与 domain-model 差距大 |
| **中** | CR1-13 | mockTeams/mockTemplates 残留导入 |
| **低** | CR1-02 | clearAllLocalProjectData 行为需确认是否符合预期 |
| **低** | CR1-04 | Workspace 类型仍含 `'team'` |
| **低** | CR1-09 | ReferenceImage 字段与文档不一致 |
| **低** | CR1-12 | TextNote 字段与文档不一致 |
| **低** | CR1-14 | mockData.ts 需后续审查 |
| **低** | CR1-15 | NotFound 文案英文 + 缺项目页入口 |

---

## 已确认正确的部分

| 维度 | 确认状态 |
|---|---|
| 路由清理（移除 login / register / bind-account / share / teams / templates） | ✅ 正确 |
| 壳层分离（App Shell 承载工作台/项目/设置，Editor 独立路由） | ✅ 正确 |
| Editor 路由语义（`/editor` 新建，`/editor/:projectId` 打开，projectId 不存在时错误态） | ✅ 正确 |
| 错误态提供返回工作台和项目页两个出口 | ✅ 正确 |
| 自动保存基础机制（1500ms 去抖） | ✅ 基本正确（但需优化拖拽场景） |
| 撤销/重做栈不持久化 | ✅ 正确 |
| 草稿恢复入口（Dashboard "继续未保存草稿"） | ✅ 正确 |
| 项目操作（重命名、复制、删除 + 删除二次确认） | ✅ 正确 |
| 最新项目按 updatedAt 排序 | ✅ 正确 |
| 设置页结构（显示偏好、导出偏好、本地数据、关于） | ✅ 正确 |
| 工作台阵型快捷开始入口 | ✅ 正确 |
| 导航栏移动端底栏 + 桌面端顶栏 | ✅ 正确 |
