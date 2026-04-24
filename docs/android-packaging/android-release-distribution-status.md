# Android Release Distribution Status

## Scope

本文用于说明 Android 当前的 `构建完成状态`、`signed APK 状态`、`公开 GitHub Release 状态` 与 `发布边界`。

它不是切片计划，也不是实现验证日志；它的作用是把“仓库内已经完成的 Android 发布准备”和“外部用户现在可以从 Releases 下载 Android APK”的状态写清楚。

## Current Status (2026-04-24)

截至 `2026-04-24`，Android 这条线已经成立的事实是：

- Android Phase 1 已完成
- signed universal APK 已生成
- signed APK 已完成签名校验
- signed APK 已完成真机安装、冷启动与手工验收基线
- 签名材料已迁移到 `E:/code/Project/IDKN/.tacticboard-release/`
- 公开 GitHub Release 已提供 `TacticBoard-android.apk`

当前公开下载入口：

- `https://github.com/KevinRunzhi/TacticBoard/releases/latest/download/TacticBoard-android.apk`
- `https://github.com/KevinRunzhi/TacticBoard/releases/latest/download/TacticBoard-windows-x64-installer.exe`
- `https://github.com/KevinRunzhi/TacticBoard/releases/latest/download/SHA256SUMS.txt`

## What Is Already True

当前已经完成并可被文档引用的 Android release-ready 与 public release 基线包括：

- `npm run tauri:android:build` 可稳定生成 universal release APK
- 本地 `zipalign + apksigner` 流程已通过
- signed APK 已通过 `apksigner verify --verbose --print-certs`
- signed APK 已在 `vivo X100s` 上完成安装与冷启动
- signed APK 已完成一轮真机手工验收
- `TacticBoard-android.apk` 已作为公开 Release 资产提供下载

对应证据见：

- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`
- `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`
- `docs/DocsReview/implementation-review-63-signed-apk-reference-import-user-confirmation-2026-04-23.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `https://github.com/KevinRunzhi/TacticBoard/releases/latest`

## Public Wording Rule

截至 `2026-04-24`，对外文案应按以下口径书写：

- Android APK 已公开下载
- 最新公开 Release 提供 Windows 安装包与 Android APK
- Android Phase 1 已完成
- signed APK 已完成真机安装与手工验收

## Source Of Truth

- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`
- `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`
- `docs/DocsReview/implementation-review-63-signed-apk-reference-import-user-confirmation-2026-04-23.md`

外部公开状态核对入口：

- [GitHub Releases](https://github.com/KevinRunzhi/TacticBoard/releases/latest)
