# Slice 4：System Picker and Local-Copy Asset Import Boundary

## 1. 切片目标

Slice 4 负责把 Android 素材导入从“浏览器文件输入思维”推进到“系统文件选择器 + 本地复制 + 前端继续消费统一对象”的正式链路。

本片重点是两件事：

- Android 使用系统文件选择器选择图片
- 平台桥把原生选择结果归一化，不把 URI / 权限对象泄漏给组件层

## 2. 当前代码现实（2026-04-19）

- `tactics-canvas-24/src/lib/asset-import.ts` 当前 `canUseNativeImageImport()` 只对 `windows-tauri` 返回 `true`
- `pickImageFile()` 当前在非 Windows 运行时会直接失败，并提示“仅 Windows 桌面运行时支持原生图片导入”
- `RightPanel` 以及移动端右侧抽屉链路仍然围绕 `File` 契约工作
- 当前代码树没有已提交 Android 系统文件选择器与本地复制实现

## 3. 与 APK 打包链路的关系

只要素材导入还停留在浏览器思维，Android APK 就无法完成完整编辑闭环。

本片的闭环是：

```text
reference import button
    -> Android system picker
    -> bridge normalization / local copy
    -> File-compatible result
    -> existing editor reference-image flow
```

## 4. 前后端接口检查清单

### 4.1 调用方

- `tactics-canvas-24/src/components/tactics/RightPanel.tsx`
- 与参考图导入相关的移动端 / 平板端抽屉组件

要求：

- 组件层继续消费统一的导入结果，不直接处理 `content://` URI、权限或 Android intent 结果
- 组件层不分叉一套 Android 专用参考图编辑逻辑

### 4.2 TypeScript 平台桥

- `tactics-canvas-24/src/lib/asset-import.ts`

要求：

- Android 结果必须在这里归一化
- 平台桥必须把取消、失败、成功区分清楚
- 第一阶段默认继续兼容当前 `File` 契约，避免为了 Android 导入重写整个组件输入模型

### 4.3 Tauri / 原生壳层

根据最终选型，可能涉及：

- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`
- `src-tauri/capabilities/default.json`

要求：

- 系统文件选择器的原生能力只在壳层接入
- 如果需要本地复制，复制发生在平台桥 / 原生侧边界，不应把原生路径语义暴露给组件
- 不能只依赖临时授权 URI 而不做稳定化处理

### 4.4 自动化与回归

至少需要检查：

- `src/test/asset-import.test.ts`
- `src/test/right-panel-reference-import.test.tsx`
- 参考图相关模型或状态测试

## 5. 本切片不解决的问题

- 不解决生命周期恢复的最终稳定性
- 不解决跨设备资产迁移
- 不解决 Android 项目文件导入导出协议

## 6. 开发闭环

建议按以下顺序执行：

1. 先冻结 Android 选择结果的归一化口径，明确组件层继续拿统一结果对象
2. 再决定本地复制发生在哪一层，并把这层责任写回接口文档
3. 接入系统文件选择器
4. 接入本地复制或等价稳定化步骤
5. 用现有参考图链路回归导入、显示、拖动、缩放
6. 在 Android 设备或模拟器上验证取消、失败、成功三条路径
7. 写 `DocsReview`

## 7. 验收规则

### 7.1 进入条件

- Slice 3 已关闭
- Android 导出链路已经冻结，不再与导入实现互相干扰

### 7.2 关闭条件

以下全部满足，Slice 4 才能关闭：

- Android 点击导入时真实打开系统文件选择器
- 选择 PNG / JPG 后，参考图能进入现有编辑链路并正常显示
- 平台桥已经屏蔽原生 URI / 权限对象，不把它们泄漏给组件层
- 自动化测试覆盖导入成功、取消、失败的结果语义
- `DocsReview` 至少记录一轮设备侧证据，证明不是浏览器 `<input type="file">` 路径

### 7.3 不算完成的情况

- 只在 Web 文件输入里导入成功
- 只打开了系统文件选择器，但图片没有真正进入编辑链路
- 组件直接处理 Android 原生 URI
- 只做当前会话展示，没有明确取消 / 失败语义
- 只改 `src-tauri/gen/**`

### 7.4 建议留痕

- `implementation-review-android-phase1-slice4-asset-import-YYYY-MM-DD.md`
- 重点记录：
  - Android 导入结果对象形态
  - 本地复制或稳定化方式
  - 图片进入编辑器后的状态
  - 仍有哪些资产持久化风险留给 Slice 5

## 8. 进入下一片前必须已经成立的事

- Android 素材导入闭环已经成立
- 参考图不再依赖浏览器式文件输入
- Slice 5 可以专注保存 / 恢复 / 生命周期，而不是继续补导入基础能力
