# Domain Model

最后更新：2026-04-01

## 1. 核心实体

| 实体 | 说明 | V1 状态 |
|---|---|---|
| `Project` | 用户可编辑的本地战术板项目 | 必做 |
| `StepFrame` | 项目中的单个步骤帧 | 必做 |
| `PlayerObject` | 球员对象 | 必做 |
| `BallObject` | 足球对象 | 必做 |
| `TextObject` | 文本说明对象 | 必做 |
| `AreaObject` | 区域标记对象 | 必做 |
| `LineObject` | 线路对象 | 必做 |
| `ReferenceImage` | 参考底图 | 必做 |
| `FormationTemplate` | 内置或用户保存的阵型结构 | 必做 |
| `LocalDraft` | 自动保存草稿 | 必做 |
| `MatchMeta` | 项目的比赛与标题区信息 | 必做 |
| `ProjectIndexEntry` | 项目列表与最近项目索引条目 | 必做 |
| `ExportConfig` | 当前导出的参数组合 | 必做 |

## 2. Project

字段建议：

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
- `createdAt`
- `updatedAt`

规则：

- 项目是第一阶段最核心的持久化对象
- 项目必须可被重命名、复制、删除
- 项目需要包含标题区和导出所需的比赛信息元数据
- 参考底图按项目级对象管理，默认跨全部步骤共享，不挂在单个 StepFrame 下

## 3. StepFrame

字段建议：

- `id`
- `title`
- `description`
- `timeLabel`
- `players`
- `ball`
- `texts`
- `areas`
- `lines`

规则：

- 步骤帧之间通过对象身份建立连续关系
- 当前帧删除对象不应回溯破坏更早步骤
- 复制步骤时，延续存在的对象必须保留同一对象身份

## 4. 编辑对象字段建议

### PlayerObject

- `id`
- `x`
- `y`
- `teamSide` (`home` / `away`)
- `number`
- `displayName`
- `positionTag`
- `colorToken`
- `avatarLocalUri`（可选）

规则补充：

- V1 不提供逐球员 `displayStyle` 字段
- 球员展示样式由 `Project.playerStyle` 统一控制
- 后续如需局部覆盖，再评估在 `PlayerObject` 上增加 `styleOverride`

### BallObject

- `id`
- `x`
- `y`
- `style` (`classic` / `dot`)
- `size`
- `attachedPlayerId`（可选）

### TextObject

- `id`
- `x`
- `y`
- `text`
- `preset` (`title` / `body` / `emphasis`)
- `fontSize`
- `color`
- `weight`
- `textAlign`
- `backgroundStyle`
- `borderStyle`
- `opacity`

### AreaObject

- `id`
- `shape` (`rect` / `circle` / `ellipse`)
- `x`
- `y`
- `width`
- `height`
- `strokeColor`
- `fillColor`
- `opacity`

### LineObject

- `id`
- `semanticType` (`run` / `pass` / `dribble` / `shot` / `press`)
- `pathType` (`straight` / `polyline`)
- `points`
- `strokeColor`
- `strokeWidth`
- `strokeStyle`
- `startAttachmentId`（可选）
- `endAttachmentId`（可选）

### ReferenceImage

- `id`
- `localUri`
- `cropRect`
- `transform`
- `opacity`
- `locked`
- `visible`

## 5. 对象身份规则

适用对象：

- `PlayerObject`
- `BallObject`
- `TextObject`
- `AreaObject`
- `LineObject`

基础规则：

- 每个对象都必须具备稳定的 `id`
- `id` 是步骤间关联、残影表达和撤销重做的重要依据
- 从某一帧复制到下一帧时，保留的对象应复用同一 `id`
- 用户手动新建的对象必须生成新的 `id`
- 已删除对象不应在后续步骤中被静默复活

## 6. FormationTemplate

字段建议：

- `id`
- `name`
- `fieldFormat`
- `positions`
- `sourceType` (`builtin` / `user`)

规则：

- 阵型模板只保存站位结构
- 不保存文本、线路、步骤

## 7. LocalDraft

字段建议：

- `projectId`
- `snapshot`
- `savedAt`

规则：

- LocalDraft 只服务恢复，不替代正式项目
- 自动保存失败时保留上一份成功草稿
- LocalDraft 应能指向其对应项目，或在“新建未命名项目”场景下持有关联中的临时项目身份

## 8. MatchMeta

字段建议：

- `title`
- `score`
- `minute`
- `phaseLabel`

规则：

- MatchMeta 属于 Project 的元数据组成部分
- MatchMeta 可参与标题区和导出内容展示
- 第一阶段不用于项目搜索和筛选

## 9. ProjectIndexEntry

字段建议：

- `projectId`
- `projectName`
- `updatedAt`
- `lastOpenedAt`

规则：

- ProjectIndexEntry 服务于项目列表与最近项目展示
- 它是项目元信息索引，不替代 Project 正文
- 索引失效时允许清理条目，不影响正式项目结构

## 10. ExportConfig

字段建议：

- `format` (`png` / `gif`)
- `ratio`
- `includeTitle`
- `includeStepInfo`
- `includeMatchInfo`
- `includeGhostTrail`
- `includeReferenceImage`
- `transparentBackground`

规则：

- 第一阶段不支持用户保存大量自定义导出预设
- ExportConfig 更接近导出时的临时配置，而不是独立资产

## 11. 暂不进入 V1 的实体

- `ProjectFile`
- `BackupPackage`
- `ProjectVersion`
- `TemplateLibrary`
- `ShareLink`
- `TeamSpace`
- `AccountProfile`
