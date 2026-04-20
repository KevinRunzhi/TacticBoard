# Implementation Review 42: Mobile Formation Entry Recovery

## Scope

- 修复当前主仓库移动端编辑页缺失“阵型选择”入口的问题
- 对照 `https://github.com/KevinRunzhi/tactics-canvas-24` 的前端样式实现，确认应补回的移动端交互链路
- 在不回退当前主仓库编辑器状态与 Android 适配工作的前提下，把阵型入口重新接回现有代码

## Change Size Classification

- `medium`

判定依据：

- 改动涉及多个用户可见组件和测试
- 变更集中在移动端编辑器 UI 链路，不涉及平台桥、存储或导出语义
- 需要重新验证共享 Web 主链路和桌面 Tauri smoke

## Touched Surfaces

- `tactics-canvas-24/src/components/tactics/MobileToolbar.tsx`
- `tactics-canvas-24/src/components/tactics/MobileFormationsDrawer.tsx`
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- `tactics-canvas-24/src/test/mobile-formations-drawer.test.tsx`
- `tactics-canvas-24/src/test/mobile-mainflow-baseline.test.tsx`

## Findings

1. 当前主仓库移动端编辑页不是“阵型样式没对上”，而是整条移动端阵型入口链路缺失。
   - `LeftPanel.tsx` 仍然保留了桌面 / 平板的阵型面板。
   - 但 `MobileToolbar.tsx` 没有 `阵型` 按钮。
   - `TacticsEditor.tsx` 的 mobile 分支也没有任何 `formationsDrawerOpen` 状态或移动端阵型抽屉。

2. 对照仓库 `KevinRunzhi/tactics-canvas-24` `main` 分支 `c38100e` 可确认，样式版已经补了三件事：
   - `MobileToolbar` 增加 `阵型` 入口和 `onOpenFormations`
   - `TacticsEditor` mobile 分支增加 `formationsDrawerOpen`
   - 新增 `MobileFormationsDrawer.tsx`

3. 当前主仓库比样式版更复杂，不能直接覆盖式拷贝。
   - 主仓库已经有更完整的保存 / 导出 / Android 触控适配链路。
   - 因此应迁移“结构做法”，而不是回退到样式版较早的编辑器实现。

## Fixes Applied

- 在 `MobileToolbar.tsx` 中补回 `阵型` 按钮和 `onOpenFormations` 回调。
- 新增 `MobileFormationsDrawer.tsx`，使用当前主仓库已有的 `getFormationsByFormat()` 和 `applyFormation()`。
- 在 `TacticsEditor.tsx` 的 mobile 分支中补回：
  - `formationsDrawerOpen` 状态
  - `MobileToolbar -> onOpenFormations`
  - `MobileFormationsDrawer -> onApplyFormation`
- 为了给 8 个移动端入口腾出空间，微调了底部工具条布局，使其在当前样式下仍保持可读且可点。
- 在 `mobile-mainflow-baseline.test.tsx` 中增加“阵型入口可见并能打开抽屉”的集成回归。
- 新增 `mobile-formations-drawer.test.tsx`，覆盖搜索过滤和应用阵型。
- 将 `mobile-mainflow-baseline` 的单测超时上限从默认 5 秒提高到 10 秒，避免这条重型基线测试因新增一步 UI 校验而偶发超时。

## Automated Commands Actually Run

- `cmd /c npx vitest run src/test/mobile-formations-drawer.test.tsx src/test/mobile-mainflow-baseline.test.tsx`
- `cmd /c npm run build`
- `cmd /c npm run test`
- `cmd /c npm run lint`
- `git diff --check`
- `cmd /c npm run tauri:dev`

## Manual Scenarios Actually Run

- 对照检查了 `KevinRunzhi/tactics-canvas-24` `main` 分支的相关文件：
  - `src/components/tactics/MobileToolbar.tsx`
  - `src/components/tactics/MobileFormationsDrawer.tsx`
  - `src/components/tactics/TacticsEditor.tsx`
- 本地桌面 `tauri:dev` smoke：
  - Vite 正常监听 `8080`
  - `tacticboard.exe` 正常拉起

## Remaining Risks

- 这轮没有重新跑 Android 模拟器或真机手工验证，所以“手机端阵型入口已恢复”当前主要依赖自动化和代码对照，不是新的设备侧硬证据。
- 底部工具条现在有 8 个入口，虽然当前样式在本地验证和测试里成立，但超窄宽度设备上仍应继续留意拥挤风险。

## Anything Still Unverified

- Android 模拟器下真实触控打开阵型抽屉并应用阵型
- 真机窄屏宽度下底部工具条的视觉拥挤程度

## Conclusion

- 当前主仓库与样式仓库的差异已经定位清楚，并按主仓库现有结构补回了移动端阵型入口。
- 修复后的实现不是回退到旧编辑器，而是在当前 Android / mobile 主链路上补齐了缺失的“阵型入口 -> 阵型抽屉 -> applyFormation”闭环。
