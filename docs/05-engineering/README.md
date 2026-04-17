# 05-engineering

这一层负责承接前端实现边界和关键工程规则。

当前文档：

- `frontend-architecture.md`
- `routing-and-shells.md`
- `state-management.md`
- `persistence-strategy.md`
- `windows-packaging-plan.md`
- `android-packaging-plan.md`

专项补充文档：

- `../windows-packaging/windows-internal-interface-spec.md`
- `../windows-packaging/windows-technical-architecture.md`
- `../windows-packaging/windows-data-structure.md`
- `../windows-packaging/windows-acceptance-standard.md`
- `../windows-packaging/windows-development-guide.md`
- `../android-packaging/android-technical-architecture.md`
- `../android-packaging/android-internal-interface-spec.md`
- `../android-packaging/android-device-validation-plan.md`

专项验证留痕模板：

- `../DocsReview/android-technical-validation-template.md`
- `../DocsReview/android-device-compatibility-validation-template.md`

使用规则：

- 这一层回答“页面怎么挂、状态归谁、数据怎么落地、打包怎么接、哪些工程边界不能混”。
- 这一层的实现建议必须以前三份主文档和 `03-functional / 04-domain` 为前提。
- 打包和平台能力接入优先落在这一层，不直接写进 PRD 或 Requirements。
