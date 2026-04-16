# Windows 打包开发指导

## 1. 文档目标

这份文档用于指导 Windows 打包分支上的实际开发方式。

目标：

- 固定 Windows 打包阶段的分支策略
- 固定“单一业务源码 + 平台壳层”的开发原则
- 明确允许改动的目录、禁止做法、验证顺序和合并规则
- 降低后续同时维护 Web、Windows、Android 时的分叉风险

## 2. 推荐分支策略

Windows 打包阶段建议新建专用分支：

- `develop-windows-packaging`

推荐基线：

- 从当前稳定的 `develop` 拉出 `develop-windows-packaging`

原因：

- `develop` 已经承接当前 Web 主链路和文档基线
- Windows 打包属于“平台适配开发”，不应直接污染稳定主线
- 独立分支更方便回滚和审查阶段性改动

### 2.1 长分支同步规则

`develop-windows-packaging` 是一个中期开发分支，不应长期脱离 `develop` 独自演化。

要求：

- 每完成一个实施阶段前，先同步一次最新 `develop`
- 如果 `develop` 上有新的 Web 主链路修复，优先先合到 Windows 分支再继续打包开发
- 不建议让 Windows 分支长期积压大量未同步改动后再一次性回合

原因：

- Windows 打包本质上是“在现有 Web 应用上加桌面壳”
- 如果 Windows 分支和 `develop` 漂移过远，后面会同时处理平台问题和业务回归问题，成本会明显上升

## 3. 核心原则

Windows 打包阶段必须遵守以下原则：

1. 业务源码保持单一来源
2. 平台差异只放在壳层和桥接层
3. 不为 Windows 复制一份前端项目
4. 不以破坏 Web 版本为代价换取 Windows 版本可运行

一句话原则：

- `Web / Windows / 后续 Android 共用同一套前端业务代码`

## 4. 单一源码原则

### 4.1 必须保留的单一业务源码

当前唯一业务源码目录仍然是：

- `tactics-canvas-24/src/`

这一层继续承载：

- 页面
- 编辑器组件
- 项目状态
- 本地保存逻辑
- 导出逻辑
- 测试

### 4.2 允许新增的平台壳层目录

Windows 打包第一阶段允许新增：

- `tactics-canvas-24/src-tauri/`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`

### 4.3 明确禁止

不允许新增：

- `tactics-canvas-24-web/`
- `tactics-canvas-24-windows/`
- `src-desktop/`
- `src-windows/`
- 任何复制现有 `src/` 业务代码的平行目录

不允许把项目拆成：

- 一套 Web 业务代码
- 一套 Windows 业务代码

原因：

- 后续每次修 bug、补功能、调交互都要改两遍
- 很快会导致 Web、Windows、Android 三端行为漂移

## 5. 允许改动的代码层

Windows 第一阶段优先允许改动：

- `tactics-canvas-24/package.json`
- `tactics-canvas-24/vite.config.ts`
- `tactics-canvas-24/src-tauri/**`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`
- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/main.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`

Windows 第一阶段尽量不要动：

- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/types/tactics.ts`
- `tactics-canvas-24/src/pages/**`

例外原则：

- 只有在桌面接入被现有类型或主链路硬阻塞时，才允许做最小修正
- 不允许借 Windows 打包之机顺手重构编辑器核心状态

### 5.1 平台桥职责边界

平台桥只负责：

- 平台识别
- 文件选择
- 文件保存
- 路由容器差异
- 路径到前端可消费输入结构的转换

平台桥不负责：

- 修改编辑器核心状态
- 重写对象模型
- 注入额外业务规则
- 在组件外偷偷持有第二套桌面专用业务状态

原则：

- 平台桥是 I/O 适配层，不是第二业务层

## 6. 平台边界规则

### 6.1 Tauri API 不得泄漏到业务层

不允许在这些位置直接使用 `@tauri-apps/*`：

- `src/components/**`
- `src/pages/**`
- `src/hooks/**`

Tauri 相关调用只能收口在：

- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`

### 6.2 组件层不直接处理路径

组件层不应直接消费：

- 原生路径字符串
- Tauri 原始返回值

组件层只消费平台桥提供的统一结果。

### 6.3 参考底图导入决策

Windows 第一阶段已明确采用：

- `兼容 File 桥`

即：

```text
Tauri 路径
-> 读取文件
-> 转成浏览器兼容 File
-> 继续走现有 onReferenceImageImport(file)
```

第一阶段不做：

- 统一重写组件契约为资产对象模式

## 7. Router 规则

当前代码里：

- Web 使用 `BrowserRouter`

Windows 第一阶段要求：

- Web 继续使用 `BrowserRouter`
- Windows 桌面端切换为更稳妥的桌面路由策略
- Router 选择必须集中在统一入口，不允许散落在页面组件里

不允许的做法：

- 直接把现有 Web 路由整体替换成桌面路由
- 先硬打包 `BrowserRouter`，后面再补救

## 8. 存储与数据环境规则

必须明确区分三种环境：

1. 浏览器版本地数据
2. `tauri dev` 本地数据
3. 正式 Windows 安装包本地数据

第一阶段规则：

- 不承诺三者自动互通
- 不承诺浏览器数据自动迁移到 Windows
- 不承诺 `tauri dev` 数据自动迁移到正式 Windows 包

因此开发时不要把：

- “看不到浏览器旧数据”

误判成：

- “Windows 打包把数据弄丢了”

### 8.1 应用标识冻结规则

一旦开始接入 Tauri，就要尽早冻结这些信息：

- 应用 ID
- 产品名
- 窗口入口策略

原因：

- 这些配置可能影响桌面端本地数据位置和运行环境标识
- 如果在开发中途反复更改，最容易把“环境切换”误判成“存储损坏”

### 8.2 依赖与锁文件一致性规则

Windows 打包接入会同时引入两套依赖面：

- Node / npm 依赖
- Tauri / Cargo 依赖

要求：

- `package.json` 的变更必须和对应锁文件一起提交
- `src-tauri/Cargo.toml` 的变更必须检查是否需要同步 `Cargo.lock`
- Tauri 插件版本必须与当前 Tauri 主版本保持一致
- `tauri.conf.json`、`capabilities/`、依赖变更尽量放在同一实施单元里提交

不允许的做法：

- 只改 `package.json` 不更新锁文件
- 只改插件依赖，不同步 capability 配置
- 只改 `tauri.conf.json` 不验证对应命令和路径配置

环境注意事项：

- 安装 `rustup` 后，需重新打开终端或刷新当前会话 PATH，确保 `cargo` / `rustc` 对后续 `tauri:dev`、`tauri:build` 可见
- `tauri:dev` 第一次冷编译可能持续数分钟；只有在完成首次 Rust 依赖编译后，后续增量验证才会明显变快

## 9. 开发顺序

建议固定按以下顺序推进：

1. 接入 `Tauri` 基础工程
2. 接 Router 统一入口
3. 接 PNG / GIF 原生保存
4. 接参考底图原生选择
5. 跑 Windows 构建与手动验收

不建议的顺序：

- 同时改 Router、导出、图片导入、持久化

原因：

- 一旦同时改太多，很难定位问题来自哪一层

## 9.1 仓库与产物卫生规则

Windows 打包开发会额外产生很多本地构建产物和缓存目录。

这些内容不应进入正式提交：

- `tactics-canvas-24/dist/`
- `tactics-canvas-24/.vite/`
- `tactics-canvas-24/src-tauri/target/`
- 安装包输出目录
- 本地分析目录，例如 `analysis/`
- 调试日志和临时截图

要求：

- 在 `develop-windows-packaging` 开始第一轮实现前，先确认 `.gitignore` 能覆盖这些目录
- 每次提交前都要检查一次工作树，避免把桌面产物误提交进仓库

原因：

- 这类文件体积大、变动频繁、不可 review
- 一旦混进分支，会明显降低后续合并质量

## 10. 每一步的验证要求

每完成一个阶段，至少跑：

```bash
npm run build
npm run test
npm run lint
```

涉及 Tauri 的阶段，再补：

```bash
npm run tauri:dev
npm run tauri:build
```

验证规则：

- Web 验证必须先过，再进 Tauri 验证
- 不接受“Web 已坏，但 Windows 先凑合能跑”
- 如果某一步没有自动化桌面测试，也必须留下明确的手动验收记录
- 构建产物已生成，不等于已经验证安装包或可执行文件在本机双击可启动

## 11. 手动回归重点

每一轮 Windows 打包改动后，至少手动回归：

1. 工作台打开
2. 新建项目
3. 进入编辑器
4. 保存项目
5. 返回工作台
6. 再次打开项目
7. 导出 PNG
8. 导出 GIF
9. 导入参考底图

同时必须补一轮 Web 回归：

1. 浏览器模式启动
2. 工作台 -> 编辑器 -> 保存 -> 返回
3. PNG / GIF 导出
4. 参考底图导入

## 12. 提交与合并建议

Windows 打包分支建议按功能拆小提交：

1. `Tauri 基础接入`
2. `Router 适配`
3. `原生保存适配`
4. `参考底图适配`
5. `Windows 构建与验收`

每一块都要：

- 单独可回滚
- 单独可验证
- 不混入无关 UI 改造

### 12.1 验证记录留痕规则

每完成一个实施单元，建议至少留一份简短记录到：

- `docs/DocsReview/`

记录内容至少包括：

- 改了什么
- 跑了哪些命令
- 手动验收走了哪些路径
- 当前剩余风险

涉及 Windows 构建时，建议额外写清：

- 产物输出目录，例如 `src-tauri\\target\\release\\bundle\\nsis\\`
- 是否只验证到“构建成功 + 产物已生成”
- 是否实际执行了“本机双击启动 / 安装包运行 / SmartScreen 观察”
- 如果某一项没有执行，要明确写成“本轮未验证”，不要默认写成已通过

原因：

- Windows 打包是跨平台改造，不适合只靠口头记忆回溯
- 后续合回 `develop` 时，需要能快速说明每一段改动的验证证据

合并建议：

- 先在 `develop-windows-packaging` 上做完整链路
- 验证稳定后，再合回 `develop`
- 不建议在实现未稳定前直接合进 `main`

## 13. 与后续 Android 的关系

当前这样做的目标之一，就是给后续 Android 打包保留空间。

如果遵守本文件的规则，后续 Android 可以：

- 继续复用 `tactics-canvas-24/src/` 业务代码
- 只新增 Android 壳层和平台适配

如果现在复制一份 Windows 版业务代码，后面 Android 基本也会被迫复制一份，维护成本会迅速失控。

## 14. 当前结论

Windows 打包开发阶段最重要的不是“尽快打出一个桌面包”，而是：

- 在不复制业务源码的前提下，把平台差异收口到最小范围

只要守住这一点，后续：

- Windows 可继续迭代
- Web 不会被拖坏
- Android 仍然有复用基础
