# Packaging Plan Review R4 - 2026-04-15

## Scope

本轮继续对以下 Windows 打包专项文档做 3 轮交叉审查：

- `docs/05-engineering/windows-packaging-plan.md`
- `docs/windows-packaging/windows-internal-interface-spec.md`
- `docs/windows-packaging/windows-technical-architecture.md`
- `docs/windows-packaging/windows-data-structure.md`
- `docs/windows-packaging/windows-acceptance-standard.md`

审查标准：

- 文档之间不能互相打架
- 文档字段名必须尽量对齐当前代码真实类型
- 打包方案不能破坏现有 Web 主链路
- 平台接口必须能指导后续直接落代码

## Round 1

### Findings

1. `windows-data-structure.md` 里把 `StepFrame` 写成包含 `timeLabel`，但当前代码的 `StepFrame` 并没有这个字段。
2. 同一文档把 `ReferenceImage` 描述成 `mimeType + dataUrl` 泛化模型，但当前代码真实字段是 `localUri`。
3. `ExportConfig` 仍然停留在泛化描述，没有收敛到当前代码的实际字段名。

### Fixes

- 增加“文档命名与当前代码符号映射”小节，明确 `Project` 在当前代码里实际对应 `EditorState` 及其持久化状态。
- 将 `StepFrame` 字段列表改成和当前代码一致：`id / label / description / players / ball / texts / areas / lines`。
- 明确 `ReferenceImage` 当前真实字段为 `id / name / localUri / opacity / scale / offsetX / offsetY / locked / visible`。
- 将 `ExportConfig` 改为真实字段名：`format / ratio / gifSpeed / includeTitle / includeStepInfo / includeMatchInfo / includeGhostTrail / includeReferenceImage / transparentBackground`。

## Round 2

### Findings

1. `windows-internal-interface-spec.md` 已经要求平台层输出统一资产结构，但没有明确当前组件还在消费 `(file: File) => void` 这一现实。
2. `windows-technical-architecture.md` 说明了参考底图导入走桥接层，但没有把“当前有 3 个组件都还是 `File` 契约”写成实施前约束。
3. 如果不提前定这个过渡策略，后续实现最容易出现 `File`、路径字符串、资产对象三套模型混用。

### Fixes

- 在 `windows-internal-interface-spec.md` 增加“与当前组件契约的兼容要求”。
- 明确第一阶段只能二选一：
  - 平台桥把 Windows 读取结果转成浏览器兼容 `File`
  - 或者做一次聚焦的组件契约重构，统一改成资产结构
- 在 `windows-technical-architecture.md` 增加“第一阶段兼容策略”，把 `RightPanel.tsx`、`TabletRightDrawer.tsx`、`MobilePropertiesDrawer.tsx` 当前仍是 `File` 输入这一事实写清楚。

## Round 3

### Findings

1. `windows-acceptance-standard.md` 只覆盖 Windows 侧验收，没有把“接入 Tauri 后 Web 仍需可用”写成显式验收项。
2. `windows-packaging-plan.md` 的平台桥接口还残留旧版 `Promise<{ saved: boolean }>`，与新的接口规范冲突。
3. `windows-technical-architecture.md` 对导出模块的描述还缺一条：`tactics-export.ts` 当前仍含浏览器下载路径，第一阶段应把副作用从生成逻辑里抽离，而不是让它直接平台化。

### Fixes

- 在 `windows-acceptance-standard.md` 新增“Web 回归验收”，要求 `npm run dev`、浏览器主链路、浏览器导出和浏览器文件导入在接入 Tauri 后继续可用。
- 在 `windows-packaging-plan.md` 将平台桥接口更新为：
  - `SaveFileResult`
  - `PickedImageAsset`
  - 显式区分 `saved / cancelled / failed`
- 在 `windows-technical-architecture.md` 增加说明：`tactics-export.ts` 第一阶段应逐步收敛为“生成二进制结果”的模块，不继续承担 Windows 平台判断责任。

## Result

本轮修完后，剩余风险主要不在文档，而在后续实现阶段：

- Tauri 2 实际配置细节是否与当前方案完全一致
- 图片导入过渡策略最终选 `File 兼容桥` 还是 `组件契约重构`
- Web 与 Windows 两条保存链路的真实落地是否能保持相同失败语义

当前结论：

- Windows 打包专项文档之间没有明显结构性冲突
- 数据结构、技术架构、接口规范、验收标准四块已经对齐到可实施状态
- 下一步更合理的是按这套文档开始做 `Step 1`，而不是继续扩写方案
