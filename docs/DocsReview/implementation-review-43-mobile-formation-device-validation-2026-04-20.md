# Implementation Review 43: Mobile Formation Device Validation

## Scope

- 对已经补回的移动端阵型入口做 3 轮设备侧严格验证
- 确认“模拟器上看不到阵型”到底是代码未生效、页面未正常进入编辑器，还是 Android dev 壳的验证噪音
- 只记录本轮验证结论，不引入新的业务代码变更

## Change Size Classification

- validation-only

本轮没有新增业务代码提交范围，属于设备侧验证和定位记录。

## Touched Surfaces

- `docs/DocsReview/implementation-review-43-mobile-formation-device-validation-2026-04-20.md`
- `docs/DocsReview/README.md`

## Findings

1. Android 模拟器最初那一屏不能直接当成“阵型入口没更新”的证据。
   - 第 1 轮验证时，日志里同时出现了 `Entry not found`。
   - 当时过早抓取 WebView DOM，会得到空的 `#root`，容易误判成页面没有更新。

2. 在同一轮 Android dev 壳里，等待页面真正 mount 后，当前代码已经正确渲染工作台和编辑器。
   - 设备侧 DOM 能看到工作台完整内容。
   - 进入 `#/editor?mode=new` 后，底部工具条文本已经包含：
     - `选择`
     - `对象`
     - `阵型`
     - `线路`
     - `区域`
     - `文本`
     - `步骤`
     - `属性`

3. 阵型入口不仅可见，而且真实触摸可用。
   - 第 3 轮里对底部 `阵型` 按钮做了真实 touch 命中。
   - 设备侧随即出现 `选择阵型 · 11v11` 抽屉和内置阵型列表。
   - 再对 `4-4-2` 做真实 touch 命中后，阵型抽屉关闭，说明这条闭环已真实命中。

## Validation Rounds Actually Run

### Round 1: 最新前端是否进入 Android dev 壳

- `npm run tauri:android:dev`
- `adb shell am force-stop com.kevinrunzhi.tacticboard`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- Android 日志确认：
  - Vite dev server 已监听 `198.18.0.1:8080`
  - WebView 能连上 `@vite/client`
  - 同时存在 `Entry not found` 噪音

结论：

- 不能仅凭启动瞬间画面判断“阵型入口不存在”
- 需要继续做设备侧 DOM 级验证

### Round 2: 设备侧 DOM 与编辑器工具条可见性

- 通过 WebView devtools socket 抓取实际 DOM
- 先确认工作台页面正常 mount
- 再在设备侧进入 `#/editor?mode=new`
- 抓取底部所有可见按钮文本和几何位置

设备侧证据：

- 编辑器页面实际文本包含 `阵型`
- `阵型` 按钮矩形位置位于视口内：
  - `x ≈ 107`
  - `y ≈ 786`
  - `w ≈ 46.5`
  - `h ≈ 47`

结论：

- 当前版本在模拟器编辑页里，阵型入口已经真实可见，不是被裁掉或根本没渲染

### Round 3: 真实触摸命中阵型入口与阵型项

- 对底部 `阵型` 按钮做真实 touch
- 设备侧确认抽屉出现：
  - `选择阵型 · 11v11`
  - `4-3-3`
  - `4-2-3-1`
  - `4-4-2`
  - `3-5-2`
  - `4-5-1`
  - `3-4-3`
  - `4-1-4-1`
  - `4-3-2-1`
  - `5-3-2`
- 再对 `4-4-2` 做真实 touch
- 设备侧确认抽屉关闭，回到编辑器主视图

结论：

- 当前移动端阵型入口闭环已经设备侧命中：
  - 可见
  - 可点
  - 可打开抽屉
  - 可点击阵型项并关闭抽屉

## Fixes Applied

- 本轮没有新增业务代码修复
- 结论是上一轮代码修复已经生效，当前用户观察偏差来自 Android dev 壳验证时机和页面状态

## Automated Commands Actually Run

- `npm run tauri:android:dev`
- `adb shell am force-stop com.kevinrunzhi.tacticboard`
- `adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity`
- WebView devtools forward / DOM 查询 / 触摸注入

## Manual Scenarios Actually Run

- Android 模拟器中冷启动应用
- 等待工作台真实渲染
- 进入新建编辑器
- 观察底部工具条是否存在 `阵型`
- 真实 touch 打开阵型抽屉
- 真实 touch 选择 `4-4-2`

## Remaining Risks

- 这轮设备侧验证基于 Android dev 壳，不是最终打包 APK
- `Entry not found` 噪音仍然会干扰开发态验证时机，后续 Android 切片里应继续留意
- 当前设备是模拟器，不是真机

## Anything Still Unverified

- 真机上的同一条阵型入口触控链路
- APK 安装包而非 dev 壳下的阵型入口表现

## Conclusion

- 当前主仓库移动端“阵型入口缺失”问题已经被前一轮代码修复解决。
- 在模拟器上重新做完 3 轮设备侧验证后，可以明确确认：
  - 阵型按钮已经出现在编辑器底部工具条
  - 阵型抽屉可以通过真实触摸打开
  - `4-4-2` 等阵型项可以通过真实触摸命中
- 因此，当前不需要再为这个问题追加新的业务代码修补，可以继续后续切片工作。
