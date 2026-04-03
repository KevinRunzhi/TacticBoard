# Docs Review Round 5.1（复查）

日期：2026-03-31
轮次：第 5.1 轮（R5 修复后复查）
审查范围：

- `docs/04-domain/`
- `docs/05-engineering/`
- `docs/06-quality/`
- `docs/07-decisions/`
- `docs/football-tactics-board-prd.md` §16（回写部分）

---

## 总结

R5 提出的 14 个问题已全部修复，修复质量良好，未引入新的硬性冲突。

复查中发现 **3 个新的低优先级观察点**，均不影响文档冻结。

---

## R5 修复确认

| 编号 | 问题 | 修复状态 | 确认方式 |
|---|---|---|---|
| R5-01 | 导出配置实体命名不一致 | ✅ 已修复 | PRD §16 已改为 `ExportConfig`，与 domain-model §10 一致 |
| R5-02 | 编辑子对象缺字段建议 | ✅ 已修复 | domain-model 新增 §4，`PlayerObject`、`BallObject`、`TextObject`、`AreaObject`、`LineObject`、`ReferenceImage` 全部给出字段骨架 |
| R5-03 | PRD LocalDraft 描述含最近项目记录 | ✅ 已修复 | PRD §16 已拆分：`LocalDraft` 改为"本地自动保存草稿"，新增 `ProjectIndexEntry` 和 `MatchMeta` 为独立实体 |
| R5-04 | 状态归属矩阵缺撤销重做栈 | ✅ 已修复 | state-management §3 矩阵新增"撤销重做栈 → 编辑器状态 → 否" |
| R5-05 | persistence-strategy 未说明 MatchMeta 随 Project | ✅ 已修复 | persistence-strategy §2 新增说明，§3 也写了"写入内容包含 matchMeta、referenceImage" |
| R5-06 | routing-and-shells 旧路由列表缺营销落地页 | ✅ 已修复 | §3 新增说明段落，交代了营销落地页情况及处理原则 |
| R5-07 | 参考底图归属不清 | ✅ 已修复 | domain-model §2 Project 字段新增 `referenceImage`，规则明确"按项目级对象管理，跨全部步骤共享" |
| R5-08 | entity-lifecycle 缺 MatchMeta 和 ExportConfig | ✅ 已修复 | entity-lifecycle 新增 §7 MatchMeta、§8 ExportConfig 完整生命周期 |
| R5-09 | 自动保存触发策略缺失 | ✅ 已修复 | persistence-strategy §4 新增：撤销栈变更触发、2 秒去抖、10 秒强制落盘、步骤切换/后台/手动保存前冲刷 |
| R5-10 | Feature 层缺视觉样式和比赛信息 | ✅ 已修复 | frontend-architecture §2 Feature 层新增 `visual-theme` 和 `match-meta` |
| R5-11 | 验收清单缺制式切换场景 | ✅ 已修复 | acceptance-checklist §3 新增三选一提示验收、选项行为验收、不自动删除/重排/映射验收 |
| R5-12 | 验收和测试缺残影场景 | ✅ 已修复 | acceptance-checklist §3/§5 补入残影验收；test-matrix 补入 3 条残影用例 |
| R5-13 | 验收和测试缺视觉样式场景 | ✅ 已修复 | acceptance-checklist §3 补入球员样式切换、主题切换独立性；test-matrix 补入 2 条用例 |
| R5-14 | ADR 层缺素材本地复制决策 | ✅ 已修复 | 新增 `adr-005-asset-import-local-copy.md`，07-decisions/README 已同步更新 |

---

## 新观察点

### R5.1-01 domain-model §4 PlayerObject 缺少 `displayStyle` 字段

问题：

- PRD §9.1 和 Requirements §16 明确了球员展示样式是项目级可切换的（圆点 / 球衣卡片），且球员展示样式与成套主题相互独立。
- domain-model §2 Project 字段有 `playerStyle` 来承载项目级的球员展示样式选择。
- 但 `PlayerObject` 字段建议里没有 `displayStyle` 或类似字段。

风险：

- 这个风险非常轻。当前设计意图应该是"球员展示样式是项目级统一的"（`Project.playerStyle`），而不是每个球员对象单独控制——这与 PRD 的设计方向一致。
- 但如果未来需要支持"同一项目中部分球员用圆点、部分用卡片"的弹性，就需要在 PlayerObject 上加一个可选覆盖字段。

影响：低。当前 V1 不需要，只是一个潜在灵活性预留点。

建议：

- V1 不做修改。如后续有需求，在 PlayerObject 上补一个可选 `styleOverride` 字段。

### R5.1-02 ExportConfig 字段缺少 `includeGhostTrail`（残影导出开关）

问题：

- editor.md §4 已明确"导出时残影默认不导出，需显式开启"。
- acceptance-checklist 和 test-matrix 都已补入残影导出的验收和测试。
- 但 domain-model §10 `ExportConfig` 的字段建议里只有 `includeTitle`、`includeStepInfo`、`includeMatchInfo`、`transparentBackground`，没有 `includeGhostTrail` 或等价的残影导出开关字段。

风险：

- 开发在实现导出面板时，可能不知道要在 ExportConfig 上加这个开关，导致残影导出功能没有数据支撑。

影响：中偏低。残影导出开关已经在功能层和质量层写得很清楚了，但领域层的字段建议没跟上。

建议：

- 在 domain-model §10 ExportConfig 字段建议中补入 `includeGhostTrail`。
- 同时考虑是否需要补 `includeReferenceImage`（参考底图导出开关），因为 editor.md §6 也写了"参考底图默认不导出，需显式开启"。

### R5.1-03 local-persistence §2 临时保存说明了 ExportConfig，但 ExportConfig 生命周期已写"不跨会话保留"，两处措辞应对齐

问题：

- local-persistence §2 把 ExportConfig 列在"临时保存"类别下，加了括号说明"仅当前导出会话"。
- entity-lifecycle §8 写了"不跨会话保留"。
- persistence-strategy §8 写了"导出弹窗临时输入"不进入持久化。

这三处含义一致但措辞分散，不构成冲突，仅在表达粒度上有微小差异。

影响：极低。纯粹是表述统一性问题。

建议：

- 不需要立即修改。如后续做文档统一扫描时顺手对齐即可。

---

## 整体评估

04-07 层在本轮修复后已达到高内部一致性，关键收获：

1. **领域模型完整了** — 所有 V1 编辑对象都有字段建议骨架，参考底图归属明确为 Project 级别，实体间关系清晰。
2. **PRD ↔ 领域层对齐了** — 实体命名统一为 `ExportConfig`，`ProjectIndexEntry` 和 `MatchMeta` 回写到 PRD，LocalDraft 描述已修正。
3. **工程层策略具体了** — 自动保存有了明确的触发条件和去抖参数，Feature 模块列表完整了。
4. **质量层覆盖面提升了** — 验收清单和测试矩阵现在覆盖制式切换、残影、视觉样式三个此前的盲区，测试用例从 18 条增加到 25 条。
5. **ADR 补齐了关键决策** — 素材本地复制有了正式的决策记录和理由归档。

当前 04-07 文档可以作为开发基线使用。上面三个新观察点中 **R5.1-02（ExportConfig 缺残影导出字段）** 建议在下次迭代时优先补齐，其余两个可后续顺手修。
