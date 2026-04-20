# Slice 0：Android Shell Feasibility Baseline

## 1. 切片目标

Slice 0 负责把 Android 打包从“本机偶尔能跑通”变成“当前分支存在可复用、可复核、可留痕的壳层 baseline”。

这个切片的核心不是业务功能，而是为后续所有切片提供稳定入口：

- 可复用的 Android 命令入口
- 可复用的 Android 壳层 baseline
- 可复用的 APK 产物生成路径
- 可追踪的产物卫生与生成目录规则

## 2. 当前代码现实（2026-04-19）

- `tactics-canvas-24/package.json` 当前已经恢复 `tauri`、`tauri:android:init`、`tauri:android:dev`、`tauri:android:build` 入口，其中 `tauri:android:build` 默认包装 `tauri android build --apk`
- 当前分支已重新执行 `npm run tauri:android:init`、`npm run tauri:android:dev`、`npm run tauri:android:build -- --target x86_64`，并在 `Pixel_7` 模拟器上确认包安装与冷启动
- `tactics-canvas-24/src-tauri/tauri.conf.json` 当前固定 `devUrl` 为 `http://localhost:8080`，`beforeDevCommand` 为 `npm run dev`，`frontendDist` 为 `../dist`
- `tactics-canvas-24/src-tauri/Cargo.toml` / `src-tauri/src/lib.rs` 当前只接入 `dialog`、`fs`、`log`，还没有 Android 分享或导入相关原生能力
- `src-tauri/gen/**`、`src-tauri/target/**`、`src-tauri/vendor/**` 仍然不是常规源码，不允许把它们当成 Slice 0 的长期实现产物

## 3. 与 APK 打包链路的关系

Slice 0 是整条 Android APK 开发链路的入口片：

```text
repo command truth
    -> Android init/dev/build entrypoints
    -> emulator/device startup
    -> reusable shell baseline
    -> later platform features
    -> final APK packaging and validation
```

如果 Slice 0 没有先固化，后续切片会同时踩：

- 运行命令不一致
- Vite / Tauri 开发入口漂移
- 生成目录误提交
- “这台机器能跑，但仓库状态不可复用”

## 4. 前后端接口检查清单

本切片不改业务接口，但必须检查 4 组壳层接口。

### 4.1 命令入口接口

- 文档声明的 Android 命令入口，必须和 `package.json` 的实际脚本一致
- 如果仓库文档要求 `npm run tauri:android:*`，则 `package.json` 必须恢复对应脚本，不能长期只靠口头说明 `npx tauri android ...`

### 4.2 Web 开发服务接口

- `vite.config.ts` 的端口
- `src-tauri/tauri.conf.json` 的 `devUrl`
- `beforeDevCommand`

这三者必须一致，否则 Android 开发壳会落到 “198.18.0.1:8080 无法访问” 这类假失败。

### 4.3 Tauri 壳层配置接口

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`
- `src-tauri/capabilities/default.json`

Slice 0 只允许做 baseline 级别的必要对齐，不应提前把分享、系统文件选择器等后续能力混进来。

### 4.4 生成与产物卫生接口

- `.gitignore`
- `src-tauri/gen/**`
- `src-tauri/target/**`
- Android 构建输出目录

必须明确哪些是产物、哪些是可提交源码，避免后面把临时生成物当成真正实现。

## 5. 本切片不解决的问题

- 不解决 `platform.ts` 的 Android 平台识别
- 不解决触控主链路
- 不解决 PNG 导出或系统分享
- 不解决素材导入
- 不解决生命周期与方向切换

如果这几个问题在 Slice 0 就一起做，后续无法判断失败究竟来自壳层、平台桥还是业务逻辑。

## 6. 开发闭环

建议按以下顺序执行：

1. 对齐命令真相：决定 Android 命令入口以 `package.json` 脚本为准还是修改上游文档，但两者必须同步
2. 固化开发壳 baseline：确认 `vite` 端口、`devUrl`、`beforeDevCommand`、`frontendDist`
3. 固化生成目录规则：确认 `.gitignore`、`src-tauri/gen/**`、`target/**` 的处理方式
4. 先跑 Web 基线验证：`npm run build`、`npm run test`、`npm run lint`
5. 再跑 Android baseline：优先使用 `npm run tauri:android:init`、`npm run tauri:android:dev`、`npm run tauri:android:build`；如需补充目标参数，再在脚本后追加 `-- --target ...`
6. 至少在模拟器或设备上做一次冷启动观察，确认不是只停留在命令成功
7. 写 `DocsReview`，记录命令、环境、产物位置、是否真正打开应用

## 7. 验收规则

### 7.1 进入条件

- 当前分支已确认 Windows 基线仍可构建
- Android 文档、命令入口、当前代码树三者的差异已经被识别

### 7.2 关闭条件

以下全部满足，Slice 0 才能关闭：

- Android 命令入口已经作为已提交实现进入仓库，或等价地已经把仓库文档改写到和当前入口一致
- `npm run build`、`npm run test`、`npm run lint` 已执行
- Android `init`、`dev`、`build --apk` 至少各有一轮真实执行记录
- 模拟器或设备上至少有一次真实冷启动成功，不是只有命令退出码
- `.gitignore` 和生成目录规则已经明确，不会把 `src-tauri/gen/**`、`target/**` 当长期源码
- 当轮 `DocsReview` 明确区分：已提交实现、仅本地环境、生成产物

### 7.3 不算完成的情况

- 只在 Android Studio 里生成了工程，但仓库命令入口仍然漂移
- 只靠本机临时执行过 `npx tauri android ...`，没有把入口写回仓库或文档
- 只看到构建成功，没有实际冷启动应用
- 只修改 `src-tauri/gen/**` 或 `target/**`
- 只在口头上说明“以后再补脚本”

### 7.4 建议留痕

- `implementation-review-android-phase1-slice0-feasibility-YYYY-MM-DD.md`
- 明确记录：
  - 使用的命令入口
  - Android CLI 版本
  - 模拟器 / 设备情况
  - APK 是否生成
  - 冷启动是否真正进入应用

### 7.5 当前状态（2026-04-19）

基于本轮已执行验证，当前分支可以把 Slice 0 视为重新固化完成：

- Android 命令入口已重新进入 `package.json`
- 共享验证已执行：`build / test / lint`
- 桌面壳层验证已执行：`tauri:build` 与 `tauri:dev` smoke
- Android baseline 已执行：`init / dev / build`
- `Pixel_7` 模拟器上已确认包安装、进程存在与冷启动成功

仍然保留的限制：

- 本轮没有进入 Slice 1 之后的 Router / 触控 / 导出 / 导入 / 生命周期实现
- Android `dev` 属于长跑命令，本轮通过设备侧安装、进程和冷启动证据确认其结果，而不是依赖命令自然退出

## 8. 进入下一片前必须已经成立的事

- 当前分支已经有可复用的 Android baseline，不再依赖开发者记忆
- 任何人拿到仓库后，至少能复核 Android 壳层入口和 APK 打包入口
- 只有在这个前提下，才能进入 Slice 1 处理 `platform.ts` 和 Router 边界
