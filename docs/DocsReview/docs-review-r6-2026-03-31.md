# Docs Review Round 6

日期：2026-03-31
轮次：第 6 轮
触发来源：

- 用户提供的 `docs/DocsReview/docs-review-r5-2026-03-31.md`
- 对修复结果的再次自审

审查范围：

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/04-domain/`
- `docs/05-engineering/`
- `docs/06-quality/`
- `docs/07-decisions/`
- `docs/01-product/roadmap.md`
- `docs/03-functional/frd/editor.md`

## 结论

本轮针对 Round 5 提出的 14 个问题完成了集中修复，并在修复后对相关文档做了一轮交叉复查。

结果：

- Round 5 中提出的实体命名不一致问题已消除
- 领域层已补齐核心编辑对象字段骨架与参考底图归属
- 工程层已补齐自动保存触发建议、撤销栈持久化边界、Feature 列表与旧营销路由说明
- 质量层已补齐制式切换、残影、视觉样式相关验收与测试场景
- ADR 层已补入“素材导入必须复制到本地”的关键决策记录

当前未再发现 04-07 与主文档、01-03 之间的硬性冲突。

## 本轮完成的修复

### 1. 主文档与领域模型概念统一

- 将 PRD §16 中的 `ExportImagePreset` 统一为 `ExportConfig`
- 将 PRD §16 中的 `LocalDraft` 从“草稿与最近项目记录”拆回“本地自动保存草稿”
- 在 PRD §16 中补入 `ProjectIndexEntry`
- 在 PRD 与 requirements 中明确“参考底图为项目级对象，默认跨全部步骤共享”

### 2. 领域层补齐对象结构

- 在 `domain-model.md` 中为 `PlayerObject`、`BallObject`、`TextObject`、`AreaObject`、`LineObject`、`ReferenceImage` 补齐字段建议骨架
- 在 `Project` 中补入 `referenceImage` 字段
- 在 `entity-lifecycle.md` 中新增 `MatchMeta` 与 `ExportConfig` 生命周期
- 在 `local-persistence-and-project-structure.md` 中统一使用 `ExportConfig` 命名，并明确 `Project` 包含 `MatchMeta` 与项目级 `ReferenceImage`

### 3. 工程层补齐边界与实现方向

- 在 `state-management.md` 的状态归属矩阵中补入“撤销重做栈 | 编辑器状态 | 否”
- 在 `persistence-strategy.md` 中明确 `MatchMeta` 和项目级 `ReferenceImage` 随 `Project` 持久化
- 在 `persistence-strategy.md` 中补入自动保存触发条件、去抖写入建议和后台冲刷建议
- 在 `frontend-architecture.md` 中补入 `visual-theme` 与 `match-meta` feature
- 在 `routing-and-shells.md` 中补充营销落地页路由说明

### 4. 质量层补齐验收和测试覆盖

- 在 `acceptance-checklist.md` 中补入制式切换三选一验收
- 在 `acceptance-checklist.md` 中补入残影默认不导出与显式导出验收
- 在 `acceptance-checklist.md` 中补入球员展示样式与成套主题切换验收
- 在 `test-matrix.md` 中补入制式切换、残影导出、视觉样式切换相关测试场景

### 5. 决策与追踪层补齐

- 新增 `adr-005-asset-import-local-copy.md`
- 在 `07-decisions/README.md` 中补入 ADR-005
- 在 `roadmap.md` 的 Phase 3 中补入 Android 图片导出后的系统分享
- 在 `editor.md` 验收要点中补入“比赛信息可编辑，导出时可开关控制”
- 同步修正 `requirements.md` 的更新时间与 `DocsReview/README.md` 的目录索引

## 本轮修复文件

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/04-domain/domain-model.md`
- `docs/04-domain/entity-lifecycle.md`
- `docs/04-domain/local-persistence-and-project-structure.md`
- `docs/05-engineering/frontend-architecture.md`
- `docs/05-engineering/persistence-strategy.md`
- `docs/05-engineering/routing-and-shells.md`
- `docs/05-engineering/state-management.md`
- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/07-decisions/README.md`
- `docs/07-decisions/adr-005-asset-import-local-copy.md`
- `docs/03-functional/frd/editor.md`
- `docs/01-product/roadmap.md`
- `docs/DocsReview/README.md`

## 再次自审结论

- 命名一致性：`ExportConfig` 已统一，现行产品与派生文档中未再使用 `ExportImagePreset`
- 草稿与索引职责：`LocalDraft` 与 `ProjectIndexEntry` 的职责已重新对齐
- 参考底图归属：已在主文档、requirements、domain 层明确为项目级对象
- 验收覆盖：制式切换、残影、主题与球员展示样式都已进入质量层

## 当前剩余风险

- 自动保存去抖参数目前是工程建议值，后续实现时仍需结合实际性能做验证
- `ReferenceImage` 当前按单个项目级对象建模；如果后续要支持多张参考底图，需要再补一次领域与渲染规则
