# Windows 内部接口规范

## 1. 文档目标

这份文档定义 TacticBoard 在 Windows 打包第一阶段所需的内部接口规范。

目标：

- 约束 Web 前端与 Windows 桌面能力之间的交互方式
- 避免组件直接依赖浏览器下载行为或 Tauri 原生返回值
- 在真正接入 Tauri 前先冻结模块边界和函数契约
- 降低实现阶段因为接口漂移带来的返工和 bug

这份文档服务于：

- `docs/05-engineering/windows-packaging-plan.md`

## 2. 适用范围

当前只覆盖 Windows 打包第一阶段必须抽象的内部接口：

- Router 运行方式接口
- 平台识别接口
- 文件保存接口
- 图片选择 / 资产导入接口
- 导出保存接口

当前不覆盖：

- Android 平台接口
- 云同步接口
- 后端接口
- 项目文件导入导出协议
- 桌面端长期数据迁移协议

## 3. 设计原则

- 组件层不直接依赖 Tauri API
- 组件层不直接依赖浏览器 `<a download>`
- 组件层不直接消费原生文件路径字符串
- 浏览器版和 Windows 桌面版共享同一套业务主链路
- Windows 第一阶段优先复用现有业务逻辑，只替换平台边界
- 任何“用户取消”不应被当成错误处理

## 4. 模块划分

Windows 打包第一阶段建议新增四个内部模块。

### 4.1 platform

职责：

- 判断当前运行平台
- 暴露统一平台桥对象

建议文件：

- `tactics-canvas-24/src/lib/platform.ts`

### 4.2 file-access

职责：

- 处理原生文件保存
- 处理原生文件选择
- 屏蔽浏览器与 Tauri 的差异

建议文件：

- `tactics-canvas-24/src/lib/file-access.ts`

### 4.3 export-save

职责：

- 接收现有 PNG / GIF 生成结果
- 调用统一保存接口
- 统一处理保存成功 / 失败 / 取消

建议文件：

- `tactics-canvas-24/src/lib/export-save.ts`

### 4.4 asset-import

职责：

- 将浏览器 `File` 或 Tauri 返回路径转换为统一资产输入结构
- 统一做图片 MIME、体积和读取失败处理

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
Browser APIs / Tauri APIs
```

约束：

- `src/components/**` 不直接 import `@tauri-apps/*`
- `src/pages/**` 不直接 import `@tauri-apps/*`
- `src/hooks/useEditorState.ts` 第一阶段不应感知 Tauri
- Tauri 相关 import 仅允许出现在平台抽象层

## 6. 运行方式约束

### 6.1 Web 运行方式

- 继续使用浏览器环境
- 保持现有开发体验
- 继续允许浏览器版下载文件

### 6.2 Windows 运行方式

- 通过 Tauri WebView 运行
- 文件保存和文件选择必须优先走原生能力
- 不允许把浏览器下载行为视为 Windows 正式实现

## 7. Router 接口规范

### 7.1 问题背景

当前：

- `src/App.tsx` 使用 `BrowserRouter`

Windows 打包第一阶段：

- Web 端可以继续 `BrowserRouter`
- Windows 端应切换到更稳妥的桌面路由策略

### 7.2 建议接口

```ts
export type RuntimePlatform = 'web' | 'windows-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function createAppRouter(platform: RuntimePlatform): React.ReactNode;
```

### 7.3 行为要求

- 组件不直接判断要用 `BrowserRouter` 还是 `HashRouter`
- 路由容器选择集中在单一入口
- Windows 端刷新当前路由时，不得进入空白页或 404 死路

### 7.4 第一阶段落地建议

- 不要求抽到非常复杂的 Router 工厂
- 但至少要把 Router 选择逻辑从 `App.tsx` 的硬编码中分离出来

## 8. 平台识别接口规范

### 8.1 建议接口

```ts
export type RuntimePlatform = 'web' | 'windows-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function isWindowsTauri(): boolean;
```

### 8.2 行为要求

- 平台判断应集中在一处
- 组件层只允许拿到布尔结果或平台枚举，不直接探测全局对象
- 不允许在多个组件中重复写平台判断逻辑

## 9. 文件保存接口规范

### 9.1 接口目标

统一 PNG / GIF 的最终落盘行为。

### 9.2 建议类型

```ts
export type SaveFileInput = {
  suggestedName: string;
  mimeType: string;
  bytes: Uint8Array;
};

export type SaveFileResult =
  | { status: 'saved'; path?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };
```

### 9.3 建议函数

```ts
export async function saveFile(input: SaveFileInput): Promise<SaveFileResult>;
```

### 9.4 行为要求

- Web：
  - 可以继续使用浏览器下载
- Windows：
  - 必须先选择保存路径
  - 必须写入本地文件系统

### 9.5 错误语义

- 用户取消保存：
  - `status: 'cancelled'`
- 生成成功但写入失败：
  - `status: 'failed'`
- 失败原因应可转成用户可见提示

### 9.6 禁止事项

- 不允许组件层直接创建 `<a download>`
- 不允许组件层自己判断 Blob 如何保存

## 10. 导出保存接口规范

### 10.1 问题背景

当前导出逻辑分两段：

- 先生成 PNG / GIF
- 再触发浏览器下载

Windows 打包第一阶段只应替换第二段。

### 10.2 建议接口

```ts
export type ExportBinary = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};

export async function saveExportBinary(binary: ExportBinary): Promise<SaveFileResult>;
```

### 10.3 行为要求

- PNG / GIF 生成逻辑仍保留在现有导出模块
- `export-save` 模块只接“生成后的二进制结果”
- 不在第一阶段把导出逻辑迁移到 Rust
- 当前 `src/lib/tactics-export.ts` 里仍存在 `downloadBlob` 浏览器下载路径；第一阶段目标是把这部分副作用逐步外提到平台保存接口，而不是让 `tactics-export.ts` 直接感知 Tauri

## 11. 图片选择接口规范

### 11.1 问题背景

当前参考底图导入链路基于浏览器 `File`。

但 Windows Tauri 对话框更自然返回的是：

- 文件路径

两者不是同一类型。

### 11.2 统一资产输入结构

建议统一成：

```ts
export type PickedImageAsset = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};
```

### 11.3 建议函数

```ts
export async function pickImageAsset(): Promise<PickedImageAsset | null>;
```

### 11.4 行为要求

- Web：
  - 从浏览器 `File` 读取内容并转成 `PickedImageAsset`
- Windows：
  - 从原生对话框拿到路径
  - 读取文件内容
  - 转成同样的 `PickedImageAsset`

### 11.4.1 与当前组件契约的兼容要求

当前 `RightPanel.tsx`、`TabletRightDrawer.tsx`、`MobilePropertiesDrawer.tsx` 仍把参考底图导入回调定义为：

```ts
(file: File) => void
```

因此第一阶段的明确决策是：

1. 在平台适配层把 `PickedImageAsset` 转成浏览器兼容的 `File` / `Blob`
2. 继续喂给现有组件契约 `(file: File) => void`
3. 不在 Windows 打包第一阶段同步重构组件契约

“统一改成资产结构契约”保留为后续重构选项，不属于第一阶段实施范围。

不接受：

- 组件层一部分继续传 `File`，另一部分直接传路径字符串
- 平台适配层只做到“能选中文件”，但没有完成到组件可消费形态的最后一跳

### 11.5 取消语义

- 用户取消选择：
  - 返回 `null`
- 不应弹错误提示

## 12. 资产导入接口规范

### 12.1 建议函数

```ts
export async function importReferenceImage(): Promise<
  | { status: 'selected'; asset: PickedImageAsset }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string }
>;
```

### 12.2 行为要求

- 导入前检查 MIME
- 导入前检查体积上限
- 读取失败要明确返回失败状态
- 组件层只消费统一结果，不自己处理路径或原始 `File`

### 12.3 禁止事项

- 不允许把路径字符串直接传给现有 UI 逻辑
- 不允许“能选文件但读不进来”的半完成实现进入主分支

## 13. 组件接入规则

第一阶段建议这样接：

- `App.tsx`
  - 只处理 Router 入口，不写具体平台 API
- `TacticsEditor.tsx`
  - 导出时调用 `saveExportBinary`
- `RightPanel.tsx`
  - 导入参考底图时调用 `importReferenceImage`

说明：

- 第一阶段保留当前组件结构
- 第一阶段明确选择“保持 `File` 契约”
- 不能在同一轮里同时混用 `File`、路径字符串和资产结构三种输入模型

不建议第一阶段就改：

- `useEditorState.ts`
- `types/tactics.ts`
- 核心项目模型

## 14. 存储边界规范

### 14.1 当前状态

- 项目数据使用 `localStorage`

### 14.2 第一阶段要求

- 不重写现有持久化模型
- 不引入新数据库
- 不把保存逻辑迁到 Rust

### 14.3 必须明确的边界

- 浏览器版数据
- `tauri dev` 开发版数据
- 正式 Windows 安装包数据

这三者默认不承诺自动互通。

## 15. 失败场景规范

第一阶段必须统一以下失败场景：

- 用户取消导出保存
- 用户取消图片选择
- 路径无权限
- 文件写入失败
- 图片 MIME 不支持
- 图片体积过大
- 图片读取失败

统一规则：

- 取消不算错误
- 失败必须有可区分的错误语义
- 失败不允许破坏当前编辑状态
- 失败后用户应能立即重试

## 16. 实施顺序与回滚点

推荐顺序：

1. 接 Tauri 基础工程
2. 抽 Router 入口
3. 抽文件保存接口
4. 抽图片选择 / 资产导入接口
5. 构建并验收 Windows 产物

回滚要求：

- 每一步都应单独提交
- 每一步都应可单独回退
- 不把多个平台适配步骤揉成一个大提交

## 17. 接口完成标准

可以认为 Windows 内部接口层完成，至少要满足：

- `App.tsx` 不再硬编码唯一 Router 策略
- 组件层不直接使用浏览器下载
- 组件层不直接使用 Tauri 文件路径
- PNG / GIF 保存统一走平台保存接口
- 参考底图导入统一走平台选择接口
- 所有取消 / 失败分支语义清楚

## 18. 当前结论

Windows 打包第一阶段要减少 bug，关键不是先写多少 Tauri 代码，而是先把这几个边界锁死：

- 路由边界
- 平台判断边界
- 文件保存边界
- 图片导入边界
- 本地存储边界

这份文档就是用来冻结这些边界的。
