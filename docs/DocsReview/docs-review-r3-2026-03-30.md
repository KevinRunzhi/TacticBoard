# Docs Review Round 3

日期：2026-03-30
轮次：第 3 轮
审查范围：

- `docs/06-quality/`
- `docs/README.md`
- `docs/DocsReview/`

审查重点：

- 验收覆盖率
- 旧路由和旧页面残留风险是否可被测试发现
- 文档之间是否具备基本追踪性

## 结论

第三轮没有发现产品逻辑冲突，但发现了 4 个“如果不补，后面很容易漏验或再次漂移”的质量问题，已全部修复。

## 发现与修复

### R3-1 验收清单未覆盖旧路由直达

问题：

- `acceptance-checklist.md` 之前只写了“不暴露旧入口”
- 但没有明确“旧路由直接访问”也必须失效

风险：

- 前端即使下掉导航入口，旧路由仍可能残留可访问页面

修复：

- 已补入“旧路由直达时，不再进入旧页面主路径”

### R3-2 验收清单未覆盖 Android 系统分享与比赛信息导出

问题：

- requirements 里有 Android 系统分享和比赛信息导出开关
- 质量层之前没有把这两条写进验收

风险：

- 功能可能做了也可能没做，但测试阶段没人明确验

修复：

- 已在 `acceptance-checklist.md` 和 `test-matrix.md` 中补齐

### R3-3 测试矩阵缺少旧路由和平台差异场景

问题：

- `test-matrix.md` 之前没有直接测旧路由失效，也没有测 Android 导出后系统分享

风险：

- 这些最容易被忽略的场景在回归时无人覆盖

修复：

- 已增加旧路由访问用例
- 已增加 Android 图片导出后分享用例
- 已增加“PNG 导出并开启比赛信息”的用例

### R3-4 文档集缺少审查记录入口和文档漂移风险说明

问题：

- 前两轮已经有审查报告，但主 README 和质量层还没有把“文档自审”纳入体系

风险：

- 审查文件容易沦为孤立记录，无法持续驱动主文档回写

修复：

- 已新增 `docs/DocsReview/README.md`
- 已在 `docs/README.md` 中纳入 `DocsReview/`
- 已在 `known-risks.md` 中新增“文档风险”

## 本轮修复文件

- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/known-risks.md`
- `docs/README.md`
- `docs/DocsReview/README.md`

## 本轮后剩余观察点

- 文档体系已经具备主文档、派生层和审查层三层结构
- 后续如果继续细化，优先方向不再是补目录，而是继续加深 `editor`、`state-management`、`persistence` 和测试用例颗粒度
