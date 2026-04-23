# implementation-review-66-android-release-user-facing-download-labeling-2026-04-23

## Scope

本轮覆盖 Android 公开下载资产的用户视角命名收口与相关文档同步，不涉及应用代码实现。

目标：

- 确认 GitHub Release `v0.1.0` 当前对外下载资产名为 `TacticBoard-android.apk`
- 把根 README、应用工作区 README 与 Android 分发状态文档统一到面向下载用户的口径
- 保留本地技术产物文件名不变，不把内部签名产物名直接暴露为公开下载入口文案

本轮涉及：

- GitHub Release `v0.1.0`
- `README.md`
- `tactics-canvas-24/README.md`
- `docs/android-packaging/android-release-distribution-status.md`
- `docs/DocsReview/README.md`

## Findings

1. GitHub Release `v0.1.0` 当前已经提供友好的 Android 公开下载资产名：
   - `TacticBoard-android.apk`
2. `SHA256SUMS.txt` 当前也已经按新的公开资产名输出校验值。
3. 根 README 仍使用旧的技术文件名 `TacticBoard_0.1.0_universal_release_signed.apk`，并把公开下载表述写成 `signed universal APK`。
4. `tactics-canvas-24/README.md` 仍保留“Android 公开 release 资产尚未发出”的过期描述。
5. Android 分发状态文档仍把旧技术文件名写成当前公开可下载资产名。

## Fixes Applied

### 1. 用户下载入口文案

- 更新 `README.md`：
  - Android 安装步骤改为下载 `TacticBoard-android.apk`
  - 对外说明改为 `Android 安装包（APK）`
  - 公开发布状态表改为用户视角文件名

### 2. 工作区 README 同步

- 更新 `tactics-canvas-24/README.md`：
  - 保留本地 signed APK 技术产物说明
  - 新增当前公开下载资产名 `TacticBoard-android.apk`
  - 移除“尚未公开发布”的旧状态描述

### 3. Android 分发状态文档同步

- 更新 `docs/android-packaging/android-release-distribution-status.md`：
  - 当前公开资产名改为 `TacticBoard-android.apk`
  - 增加对外文案规则：面向下载用户写 `Android 安装包（APK）`

### 4. Review 索引同步

- 更新 `docs/DocsReview/README.md`，补上最近新增的 review 记录入口。

## Validation

### Automated Commands Actually Run

```bash
gh release view v0.1.0 --repo KevinRunzhi/TacticBoard --json assets,body,url
gh release download v0.1.0 --repo KevinRunzhi/TacticBoard --pattern SHA256SUMS.txt --dir $env:TEMP\\tacticboard-release-check --clobber
Invoke-WebRequest -UseBasicParsing https://github.com/KevinRunzhi/TacticBoard/releases/download/v0.1.0/TacticBoard-android.apk -Method Head
git diff --check
```

### Manual Scenarios Actually Run

- 无。  
  本轮不涉及应用代码、安装流程或真机行为变更，只涉及公开下载资产命名和文档回写。

### Results

- GitHub Release `v0.1.0` 资产列表已包含：
  - `TacticBoard-windows-x64-installer.exe`
  - `TacticBoard-android.apk`
  - `SHA256SUMS.txt`
- `SHA256SUMS.txt` 中的 Android 校验项已对应 `TacticBoard-android.apk`
- `TacticBoard-android.apk` 公网下载地址返回 `200`
- 文档改动通过 `git diff --check`

## Remaining Risks

1. 本轮没有重新执行 Android 构建、签名或真机回归；这些结论继续依赖此前 `implementation-review-61` 到 `implementation-review-63` 的证据。
2. 本地构建输出文件名仍保留技术命名，这是刻意保留的工程细节，不影响公开下载入口命名。

## Conclusion

截至本轮结束，Android 公开下载入口已经统一为面向用户的 `TacticBoard-android.apk`，对应 README、工作区 README 与 Android 分发状态文档也已同步到同一口径。
