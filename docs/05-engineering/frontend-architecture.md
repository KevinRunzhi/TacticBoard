# Frontend Architecture

最后更新：2026-03-31

## 1. 架构目标

- 用清晰壳层承接 V1 页面
- 让编辑器逻辑与普通页面逻辑解耦
- 让本地持久化与 UI 表现分层

## 2. 建议分层

### Shell 层

- App Shell
- Editor Shell

### Page 层

- Workspace page
- Projects page
- Editor page
- Settings page

### Feature 层

- project-list
- project-actions
- formation-selector
- canvas-objects
- visual-theme
- match-meta
- steps-timeline
- export
- local-save

### Shared UI 层

- 按钮、抽屉、面板、表单、提示

## 3. 关键边界

- 普通页面不要直接拥有编辑器复杂状态
- 编辑器不要直接承担项目列表管理
- 导出逻辑不要反向修改项目数据
- 本地保存逻辑不要散落到多个页面各自实现

## 4. 当前建议

- 以页面 + feature 为主组织代码
- 不继续沿用旧的账号、分享、团队模块边界
