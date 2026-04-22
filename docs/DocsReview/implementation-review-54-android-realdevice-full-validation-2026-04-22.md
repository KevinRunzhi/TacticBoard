# Android Real-Device Full Validation - 2026-04-22

## Scope

- 本轮性质：Android 真机安装态全量验证
- 变更规模分类：validation-only（本轮不新增业务代码修复）
- 当前 Slice 关注面：
  - Slice 2：touch-first main flow
  - Slice 3：PNG export and system share
  - Slice 4：system picker and local-copy asset import boundary
  - Slice 5：save / recovery / lifecycle / orientation
  - Slice 6：device-tier validation and phase-1 closure readiness

## Context

关联 source of truth：

- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/android-packaging/slices/slice-6-device-tier-validation-regression-phase1-closure.md`
- `tactics-canvas-24/package.json`
- `tactics-canvas-24/src-tauri/tauri.conf.json`

本轮目标：

- 用更接近真实用户的安装态 APK，而不是只依赖 dev 壳，重新跑 Android 主链路
- 区分已经具备真机硬证据的能力、仅有自动化证据的能力、以及安装态下仍需人工手指确认的可疑项
- 给 Slice 6 提供当前是否能收口的直接证据

本轮不覆盖：

- 真机平板
- 多 ROM / P1 设备
- 正式发布签名链路
- App Store / 应用商店分发

## Committed Scope vs Local-Only Experiments

- 本轮验证基于当前本地工作区，而不是干净已提交的 Android acceptance commit
- 当前工作区仍包含多项未提交的 Android 相关代码与文档改动
- 因此本轮结论只能写成：
  - `当前本地工作区在 vivo X100s 上的安装态验证结果`
- 不能直接写成：
  - `Android Phase 1 已正式收口`

## Device Inventory

| 设备名 | 设备型号 | 等级 | Android | 设备类型 | ROM / 系统标识 | 备注 |
|---|---|---|---|---|---|---|
| vivo X100s | V2359A (`PD2309`) | P0 | Android 16 / SDK 36 | 手机 | `PD2359C_A_16.2.10.1.W10` | USB 真机 |

## Commands

### Shared Validation

- `npm run build`
- `npm run test`
- `npm run lint`
- `git diff --check`

结果：

- `build` 通过
- `test` 通过：`47` files / `118` tests
- `lint` 通过：仅保留既有 `7` 个 warning，无新 error
- `git diff --check` 通过

### Packaging / Runtime Validation

- `npm run tauri:android:build`
- `apksigner.bat sign --ks %USERPROFILE%\\.android\\debug.keystore ...`
- `adb uninstall com.kevinrunzhi.tacticboard`
- `adb install -r ...\\app-universal-release-debugsigned.apk`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- `npm run tauri:dev` smoke

结果：

- 成功生成 release APK：`app-universal-release-unsigned.apk`
- 使用本机 debug keystore 临时签名后，可安装到真机
- 真机冷启动成功
- 桌面 `tauri:dev` smoke 成功，日志命中 `target\\debug\\tacticboard.exe`

说明：

- 本轮对 release APK 的签名仅用于本地真机验证，不构成正式发布签名结论

## Manual Scenarios Actually Run

### Passed With Device-Side Hard Evidence

1. 冷启动应用进入工作台  
   证据：
   - `analysis/android-fulltest/01-launch-home.png`
   - `adb shell am start -W` 冷启动结果

2. 工作台 -> 最近项目 -> 编辑器  
   证据：
   - `analysis/android-fulltest/02-open-recent.png`
   - `analysis/android-fulltest/03-editor-overlay-dismissed.png`

3. 编辑器 -> 导出对话框 -> 系统分享面板 -> 取消分享 -> 返回编辑器  
   证据：
   - `analysis/android-fulltest/12-export-dialog.png`
   - `analysis/android-fulltest/13-export-share.png`
   - `analysis/android-fulltest/13-export-share.xml`
   - `analysis/android-fulltest/14-share-cancel-back-editor.png`

4. 编辑器 -> 返回工作台  
   证据：
   - `analysis/android-fulltest/15-back-dashboard.png`

5. 工作台 -> 新建空白项目  
   证据：
   - `analysis/android-fulltest/20-open-recent-from-dashboard.png`
   - 该截图实际证明命中了“新建空白项目”入口

6. 项目列表 -> 打开既有项目  
   证据：
   - `analysis/android-fulltest/21-open-recent-corrected.png`
   - `analysis/android-fulltest/22-open-project-from-list.png`

7. 编辑器 -> 项目属性抽屉  
   证据：
   - `analysis/android-fulltest/23-properties-drawer.png`

8. Home -> 回前台热恢复  
   证据：
   - `analysis/android-fulltest/28-home-return-state.png`
   - `adb shell am start -W` 返回 `HOT`

9. 横屏 -> 竖屏切回时，编辑上下文仍存在  
   证据：
   - `analysis/android-fulltest/26-landscape-state.png`
   - `analysis/android-fulltest/27-portrait-restored.png`

### Negative / Incomplete Evidence In This Round

1. 选中球员后的拖动  
   现象：
   - 在 release APK 安装态下，多次 `adb shell input touchscreen swipe / draganddrop` 没有得到可见位置变化
   - 截图里选中高亮仍在原位，顶部状态也没有转脏
   结论：
   - 当前只能记作 `安装态真机负向证据，待人工手指复验`
   - 不能在本轮直接写成“已确认 release 包拖动失效”

2. 阵型抽屉中的阵型卡片应用  
   现象：
   - 阵型抽屉可以打开，但多次 injected tap 没有得到可见阵型变化
   结论：
   - 当前只能记作 `安装态真机负向证据，待人工手指复验`

3. 项目属性中的“导入参考底图”  
   现象：
   - 本轮两次 injected tap 都没有拿到系统图片选择器
   结论：
   - 当前只能记作 `安装态导入入口未取得正向硬证据`
   - 不能写成 Slice 4 在安装态真机已通过

## Findings

1. 已确认问题：横屏状态下，顶部编辑栏压进系统状态区，状态栏图标与应用顶部控件发生明显重叠。  
   证据：`analysis/android-fulltest/26-landscape-state.png`

2. 安装态真机上，球员拖动在 injected touch 路径下没有得到正向成功证据。  
   这与此前 dev 壳真机验证形成差异，优先级高，但仍需人工手指复验后再决定是否作为正式回归 bug。

3. 安装态真机上，阵型抽屉卡片应用在 injected tap 路径下没有得到正向成功证据。  
   当前更像“安装态命中/交互待确认”，不能先写成已通过。

4. 安装态真机上，参考底图导入按钮本轮没有成功拉起系统选择器。  
   这一项当前处于未验证完成状态。

## Fixes Applied

- 无
- 本轮只做验证与证据收集，不对源码进行新的修复提交

## Blocking Issues

- 横屏安全区 / 顶栏遮挡问题已具备真机硬证据，阻塞 Slice 6 收口
- 安装态真机上的拖动与阵型应用仍缺正向成功证据，当前不应宣称 Android Phase 1 可关闭

## Non-Blocking Risks

- 工作台上的多个入口在 injected tap 场景下对坐标较敏感，本轮中有过一次误命中新建空白项目；这更像验证操作误差，不单独记为产品 bug
- 本轮 release APK 使用本机 debug keystore 临时签名，仅可作为设备验证产物

## Known Limitations

- 未覆盖真机平板
- 未覆盖 P1 / P2 设备
- 未覆盖正式发布签名包
- 未覆盖“人工手指直接操作”的逐项复验录屏

## Acceptance Mapping

- [x] P0 设备启动与进入
- [x] P0 主链路的主要入口链路（工作台 / 项目列表 / 旧项目打开 / 新建空白项目）
- [x] P0 PNG 导出
- [x] P0 系统分享
- [ ] P0 参考底图导入
- [ ] P0 球员头像导入
- [x] P0 Home -> 回前台热恢复
- [x] P0 横竖屏切换后上下文保持
- [ ] P1 风险观察
- [ ] P2 观察项

## Decision

本轮结论：

- 当前本地工作区已经具备一批 release APK 真机安装态硬证据
- 但 Slice 6 不能关闭
- Android Phase 1 不能在当前轮次宣称完成

Slice Exit Decision：

- [ ] 当前 Slice 已达到退出条件
- [x] 当前 Slice 仍未达到退出条件

建议下一步：

1. 先修复横屏安全区 / 顶栏遮挡
2. 在同一台真机上补人工手指复验：
   - 球员拖动
   - 阵型切换
   - 参考底图导入
3. 真机通过后，再继续 P1 设备或平板验证
