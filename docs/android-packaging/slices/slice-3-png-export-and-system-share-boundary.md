# Slice 3：PNG Export and System Share Boundary

## 1. 切片目标

Slice 3 负责把 Android 导出从“能生成 PNG 数据”推进到“用户能在 Android 上完成 PNG 导出并进入系统分享链路”。

Android 第一阶段这里的关键不是“保存到任意文件路径”，而是：

- PNG 导出结果可生成
- 平台桥知道这是 Android 分享语义，不是桌面保存语义
- 原生壳层能真正拉起系统分享面板
- UI 能正确区分 `shared`、`cancelled`、`failed`

## 2. 当前代码现实（2026-04-20）

- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx` 通过 `handleExportConfirm` 调用导出链路，并在 Android `shared` 语义下回写 `已进入系统分享`
- `PitchCanvas` 继续负责生成 `exportPng()` / `exportGif()` 结果，导出生成逻辑没有迁到原生侧
- `tactics-canvas-24/src/lib/export-save.ts` 已在 `android-tauri` 分支显式切到 share-first 语义：
  - 先调用 Rust 命令 `prepare_share_export_binary`
  - 再调用 Rust 命令 `share_export_file`
- `tactics-canvas-24/src/lib/file-access.ts` 继续隔离 Windows 保存语义；Android PNG 不再回退到浏览器下载伪实现
- `tactics-canvas-24/src-tauri/src/lib.rs` 已新增 Android 分享桥：
  - 把 PNG 字节写入应用缓存目录 `cache/export-share/`
  - 通过 `android_share_bridge` 拉起系统分享面板
  - 分享拉起动作使用 fire-and-forget，不再等待原生分享目标回调
- Android Phase 1 仍然只承诺 PNG 系统分享；GIF 在 Android 下仍返回 `failed`
- 2026-04-20 在 `Pixel_7` 模拟器上已拿到设备侧硬证据：
  - WebView UI 回写 `已进入系统分享`
  - logcat 命中 `[android-share] prepared ...` 与 `[android-share] launching share sheet ...`
  - `uiautomator dump` 命中系统 `Share` 面板，且可见 `Photos` / `Maps` / `Bluetooth` / `Drive` / `Gmail`

## 3. 与 APK 打包链路的关系

Slice 3 是 Android APK 从“能运行”升级到“具备平台存在感”的第一片。

因为对用户来说，Android 导出是否成立，取决于整个链路是否闭环：

```text
Export button
    -> export dialog
    -> PNG bytes
    -> platform bridge
    -> Android system share
    -> result semantics back to UI
```

只要其中一段是假的，这片都不能关闭。

## 4. 前后端接口检查清单

### 4.1 调用方

- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- 导出配置弹窗与导出确认入口

要求：

- UI 只消费统一导出结果语义
- UI 不直接处理 Android 原生返回对象、Intent 或文件 URI

### 4.2 TypeScript 平台桥

- `tactics-canvas-24/src/lib/export-save.ts`
- `tactics-canvas-24/src/lib/file-access.ts`

要求：

- Android 必须显式区分 `shared` 与 `saved`
- Android 当前片内 `shared` 的定义是“系统分享面板已成功拉起”，不是“用户已完成外部目标分享”
- `cancelled` 仅适用于当前桥能同步判定取消的路径；Android 系统分享面板当前不提供可靠的下游取消回调，因此不得因为拿不到 chooser 结果而卡住 UI
- 桌面保存语义与 Android 分享语义必须保持分离
- GIF 不是本片默认承诺，不得为了 Android 分享改坏现有 GIF 导出

### 4.3 Tauri / 原生壳层

- `tactics-canvas-24/src-tauri/Cargo.toml`
- `tactics-canvas-24/src-tauri/src/lib.rs`
- `tactics-canvas-24/src-tauri/capabilities/default.json`

要求：

- 只在这里接入系统分享原生能力
- 能力注册、权限声明、Rust 侧插件注册必须同步
- Rust 分享桥必须在“系统分享面板已拉起”后立即把控制权还给前端，不能等待 chooser 下游回调
- 不允许只改 `src-tauri/gen/**` 或 vendor 临时补丁就宣布通过

### 4.4 自动化与回归

至少需要检查：

- `src/test/export-save.test.ts`
- `src/test/file-access.test.ts`
- `src/test/tactics-export.test.ts`
- 导出 UI 的回归测试或新增 Android 触控导出测试

## 5. 本切片不解决的问题

- 不解决 Android 系统文件选择器导入
- 不解决 GIF 成为 Android 第一阶段默认导出承诺
- 不解决生命周期恢复

## 6. 开发闭环

建议按以下顺序执行：

1. 先冻结导出结果模型，明确 Android 需要 `shared` 语义
2. 在 `export-save.ts` / `file-access.ts` 里收口 Android 分支
3. 只有在平台桥语义固定后，才接入 Tauri / 原生分享能力
4. 调整 UI 回写：成功、取消、失败分别显示受控状态
5. 跑 Web / Windows 导出回归，避免 Android 改动破坏已有桌面保存
6. 在模拟器或设备上真实点击“导出项目”，确认系统分享面板弹出
7. 记录 `DocsReview`

## 7. 验收规则

### 7.1 进入条件

- Slice 2 已关闭
- 导出入口和弹窗在 Android 真实触控下已可到达

### 7.2 关闭条件

以下全部满足，Slice 3 才能关闭：

- Android 下选择 PNG 导出后，系统分享面板真实弹出
- Android `shared` 语义已经稳定定义为“系统分享面板已拉起”，且 UI 有明确回写
- `failed` 语义已经覆盖“无法准备导出文件”与“无法拉起系统分享面板”
- Android 当前不以系统分享面板的下游 `cancelled` 回调作为关闭前提；若未来桥能同步报告取消，不得把取消误写成失败
- Web / Windows 的现有保存语义未回归
- 自动化测试覆盖导出平台桥结果语义
- 当轮 `DocsReview` 至少包含一项设备侧硬证据：
  - 系统分享面板截图
  - 设备侧日志 / logcat 中的分享调用证据
  - 明确记录分享链路生成的临时文件位置和结果

### 7.3 不算完成的情况

- 只确认了 `exportPng()` 产生字节
- 只看到浏览器下载
- 只在模拟器里点按钮但没有证据证明进入系统分享
- 系统分享面板已经弹出，但前端仍卡在等待原生回调，没有回写 `shared`
- 只改了 `src-tauri/gen/**`
- UI 仍把 Android 分享成功写成桌面“保存成功”

### 7.4 建议留痕

- `implementation-review-android-phase1-slice3-export-share-YYYY-MM-DD.md`
- 必须明确记录：
  - Android 导出结果语义
  - 系统分享面板是否真实出现
  - Web / Windows 回归是否通过
  - 仍未闭环的设备侧风险

## 8. 进入下一片前必须已经成立的事

- Android PNG 导出已经不是“浏览器下载伪实现”
- Android 分享桥已经不再等待 chooser 下游回调，UI 可以在分享面板拉起后立即回写受控状态
- 导入链路后续可以复用同样的“调用方 -> 平台桥 -> 原生能力 -> 结果回写”结构
