# Windows 数据结构

## 1. 文档目标

这份文档定义 Windows 打包第一阶段所需关注的数据结构、字段边界和存储策略。

目标：

- 说明 Windows 打包阶段哪些数据结构继续沿用现有模型
- 说明哪些平台相关数据需要新增
- 说明哪些数据不应在第一阶段引入

## 2. 数据结构范围

当前文档覆盖：

- 项目级实体
- 步骤级实体
- 导出相关数据
- 参考底图相关数据
- Windows 平台适配层新增数据结构

当前不覆盖：

- 后端接口数据结构
- Android 平台数据结构
- 长期迁移协议
- 云同步数据结构

## 3. 核心原则

- 第一阶段尽量复用现有编辑器数据结构
- Windows 打包第一阶段不重写项目模型
- 平台层只增加桥接数据结构，不污染编辑器核心实体
- 不把 Tauri 原生路径直接塞进 UI 组件或业务对象里

## 4. 现有核心实体

### 4.1 文档命名与当前代码符号映射

为了避免实现阶段把“文档概念名”和“当前代码类型名”混用，Windows 打包第一阶段统一按下面这张映射表理解：

- 文档中的 `Project`：指“当前项目的完整编辑状态”；落到现有代码时，对应 `EditorState` 及其持久化后的 `StoredProjectRecord.state`
- `StepFrame`：对应 `src/types/tactics.ts` 中的 `StepFrame`
- `PlayerObject`：对应 `src/types/tactics.ts` 中的 `Player`
- `BallObject`：对应 `src/types/tactics.ts` 中的 `Ball`
- `TextObject`：对应 `src/types/tactics.ts` 中的 `TextNote`
- `AreaObject`：对应 `src/types/tactics.ts` 中的 `AreaObject`
- `LineObject`：对应 `src/types/tactics.ts` 中的 `TacticsLine`
- `ReferenceImage`：对应 `src/types/tactics.ts` 中的 `ReferenceImage`
- `ExportConfig`：对应 `src/types/tactics.ts` 中的 `ExportConfig`

第一阶段不引入第二套“桌面专用项目模型”，避免文档层和实现层继续漂移。

第一阶段继续沿用现有主模型：

- `Project`
- `StepFrame`
- `PlayerObject`
- `BallObject`
- `TextObject`
- `AreaObject`
- `LineObject`
- `ReferenceImage`
- `MatchMeta`
- `LocalDraft`
- `ProjectIndexEntry`
- `ExportConfig`

这些实体的定义基础仍以：

- `docs/04-domain/domain-model.md`
- `docs/04-domain/entity-lifecycle.md`
- `docs/04-domain/local-persistence-and-project-structure.md`

为准。

## 5. 项目级数据

### 5.1 Project

这里的 `Project` 在当前代码里实际对应 `EditorState` 的项目级字段集合。

Windows 第一阶段要求继续保留以下关键字段：

- `id`
- `name`
- `fieldFormat`
- `fieldView`
- `fieldStyle`
- `playerStyle`
- `matchMeta`
- `referenceImage`
- `steps`
- `currentStepIndex`

要求：

- Windows 打包不应删除或重命名这些字段
- 不允许仅为了适配 Tauri 而重构项目结构

## 6. 步骤级数据

### 6.1 StepFrame

继续保留当前代码里的实际字段：

- `id`
- `label`
- `description`
- `players`
- `ball`
- `texts`
- `areas`
- `lines`

要求：

- Windows 打包第一阶段不改变步骤数据的组织方式
- PNG / GIF 导出仍从现有步骤数据生成
- 如果后续需要步骤时间标签，必须作为新的显式字段单独设计；第一阶段不能假定现有 `StepFrame` 已经存在 `timeLabel`

## 7. 参考底图数据

### 7.1 现有结构

参考底图当前仍属于项目级对象。

当前代码里的实际字段为：

- `id`
- `name`
- `localUri`
- `opacity`
- `scale`
- `offsetX`
- `offsetY`
- `locked`
- `visible`

### 7.2 Windows 第一阶段要求

- UI 和编辑器逻辑仍消费现有 `ReferenceImage`
- 平台层负责把原生文件读取成前端可用的数据
- 不把磁盘路径直接放进 `ReferenceImage`
- 第一阶段文档描述必须以现有 `localUri` 这一内容字段为准，不再使用泛化的 `dataUrl`/`mimeType` 描述替代当前实现

### 7.3 禁止事项

- 不在第一阶段把 `ReferenceImage` 直接改成“磁盘路径模式”
- 不在组件层传播原生路径

## 8. 导出相关数据

### 8.1 ExportConfig

第一阶段继续沿用现有导出配置模型。

当前代码里的实际字段为：

- `format`
- `ratio`
- `gifSpeed`
- `includeTitle`
- `includeStepInfo`
- `includeMatchInfo`
- `includeGhostTrail`
- `includeReferenceImage`
- `transparentBackground`

要求：

- Windows 打包第一阶段不重写导出配置对象
- 平台适配层只处理“生成后的文件如何保存”
- 文档和实现讨论导出配置时，优先使用这些真实字段名，而不是只用“清晰度/比例/标题开关”这类泛称

## 9. 存储策略

### 9.1 第一阶段策略

继续使用现有前端本地存储策略。

当前特征：

- 项目索引使用本地存储
- 正式项目使用本地存储
- 草稿使用本地存储

### 9.2 Windows 第一阶段边界

- 不迁移到数据库
- 不迁移到 Rust 管理的独立持久化层
- 不承诺浏览器版与桌面版自动数据互通

### 9.3 三类数据环境

必须区分：

1. 浏览器版本地数据
2. `tauri dev` 开发版本地数据
3. 正式 Windows 产物本地数据

第一阶段默认不保证三者自动互通。

## 10. Windows 平台桥新增数据结构

Windows 打包第一阶段真正需要新增的，是平台桥层的数据结构。

### 10.1 RuntimePlatform

```ts
export type RuntimePlatform = 'web' | 'windows-tauri';
```

用途：

- 标识当前运行环境

### 10.2 SaveFileInput

```ts
export type SaveFileInput = {
  suggestedName: string;
  mimeType: string;
  bytes: Uint8Array;
};
```

用途：

- 统一 PNG / GIF 保存输入

### 10.3 SaveFileResult

```ts
export type SaveFileResult =
  | { status: 'saved'; path?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };
```

用途：

- 统一文件保存结果

### 10.4 PickedImageAsset

```ts
export type PickedImageAsset = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};
```

用途：

- 统一浏览器 `File` 与 Tauri 路径读取结果

### 10.5 ImportReferenceImageResult

```ts
export type ImportReferenceImageResult =
  | { status: 'selected'; asset: PickedImageAsset }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };
```

用途：

- 统一参考底图导入结果

## 11. 数据流约束

### 11.1 导出数据流

```text
EditorState / Project
    ↓
tactics-export.ts
    ↓
ExportBinary
    ↓
saveExportBinary()
    ↓
saveFile()
```

### 11.2 参考底图导入数据流

```text
Browser File / Tauri Path
    ↓
pickImageAsset()
    ↓
PickedImageAsset
    ↓
importReferenceImage()
    ↓
ReferenceImage
```

## 12. 错误与取消的结果结构

第一阶段必须统一结果语义：

- `saved`
- `selected`
- `cancelled`
- `failed`

要求：

- 不用布尔值混合表达成功 / 失败 / 取消
- 不允许把取消当成失败

## 13. 第一阶段不新增的数据结构

为了控制风险，第一阶段不新增：

- `DesktopProjectFile`
- `DesktopProjectBackup`
- `RustManagedProjectStore`
- `NativeExportJobQueue`
- `AssetCacheDatabase`

这些都属于后续阶段，不在当前 Windows 打包第一阶段引入。

## 14. 第一阶段完成标准

可以认为 Windows 数据结构层已经够用，至少要满足：

- 现有项目数据结构无需大改即可在桌面端运行
- PNG / GIF 保存使用统一桥接数据结构
- 参考底图导入使用统一桥接数据结构
- 平台层新增类型清楚区分成功 / 取消 / 失败
- 不把原生路径直接泄漏到业务对象里

## 15. 当前结论

Windows 第一阶段最好的做法不是发明一套新数据模型，而是：

- 保持现有编辑器数据结构稳定
- 只在平台桥层补最小的新类型
- 明确存储环境边界

这样可以最大化减少打包阶段的 bug。
