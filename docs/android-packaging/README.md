# Android Packaging

这个目录用于存放 Android 打包相关的专项文档。

当前专项文档：

- `android-technical-architecture.md`
- `android-internal-interface-spec.md`
- `android-acceptance-standard.md`
- `android-device-compatibility-matrix.md`
- `android-device-validation-plan.md`
- `android-phase1-slice-plan.md`
- `android-development-guide.md`

上游总路线文档：

- `../05-engineering/android-packaging-plan.md`

验证留痕模板：

- `../DocsReview/android-technical-validation-template.md`
- `../DocsReview/android-device-compatibility-validation-template.md`

使用规则：

- 这里的文档聚焦 Android 打包专项设计，不重复覆盖 PRD、Requirements 或通用前端架构。
- 总体实施路线以 `05-engineering/android-packaging-plan.md` 为准。
- 这里更偏向运行架构、平台边界、能力分层和专项技术约束。
- Android 每一轮技术验证建议配合 `../DocsReview/android-technical-validation-template.md` 留存记录。

推荐阅读顺序：

1. `../05-engineering/android-packaging-plan.md`
2. `android-technical-architecture.md`
3. `android-internal-interface-spec.md`
4. `android-device-compatibility-matrix.md`
5. `android-device-validation-plan.md`
6. `android-acceptance-standard.md`
7. `android-development-guide.md`
8. `android-phase1-slice-plan.md`

说明：

- 兼容矩阵和设备验证计划先定义“在哪些设备等级上验证、怎么验证”。
- 验收标准再定义“这些验证通过到什么程度才算 Android 第一阶段完成”。
