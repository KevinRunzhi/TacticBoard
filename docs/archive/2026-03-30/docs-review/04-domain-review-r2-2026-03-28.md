# 04-domain 审查报告（第二轮复核）

> 审查日期：2026-03-28
> 审查范围：`04-domain/domain-model.md`、`entity-lifecycle.md`、`versioning-and-sharing.md`
> 交叉校验对象：`frd/teams.md`、`frd/editor.md`、`user-flows.md`、`07-decisions/adr-001`

---

## 上轮问题修复确认

| # | 上轮问题 | 修复状态 | 验证说明 |
|---|---------|---------|---------|
| D1 | 🟡 lifecycle §10.2 Team 归属限定 team workspace | ✅ 已修复 | §10.2 改为 `Team belongs to a workspace scope and may exist in either personal or team workspace` |
| D2 | 🟡 domain-model §2.3 Version types 缺 restore-generated | ✅ 已修复 | §2.3 Types 已补上 `restore-generated version`，现与 lifecycle §6.1 / versioning §3.1 一致 |
| D3 | 🟡 domain-model §4 High-Risk "workspace-aware routing" 已裁定 | ✅ 已修复 | §4 第 2 项改为 `workspace switching data isolation and stale state reset`，不再引用已裁定的 ADR-001 问题 |
| D4 | 🟢 lifecycle §4.3 "auto-populates" 措辞误导 | ✅ 已修复 | 改为 `Selecting a formation populates player objects on the active step`，与 FRD editor §6.5 / user-flows §3 一致 |
| D5 | 🟢 lifecycle 缺 V1 Out of Scope 总结 | ✅ 已修复 | 新增 §18 V1 Out of Scope Summary（4 条排除项） |
| D6 | 🟢 domain-model §2.9 Player Profile 归属不明 | ✅ 已修复 | §2.9 改为 `belongs to a team-scoped player library within a workspace`，明确 V1 球员管理在 team context 下 |
| D7 | 🟢 versioning §10.2 "move" 含义易混淆 | ✅ 已修复 | §10.2 末尾加注 `Move here refers to cross-workspace transfer, not folder reorganization.` |

**结论：上轮 7 项全部修复完毕。**

---

## 本轮新发现

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| （无） | — | 本轮未发现新的冲突或遗漏。 | — | — |

---

## 三文档内部一致性（更新后）

| 检查维度 | domain-model | entity-lifecycle | versioning-and-sharing | 状态 |
|---------|-------------|-----------------|----------------------|------|
| Version types | §2.3 (3 种) | §6.1 (3 种) | §3.1 (3 种) | ✅ 完全一致 |
| Team workspace | — | §10.2 personal or team | — | ✅ 与 FRD teams 对齐 |
| Formation rule | §2.6 | §9.2 | — | ✅ 一致 |
| Player Profile scope | §2.9 team-scoped | §12 team context | — | ✅ 一致 |
| Snapshot-first | §3.1 | §2.1 | — | ✅ 一致 |
| Move semantics | — | — | §10.2 + 注释 | ✅ 明确 |
| V1 Out of Scope | — | §18 (4 条) | §14 (5 条) | ✅ 互补覆盖 |
| Lifecycle invariants | — | §16 (6 条) | §13 (6 条) | ✅ 互补无重复 |

---

## 04-domain 最终状态

| 文件 | 状态 |
|------|------|
| `domain-model.md` | ✅ 稳定 — Version types 补齐、Player Profile 收紧、High-Risk 更新 |
| `entity-lifecycle.md` | ✅ 稳定 — Team 归属对齐、formation 措辞修正、V1 排除列表补齐 |
| `versioning-and-sharing.md` | ✅ 稳定 — move 注释到位、edit allowed V1 预留标注到位 |

**04-domain 这一层可以收住。**
