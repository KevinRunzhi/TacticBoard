# 05-engineering 审查报告

> 审查日期：2026-03-28  
> 审查范围：`05-engineering/frontend-architecture.md`、`routing-and-shells.md`、`state-management.md`、`persistence-strategy.md`、`README.md`  
> 交叉校验对象：`03-functional/frd/`、`04-domain/`、`07-decisions/`、IA 文档、`01-product/scope-v1.md`、`02-ux/responsive-rules.md`

---

## 总体评价

05-engineering 已经形成了一套比较清楚的实现侧文档分工：

- `frontend-architecture.md`：前端整体边界与模块分层
- `routing-and-shells.md`：路由与 shell 规则
- `state-management.md`：状态归属与边界
- `persistence-strategy.md`：持久化层次与存储方向

这轮 review 没有发现硬性逻辑冲突，问题主要集中在：

- 某些规则在两份文档里重复定义，存在未来漂移风险
- 根路由 `/` 的登录态分流说明还不够显式
- editor seed 传递机制还没有被 V1 工程层裁定
- 个别工程文档缺少实现建议或阅读顺序说明

下面的条目已按本轮修复结果更新，并在修复后打勾。

---

## 问题清单

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| E1 | 🟠 中 | `frontend-architecture.md` §6 与 `state-management.md` §2 对状态分区定义高度重复，存在双源漂移风险。 | `frontend-architecture.md` vs `state-management.md` | ✅ 已修复 |
| E2 | 🟠 中 | `/` 在未登录时并不处于 App shell，但路由与架构文档中原先都把 `/` 无条件列入 App-shell routes / surfaces。 | `routing-and-shells.md` / `frontend-architecture.md` | ✅ 已修复 |
| E3 | 🟠 中 | template/team/preset seed 的传递机制没有被 V1 工程层明确裁定。 | `routing-and-shells.md` / `frontend-architecture.md` / `frd/editor.md` | ✅ 已修复 |
| E4 | 🟢 低 | `frontend-architecture.md` 缺少对未登录 landing surface 的显式说明。 | `frontend-architecture.md` | ✅ 已修复 |
| E5 | 🟢 低 | `persistence-strategy.md` 只有 persistence layer，没有给出 V1 推荐技术落位。 | `persistence-strategy.md` | ✅ 已修复 |
| E6 | 🟢 低 | `state-management.md` 缺少 seed 失效时的 fallback 行为说明。 | `state-management.md` vs `frd/editor.md` | ✅ 已修复 |
| E7 | 🟢 低 | `05-engineering/README.md` 缺少推荐阅读顺序。 | `README.md` | ✅ 已修复 |

---

## 本轮实际修复内容

### ✅ E1 已修复

处理方式：

- 在 `frontend-architecture.md` §6 中增加说明：
  - 详细且 canonical 的状态归属模型以 `state-management.md` 为准
  - 当前章节只保留摘要定位
- 在 `state-management.md` 开头明确：
  - 本文档是 V1 frontend state ownership 的 canonical reference

这样后续状态模型只需要优先改 `state-management.md`。

### ✅ E2 已修复

处理方式：

- `routing-and-shells.md` §2.1 已改成：
  - `/` 仅在已登录 workspace/dashboard 模式下属于 app shell
- `frontend-architecture.md` §4.0 / §4.1 已补上：
  - `/` 在未登录时走 landing surface
  - `/` 在已登录时走 app shell

这样 `/` 的双态语义已经被显式写清。

### ✅ E3 已修复

处理方式：

- `routing-and-shells.md` §5.2 和 §8 已裁定：
  - template seed 用 query params：`/editor?templateId=<id>`
  - team seed 用 query params：`/editor?teamId=<id>`
  - team + preset seed 用 query params：`/editor?teamId=<id>&presetId=<id>`
- `frontend-architecture.md` §8.4 也同步写明同一规则

现在 V1 editor seeded entry 的工程实现机制已经不再模糊。

### ✅ E4 已修复

处理方式：

- `frontend-architecture.md` 新增 `4.0 Root landing behavior`
- 明确：
  - logged-out `/` = landing / home
  - logged-in `/` = workspace / dashboard

### ✅ E5 已修复

处理方式：

- `persistence-strategy.md` 新增 `2.6 Recommended V1 storage mapping`
- 明确了 V1 推荐实现方向：
  - guest-local / user-local 走 browser local storage abstraction
  - workspace asset / version / share 走 repository-backed layer
  - 允许 mock-backed repository 起步，但不能长期依赖静态 seed arrays

### ✅ E6 已修复

处理方式：

- `state-management.md` §4.1 已补充：
  - 如果 seed reference unavailable，editor 必须显示 explicit invalid-seed state
  - 不允许 silent fallback 到 blank draft

### ✅ E7 已修复

处理方式：

- `05-engineering/README.md` 已新增推荐阅读顺序：
  1. `frontend-architecture.md`
  2. `routing-and-shells.md`
  3. `state-management.md`
  4. `persistence-strategy.md`

---

## 当前一致性结论

本轮修复后，以下关键点已经对齐：

- `/` 的登录态分流在产品层、UX 层、工程层一致
- workspace context 仍然是 app-level shared state，而不是 route segment
- seeded editor entry 的传递机制在 FRD 和 engineering 层一致
- state ownership 已指定 `state-management.md` 为 canonical 来源
- persistence strategy 已从“抽象层”补到“可实施建议层”

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

1. 状态归属模型不再存在双源漂移风险  
2. 根路由 `/` 的 shell 语义已经写清  
3. template/team/preset seed 的 V1 工程传递机制已经明确裁定
