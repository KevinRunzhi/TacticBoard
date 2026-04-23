# Android Packaging

这个目录用于存放 Android 打包专项文档。

## 当前专项文档

- `android-windows-toolchain-setup.md`
- `android-release-distribution-status.md`
- `android-technical-architecture.md`
- `android-internal-interface-spec.md`
- `android-acceptance-standard.md`
- `android-device-compatibility-matrix.md`
- `android-device-validation-plan.md`
- `android-phase1-realdevice-validation-status.md`
- `android-phase1-slice-plan.md`
- `android-development-guide.md`
- `slices/README.md`
- `slices/slice-0-android-shell-feasibility-baseline.md`
- `slices/slice-1-runtime-platform-and-router-boundary.md`
- `slices/slice-2-touch-first-main-flow-baseline.md`
- `slices/slice-3-png-export-and-system-share-boundary.md`
- `slices/slice-4-system-picker-and-local-copy-asset-import-boundary.md`
- `slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `slices/slice-6-device-tier-validation-regression-phase1-closure.md`

## 上游总路线文档

- `../05-engineering/android-packaging-plan.md`

## 验证留痕模板

- `../DocsReview/android-technical-validation-template.md`
- `../DocsReview/android-device-compatibility-validation-template.md`

## 使用规则

- 这里的文档聚焦 Android 打包专项设计，不重复覆盖 PRD、Requirements 或通用前端架构。
- 总体实施路线以 `05-engineering/android-packaging-plan.md` 为准。
- 这里更偏向运行架构、平台边界、能力分层、专项技术约束和切片执行清单。
- Android 每一轮技术验证建议配合 `../DocsReview/android-technical-validation-template.md` 留存记录。

## 文档角色与优先级

1. `../05-engineering/android-packaging-plan.md`
2. `android-acceptance-standard.md`
3. `android-development-guide.md`
4. `android-phase1-slice-plan.md`
5. `slices/*.md`
6. `android-technical-architecture.md` / `android-internal-interface-spec.md` / `android-device-compatibility-matrix.md` / `android-device-validation-plan.md`
7. `../DocsReview/*`

说明：

- 总路线、阶段门槛和大边界，以 `android-packaging-plan.md` 为准。
- 通过 / 不通过和证据门槛，以 `android-acceptance-standard.md` 为准。
- 实施规则、提交卫生、生成目录规则和留痕要求，以 `android-development-guide.md` 为准。
- 切片顺序、共享规则、回滚原则，以 `android-phase1-slice-plan.md` 为准。
- `slices/*.md` 负责把每个切片展开成可以直接开发和验收的执行文档。
- `android-internal-interface-spec.md` 负责冻结平台桥与壳层接口语义。
- `DocsReview/*` 只记录证据和当轮结论，不反向覆盖前面的源文档。

## 推荐阅读顺序

1. `../05-engineering/android-packaging-plan.md`
2. `android-windows-toolchain-setup.md`
3. `android-release-distribution-status.md`
4. `android-acceptance-standard.md`
5. `android-development-guide.md`
6. `android-phase1-realdevice-validation-status.md`
7. `android-phase1-slice-plan.md`
8. `slices/README.md`
9. `slices/slice-0-android-shell-feasibility-baseline.md`
10. `slices/slice-1-runtime-platform-and-router-boundary.md`
11. `slices/slice-2-touch-first-main-flow-baseline.md`
12. `slices/slice-3-png-export-and-system-share-boundary.md`
13. `slices/slice-4-system-picker-and-local-copy-asset-import-boundary.md`
14. `slices/slice-5-save-recovery-lifecycle-orientation-hardening.md`
15. `slices/slice-6-device-tier-validation-regression-phase1-closure.md`
16. `android-technical-architecture.md`
17. `android-internal-interface-spec.md`
18. `android-device-compatibility-matrix.md`
19. `android-device-validation-plan.md`

说明：

- 兼容矩阵和设备验证计划先定义“在哪些设备等级上验证、怎么验证”。
- 验收标准定义“这些验证通过到什么程度才算 Android 第一阶段完成”。
- 切片总表负责冻结顺序和共享规则。
- 切片独立文档负责把“源码改哪里、接口怎么查、如何从开发走到 APK 验收闭环”写实。
