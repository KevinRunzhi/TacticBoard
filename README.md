# TacticBoard 战术板

> 一个面向业余足球爱好者、教练和战术讲解场景的 **本地优先战术板应用**。  
> 无需注册、无需联网、支持项目保存、步骤演示、PNG / GIF 导出与参考底图导入。

[![GitHub Release](https://img.shields.io/github/v/release/KevinRunzhi/TacticBoard?display_name=tag&label=latest%20release)](https://github.com/KevinRunzhi/TacticBoard/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-2ea44f)](https://github.com/KevinRunzhi/TacticBoard/releases)
[![Installer](https://img.shields.io/badge/download-NSIS%20Installer-0969da)](https://github.com/KevinRunzhi/TacticBoard/releases)

## 立即下载

- **Windows 安装包下载**：[`TacticBoard-windows-x64-installer.exe`](https://github.com/KevinRunzhi/TacticBoard/releases/latest/download/TacticBoard-windows-x64-installer.exe)
- **所有版本 / Release 页面**：https://github.com/KevinRunzhi/TacticBoard/releases

当前发布形式：

- Windows `x64`
- NSIS 安装包 `.exe`
- 安装完成后可直接从开始菜单或桌面启动
- 当前未签名时，Windows SmartScreen 可能提示安全确认，这属于当前阶段的预期现象

## 它适合做什么

TacticBoard 不是一个依赖账号、云端和后台的复杂平台，而是一个可以 **直接打开、直接画、直接保存、直接导出** 的本地足球战术工具。

你可以用它来：

- 设计训练课里的阵型和跑位
- 演示比赛中的攻防转换和定位球套路
- 保存多个战术项目，之后继续编辑
- 导出 PNG 图片发到群里或做讲解资料
- 导出 GIF 动图做简单步骤演示
- 导入参考底图，在真实站位图上继续标注

## 核心功能

- **本地优先**：项目、草稿和设置都保存在本地设备，无需注册登录
- **多项目管理**：工作台、项目列表、最近项目、继续编辑链路已经打通
- **战术编辑器**：支持球员、足球、文本、线路、区域等核心对象编辑
- **步骤编排**：支持新增、复制、删除、重排和播放步骤
- **导出分享**：支持 PNG 导出与 GIF 导出
- **参考底图导入**：可把参考图片作为战术讲解底板使用
- **桌面安装使用**：当前已经支持 Windows 安装包交付，不再要求用户命令行安装

## 产品截图

### 战术编辑器主界面

![TacticBoard 编辑器工作区](docs/assets/readme/editor-workspace.png)

### 战术工作台 / 快速开始

![TacticBoard 工作台](docs/assets/readme/dashboard-hero.png)

### 项目管理与项目缩略预览

![TacticBoard 项目页](docs/assets/readme/projects-overview.png)

### 导出设置

![TacticBoard 导出设置](docs/assets/readme/editor-export.png)

## Windows 安装说明

1. 打开 [Releases 页面](https://github.com/KevinRunzhi/TacticBoard/releases)
2. 下载 `TacticBoard-windows-x64-installer.exe`
3. 双击安装，完成后直接启动 `TacticBoard战术板`

如果 Windows 弹出 SmartScreen：

- 点击“更多信息”
- 再点击“仍要运行”

这不是打包失败，而是未签名桌面应用在当前阶段的常见提示。

## 当前版本已经支持的能力

- 工作台、项目页、设置页、编辑器壳层
- 本地草稿保存、正式保存、最近项目、继续编辑
- 球员、文本、线路、区域等核心对象编辑
- 步骤新增、复制、删除、重排、播放
- 比赛信息与参考底图
- PNG 导出与 GIF 导出
- Windows 桌面壳与安装包构建链路

## 当前已知范围

当前版本聚焦的是 **本地单机战术编辑体验**，暂不包含：

- 注册 / 登录 / 账号系统
- 云同步
- 在线分享页
- 团队协作
- 自动更新
- 代码签名

## 开发者入口

如果你想自己运行源码或继续开发：

```bash
cd tactics-canvas-24
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm run test
npm run lint
npm run tauri:dev
npm run tauri:build
```

## 仓库结构

```text
IDKN/
├─ docs/                 产品文档、工程文档、评审记录、验收标准
├─ tactics-canvas-24/    React + Vite + Tauri Windows 应用代码
└─ README.md             仓库首页与下载入口
```

## 文档入口

如果你更关心产品定义、工程设计和验收过程，可以从这里继续看：

- `docs/football-tactics-board-prd.md`
- `docs/football-tactics-board-requirements.md`
- `docs/football-tactics-board-information-architecture.md`
- `docs/DocsReview/`
