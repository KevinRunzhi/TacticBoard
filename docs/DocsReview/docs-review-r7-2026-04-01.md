# Docs Review Round 7

日期：2026-04-01
轮次：第 7 轮
触发来源：

- 用户要求继续处理 `docs/DocsReview/docs-review-r5.1-2026-03-31.md`
- 对修复结果的再次交叉复查

审查范围：

- `docs/04-domain/`
- `docs/06-quality/`
- `docs/DocsReview/`

## 结论

本轮处理了 Round 5.1 中的 3 个低优先级小问题，并顺手把相关质量层验收也补齐了。

结果：

- `PlayerObject` 是否需要逐对象样式字段的问题已通过规则澄清
- `ExportConfig` 已补齐残影和参考底图导出开关
- 本地持久化文档中 `ExportConfig` 的表述已与生命周期和持久化策略对齐

当前未发现新的硬性冲突。

## 本轮完成的修复

### 1. 明确球员展示样式是项目级控制

- 在 `domain-model.md` 的 `PlayerObject` 段落补充规则
- 明确 V1 不提供逐球员 `displayStyle`
- 明确球员展示样式由 `Project.playerStyle` 统一控制
- 为后续可能的 `styleOverride` 预留说明

### 2. 补齐 ExportConfig 的导出开关字段

- 在 `domain-model.md` 的 `ExportConfig` 字段建议中新增：
  - `includeGhostTrail`
  - `includeReferenceImage`

### 3. 对齐 ExportConfig 的持久化表述

- 在 `local-persistence-and-project-structure.md` 中把对象边界拆成：
  - 正式持久化
  - 恢复性持久化
  - 仅当前会话的临时状态
- 明确 `ExportConfig` 只存在于当前导出会话，不进入本地持久化，不跨会话保留

### 4. 顺手补齐质量层导出验收

- 在 `acceptance-checklist.md` 中补入参考底图默认不导出 / 开启后可导出的验收
- 在 `test-matrix.md` 中补入对应的 2 条导出测试场景

## 本轮修复文件

- `docs/04-domain/domain-model.md`
- `docs/04-domain/local-persistence-and-project-structure.md`
- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`

## 再次自审结论

- `PlayerObject` 与 `Project.playerStyle` 的职责边界已清楚
- `ExportConfig` 已能完整承载标题、比赛信息、残影、参考底图等导出开关
- `ExportConfig` 不再被误读为需要落盘的本地对象

## 当前剩余风险

- 如果后续纳入“多张参考底图”或“逐球员样式覆盖”，仍需要再补一次领域模型和渲染规则
