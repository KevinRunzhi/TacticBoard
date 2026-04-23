# Android Release APK Signing - 2026-04-23

## Scope

- 本轮性质：Android release APK 签名与分发基线补齐
- 变更规模分类：validation + docs-only
- 当前关注：
  - 产出一份可正式安装 / 分发的 signed universal release APK
  - 不把 keystore、口令或构建产物提交到仓库
  - 把签名流程和当前限制写回 Android 文档

## Context

关联 source of truth：
- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `tactics-canvas-24/package.json`

当前已存在但尚未签名的产物：
- `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`

## Touched Surfaces

- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/DocsReview/README.md`
- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`

本轮 local-only 产物：
- `E:/code/Project/IDKN/.tacticboard-release/tacticboard-release.keystore`
- `E:/code/Project/IDKN/.tacticboard-release/tacticboard-release-credentials.txt`
- `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-signed.apk`
- `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/TacticBoard_0.1.0_universal_release_signed.apk`

## Findings

1. 当前仓库已经有稳定的 Android release 构建链路，但落盘的是 unsigned APK：
   - `npm run tauri:android:build`
   - `app-universal-release-unsigned.apk`
2. 仓库内没有现成的 release keystore、`key.properties` 或其他正式签名配置。
3. 本机可用的签名工具链已经齐备：
   - `keytool`
   - `zipalign`
   - `apksigner`
4. 使用 Java 21 生成的 `PKCS12` keystore 时，`storepass` 与 `keypass` 必须一致；第一次签名失败就是因为按两个独立口令去取 key。
5. 重新按 `PKCS12 same-password` 规则签名后，APK 已通过 `apksigner verify`：
   - v2: `true`
   - v3: `true`
6. 2026-04-23 后续复验已把签名材料迁到 E 盘，并重新签名同一份 universal release APK。
7. 后续 `adb install -r -g` 没有再卡在设备权限确认，而是得到更准确的系统结果：
   - `INSTALL_FAILED_UPDATE_INCOMPATIBLE`
8. 这说明当前 signed APK 本身是可校验的，但同一台设备上已经装有一个不同证书签名的 `com.kevinrunzhi.tacticboard`；若要安装正式签名包，必须先卸载旧包。
9. 2026-04-23 当轮后续已在同一台手机上执行：
   - `adb uninstall com.kevinrunzhi.tacticboard`
   - `adb install -g TacticBoard_0.1.0_universal_release_signed.apk`
   - `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
10. 结果：
   - 正式签名 APK 安装成功
   - 包名存在：`package:com.kevinrunzhi.tacticboard`
   - 冷启动成功：`LaunchState: COLD`

## Fixes Applied

- 无业务代码改动。
- 新增本地 release keystore，并放到 E 盘仓库本地目录 `.tacticboard-release/`
- 产出 aligned APK、signed APK 和版本化命名的 signed APK
- 把 keystore / 口令文件从 C 盘迁到 E 盘
- 把签名流程、产物路径、keystore 存放规则写回 Android 文档

## Automated Commands Actually Run

```bash
npm run build
npm run test
npm run lint
npm run tauri:android:build
zipalign -p -f 4 app-universal-release-unsigned.apk app-universal-release-aligned.apk
apksigner sign --ks <keystore> --ks-key-alias tacticboard-release --out app-universal-release-signed.apk app-universal-release-aligned.apk
apksigner verify --verbose --print-certs app-universal-release-signed.apk
adb install -r app-universal-release-signed.apk
adb install -r -g TacticBoard_0.1.0_universal_release_signed.apk
adb uninstall com.kevinrunzhi.tacticboard
adb install -g TacticBoard_0.1.0_universal_release_signed.apk
adb shell pm list packages | Select-String tacticboard
adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity
```

结果：
- `npm run build` 通过
- `npm run test` 通过：`48 files / 124 tests`
- `npm run lint` 最初一次因 `vitest.config.ts.timestamp-...mjs` 瞬时文件缺失报错；重跑后通过，保留 `7` 个既有 warning、`0` error
- `npm run tauri:android:build` 通过，重新生成 unsigned universal release APK
- `zipalign` 通过
- `apksigner sign` 通过
- `apksigner verify --verbose --print-certs` 通过，确认 v2/v3 签名有效
- 首次 `adb install -r` 未完成安装，阻塞点为设备侧 `User rejected permissions`
- 后续 `adb install -r -g` 命中 `INSTALL_FAILED_UPDATE_INCOMPATIBLE`
- 卸载旧包后，`adb install -g` 成功
- `adb shell pm list packages | Select-String tacticboard` 命中目标包
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity` 返回 `LaunchState: COLD`

## Manual Scenarios Actually Run

- 无新的应用内手工功能场景；本轮重点是 release 构建与签名链路
- 观察到本轮阻塞已从设备权限确认收敛成“旧包签名不同，无法覆盖安装”
- 在卸载旧包后，已拿到正式签名 APK 的真机安装成功与冷启动证据

## Remaining Risks

- signed APK 不能在已装有不同证书签名旧包的设备上直接覆盖安装
- 如需保持升级链路，后续必须持续复用同一个 release keystore
- 本轮 keystore 为本机新生成的本地 release keystore，尚未接入 Play 商店上传密钥或正式发布签名治理
- 当前只处理了 APK，未补 signed AAB

## Anything Still Unverified

- 用户是否会接受本轮设备侧安装确认
- signed APK 在另一台 Android 设备上的同轮安装成功证据
- signed AAB / 商店分发链路
