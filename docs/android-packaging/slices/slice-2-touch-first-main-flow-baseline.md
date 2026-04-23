# Slice 2: Touch-First Main-Flow Baseline

## 1. 切片目标

Slice 2 负责把 Android 上最核心的编辑主链路收口到“真实触控可用”，而不是只在桌面鼠标语义或浏览器响应式模式下看起来可用。

本片关注的闭环只有这一条：
- 工作台进入
- 新建或打开项目
- 进入编辑器
- 至少一个核心对象的选择与修改
- 保存并返回
- 重新进入并确认状态仍然正确

## 2. 当前已提交现实（2026-04-20）

- 共享业务主链路仍然由 `tactics-canvas-24/src/App.tsx`、`TacticsEditor.tsx`、`useEditorState.ts` 负责。
- 项目与草稿存储仍然以 `mockProjects.ts` / `localStorage` 为当前基线，不在本片重构存储模型。
- 本轮已经补齐并提交了 Android / mobile 侧专用回归：
  - `src/test/mobile-mainflow-baseline.test.tsx`
  - `src/test/mobile-topbar-touch.test.tsx`
  - `src/test/responsive-properties-drawer.test.tsx`
- 本轮已经把 `MobilePropertiesDrawer.tsx` 与 `TabletRightDrawer.tsx` 收口到 `RightPanelProps` 这一份源契约，不再各自维护漂移过的局部 props。
- 本轮已经把 `MobileTopBar.tsx` 的返回 / 保存 / 导出三个高风险入口补成 `click + pointer(touch) + touchend` 的去重触控链路。
- 设备侧证据已在 `Pixel_7` 模拟器上拿到，方式是 Android 壳内真实 WebView 运行 + 设备侧触摸分发 + DOM 状态回读，不再只靠浏览器端推断。

## 3. 与 APK 打包链路的关系

如果 Slice 2 不成立，即使 APK 能安装、能启动，也只是“壳里装了一个主要靠鼠标或偶然 click 合成才能操作的编辑器”。

因此本片定义的是 Android 第一阶段最小可演示闭环，不是最终完整功能集。

## 4. 前后端 / 接口检查清单

### 4.1 调用面

本片重点检查这些调用面：
- 工作台与项目入口页
- `tactics-canvas-24/src/components/tactics/TacticsEditor.tsx`
- 顶栏、属性抽屉、步骤抽屉、底部工具条相关移动端组件

要求：
- 主链路交互不能依赖 hover。
- 关键入口不能只依赖浏览器对 `click` 的隐式合成。
- “进入编辑器 -> 编辑 -> 保存 -> 返回 -> 再进入” 必须继续走同一套共享业务链路，不能临时分叉出 Android 专用编辑器状态。

### 4.2 TypeScript 平台边界

本片通常不新增原生能力，但必须检查：
- Slice 1 的 `platform.ts` 已经足够承接当前运行时识别。
- 编辑主链路没有在组件层直接调用 `@tauri-apps/*`。
- 当前修复仍然停留在共享 UI / 状态 / 平台桥边界，不把 Android 特判散落到组件树里。

### 4.3 组件契约边界

本片已经明确冻结两条接口规则：

1. `RightPanelProps` 是 `RightPanel`、`MobilePropertiesDrawer`、`TabletRightDrawer` 的唯一源契约。
   - 包装抽屉组件必须基于 `Omit<RightPanelProps, 'embedded'>` 扩展。
   - 不允许再各自维护缺字段的局部 props 版本。
   - `selectedPlayer / selectedLine / selectedText / selectedArea` 与对应回调必须完整透传。

2. `MobileTopBar` 的返回 / 保存 / 导出属于触控关键入口。
   - 不能只绑定 `onClick`。
   - 必须显式处理 touch / pointer(touch)。
   - 必须防止 touch 后追加 click 导致重复触发。

## 5. 本片不解决的问题

- 不解决 PNG 导出与系统分享
- 不解决系统文件选择器与素材导入
- 不解决方向切换与生命周期恢复
- 不整体迁移 Android 存储模型

## 6. 开发闭环

建议按以下顺序执行：

1. 先确认 Slice 1 的运行时与 Router 边界已经稳定。
2. 先用现有 Web / shared 测试确认主链路本身没有坏。
3. 针对 Android / mobile 主链路补最小专用回归：
   - 进入工作台
   - 新建或打开项目
   - 选择对象
   - 修改对象属性
   - 保存并返回
   - 重新打开确认状态
4. 修 Android 侧暴露出来的触控命中区、click/touch 事件链和抽屉契约问题。
5. 在模拟器或设备上做真实触控验证，而不是只看浏览器设备模式。
6. 写回 `DocsReview` 和上游源文档。

补充规则：
- 如果 Android dev 在 HMR 过程中把 WebView 刷到空白态，不要直接把它判成业务回归。
- 先重启应用并重新拿一次设备侧证据，再决定是否存在真实 Slice 2 阻塞。

## 7. 验收规则

### 7.1 进入条件

- Slice 1 已关闭
- Android 运行时识别与 Router 边界已稳定

### 7.2 关闭条件

以下全部满足，Slice 2 才能关闭：

- P0 手机竖屏下，用户可以从工作台真实进入编辑器。
- 真实触控下可以完成至少一个对象的选择与修改。
- 保存后返回工作台，再次进入时状态正确。
- 自动化测试已经覆盖移动主链路回归。
- Web / Windows 主链路没有因为移动端修复被破坏。

### 7.3 不算完成的情况

- 只在浏览器响应式模式里点通。
- 只修了布局，没有验证真实触控命中。
- 只验证“能进入编辑器”，但没有完成保存 -> 返回 -> 再进入。
- 为了适配触控，在组件层直接引入原生能力调用。
- 抽屉包装组件与 `RightPanel` 契约继续漂移。

## 8. 当前结论（2026-04-20）

当前已提交范围内，Slice 2 可以按“当前分支实现”视为已重新建立并达到关闭条件，依据是：

- 自动化已经覆盖 mobile 主链路、顶栏触控、抽屉契约。
- `build / test / lint` 全通过。
- `tauri:dev` 桌面 smoke 已重新通过。
- `tauri:android:dev` 在 `Pixel_7` 模拟器上完成了设备侧链路观察：
  - 工作台进入
  - 新建项目进入编辑器
  - 触控添加球员
  - 打开属性抽屉并修改对象字段
  - 返回工作台看到首次保存成功
  - 再次进入已保存项目看到对象标签与保存状态
  - 在已保存项目里触控保存按钮，拿到“项目已保存到本地”反馈

本片仍保留一个非阻塞风险：
- Android dev 的 HMR / `198.18.0.1` 取模块链路在开发态偶尔会抖动，出现需要冷启动应用后再复测的情况。
- 这影响开发验证体验，但当前没有证据表明它是 Slice 2 的已提交业务逻辑缺陷。

## 9. 进入下一片前必须已经成立的事

- Android 主链路已经能真实触控走通。
- 导出入口可达、导出弹窗可达。
- Slice 3 处理导出时，不再被 Slice 2 的顶栏触控或主链路基础问题阻塞。

## 10. 建议留痕

- `implementation-review-41-android-slice2-touch-mainflow-restart-2026-04-20.md`
- `implementation-review-50-android-mobile-editor-ux-followup-2026-04-22.md`
- `implementation-review-51-android-mobile-editor-ux-realdevice-validation-2026-04-22.md`
- `implementation-review-52-android-mobile-editor-ux-correction-2026-04-22.md`
- `implementation-review-53-android-mobile-player-touch-drag-fix-2026-04-22.md`

## 12. 2026-04-22 交互补充收口

- `PitchCanvas` 现在要求把“fit 到屏幕”的尺寸直接落实到 SVG 实际渲染宽高上，而不是只在缩放文案上伪装成 `100%`。进入项目时的 `100%` 必须对应真实的基准尺寸；在手机竖屏下，球场应贴齐可用宽度。
- On mobile and tablet, selecting a player no longer auto-opens the player-properties drawer. This flow is explicitly back to manual drawer entry via the properties affordance.
- The primary player delete action now sits below the full `基础信息` block and above `显示信息`, instead of splitting the basic-info rows.
- Android real-device recheck on `vivo X100s` confirms the corrected initial fit behavior and confirms that tapping a player does not auto-open properties. The delete action text is fixed to `删除球员`; the legacy bottom action remains hidden.
- Mobile object manipulation now explicitly requires single-finger drag support for players on Android. Selecting a player without movement is not enough; a real touch drag must move the player itself instead of falling through to canvas pan.

重点记录：
- 哪些主链路回归已经自动化覆盖
- 哪些设备侧触控场景已经命中
- 这轮修复解决了哪些接口漂移或触控隐患
- 还有哪些风险只是开发态噪音，而不是产品态阻塞
## 11. 2026-04-22 补充收口

- Mobile / tablet editor shell 现在明确要求使用 dynamic viewport + safe-area；不再允许直接依赖 `h-screen` 或 `min-h-screen`，否则真机状态栏、手势区会被应用内容覆盖。
- `PitchCanvas` 现在明确要求在移动端做容器级 fit、zoom/pan 边界夹紧和原生触控冲突屏蔽；进入编辑器后球场不能再因为容器高度漂移或过量平移而出现整屏黑场/空白。
- 这轮验收的设备侧最小证据包括：
  - 真机首页截图，确认顶部安全区已恢复。
  - 真机编辑页首次进入截图，确认球场初始可见且不再被错误压到更低位置。
  - 真机放大与拖动画布后截图，确认球场仍留在视口中，没有出现整屏黑场。

## 13. 2026-04-22 Landscape Safe-Area Follow-Up

- `TopToolbar` 现在是 phone 横屏进入 tablet breakpoint 时的唯一合法顶部壳层，必须通过专用 `top-toolbar-shell` 承接 safe-area 与 landscape phone 顶部补偿。
- 只验证 `MobileTopBar` 不足以视为 Slice 2 editor chrome 验收完成；在真机横屏下，系统会走 `TopToolbar` 这条 tablet 路径。
- 2026-04-22 安装态 release APK 在 `vivo X100s` 上已再次验证：`analysis/android-fulltest/57-landscape-after-fix.png` 表明顶部编辑栏不再压进系统状态区，`58-portrait-restored-after-fix.png` 表明切回竖屏后没有把现有 editor chrome 布局带坏。
- 这轮修复只解决了 editor chrome 的 landscape safe-area 问题，不等于 Slice 6 已关闭；后续仍需继续补齐 release APK 下球员拖动、阵型切换和参考底图导入的真机正向证据。
