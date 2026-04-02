# Docs Review Round 5

日期：2026-03-30
轮次：第 5 轮
触发来源：

- 用户提供的 `docs-review-r4-2026-03-30.md`
- 对修复结果的再次自审

审查范围：

- `docs/01-product/scope-v1.md`
- `docs/02-ux/user-flows.md`
- `docs/02-ux/responsive-rules.md`
- `docs/02-ux/editor-layout.md`
- `docs/03-functional/frd/editor.md`

## 结论

本轮主要处理了 Round 4 提出的 01-03 层缺口，并在修完后做了一次再次自审。

结果：

- Round 4 中提出的高优先级问题已收口
- 中低优先级中与范围边界、导出规则、素材导入、路由语义有关的问题已收口
- 复审时又补了 3 个容易在实现中被遗漏的小缺口

目前 01-03 与主文档之间未再发现硬性冲突。

## 本轮完成的修复

### 来自 Round 4 的主要修复

- 明确了 `editor` 路由语义：
  - `/editor` 用于新建项目
  - `/editor/:projectId` 用于打开既有项目
- 在 editor FRD 中补齐了制式切换三选一规则
- 在 editor FRD 中补齐了上一帧残影规则
- 在 editor FRD 中补齐了导出降级提示规则
- 在 editor FRD 中补齐了素材导入规则
- 在 scope-v1 中补齐了视觉样式、编辑效率、比赛信息能力
- 在 scope-v1 中补齐了更多“不纳入”条目，并引用 requirements §17
- 在 user-flows 中补齐了阵型快捷开始变体路径
- 在 responsive-rules 中补齐了全屏演示模式
- 在 editor-layout 中补齐了导出入口推荐位置

### 本轮自审追加修复

#### R5-1 scope-v1 仍漏写 Android 系统分享

问题：

- requirements 已明确 Android 图片导出后支持系统分享
- scope-v1 之前仍未把它列入纳入项

修复：

- 已补入 `Android 图片导出后的系统分享`

#### R5-2 素材导入流过于 Android 特化

问题：

- user-flows 之前把素材导入几乎写成了 Android 专属流程

风险：

- 容易让桌面端实现缺少统一导入规则

修复：

- 改为“系统文件选择器或平台原生文件入口”
- 明确 Windows 与 Android 都遵循“导入后复制到本地”的统一规则

#### R5-3 editor FRD 漏写比赛信息编辑

问题：

- scope 和 requirements 都已有比赛信息与标题区
- 但 editor FRD 之前没有把它纳入编辑器必备能力

修复：

- 已在 editor FRD 中补入“比赛信息与标题区内容编辑”
- 已补充页面级属性应包含比赛信息、标题区与导出相关显示开关

## 本轮修复文件

- `docs/01-product/scope-v1.md`
- `docs/02-ux/user-flows.md`
- `docs/02-ux/responsive-rules.md`
- `docs/02-ux/editor-layout.md`
- `docs/03-functional/frd/editor.md`

## 当前剩余风险

- 01-03 已明显收紧，但如果后续主文档继续变化，仍需要继续回写派生层
- 下一步更值得继续加深的是 03-functional 其余页面 FRD 的状态、空态和异常态颗粒度
