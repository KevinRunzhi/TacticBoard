# Packaging Plan Review R2

Date: 2026-04-15
Scope: `docs/05-engineering/windows-packaging-plan.md`

## Round 1

### Findings

- 文档对 Tauri 2 的依赖写法还不够准确，容易让实现阶段误以为只要 `@tauri-apps/api` 即可。
- 文档没有把 `beforeDevCommand`、`beforeBuildCommand`、`frontendDist` 写成明确配置项。
- 文档没有要求同步调整当前 `vite.config.ts` 的 Tauri 适配项，实施时容易遗漏 `strictPort` 与开发宿主设置。

### Fixes applied

- 明确第一阶段优先依赖 `@tauri-apps/plugin-dialog` 与 `@tauri-apps/plugin-fs`。
- 增加了 `tauri.conf.json` 中 `beforeDevCommand`、`beforeBuildCommand`、`devUrl`、`frontendDist` 的落点。
- 增加了 `vite.config.ts` 在 Tauri 接入阶段需要补齐的最低要求。

### Remaining risks

- 具体配置值仍需在真正接入代码时保持与当前项目脚本同步。

## Round 2

### Findings

- 文档虽然定义了文件选择抽象，但没有写出当前代码真实消费的是浏览器 `File` 对象。
- Windows 下 Tauri 文件对话框更自然返回路径，而不是浏览器 `File`；如果只做“打开对话框”，参考底图导入并不会真的接通。
- 导出策略虽然提到保存文件，但没有明确二进制写入链路。

### Fixes applied

- 在文档中补充了“当前前端导入链路消费的是浏览器 `File`”这一现实。
- 明确要求在 Windows 适配层做“路径 -> 资产输入结构”的转换。
- 在 PNG / GIF 导出策略中补上了 `dialog.save + plugin-fs` 的桌面保存思路和二进制写入要求。

### Remaining risks

- 实现时仍需决定是保持 `File` 兼容，还是重构为统一资产描述对象。

## Round 3

### Findings

- 文档还没有明确第一阶段 Windows 打包的交付边界，容易膨胀到多架构、多安装器、多种产物并行。
- 文档也没有明确未签名 Windows 安装包触发 SmartScreen 是预期现象，后续容易被误判为打包失败。

### Fixes applied

- 明确第一阶段仅面向 `Windows x64`。
- 明确第一阶段只选择一种主要产物类型，不同时做安装版、便携版和多安装器并行。
- 将未签名产物可能触发 SmartScreen 写成已知风险和交付说明要求。

### Remaining risks

- 如果后续确实要扩展到 ARM64 或多产物分发，需要单独开新一轮打包方案。

## Conclusion

第二轮三次审查后，这份 Windows 打包方案已经把最容易导致返工的实现级漏洞进一步收紧到了以下边界：

- Tauri 2 依赖与配置项
- 当前前端 `File` 接口与桌面路径返回值的差异
- 二进制文件保存链路
- Windows 第一阶段交付范围与未签名分发预期

当前剩余问题主要是实现工作，不再是方案本身缺失关键约束。
