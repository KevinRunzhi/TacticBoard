# implementation-review-65-android-release-asset-publish-2026-04-23

## Scope

本轮覆盖 Android APK 公开发布动作与对应文档回写，不涉及应用代码实现。

目标：

- 把 signed universal APK 上传到公开 GitHub Release `v0.1.0`
- 更新 `SHA256SUMS.txt`
- 把仓库文档和对外说明回写到“APK 已可公开下载”的当前事实

本轮涉及：

- GitHub Release `v0.1.0`
- `README.md`
- `docs/android-packaging/android-release-distribution-status.md`

## Findings

1. 本地已经存在可用的 signed universal APK：
   - `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/TacticBoard_0.1.0_universal_release_signed.apk`
2. GitHub Release `v0.1.0` 原本只有：
   - `TacticBoard-windows-x64-installer.exe`
   - `SHA256SUMS.txt`
3. README 和 Android release status 文档仍保留了“Android APK 尚未公开挂到 Releases”的旧状态说明。
4. Release 页面正文也仍然是 Windows-only 口径。

## Fixes Applied

### 1. 发布资产

- 上传：
  - `TacticBoard_0.1.0_universal_release_signed.apk`
- 更新：
  - `SHA256SUMS.txt`

### 2. 文档回写

- 更新 `README.md`：
  - Android 安装说明改为公开下载路径
  - 当前公开发布状态改为 Android 已公开发布
- 更新 `docs/android-packaging/android-release-distribution-status.md`：
  - 改为反映当前 APK 已公开挂载的事实

### 3. 对外发布正文

- 更新 GitHub Release `v0.1.0` 的 release notes，使其不再只描述 Windows 资产。

## Validation

### Automated Commands Actually Run

```bash
gh auth status
gh release list --limit 10
gh release view v0.1.0 --json assets,name,tagName,isDraft,isPrerelease,publishedAt,url
Get-FileHash tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\TacticBoard_0.1.0_universal_release_signed.apk -Algorithm SHA256
gh release upload v0.1.0 tactics-canvas-24\\src-tauri\\gen\\android\\app\\build\\outputs\\apk\\universal\\release\\TacticBoard_0.1.0_universal_release_signed.apk --repo KevinRunzhi/TacticBoard --clobber
gh api repos/KevinRunzhi/TacticBoard/releases/tags/v0.1.0
Invoke-WebRequest -UseBasicParsing https://github.com/KevinRunzhi/TacticBoard/releases/download/v0.1.0/TacticBoard_0.1.0_universal_release_signed.apk -Method Head
```

### Results

- `gh` 登录正常，具备 `repo` scope
- Release `v0.1.0` 现在包含：
  - `TacticBoard-windows-x64-installer.exe`
  - `TacticBoard_0.1.0_universal_release_signed.apk`
  - 更新后的 `SHA256SUMS.txt`
- GitHub API 已返回 Android APK 资产信息
- 公开下载地址返回 `200`

## Remaining Risks

1. 本轮验证的是“公开 release 资产已上线”，不是新一轮 Android 代码或真机回归。
2. Release 资产名称当前沿用了版本化 signed APK 文件名，后续如果要做更友好的分发命名，可单独再调整。

## Conclusion

截至本轮结束，Android APK 已经真正公开挂到 GitHub Releases，外部用户现在可以直接从 `v0.1.0` 下载 Android 安装包。
