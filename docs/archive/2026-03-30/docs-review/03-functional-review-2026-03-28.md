# 03-functional 审查报告

> 审查日期：2026-03-28  
> 审查范围：`03-functional/frd/` 下全部 9 份 FRD 文档  
> 交叉校验对象：`01-product/scope-v1.md`、IA 文档、`02-ux/user-flows.md`、`02-ux/responsive-rules.md`、`04-domain/domain-model.md`、`04-domain/entity-lifecycle.md`、`04-domain/versioning-and-sharing.md`、`05-engineering/routing-and-shells.md`

---

## 总体评价

03-functional 这一层目前已经是整套文档体系里最接近“可执行规格”的一层：

- 页面职责、模块、行为、状态、设备规则结构统一
- 与 domain / engineering / UX 的映射关系已经基本建立
- 当前问题主要是跨层口径收口，而不是 FRD 自身结构失控

本轮已按审查意见完成修复，并在下方逐项打勾确认。

---

## 修复清单

- [x] **F1：Root / Landing 路由归属不明确**
  - 已在 [overview.md](/E:/code/Project/IDKN/docs/03-functional/frd/overview.md) 的 `4.3 Routing Contract` 中明确：
    - `/` 是 V1 唯一根路由
    - 未登录时渲染 landing / home
    - 已登录时渲染 workspace / dashboard
  - 已在 [routing-and-shells.md](/E:/code/Project/IDKN/docs/05-engineering/routing-and-shells.md) 中同步补充 `2.0 Root route rule`

- [x] **F2：templates FRD 与 IA 的分类维度不完全对齐**
  - 已在 [templates.md](/E:/code/Project/IDKN/docs/03-functional/frd/templates.md) 中明确：
    - 一级 `category tabs` 按归属维度切换：`all / official / workspace`
    - 二级 `type filter` 按模板类型切换：`all types / project templates / formation templates`
  - 已在 [football-tactics-board-information-architecture.md](/E:/code/Project/IDKN/docs/football-tactics-board-information-architecture.md) 的模板中心模块说明中同步为同一套口径

- [x] **F3：share 页面在手机端是否允许下载/导出未明确**
  - 已在 [share.md](/E:/code/Project/IDKN/docs/03-functional/frd/share.md) 中新增 `4.5 Download / Export Rule`
  - 已明确：
    - V1 分享页不提供专门的导出/下载工作流
    - 分享页主目标是查看与复制副本
    - 浏览器原生的图片保存不属于产品级分享行为
  - 已在 `8.2 Mobile` 与 `9. Not in V1` 中同步体现

- [x] **F4：auth FRD 缺少 Shell type 声明**
  - 已在 [auth.md](/E:/code/Project/IDKN/docs/03-functional/frd/auth.md) 中新增 `1. Page Identity`
  - 已明确 `Shell type: Auth shell`

- [x] **F5：projects FRD 与 IA 对项目菜单能力边界不完全一致**
  - 已在 [projects.md](/E:/code/Project/IDKN/docs/03-functional/frd/projects.md) 中将 `share` 收口为 `create or manage share link`
  - 已新增 `5.5 Folder Rule`，明确 V1 不支持项目文件夹/移动到文件夹
  - 已在 IA 文档的项目页章节中移除“移动至文件夹”，并改为通过空间、筛选、排序整理项目

- [x] **F6：workspace 的“create from template”入口与 editor entry sources 关系不清**
  - 已在 [workspace.md](/E:/code/Project/IDKN/docs/03-functional/frd/workspace.md) 中明确：
    - `create from template` 应进入模板页或模板选择流程
    - 只有在选定具体模板后才进入编辑器
  - 这样与 [editor.md](/E:/code/Project/IDKN/docs/03-functional/frd/editor.md) 当前的 entry sources 保持一致

- [x] **F7：share 权限里的 `edit allowed` 在 V1 是否真实存在未说明**
  - 已在 [versioning-and-sharing.md](/E:/code/Project/IDKN/docs/04-domain/versioning-and-sharing.md) 的 `8.1 Share capability levels` 中明确：
    - `read-only` 与 `copy allowed` 为 V1 已实现行为
    - `edit allowed` 仅为未来保留术语，不属于 V1 已实现分享能力
  - 已在 [share.md](/E:/code/Project/IDKN/docs/03-functional/frd/share.md) 的 `5.2 Permission Handling` 中同步说明：V1 分享页不暴露直接编辑控件

- [x] **F8：teams FRD 对球队归属空间的表述偏窄**
  - 已在 [teams.md](/E:/code/Project/IDKN/docs/03-functional/frd/teams.md) 中明确：
    - 球队可存在于个人空间或团队空间
    - 当前活动空间决定可见与可编辑的球队集合
  - 与 domain 层 `workspace-bound ownership` 规则对齐

- [x] **F9：workspace / templates 对权限与空间行为的定义不够对称**
  - [workspace.md](/E:/code/Project/IDKN/docs/03-functional/frd/workspace.md) 已新增 `8. Permission and Workspace Rules`
  - [templates.md](/E:/code/Project/IDKN/docs/03-functional/frd/templates.md) 原有权限章节已补强，明确 ownership tabs 与 type filters 的关系
  - 现在与 [overview.md](/E:/code/Project/IDKN/docs/03-functional/frd/overview.md) 的 “Definition of Done” 对齐

---

## 本轮实际变更的文件

- [overview.md](/E:/code/Project/IDKN/docs/03-functional/frd/overview.md)
- [templates.md](/E:/code/Project/IDKN/docs/03-functional/frd/templates.md)
- [share.md](/E:/code/Project/IDKN/docs/03-functional/frd/share.md)
- [auth.md](/E:/code/Project/IDKN/docs/03-functional/frd/auth.md)
- [projects.md](/E:/code/Project/IDKN/docs/03-functional/frd/projects.md)
- [workspace.md](/E:/code/Project/IDKN/docs/03-functional/frd/workspace.md)
- [teams.md](/E:/code/Project/IDKN/docs/03-functional/frd/teams.md)
- [versioning-and-sharing.md](/E:/code/Project/IDKN/docs/04-domain/versioning-and-sharing.md)
- [routing-and-shells.md](/E:/code/Project/IDKN/docs/05-engineering/routing-and-shells.md)
- [football-tactics-board-information-architecture.md](/E:/code/Project/IDKN/docs/football-tactics-board-information-architecture.md)

---

## 复查结论

- 当前没有发现新的硬性逻辑冲突
- 这轮主要完成的是：
  - 路由归属收口
  - 模板分类维度收口
  - 分享权限与下载语义收口
  - workspace / teams 的空间边界补强

03-functional 这一层现在可以继续作为 active FRD baseline 使用。

