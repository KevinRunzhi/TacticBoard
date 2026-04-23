# Implementation Review 41: Android Slice 2 Touch Main-Flow Restart

## Scope

- 重新建立 Android Phase 1 Slice 2 的触控主链路 baseline
- 补齐移动端抽屉契约、顶部关键操作触控链路和 Android / mobile 专用回归
- 以当前分支已提交实现为准，重新判断 Slice 2 是否达到关闭条件

## Change Size Classification

- `large`

判定依据：

- 变更跨越多个用户可见组件、自动化测试和 Android 文档基线
- 需要同时验证 Web 共享主链路、桌面 Tauri smoke 和 Android 设备侧主链路
- 需要核对组件契约、触控事件链和设备侧保存闭环，而不是单一缺陷修补

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
- `tactics-canvas-24/src/components/tactics/MobilePropertiesDrawer.tsx`
- `tactics-canvas-24/src/components/tactics/TabletRightDrawer.tsx`
- `tactics-canvas-24/src/components/tactics/MobileToolbar.tsx`
- `tactics-canvas-24/src/components/tactics/MobileStepsDrawer.tsx`
- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`
- `tactics-canvas-24/src/test/responsive-properties-drawer.test.tsx`
- `tactics-canvas-24/src/test/mobile-mainflow-baseline.test.tsx`
- `tactics-canvas-24/src/test/mobile-topbar-touch.test.tsx`
- `docs/android-packaging/slices/slice-2-touch-first-main-flow-baseline.md`
- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-internal-interface-spec.md`

## Findings

1. `MobilePropertiesDrawer` 和 `TabletRightDrawer` 与 `RightPanel` 已经发生契约漂移。
   - 风险不是单纯类型不整洁，而是移动端属性抽屉可能遗漏某些选中对象和写回回调，导致“编辑器能选中对象，但抽屉里不能完整编辑”。

2. `MobileTopBar` 的返回工作台、保存项目、导出项目此前只绑在 `onClick`。
   - 这在桌面浏览器里常常看起来可用，但在 Android 真实触控下不够可靠，尤其是保存路径会出现“点击没反应或行为不稳定”的风险。

3. Android dev 壳在开发态存在 HMR / `198.18.0.1` 模块拉取抖动。
   - 该问题会干扰验证过程，表现为空白页或需要冷启动重连，但当前没有证据表明它来自本轮已提交业务代码。

## Fixes Applied

- 把 `RightPanelProps` 导出为右侧属性编辑的单一契约。
- 让 `MobilePropertiesDrawer` 和 `TabletRightDrawer` 基于 `Omit<RightPanelProps, 'embedded'>` 透传完整对象与回调，不再各自维护漂移 props。
- 扩大移动端工具条、步骤抽屉和关闭按钮的触控命中区。
- 在 `MobileTopBar` 中把返回、保存、导出统一改成 `click + pointer(touch) + touchend` 的去重触发链。
- 新增或补强以下自动化回归：
  - `responsive-properties-drawer.test.tsx`
  - `mobile-mainflow-baseline.test.tsx`
  - `mobile-topbar-touch.test.tsx`
- 将 Slice 2 当前结论和组件契约规则写回 Android 源文档，而不是只停留在 review。

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/mobile-topbar-touch.test.tsx src/test/mobile-mainflow-baseline.test.tsx src/test/responsive-properties-drawer.test.tsx`
  - 实际输出为 `3` 个测试文件、`4` 个测试全部通过；命令外层出现超时，但超时发生在 Vitest 已打印通过结果之后。
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev`
- `cmd /c npm run tauri:android:dev`

## Manual Scenarios Actually Run

- `Pixel_7` 模拟器 Android dev 壳内：
  - 打开工作台
  - 新建空白项目
  - 进入编辑器
  - 通过真实触控路径打开对象面板并添加球员
  - 打开属性抽屉并修改球员名称
  - 保存并返回工作台
  - 从工作台再次进入已保存项目，确认对象标签和保存状态仍在
  - 在已保存项目中再次通过顶部保存按钮触发保存，观察到“项目已保存到本地”反馈
- 桌面 Tauri smoke：
  - 启动 `tauri:dev`
  - 确认 Vite 与桌面壳同时运行
- Web 共享回归：
  - 通过全量 `build / test / lint` 验证共享链路未被移动端修复破坏

## Committed Scope vs Local-Only Experiments

### Committed Scope

- 移动端抽屉契约修复
- `MobileTopBar` 触控触发链修复
- Android / mobile 专用自动化回归
- Slice 2 文档回写

### Local-Only Experiments

- Android WebView 远程调试所用的临时 CDP 脚本
- `analysis/` 下的截图和 `tauri:dev` / `tauri:android:dev` 日志
- 用于定位设备触控坐标与 DOM 状态的临时观察手段

这些本地实验用于验证，不构成仓库内可提交实现。

## Automated Or Smoke Evidence vs Device-Side Hard Evidence

### Automated / Smoke Evidence

- 移动端专用回归覆盖了：
  - 属性抽屉契约
  - 顶栏触控链去重
  - 工作台 -> 编辑 -> 保存 -> 返回 -> 再打开的主链路
- 全量 `build / test / lint` 通过
- 桌面 `tauri:dev` smoke 通过
- Android `tauri:android:dev` smoke 通过

### Device-Side Hard Evidence

- 在 `Pixel_7` 模拟器 Android dev 壳内实际观察到：
  - 工作台进入编辑器
  - 触控添加球员
  - 属性抽屉修改球员名称
  - 首次保存并返回工作台
  - 再次进入项目后状态保留
  - 顶栏保存按钮在真实触控下命中并反馈成功

当前 Slice 2 的“已关闭”判断依赖上述设备侧链路，而不是只依赖浏览器响应式模式或旧 review。

## Remaining Risks

- Android dev 壳在 HMR 期间仍可能出现 `198.18.0.1` 模块拉取抖动，验证时可能需要冷启动应用后再复测。
- 当前设备侧硬证据来自 `Pixel_7` 模拟器，不是真机。
- 当前验证基于 Android dev 壳，不是最终签名 APK 安装包。
- Slice 3 的 PNG 导出 / 系统分享、Slice 4 的系统文件选择器、Slice 5 的生命周期与方向切换仍未进入本轮范围。

## Anything Still Unverified

- 真机触控表现
- 打包后 APK 的 Slice 2 行为一致性
- 导出、导入、生命周期相关的 Android 后续切片

## Conclusion

- 以当前分支已提交实现为准，Slice 2 已经重新建立并达到关闭条件。
- 关闭依据来自“代码修复 + 自动化回归 + Android 设备侧主链路证据”三者同时成立。
- Android dev HMR 抖动应继续记录为开发态验证风险，但当前不应再把它误判成 Slice 2 已提交业务逻辑缺陷。
