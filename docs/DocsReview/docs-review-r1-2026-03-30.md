# Docs Review Round 1

日期：2026-03-30
轮次：第 1 轮
审查范围：

- `docs/01-product/`
- `docs/02-ux/`
- `docs/03-functional/`
- `docs/04-domain/`
- `docs/05-engineering/`
- `docs/06-quality/`
- `docs/07-decisions/`

审查重点：

- 结构一致性
- 范围口径是否和主文档一致
- 是否残留旧产品方向入口

## 结论

第一轮没有发现硬性逻辑冲突，但发现了 4 个会让开发边界变模糊的范围问题，已全部修复。

## 发现与修复

### R1-1 V1 主链路中的 GIF 表述过宽

问题：

- `01-product/scope-v1.md` 将主链路写成了 `PNG/GIF 导出`
- 这会弱化“GIF 为 Windows 首发优先”的平台边界

风险：

- 容易让后续开发或外部协作默认理解为双端都要承担 GIF

修复：

- 已改为 `PNG / Windows GIF 导出`

### R1-2 项目页职责边界还不够硬

问题：

- `03-functional/frd/projects.md` 虽然列了重命名、复制、删除，但没有明确排除分享、团队、模板库、账号动作

风险：

- 前端在补项目卡菜单时容易把旧能力重新接回去

修复：

- 已新增规则：第一阶段不在项目页提供分享、团队、模板库或账号相关操作
- 同时把排序写明确为“默认按最近编辑时间倒序排序”

### R1-3 工作台入口边界还不够硬

问题：

- `03-functional/frd/workspace.md` 对新建项目入口只写了“不经过登录或模板中心”

风险：

- 仍可能有人理解成可以经过其他平台化入口

修复：

- 已改为“不经过登录、模板页或其他平台化入口”
- 并补充最近项目列表不暴露分享、团队或账号相关操作

### R1-4 页面范围 ADR 少写了营销落地页

问题：

- `07-decisions/adr-003-v1-page-scope.md` 影响项中没有写“营销落地页”
- 但 `scope-v1.md` 和 IA 都已经明确不保留它

风险：

- ADR 层可能留下一个缺口，导致后续又重开营销首页讨论

修复：

- 已把“营销落地页”补入 ADR 影响项

## 本轮修复文件

- `docs/01-product/scope-v1.md`
- `docs/02-ux/user-flows.md`
- `docs/03-functional/frd/workspace.md`
- `docs/03-functional/frd/projects.md`
- `docs/07-decisions/adr-003-v1-page-scope.md`

## 本轮后剩余观察点

- 领域层、工程层和质量层已经建立，但还需要下一轮继续检查它们之间的细颗粒度一致性
- 尤其要继续看：状态归属、持久化边界、恢复路径、验收条件是否还能再收紧
