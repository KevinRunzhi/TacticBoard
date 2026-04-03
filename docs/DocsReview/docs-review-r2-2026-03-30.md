# Docs Review Round 2

日期：2026-03-30
轮次：第 2 轮
审查范围：

- `docs/04-domain/`
- `docs/05-engineering/`
- 与之直接相关的 `docs/03-functional/frd/editor.md`

审查重点：

- 领域模型是否缺关键实体
- 步骤与对象关系是否足够清楚
- 持久化边界是否容易导致实现混乱
- 哪些状态不该落盘是否写清楚

## 结论

第二轮发现了 5 个中优先级问题，主要集中在“领域模型不够完整”和“状态 / 持久化边界不够明确”。这些问题都已修复。

## 发现与修复

### R2-1 缺少比赛信息实体

问题：

- requirements 已经明确支持比赛信息、标题区和导出开关
- 但 `04-domain/domain-model.md` 之前没有单独定义这部分实体或元数据结构

风险：

- 后面实现时容易把比赛信息散落在页面临时状态里

修复：

- 已新增 `MatchMeta`
- 已把 `matchMeta` 加入 `Project`

### R2-2 缺少最近项目索引实体

问题：

- 工作台和项目页都依赖最近项目与项目列表
- 之前文档只写了 Project，没有把索引层对象定义清楚

风险：

- 容易把项目索引和项目正文混在一起
- 也容易导致失效记录清理逻辑没人负责

修复：

- 已新增 `ProjectIndexEntry`
- 已在领域层、生命周期和持久化层补齐索引规则

### R2-3 对象身份规则还不够显式

问题：

- requirements 已经强调步骤复制后的对象身份连续性
- 但派生文档里之前没有单独把这条抽成领域规则

风险：

- 后续实现步骤复制、残影、撤销时容易出现对象身份混乱

修复：

- 已在 `domain-model.md` 中新增“对象身份规则”
- 明确 `id` 在步骤关联、残影表达和撤销重做中的作用

### R2-4 状态归属矩阵缺少派生展示状态

问题：

- `state-management.md` 之前没有明确写出播放状态、缩放视角这类派生状态不应持久化

风险：

- 后面实现时可能把播放态、画布视角等误写进项目数据

修复：

- 已补充状态归属矩阵
- 已明确播放状态、缩放视角不进入持久化
- 已把这类做法写入反模式

### R2-5 持久化恢复顺序不够清楚

问题：

- 之前写了恢复草稿，但没有写“索引清理”和“恢复判断”的先后顺序

风险：

- 启动时容易因为坏索引或坏草稿阻塞首页

修复：

- 已在 `local-persistence-and-project-structure.md` 中补充“启动恢复顺序”
- 已在 `persistence-strategy.md` 中补充恢复判断应在索引清理之后进行

## 本轮修复文件

- `docs/04-domain/domain-model.md`
- `docs/04-domain/entity-lifecycle.md`
- `docs/04-domain/local-persistence-and-project-structure.md`
- `docs/05-engineering/state-management.md`
- `docs/05-engineering/persistence-strategy.md`

## 本轮后剩余观察点

- 文档已经把“做什么”和“怎么存”讲清楚很多了
- 下一轮更值得看的是：验收标准是否足够覆盖异常场景，文档之间是否形成完整追踪链
