# Android Release Distribution Status

## Scope

本文用于说明 Android 当前的 `构建完成状态`、`signed APK 状态` 与 `公开 GitHub Release 状态`。

它不是切片计划，也不是实现验证日志；它的作用是把“本地已经完成的 Android 发布准备”与“外部用户现在能否从 Releases 直接下载 Android APK”明确写成当前事实。

## Current Status (2026-04-23)

截至 `2026-04-23`，Android 这条线已经成立的事实是：

- Android Phase 1 已完成
- signed universal APK 已生成
- signed APK 已完成签名校验
- signed APK 已完成真机安装、冷启动与手工验收基线
- 签名材料已迁移到 `E:/code/Project/IDKN/.tacticboard-release/`

截至同一天，外部公开分发状态已经是：

- GitHub Releases 当前公开的最新版本是 `v0.1.0`
- Android APK 已作为公开 Release 资产挂到 GitHub Releases
- 当前公开可下载的 Android 资产为：
  - `TacticBoard-android.apk`
- GitHub Releases 面向下载用户使用简化命名 `TacticBoard-android.apk`

## What Is Already True

当前已经完成并可被文档引用的 Android release-ready 基线包括：

- `npm run tauri:android:build` 可稳定生成 universal release APK
- 本地 `zipalign + apksigner` 流程已通过
- signed APK 已通过 `apksigner verify --verbose --print-certs`
- signed APK 已在 `vivo X100s` 上完成安装与冷启动
- signed APK 已完成一轮真机手工验收

对应证据见：

- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`
- `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`
- `docs/DocsReview/implementation-review-63-signed-apk-reference-import-user-confirmation-2026-04-23.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`

## What Is Public Now

当前已经可以对外明确写成：

- 最新公开 Release 已提供 Android APK
- GitHub Releases 当前已经能直接下载 Android APK
- 当前公开下载资产名为 `TacticBoard-android.apk`

这意味着当前仍然要明确区分：

1. 仓库内已经完成的 Android release-ready 基线
2. GitHub Releases 上已经公开可下载的 Android 资产

如果 README、发布说明或对外文案没有区分这两层，就会把“仓库基线完成”和“公开 Release 已上线”的边界写混。

## Current Public Wording Rule

截至 `2026-04-23`，对外文案应按以下口径书写：

- 可以写：
  - Android Phase 1 已完成
  - signed APK 基线已完成
  - signed APK 已完成真机安装与手工验收
  - 最新公开 Release 已提供 Android APK
  - GitHub Releases 当前已经能直接下载 Android APK
  - README 等面向下载用户的文案写 `Android 安装包（APK）`
  - 如需写公开下载文件名，使用 `TacticBoard-android.apk`
- 不应写：
  - Android APK 仍未公开发布
  - GitHub Releases 还不能直接下载 Android APK
  - Android 公开 Release 资产待补挂
  - 面向下载用户继续使用 `signed universal APK` 作为公开下载名称

## Source Of Truth

- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`
- `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`
- `docs/DocsReview/implementation-review-63-signed-apk-reference-import-user-confirmation-2026-04-23.md`

外部公开状态核对入口：

- [GitHub Releases](https://github.com/KevinRunzhi/TacticBoard/releases/latest)
