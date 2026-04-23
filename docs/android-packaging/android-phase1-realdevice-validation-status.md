# Android Phase 1 Real-Device Validation Status

## Scope

这份文档用于记录 Android Phase 1 在真实设备上的当前收口状态。
它不是新的切片计划，也不是单轮 `DocsReview` 的替代品，而是把已经成立的设备侧结论写回平台文档层，避免关键信息只停留在验证日志里。

## Current Status (2026-04-23)

当前已经完成的真实设备安装态验证：

- 设备：`vivo X100s`
- 型号：`V2359A / PD2309`
- 等级：`P0`
- Android：`16 / SDK 36`
- ROM 标识：`PD2359C_A_16.2.10.1.W10`
- 设备：`HUAWEI TGR-W10`
- 型号：`TGR-W10 / TGR-W20`
- 等级：`P0`
- Android：`12`
- 说明：本轮平板安装态验证基于当前本地工作区构建、再用本机 debug keystore 临时签名后的 release APK

说明：

- `2026-04-23` 起，Android Phase 1 的正式完成声明绑定到已提交基线 `7e4aca8`
- 该基线固定了：
  - Android share-return 修复
  - P0 手机 / P0 平板 / P1 风险观察记录
  - 最终 `DocsReview`
- release APK 验证链里仍包含本机 debug keystore 临时签名的安装包，这一点继续作为已记录限制保留
- 2026-04-22 后续复验已经确认：phone 横屏进入 tablet breakpoint 后，`TopToolbar` 已不再压进系统状态区
- 新的设备侧硬证据：
  - `analysis/android-fulltest/56-open-recent-after-fix.png`
  - `analysis/android-fulltest/57-landscape-after-fix.png`
  - `analysis/android-fulltest/58-portrait-restored-after-fix.png`
  - `docs/DocsReview/implementation-review-55-android-landscape-safe-area-fix-2026-04-22.md`
- 2026-04-22 同一轮后续还新增了用户手工真机复验结论：`vivo X100s` 上安装态 release APK 的球员拖动、阵型切换、参考底图导入均已确认可用；对应记录见 `docs/DocsReview/implementation-review-56-android-slice6-p0-phone-manual-validation-2026-04-22.md`
- 2026-04-23 已在同一台 `HUAWEI TGR-W10` 安装态 debug-signed release APK 上复验通过：从华为系统分享面板按返回后，应用会回到原编辑器，而不是落回工作台；对应记录见 `docs/DocsReview/implementation-review-58-android-slice6-tablet-share-return-fix-2026-04-23.md`
- 2026-04-23 已用同一台 `vivo X100s` 完成一轮 `P1` 风险观察：当前安装态 debug-signed release APK 在冷启动、系统分享与 `Home -> 热返回` 路径上未观察到阻塞级 ROM 差异；对应记录见 `docs/DocsReview/implementation-review-59-android-slice6-p1-phone-risk-observation-2026-04-23.md`
- 2026-04-23 已基于已提交基线 `7e4aca8` 做出正式完成声明；对应记录见 `docs/DocsReview/implementation-review-60-android-phase1-completion-declaration-2026-04-23.md`
- 2026-04-23 已基于本地 release keystore 产出并校验通过 universal signed APK：
  - `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-signed.apk`
  - `tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/TacticBoard_0.1.0_universal_release_signed.apk`
  - keystore 与口令文件现保存在 E 盘工作区本地目录 `.tacticboard-release/`
  - 2026-04-23 复验 `adb install -r -g` 时，系统先返回 `INSTALL_FAILED_UPDATE_INCOMPATIBLE`：当前设备已安装的 `com.kevinrunzhi.tacticboard` 与 signed APK 证书不一致
  - 同轮在卸载旧的 debug / 本地签名包后，`adb install -g` 成功，且 `adb shell am start -W` 命中 `LaunchState: COLD`
  - 对应记录见 `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`

## Passed With Real-Device Hard Evidence

截至 `2026-04-23`，下列项目已经具备真实手机安装态硬证据。说明：这里的含义是“至少在一台 P0 真机上成立”，不等于所有 P0 设备已经全部通过。

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

## Passed With P0 Tablet Real-Device Hard Evidence

截至 `2026-04-23`，以下项目已经在 `HUAWEI TGR-W10` 安装态 debug-signed release APK 上拿到平板真机硬证据：

- 冷启动进入工作台
- 工作台 -> 继续最近项目 -> 旧项目进入编辑器
- 导出设置打开
- PNG 导出 -> 华为系统分享面板拉起
- 从系统分享面板返回后，仍回到原编辑器
- 参考底图 -> 系统选择器打开 -> 导入成功
- Home -> 回前台恢复当前编辑上下文
- 竖屏 / 横屏切换后上下文保留
- 新建空白项目首次保存 -> 返回工作台 -> 再次继续编辑
- 项目页打开
- 设置页打开

这些结论的现场证据见：

- `docs/DocsReview/implementation-review-57-android-slice6-p0-tablet-realdevice-validation-2026-04-22.md`
- `docs/DocsReview/implementation-review-58-android-slice6-tablet-share-return-fix-2026-04-23.md`

## Passed With User-Confirmed Real-Device Manual Validation

截至 `2026-04-22`，以下项目已经由用户在同一台 `vivo X100s` 上手工复验确认通过：

- 球员拖动
- 阵型切换
- 参考底图导入

说明：

- 这三项结论来自用户在真机安装态 release APK 上的直接手指操作，不是 injected touch 推断
- 本轮我没有重新抓取这三项的截图、录屏或 logcat，因此这里应记录为 `用户确认的真机手工验证通过`
- 对应留痕见：
  - `docs/DocsReview/implementation-review-56-android-slice6-p0-phone-manual-validation-2026-04-22.md`

## Passed With P1 Risk Observation

截至 `2026-04-23`，以下 `P1` 风险观察已经成立：

- 观察载体：`vivo X100s`
- 角色：`P1 深度定制 ROM / 激进后台管理风险观察`
- 冷启动命令输出为 `LaunchState: COLD`，未见明显异常启动阻塞
- 安装态 APK 内可进入 `导出设置`
- PNG 导出后命中标准 Android `com.android.intentresolver` 分享面板
- `Home -> 再次拉回前台` 本轮观察到 `LaunchState: HOT`，未见立即被系统杀死后重启

说明：

- 这轮 `P1` 观察与既有 `P0` 主流手机基线共用同一台 `vivo X100s`
- 当前文档口径下，这足以满足“至少一轮 P1 风险观察”的要求，但不等于已经覆盖多台 P1 风险样本
- `P1` 文件选择器在这一轮没有新增同轮硬证据；该设备上的参考底图导入可用性，仍主要由 `2026-04-22` 用户手工真机确认提供支持
- 对应留痕见：
  - `docs/DocsReview/implementation-review-59-android-slice6-p1-phone-risk-observation-2026-04-23.md`

## Passed With Signed Release APK Manual Acceptance

鎴嚦 `2026-04-23`锛屼互涓嬮」鐩凡缁忓湪 `vivo X100s` 鐨勬寮忕鍚?universal release APK 涓婂畬鎴愬悓杞墜宸ラ獙鏀讹細

- 鍐峰惎鍔ㄨ繘鍏ュ伐浣滃彴
- 宸ヤ綔鍙?/ 椤圭洰椤?/ 璁剧疆椤甸棿瀵艰埅鎴愮珛
- 宸叉湁姝ｅ紡椤圭洰鍙墦寮€杩涘叆缂栬緫鍣?
- 瀵煎嚭璁剧疆鎵撳紑
- PNG 瀵煎嚭 -> 绯荤粺鍒嗕韩闈㈡澘
- 浠庣郴缁熷垎浜潰鏉胯繑鍥炲悗锛屼粛鍥炲埌鍘熺紪杈戝櫒
- 鏂板缓绌虹櫧椤圭洰 -> 棣栨淇濆瓨鎴愬姛
- 杩斿洖宸ヤ綔鍙?-> 椤圭洰鍒楄〃鍑虹幇“鏂板缓鎴樻湳鏉?-> 浠庨」鐩垪琛ㄩ噸鏂版墦寮€
- Home -> HOT return
- 妯睆 -> 绔栧睆鎭㈠

璇存槑锛?

- 鏈疆楠屾敹鐩爣鏄€滃悓杞?signed APK 鎵嬪伐楠屾敹鈥濓紝鍩虹嚎鏄綋鍓?HEAD `7b70ae0`
- 鐜板満璇佹嵁淇濆瓨鍦?`analysis/signed-apk-fulltest/`锛屼緥濡傦細
  - `accept-00-home.png`
  - `accept-02-editor-existing.png`
  - `accept-04-share.png`
  - `accept-05-share-return.png`
  - `accept-08-new-via-projects.png`
  - `accept-10-home-after-save.png`
  - `accept-12-projects-after-save.png`
  - `accept-13-reopen-from-projects.png`
  - `accept-14-hot-return.png`
  - `accept-15-landscape.png`
  - `accept-16-portrait-restored.png`
  - `accept-21-settings.png`
- 鏈疆娌℃湁鎶?`鍙傝€冨簳鍥惧鍏?` 鍐嶈ˉ鎴愬悓杞鍚戠‖璇佹嵁锛氭垜宸茬粡鍦ㄧ鍚?APK 鍐呰繘鍏?`椤圭洰灞炴€?` 鍜?`瀵煎叆鍙傝€冨簳鍥?` 鍏ュ彛锛屼絾鏈疆鏈€鍚庢病鏈夋嬁鍒?鈥滅郴缁熼€夊浘鍣?-> 閫夊浘 -> 瀵煎叆瀹屾垚鈥濈殑鍚岃疆鎴浘锛屽洜姝や笉鎶婂畠鍐欎负鏈疆閫氳繃椤?
- 瀵瑰簲鐣欑棔瑙侊細
  - `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`

- `2026-04-23` follow-up: the user manually confirmed on the same `vivo X100s` signed release APK that `Project Properties -> Import Reference Image -> System Picker -> Select Image -> Import Complete` succeeds.
- This closes the remaining signed-APK reference-import gap left by review 62.
- Follow-up record:
  - `docs/DocsReview/implementation-review-63-signed-apk-reference-import-user-confirmation-2026-04-23.md`

## Open Issues And Remaining Risks

截至 `2026-04-23`，以下项目作为完成声明后的剩余风险保留：

1. 当前设备矩阵层面已无新的 P0 / P1 阻塞，但仍保留已记录限制
   - `P1` 这一轮由 `vivo X100s` 同时承担 `P0` 主流手机与 `P1` 风险观察角色
   - `P1` 文件选择器没有新增同轮硬证据，仍主要依赖前一轮用户手工确认
2. 当前完成声明不等于“广泛 Android 兼容性完成”
   - 尚未补第二台独立 `P1` 风险设备
   - 已补 signed APK 生成、签名校验与真机安装；但当前设备若已存在不同证书签名的旧包，仍需先卸载旧包
   - 尚未扩大到所有 ROM / 所有设备形态

## What This Means For Slice 6

当前 Slice 6 结论：

- `已关闭`

原因：

- 已经有 P0 手机与 P0 平板的安装态真机硬证据
- 2026-04-22 后续复验已经确认：横屏安全区 / 顶栏遮挡问题已修复，不再作为当前 Slice 6 阻塞项
- 用户已在同一台 P0 真机上手工确认：球员拖动、阵型切换、参考底图导入可用
- 2026-04-23 已在 `HUAWEI TGR-W10` 上复验通过：系统分享面板返回后仍会回到原编辑器
- 2026-04-23 已完成至少一轮 `P1` 风险观察，当前未发现会阻塞 Android Phase 1 的 ROM 级差异
- 2026-04-23 已完成最终统一收口 `DocsReview`
- 2026-04-23 已基于已提交基线 `7e4aca8` 做出正式完成声明

因此，当前可以正式宣称：

- `Android Phase 1 已完成`

## Next Required Validation

当前不再有 Android Phase 1 阻塞级后续验证；如需继续扩展验证，优先顺序为：

1. 增加第二台独立 `P1` 风险设备
2. 如果后续要扩大 ROM 风险覆盖，再补第二台 `P1` 设备或补一轮 `P1` 文件选择器硬证据
