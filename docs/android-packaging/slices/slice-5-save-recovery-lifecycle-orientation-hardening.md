# Slice 5：Save / Recovery / Lifecycle / Orientation Hardening

## 1. 切片目标

Slice 5 负责把 Android 从“当前会话能用”推进到“保存、恢复、生命周期和方向切换基本稳定”。

这是 Android 第一阶段里最容易被低估的一片，因为很多问题只有在：

- 退到后台
- 回到前台
- 方向切换
- 重新进入编辑器
- 重新读取草稿或项目

时才会暴露。

## 2. 当前代码现实（2026-04-21）

- `tactics-canvas-24/src/hooks/useEditorState.ts` 负责当前编辑状态、草稿写回与正式项目保存逻辑
- `tactics-canvas-24/src/data/mockProjects.ts` 当前继续通过 `localStorage` 存储项目、草稿和设置
- 当前分支已通过 `tactics-canvas-24/src/lib/editor-entry.ts` 为 `mode=new` 引入显式 `session` 标记，用于区分“真正新建会话”和“生命周期 / 方向切换后的恢复进入”
- 当前分支已在 `useEditorState.ts` 中补上：
  - `visibilitychange(hidden)`、`pagehide`、`beforeunload` 的草稿落盘
  - 已保存正式项目的持久化指纹基线
  - 等价正式项目草稿的去重与清理
  - 新建会话在显式保存后不再回写瞬时草稿
- 当前分支已新增或补强测试：
  - `src/test/editor-entry.test.ts`
  - `src/test/editor-lifecycle-recovery.test.tsx`
  - `src/test/editor-save-return.test.tsx`
  - `src/test/editor-autosave-drag.test.tsx`
  - `src/test/project-roundtrip-state.test.tsx`
  - `src/test/mock-projects-store.test.ts`
- 当前分支已在 `Pixel_7` 模拟器 Android dev 壳里重新拿到两类手动记录：
  - 未保存新建会话 -> 应用后台 / 前台 -> 横屏 / 竖屏恢复
  - 已保存正式项目 -> 返回工作台 -> 继续编辑 -> 应用后台 / 前台 -> 横屏 / 竖屏恢复
- 当前分支已在 `Pixel_Tablet_API_34` 平板模拟器 Android dev 壳里补齐：
  - 已保存正式项目 -> 返回工作台 -> 继续编辑 -> 应用后台 / 前台 -> 横竖屏恢复
  - 未保存新建会话 -> 应用后台 / 前台 -> 横竖屏恢复
- 当前轮结论可写成“手机 + 平板模拟器验证通过”，但仍不能写成“真机完成”；真机覆盖保留到 Slice 6

## 3. 与 APK 打包链路的关系

Slice 5 决定 APK 是否只是“展示版”，还是可以在真实移动设备里承受中断和恢复。

本片的闭环是：

```text
edit state
    -> save / autosave
    -> background / foreground / rotate / reopen
    -> reload state
    -> no silent data loss
```

## 4. 前后端接口检查清单

### 4.1 调用方

- 编辑器保存、返回、重新进入路径
- 草稿恢复与项目重载入口

要求：

- UI 层只展示保存 / 恢复结果，不直接推断 Android 生命周期事件
- 保存失败、恢复失败不能静默吞掉

### 4.2 TypeScript 状态与平台桥

- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/data/mockProjects.ts`
- `tactics-canvas-24/src/lib/editor-persistence.ts`
- 相关保存 / 返回桥接逻辑

要求：

- 不为 Android 复制一套新的状态树
- 如果 Android 生命周期问题暴露出当前存储模型不足，必须明确写回文档，而不是临时散补
- Slice 4 导入的参考图状态在保存 / 恢复路径上要被重新验证
- 编辑器脏状态判断与正式项目“已保存基线”必须共用同一套持久化指纹字段
- 正式项目的“已保存基线”只能在真实持久化成功后前移，不能随着未保存修改被动重写
- 显式保存失败时必须保持 `unsaved` / dirty 状态并给出可见错误，不能静默回到“本地已保存”

### 4.3 Tauri / 原生壳层

本片不一定新增原生能力，但要关注：

- Activity / WebView 在后台恢复时的表现
- 方向切换是否触发重新创建
- Android 容器是否导致路由、草稿或编辑器状态丢失

## 5. 本切片不解决的问题

- 不新增 Android 第二阶段功能
- 不把本地存储模型直接升级成跨设备同步
- 不把 Phase 1 范围扩大成正式项目文件协议重构

## 6. 开发闭环

建议按以下顺序执行：

1. 先确认当前保存、草稿、恢复的业务语义在 Web 基线里仍然成立
2. 再在 Android 上验证后台 / 前台、锁屏 / 解锁、方向切换、重新进入
3. 把发现的问题分清楚是：
   - UI 命中区问题
   - 状态写回问题
   - 存储模型问题
   - Android 生命周期容器问题
4. 优先在现有状态链路上做最小必要修复
5. 回归保存返回、草稿恢复、参考图状态、项目重开
6. 写 `DocsReview`

## 7. 验收规则

### 7.1 进入条件

- Slice 4 已关闭
- Android 主链路、导出、导入都已经有基本闭环

### 7.2 关闭条件

以下全部满足，Slice 5 才能关闭：

- Android 上手动保存与返回可以稳定工作
- 草稿恢复与项目重新进入在 Android 上可复核
- 后台 / 前台切换不会导致明显静默数据丢失
- 方向切换不会把用户带到无法恢复的错误状态
- Slice 4 的参考图导入在保存 / 恢复路径上没有立即失效
- 已保存正式项目在修改任一持久化字段后，都会重新回到“有未保存修改”
- 注入式保存失败场景不会把 UI 误写成“本地已保存”，并保留立即重试能力
- 自动化测试和设备验证共同支持上述结论
- 如果当前轮只有模拟器手机 / 平板记录，则只能写成“模拟器验证通过”，不能写成“真机完成”

### 7.3 不算完成的情况

- 只验证一次保存成功，没有验证恢复
- 只在 Web 刷新页面里模拟恢复
- 只在一个轻量 smoke 场景里切后台 / 前台
- 方向切换后 UI 看起来还在，但实际编辑状态已丢失
- 已保存项目改动后仍停留在“本地已保存”
- 保存失败后 UI 被误写成已保存，或清掉了继续重试所需状态
- 发现存储模型问题却只写进 `DocsReview`，没有更新源文档

### 7.4 建议留痕

- `implementation-review-android-phase1-slice5-lifecycle-recovery-YYYY-MM-DD.md`
- 重点记录：
  - 后台 / 前台结果
  - 方向切换结果
  - 保存 / 草稿 / 项目恢复结果
  - 是否已经暴露需要 Phase 2 才处理的存储限制

## 8. 进入下一片前必须已经成立的事

- Android 已不是“当前会话 demo”
- 保存、恢复、生命周期、方向切换已达到可验证稳定线
- 当前分支已具备手机模拟器竖屏 / 横屏与平板模拟器的一轮明确记录，可以进入 Slice 6 做设备矩阵与真机收口
- 如果当前仍只有手机模拟器和平板模拟器记录，没有真机覆盖，则当前片仍不得被写成 Phase 1 生命周期真机验证完成
- Slice 6 可以专注做设备矩阵验证和最终 Phase 1 收口
