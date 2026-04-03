# 01-product 文档审查报告

> 审查日期：2026-03-27
> 审查范围：`01-product/scope-v1.md`、`01-product/roadmap.md`、`01-product/README.md`
> 交叉校验对象：`03-functional/frd/overview.md`、`04-domain/domain-model.md`、`05-engineering/routing-and-shells.md`、IA 文档、遗留 PRD

---

## 总体评价

01-product 文件夹是一套极为克制且定位精准的产品层文档：

- `scope-v1.md` 用很短的篇幅冻结了整个 V1 的交付范围和“明确不做”池
- `roadmap.md` 只做 Post-V1 的候选方向排序，不膨胀 V1
- `README.md` 现在已经正确区分了当前 scope/roadmap 与 legacy PRD 的关系

这三份文档自身逻辑干净。以下冲突与补强项已全部修复并同步到对应文档。

---

## 已修复项

### [x] 修复 1：URL 路径中的空间表达 - scope-v1 vs routing-and-shells vs IA

修复结果：
- `scope-v1.md` 已明确写入：V1 的 workspace context 走 app-level shared state，而不是 route path segment。
- `adr-001-workspace-context.md` 已作为正式裁定文档存在。
- IA `14.4 URL 状态穿透` 已改为：路径段表达只是后续扩展方向，不作为当前 V1 路由规范。

当前裁定：
- V1：全局 state
- Future option：路径段

---

### [x] 修复 2：Auth 页面在 scope-v1 / FRD / routing / IA 中的缺口

修复结果：
- `scope-v1.md` 已继续保留 `auth entry pages`
- IA 核心页面树已补入 `认证页 (Auth)` 节点
- IA 中已补 `3.2 认证页补充定位`
- `frd/auth.md` 与 IA 现在已对齐

---

### [x] 修复 3：Formation Template 在 scope-v1 与 domain-model 中的边界差异

修复结果：
- `scope-v1.md` 已改为：
  - `formation templates (standing layout only; no step logic, no line objects, no text structure)`

现在产品层和 domain layer 的边界一致。

---

### [x] 修复 4：scope-v1 缺少对游客态编辑器的定位

修复结果：
- `scope-v1.md` 的 `4.1 Editing` 已补：
  - `guest editor with local draft and login-upgrade path`

现在和 IA、FRD、auth flow 已一致。

---

### [x] 修复 5：responsive scope 中 mobile light editor 的表述不够清楚

修复结果：
- `scope-v1.md` 的 `5. V1 Responsive Scope` 已改为：
  - `Mobile: full viewing plus light editor (same editor page with reduced capability, not a separate editor product)`

现在与 FRD 和编辑器响应式规则一致。

---

### [x] 修复 6：team workspace 的 V1 边界需要显式说明

修复结果：
- `scope-v1.md` 的 `4.4 Workspace model` 已补：
  - `team workspace includes asset isolation and basic invite-code entry`
  - `V1 team workspace does not include real-time co-editing or advanced role-based permissions`

现在与已有产品决策一致。

---

### [x] 修复 7：01-product/README 的 canonical 指向不够明确

修复结果：
- `01-product/README.md` 已改成：
  - 当前 canonical scope/roadmap 为 `scope-v1.md` + `roadmap.md`
  - legacy PRD 仅作为历史参考
  - ongoing implementation 应优先看 layered docs

---

## 当前结论

01-product 这一层现在已经和：
- `03-functional`
- `04-domain`
- `05-engineering`
- IA 文档
- ADR 文档

完成了关键对齐。

当前这份 review 中列出的动作项，均已修复并落盘。

---

## 已同步修复的目标文件

- `docs/01-product/scope-v1.md`
- `docs/01-product/README.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/07-decisions/adr-001-workspace-context.md`

---

## 后续建议

01-product 这一层可以先收住，下一步应继续优先关注：

1. `03-functional` 与 `04-domain` 的实现边界是否持续一致
2. `05-engineering` 与实际前端代码是否发生漂移
3. legacy PRD / requirements 是否需要进一步归档或修复编码
