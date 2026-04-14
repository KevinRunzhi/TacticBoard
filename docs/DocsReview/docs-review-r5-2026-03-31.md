# Docs Review Round 5

日期：2026-03-31
轮次：第 5 轮
审查范围：

- `docs/04-domain/`
- `docs/05-engineering/`
- `docs/06-quality/`
- `docs/07-decisions/`

对照来源：

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/01-product/`、`docs/02-ux/`、`docs/03-functional/`（R4 / R4.1 修复后版本）

审查重点：

- 04-07 层之间、以及与主文档和 01-03 之间的冲突与不一致
- 领域模型实体是否完整反映主文档定义的功能对象
- 工程层是否正确承接领域层和功能层的边界
- 质量层验收和测试是否覆盖所有已承诺的能力
- ADR 是否与当前产品方向一致，有无遗漏关键决策

---

## 总结

没有发现 P0 级产品方向冲突。发现 **14 个** 问题，分布如下：

| 严重度 | 数量 | 说明 |
|---|---|---|
| 硬性冲突 | 2 | 实体命名不一致、实体覆盖缺口 |
| 边界缺口 | 4 | 主文档或 01-03 已明确但 04-07 没收紧 |
| 隐藏风险 | 4 | 文档自身不矛盾但实现时极易踩坑 |
| 覆盖遗漏 | 4 | 主文档有约束但 04-07 完全没有对应条目 |

---

## 硬性冲突

### R5-01 导出配置实体命名不一致

来源对照：

| 文档 | 实体名 |
|---|---|
| PRD §16 关键产品模型 | `ExportImagePreset` |
| 04-domain domain-model.md §9 | `ExportConfig` |

冲突点：

- PRD 把导出配置命名为 `ExportImagePreset`，强调"图片导出预设"语义。
- 领域层把它命名为 `ExportConfig`，是一个更通用的"导出配置"概念。
- 两者的字段内容高度重合（`format`、`ratio`、`includeTitle`、`includeMatchInfo` 等），但名字不一致。

风险：

- 后续开发时如果有人看 PRD、有人看领域层，会各自用不同名字命名同一个东西，代码里出现两套概念。

建议：

- 统一为一个名字。考虑到 V1 的 `ExportConfig` 同时承载 PNG 和 GIF 参数（`format` 字段含 `gif`），`ExportConfig` 比 `ExportImagePreset` 更准确。建议将 PRD §16 的 `ExportImagePreset` 更新为 `ExportConfig`，或反向统一。

### R5-02 领域模型缺少 PRD 中若干已确认的编辑子对象拆分

来源对照：

- PRD §6.2 明确球员对象支持：颜色、号码、名字、头像、位置标签、队伍归属。
- PRD §6.2 明确文本对象支持：三种预设样式、字号、颜色、粗细、对齐方式、背景、边框、圆角、透明度。
- PRD §6.4 明确步骤帧支持：步骤标题、步骤说明、时间标签。

问题点：

- `domain-model.md` §3 `StepFrame` 的字段列了 `title`、`description`、`timeLabel`，与 PRD 一致。✅
- 但 `PlayerObject`、`TextObject`、`AreaObject`、`LineObject` 在 §4 "对象身份规则"中被提及，却都没有给出字段建议（只有"每个对象有 `id`"）。
- 相比之下 `Project`、`StepFrame`、`FormationTemplate`、`LocalDraft`、`MatchMeta`、`ProjectIndexEntry`、`ExportConfig` 都有字段建议。

风险：

- 如果编辑子对象没有字段建议，开发会各自定义字段结构，容易出现数据模型分歧。尤其球员对象字段最复杂（颜色、号码、名字、头像路径、位置标签、队伍归属、展示样式）。

建议：

- 在 `domain-model.md` 中为 `PlayerObject`、`BallObject`、`TextObject`、`AreaObject`、`LineObject`、`ReferenceImage` 至少各给出一份字段建议骨架。不需要把所有细节穷举，但需要让开发者知道主要字段方向。

---

## 边界缺口

### R5-03 PRD 中 LocalDraft 定义含"最近项目记录"，但领域层已经拆分为独立实体却没回写 PRD

来源对照：

| 文档 | 定义 |
|---|---|
| PRD §16 | `LocalDraft`：本地草稿**与最近项目记录** |
| 04-domain domain-model.md | `LocalDraft`：自动保存草稿；`ProjectIndexEntry`：项目列表与最近项目索引条目 |

问题：

- R2-2 已经识别并修复了这个问题——在领域层新增了 `ProjectIndexEntry` 独立实体。
- 但 PRD §16 的文本仍然把"最近项目记录"归在 `LocalDraft` 描述里，没有同步更新。

风险：

- PRD 作为最高来源文档，如果不回写，后续有人只看 PRD 会以为 `LocalDraft` 同时承担了草稿和索引两个职责，与领域层的实际设计矛盾。

建议：

- 将 PRD §16 中 `LocalDraft` 的描述改为"本地草稿"，并新增 `ProjectIndexEntry` 到核心实体列表中。

### R5-04 state-management 状态归属矩阵缺少"撤销重做栈"的持久化标注

问题：

- `state-management.md` §3 状态归属矩阵列了 10 行，包含了"当前选中对象"（否）、"播放状态"（否）、"画布缩放与视角"（否）等。
- 但"撤销重做栈"本身没有出现在矩阵中，尽管 §5 提到它属于编辑器状态。

风险：

- 撤销栈的持久化是开发时容易纠结的问题。如果矩阵不明确标为"否"，有人可能会试图把撤销栈也写入项目文件或草稿中。

建议：

- 在状态归属矩阵中新增一行：`撤销重做栈 | 编辑器状态 | 否`。

### R5-05 persistence-strategy 写入对象列表缺少 MatchMeta

问题：

- `persistence-strategy.md` §2 写入对象列出了 `Project`、`FormationTemplate`、`LocalDraft`、`ProjectIndexEntry`。
- 但 `MatchMeta` 作为 `Project` 的组成部分（domain-model.md §7），没有被提及。

影响：

- 这一条影响较轻，因为 `MatchMeta` 是嵌入在 `Project` 中的（`Project.matchMeta`），不是独立持久化对象。
- 但 persistence-strategy 没有明确说"MatchMeta 跟随 Project 一起写入"，如果有人把 MatchMeta 当成独立的持久化头等对象会产生困惑。

建议：

- 在 `persistence-strategy.md` §2 备注 MatchMeta 随 Project 一起持久化，不独立写入。或在 §3 "Project 写入时机"下补一句"包含 matchMeta"。

### R5-06 routing-and-shells 明确移除的旧路由列表比 IA 少一项

来源对照：

| 文档 | 旧路由列表 |
|---|---|
| IA §3 不保留的旧页面类型 | 登录页、注册页、绑定账号页、在线分享页、球队页、独立模板页、营销落地页（7 项） |
| routing-and-shells §3 | `/login`、`/register`、`/bind-account`、`/share/:id`、`/teams`、`/templates`（6 条路由） |

问题：

- IA 列出了"营销落地页"，但 routing-and-shells 的旧路由移除列表没有对应的路由条目。
- 营销落地页的路由可能是 `/landing`、`/about` 或其他名称，但当前文档没有写。

风险：

- 如果旧代码确实有营销落地页路由，且 routing-and-shells 没有写，前端清理旧路由时可能漏掉。

建议：

- 确认旧代码中营销落地页是否存在独立路由。如果存在，在 `routing-and-shells.md` §3 中补入。如果营销落地页从未有独立路由（只是首页的一部分），则在 §3 备注说明。

---

## 隐藏风险

### R5-07 domain-model StepFrame 缺少 referenceImage 字段

问题：

- `domain-model.md` §3 StepFrame 的字段列了 `players`、`ball`、`texts`、`areas`、`lines`，但没有 `referenceImage`。
- PRD §6.2 和 Requirements §8.5 都确认参考底图是第一阶段核心编辑对象。
- `domain-model.md` §1 核心实体表里有 `ReferenceImage`，但它没有被纳入任何父实体的字段建议。

风险：

- 参考底图的归属不清：它属于 Project 级别还是 StepFrame 级别？
  - 如果属于 Project 级别（所有步骤共享同一底图），字段应在 `Project` 中。
  - 如果属于 StepFrame 级别（每步可以有不同底图），字段应在 `StepFrame` 中。
- PRD 没有明确参考底图是全项目共享还是按步骤独立。如果不在领域层定义清楚，开发会自行假设。

建议：

- 明确参考底图的归属层级。结合 PRD "参考底图锁定、隐藏、显示切换"的描述，更倾向于它是 **Project 级别** 对象（跨步骤共享，可通过显隐控制出现与否）。
- 在 `domain-model.md` 的 `Project` 或 `StepFrame` 字段建议中补入 `referenceImage` 或 `referenceImages`。

### R5-08 entity-lifecycle 缺少 MatchMeta 和 ExportConfig 的生命周期描述

问题：

- `entity-lifecycle.md` 覆盖了 `Project`、`LocalDraft`、`FormationTemplate`、`ReferenceImage`、`Export`、`ProjectIndexEntry` 的生命周期。
- 但 `MatchMeta` 和 `ExportConfig` 在 domain-model 中都是 V1 必做实体，lifecycle 文档却没有提及它们。

风险：

- `MatchMeta` 的生命周期问题相对简单（随 Project 创建 / 修改 / 删除），但不写会让人质疑它是否有独立管理需求。
- `ExportConfig` 的生命周期需要明确：它是导出弹窗打开时临时构建的？还是跟随项目保存的？domain-model 说它是"导出时的临时配置"，但 lifecycle 不写就没有形成闭环。

建议：

- 在 `entity-lifecycle.md` 中新增 `MatchMeta` 和 `ExportConfig` 的生命周期简述。可以很短：
  - MatchMeta：随 Project 创建，在编辑器中修改，随 Project 持久化和删除。
  - ExportConfig：导出时临时构建，导出完成或取消后丢弃，不跨会话保留。

### R5-09 自动保存触发时机没有在任何文档中给出具体策略

问题：

- `persistence-strategy.md` §4 写了"编辑器在关键变更后触发自动保存"。
- `03-functional/frd/editor.md` §5 写了"自动保存优先覆盖当前工作副本"。
- 但所有文档都没有定义"什么算关键变更"以及"自动保存的间隔或去抖策略"。

风险：

- 如果完全没有约束，开发可能每次对象移动 1px 就触发写盘，也可能间隔太长导致丢失较多进度。
- PRD §7.5（后续版本方向）提到了自动快照"按时间间隔触发，10 分钟"，但这是**后续版本的快照策略**，不是第一阶段的自动保存策略。

建议：

- 在 `persistence-strategy.md` §4 中补充第一阶段自动保存的触发建议，例如：
  - 触发条件：用户执行了会进入撤销栈的内容变更
  - 去抖策略：变更后至少间隔 N 秒再触发一次写盘
  - 或采用"关键节点触发"策略：步骤切换、对象新增/删除、手动保存前的确认等
- 可以标注为"工程建议"而非强制要求，但需要给开发方向。

### R5-10 frontend-architecture Feature 层列表未覆盖视觉样式和比赛信息模块

问题：

- `frontend-architecture.md` §2 Feature 层列了 7 个 feature：`project-list`、`project-actions`、`formation-selector`、`canvas-objects`、`steps-timeline`、`export`、`local-save`。
- 但 V1 scope 已经确认纳入的"双球员展示样式 / 成套主题 / 换肤"和"比赛信息 / 标题区"没有对应的 feature 模块。

风险：

- 视觉样式和比赛信息在代码组织上需要明确归属。如果 feature 层清单不提，开发可能把它们随意散落在 `canvas-objects` 或页面组件中。

建议：

- 在 Feature 层补入：`visual-theme`（球员展示样式 / 成套主题 / 换肤 / 风格预设）和 `match-meta`（比赛信息 / 标题区）。
- 或至少标注它们属于哪个已有 feature 的子模块。

---

## 覆盖遗漏

### R5-11 验收清单缺少制式切换场景

问题：

- editor.md §4 已经详细写了制式切换的三选一规则和三条不做约束。
- 但 `acceptance-checklist.md` §3 编辑器验收只写了"可以切换场地"和"可以应用阵型"，没有覆盖"制式切换时的三选一提示"和"不做自动删除/重排/映射"的验收。

风险：

- 制式切换是阵型系统最容易出 bug 的场景（11 人切 5 人，多出来的球员怎么办）。如果验收清单不写，QA 阶段可能只测"切场地成功"，漏测"切到不兼容制式时的对话框行为"。

建议：

- 在 `acceptance-checklist.md` §3 编辑器中补入：
  - 切换不兼容制式时弹出三选一提示
  - 三选一每个选项行为正确
  - 不发生自动删除球员、自动重排或自动映射

### R5-12 验收清单缺少残影相关验收

问题：

- editor.md §4 已补入残影规则：编辑器显示残影、导出时默认不导出残影。
- 但 `acceptance-checklist.md` 和 `test-matrix.md` 都没有相关用例。

风险：

- 残影是步骤系统的核心视觉反馈。如果验收和测试都不覆盖，残影可能实现了但导出时行为不正确（默认导出了残影或者反过来），直到用户反馈才发现。

建议：

- 在 `acceptance-checklist.md` §3 补入："步骤切换时上一帧残影正确显示"。
- 在 `test-matrix.md` 补入：
  - `编辑 | 切换步骤并查看残影 | 上一帧对象以残影样式显示`
  - `导出 | PNG 导出默认状态 | 残影不出现在导出结果中`
  - `导出 | PNG 导出并开启残影 | 残影出现在导出结果中`

### R5-13 验收清单和测试矩阵缺少视觉样式相关场景

问题：

- Requirements §16 和 scope-v1 都已确认 V1 纳入双球员展示样式、成套主题、换肤、风格预设。
- 但验收清单和测试矩阵都没有任何相关条目。

风险：

- 主题切换、球员展示样式切换是用户可见的高频操作。如果不验收，可能做了但切换行为异常（比如切换主题时意外改变了球员展示样式，违反 PRD §9.1 的独立性规则）。

建议：

- 在 `acceptance-checklist.md` §3 补入：
  - 可切换球员展示样式（圆点 / 球衣卡片）
  - 可切换成套主题
  - 切换主题不强制改变当前球员展示样式
- 在 `test-matrix.md` 补入：
  - `编辑 | 切换球员展示样式 | 球员视觉正确变化`
  - `编辑 | 切换成套主题 | 球场、线路、区域风格变化，球员展示样式不变`

### R5-14 ADR 层缺少"素材导入必须复制到本地"的关键决策记录

问题：

- "素材导入后必须复制到应用本地存储，不依赖外部路径"是一个影响数据持久性和 Android 权限模型的关键决策。
- 这条规则出现在 PRD §6.7、Requirements §8.1/8.5、editor.md §7、persistence-strategy §6、domain-model persistence 等多处。
- 但 07-decisions 没有为此写一条 ADR。

风险：

- 影响较轻（因为规则已经在多份文档中反复出现），但 ADR 层的价值恰恰在于记录"为什么做这个决策"。
- 如果后续有人问"为什么不能直接引用外部路径，那样更省空间"，没有 ADR 可以指向。

建议：

- 新增 `adr-005-asset-import-local-copy.md`，记录：
  - 决策：所有导入素材必须复制到应用本地存储
  - 原因：Android 权限限制、外部路径不稳定、卸载后不丢引用
  - 影响：导入时产生本地副本、不支持外部路径长期引用

---

## 已关闭的检查点（未发现问题）

| 检查维度 | 对照来源 | 04-07 对齐状态 |
|---|---|---|
| 本地优先基线 | PRD §5 / Requirements 当前产品原则 | ✅ ADR-001、persistence-strategy、domain README 全部一致 |
| 壳层分离 | IA §4 / editor-layout | ✅ ADR-002、routing-and-shells、frontend-architecture 一致 |
| 页面范围（含营销落地页排除） | IA §3 / scope-v1 | ✅ ADR-003 已含营销落地页（R1-4 修复） |
| GIF 仅 Windows 首发 | Requirements §12 / scope-v1 | ✅ ADR-004 一致 |
| 删除二次确认 | Requirements §14 | ✅ persistence-strategy §7、acceptance-checklist §2 一致 |
| 草稿恢复不阻塞 | Requirements §5 | ✅ persistence-strategy §5、acceptance-checklist §4 一致 |
| 对象身份连续性 | Requirements §10 | ✅ domain-model §4 已覆盖 |
| 启动恢复顺序 | R2-5 修复 | ✅ local-persistence §5、persistence-strategy §5 一致 |
| 状态归属反模式 | R2-4 修复 | ✅ state-management §6 已覆盖 |
| 旧路由失效测试 | R3-1/R3-3 修复 | ✅ test-matrix 已含对应用例 |
| Android 系统分享验收 | R3-2 修复 | ✅ acceptance-checklist §5、test-matrix 已含 |
| 文档漂移风险 | R3-4 修复 | ✅ known-risks §5 已含 |

---

## 建议优先级

| 优先级 | 编号 | 建议动作 |
|---|---|---|
| 高 | R5-02 | 领域层为编辑子对象补字段建议骨架 |
| 高 | R5-07 | 明确参考底图的归属层级（Project vs StepFrame） |
| 高 | R5-11 | 验收清单补制式切换场景 |
| 高 | R5-12 | 验收清单和测试矩阵补残影场景 |
| 中 | R5-01 | 统一导出配置实体命名 |
| 中 | R5-03 | PRD 回写 ProjectIndexEntry |
| 中 | R5-04 | 状态归属矩阵补撤销重做栈 |
| 中 | R5-09 | 自动保存触发策略给出建议 |
| 中 | R5-10 | Feature 层补视觉样式和比赛信息模块 |
| 中 | R5-13 | 验收和测试补视觉样式场景 |
| 低 | R5-05 | persistence-strategy 备注 MatchMeta 随 Project 持久化 |
| 低 | R5-06 | routing-and-shells 确认营销落地页旧路由 |
| 低 | R5-08 | entity-lifecycle 补 MatchMeta 和 ExportConfig |
| 低 | R5-14 | ADR 层补素材本地复制决策记录 |

---

## 本轮审查文件清单

已审查文件：

- `docs/04-domain/README.md`
- `docs/04-domain/domain-model.md`
- `docs/04-domain/entity-lifecycle.md`
- `docs/04-domain/local-persistence-and-project-structure.md`
- `docs/05-engineering/README.md`
- `docs/05-engineering/frontend-architecture.md`
- `docs/05-engineering/persistence-strategy.md`
- `docs/05-engineering/routing-and-shells.md`
- `docs/05-engineering/state-management.md`
- `docs/06-quality/README.md`
- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/known-risks.md`
- `docs/07-decisions/README.md`
- `docs/07-decisions/adr-001-local-first-baseline.md`
- `docs/07-decisions/adr-002-editor-shell-and-layout.md`
- `docs/07-decisions/adr-003-v1-page-scope.md`
- `docs/07-decisions/adr-004-export-scope.md`

对照来源：

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/01-product/scope-v1.md`
- `docs/02-ux/user-flows.md`
- `docs/03-functional/frd/editor.md`
