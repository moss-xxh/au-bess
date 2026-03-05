# AU-002 Phase 2A/2B 需求翻译文档
**日期**: 2026-03-01
**翻译者**: Claude Sonnet (aus-energy agent)
**来源**: 首席审计员Phase 2调度枢纽指令

## 原始需求摘要
首席审计员要求实现"调度枢纽"系统，包括删除硬编码、优先级仲裁器、时间窗口管理等功能。

## 需求翻译与具体化

### 核心功能要求

#### 1. 硬编码移除 (Phase 2A)
**原始需求**: "彻底删除 BatteryService.js 内部的 SCHEDULE 对象"
**翻译为具体任务**:
- 删除 BatteryService 中的硬编码 SCHEDULE 常量
- 重构 `_onTimeUpdate` 方法，移除内部调度逻辑
- 实现 `ControlService.getNextInstruction(simTime)` 接口
- 确保删除后原有功能通过新接口正常工作

#### 2. 优先级仲裁器 (Phase 2B)
**❌ 原始错误理解**: "三步决策链：P1手动 > P2定时 > P0红线拦截"
**✅ 正确优先级序列**: "P0 SoC红线 > P1手动 > P2定时 > idle"

**翻译为具体逻辑**:
```javascript
function getNextInstruction(simTime, currentSoC) {
    // ControlService生成原始指令（不包含SoC检查）
    let rawInstruction;
    
    // Step 1: 检查手动模式（P1优先级）
    if (this.manual_mode) {
        rawInstruction = { mode: 'manual', power: this.manual_command_power };
    } else {
        // Step 2: 检查时间窗口（P2优先级）
        const activeWindow = this.findActiveWindow(simTime);
        if (activeWindow) {
            rawInstruction = { mode: 'scheduled', power: activeWindow.targetPower };
        } else {
            // Step 3: 默认idle
            rawInstruction = { mode: 'idle', power: 0 };
        }
    }
    
    return rawInstruction;
    
    // 重要：SoC红线检查（P0优先级）在BatteryService中执行
    // BatteryService接收指令后，首先进行SoC红线检查
    // 如果触发红线，强制覆盖为 { mode: 'idle', power: 0 }
    // SoC红线具有绝对最高优先级，无任何例外
}
```

#### 3. 时间窗口数据结构
**原始需求**: 规范化的窗口对象格式
**翻译为数据模型**:
```javascript
interface TimeWindow {
    id: string;           // UUID标识符
    start: string;        // "HH:MM" 24小时制
    end: string;          // "HH:MM" 24小时制  
    targetPower: number;  // MW, 充电正数，放电负数
    active: boolean;      // 是否启用
}
```

#### 4. 窗口验证逻辑
**原始需求**: "严禁重叠的时间段进入持久化层"
**翻译为验证规则**:
- 开始时间必须小于结束时间
- 不允许与现有窗口时间重叠
- 功率值必须在合理范围内
- 时间格式必须符合"HH:MM"标准

### 技术约束

#### 1. 性能要求
- getNextInstruction调用频率：250ms (4Hz)
- 窗口匹配算法时间复杂度：O(n) n为窗口数量
- 状态切换延迟：<100ms

#### 2. 数据一致性
- MarketService时间轴与调度窗口时间轴同步
- 时间精度：分钟级别
- 状态持久化：localStorage

#### 3. 向后兼容
- 现有SoC红线功能不受影响
- 原有手动控制功能保持可用
- Phase 1的安全哨兵逻辑继续生效

## 质疑裁决与技术规范（首席审计员确认）

### 1. 瞬态处理解决方案 ✅
**裁决**: 防抖与平滑过渡
**技术实现**: 指令缓冲期（Command Buffer）
- 检测到指令反向（+2.0MW → -2.0MW）时
- 强制进入一个tick（250ms）的idle状态
- 再执行新指令，避免功率跳变

### 2. 窗口重叠策略 ✅  
**裁决**: 物理排他性原则（Exclusivity）
**技术要求**: 
- 3A阶段严禁所有重叠
- validateWindow作为硬拦截器
- 用户添加重叠时抛出Overlap Error

### 3. 性能优化方案 ✅
**裁决**: 边界触发机制（Boundary Trigger）
**技术实现**:
- 维护active_window_pointer
- 仅在simTime达到窗口end或配置修改时触发重新搜索
- 避免250ms全量扫描

### 4. 数据一致性标准 ✅
**裁决**: 模拟时间主权
**技术要求**:
- MarketService仅作价格参考，非控制触发点  
- 用户定义10:02窗口，必须10:02准时触发
- 不等待10:05行情更新

### 5. 测试覆盖标准 ✅
**裁决**: 仲裁逻辑100%路径覆盖率
**强制测试用例**:
- SoC触顶时手动强充被拦截
- 定时窗口结束瞬间回归idle  
- 手动切换自动瞬间平滑切换

## 实施建议

### 分步策略
1. **Phase 2A**: 先实现基础的硬编码移除和接口重构
2. **Phase 2B**: 再实现优先级仲裁器和窗口管理
3. **测试阶段**: 全面的自动化测试和边界情况验证

### 测试要求
- 单元测试覆盖率 > 90%
- 集成测试覆盖所有优先级切换场景  
- 性能测试验证250ms响应要求
- 边界测试包括异常输入和状态转换

## 验收标准
- [ ] 硬编码SCHEDULE完全移除
- [ ] 优先级仲裁器逻辑正确实现
- [ ] 时间窗口验证功能完整
- [ ] 状态切换无功率抖动
- [ ] 所有测试通过
- [ ] 性能要求满足

## ⚠️ 重大发现：优先级表述错误（2026-03-01 14:52补充）

### 严重错误识别
**问题**: 在Phase 2A报告中错误表述优先级为"P1手动 > P2定时 > P0红线"
**风险**: 这种表述可能导致理解错误，认为手动模式能覆盖SoC安全红线
**安全影响**: 如果手动指令能覆盖SoC红线 = **安全级事故**

### 紧急修正
**正确优先级**: **P0 SoC红线 > P1手动 > P2定时 > idle**
**关键原则**: SoC安全保护具有绝对最高优先级，无任何例外

### 错误原因分析
1. ControlService注释中写的是 "Priority: P1 Manual > P2 Scheduled > P0 Idle"
2. 这里的P0指的是idle（默认状态），不是SoC红线
3. SoC红线保护位于BatteryService._onTimeUpdate中，在ControlService返回指令之后执行
4. 由于SoC红线是最后执行的检查，它实际上具有最终决定权（final authority）
5. 之前的报告混淆了"编号顺序"和"实际优先级"——虽然P0在代码中指idle，但SoC红线在架构上具有最高优先级

### 代码架构确认（已验证）
```
执行流程（按时间顺序）:
1. ControlService.getNextInstruction(simTime)
   → P1 Manual > P2 Scheduled > idle（生成原始指令）
2. BatteryService._onTimeUpdate 接收指令
   → SoC红线检查（如果SoC>=max且charging，或SoC<=min且discharging）
   → 强制覆盖为 idle + power=0
3. 物理引擎执行最终指令

关键：SoC红线是LAST check（最后检查），拥有FINAL authority（最终权威）
```

### Phase 2A-Supplement 补充测试结果（2026-03-01 15:01 验证完成）

**测试文件**: `AU-002/tests/test-phase2a-safety.html`
**测试结果**: ✅ **88/88 ALL PASSED**

#### 双重拦截测试结果
| 场景 | 指令来源 | SoC状态 | 结果 | 判定 |
|------|---------|---------|------|------|
| 手动+2.5MW | manual | SoC=100% | idle, 0MW, redLine=true | ✅ 拦截成功 |
| 手动-2.5MW | manual | SoC=0% | idle, 0MW, redLine=true | ✅ 拦截成功 |
| 定时+2.0MW | scheduled | SoC=100% | idle, 0MW, redLine=true | ✅ 拦截成功 |
| 定时-2.0MW | scheduled | SoC=0% | idle, 0MW, redLine=true | ✅ 拦截成功 |
| 手动+2.5MW | manual | SoC=90% | charging, 2.5MW | ✅ 正常放行 |
| 手动-2.5MW | manual | SoC=10% | discharging, -2.5MW | ✅ 正常放行 |
| 手动+2.5MW | manual | SoC=99.9% | charging, 2.5MW | ✅ 边界放行 |
| 手动-2.5MW | manual | SoC=0.1% | discharging, -2.5MW | ✅ 边界放行 |

#### 完整测试覆盖
- **安全测试** (SAFETY): 22/22 通过 — SoC红线绝对权威验证
- **架构验证** (ARCH): 15/15 通过 — 分离关注验证
- **缓冲测试** (BUF): 8/8 通过 — 方向反转去抖
- **SoC全扫描** (SWEEP): 15/15 通过 — 13级SoC全覆盖
- **持久化** (PERSIST): 11/11 通过 — localStorage完整性
- **缓存机制** (CACHE): 6/6 通过 — 边界触发优化
- **性能** (PERF): 5/5 通过 — 60x速度压力测试
- **边界** (EDGE): 6/6 通过 — 窗口边界精确性

#### 性能指标
| 指标 | 测量值 | 阈值 | 判定 |
|------|--------|------|------|
| 窗口匹配平均耗时 | 2.5μs | <250μs | ✅ 远超标准 |
| 验证平均耗时 | 13.4μs | <500μs | ✅ 远超标准 |
| 完整周期(指令+红线) | 0.001ms | <1ms | ✅ 远超标准 |
| 60x速度(240ticks/min) | 0.2ms | <500ms | ✅ 远超标准 |
| 存储大小 | 180B | <10KB | ✅ 远超标准 |

#### 原始Phase 2A测试回归
**结果**: ✅ **85/85 ALL PASSED** — 无回归

### 安全审计结论
**✅ 安全验收通过** — SoC红线具有绝对最高优先级，手动指令和定时指令均无法覆盖SoC保护。
代码实现正确，但文档表述曾有误导性，现已修正。

## 下一步行动
1. ✅ 完成Phase 2A-Supplement补充测试 (88/88 通过)
2. ✅ 验证SoC红线的绝对权威性 (所有拦截场景通过)
3. ✅ 更新所有相关文档修正优先级表述
4. ✅ 回归测试确认无副作用 (85/85 原始测试通过)
5. ⏳ 等待首席审计员验收补充测试结果
6. ⏳ 获得Phase 2B准入许可