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

### 1.1 与切片执行文档的关系

Android Phase 1 现在已经把 `Slice 0` 到 `Slice 6` 拆成独立执行文档。

接口层面的使用方式应为：

- `android-phase1-slice-plan.md` 负责切片顺序和共享规则
- `docs/android-packaging/slices/*.md` 负责逐片说明“这一片要改哪些接口、怎么验接口、哪些接口问题不能留到下一片”
- 本文件负责冻结接口语义，避免每个切片各写一套不同的返回值和边界解释

补充说明：

- 这里的“前后端接口”不是远程服务接口
- 在本项目里，它指的是“前端共享业务层 -> TypeScript 平台桥 -> Tauri / Rust / Android 原生壳层”的内部接口

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

### 3.1 接口冻结口径与证据等级

本文件里的“冻结接口”默认指：

- 接口语义已经写回源文档，而不是只停留在 `DocsReview`
- 对应实现范围已经进入可追踪提交，或者被明确标记为“仅本地实验”
- 取消、失败、保存、分享等结果语义在 Web / Windows / Android 之间已区分清楚

额外规则：

- `DocsReview/*` 只能记录接口验证证据，不反向覆盖本文件
- 未提交本地实验不能直接写成“接口已冻结”
- 只改 `src-tauri/gen/**`、`src-tauri/target/**` 或 `src-tauri/vendor/**` 的临时补丁，不能单独视为接口实现完成
- 系统分享、系统文件选择器、本地复制、生命周期这类系统集成接口，只有自动化或烟雾证据，不得写成“接口已验收通过”

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

### 5.1 Slice 2 组件契约补充

当前第一阶段在触控主链路上额外冻结两条组件层契约：

1. `RightPanelProps` 是 `RightPanel`、`MobilePropertiesDrawer`、`TabletRightDrawer` 的唯一源契约。
   - 包装抽屉组件必须基于 `Omit<RightPanelProps, 'embedded'>` 扩展，而不是各自维护一份局部 props。
   - `selectedPlayer`、`selectedLine`、`selectedText`、`selectedArea` 以及对应写回回调必须完整透传。
   - 如果后续新增右侧属性面板字段，优先先改 `RightPanelProps`，再同步各个包装层；不允许先在包装层私自分叉。

2. `MobileTopBar` 的返回工作台、保存项目、导出项目属于 Android 触控关键入口。
   - 这三个入口不能只依赖 `onClick`。
   - 必须显式处理 touch 或 pointer(`touch`) 命中。
   - 必须具备去重策略，避免 touch 后追发 click 形成双触发。
   - 相关实现只能停留在共享组件层，不应把 Android 特判散落到页面或业务状态层。

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
export type RuntimePlatform = 'web' | 'windows-tauri' | 'android-tauri';

export function getRuntimePlatform(): RuntimePlatform;

export function isWindowsTauri(): boolean;

export function isAndroidTauri(): boolean;

export function createAppRouter(children: React.ReactNode): React.ReactNode;
```

### 7.2 当前冻结接口（Slice 1 已提交）

当前第一阶段已经冻结为：

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
- Android 应用内无效 hash 路径必须留在受控 Router 树内，而不是直接把页面打到浏览器或壳层默认错误态

### 7.4 外部 URL / VIEW intent 边界

- Slice 1 当前只冻结“应用内运行时识别 + 应用内 Router 入口集中”
- Android 外部 URL 唤起、deep link、app link、`android.intent.action.VIEW` 不属于本片默认接口合同
- 如果后续要支持外部 URL 入口，必须单独补：
  - 平台插件或原生能力接入
  - 配置与权限
  - 设备侧验收规则
  - 与应用内 `HashRouter` 不同的错误语义与回退策略

### 7.5 当前冻结结论

- Slice 1 已经把 `android-tauri` 写入已提交源码，而不是继续把 Android 假扮成 Windows
- 当前实现已经固定：Web 使用 `BrowserRouter`，Tauri 运行时统一使用 `HashRouter`
- 应用内无效 hash 路径已经在真实 Android 壳内观察到会进入受控 `NotFound` 页面，并可返回工作台
- 外部 `VIEW intent + URL data` 入口仍未纳入当前冻结合同，不应和应用内 Router fallback 混为一谈

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

export type ExportSaveResult =
  | SaveFileResult
  | { status: 'shared'; path?: string };

export async function saveExportBinary(binary: ExportBinary): Promise<ExportSaveResult>;
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
  | { status: 'shared'; path?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

export async function saveExportBinary(binary: ExportBinary): Promise<SaveExportResult>;
```

### 10.4 行为要求

- PNG / GIF 生成逻辑仍保留在现有导出模块
- `export-save` 只接“生成后的二进制结果”
- Android 第一阶段优先保证 PNG 导出 + 系统分享闭环
- Android 第一阶段不把 GIF 导出写成默认交付要求
- 如果要宣称 `shared` 语义已稳定，至少要有一项设备侧硬证据命中真实分享链路
- Android PNG 分享链路应拆成两段：
  - `prepare_share_export_binary`：把导出字节写入应用缓存目录
  - `share_export_file`：拉起系统分享面板
- `share_export_file` 必须由 Rust / 原生桥触发，不能由组件层或前端直接 `invoke('plugin:share|...')`
- Android 当前阶段的 `shared` 语义定义为“系统分享面板已拉起”
- Android 当前阶段不等待系统分享面板的下游回调；否则前端会卡在 pending，无法形成受控 UI 回写

### 10.5 禁止事项

- 不允许组件层直接触发系统分享
- 不允许 UI 组件自己判断导出结果是“保存”还是“分享”
- 不允许把系统分享面板已经弹出但 promise 仍挂住，误当成“分享链路已完成”

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

当前第一阶段的本地实现已经补到：

- `canUseNativeImageImport()` 对 `windows-tauri` 与 `android-tauri` 同时返回 `true`
- 原生路径下统一走：
  - `@tauri-apps/plugin-dialog.open`
  - `@tauri-apps/plugin-fs.readFile`
  - Rust 命令 `persist_imported_image`
  - 归一化后的 `File`
- 组件层继续只接 `File`，不接 `content://` URI 或原生权限对象

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
- Android 第一阶段当前已固定通过 Rust `persist_imported_image` 完成本地复制
- 不长期依赖外部文件路径或临时授权引用
- 读取失败要明确返回失败状态
- 如果要宣称选择器 / 本地复制接口已稳定，至少要有一项设备侧硬证据证明选择器与本地复制主路径真实命中

### 12.3 当前组件契约兼容要求

当前 `RightPanel.tsx`、`TabletRightDrawer.tsx`、`MobilePropertiesDrawer.tsx` 仍沿用：

```ts
(file: File) => void
```

因此 Android 第一阶段明确决策是：

1. `asset-import.ts` 继续对外提供浏览器兼容 `File`
2. 不在 Android 第一阶段同步重构组件契约
3. 不在同一轮里混用 `File`、路径字符串和 URI 三种输入模型
4. 球员头像导入与参考底图导入共用这一契约，不允许为头像单独引入第二种输入模型

## 13. 组件接入规则

Android 第一阶段建议这样接：

- `App.tsx`
  - 只处理 Router 入口，不写具体 Android 原生调用
- `TacticsEditor.tsx`
  - 导出时调用 `saveExportBinary`
  - 导入时负责把归一化后的 `File` 转成当前编辑模型可消费的 `data URL`
- `RightPanel.tsx`
  - 导入参考底图与球员头像时调用 `pickImageFile` 或同模块统一封装入口
- `TabletRightDrawer.tsx` / `MobilePropertiesDrawer.tsx`
  - 保持与 `RightPanel.tsx` 一致的导入契约
- `PitchCanvas.tsx` / `tactics-export.ts`
  - 只消费 `referenceImage.localUri` / `player.avatarLocalUri` 这类归一化后的前端字段
  - 不直接理解原生路径、URI 或权限语义

不建议第一阶段就改：

- `useEditorState.ts`
- 核心项目模型的大方向与存储分层

当前允许的例外是：

- 为维持共享业务链路所需的最小附加字段，可以在现有项目模型上做加法，而不是重建第二套资产模型
- 当前 Slice 4 已使用这一例外，为 `Player` 增加 `avatarLocalUri?: string | null`

## 14. 存储与生命周期边界规范

### 14.1 当前边界

- 项目数据继续沿用当前前端本地存储模型作为基线
- Android 第一阶段不引入第二套项目模型
- Android 本地复制只解决“导入边界稳定化”，不等于项目存储已经改成原生资产库

### 14.2 必须明确的边界

- Android 平台层不直接接管项目存储语义
- Android 生命周期事件不应直接泄漏到组件层
- Android 第一阶段不承诺与 Web / Windows 自动数据互通
- 本地素材复制和项目数据写入不能混成一个平台黑箱
- 当前 Slice 4 里，参考底图与球员头像在进入编辑器后仍会回写到前端项目状态；后续 Slice 5 负责验证这些状态在保存 / 恢复 / 生命周期下是否稳定

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
- 每一步 `DocsReview` 都要写清楚已提交范围与仅本地实验范围
- 如果某一步依赖生成目录或 vendor 临时补丁，只能写成“方向可行”，不能直接关闭接口项

## 17. 接口完成标准

可以认为 Android 内部接口层完成，至少要满足：

- 平台识别不再只覆盖 Web / Windows
- Router 入口继续集中在单一位置
- 组件层不直接处理 Android 原生返回值
- 导出结果可统一走保存 / 分享接口
- 参考底图导入统一走平台选择接口
- 当前 `File` 组件契约仍保持兼容
- 所有取消 / 失败分支语义清楚
- 系统分享与系统文件选择器相关接口已经具备设备侧硬证据
- 结论不依赖未提交本地实验或 `src-tauri/gen/**` / `vendor/**` 临时补丁

## 18. 当前结论

Android 打包第一阶段要减少 bug，关键不是先写多少移动壳代码，而是先把这几个边界锁死：

- 路由边界
- 平台判断边界
- 文件保存边界
- 导出分享边界
- 图片导入边界
- 生命周期与存储边界

这份文档就是用来冻结这些边界的。
