# implementation-review-android-phase1-slice3-export-share-2026-04-18

## Scope

本轮验证范围：

- [x] Android 技术路线验证
- [x] Android 平台桥接验证
- [ ] Android 触控主链路验证
- [ ] Android 生命周期 / 方向切换验证
- [x] Android 构建验证
- [x] Web 回归验证
- [x] Windows 平台桥回归观察

本轮具体目标：

- 在不污染 `saveFile()` 语义的前提下，为 Android 建立 PNG 导出 + 系统分享边界
- 保持 Web 和 Windows 现有导出行为不变

## Context

关联文档：

- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/DocsReview/implementation-review-android-phase1-slice2-mainflow-touch-2026-04-18.md`

本轮实现背景：

- 当前分支：`develop-android-packaging`
- 当前 Slice：`Slice 3`
- 目标只覆盖 Android PNG 导出与系统分享边界，不进入素材导入、生命周期或设备兼容验证

本轮不覆盖：

- Android 文件选择器与素材导入
- 生命周期 / 横竖屏
- 真实手机兼容验证
- Android GIF 首发承诺

## Environment

### Device / Emulator

- 设备或模拟器：`Pixel_7` AVD
- Android 版本：Android 14（API 34）
- 架构：`x86_64`
- 屏幕方向：本轮未单独切换验证
- 手机 / 平板：手机

### Build Context

- 当前分支：`develop-android-packaging`
- 当前 Slice：`Slice 3`
- 是否基于最新主开发分支同步：是
- 是否包含未提交本地改动：包含本轮 Slice 3 代码改动与本记录文件

### Runtime Notes

- Android build：`x86_64` release 构建通过
- Android dev：应用成功安装并启动到模拟器
- 本轮是否验证真实系统分享面板：否（仅验证 share 调度链路与 Android smoke）
- 本轮是否验证真实系统文件选择器：否

## Commands

### Focused Validation

- `npx vitest run src/test/export-save.test.ts src/test/file-access.test.ts`

结果：

- 2 个测试文件 / 9 个测试全部通过

### Shared Validation

- `npm run build`
- `npm run lint`
- `npm run test`

结果：

- `npm run build`：通过
- `npm run lint`：通过，0 error，保留 7 个既有 warnings
- `npm run test`：通过，33 个测试文件 / 83 个测试全部通过

### Android Validation Commands

- `npx tauri android build --target x86_64`
- `npx tauri android dev`

结果：

- `npx tauri android build --target x86_64`：通过
- 构建产物：
  - `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
  - `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`
- `npx tauri android dev`：通过
- 应用成功安装并启动到模拟器
- `adb shell pidof com.kevinrunzhi.tacticboard` 返回有效 PID

## Validation

### Round 1: Export Result Semantics

验证内容：

- Android PNG 走 share 语义
- Android PNG 失败时返回明确错误
- Android GIF 不被提升为 share-first 路径
- Web / Windows 继续走保存语义

结果：

- 已完成
- `export-save.test.ts` 已覆盖：
  - Android PNG shared
  - Android PNG failed
  - Android GIF fallback to save
  - Web / Windows save behavior preserved

### Round 2: Frontend Export Boundary

验证内容：

- `saveFile()` 继续代表显式落盘
- Android PNG 路径先写 cache 再触发系统分享
- 编辑器能区分 `shared` 与 `saved`

结果：

- 已完成
- `export-save.ts` 引入 `SaveExportResult`
- `TacticsEditor.tsx` 能对 `shared` 给出单独成功提示

### Round 3: Shell / Capability Integration

验证内容：

- Rust 壳层注册 `tauri-plugin-share`
- capability 放通 `share_file`
- Android build / dev 不因分享插件接入而崩坏

结果：

- 已完成
- `tauri-plugin-share` 已接入 `Cargo.toml` 与 `src-tauri/src/lib.rs`
- capability 已加入 `share:allow-share-file`
- Android build / dev 都成功

### Round 4: Android Smoke

验证内容：

- 接入分享能力后 Android 应用仍能启动
- 不因新插件导致容器启动失败

结果：

- 已完成
- Android app 在 `Pixel_7` 模拟器中成功启动

### Round 5: Mobile touch fallback

验证内容：

- 移动端顶部栏的返回 / 保存 / 导出按钮在 touch 事件下可触发对应回调

结果：

- 已完成
- `mobile-topbar-touch.test.tsx` 通过

### Round 6: Export dialog touch fallback

验证内容：

- 导出设置对话框中的“导出 PNG / 取消”按钮在 touch 事件下可触发对应回调

结果：

- 已完成
- `export-config-dialog-touch.test.tsx` 通过

### Round 7: Android export pipeline hardening

验证内容：

- Android PNG 不再依赖 `SVG -> Image -> Canvas` 这条脆弱导出链路
- Android share 插件具备 chooser / URI 读权限 / cancel 语义
- 共享验证继续通过

结果：

- 已完成
- Android `exportPng()` 路径已切到 `exportStepAsPng()` 的 2D canvas 导出
- `tauri-plugin-share` 已切到本地 vendor 补丁版
- `ExportConfigDialog` 的“导出 PNG / 取消”按钮已补充 `onTouchEnd` 兜底与更大的点击高度
- 共享验证通过：
  - `npm run lint`
  - `npm run build`
  - `npm run test`

### Round 8: Device-side export repro narrowing

验证内容：

- 自动化设备点击链路是否能进入 `handleExportConfirm`
- 是否能抓到 `exportStepAsPng` / `android-share` / `TacticBoardShare` 运行时日志
- 是否能在 app cache 中看到 `export-share` 目录

结果：

- 已执行多轮自动化设备点击重现
- 当前仍未抓到 `handleExportConfirm` / `[export-png]` / `[android-share]` / `TacticBoardShare` 的设备侧运行时日志
- 当前 app 沙箱里仍未出现 `cache/export-share/`
- 这说明当前最可能的剩余问题不是 share 插件本身，而是设备侧“确认导出”动作仍未可靠命中运行时链路

## Findings

1. 当前 Slice 3 已经在代码层和测试层完成 Android PNG share boundary 的最小闭环。
2. `saveFile()` 语义仍保持为显式保存，Android PNG share 没有反向污染 Web / Windows 路径。
3. `tauri-plugin-share` 可以在当前 Android 工程中成功接入并通过 build/dev smoke。
4. Android 模拟器里顶部“保存项目 / 导出项目”按钮此前存在可见但手动点击无响应的现象，因此本轮为 `MobileTopBar` 增加了 `onTouchEnd` 兜底，并新增独立测试验证 touch 事件可触发对应回调。
5. 当前生成 Android 工程的 `file_paths.xml` 已包含 `cache-path`，因此“Android PNG 写在 AppCache 就一定无法分享”这一条怀疑已被弱化。
6. `ExportConfigDialog` 的确认按钮也已补充 `onTouchEnd` 兜底，说明当前设备侧剩余问题更可能是“导出确认动作尚未可靠命中”而不是单纯的顶栏不可点。
7. 最新自动化导出重现中，仍未抓到 `[export-png]`、`[android-share]` 或 `TacticBoardShare` 的设备侧运行时日志，这说明当前失败仍大概率发生在“设备侧未真正命中确认导出动作”这一层，而不是已经进入 share 调用后才失败。
8. 当前 Slice 3 的代码链路和测试链路已经显著强化，但最终修复是否成立，仍需要一次设备侧手动复测来确认“导出 PNG”确认按钮是否已真正触发运行时回调。

## Fixes Applied

- `tactics-canvas-24/src/lib/export-save.ts`
  - 新增 `SaveExportResult`
  - Android PNG 先写 AppCache 再调用 `plugin:share|share_file`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
  - 对 `shared` 状态给出独立成功提示
- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`
  - 为返回 / 保存 / 导出按钮补充 `onTouchEnd` 兜底
  - 为按钮增加 `touch-manipulation`
- `tactics-canvas-24/src/components/tactics/ExportConfigDialog.tsx`
  - 为“导出 PNG / 取消”按钮补充 `onTouchEnd` 兜底
  - 为按钮增加 `touch-manipulation`
  - 增大按钮点击高度
- `tactics-canvas-24/src/components/tactics/PitchCanvas.tsx`
  - Android 下 `exportPng()` 改走 `exportStepAsPng()` 的 2D canvas 路径
- `tactics-canvas-24/src-tauri/Cargo.toml`
  - `tauri-plugin-share` 改为本地 vendor 依赖
- `tactics-canvas-24/src-tauri/src/lib.rs`
  - 注册 share plugin
- `tactics-canvas-24/src-tauri/capabilities/default.json`
  - 新增 `share:allow-share-file`
- `tactics-canvas-24/package.json`
  - 显式加入 `@tauri-apps/api`
  - 新增 `tauri` script 以匹配 Android Gradle/npm 调用约定
- `tactics-canvas-24/src-tauri/vendor/tauri-plugin-share/android/src/main/java/SharePlugin.kt`
  - 增加 `Intent.createChooser(...)`
  - 增加 `FLAG_GRANT_READ_URI_PERMISSION`
  - 增加 `ActivityCallback` resolve/reject
  - 在取消分享时返回 `Share cancelled`
- `tactics-canvas-24/src/test/export-save.test.ts`
  - 新增 Android share 语义测试
- `tactics-canvas-24/src/test/mobile-topbar-touch.test.tsx`
  - 新增移动端 touch fallback 测试
- `tactics-canvas-24/src/test/export-config-dialog-touch.test.tsx`
  - 新增导出设置对话框 touch fallback 测试

## Acceptance Mapping

本轮对应 Android 第一阶段验收标准中的项目：

- [x] PNG 导出与系统分享验收（代码/测试/构建层面）
- [x] Web 回归验收
- [x] Windows 基线回归观察项
- [x] Android 构建与启动 smoke
- [ ] 真实设备上的系统分享面板进入验证

本轮明确未纳入：

- Android 文件选择器与素材导入
- 生命周期 / 横竖屏
- 真实手机兼容验证
- Android GIF 首发承诺

## Remaining Risks

- 当前尚未在设备上人工确认“导出 PNG 后系统分享面板已弹出”，因此系统分享的最终用户交互链路仍缺一条手动验证
- `tauri-plugin-share` 的 Android 集成在构建时会伴随 Kotlin daemon fallback 和 Gradle/JDK warnings，但当前未阻塞构建
- 当前仍然只验证了模拟器，不代表真实手机全部通过
- 当前虽然已经补了 `onTouchEnd` 兜底和自动化测试，但还没有拿到“设备侧点击导出后原生分享面板已出现”的硬证据
- 当前本地证据显示 `cache-path` 已在 Android `file_paths.xml` 中声明，所以如果后续仍失败，应优先继续排查设备侧交互链路、导出对话框触发链路或 share 调用时机，而不是先假定 `AppCache` 路径必然不合法
- 最新自动化复现中，app 沙箱内仍未出现 `cache/export-share/` 目录，也没有抓到我们新增的导出链路日志，因此下一轮优先任务是拿到一次可靠的“确认导出”点击命中证据
- 当前共享验证与 Android build/dev smoke 均已通过，因此后续不应再优先怀疑环境或构建链路；问题已收缩到设备侧确认导出动作的命中稳定性

## Decision

本轮结论：

- [x] 技术路线继续可行
- [x] 可以进入下一实施阶段
- [ ] 需要先补文档边界再继续
- [ ] 需要先修阻塞问题再继续

Slice Exit Decision：

- [ ] 当前 Slice 已达到退出条件
- [x] 当前 Slice 仍未达到退出条件
- [ ] 当前 Slice 需要缩范围并先回改文档

原因：

- 代码、测试、build/dev smoke 已通过
- 但“确认导出动作已真正进入运行时链路”的设备侧证据尚未补齐，更不用说最终的系统分享面板硬证据

建议下一步：

- 优先获得一次可靠的设备侧“确认导出”点击命中证据
- 只要抓到 `handleExportConfirm` / `[export-png]` / `[android-share]` 任一日志，就能继续把失败点最终钉死
- 在拿到最终分享面板证据前，暂不关闭 Slice 3
