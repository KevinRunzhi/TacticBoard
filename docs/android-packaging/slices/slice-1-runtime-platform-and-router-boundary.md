# Slice 1：Runtime Platform and Router Boundary

## 1. 切片目标

Slice 1 负责把 Android 运行时从“借用现有 Web / Windows 行为”升级成“当前代码树明确知道自己正在 Android 容器里运行”。

这个切片的目标是冻结两件事：

- 平台识别语义
- Router 运行方式边界

## 2. 当前代码现实（2026-04-19）

- `tactics-canvas-24/src/lib/platform.ts` 当前 `RuntimePlatform` 已扩展为 `web | windows-tauri | android-tauri`
- `getRuntimePlatform()` 当前通过 Tauri internals + Android user agent 识别 `android-tauri`
- `createAppRouter()` 当前已固定为：只有 Web 使用 `BrowserRouter`，所有 Tauri 运行时统一走 `HashRouter`
- `tactics-canvas-24/src/App.tsx` 把整个路由树交给 `createAppRouter()`，这是正确的收口点
- `tactics-canvas-24/src/test/platform-router.test.tsx` 当前已覆盖 Web / Windows / Android 运行时检测、Android `HashRouter` 行为，以及 Android 无效路由 fallback

## 3. 与 APK 打包链路的关系

如果 Slice 1 不先冻结，后面几片都会遇到同一类问题：

- Android 到底应不应该复用 Windows Router 行为没有源码级答案
- 组件层会开始到处写零散的平台判断
- 导出、导入、生命周期都会把“平台识别”偷偷内嵌到功能代码里

因此，Slice 1 是所有 Android 功能片的共同前置。

## 4. 前后端接口检查清单

### 4.1 调用方

- `tactics-canvas-24/src/App.tsx`
- `tactics-canvas-24/src/main.tsx`

要求：

- App 层只消费统一的 `createAppRouter()` / `getRuntimePlatform()`
- 不允许页面或组件自己推断 Android

### 4.2 TypeScript 平台桥

- `tactics-canvas-24/src/lib/platform.ts`

要求：

- `RuntimePlatform` 必须显式包含 Android 运行时语义，不能长期让 Android 假扮 Windows
- Router 选择规则必须集中在这里，不允许散落到页面或组件
- 如果 Android 和 Windows 暂时共用 `HashRouter`，也必须通过显式平台枚举表达，而不是隐式碰巧复用

### 4.3 Tauri / 壳层侧

本片通常不需要改 Rust 侧能力。

如果在 Slice 1 就出现以下改动，通常说明边界跑偏：

- 新增分享插件
- 新增系统选择器能力
- 新增文件保存插件
- 新增 deep link / app link / `android.intent.action.VIEW` 入口适配

### 4.4 自动化覆盖

最小自动化覆盖应至少包括：

- `src/test/platform-router.test.tsx`
- `src/test/app-router-android.test.tsx`
- `src/test/file-access.test.ts`
- `src/test/asset-import.test.ts`
- Web / Windows 现有路由行为回归

## 5. 本切片不解决的问题

- 不解决触控命中区和手势问题
- 不解决导出与系统分享
- 不解决素材导入
- 不解决生命周期和方向切换
- 不解决 Android 外部 URL 唤起、deep link、`android.intent.action.VIEW` 入口

## 6. 开发闭环

建议按以下顺序执行：

1. 先冻结 Android 运行时识别口径，并把口径写回 `platform.ts`
2. 再冻结 Android Router 运行方式，明确是否与 Windows 共用 `HashRouter`
3. 清理组件层、页面层、hooks 层的零散平台判断，确保 Android 分支只停留在平台桥
4. 补齐 `platform-router.test.tsx` 与 `app-router-android.test.tsx` 的 Android 覆盖，并确认 `file-access` / `asset-import` 没有提前开启 Android 原生分支
5. 跑 Web `build/test/lint`
6. 在 Android 壳里验证基础入口：工作台、项目页、编辑器、设置页、404 / 无效路由
7. 明确区分“应用内 hash route 边界”和“外部 URL / VIEW intent 入口”，避免把不在本片合同内的问题误判成 Router 树失败
8. 写 `DocsReview`，确认这一片没有偷偷引入导出 / 导入 / 生命周期实现

## 7. 验收规则

### 7.1 进入条件

- Slice 0 已关闭
- 当前分支已有可复用 Android 壳层 baseline

### 7.2 关闭条件

以下全部满足，Slice 1 才能关闭：

- Android 运行时已经在 `platform.ts` 中被显式建模
- `createAppRouter()` 的 Android 行为已经在源码里固定下来
- 页面和组件没有直接依赖 Android 原生判断
- `src/test/platform-router.test.tsx` 已覆盖 Android 分支
- Web / Windows 路由行为未回归
- 在 Android 壳中至少验证：
  - 冷启动进入工作台
  - 从工作台进入项目页 / 编辑器
  - 无效路径可回到受控状态

### 7.3 不算完成的情况

- 只是让 Android 临时复用 Windows 分支，但没有显式 `RuntimePlatform` 语义
- 在组件里直接判断 `window.__TAURI__`、user agent 或 Android 特征
- 只有浏览器测试，没有 Android 壳内观察
- 为了让路由跑起来，顺手把导出 / 导入逻辑也改了
- 把外部 `VIEW intent + URL data` 白屏误判成应用内 `HashRouter` fallback 失败，却没有先区分支持范围

### 7.4 建议留痕

- `implementation-review-android-phase1-slice1-router-platform-YYYY-MM-DD.md`
- 重点记录：
  - Android 运行时如何识别
  - Router 选择策略
  - Android 壳内实际访问的路由
  - Web / Windows 是否保持不变
  - 是否已区分应用内 hash route 与外部 URL / deep-link 入口

### 7.5 当前状态（2026-04-19）

- 当前分支已经重新建立 Slice 1 的已提交实现：`platform.ts` 已显式建模 `android-tauri`，Router 入口仍集中在共享平台桥
- `platform-router.test.tsx`、`app-router-android.test.tsx`、`file-access.test.ts`、`asset-import.test.ts` 已覆盖 Android 运行时检测、应用级 Router fallback，以及相邻平台桥在 Slice 1 不提前开启 Android 原生语义的边界
- Android dev 壳内已经实际观察到工作台、项目页、设置页、编辑器入口
- 本轮已经在真实 Android dev 壳内通过 WebView DOM 观察确认：无效 hash 路径会进入受控的 `NotFound` 页面，并且可以返回工作台；因此 Slice 1 片内最严格的无效路由证据门槛已补齐
- 本轮同时发现一个独立风险：如果通过 `android.intent.action.VIEW + URL data` 从外部强行拉起应用，当前壳层会出现白屏与 `Entry not found`。由于当前已提交源码没有 deep link / app link 插件、能力或配置，这属于“未承诺的外部 URL 入口”问题，不计入 Slice 1 的应用内 Router 树失败
- 因此，按当前 Android Phase 1 合同与本片验收门槛，Slice 1 现在可以关闭；保留风险是外部 URL / deep-link 入口仍需后续单独立项

## 8. 进入下一片前必须已经成立的事

- Android 运行时身份已经被冻结
- 路由入口已经稳定
- 后续 Slice 2 到 Slice 5 不再需要重新发明平台判断
- 如果后续要支持外部 URL / deep-link 入口，必须单独建接口与验收规则，不能混进 Slice 2 的触控主链路修补
