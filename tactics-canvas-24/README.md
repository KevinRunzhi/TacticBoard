# TacticBoard Frontend + Tauri Shell

这个目录包含 TacticBoard 的前端应用与 Windows 桌面壳层：

- 前端：React + Vite
- 桌面壳：Tauri 2
- Windows 安装包：NSIS

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run tauri
npm run tauri:dev
npm run tauri:build
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

## 主要目录

- `src/`：共享业务前端代码
- `src-tauri/`：Tauri Windows 壳层与打包配置
- `src/test/`：Web / 平台桥相关自动化测试

## Windows 打包产物

默认构建输出位于：

- `src-tauri/target/release/bundle/nsis/`

验收时建议优先记录产物输出目录，而不是把某一个固定安装包文件名写成唯一证据。

## Android baseline 命令

Slice 0 重新启动后，当前仓库固定的 Android baseline 入口为：

```bash
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

说明：

- `tauri:android:build` 当前默认包装 `tauri android build --apk`
- 如需补充目标参数，可使用 `npm run tauri:android:build -- --target x86_64`

## 当前范围说明

- 当前阶段聚焦 Windows 第一阶段打包可运行、可构建、主链路可回归
- 未签名安装包触发 SmartScreen 提示属于当前阶段预期现象
- 代码签名与自动更新不在当前阶段范围内
