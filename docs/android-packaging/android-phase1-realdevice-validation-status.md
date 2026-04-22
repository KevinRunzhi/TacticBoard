# Android Phase 1 Real-Device Validation Status

## Scope

这份文档用于记录 Android Phase 1 在真实设备上的当前收口状态。

它不是新的切片计划，也不是单轮 `DocsReview` 的替代品，而是把已经成立的设备侧结论写回平台文档层，避免关键事实只停留在验证日志里。

## Current Status (2026-04-22)

当前已经完成的真实设备安装态验证：

- 设备：`vivo X100s`
- 型号：`V2359A / PD2309`
- 等级：`P0`
- Android：`16 / SDK 36`
- ROM 标识：`PD2359C_A_16.2.10.1.W10`

说明：

- 本轮验证基于当前本地工作区，而不是干净已提交的 acceptance baseline
- APK 由当前本地工作区构建后安装到真机
- release APK 为本地验证方便，使用本机 debug keystore 临时签名安装
- 因此这些结论可视为 `当前本地工作区的真机安装态状态`，不能直接写成 Android Phase 1 正式完成
- 2026-04-22 后续修复已在同一台 `vivo X100s` 安装态 release APK 上再次验证通过：phone 横屏进入 tablet breakpoint 后，`TopToolbar` 已不再压进系统状态区
- 新的设备侧硬证据：
  - `analysis/android-fulltest/56-open-recent-after-fix.png`
  - `analysis/android-fulltest/57-landscape-after-fix.png`
  - `analysis/android-fulltest/58-portrait-restored-after-fix.png`
  - `docs/DocsReview/implementation-review-55-android-landscape-safe-area-fix-2026-04-22.md`

## Passed With Real-Device Hard Evidence

截至 `2026-04-22`，下列项目已经具备真机安装态硬证据：

- 冷启动进入工作台
- 工作台 -> 旧项目进入编辑器
- 工作台 -> 新建空白项目
- 项目列表 -> 打开既有项目
- PNG 导出 -> 系统分享面板
- 取消分享 -> 返回编辑器
- 项目属性抽屉打开
- Home -> 回前台热恢复
- 横竖屏切换后编辑上下文仍存在

这些结论的现场证据见：

- `docs/DocsReview/implementation-review-54-android-realdevice-full-validation-2026-04-22.md`

## Open Issues And Unclosed Items

截至 `2026-04-22`，以下项目仍未收口：

1. 球员拖动  
   - 在安装态 release APK 下，本轮 injected touch 没有拿到正向成功证据
   - 当前只能写成“待人工手指复验”，不能直接宣称通过

2. 阵型卡片应用  
   - 阵型抽屉可以打开
   - 但安装态下，本轮 injected tap 没有拿到阵型切换成功证据
   - 当前只能写成“待人工手指复验”

3. 参考底图导入  
   - 本轮没有拿到系统图片选择器被成功拉起的正向安装态证据
   - 当前不能宣称 Slice 4 在安装态真机已经完成

## What This Means For Slice 6

当前 Slice 6 结论：

- `未达到退出条件`

原因：

- 已经有部分 P0 真机硬证据
- 2026-04-22 后续复验已经确认：横屏安全区 / 顶栏遮挡问题已修复，不再作为当前 Slice 6 阻塞项
- 同时还存在多个尚未拿到安装态真机正向成功证据的关键交互：
  - 球员拖动
  - 阵型切换
  - 参考底图导入

因此，当前还不能宣称：

- `Android Phase 1 已完成`

## Next Required Validation

下一轮最优先的真机验证顺序：

1. 在同一台 P0 真机上用人工手指复验：
   - 球员拖动
   - 阵型切换
   - 参考底图导入
2. 真机正向证据补齐后，再继续平板或 P1 设备验证
