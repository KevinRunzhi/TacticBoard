# implementation-review-33-quality-and-windows-validation-hardening-2026-04-23

## Scope

本轮只覆盖通用质量文档和 Windows 专项验收 / 开发文档的规则加固，不涉及应用代码实现。

目标：

- 把“中型 / 大型代码改动必须由执行者自己测试”从 AGENTS 扩展到实际验收文档
- 收紧通用质量边界，避免以后只跑浅层命令就宣称完成
- 收紧当前主实现面，也就是 Web / Windows 的验收与留痕要求

本轮涉及的源文档：

- `docs/06-quality/README.md`
- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/v1验收标准.md`
- `docs/06-quality/v1手动测试清单.md`
- `docs/06-quality/known-risks.md`
- `docs/windows-packaging/windows-development-guide.md`
- `docs/windows-packaging/windows-acceptance-standard.md`

## Findings

1. 现有 `06-quality` 文档定义了“测什么”，但还没有把“谁必须去测、什么不算充分验收”写得足够硬。
2. `V1 验收标准` 里已有自动化和人工验收条目，但缺少“证据等级”规则，容易把“构建成功”误写成“本轮已通过”。
3. Windows 专项文档已有命令顺序和手动回归建议，但对中型 / 大型代码改动还停留在“建议执行”，没有明确成硬门槛。
4. 通用测试矩阵覆盖了主要场景，但对取消 / 失败 / 恢复类分支的强调还不够强，容易继续出现 happy-path-only 验收。

## Fixes Applied

### 1. 通用质量基线加固

更新：

- `docs/06-quality/README.md`

新增或收紧：

- Validation is part of the task 的执行化表述
- 中型 / 大型改动的默认分级
- 中型 / 大型改动的最低要求
- “执行者必须自己先跑验证”这一条

### 2. 通用验收清单与测试矩阵加固

更新：

- `docs/06-quality/acceptance-checklist.md`
- `docs/06-quality/test-matrix.md`
- `docs/06-quality/v1手动测试清单.md`
- `docs/06-quality/known-risks.md`

新增或收紧：

- 清单使用规则
- 中型 / 大型改动附加门槛
- 保存 / 恢复 / 导出 / 导入的失败与取消分支
- “只跑少量浅层检查不算通过”的显式约束
- 手动测试清单中的“本轮实际执行命令”和“未验证项”记录
- 把“浅层验收导致误判完成”提升为显式质量风险

### 3. V1 验收标准加固

更新：

- `docs/06-quality/v1验收标准.md`

新增或收紧：

- 验收证据等级规则
- 中型 / 大型改动的最低自动化门槛
- 中型 / 大型改动的人工验收要求
- `DocsReview` 记录项扩展

### 4. Windows 当前主实现面加固

更新：

- `docs/windows-packaging/windows-development-guide.md`
- `docs/windows-packaging/windows-acceptance-standard.md`

新增或收紧：

- 中型 / 大型 Windows 改动必须由执行者本人实际运行验证
- `build/test/lint` 只是最低门槛，不是完整验收
- 保存 / 导出 / 导入 / 路由 / 平台桥改动不能只测 happy path
- Windows 验收结论必须明确失败分支和未验证项

## Validation

### Round 1: Source cross-check

对照检查：

- `AGENTS.md`
- `docs/AGENTS.md`
- `tactics-canvas-24/AGENTS.md`
- `docs/06-quality/*`
- `docs/windows-packaging/*`

结果：

- 本轮新增规则与上一轮 AGENTS 加严方向一致
- 没有把不存在的命令写进质量文档
- 没有把 Android 专项规则误写成 Windows / 通用现状

### Round 2: Workspace hygiene

执行：

- `git diff --check`

结果：

- 未发现空白、冲突标记或 patch 格式问题

## Remaining Risks

1. 本轮加固的是规则和验收文档，不等于历史实现已经重新通过这些更严格的门槛。
2. 如果后续执行者只看旧的历史 `DocsReview` 记录，而不按新规则重新验证，仍然可能出现“旧证据被误复用”的风险。
3. Android 专项文档之前已经单独加固；后续如果再扩展通用质量规则，仍需注意不要让 Android 与 Windows 的术语重新漂移。

## Conclusion

本轮完成后，仓库里关于“中型 / 大型改动必须自己测试、不能只跑浅层检查、不能只测 happy path、必须留 `DocsReview` 证据”的要求，已经不只存在于 AGENTS，而是进入了实际质量与 Windows 验收文档。
