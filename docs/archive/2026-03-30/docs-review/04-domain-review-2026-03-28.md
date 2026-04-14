# 04-domain 审查报告

> 审查日期：2026-03-28  
> 审查范围：`04-domain/domain-model.md`、`04-domain/entity-lifecycle.md`、`04-domain/versioning-and-sharing.md`  
> 交叉校验对象：`01-product/scope-v1.md`、`03-functional/frd/`、`05-engineering/state-management.md`、`05-engineering/persistence-strategy.md`、IA 文档、`02-ux/user-flows.md`

---

## 总体评价

04-domain 这一层整体已经很稳，三份文档的职责也比较清楚：

- `domain-model.md`：实体定义与高层关系
- `entity-lifecycle.md`：生命周期、复制/移动/刷新规则
- `versioning-and-sharing.md`：版本与分享的专项规则

这轮 review 里没有发现新的硬性逻辑冲突，主要问题集中在：

- 少数跨层定义没有完全同步
- 个别表述容易引发误读
- 一些 V1 边界可以进一步写得更显式

下面的条目已经按本轮修复结果更新，并在修复完成后打勾。

---

## 问题清单

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| D1 | 🟠 中 | `entity-lifecycle.md` §10.2 原先写成 “Team belongs to team workspace scope”，与 `frd/teams.md` 中“team 可属于 personal 或 team workspace”不一致。 | `entity-lifecycle.md` vs `frd/teams.md` | ✅ 已修复 |
| D2 | 🟠 中 | `domain-model.md` §2.3 原先只列出两种 version type，缺少 `restore-generated version`，与 lifecycle / versioning 文档不一致。 | `domain-model.md` vs `entity-lifecycle.md` / `versioning-and-sharing.md` | ✅ 已修复 |
| D3 | 🟠 中 | `domain-model.md` §4 仍把 “workspace-aware routing and URL policy” 列为高风险，但 V1 已由 ADR-001 裁定为空间走 app-level state。 | `domain-model.md` vs `adr-001-workspace-context.md` | ✅ 已修复 |
| D4 | 🟡 低 | `entity-lifecycle.md` §4.3 中 “auto-populates” 的措辞容易让人误读为系统自动触发，而不是用户选阵型后的结果。 | `entity-lifecycle.md` vs `frd/editor.md` / `user-flows.md` | ✅ 已修复 |
| D5 | 🟡 低 | `entity-lifecycle.md` 缺少像 `versioning-and-sharing.md` 那样的 V1 out-of-scope 总结段落。 | `entity-lifecycle.md` | ✅ 已修复 |
| D6 | 🟡 低 | `domain-model.md` §2.9 原先写成 “workspace-specific player library”，容易暗示存在独立于 team 的通用工作区球员库，与 `teams` 页面结构不够对齐。 | `domain-model.md` vs `frd/teams.md` / `entity-lifecycle.md` | ✅ 已修复 |
| D7 | 🟡 低 | `versioning-and-sharing.md` §10.2 中的 “project move” 容易和项目页里已排除的 folder move 语义混淆。 | `versioning-and-sharing.md` vs `frd/projects.md` | ✅ 已修复 |

---

## 本轮实际修复内容

### ✅ D1 已修复

`entity-lifecycle.md` §10.2 已改为：

- Team belongs to a workspace scope and may exist in either personal or team workspace.

这样现在和 `frd/teams.md` 的工作区归属规则保持一致。

### ✅ D2 已修复

`domain-model.md` §2.3 已补充：

- restore-generated version

现在 version types 与 `entity-lifecycle.md`、`versioning-and-sharing.md` 完全对齐。

### ✅ D3 已修复

`domain-model.md` §4 的高风险列表已不再保留已被 ADR-001 裁定的问题，改为：

- workspace switching data isolation and stale state reset

这样更符合当前仍有实现风险的真实问题。

### ✅ D4 已修复

`entity-lifecycle.md` §4.3 已改为：

- Selecting a formation populates player objects on the active step.

这能更准确表达“用户触发选阵型后”的结果，而不是系统自动行为。

### ✅ D5 已修复

`entity-lifecycle.md` 已新增：

- `## 18. V1 Out of Scope Summary`

与 `versioning-and-sharing.md` 的结构保持更一致。

### ✅ D6 已修复

`domain-model.md` §2.9 已收紧为：

- player profile belongs to a team-scoped player library within a workspace
- in V1, player profiles are managed inside team context

这和 `teams` 页面中的 player library 承载方式更一致。

### ✅ D7 已修复

`versioning-and-sharing.md` §10.2 已补充说明：

- Move here refers to cross-workspace transfer, not folder reorganization.

这样不会再和项目页的 folder rule 混淆。

---

## 三文档内部一致性结论

本轮修复后，以下关键点已经对齐：

- Project Version 的三种类型在三份文档中一致
- Team 的 workspace 归属在 domain 和 FRD 中一致
- Formation 选择后的球员生成语义在 UX、FRD、domain 中一致
- Share / copy / move 的高层语义与项目页、分享页规则一致
- Player Profile 的归属语义与 teams 页面结构一致

当前未发现新的硬性逻辑冲突。

---

## 总结

| 统计项 | 数量 |
|--------|------|
| 硬性逻辑冲突 | 0 |
| 本轮中优先级问题 | 3，已全部修复 |
| 本轮低优先级问题 | 4，已全部修复 |
| 当前阻塞研发的问题 | 0 |

本轮最重要的收口结果：

1. `Team` 的 workspace 归属语义在 domain / FRD 间彻底一致  
2. `Project Version` 类型定义完整一致  
3. `workspace-aware routing` 不再作为一个已被裁定的问题继续留在高风险列表中
