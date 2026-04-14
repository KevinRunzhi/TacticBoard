# 04-domain

这一层负责定义核心数据对象、生命周期和本地持久化边界。

当前文档：

- `domain-model.md`
- `entity-lifecycle.md`
- `local-persistence-and-project-structure.md`

使用规则：

- 这一层回答“系统里到底有哪些核心对象，它们怎么创建、变化、保存和删除”
- 所有实体设计都必须服从 `离线单机 / 本地优先 / 无账号` 的基线

