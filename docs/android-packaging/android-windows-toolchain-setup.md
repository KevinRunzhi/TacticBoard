# Windows 下 Android 工具链配置教程

## 1. 文档目标

这份文档用于指导 Windows 环境下完成 Android 第一阶段开发所需的基础工具链配置。

目标：

- 安装 Android Studio
- 安装 Android SDK / NDK / command-line tools
- 配置 `ANDROID_HOME` / `ANDROID_SDK_ROOT` / `NDK_HOME`
- 安装 Rust Android targets
- 让当前项目可以继续执行 Android Slice 0

一句话目标：

- `先把 Windows 下的 Android 开发环境配好，再继续执行 Slice 0。`

## 2. 适用范围

本文件覆盖：

- Windows 环境下的 Android Studio 安装
- SDK / NDK / command-line tools 安装
- Java / Android 环境变量配置
- Rust Android targets 配置
- 当前项目的最小验证命令

本文件不覆盖：

- Android 平台壳层实现
- Android 平台桥代码实现
- 应用商店发布与签名
- APK / AAB 上传分发流程

## 3. 关联文档

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/DocsReview/implementation-review-android-phase1-slice0-feasibility-2026-04-17.md`

## 4. 当前项目对环境的最低要求

根据当前 Slice 0 实际探测结果，这台机器已经具备：

- `JAVA_HOME`
- `cargo`
- `rustup`
- `tauri-cli`

当前仍缺：

- `ANDROID_HOME`
- `ANDROID_SDK_ROOT`
- `NDK_HOME`
- Android SDK
- Android NDK
- Rust Android targets

因此当前 Android Slice 0 的真实阻塞不是业务代码，而是 Android 工具链前置未完成。

## 5. 第一步：安装 Android Studio

### 5.1 安装方式

从 Android Studio 官网下载安装包并完成安装。

要求：

- 安装完成后至少打开一次 Android Studio
- 后续所有 SDK / NDK / command-line tools 的安装，都建议通过 Android Studio 的 `SDK Manager` 完成

### 5.2 完成标准

- Android Studio 可正常启动
- 可以进入 `SDK Manager`

## 6. 第二步：安装 SDK / NDK / command-line tools

在 Android Studio 中打开：

- `File`
- `Settings`
- `Android SDK`

### 6.1 SDK Platforms

建议至少安装：

- `Android 10 (API 29)`
- 一个当前稳定的新版本 Android SDK Platform

### 6.2 SDK Tools

建议至少安装：

- `Android SDK Build-Tools`
- `Android SDK Platform-Tools`
- `Android SDK Command-line Tools (latest)`
- `NDK (Side by side)`
- `Android Emulator`（如果你要用模拟器）
- `CMake`（建议安装，避免后续缺依赖）

### 6.3 完成标准

- `SDK Platforms` 已安装至少一套 Android 10+
- `NDK (Side by side)` 已安装
- `Command-line Tools` 已安装

## 7. 第三步：找到 SDK 和 NDK 的真实路径

### 7.1 SDK 路径

Windows 默认常见路径通常是：

```text
C:\Users\<你的用户名>\AppData\Local\Android\Sdk
```

例如当前机器上，Tauri 默认尝试查找的路径就是：

```text
C:\Users\Kevin\AppData\Local\Android\Sdk
```

### 7.2 NDK 路径

安装 NDK 后，常见路径是：

```text
C:\Users\<你的用户名>\AppData\Local\Android\Sdk\ndk\<具体版本号>
```

例如：

```text
C:\Users\Kevin\AppData\Local\Android\Sdk\ndk\27.0.12077973
```

如果你像当前项目机器一样使用自定义路径，也完全可以。例如：

```text
E:\develop\SDK
E:\develop\SDK\ndk\30.0.14904198
```

### 7.3 注意

- `NDK_HOME` 应指向**具体版本目录**，不是 `ndk\` 父目录
- 如果你的 SDK 不在默认路径，也没关系，但环境变量必须写真实路径

## 8. 第四步：配置环境变量

### 8.1 打开环境变量设置界面

Windows 中打开：

- 开始菜单
- 搜索：`环境变量`
- 打开：`编辑系统环境变量`
- 点击：`环境变量`

建议先在“用户变量”中配置。

### 8.2 必配变量

#### ANDROID_HOME

```text
C:\Users\<你的用户名>\AppData\Local\Android\Sdk
```

当前项目机器的示例值：

```text
E:\develop\SDK
```

#### ANDROID_SDK_ROOT

建议与 `ANDROID_HOME` 保持一致：

```text
C:\Users\<你的用户名>\AppData\Local\Android\Sdk
```

当前项目机器的示例值：

```text
E:\develop\SDK
```

#### NDK_HOME

```text
C:\Users\<你的用户名>\AppData\Local\Android\Sdk\ndk\<具体版本号>
```

当前项目机器的示例值：

```text
E:\develop\SDK\ndk\30.0.14904198
```

### 8.3 JAVA_HOME

如果你的 `JAVA_HOME` 已经存在且可用，可以先不改。

例如当前机器已探测到：

```text
JAVA_HOME=D:\develop\JDK21
```

### 8.4 Path 追加目录

在 `Path` 中至少加入：

```text
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

如果你后面要跑模拟器，也建议加：

```text
%ANDROID_HOME%\emulator
```

## 9. 第五步：关闭旧终端，重新打开 PowerShell

环境变量修改后，旧终端不会自动生效。

这一步必须做：

- 关闭当前 PowerShell / CMD
- 重新打开一个新终端

## 10. 第六步：验证环境变量是否生效

重新打开 PowerShell 后，执行：

```powershell
echo $env:ANDROID_HOME
echo $env:ANDROID_SDK_ROOT
echo $env:NDK_HOME
echo $env:JAVA_HOME
```

通过标准：

- `ANDROID_HOME` 有值
- `ANDROID_SDK_ROOT` 有值
- `NDK_HOME` 有值
- `JAVA_HOME` 有值

## 11. 第七步：验证 Android 工具是否可见

执行：

```powershell
where adb
where sdkmanager
java -version
```

通过标准：

- `adb` 能找到路径
- `sdkmanager` 能找到路径
- `java -version` 正常输出

如果 `where sdkmanager` 找不到：

- 检查 `%ANDROID_HOME%\cmdline-tools\latest\bin` 是否已加入 `Path`
- 检查 Android Studio 是否真的安装了 `Android SDK Command-line Tools (latest)`

## 12. 第八步：安装 Rust Android targets

执行：

```powershell
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

然后验证：

```powershell
rustup target list --installed
```

通过标准：

- 至少能看到：
  - `aarch64-linux-android`
  - `armv7-linux-androideabi`
  - `i686-linux-android`
  - `x86_64-linux-android`

## 13. 第九步：验证 Tauri Android 命令

进入项目目录：

```powershell
cd E:\code\Project\IDKN\tactics-canvas-24
```

执行：

```powershell
npx tauri --version
npx tauri android --help
```

通过标准：

- 能看到 `tauri-cli` 版本
- 能看到 Android 子命令：
  - `init`
  - `dev`
  - `build`
  - `run`

## 14. 第十步：重新执行 Slice 0 的 Android 初始化

执行：

```powershell
npx tauri android init
```

通过标准：

- 不再报：
  - `ANDROID_HOME not set`
  - `Android SDK not found`
- Android 平台工程生成成功

如果仍然失败：

- 不要直接猜代码问题
- 先把报错原文记录进：
  - `docs/DocsReview/implementation-review-android-phase1-slice0-feasibility-2026-04-17.md`

## 15. 第十一步：继续执行 Android dev / build

初始化成功后，再执行：

```powershell
npx tauri android dev
npx tauri android build
```

这一步当前只要求：

- Android 壳层能承载前端
- 启动链路成立
- 实际命令和结果被记录下来

当前不要求：

- 主链路编辑
- 导出
- 导入
- 生命周期稳定性

这些属于后续切片。

### 15.1 Windows 符号链接权限注意事项

在当前 Windows 环境下，`npx tauri android build` 可能会失败在 Android Rust 动态库链接步骤，常见错误表现为：

- 无法把 `libtacticboard_lib.so` 链接到 `src-tauri/gen/android/app/src/main/jniLibs/...`
- 错误提示为当前系统不允许创建 symbolic link

如果出现这类错误，优先检查：

- Windows 10 / 11 是否已开启 `Developer Mode`

建议做法：

1. 打开 Windows 设置
2. 搜索：`Developer Mode` 或 `开发者模式`
3. 打开对应开关
4. 重启终端后重新执行：

```powershell
npx tauri android build
```

如果不是 Windows 10+，则需要确认系统是否授予了创建符号链接的权限。

### 15.2 设备 / 模拟器前置

`npx tauri android dev` 要想完成真实启动验证，当前至少需要满足其中一项：

- 已连接真实 Android 设备
- 已创建并启动一个可用的 Android 模拟器（AVD）

建议验证：

```powershell
adb devices
emulator -list-avds
```

如果：

- `adb devices` 为空
- `emulator -list-avds` 也为空

则说明当前还不能完成 `tauri android dev` 的真实启动验证。

### 15.3 当前机器上的实际状态示例

以当前项目机器为例，已经确认：

- `ANDROID_HOME=E:\develop\SDK`
- `ANDROID_SDK_ROOT=E:\develop\SDK`
- `NDK_HOME=E:\develop\SDK\ndk\30.0.14904198`
- `adb` 可见
- `sdkmanager` 可见
- Rust Android targets 已安装
- `npx tauri android init` 已成功
- `npx tauri android build --target x86_64` 已成功
- `npx tauri android dev` 已成功把应用安装并启动到 `Pixel_7` 模拟器

后续建议继续补齐：

- 真实手机验证
- 设备兼容矩阵中的 P1 / P2 观察项

## 16. 第十二步：更新 Slice 0 DocsReview 记录

完成环境配置后，更新：

- `docs/DocsReview/implementation-review-android-phase1-slice0-feasibility-2026-04-17.md`

至少补充：

- 实际 SDK 路径
- 实际 NDK 路径
- Rust Android targets 安装结果
- `npx tauri android init` 新结果
- `npx tauri android dev` 结果
- `npx tauri android build` 结果
- 当前 Slice 是否达到退出条件

## 17. 当前机器的最小完成标准

只要做到下面这些，就可以认为 Windows 下 Android 工具链准备完成：

- Android Studio 已安装
- SDK 已安装
- NDK 已安装
- `ANDROID_HOME` 已设置
- `ANDROID_SDK_ROOT` 已设置
- `NDK_HOME` 已设置
- `adb` / `sdkmanager` 可见
- Rust Android targets 已安装
- `npx tauri android init` 不再报 SDK not found

## 18. 当前建议的最快检查命令

如果你想让我快速判断环境是否已经配好，请把下面这些命令的输出给我：

```powershell
echo $env:ANDROID_HOME
echo $env:ANDROID_SDK_ROOT
echo $env:NDK_HOME
where adb
where sdkmanager
rustup target list --installed
npx tauri android init
```

我可以根据结果直接告诉你：

- 现在能不能继续跑 `dev / build`
- 还卡在哪一层

## 19. 当前结论

当前 Slice 0 的真实状态已经很明确：

- 不是代码问题
- 不是 Tauri CLI 缺失
- 当前工具链前置已经基本完成
- 当前 Slice 0 的最小目标已经成立：
  - Android init 成功
  - Android dev 成功启动到模拟器
  - Android x86_64 release build 成功

所以你接下来最正确的顺序是：

1. 记录并固定本轮 Slice 0 结果
2. 进入 Slice 1
3. 在后续兼容性阶段补真实手机与更多设备等级验证
