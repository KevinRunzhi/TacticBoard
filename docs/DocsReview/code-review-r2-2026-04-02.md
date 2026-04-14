# 代码审查 Round 2

日期：2026-04-02
审查范围：`tactics-canvas-24/src/` 全部源码（含 R1 修复后的二次全量审查）
对照来源：01-07 文档基线 + R1 审查

---

## R1 修复确认

| R1 编号 | 问题 | 修复状态 |
|---|---|---|
| CR1-01 | resume 模式可被 seed 截胡 | ✅ `buildInitialSnapshot` 中 `mode === 'resume'` 现在先于 seed 判断（L89-100） |
| CR1-03 | 拖拽期间高频触发自动保存 | ✅ autosave effect 加了 `isDraggingPlayerRef.current` 跳过（L208-210），`endPlayerMove` 后通过 `dragAutosaveRevision` 触发保存（L531） |
| CR1-04 | Workspace 类型含 `'team'` | ✅ `workspace.ts` L1 已改为 `type Workspace = 'personal'` |
| CR1-05 | ExportConfig 缺字段 | ✅ 已补入 `gifSpeed`、`includeStepInfo`、`includeGhostTrail`、`transparentBackground` |
| CR1-06 | ExportFormat 缺 `'gif'` | ✅ 已补入 `'gif'`，并新增 `GifSpeed` 类型 |
| CR1-07 | addStep 浅拷贝 | ✅ L486 现在使用 `cloneStepFrame`（本地深拷贝函数） |
| CR1-08 | applyFormation 不更新 away | ✅ L576-579 现在同时重建 home 和 away，并清空 lines/texts/areas |
| CR1-13 | mockTeams/mockTemplates 残留导入 | ✅ `useEditorState` 中已移除 `mockTeams` 和 `mockTemplates` 的导入和 seed 分支。`Index.tsx` 不再读取 `teamId` / `templateId` |
| CR1-15 | NotFound 英文文案 + 缺项目页入口 | ✅ 404 页面已改为中文，增加了"返回工作台"和"查看项目页"双出口 |

已略过 CR1-02（clearAllLocalProjectData 行为确认为预期），CR1-09/10/11/12（文档-代码命名对齐，属于后续文档工作），CR1-14（mockData 后续清理）。

---

## 新增功能确认

本轮发现以下新增功能实现：

| 功能 | 实现状态 | 位置 |
|---|---|---|
| 编辑器保存状态跟踪（unsaved/saving/saved） | ✅ | `TacticsEditor.tsx` L39-40, L117-118 |
| 首次保存 vs 更新保存区分 | ✅ | `TacticsEditor.tsx` L263-264 |
| 保存后 URL 替换（新建变打开已有） | ✅ | `TacticsEditor.tsx` L286-293 |
| 返回工作台时自动保存+传递状态 | ✅ | `TacticsEditor.tsx` L256-340 |
| 工作台接收编辑器返回通知（绿色提示条） | ✅ | `DashboardV2.tsx` L35-42, L204-222 |
| 最近项目高亮刚保存的项目 | ✅ | `DashboardV2.tsx` L345-348, L356-360 |
| GIF 导出（基于 gifenc） | ✅ | `lib/tactics-export.ts` L564-618 |
| GIF 约束检查（15s 上限） | ✅ | `lib/tactics-export.ts` L102-109 |
| Canvas 渲染器（残影、背景、步骤信息） | ✅ | `lib/tactics-export.ts` L264-543 |
| 三选一制式切换对话框 | ✅ | `TacticsEditor.tsx` L690-741 |
| 导出配置对话框 | ✅ | `ExportConfigDialog.tsx`（单独组件） |
| 参考底图导入（FileReader + Data URL） | ✅ | `TacticsEditor.tsx` L377-407 |
| entrySource 跟踪（区分 new-blank / new-preset / resume-draft / project-saved / project-draft） | ✅ | `useEditorState.ts` L38-43 |

---

## 新发现的问题

### Bug（运行时可能出错）

#### CR2-01 `normalizeProjectName` 硬编码乱码检测会误伤合法中文名

文件：`DashboardV2.tsx` L44-50

```ts
function normalizeProjectName(name: string) {
  if (!name.trim()) {
    return '新建战术板';
  }
  return name.includes('鏂板缓') ? '新建战术板' : name;
}
```

问题：

- `'鏂板缓'` 是 UTF-8 编码被错误解码时产生的乱码（原始是 `'新建'`）。这说明曾有编码问题导致项目名被损坏。
- 但这个检测是**字面量 `includes` 匹配**——只要项目名中恰好包含这三个字，就会被强制替换为"新建战术板"。
- 虽然 `'鏂板缓'` 在正常中文里不太可能出现，但这是一种 hack 修复而不是根因修复。

影响：低。实际触发概率极低，但属于技术债。

建议：

- 在 `TacticsEditor.tsx` L130-134 也有同样的检测逻辑。两处应统一。
- 更好的做法是在 `normalizeEditorState` 或 `readProjectRecord` 阶段修复编码问题，避免在 UI 层做逐行检测。

#### CR2-02 `persistProject` 首次保存后路由替换可能与 `useEffect` 初始化冲突

文件：`TacticsEditor.tsx` L286-293

```ts
if (options?.navigateAfterSave !== false && !projectId && savedProjectId) {
  navigate(`/editor/${savedProjectId}`, {
    replace: true,
    state: { editorSaveKind: nextSaveKind },
  });
}
```

加上 L178-192 的初始化 effect：

```ts
useEffect(() => {
  // ...
  setActiveProjectId(projectId ?? null);
  if (entrySource === 'project-saved') {
    lastSavedFingerprintRef.current = changeFingerprint;
    setSaveStatus('saved');
    setLastSaveKind(routeSaveKind ?? pendingSaveKindRef.current ?? 'update');
  } else {
    // ...
  }
  pendingSaveKindRef.current = null;
}, [changeFingerprint, entrySource, location.state, projectId]);
```

问题：

- 首次保存后 `navigate(`/editor/${savedProjectId}`, { replace: true })` 会改变 URL，导致 `Index.tsx` 重新渲染，`projectId` 从 `undefined` 变成 `savedProjectId`。
- 这会触发 `useEditorState` 的 `useEffect`（L160-167），调用 `buildInitialSnapshot(savedProjectId, ...)`，然后 `setState(nextSnapshot.state)` — 这会从 localStorage 重新读取刚保存的项目状态。
- **竞态**：如果 `saveProjectState` 的写入和 `buildInitialSnapshot` 的读取之间有 React 批处理优化介入，理论上可能读到旧数据。但因为 localStorage 是同步的，这在实际中不会发生。
- **实际问题**：`buildInitialSnapshot` 在 `projectId` 存在时会先查 `loadSavedEditorState(projectId)`（即读草稿），再查 `getMockProjectById(projectId)`（读正式项目）。由于 `saveProjectState` 末尾调用了 `removeDraftRecord(nextId)` 清除草稿，此时会走到 `project-saved` 路径——这是正确的。但 `useEffect` 中的 `[changeFingerprint, entrySource, location.state, projectId]` 依赖包含 `changeFingerprint`，首次保存后 fingerprint 不变但 projectId 变了，会触发 effect，重设 `setSaveStatus('saved')` 和 `setLastSaveKind('update')` — 而不是保留此前设置的 `'first'`。

影响：低。用户可能在首次保存后看到的状态标签短暂从"首次已保存"切换到"本地已保存"。

建议：

- `pendingSaveKindRef` 的使用已经在尝试解决这个问题（L185 `routeSaveKind ?? pendingSaveKindRef.current ?? 'update'`），但 `pendingSaveKindRef.current` 在 L191 被清除为 null。如果 effect 触发两次（一次因 `location.state` 变化，一次因 `projectId` 变化），第二次就拿不到值了。
- 建议通过 `editorSaveKind` route state 来传递（已经在做），并确保不会被中间的 effect 执行清除。

#### CR2-03 `cloneStepFrame` 与 `cloneStep` 实现重复且默认标签语言不一致

文件：

- `useEditorState.ts` L50-62 `cloneStepFrame` — 默认标签 `Step ${index + 1}`（英文）
- `mockProjects.ts` L149-161 `cloneStep` — 默认标签 `第 ${index + 1} 步`（中文）

问题：

- 两个函数做的是完全一样的事情（深拷贝 StepFrame），但 fallback label 语言不一致。
- `cloneStepFrame` 用于 `addStep`（L486），产出的新步骤如果缺失 label 会显示英文。
- `cloneStep` 用于 `mockProjects.ts` 中的各种存储和恢复操作。

影响：低。实际上 `addStep` 在 L488 明确设置了 `label: '第 ${s.steps.length + 1} 步'`，覆盖了 fallback，所以不会真的显示英文。但代码存在冗余和不一致。

建议：

- 统一为一个 `cloneStepFrame` 函数，导出供两个模块使用。

---

### 逻辑隐患

#### CR2-04 编辑器没有"删除步骤"和"复制步骤"操作

文件：`useEditorState.ts` — 暴露的返回值

当前暴露的步骤操作：

- `addStep` — 添加新步骤（基于当前步骤深拷贝）
- `setStep` — 切换到某个步骤
- `togglePlay` — 播放/暂停

缺失的步骤操作（文档要求）：

- **删除步骤** — `editor.md` §3"步骤帧管理"要求可以删除步骤。当前没有 `deleteStep` / `removeStep`。
- **复制步骤**（到指定位置） — 当前 `addStep` 始终追加到末尾，无法在中间插入。
- **移动步骤**（调整顺序） — 没有 `moveStep` / `reorderStep`。

影响：中。步骤管理基本操作缺失，用户无法删除错误的步骤帧，也无法重新排序。

建议：

- 补充 `deleteStep`（至少保留 1 个步骤）、`duplicateStep`（在指定位置后插入副本）、`reorderStep`（交换顺序或拖拽排序）。

#### CR2-05 编辑器没有"添加/删除球员""添加/删除线路""添加/删除文本"操作

文件：`useEditorState.ts` — 暴露的返回值

当前暴露的对象编辑操作：

| 对象 | 添加 | 移动 | 编辑属性 | 删除 |
|---|---|---|---|---|
| Player | ❌ | ✅ (`movePlayer`) | ✅ (`updateSelectedPlayer`) | ❌ |
| Ball | ❌（只跟随步骤） | ❌（只通过阵型操作重置为 50,50） | ❌ | ❌ |
| Line | ❌ | ❌ | ❌ | ❌ |
| Text | ❌ | ❌ | ❌ | ❌ |
| Area | ✅ (`addAreaAt`) | ✅ (`moveArea`) | ✅ (`updateSelectedArea`) | ✅ (`removeSelectedArea`) |

问题：

- **Line（线路）**：没有任何操作。文档 `editor.md` §3 把线路列为编辑器核心编辑对象之一（5 种线路类型）。
- **Text（文本标注）**：没有任何操作。文档 `editor.md` §3 把文本标注列为编辑器核心编辑对象。
- **Player（球员）**：没有添加和删除。用户想在自定义模式下添加/移除单个球员时无法操作。
- **Ball（足球）**：位置只能通过阵型操作重置，没有独立的拖拽移动。

影响：高。除 Area 之外的所有编辑对象都缺少完整的 CRUD 操作，这是编辑器"核心能力"层面的缺失。

建议：

- 这是下一步开发最优先应该补全的。至少补齐：
  - Player: `addPlayer`、`removeSelectedPlayer`
  - Line: `addLine`、`updateSelectedLine`、`removeSelectedLine`
  - Text: `addText`、`updateSelectedText`、`removeSelectedText`
  - Ball: `moveBall`（独立于步骤重置）

#### CR2-06 `ExportConfigDialog` 和 `PitchCanvas` 没有读到源码，但结构上存在潜在问题

`TacticsEditor.tsx` 使用了 `pitchCanvasRef.current?.exportPng(...)` 和 `pitchCanvasRef.current?.exportGif(...)`，这依赖 `PitchCanvas` 通过 `forwardRef` 暴露的 `exportPng`/`exportGif` 方法。

观察：

- `PitchCanvas.tsx` 是 31KB 的大文件（目前代码中最大的组件），其中包含了画布渲染和交互逻辑。
- `lib/tactics-export.ts` 有独立的 `exportStepAsPng` 和 `exportStepsAsGif` 函数，直接操作 canvas context。
- `PitchCanvas` handle 方法应该调用 `tactics-export.ts` 中的函数，但无法确认是否正确传入了所有必要参数（如 `fieldView`、`fieldStyle`、`playerStyle` 等），因为 PitchCanvas 太大没有完整读取。

影响：未确定。需要进一步审查 `PitchCanvas.tsx` 的 export handle 实现。

#### CR2-07 `TacticsEditor` 的 `presetId` prop 丢失了 `templateId`

文件：`TacticsEditor.tsx` L33-37, L62

```ts
interface TacticsEditorProps {
  projectId?: string;
  presetId?: string;    // <-- 没有 templateId
  mode?: EditorEntryMode;
}
```

对应 `Index.tsx` L43-47：

```tsx
<TacticsEditor
  projectId={projectId}
  presetId={presetId}
  mode={mode}
/>
```

问题：

- `templateId` 已从 props 中移除，这与 R1 CR1-13 的修复方向一致（移除 templates 功能）。
- **但** `Index.tsx` L14 仍然声明 `const hasSeedSource = Boolean(presetId)` — 如果后续重新加入 templateId，这里需要同步更新。
- 当前状态是正确的，只是需要注意。

影响：无。当前实现正确。

---

### 数据层问题

#### CR2-08 `mockTeams.ts` 和 `mockTemplates.ts` 文件仍然存在

文件：`data/mockTeams.ts`（5.5KB）、`data/mockTemplates.ts`（6.2KB）

问题：

- 虽然 R1 修复已经移除了所有引用这两个文件的代码（`useEditorState` 不再导入它们），但文件本身还在 `data/` 目录中。
- 它们不再被任何代码引用，属于死代码。
- 合计 11.7KB 的 dead code。

影响：极低。只增加 bundle 体积（如果 tree-shaking 没生效的话）。

建议：

- 删除 `mockTeams.ts` 和 `mockTemplates.ts`。

#### CR2-09 `totalBytes` 计算只统计了字符数，不是实际的 UTF-8 字节数

文件：`mockProjects.ts` L792-795

```ts
const totalBytes = managedKeys.reduce((total, key) => {
  const value = window.localStorage.getItem(key) ?? '';
  return total + key.length + value.length;
}, 0);
```

问题：

- `String.length` 返回的是 UTF-16 码元数，不是字节数。中文字符在 UTF-8 编码中通常占 3 个字节，但 `length` 只算 1。
- 对于中文项目名和中文内容，实际占用会是显示值的 2-3 倍。
- `localStorage` 的实际存储开销也不等于字符串长度（浏览器内部使用 UTF-16）。

影响：低。Settings 页面"本地占用"显示的数字不准确，但不影响功能。

建议：

- 改用 `new Blob([key + value]).size` 来获取更接近实际的字节数，或者在 UI 上标注为"约"。

---

### 性能观察

#### CR2-10 `autosaveSignature` 对整个 `steps` 数组做 `JSON.stringify`

文件：`useEditorState.ts` L173-200

```ts
const autosaveSignature = useMemo(
  () => JSON.stringify({
    // ...
    steps: state.steps,
    // ...
  }),
  [/* ... state.steps ... */],
);
```

问题：

- 每次 `state.steps` 引用变化时，会对整个步骤数组（包括所有球员、线路、区域等数据）做完整的 `JSON.stringify`。
- 在步骤多、对象多的情况下（比如 6 个步骤各 22 个球员 + 多条线路），这个序列化操作可能在每帧交互后都执行。
- 虽然被 `useMemo` 保护了（只在依赖变化时重算），但 `commitState` 每次都会生成新的 `steps` 引用，因此每次有意义的编辑操作都会触发重算。

影响：中偏低。正常编辑场景下不会成为瓶颈（1500ms 去抖保护），但在快速连续操作时可能会有感知。

建议：

- 可以考虑用增量计数器代替 JSON.stringify：每次 `commitState` 时递增一个 revision 号，autosave 检测 revision 变化即可。

---

## 功能覆盖度对照 Roadmap

以下按 Roadmap Phase 1-3 逐项检查代码实现状态：

### Phase 1：页面框架与本地项目主链路

| 功能项 | 实现状态 | 备注 |
|---|---|---|
| 工作台页面 | ✅ | 三主入口 + 快捷阵型 + 最近项目 + 编辑器返回通知 |
| 项目页面 | ✅ | 搜索、筛选、排序、网格/列表视图、草稿恢复入口 |
| 设置页面 | ✅ | 4 分区（显示/导出/本地数据/关于）+ 清除数据 |
| 编辑器壳层 | ✅ | Desktop / Tablet / Mobile 三态布局 |
| 本地保存 | ✅ | 自动保存草稿 + 手动保存正式项目 |
| 最近项目 | ✅ | 按 updatedAt 排序，工作台展示 6 个 |
| 项目复制 | ✅ | `duplicateProject` |
| 项目删除 | ✅ | 二次确认对话框 |
| 项目重命名 | ✅ | `window.prompt` 输入 |

### Phase 2：编辑器核心能力

| 功能项 | 实现状态 | 备注 |
|---|---|---|
| 场地制式切换 | ✅ | 三选一对话框 |
| 场地视角切换（全场/半场） | ✅ | |
| 场地风格切换（写实/扁平） | ✅ | |
| 球员展示样式切换（圆点/卡片） | ✅ | |
| 阵型应用 | ✅ | |
| 球员移动 | ✅ | 拖拽 + beginPlayerMove/endPlayerMove |
| 球员属性编辑（名字/号码/位置） | ✅ | |
| 球员添加/删除 | ❌ **缺失** | 无法手动添加或删除单个球员 |
| 足球移动 | ⚠️ 部分 | 只能通过阵型重置到 50,50，没有独立拖拽 |
| 线路系统 | ❌ **缺失** | 无添加/编辑/删除线路的操作 |
| 文本标注 | ❌ **缺失** | 无添加/编辑/删除文本的操作 |
| 区域对象 | ✅ | 添加/移动/属性编辑/删除 |
| 参考底图 | ✅ | 导入/显示控制/透明度/缩放/偏移/移除 |
| 步骤帧管理 | ⚠️ 部分 | 有添加和切换，缺删除和重排 |
| 步骤播放 | ✅ | 自动播放，到末帧停止 |
| 撤销/重做 | ✅ | 50 步限制 |
| 比赛信息编辑 | ✅ | |
| 缩放与视图 | ✅ | zoomIn/zoomOut/fitToView |

### Phase 3：导出与质量收口

| 功能项 | 实现状态 | 备注 |
|---|---|---|
| PNG 导出 | ✅ | Canvas 渲染 + Blob 下载 |
| GIF 导出 | ✅ | gifenc 库，15s 上限约束 |
| 导出配置对话框 | ✅ | 格式/比例/标题/比赛信息/步骤信息/残影/参考底图/透明背景 |
| GIF 导出降级（非桌面端） | ✅ | `canExportGif = isDesktop`，非桌面端强制回退 PNG |
| 导出异常提示 | ✅ | toast.error 兜底 |

---

## 建议优先级

| 优先级 | 编号 | 问题 |
|---|---|---|
| 🔴 **高** | CR2-05 | 线路、文本、球员缺少添加/删除操作 — 编辑器核心功能空缺 |
| 🟡 **中** | CR2-04 | 步骤缺少删除和重排操作 |
| 🟡 **中** | CR2-06 | PitchCanvas（31KB）需要独立审查 |
| 🟢 **低** | CR2-01 | `normalizeProjectName` 乱码检测是 hack 修复 |
| 🟢 **低** | CR2-02 | 首次保存后 saveKind 可能短暂闪烁 |
| 🟢 **低** | CR2-03 | `cloneStepFrame` 与 `cloneStep` 重复 |
| 🟢 **低** | CR2-08 | mockTeams/mockTemplates 文件未删除 |
| 🟢 **低** | CR2-09 | totalBytes 计算不精确 |
| 🟢 **低** | CR2-10 | autosaveSignature 性能可优化 |

---

## 已确认正确且完善的部分

| 维度 | 详细情况 |
|---|---|
| R1 所有高优先级 bug 修复 | 全部确认修复正确 |
| 路由和壳层架构 | App Shell / Editor Shell 分离干净 |
| 保存状态机 | unsaved → saving → saved 流转正确 |
| 首次保存 → URL 替换 → 持续编辑 | 链路完整 |
| 导出系统 | PNG/GIF 双通道，参数约束、降级、异常处理齐全 |
| 制式切换三选一 | 对话框和两种切换方式都正确实现 |
| 自动保存拖拽保护 | 拖拽期间暂停保存，释放后触发 |
| 参考底图生命周期 | 导入 → 调整 → 移除 → 导出开关全部打通 |
| 项目 CRUD | 新建/保存/重命名/复制/删除 + 索引维护正确 |
| 移动端适配 | 三态布局（Desktop/Tablet/Mobile）+ 抽屉组件 |
