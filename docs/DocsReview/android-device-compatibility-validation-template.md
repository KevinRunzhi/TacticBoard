# Android Device Compatibility Validation Template

> 使用方式：
> - 每一轮设备兼容验证开始前，复制这份模板为新的记录文件。
> - 推荐命名：`implementation-review-android-device-validation-YYYY-MM-DD.md`
> - 不要直接在本模板上追加某一轮的真实结果。

## Scope

本轮验证范围：

- [ ] P0 设备启动与进入
- [ ] P0 主链路
- [ ] P0 导出与系统分享
- [ ] P0 素材导入
- [ ] P0 生命周期 / 横竖屏
- [ ] P1 风险发现
- [ ] P2 观察记录

本轮具体目标：

- 
- 
- 

## Context

关联文档：

- `docs/android-packaging/android-device-compatibility-matrix.md`
- `docs/android-packaging/android-device-validation-plan.md`
- `docs/android-packaging/android-acceptance-standard.md`
- `docs/android-packaging/android-development-guide.md`

本轮背景：

- 

本轮不覆盖：

- 

## Device Inventory

| 设备名 | 设备类别 | 等级 | Android 版本 | 手机/平板 | ROM/系统特征 | 备注 |
|---|---|---|---|---|---|---|
|  |  | P0/P1/P2 |  |  |  |  |
|  |  | P0/P1/P2 |  |  |  |  |

## Commands

### Shared Validation

- `npm run build`
- `npm run test`
- `npm run lint`

结果：

- 

### Android Validation Commands

- Android 初始化命令：
- Android 运行命令：
- Android 构建命令：

结果：

- 

## Scenario Coverage Table

| 场景 | 目标设备等级 | 是否执行 | 备注 |
|---|---|---|---|
| 启动与进入 | P0 |  |  |
| 主链路 | P0 |  |  |
| PNG 导出 | P0 |  |  |
| 系统分享 | P0 |  |  |
| 球员头像导入 | P0 |  |  |
| 参考底图导入 | P0 |  |  |
| 生命周期切换 | P0 |  |  |
| 横竖屏切换 | P0 |  |  |
| 性能观察 | P1 |  |  |
| ROM 差异观察 | P1 |  |  |
| 折叠屏/分屏/桌面模式观察 | P2 |  |  |

## Per-Device Results

### Device 1

- 设备名：
- 设备等级：
- 通过场景：
- 失败场景：
- 仅观察项：
- 是否阻塞 Android 第一阶段：
- 备注：

### Device 2

- 设备名：
- 设备等级：
- 通过场景：
- 失败场景：
- 仅观察项：
- 是否阻塞 Android 第一阶段：
- 备注：

## Findings

1. 
2. 
3. 

## Blocking Issues

- 
- 

## Non-Blocking Risks

- 
- 

## Known Limitations

- 
- 

## Acceptance Mapping

本轮对应 Android 第一阶段验收与兼容矩阵中的项目：

- [ ] P0 设备启动与进入
- [ ] P0 主链路
- [ ] P0 PNG 导出
- [ ] P0 系统分享
- [ ] P0 球员头像导入
- [ ] P0 参考底图导入
- [ ] P0 生命周期与方向切换
- [ ] P1 风险观察
- [ ] P2 观察项

## Decision

本轮结论：

- [ ] P0 设备通过，可继续下一轮
- [ ] P1 发现风险，但不阻塞当前阶段
- [ ] 存在阻塞问题，必须先修复
- [ ] 仍需补更多设备验证

建议下一步：

- 
- 
- 
