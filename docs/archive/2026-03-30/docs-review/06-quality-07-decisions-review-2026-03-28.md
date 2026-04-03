# 06-quality + 07-decisions 审查报告

> 审查日期：2026-03-28
> 审查范围：`06-quality/acceptance-checklist.md`、`test-matrix.md`、`known-risks.md`、`README.md`；`07-decisions/adr-001`、`adr-002`、`adr-003`、`README.md`
> 交叉校验对象：`01-product/scope-v1.md`、`03-functional/frd/` 全部页面、`04-domain/` 三份文档、`05-engineering/` 四份文档、`02-ux/` 两份文档、IA 文档

---

## 06-quality 总体评价

06-quality 三份文档形成了"验收标准 → 测试矩阵 → 已知风险"的完整质量闭环：

- `acceptance-checklist.md` — 按页面列出 V1 release gate（6 个页面 + 响应式 + release blockers）
- `test-matrix.md` — 高优先级测试组合矩阵（设备 × 空间 × 入口模式）+ 边缘 case + 手动回归集
- `known-risks.md` — 分产品/UX/工程/质量四维度的风险登记

文档结构清晰，与上游 FRD / domain / engineering 的映射关系明确。

---

## 06-quality 问题清单

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| Q1 | 🟡 中 | **acceptance-checklist §5 Templates 仍写 "official/private/project/formation templates are distinguishable"，但模板分类维度已在 F2 修复中统一为 "归属 tab (all/official/workspace) + 类型 filter (project/formation)"**。checklist 用的是旧的四并列分类法，与最新的 FRD templates §5.2/§5.3 和 IA §9.2 不对齐。建议改为验收"归属 tab 与类型 filter 正交组合是否可区分"。 | `acceptance-checklist.md` §5 vs `frd/templates.md` §5.2/§5.3 | ⬜ 未修复 |
| Q2 | 🟡 中 | **acceptance-checklist §7 Editor 第 7 条写 "formation selection can auto-place players"**。"auto-place" 措辞与 D4 修复后的 entity-lifecycle §4.3 "Selecting a formation populates player objects" 和 user-flows §3 "user intentionally selects a formation" 不一致。建议改为 "formation selection by the user populates players on the active step"。 | `acceptance-checklist.md` §7 vs `entity-lifecycle.md` §4.3 | ⬜ 未修复 |
| Q3 | 🟡 中 | **test-matrix §5 的 Templates 行仍按旧分类写 "use formation template to create"，但没有测试"归属 tab 切换后模板列表是否正确刷新"**。FRD templates §6.4 Workspace Switching 明确写了 "Switching workspace must reload the template set"，这是一个高价值测试场景但 test-matrix 中完全没有。建议在 §5 中新增一行：`Templates | switch workspace | Desktop | both | template list refreshes to new workspace`。 | `test-matrix.md` §5 vs `frd/templates.md` §6.4 | ⬜ 未修复 |
| Q4 | 🟢 低 | **test-matrix §5 缺少 guest trial flow 的专项测试行**。当前只有 `Auth | guest save/share gate` 和 `Auth | bind current guest draft` 两行，但没有覆盖完整的游客试用链路（从首页进入游客态编辑器 → 本地草稿 → 触发 gated action → auth → binding）。user-flows §2 和 FRD editor §9.1 都定义了 guest editing state，test-matrix 可以补一行端到端场景。 | `test-matrix.md` §5 vs `user-flows.md` §2 | ⬜ 未修复 |
| Q5 | 🟢 低 | **test-matrix §5 缺少 share page mobile 的专项测试行**。IA §11.3 强调 "移动优先（Mobile First）：极高比例的分享页查阅发生于微信内部或手机端浏览器"。当前 test-matrix 中 Share 行只有 `invalid link | Mobile` 和两行 Desktop copy 场景，**没有 "valid share page playback on Mobile" 这一核心场景**。 | `test-matrix.md` §5 vs IA §11.3 | ⬜ 未修复 |
| Q6 | 🟢 低 | **known-risks §2 缺少 "guest draft loss" 风险**。persistence-strategy §4.1 明确要求 "Guest users should not lose the current active draft because they opened auth flow"。这是一个容易被忽略的实现风险——auth 页面的 redirect 可能导致 SPA 卸载、localStorage 被清除等问题。建议在 §2 或 §4 中补一条风险。 | `known-risks.md` vs `persistence-strategy.md` §4.1 | ⬜ 未修复 |
| Q7 | 🟢 低 | **known-risks 缺少 "seed params 被用户篡改" 风险**。routing-and-shells §5.2 已裁定 seed 通过 query params 传递（`/editor?templateId=xxx`）。那么用户可以手动修改 URL 中的 templateId/teamId/presetId 指向不存在的资源。state-management §4.1 已定义了 invalid-seed fallback 行为，但 known-risks 没有登记这个风险面。 | `known-risks.md` vs `routing-and-shells.md` §5.2 | ⬜ 未修复 |
| Q8 | 🟢 低 | **acceptance-checklist §2 Product-Wide Gates 和 §8 Share 都没有提及"分享页 V1 不提供导出/下载"这条验收约束**。FRD share §4.5 和 §9 明确了 V1 share page 不提供 dedicated export/download。如果前端实现者不小心加了下载按钮，验收 checklist 里没有对应的排除项作为把关。建议在 §8 或 §11 中补一条负面验证："share page must not expose export/download controls in V1"。 | `acceptance-checklist.md` §8 vs `frd/share.md` §4.5 | ⬜ 未修复 |

---

## 07-decisions 总体评价

07-decisions 包含 3 份 ADR，均采用标准的 Status / Context / Decision / Consequences 四段式结构。

三份 ADR 的裁定内容已被下游文档（scope-v1、routing-and-shells、versioning-and-sharing、responsive-rules 等）完整吸收。

---

## 07-decisions 问题清单

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| A1 | 🟡 中 | **缺少 ADR-004 for root route `/` 分流策略**。V1 的 `/` 按登录态分流（logged-out → landing, logged-in → workspace）是一项跨层影响广泛的架构裁定——它影响了 FRD overview §4.3、routing-and-shells §2.0、frontend-architecture §4.0。但它没有对应的 ADR 来记录裁定原因和替代方案（如"是否用 `/home` 作为独立路由"）。建议补一份轻量级 ADR-004。 | `07-decisions/` | ⬜ 未修复 |
| A2 | 🟡 中 | **缺少 ADR-005 for seed transport mechanism**。V1 裁定 template/team/preset seed 通过 query params 传递（`/editor?templateId=xxx`），这是在本轮 E3 修复中落地的工程决策。建议补一份 ADR-005 记录裁定理由（为什么选 query params 而非 navigation state 或 context store）。 | `07-decisions/` | ⬜ 未修复 |
| A3 | 🟢 低 | **ADR-001 的 Decision 段没有引用 scope-v1 §4.4 或 routing-and-shells §8 作为 "see also"**。ADR 的读者可能想知道这个裁定在哪些下游文档中被消费了。建议在 Consequences 末尾加一行 "See also: routing-and-shells.md §8, scope-v1 §4.4"。 | `adr-001-workspace-context.md` | ⬜ 未修复 |
| A4 | 🟢 低 | **ADR-003 的 Decision 段没有标注 "fixed version share is the V1 default"**。versioning-and-sharing §5.1 和 §2.2 都明确了固定版本是默认分享类型，但 ADR-003 只说 "V1 supports: fixed version share links / dynamic project share links"，没有指出默认值。建议补一句 "Default share behavior in V1 is fixed version share."。 | `adr-003-sharing-model.md` vs `versioning-and-sharing.md` §5.1 | ⬜ 未修复 |

---

## 与全文档体系交叉校验

### acceptance-checklist vs FRD

| FRD 页面 | checklist 覆盖 | 状态 |
|---------|--------------|------|
| workspace §5-§6 | §3 (4 条) | ✅ 覆盖 |
| projects §4-§6 | §4 (5 条) | ✅ 覆盖 |
| templates §5-§7 | §5 (4 条) | ⚠️ 分类维度过时 (Q1)，缺 workspace switch 测试 (Q3) |
| teams §4-§7 | §6 (4 条) | ✅ 覆盖 |
| editor §4-§9 | §7 (10 条) | ⚠️ formation 措辞 (Q2) |
| share §4-§7 | §8 (6 条) | ⚠️ 缺 V1 不提供下载的负面验证 (Q8) |
| auth §4-§7 | §9 (4 条) | ✅ 覆盖 |
| settings §3-§6 | §9 (含在 auth 段) | ✅ 覆盖 |

### known-risks vs engineering risks

| engineering 风险面 | known-risks 覆盖 | 状态 |
|------------------|----------------|------|
| workspace context drift | §2.1 | ✅ 覆盖 |
| seeded editor context loss | §2.2 | ✅ 覆盖 |
| share semantics confusion | §2.3 | ✅ 覆盖 |
| static mock dependency | §4.1 | ✅ 覆盖 |
| state duplication | §4.2 | ✅ 覆盖 |
| editor/share state coupling | §4.3 | ✅ 覆盖 |
| guest draft loss on auth redirect | — | ⚠️ 未登记 (Q6) |
| seed params URL tampering | — | ⚠️ 未登记 (Q7) |

### ADR vs 下游消费

| ADR | 下游文档消费情况 | 状态 |
|-----|----------------|------|
| ADR-001 workspace context | scope-v1 §4.4 / routing §8 / frontend-arch §9 / domain-model §3.2 | ✅ 已被消费 |
| ADR-002 editor layout | scope-v1 §5 / responsive-rules §6 / FRD editor §7 / frontend-arch §3.1 | ✅ 已被消费 |
| ADR-003 sharing model | versioning §4-§5 / FRD share §3 / scope-v1 §4.3 | ✅ 已被消费（但 ADR 缺 default 标注 A4） |
| ADR-004 root route (缺) | FRD overview §4.3 / routing §2.0 / frontend-arch §4.0 | ⚠️ 缺 ADR (A1) |
| ADR-005 seed transport (缺) | routing §5.2 / frontend-arch §8.4 | ⚠️ 缺 ADR (A2) |

---

## 总结

| 层 | 硬性冲突 | 🟡 中优先级 | 🟢 低优先级 | 阻塞研发 |
|----|---------|-----------|-----------|---------|
| 06-quality | 0 | 3 (Q1, Q2, Q3) | 5 (Q4-Q8) | 0 |
| 07-decisions | 0 | 2 (A1, A2) | 2 (A3, A4) | 0 |

**06-quality 最值得修的 3 项：**

1. **Q1** — acceptance-checklist §5 模板分类验收条件用的是旧的四并列法，需与最新的归属+类型正交体系对齐
2. **Q2** — acceptance-checklist §7 "auto-place" 措辞与全文档体系已统一的"用户主动触发"表述不一致
3. **Q3** — test-matrix 缺少 "workspace switch 后模板列表刷新" 这条高价值测试场景

**07-decisions 最值得补的 2 项：**

1. **A1** — 补 ADR-004 记录 `/` root route 分流策略的裁定
2. **A2** — 补 ADR-005 记录 seed transport query params 的裁定
