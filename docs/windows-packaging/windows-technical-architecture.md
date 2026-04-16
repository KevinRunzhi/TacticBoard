# Windows 技术架构

## 1. 文档目标

这份文档定义 TacticBoard 在 Windows 打包第一阶段的专项技术架构。

目标：

- 把 Windows 打包相关模块边界讲清楚
- 明确运行方式、依赖方向和平台适配落点
- 让实现阶段尽量少靠临时判断和横向扩散改动

适用范围：

- `tactics-canvas-24/` 前端工程
- Tauri 2 Windows 桌面壳接入

## 2. 架构结论

Windows 第一阶段采用：

- `React + Vite` 作为前端 UI 与业务逻辑层
- `Tauri 2` 作为桌面壳层
- `plugin-dialog` 与 `plugin-fs` 作为文件能力接入点

第一阶段不采用：

- Electron
- Rust 侧重写业务逻辑
- 新数据库
- 后端服务

## 3. 运行方式

### 3.1 Web 开发模式

- 运行方式：`npm run dev`
- 前端入口：Vite
- 路由策略：浏览器路由
- 文件导出：浏览器下载
- 文件选择：浏览器文件输入

### 3.2 Windows 开发模式

- 运行方式：`npm run tauri:dev`
- 前端入口：Tauri WebView + Vite dev server
- 路由策略：桌面端稳定路由策略
- 文件导出：原生保存
- 文件选择：原生对话框

### 3.3 Windows 构建产物

- 运行方式：`npm run tauri:build`
- 前端资源来源：Vite `dist`
- 文件导出：原生保存
- 文件选择：原生对话框
- 数据持久化：沿用当前前端存储方案

## 4. 分层结构

```text
Desktop Shell Layer (Tauri)
    ↓
Platform Bridge Layer
    ↓
Application Layer
    ↓
Feature / State Layer
    ↓
UI Layer
```

## 5. 模块划分

### 5.1 Desktop Shell Layer

职责：

- 承载桌面窗口
- 提供 WebView 运行环境
- 暴露原生能力入口

主要目录：

- `tactics-canvas-24/src-tauri/`

包含内容：

- Tauri 配置
- capability 配置
- Rust 入口

### 5.2 Platform Bridge Layer

职责：

- 统一浏览器环境与 Windows Tauri 环境的差异
- 屏蔽文件系统、文件对话框、运行平台识别细节

建议文件：

- `src/lib/platform.ts`
- `src/lib/file-access.ts`
- `src/lib/export-save.ts`
- `src/lib/asset-import.ts`

### 5.3 Application Layer

职责：

- 组织页面、路由入口和整体运行容器
- 挂接 Router 策略和平台入口

主要文件：

- `src/main.tsx`
- `src/App.tsx`

### 5.4 Feature / State Layer

职责：

- 承载编辑器业务状态
- 承载项目保存与恢复逻辑
- 承载导出生成逻辑

主要文件：

- `src/hooks/useEditorState.ts`
- `src/data/mockProjects.ts`
- `src/lib/tactics-export.ts`

### 5.5 UI Layer

职责：

- 展示页面
- 接收用户操作
- 调用应用层或平台桥层提供的接口

主要目录：

- `src/pages/`
- `src/components/tactics/`
- `src/components/ui/`

## 6. 依赖方向

依赖必须保持单向：

```text
pages / components
    ↓
editor / export / project actions
    ↓
platform bridge
    ↓
browser APIs or Tauri APIs
```

明确禁止：

- UI 组件直接 import `@tauri-apps/*`
- 页面直接处理原生文件路径
- 平台层反向依赖编辑器组件

## 7. 路由架构

### 7.1 当前代码现状

- `src/App.tsx` 当前使用 `BrowserRouter`

### 7.2 Windows 第一阶段要求

- Web 端继续保留浏览器路由
- Windows 桌面端切换到更稳妥的桌面路由策略
- Router 选择逻辑集中在单一入口

### 7.3 目标结构

```text
App
 └─ createRouterByPlatform()
     ├─ Web -> BrowserRouter
     └─ Windows -> HashRouter (or equivalent desktop-safe strategy)
```

### 7.4 原因

- 降低刷新当前路由时的失效风险
- 避免桌面端深链接恢复或路由跳转时进入空白页

## 8. 导出架构

### 8.1 当前代码现状

- `src/lib/tactics-export.ts` 负责 PNG / GIF 生成
- 当前仍包含浏览器下载行为

### 8.2 Windows 第一阶段目标

- 保留 PNG / GIF 生成逻辑
- 仅替换最终“如何保存文件”

### 8.3 模块责任分离

```text
tactics-export.ts
    负责生成 PNG / GIF 二进制

export-save.ts
    负责把二进制交给平台保存

file-access.ts
    负责真正保存文件
```

### 8.4 结果

- 导出生成与导出落盘分离
- 平台差异只集中在保存阶段
- `tactics-export.ts` 在第一阶段应逐步收敛为“生成二进制结果”的模块，不继续承担 Windows 平台判断责任

## 9. 参考底图导入架构

### 9.1 当前代码现状

- `RightPanel.tsx` 当前导入链路基于浏览器 `File`

### 9.2 Windows 第一阶段问题

- Tauri 更自然返回路径，而不是浏览器 `File`

### 9.3 目标结构

```text
RightPanel
    ↓
asset-import.ts
    ↓
file-access.ts
    ↓
Browser File or Tauri Path
    ↓
PickedImageAsset
```

### 9.4 结果

- 组件层只拿统一资产结构
- 不直接关心浏览器或 Tauri 返回值差异

### 9.5 第一阶段兼容策略

当前代码里不仅 `RightPanel.tsx`，`TabletRightDrawer.tsx` 和 `MobilePropertiesDrawer.tsx` 也沿用 `(file: File) => void` 形式。

因此第一阶段技术架构明确采用：

- 路径 A：保留现有组件输入契约，由平台桥把 Windows 读取结果转换成浏览器兼容 `File`

并明确不做：

- 不在第一阶段把这组组件统一改成消费平台层资产结构

原因：

- 当前目标是先稳定打出 Windows 桌面版
- 保持 `File` 契约可以最大限度复用现有参考底图导入链路
- 这样可以把风险集中在平台桥，而不是扩散到多个 UI 组件和导入调用点

这件事不能留到实现中途边做边定，否则最容易出现同一条导入链路混用 `File`、路径字符串和资产对象三种模型。

## 10. 持久化架构

### 10.1 第一阶段现实

- 当前项目持久化基于 `localStorage`
- 第一阶段不做存储重构

### 10.2 Windows 第一阶段要求

- 正式桌面产物内部要保持自身数据稳定
- 不承诺浏览器版与桌面版自动数据互通
- 不承诺 `tauri dev` 与正式包自动数据继承

### 10.3 结论

- 第一阶段技术架构里，存储层保持前端本地存储
- 平台层不介入项目数据模型，只处理文件能力

## 11. 插件与权限架构

### 11.1 第一阶段插件

- `@tauri-apps/plugin-dialog`
- `@tauri-apps/plugin-fs`

### 11.2 权限原则

- 只开放当前必需权限
- 不开放与 V1 无关的宽泛文件系统能力

### 11.3 权限落点

- `src-tauri/capabilities/`

## 12. 运行配置架构

### 12.1 Tauri 配置要求

`tauri.conf.json` 至少明确：

- `beforeDevCommand`
- `beforeBuildCommand`
- `devUrl`
- `frontendDist`

### 12.2 Vite 配置要求

`vite.config.ts` 至少明确：

- 固定端口 `8080`
- `strictPort: true`
- Tauri 开发宿主兼容

### 12.3 Web 回归要求

Windows 打包接入属于“在现有 Web 应用外层加桌面壳”，不是把项目改造成 Windows-only 应用。

因此技术架构上必须保证：

- `npm run dev` 仍能按当前浏览器方式启动
- Web 路由、导出、参考底图导入的现有实现仍然可用
- 平台桥接入后，Web 端继续走浏览器能力分支，而不是被 Tauri 假设污染

## 13. 第一阶段不做的技术动作

- 不把导出逻辑迁移到 Rust
- 不把项目存储迁移到 Rust
- 不引入 SQLite / IndexedDB 新方案
- 不重构 `useEditorState.ts`
- 不重写编辑器页面和对象模型

## 14. 第一阶段完成后的架构状态

达到第一阶段后，架构上应满足：

- Windows 有桌面壳
- 路由在桌面环境稳定
- PNG / GIF 可走原生保存
- 参考底图可走原生文件选择
- 业务主链路仍由现有前端逻辑承载

## 15. 当前结论

Windows 第一阶段技术架构的关键不是“做更多桌面原生逻辑”，而是把：

- 路由
- 文件保存
- 文件选择
- 平台识别

这四类平台差异隔离出去。

只要这个分层守住，打包阶段的 bug 会少很多。
