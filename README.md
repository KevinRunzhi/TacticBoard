# TacticBoard

TacticBoard 是一个面向业余足球爱好者的本地优先战术板项目。

这个仓库当前的目标不是做一个带账号、云端和后台的 Web 平台，而是做一个可以离线使用、易于部署、便于演示，并且后续可以继续打包成桌面端和移动端应用的足球战术板。

## 项目当前状态

当前仓库已经包含两部分核心内容：

- 一套可运行的前端应用原型
- 一套完整的产品、需求、工程和验收文档基线

当前已经完成的核心能力包括：

- 工作台、项目页、设置页、编辑器壳层
- 本地草稿保存、正式保存、最近项目、继续编辑
- 球员、文本、线路、区域等核心对象编辑
- 步骤新增、复制、删除、重排、播放
- 比赛信息与参考底图
- PNG 导出与 GIF 导出
- V1 验收标准、手动测试清单和多轮评审记录

## 产品定位

- 本地优先
- 单机使用
- 无需注册登录
- 首发目标平台：Windows 和 Android
- 优先服务业余足球爱好者的战术表达、复盘讲解和导出分享

## 仓库结构

```text
IDKN/
├─ docs/                 项目文档、评审记录、验收标准
├─ tactics-canvas-24/    前端应用代码（React + Vite）
└─ README.md             仓库首页说明
```

重点目录说明：

- `docs/`
  - 产品和需求基线
  - 01-07 分层实现文档
  - DocsReview 评审与审查记录
- `tactics-canvas-24/`
  - 页面与编辑器 UI
  - 编辑器状态管理
  - 本地项目存储与恢复
  - PNG / GIF 导出逻辑
  - 自动化测试

## 快速开始

在前端目录中运行：

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
```

## 代码入口

主要代码位置：

- `tactics-canvas-24/src/pages/`
- `tactics-canvas-24/src/components/tactics/`
- `tactics-canvas-24/src/hooks/useEditorState.ts`
- `tactics-canvas-24/src/data/mockProjects.ts`
- `tactics-canvas-24/src/lib/tactics-export.ts`

## 文档入口

建议优先阅读这三份基线文档：

1. `docs/football-tactics-board-prd.md`
2. `docs/football-tactics-board-requirements.md`
3. `docs/football-tactics-board-information-architecture.md`

质量与验收入口：

- `docs/06-quality/v1验收标准.md`
- `docs/06-quality/v1手动测试清单.md`
- `docs/DocsReview/`

## 当前阶段

当前项目可以定义为：

- 页面框架已完成
- V1 主链路已打通
- 编辑器核心操作已具备可演示能力
- 正在继续做手动验收、交互细化和发布前收口

这意味着它已经不是纯页面样式稿，而是一套可以运行、保存、编辑和导出的本地战术板原型。

## 当前范围内不做的内容

至少在当前 V1 范围内，不做以下内容：

- 注册 / 登录 / 账号系统
- 云同步
- 在线分享页
- 团队协作
- 后台管理
- 平台化运营功能

## 文档组织规则

`docs/` 目录已经按当前产品方向重建：

- 顶层三份主文档是主基线
- `01-07` 是从主文档派生出来的实现文档
- `DocsReview/` 用来记录文档审查、代码审查、实现修复和验收回合

## 适合谁阅读这个仓库

- 想快速理解项目目标和当前进度的老师或评审
- 想继续开发这个项目的人
- 想先看文档再看代码的人
- 想直接运行前端原型进行演示或验收的人
