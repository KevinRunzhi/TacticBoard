# 03-functional 审查报告（第二轮复核）

> 审查日期：2026-03-28  
> 审查范围：`03-functional/frd/` 全部 9 份 FRD 文档，以及本轮被影响的跨层文档  
> 交叉校验对象：`routing-and-shells.md`、`versioning-and-sharing.md`、IA 文档

---

## 上轮问题修复确认

| # | 上轮问题 | 修复状态 | 验证说明 |
|---|---------|---------|---------|
| F1 | Root / Landing 路由归属不明 | ✅ 已修复 | `overview.md` 已明确 `/` 在 V1 中按登录态分流；`routing-and-shells.md` 已补 `Root route rule` |
| F2 | 模板分类维度 FRD vs IA 不对齐 | ✅ 已修复 | `templates.md` 已改为“归属 tabs + 类型 filters”双维度；IA 9.2 已同步 |
| F3 | 分享页手机端下载能力空白 | ✅ 已修复 | `share.md` 已新增 `Download / Export Rule`，并在 Mobile / Not in V1 中同步 |
| F4 | `auth.md` 缺少 Shell type | ✅ 已修复 | `auth.md` 已新增 `Page Identity`，明确 `Shell type: Auth shell` |
| F5 | `projects` 操作菜单与 IA 有差异 | ✅ 已修复 | `projects.md` 已改为 share link 管理；`Folder Rule` 已排除文件夹；IA 已同步移除文件夹语义 |
| F6 | `workspace` 的 `create from template` 跳转不清楚 | ✅ 已修复 | `workspace.md` 已明确先进入模板页或模板选择流程，再进入编辑器 |
| F7 | `edit allowed` 在 V1 是否真实存在不清楚 | ✅ 已修复 | `versioning-and-sharing.md` 与 `share.md` 已明确其为未来保留语义，不属于 V1 已实现能力 |
| F8 | `teams` 对归属空间的表述偏窄 | ✅ 已修复 | `teams.md` 已明确球队可属于个人空间或团队空间 |
| F9 | `workspace / templates` 的权限与空间规则不够对称 | ✅ 已修复 | `workspace.md` 已新增权限章节；`templates.md` 已补强 ownership / type 关系 |

**结论：上轮 9 项已全部修复。**

---

## 本轮新增问题

| # | 优先级 | 问题描述 | 涉及文档 | 修复状态 |
|---|--------|---------|---------|---------|
| F10 | 🟡 低 | IA 7.1 仍写“支持文件夹视图或列表/网格视图”，与 `projects.md` 的 `Folder Rule` 冲突 | IA 7.1 vs `frd/projects.md` 5.5 | ✅ 已修复 |

### F10 修复说明

- 已在 [football-tactics-board-information-architecture.md](/E:/code/Project/IDKN/docs/football-tactics-board-information-architecture.md) 的 `7.1 页面定位` 中，将  
  `支持文件夹视图或列表/网格视图`  
  改为  
  `支持列表/网格视图`
- 现在 IA 与 [projects.md](/E:/code/Project/IDKN/docs/03-functional/frd/projects.md) 的 `5.5 Folder Rule` 已完全一致。

---

## FRD 结构完整性矩阵（复核后）

| 检查项 | workspace | editor | projects | share | templates | teams | settings | auth |
|--------|----------|--------|---------|-------|-----------|-------|---------|------|
| page purpose | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| route + entry | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| shell type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| major modules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| primary actions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| permissions/workspace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| device differences | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| failure/edge states | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Not in V1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**8 份核心 FRD × 9 项标准 = 72 项，当前全部通过。**

---

## 跨层同步确认

| 修复项 | 涉及文档 | 状态 |
|--------|---------|------|
| Root route rule | `routing-and-shells.md` | ✅ 已同步 |
| 模板分类口径 | IA 9.2 | ✅ 已同步 |
| Share permission 的 V1 语义 | `versioning-and-sharing.md` / `share.md` | ✅ 已同步 |
| 文件夹语义移除 | IA 7.1 / 7.2 / 7.3 与 `projects.md` | ✅ 已同步 |

---

## 最终结论

- 当前没有发现新的硬性逻辑冲突
- 03-functional 这一层现在可以继续作为 active FRD baseline 使用
- 第二轮复核中新增的唯一残留项 `F10` 已修复完毕

