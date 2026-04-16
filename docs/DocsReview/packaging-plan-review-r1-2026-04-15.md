# Packaging Plan Review R1

Date: 2026-04-15
Scope: `docs/05-engineering/windows-packaging-plan.md`

## Round 1

### Findings

- 文档没有正面处理当前代码使用 `BrowserRouter` 的现实，桌面打包后存在刷新和深链接恢复风险。
- 文档没有把 Tauri `devUrl` 与现有 Vite `8080` 端口对齐写成硬约束，后续接入时容易出现双端口漂移。
- 文档把“路由不会失效”写成目标，但没有定义实现路径，属于验收和实现之间的空洞。

### Fixes applied

- 增加了“当前代码现状”和“桌面路由策略”的明确说明。
- 明确要求 Windows 打包前抽统一 Router 入口。
- 明确 Web 端继续 `BrowserRouter`，Windows 桌面端切换为更稳妥的桌面路由策略。
- 将 `devUrl` 与 Vite `8080` 端口对齐写成显式约束。

### Remaining risks

- 还没有落到代码实现，后续真正接 Tauri 时仍需按文档执行。

## Round 2

### Findings

- 文档定义了文件保存和文件选择抽象，但没有写到 Tauri 2 的 capability 权限配置。
- 如果不提前规划权限文件，`fs/dialog` API 接入时会在运行时失败。
- 文档没有强调“不能用浏览器下载假装完成 Windows 导出适配”。

### Fixes applied

- 在新增目录中加入 `src-tauri/capabilities/`。
- 在 Step 1 中加入最小权限能力文件配置。
- 将 PNG / GIF 导出和参考底图导入的原生能力接入写成验收约束。
- 新增 “Tauri 权限配置缺失导致功能不可用” 风险项。

### Remaining risks

- 实现阶段仍需按最小权限原则落配置，不能一次放开过宽权限。

## Round 3

### Findings

- 文档没有明确浏览器版、`tauri dev` 开发版、正式 Windows 产物之间的本地存储隔离。
- 如果不写清这一点，后续极易把“不同 origin 的 localStorage 不互通”误判成数据丢失 bug。
- 文档虽然提到 localStorage 风险，但没有把“应用标识冻结”和“跨环境不承诺自动迁移”写成验收前提。

### Fixes applied

- 在存储章节中明确区分浏览器版、`tauri dev`、正式安装包三类数据环境。
- 明确第一阶段不承诺自动迁移浏览器数据和开发版数据。
- 将“正式 Windows 产物自身的数据持久化稳定”定义为第一阶段真正验收目标。
- 新增 “开发版与正式版存储隔离被误判为 bug” 风险项。

### Remaining risks

- 如果后续需要浏览器版到桌面版的数据迁移，仍需单独设计迁移机制。

## Conclusion

经过三轮修订后，这份 Windows 打包方案已经比初稿更可执行，主要冲突点已经收紧到：

- 路由策略
- 端口对齐
- Tauri 权限模型
- 本地数据环境边界

当前仍未落地的部分是实现，不是文档本身的结构性漏洞。
