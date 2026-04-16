# Android 内部接口规范

## 1. 文档目标

这份文档定义 TacticBoard 在 Android 打包第一阶段所需的内部接口规范。

目标：

- 约束 Web 前端与 Android 平台能力之间的交互方式
- 避免组件直接依赖 Android 原生返回值、路径语义或分享语义
- 在真正接入 Android 壳层前先冻结模块边界和结果语义
- 降低实现阶段因为接口漂移带来的返工和 bug

这份文档服务于：

- `docs/05-engineering/android-packaging-plan.md`
- `docs/android-packaging/android-technical-architecture.md`

## 2. 适用范围

当前只覆盖 Android 打包第一阶段必须冻结的内部接口：

- Router 运行方式接口
- 平台识别接口
- 文件保存接口
- 导出保存 / 分享接口
- 图片选择 / 资产导入接口

当前不覆盖：

- Android 应用商店上架接口
- Android 签名与发布流程
- 云同步接口
- 项目文件导入导出协议
- Web / Windows / Android 之间的数据迁移协议
- Android 端 GIF 导出作为首版默认承诺

## 3. 设计原则

- 组件层不直接依赖 Android 原生 API
- 组件层不直接处理系统分享结果
- 组件层不直接消费原生路径、URI 或权限结果对象
- 浏览器版、Windows 桌面版与 Android 版共享同一套业务主链路
- Android 第一阶段优先复用现有业务逻辑，只替换平台边界
- 用户取消不应被当成错误
- Android 第一阶段继续优先兼容当前 `File` 契约，而不是同时重构所有组件输入模型

## 4. 模块划分

Android 打包第一阶段建议冻结四个内部模块。

### 4.1 platform

职责：

- 判断当前运行平台
- 暴露统一平台枚举
- 统一挂接 Router 运行入口

建议文件：

- `tactics-canvas-24/src/lib/platform.ts`

### 4.2 file-access

职责：

- 处理最终文件保存
- 屏蔽浏览器、Windows、Android 在文件保存上的差异
- 保持“文件保存”与“系统分享”语义分离

建议文件：

- `tactics-canvas-24/src/lib/file-access.ts`

### 4.3 export-save

职责：

- 接收现有 PNG / GIF 生成结果
- 决定交给平台保存还是交给平台分享
- 统一处理保存成功 / 分享成功 / 失败 / 取消语义

建议文件：

- `tactics-canvas-24/src/lib/export-save.ts`

### 4.4 asset-import

职责：

- 统一图片选择与导入结果语义
- 屏蔽浏览器 / Windows / Android 在素材选择上的差异
- 对外继续提供前端可消费的统一输入形态

建议文件：

- `tactics-canvas-24/src/lib/asset-import.ts`

## 5. 依赖方向

依赖方向必须保持单向：

```text
UI / Components
    ↓
Application Logic
    ↓
Platform Abstraction
    ↓
Browser capabilities / Windows capabilities / Android capabilities
```

约束：

- `src/components/**` 不直接处理 Android 原生返回值
- `src/pages/**` 不直接处理 Android 平台判断
- `src/hooks/useEditorState.ts` 第一阶段不应感知 Android 壳层细节
- Android 相关分支只允许收口在平台抽象层

## 6. 运行方式约束

### 6.1 Web 运行方式

- 继续使用浏览器环境
- 继续允许浏览器版文件下载
- 继续允许浏览器文件输入

### 6.2 Windows 运行方式

- 当前已通过桌面容器运行
- 文件保存和文件选择优先走当前桌面能力分支

### 6.3 Android 运行方式

- 通过 Android 容器运行同一套前端业务代码
- 文件选择必须优先走系统文件选择器
- 导出结果必须优先兼容系统分享链路
- 不允许把浏览器下载行为视为 Android 正式实现

## 7. Router 接口规范

### 7.1 当前代码现实

当前 `src/lib/platform.ts` 已经存在：

```ts
export type RuntimePlatform = 'web' | 'windows-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function createAppRouter(children: ReactNode): ReactNode;
```

### 7.2 Android 第一阶段目标接口

建议扩展为：

```ts
export type RuntimePlatform = 'web' | 'windows-tauri' | 'android-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function isWindowsTauri(): boolean;

export function isAndroidTauri(): boolean;

export function createAppRouter(children: React.ReactNode): React.ReactNode;
```

### 7.3 行为要求

- 组件不直接判断要用哪一种 Router 容器
- 路由容器选择集中在单一入口
- Android 端不允许在页面组件里散落路由特判
- Android 端沿用当前工作台 / 项目页 / 编辑器页 / 设置页的页面体系

### 7.4 当前冻结结论

- Android 第一阶段先冻结“平台识别 + Router 入口集中”这一层边界
- 具体 Android Router 运行细节只有在技术验证通过后才进入实现层

## 8. 平台识别接口规范

### 8.1 接口目标

统一 Web / Windows / Android 三端的平台识别语义。

### 8.2 建议接口

```ts
export type RuntimePlatform = 'web' | 'windows-tauri' | 'android-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function isWindowsTauri(): boolean;

export function isAndroidTauri(): boolean;
```

### 8.3 行为要求

- 平台判断应集中在一处
- 组件层只允许拿到布尔结果或平台枚举，不直接探测全局对象
- 不允许在多个组件中重复写 Android 判断逻辑

## 9. 文件保存接口规范

### 9.1 接口目标

统一最终文件落盘行为，并与系统分享语义分离。

### 9.2 当前代码现实

当前 `src/lib/file-access.ts` 已经存在：

```ts
export type SaveFileInput = {
  suggestedName: string;
  mimeType: string;
  bytes: Uint8Array;
  filters?: Array<{ name: string; extensions: string[] }>;
};

export type SaveFileResult =
  | { status: 'saved'; path?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

export async function saveFile(input: SaveFileInput): Promise<SaveFileResult>;
```

### 9.3 Android 第一阶段要求

- `saveFile` 继续表示“明确保存到文件”这一类动作
- Android 不应把系统分享语义塞进 `file-access.ts`
- Android 端是否实际走落盘，应由上层 `export-save.ts` 决定

### 9.4 行为要求

- Web：允许继续走浏览器下载
- Windows：继续走当前桌面保存分支
- Android：只有在明确需要本地文件落地时才进入 `saveFile`

### 9.5 取消 / 错误语义

- 用户取消保存：`status: 'cancelled'`
- 保存失败：`status: 'failed'`
- 失败原因必须可转成用户可见提示

## 10. 导出保存 / 分享接口规范

### 10.1 问题背景

当前导出逻辑已经拆成两段：

- 先生成 PNG / GIF
- 再决定最终如何交给平台处理

Android 第一阶段和 Windows 的关键区别是：

- Windows 优先原生保存
- Android 优先兼容系统分享

### 10.2 当前代码现实

当前 `src/lib/export-save.ts` 已经存在：

```ts
type ExportBinary = {
  fileName: string;
  format: 'png' | 'gif';
  bytes: Uint8Array;
};

export async function saveExportBinary(binary: ExportBinary): Promise<SaveFileResult>;
```

### 10.3 Android 第一阶段目标接口

建议扩展导出结果语义为：

```ts
export type ExportBinary = {
  fileName: string;
  format: 'png' | 'gif';
  bytes: Uint8Array;
};

export type SaveExportResult =
  | { status: 'saved'; path?: string }
  | { status: 'shared' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

export async function saveExportBinary(binary: ExportBinary): Promise<SaveExportResult>;
```

### 10.4 行为要求

- PNG / GIF 生成逻辑仍保留在现有导出模块
- `export-save` 只接“生成后的二进制结果”
- Android 第一阶段优先保证 PNG 导出 + 系统分享闭环
- Android 第一阶段不把 GIF 导出写成默认交付要求

### 10.5 禁止事项

- 不允许组件层直接触发系统分享
- 不允许 UI 组件自己判断导出结果是“保存”还是“分享”

## 11. 图片选择接口规范

### 11.1 当前代码现实

当前 `src/lib/asset-import.ts` 已经存在：

```ts
export type PickImageFileResult =
  | { status: 'selected'; file: File }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

export function canUseNativeImageImport(): boolean;

export async function pickImageFile(): Promise<PickImageFileResult>;
```

### 11.2 Android 第一阶段要求

- Android 图片选择必须优先走系统文件选择器
- 选择结果必须继续转换为前端可消费的 `File`
- 不允许把原生路径、URI 或权限引用直接传给 UI

### 11.3 取消语义

- 用户取消选择：`status: 'cancelled'`
- 不应弹错误提示

## 12. 资产导入接口规范

### 12.1 接口目标

把图片选择、读取、本地复制和最终 UI 可消费结果收口到统一模块中。

### 12.2 行为要求

- 导入前检查 MIME
- 导入前检查体积上限
- Android 端素材必须复制到应用本地存储
- 不长期依赖外部文件路径或临时授权引用
- 读取失败要明确返回失败状态

### 12.3 当前组件契约兼容要求

当前 `RightPanel.tsx`、`TabletRightDrawer.tsx`、`MobilePropertiesDrawer.tsx` 仍沿用：

```ts
(file: File) => void
```

因此 Android 第一阶段明确决策是：

1. `asset-import.ts` 继续对外提供浏览器兼容 `File`
2. 不在 Android 第一阶段同步重构组件契约
3. 不在同一轮里混用 `File`、路径字符串和 URI 三种输入模型

## 13. 组件接入规则

Android 第一阶段建议这样接：

- `App.tsx`
  - 只处理 Router 入口，不写具体 Android 原生调用
- `TacticsEditor.tsx`
  - 导出时调用 `saveExportBinary`
- `RightPanel.tsx`
  - 导入参考底图时调用 `pickImageFile` 或同模块统一封装入口
- `TabletRightDrawer.tsx` / `MobilePropertiesDrawer.tsx`
  - 保持与 `RightPanel.tsx` 一致的导入契约

不建议第一阶段就改：

- `useEditorState.ts`
- `types/tactics.ts`
- 核心项目模型

## 14. 存储与生命周期边界规范

### 14.1 当前边界

- 项目数据继续沿用当前前端本地存储模型作为基线
- Android 第一阶段不引入第二套项目模型

### 14.2 必须明确的边界

- Android 平台层不直接接管项目存储语义
- Android 生命周期事件不应直接泄漏到组件层
- Android 第一阶段不承诺与 Web / Windows 自动数据互通
- 本地素材复制和项目数据写入不能混成一个平台黑箱

## 15. 失败场景规范

Android 第一阶段必须统一以下失败场景：

- 用户取消导出分享
- 用户取消文件保存
- 用户取消图片选择
- 图片 MIME 不支持
- 图片体积过大
- 图片读取失败
- 本地复制失败
- 分享失败
- 文件写入失败

统一规则：

- 取消不算错误
- 失败必须有可区分的错误语义
- 失败不允许破坏当前编辑状态
- 失败后用户应能立即重试

## 16. 实施顺序与回滚点

推荐顺序：

1. 扩展 `platform.ts` 的 Android 平台识别边界
2. 冻结 `export-save.ts` 的保存 / 分享结果语义
3. 冻结 `asset-import.ts` 的选择 / 导入 / 本地复制语义
4. 补 Android 平台分支实现
5. 真机或模拟器验证 Android 关键路径

回滚要求：

- 每一步都应单独提交
- 每一步都应可单独回退
- 不把多个 Android 平台适配步骤揉成一个大提交

## 17. 接口完成标准

可以认为 Android 内部接口层完成，至少要满足：

- 平台识别不再只覆盖 Web / Windows
- Router 入口继续集中在单一位置
- 组件层不直接处理 Android 原生返回值
- 导出结果可统一走保存 / 分享接口
- 参考底图导入统一走平台选择接口
- 当前 `File` 组件契约仍保持兼容
- 所有取消 / 失败分支语义清楚

## 18. 当前结论

Android 打包第一阶段要减少 bug，关键不是先写多少移动壳代码，而是先把这几个边界锁死：

- 路由边界
- 平台判断边界
- 文件保存边界
- 导出分享边界
- 图片导入边界
- 生命周期与存储边界

这份文档就是用来冻结这些边界的。
