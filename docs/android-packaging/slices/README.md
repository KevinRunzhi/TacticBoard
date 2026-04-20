# Android Phase 1 Slice Execution Docs

## 1. 目录目标

这个目录把 Android Phase 1 的 `Slice 0` 到 `Slice 6` 拆成独立执行文档。

目的：

- 让每个切片都有单独的开发闭环、接口检查清单和验收门槛
- 避免把总表同时当成路线图、实施清单、验收单和接口规范
- 让“从源码到 APK”的推进顺序、证据要求和回滚边界更容易执行

## 2. 术语说明

这个项目没有网络意义上的独立后端服务。

本目录中的“前后端接口”统一指：

- 前端共享业务层：`tactics-canvas-24/src/**`
- TypeScript 平台桥：`tactics-canvas-24/src/lib/platform.ts`、`file-access.ts`、`export-save.ts`、`asset-import.ts`
- Tauri / Rust / Android 原生壳层：`tactics-canvas-24/src-tauri/**`

因此，检查“前后端接口问题”时，必须同时检查：

- 调用方组件或页面
- TypeScript 平台桥返回语义
- Tauri 能力注册、权限、配置和原生结果
- 自动化测试和设备侧证据是否闭环

## 3. 文档列表

- `slice-0-android-shell-feasibility-baseline.md`
- `slice-1-runtime-platform-and-router-boundary.md`
- `slice-2-touch-first-main-flow-baseline.md`
- `slice-3-png-export-and-system-share-boundary.md`
- `slice-4-system-picker-and-local-copy-asset-import-boundary.md`
- `slice-5-save-recovery-lifecycle-orientation-hardening.md`
- `slice-6-device-tier-validation-regression-phase1-closure.md`

## 4. 与其他 Android 文档的关系

使用顺序和优先级如下：

1. `../android-acceptance-standard.md`
2. `../android-development-guide.md`
3. `../android-phase1-slice-plan.md`
4. 本目录各切片文档
5. `../android-internal-interface-spec.md`
6. `../../DocsReview/*`

含义：

- Android 第一阶段“什么算通过 / 不通过”，以 `android-acceptance-standard.md` 为准
- 目录边界、生成目录规则、提交卫生、验证顺序，以 `android-development-guide.md` 为准
- 切片顺序、共享规则、回滚原则，以 `android-phase1-slice-plan.md` 为准
- 本目录负责把每个切片展开成真正可执行的开发清单
- `android-internal-interface-spec.md` 负责冻结接口语义，避免各切片各写一套接口口径
- `DocsReview/*` 只记录证据和当轮结论，不单独宣布切片完成

## 5. 每个切片文档的固定结构

每个切片文档至少回答以下问题：

- 当前代码现实是什么
- 这个切片和 APK 打包链路的关系是什么
- 前端共享业务层、平台桥、Tauri / 原生壳层分别改什么
- 哪些事情不属于这个切片
- 开发步骤的闭环顺序是什么
- 验收时必须拿到哪些自动化与设备侧证据
- 哪些情况不能写成“已完成”
- 什么时候才能进入下一个切片

## 6. 推荐执行方式

建议每推进一个切片，都按同一闭环执行：

1. 先读本切片文档，再回看 `android-phase1-slice-plan.md` 的共享规则
2. 对照当前代码现实，确认历史 review 里哪些只是旧实验，哪些仍然有效
3. 在 `src/`、`src/lib/`、`src-tauri/` 的正确层级改动
4. 先跑最小自动化，再跑需要的 Web / Tauri / Android 验证
5. 设备侧拿硬证据
6. 写当轮 `DocsReview`
7. 只有在“已提交实现 + 验收通过 + 证据留痕”都成立时，才推进下一片
