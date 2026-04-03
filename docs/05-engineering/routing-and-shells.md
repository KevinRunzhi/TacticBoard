# Routing And Shells

最后更新：2026-03-31

## 1. 推荐路由

- `/`
- `/projects`
- `/editor`
- `/editor/:projectId`
- `/settings`
- `*`

## 2. Shell 规则

### App Shell

承载：

- 工作台
- 项目页
- 设置页

职责：

- 稳定导航
- 页面标题
- 新建项目入口

### Editor Shell

承载：

- 编辑器页

职责：

- 沉浸式布局
- 工具栏、画布、属性区、步骤区

## 3. 明确移除的旧路由

- `/login`
- `/register`
- `/bind-account`
- `/share/:id`
- `/teams`
- `/templates`

说明：

- IA 中提到的“营销落地页”在旧方案里未被要求保留为独立路由
- 如果旧代码中存在 `/landing`、`/about` 或同类营销路由，也应一并下线，不纳入 V1 路由体系

## 4. 路由异常处理

- `projectId` 不存在时进入错误态
- 错误态至少给出返回工作台和项目页两个出口
