# TacticBoard App Workspace

这个目录承载 TacticBoard 的实际应用代码与 Tauri 壳层。

当前技术栈：

- React 18
- TypeScript
- Vite 5
- Vitest
- Tauri 2

## 你会在这里找到什么

- `src/`
  共享业务前端代码；这是 Web、Windows、Android 共用的单一业务源码
- `src-tauri/`
  Tauri 壳层、能力配置、平台桥接与桌面 / Android 打包相关内容
- `src/test/`
  Web、平台桥接、Tauri 相关自动化测试

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run preview
npm run tauri
npm run tauri:dev
npm run tauri:build
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

## 当前打包输出

### Windows

默认桌面打包输出位于：

- `src-tauri/target/release/bundle/nsis/`

### Android

当前稳定构建命令：

```bash
npm run tauri:android:build
```

默认会产出 universal unsigned release APK：

- `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`

当前仓库还已经完成了本地 signed APK 基线：

- `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-signed.apk`
- `src-tauri/gen/android/app/build/outputs/apk/universal/release/TacticBoard_0.1.0_universal_release_signed.apk`

说明：

- 这些 signed APK 是“仓库内已经验证完成的本地 release 产物”
- GitHub Releases 当前面向下载用户提供的 Android 资产为 `TacticBoard-android.apk`
- 本地技术产物文件名与公开下载资产名不要求一致

## 当前工程状态

- Windows 第一阶段打包链路已完成并已有公开 release
- Android Phase 1 已完成源代码、签名、真机安装与验收基线
- Android 公开 Release 资产已上线，当前对外下载名为 `TacticBoard-android.apk`

## 相关文档

- `../README.md`
- `../docs/android-packaging/android-release-distribution-status.md`
- `../docs/android-packaging/android-development-guide.md`
- `../docs/android-packaging/android-phase1-realdevice-validation-status.md`
