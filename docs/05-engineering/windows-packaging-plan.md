# Windows 打包实施方案

## 1. 文档目标

这份文档定义当前项目的 Windows 打包路线、实施步骤、改动范围、验证要求和阶段性产物。

当前目标不是一步到位做完整发布体系，而是：

- 先把现有 React + Vite 前端稳定打包成可运行的 Windows 桌面应用
- 不破坏当前 Web 端主链路
- 为后续 Android 打包保留统一的平台能力抽象

## 2. 当前代码基线

当前前端工程位于：

- `tactics-canvas-24/`

当前已经具备的基础：

- React + Vite 前端可正常运行
- 本地项目保存、打开、继续编辑主链路已打通
- PNG / GIF 导出已实现
- 编辑器核心对象与步骤管理已具备 V1 可演示能力

当前与 Tauri 接入直接相关的代码现实：

- `src/App.tsx` 目前使用 `BrowserRouter`
- 当前 PNG / GIF 导出逻辑仍包含浏览器下载行为
- 参考底图导入链路当前基于浏览器 `File` 对象
- 本地项目持久化当前基于 `localStorage`

当前尚未做的内容：

- 桌面原生壳
- Windows 原生文件保存能力
- 原生安装包 / 便携包产物
- Windows 应用图标、安装器元信息、签名

## 3. 方案结论

Windows 端优先采用：

- `Tauri 2`

不采用：

- Electron

原因：

- 现有项目是纯前端单机工具，Tauri 接入成本较低
- 包体更小，适合课程项目和演示场景
- 后续更容易抽象“平台能力层”，给 Android 端复用

## 4. 打包目标

第一阶段 Windows 打包目标：

- 可在本地开发机上构建出可运行的 Windows 桌面应用
- 可以通过安装包或可执行文件启动
- 启动后进入当前应用工作台
- 保持现有本地项目保存、继续编辑、PNG / GIF 导出链路可用

第一阶段交付边界进一步明确为：

- 仅面向 Windows `x64` 架构
- 仅选择一种主要分发产物类型，不同时追求安装版、便携版、多安装器并行
- 默认接受未签名安装包在部分系统上触发 Windows 安全提示

第一阶段不强求：

- 自动更新
- 代码签名
- 商店分发
- 完整安装器品牌化
- 多语言安装向导
- SmartScreen 友好签名体验

## 5. 总体实施策略

采用“先套壳，再抽平台能力，再替换关键路径”的三阶段策略。

### Phase 1：先接入 Tauri 壳层

目标：

- 不改动现有业务逻辑主干
- 先让前端在 Tauri WebView 中跑起来
- 先得到一个可启动、可运行、可构建的 Windows 桌面版
- 先冻结桌面端的应用标识、产品名和窗口入口策略，避免后续持久化路径漂移

### Phase 2：抽平台能力层

目标：

- 将“浏览器下载 / 浏览器文件选择 / 本地存储”相关能力封装成统一接口
- 为 Windows 和后续 Android 做差异化适配

### Phase 3：替换桌面关键路径

目标：

- 将导出保存、参考底图导入等关键流程切换到桌面端更合理的实现
- 使桌面端不再完全依赖浏览器式交互

## 6. 环境前提

在 Windows 开发机上需要准备：

- Node.js
- npm
- Rust toolchain
- Visual Studio C++ Build Tools
- WebView2 Runtime

建议安装方式：

1. 安装 Node.js LTS
2. 安装 Rust：`rustup`
3. 安装 Visual Studio Build Tools，并勾选 C++ 桌面开发相关组件
4. 确认系统已安装 Microsoft Edge WebView2 Runtime

补充说明：

- 安装 `rustup` 后，需重新打开终端或刷新当前会话 PATH，确保 `cargo` / `rustc` 可直接执行
- 第一次运行 `npm run tauri:dev` 时会进行冷编译，耗时可能明显高于后续增量构建

额外约束：

- Tauri 开发模式下的 `devUrl` 必须与当前 Vite 开发端口保持一致
- 当前项目 `vite.config.ts` 使用 `8080` 端口，因此接入 Tauri 时必须显式对齐该端口
- 如果后续修改 Vite 端口，必须同步修改 Tauri 配置，不能让两边各自维护不同值

## 7. 预计新增目录与文件

接入 Tauri 后，前端仓库内预计新增：

- `tactics-canvas-24/src-tauri/`
- `tactics-canvas-24/src-tauri/tauri.conf.json`
- `tactics-canvas-24/src-tauri/Cargo.toml`
- `tactics-canvas-24/src-tauri/src/main.rs`
- `tactics-canvas-24/src-tauri/capabilities/`

并调整：

- `tactics-canvas-24/package.json`

可能新增的前端封装文件：

- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`

## 7.1 第一阶段预计改动文件清单

为减少实施阶段范围漂移，第一阶段优先只允许修改以下文件或目录：

### 必改文件

- `tactics-canvas-24/package.json`
  - 增加 Tauri 开发和构建脚本
  - 增加桌面端所需依赖
- `tactics-canvas-24/vite.config.ts`
  - 增加 Tauri 开发适配项
  - 固定端口和开发宿主行为
- `tactics-canvas-24/src/App.tsx`
  - 抽统一 Router 入口
- `tactics-canvas-24/src/main.tsx`
  - 如有平台初始化逻辑，优先在这里挂接
- `tactics-canvas-24/src/lib/tactics-export.ts`
  - 抽离浏览器下载逻辑
  - 保留 PNG / GIF 生成逻辑
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
  - 将导出行为改为走平台保存接口
- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
  - 将参考底图导入行为改为走平台选择接口
- `tactics-canvas-24/src/data/mockProjects.ts`
  - 第一阶段原则上不大改，只允许为了桌面启动稳定性做极小修正

### 必增文件

- `tactics-canvas-24/src-tauri/tauri.conf.json`
- `tactics-canvas-24/src-tauri/Cargo.toml`
- `tactics-canvas-24/src-tauri/src/main.rs`
- `tactics-canvas-24/src-tauri/capabilities/`
- `tactics-canvas-24/src/lib/platform.ts`
- `tactics-canvas-24/src/lib/file-access.ts`
- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/asset-import.ts`

### 第一阶段不建议改动的文件

- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/types/tactics.ts`
- `tactics-canvas-24/src/pages/*`

原因：

- 这些文件当前已经承载稳定的业务主链路
- Windows 打包第一阶段的重点是套壳和平台能力适配，不是重构业务逻辑

## 8. package.json 预计调整

预计增加的脚本：

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

必要时增加：

- `@tauri-apps/cli`
- `@tauri-apps/plugin-dialog`
- `@tauri-apps/plugin-fs`

说明：

- 第一阶段优先明确依赖 `@tauri-apps/plugin-dialog` 和 `@tauri-apps/plugin-fs`
- `@tauri-apps/api` 只有在确实需要额外核心 API 时再引入，不作为当前打包方案的默认必需项

## 8.1 Tauri 配置落点

接入时，`src-tauri/tauri.conf.json` 至少需要明确：

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:8080",
    "frontendDist": "../dist"
  }
}
```

要求：

- `beforeDevCommand` 与 `beforeBuildCommand` 必须显式配置，不接受手工分别启动 Vite 和 Tauri 作为长期方案
- `devUrl` 必须与当前 Vite 端口 `8080` 严格对齐
- `frontendDist` 必须明确指向现有 `dist`

## 8.2 Vite 配置落点

接入 Tauri 时，`vite.config.ts` 需要至少满足：

- 固定端口 `8080`
- `strictPort: true`
- 开发时优先兼容 `TAURI_DEV_HOST`
- 不让 Vite 清屏覆盖 Rust / Tauri 错误信息

第一阶段不要求一次性做所有平台优化，但上述项必须补齐。

原则：

- 不删除现有 `dev / build / test / lint`
- 保持 Web 运行方式继续可用
- 桌面打包命令独立存在

## 9. 路径与资源要求

当前前端是 Vite 项目，打包时需要确认：

- 静态资源路径为相对可用路径
- 路由在桌面环境中不会因直接刷新而失效
- 导出相关资源不依赖远程 URL

当前项目是前端路由应用，因此建议继续保持：

- 应用启动始终进入单页应用入口
- 不依赖服务端 rewrite

当前代码现状：

- `src/App.tsx` 使用的是 `BrowserRouter`

这会带来的打包风险：

- Web 开发环境下 `BrowserRouter` 可正常工作
- 但桌面打包后，如果仍直接沿用 `BrowserRouter`，在窗口刷新、深链接恢复或特殊跳转场景下容易出现路由失效

第一阶段明确决策：

- Windows 打包接入前，必须先抽一个统一的 Router 入口
- Web 端可以继续使用 `BrowserRouter`
- Windows 桌面端应切换为更稳妥的 `HashRouter` 或等价的桌面路由策略
- 不接受“先直接打包 BrowserRouter，后面再修”的做法

## 10. 需要优先抽象的平台能力

为了后续兼容 Windows 与 Android，建议先抽这四类能力。

### 10.1 文件保存

当前现状：

- 更偏浏览器下载行为

Windows 目标：

- 用户可选择导出路径
- 保存 PNG / GIF 到本地真实文件系统

抽象接口建议：

- `saveFile({ suggestedName, mimeType, bytes })`

验收约束：

- Windows 打包第一阶段完成时，不接受继续依赖浏览器 `<a download>` 作为正式导出保存实现
- 如原生保存能力未接入完成，则 Windows 打包不算完成

### 10.2 文件选择

当前现状：

- 更偏浏览器 `input[type=file]`

Windows 目标：

- 通过桌面文件选择器导入参考底图

抽象接口建议：

- `pickImageAsset()`

关键兼容性约束：

- 当前前端导入链路消费的是浏览器 `File` 对象
- 但 Tauri 对话框在 Windows 上返回的是文件系统路径，而不是浏览器 `File`
- 因此 Windows 适配层不能只做“打开对话框”，还必须补“读取路径 -> 转成前端可消费的数据结构”
- 第一阶段明确采用：
  - 读取二进制内容后转成浏览器兼容的 `File` / `Blob`
  - 继续复用当前 `onReferenceImageImport(file)` 链路
- “统一改成资产描述对象契约”保留为后续重构项，不放进第一阶段

不接受：

- 仅仅拿到路径字符串就声称导入能力已接通

验收约束：

- 参考底图导入在 Windows 端应优先走原生文件对话框
- 不接受仅保留浏览器文件输入框而声称已完成桌面适配

### 10.3 系统分享

当前现状：

- Web 端可先不依赖

Windows 第一阶段：

- 可以暂不做

抽象接口建议预留：

- `shareFile(...)`

### 10.4 应用级存储位置

当前现状：

- 基于浏览器本地存储

Windows 第一阶段：

- 可以先继续复用现有存储方案，不立即替换

后续优化目标：

- 迁移到更稳定的桌面应用数据目录

关键约束：

- 第一阶段即使继续复用浏览器存储，也必须冻结 Tauri 的应用标识和产品名
- 因为本地存储可用性与应用标识、WebView origin、打包配置直接相关
- 如果应用标识在后续阶段反复变动，用户已有本地数据会出现“像丢失一样”的迁移问题
- 必须明确区分三类本地数据来源：浏览器版、`tauri dev` 开发版、Windows 打包正式版
- 第一阶段不承诺自动迁移浏览器本地数据到桌面版，也不承诺将 `tauri dev` 阶段产生的数据自动带入正式安装包
- 如果后续需要迁移，必须单独设计导入迁移流程，而不是默认假设 localStorage 会自动继承

### 10.5 平台接口契约

第一阶段建议明确抽成一个统一平台层，避免组件直接写浏览器分支和 Tauri 分支。

建议最小接口：

```ts
export type RuntimePlatform = 'web' | 'windows-tauri';

export type SaveFileInput = {
  suggestedName: string;
  mimeType: string;
  bytes: Uint8Array;
};

export type SaveFileResult =
  | { status: 'saved'; path?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

export type PickedImageAsset = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};

export interface PlatformBridge {
  getRuntimePlatform(): RuntimePlatform;
  saveFile(input: SaveFileInput): Promise<SaveFileResult>;
  pickImageAsset(): Promise<PickedImageAsset | null>;
}
```

要求：

- 组件层不直接判断 `window.__TAURI__`
- 组件层不直接调用浏览器 `<a download>`
- 组件层不直接消费 Tauri 返回路径
- 组件层只消费平台层统一结果
- 取消、失败、成功三种结果必须在接口层显式区分，不能继续用单一布尔值混写

### 10.6 失败处理规则

第一阶段必须统一以下失败分支：

- 用户取消保存文件
- 用户取消文件选择
- 路径无权限或写入失败
- 图片读取失败
- 图片 MIME 不支持
- 导出生成成功但保存失败

统一规则：

- “取消”不算错误，不弹红色失败提示
- “生成失败”和“保存失败”必须区分提示
- 失败不允许破坏当前编辑状态
- 失败后用户应仍停留在当前页面，可立即重试

## 11. 第一阶段最小改动原则

为了降低打包风险，Windows 第一阶段应遵循：

- 不重写编辑器
- 不重写状态管理
- 不重写项目模型
- 不同时做 Android
- 不同时做自动更新
- 不在第一阶段临时变更多次应用 ID / productName / bundle identifier
- 不在第一阶段同时引入新的本地数据库或大规模存储重构
- 不在第一阶段把前端保存逻辑迁移到 Rust 层

第一阶段只做：

- 接入 Tauri 壳
- 跑通桌面启动
- 跑通基础构建
- 跑通导出和文件选择的最小闭环

## 11.1 实施提交策略

为了降低回归风险，第一阶段建议拆成 5 个独立提交或 PR 单元：

1. `Tauri 基础工程接入`
2. `Router 与 Vite 配置适配`
3. `PNG / GIF 原生保存适配`
4. `参考底图原生选择适配`
5. `Windows 构建与验收补齐`

每一单元的要求：

- 单独可回滚
- 单独可验证
- 不混入无关 UI 修改

## 12. 导出策略

### 12.1 PNG

第一阶段目标：

- 在桌面端点击导出后能够保存 PNG 到指定路径

实现建议：

- 继续复用现有 PNG 生成逻辑
- 将“浏览器下载”替换为“保存到本地文件系统”
- 保存实现优先采用：`dialog.save` 选择路径 + `plugin-fs` 写入二进制文件

实现边界：

- 不把 PNG 生成迁移到 Rust
- 不重写当前 SVG / Canvas 渲染逻辑
- 第一阶段仅替换“生成后如何落盘”

### 12.2 GIF

第一阶段目标：

- 保持现有 GIF 生成逻辑
- 在生成完成后保存到本地路径

风险点：

- GIF 生成较耗时，桌面端应避免阻塞 UI 太久
- GIF 保存同样必须走 Windows 原生文件保存路径，而不是浏览器下载兼容层
- GIF 二进制输出必须明确经过 `Blob` / `ArrayBuffer` / `Uint8Array` 转换后再写文件，不能假设浏览器下载链路可直接复用

实现边界：

- 不在第一阶段改 GIF 编码器
- 不在第一阶段改 GIF 播放速度策略
- 不在第一阶段引入后台线程或 Rust 编码优化

## 13. 参考底图策略

第一阶段目标：

- 保持当前导入、缩放、偏移逻辑不变
- 仅将文件选择来源切换为更适合桌面端的实现

注意：

- 如果仍使用 base64 存储，大图可能继续接近 localStorage 上限
- 这是已知风险，但不是第一阶段打包阻塞项
- 第一阶段建议对单张参考底图增加体积上限提示，避免桌面版继续沿用无限制导入导致存储快速膨胀
- 建议在实现中明确“导入失败 / 文件过大 / 图片解析失败”的错误提示，不接受静默失败

第一阶段建议约束：

- 单张参考底图设置建议上限，超限时明确提示
- 导入前先校验扩展名和 MIME
- 导入后如仍走 base64 存储，必须提示“过大图片可能影响本地存储稳定性”

## 14. Tauri 第一阶段实施步骤

### Step 1：接入 Tauri 基础工程

要做的事：

- 在 `tactics-canvas-24/` 中初始化 Tauri
- 增加 `src-tauri/`
- 增加 `tauri:dev` 与 `tauri:build` 命令
- 在 Tauri 配置中显式对齐当前 Vite 开发端口
- 冻结应用标识、产品名和窗口标题
- 配置 Tauri 2 所需的最小权限能力文件
- 补齐 `beforeDevCommand`、`beforeBuildCommand`、`frontendDist`
- 调整 Vite 配置以满足 `strictPort` 和 Tauri 开发宿主要求

验收：

- 能用 `npm run tauri:dev` 启动桌面窗口
- 文件系统与对话框能力采用最小权限原则，不直接放开宽泛权限

具体子任务：

1. 初始化 `src-tauri/`
2. 增加 Tauri CLI 与插件依赖
3. 写 `tauri.conf.json`
4. 写 capability 文件
5. 验证空壳窗口能启动

回滚点：

- 如果此步失败，应能完全回退到“纯 Vite Web 项目可正常运行”的状态

### Step 2：跑通桌面版现有页面

要做的事：

- 先抽统一 Router 入口
- 将 Windows 桌面端切换到稳定的桌面路由策略
- 验证工作台、项目页、设置页、编辑器页面可进入
- 验证本地项目读取、保存、继续编辑主链路仍可运行

验收：

- 桌面窗口中可完整走 `工作台 -> 编辑器 -> 保存 -> 返回工作台 -> 再打开`
- 刷新当前窗口后路由不丢失，至少不会导致应用进入空白页或 404 死路

具体子任务：

1. 抽 Router 工厂
2. Web 保持 `BrowserRouter`
3. Windows 切换桌面路由策略
4. 验证工作台、项目页、设置页、编辑器

回滚点：

- 如果桌面路由策略导致主链路异常，应先保留 Tauri 壳层提交，单独回滚路由适配提交

### Step 3：封装导出保存能力

要做的事：

- 抽出保存文件接口
- Web 保持原实现
- Windows 使用 Tauri 文件保存 API

验收：

- PNG / GIF 可保存到本地文件系统
- Windows 桌面端导出不再依赖浏览器下载行为

具体子任务：

1. 抽出 `saveFile`
2. Web 保持下载行为
3. Windows 改成原生保存
4. 区分“生成失败”和“保存失败”提示

回滚点：

- 如果 GIF 保存适配不稳定，允许先保留 PNG 原生保存，GIF 暂时回退到未完成状态，但不能伪装成已完成

### Step 4：封装参考底图选择能力

要做的事：

- 抽出图片选择接口
- Windows 使用 Tauri 文件对话框
- 将 Tauri 返回的路径转换为前端可消费的资产输入结构

验收：

- 能导入参考底图并正常显示
- 文件选择失败、取消选择、文件过大时提示明确
- 不依赖浏览器 `input[type=file]` 也能完成完整导入流程

具体子任务：

1. 抽出 `pickImageAsset`
2. Windows 使用原生文件对话框
3. 将路径结果转成浏览器兼容 `File`
4. 接回现有参考底图导入逻辑

回滚点：

- 如果路径到资产转换层不稳定，应保持导入按钮降级或隐藏，不接受残留半通不通的入口

### Step 5：构建 Windows 产物

要做的事：

- 跑通 `npm run tauri:build`
- 生成可分发产物
- 明确第一阶段只选择一种主要 Windows 产物类型
- 明确第一阶段只验证 `x64` 产物

验收：

- 本机双击产物可启动应用
- 至少产出一种可安装或可分发的 Windows 产物
- 产物说明中明确标注未签名状态和可能出现的系统安全提示

具体子任务：

1. 跑 `tauri build`
2. 记录产物路径
3. 验证双击启动
4. 记录系统安全提示情况
5. 补分发说明

## 15. 测试与验收要求

接入 Tauri 后，至少要验证以下路径：

### 15.1 主链路

- 工作台打开
- 新建项目
- 编辑内容
- 保存正式项目
- 返回工作台
- 再次打开并继续编辑

### 15.2 编辑器核心操作

- 球员、文本、线路、区域的新增 / 编辑 / 删除
- 步骤新增、复制、删除、重排

### 15.3 导出

- PNG 导出
- GIF 导出
- 文件可真实写入本地路径

### 15.4 文件导入

- 参考底图导入

### 15.5 基础稳定性

- 应用启动
- 应用关闭后重开
- 已保存项目仍可打开
- 刷新当前路由后不进入空白页
- 应用首次启动与二次启动使用同一套本地数据
- 必须明确验证 `tauri dev` 与正式打包产物的数据隔离行为，避免误判为数据丢失

## 15.6 推荐验证命令顺序

实施阶段建议固定使用以下顺序：

```bash
npm run build
npm run test
npm run lint
npm run tauri:dev
npm run tauri:build
```

规则：

- Web 侧 `build/test/lint` 先过，再进 Tauri
- 不接受“Web 已坏但桌面先试试看”
- 每完成一个 Step 至少跑一轮 Web 验证

## 15.7 手动验收矩阵

第一阶段至少覆盖以下人工场景：

### 场景 A：主链路

1. 打开工作台
2. 新建项目
3. 编辑球员、文本、线路
4. 保存项目
5. 返回工作台
6. 再次打开

### 场景 B：PNG 导出

1. 打开已有项目
2. 导出 PNG
3. 选择本地路径
4. 检查文件真实存在且可打开

### 场景 C：GIF 导出

1. 打开多步骤项目
2. 导出 GIF
3. 选择本地路径
4. 检查文件真实存在且可播放

### 场景 D：参考底图导入

1. 选择图片
2. 导入成功后检查显示
3. 关闭应用重开
4. 检查项目仍可读取

### 场景 E：失败分支

1. 取消保存文件
2. 取消选择图片
3. 尝试超大图片
4. 验证提示是否准确

## 16. 主要风险

### 风险 1：浏览器能力与桌面能力混用

表现：

- 一部分流程还是浏览器下载
- 一部分流程改成原生保存

应对：

- 先抽平台能力接口，再逐步替换

### 风险 2：本地存储上限

表现：

- 大图参考底图和项目数据继续使用 localStorage，可能逼近上限

应对：

- 第一阶段接受该限制
- 第二阶段再评估迁移到桌面端文件存储

### 风险 3：打包环境配置复杂

表现：

- Rust、C++ 工具链、WebView2 缺任一项都会导致构建失败

应对：

- 在正式开发前先完成环境检查

### 风险 4：导出逻辑依赖浏览器 API

表现：

- 某些导出或下载流程在 Tauri 中表现不一致

应对：

- 优先保留现有生成逻辑，只替换最终保存路径

### 风险 5：应用标识漂移导致数据看似丢失

表现：

- 更改 Tauri 应用标识、产品名或相关配置后，用户原有本地数据可能不再从原位置读取

应对：

- 在第一次接入 Tauri 时就冻结应用标识
- 将该标识写入工程文档和配置检查项，不允许后续随意改名

### 风险 6：Tauri 权限配置缺失导致功能不可用

表现：

- 即使前端调用了保存文件、打开文件对话框等接口，如果未配置对应 capability，桌面端仍会在运行时失败

应对：

- 在 Step 1 就引入 `capabilities` 目录
- 只开放 PNG / GIF 保存、图片选择等当前确实需要的权限
- 不提前打开与当前 V1 无关的广泛文件系统能力

### 风险 7：开发版与正式版存储隔离被误判为 bug

表现：

- 在浏览器版或 `tauri dev` 中保存过的项目，在正式 Windows 安装包中默认看不到
- 开发阶段容易误以为是“打包后数据丢失”

应对：

- 在方案和验收中明确这是当前阶段预期行为
- 第一阶段验收以“正式 Windows 产物自身的数据持久化稳定”为准，不以跨环境自动继承为准

### 风险 8：前端文件接口与 Tauri 返回值模型不一致

表现：

- 当前界面层习惯接收浏览器 `File`
- 但 Tauri 在 Windows 上更自然返回文件路径
- 如果不做中间层转换，参考底图导入会停留在“对话框能开，但文件进不了现有逻辑”的半完成状态

应对：

- 在 Step 4 中明确增加路径到资产输入结构的转换层
- 不把“能选中文件”误判成“导入已完成”

### 风险 9：交付范围膨胀到多架构、多安装器

表现：

- 一旦同时追求 x64 / ARM64、安装版 / 便携版、MSI / 其他安装器，第一阶段复杂度会明显上升

应对：

- 第一阶段只锁定 `Windows x64`
- 第一阶段只交付一种主要产物类型
- 其他架构和产物形式放入后续阶段

### 风险 10：未签名产物被误判为打包失败

表现：

- 第一阶段构建出的安装包或可执行文件可能被 Windows SmartScreen 提示风险
- 这不是代码打包失败，而是未签名分发的正常现象

应对：

- 在第一阶段交付说明中提前写明
- 验收时区分“系统安全提示”和“应用无法运行”这两类问题

### 风险 11：一步改太多导致定位困难

表现：

- 如果 Tauri 基础工程、Router、导出、文件选择同时混在一个大提交里，出现问题后难以定位根因

应对：

- 按文档中的 5 个实施单元拆分提交
- 每一步都保留独立回滚点

## 17. 第一阶段完成标准

Windows 打包第一阶段完成，至少要满足：

- 可以通过 `npm run tauri:dev` 启动桌面版
- 可以通过 `npm run tauri:build` 构建 Windows 产物
- Tauri 配置与 Vite 开发端口一致
- Windows 端已切换到稳定的桌面路由策略
- 第一阶段产物范围锁定为 Windows x64
- 工作台、项目页、编辑器可正常运行
- 本地保存、重新打开、继续编辑可用
- PNG / GIF 导出可保存到本地
- 参考底图可导入

## 18. 第二阶段候选工作

Windows 打包第一阶段完成后，再考虑：

- 将项目数据迁移到桌面端应用目录
- 导出路径记忆
- 最近导出目录记忆
- 更好的错误提示
- 应用图标与安装器品牌化
- 自动更新
- Windows 便携版与安装版双产物

## 19. 当前结论

当前最合理的执行顺序是：

1. 先为 `tactics-canvas-24` 接入 Tauri
2. 先跑通 Windows 桌面版
3. 先保证桌面端主链路和导出闭环可用
4. 再开始 Android 打包

不建议当前直接同时推进 Windows 和 Android。
