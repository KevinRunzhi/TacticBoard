# implementation-review-31-android-export-touch-chain-fix-2026-04-19

## Scope

本轮范围仅覆盖 Android Slice 3 剩余问题中的“点击导出没有反应”这一层，目标是确认并修复共享前端触控链路中的明显阻塞点。

本轮不覆盖：

- Android 真实设备或模拟器上的原生分享面板人工确认
- `src-tauri/gen/` 生成层修复的稳定化来源迁移
- 生命周期 / 横竖屏 / 后台恢复验证

## Related Sources

- `docs/android-packaging/android-phase1-slice-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/DocsReview/implementation-review-30-android-topbar-interaction-fix-2026-04-18.md`
- `docs/DocsReview/implementation-review-android-phase1-slice3-export-share-2026-04-18.md`

## Problem Statement

用户反馈当前现象已经收敛为：

- 点击顶部“导出项目”没有反应
- 没有看到导出设置弹窗
- 也没有任何后续分享动作证据

这说明问题仍可能停留在前端触控事件没有稳定命中导出入口，而不一定已经进入 Android share 插件。

## Investigation Summary

代码层确认：

- `MobileTopBar.tsx` 之前已经补过 `onTouchEnd`，但当前实现仍缺少 `pointer` 兜底、动作去重和更大的点击目标。
- `ExportConfigDialog.tsx` 的确认 / 取消按钮也只做了基础 touch 兜底，没有和顶栏统一去重策略。
- 现有测试能证明 touch 回调能触发，但不能证明“触摸导出按钮后，导出设置弹窗真的出现”。

因此，本轮优先修复的是：

1. 顶栏按钮命中面积不足
2. `click / pointer / touch` 事件在移动端混合触发时的重复或丢失风险
3. 缺少贴近用户现象的集成回归用例

## Fixes Applied

### 1. MobileTopBar touch chain hardening

更新：

- `tactics-canvas-24/src/components/tactics/MobileTopBar.tsx`

改动：

- 为返回 / 保存 / 导出按钮统一加入 `onClick + onPointerUp + onTouchEnd`
- 引入按动作键去重的触发器，避免同一次触摸被多事件重复消费
- 将按钮命中区从小图标尺寸提升到 `40px`
- 提升顶部栏层级并增加 `pointer-events-auto`
- 扩大球场制式 / 视图切换触发器的可点击区域

目的：

- 让移动端 WebView 下的导出入口更容易被可靠命中

### 2. ExportConfigDialog action hardening

更新：

- `tactics-canvas-24/src/components/tactics/ExportConfigDialog.tsx`

改动：

- 为“取消 / 导出 PNG / 导出 GIF”统一加入 `onClick + onPointerUp + onTouchEnd`
- 同样引入按动作键去重的触发器
- 提升弹窗层级
- 移动端下将底部按钮扩展为 `w-full`

目的：

- 避免导出弹窗出现后，确认按钮仍因触摸派发问题而表现为“无反应”

### 3. Regression coverage

更新：

- `tactics-canvas-24/src/test/mobile-topbar-touch.test.tsx`
- `tactics-canvas-24/src/test/export-config-dialog-touch.test.tsx`
- `tactics-canvas-24/src/test/mobile-mainflow-baseline.test.tsx`

改动：

- 将触控相关测试统一整理为 UTF-8 中文标签
- 新增集成断言：触摸顶部“导出项目”后，必须出现“导出设置”与“导出 PNG”按钮

目的：

- 把“点导出没反应”这个用户现象沉淀成可回归的自动化测试

## Validation

### Focused Validation

- `npm run test -- src/test/mobile-mainflow-baseline.test.tsx src/test/mobile-topbar-touch.test.tsx src/test/export-config-dialog-touch.test.tsx`

结果：

- 3 个测试文件 / 5 个测试全部通过

### Shared Validation

- `npm run build`
- `npm run test`
- `npm run lint`

结果：

- `npm run build`：通过
- `npm run test`：通过，35 个测试文件 / 87 个测试全部通过
- `npm run lint`：通过，0 error，保留 8 个既有 warnings

说明：

- 本轮没有新增 lint error
- lint warnings 仍主要来自既有 `react-refresh/only-export-components` 和 `PitchCanvas.tsx` 的 hook 依赖警告

## Findings

1. 当前“点导出无反应”的一个明确前端阻塞点已经被修正：移动端顶栏与导出弹窗的触控命中链路更完整，且有回归测试覆盖。
2. Web / jsdom 环境下，现在可以稳定证明“触摸导出项目 -> 打开导出设置弹窗”。
3. 这轮验证仍然不能证明 Android 模拟器或真机一定会弹出原生分享面板，因为本轮没有设备侧人工复测，也没有新的运行时日志证据。
4. 因此，Slice 3 仍不能按“已完成”关闭；当前只是在前端触控层又排除了一个高概率阻塞点。

## Remaining Risks

1. 设备侧是否已经真正进入 `handleExportConfirm`，本轮没有新的 ADB / runtime 证据。
2. 即使导出设置弹窗能稳定打开，Android 原生 share sheet 仍可能被后续桥接或系统权限问题阻塞。
3. 先前依赖 `src-tauri/gen/` 的壳层 hit-area 修复仍未迁移到稳定来源，后续 regeneration 可能再次引入漂移。

## Next Step

下一步应该优先做一次设备侧复测，至少拿到以下证据之一：

- 点击“导出项目”后出现“导出设置”弹窗的录屏或截图
- 点击“导出 PNG”后出现系统分享面板
- 对应的 `handleExportConfirm` / `[android-share]` 运行时日志
- app cache 中生成的 `export-share/*.png`

在拿到这些证据之前，本轮结论只能记为：

- 前端触控链路修复完成
- 自动化回归通过
- Slice 3 设备侧退出条件仍未满足
