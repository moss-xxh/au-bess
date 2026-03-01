# AU-002阶段2B需求翻译文档

## 原始需求来源
- 时间：2026-02-28 20:41:12 GMT+8 - 22:30
- 来源：Gemini风格需求描述
- 需求标题：AU-002 阶段 2B - 手动控制 UI 与基础收益核算

## Gemini原版特征分析
- ✅ 激励语言：已删除（"薛总老练安排"、"解锁储能站套利灵魂"等表达）
- ✅ 审核管理语：已删除（"为您整理好执行指令"等管理语言）
- ✅ 高层需求：已具体化（从"手动控制"到具体的localStorage状态机）
- ✅ 模糊描述：已精确化（收益公式、功率限制、时间精度等）

## 翻译后技术规格

### 1. 指令持久化系统
**文件：** `src/js/core/control-manager.js`
**状态机规格：**
```javascript
// 状态定义
const VALID_MODES = ['auto', 'manual'];
const VALID_ACTIONS = ['charge', 'stop', 'discharge'];

// 存储键值
const KEY_MODE = 'vpp_mode';
const KEY_ACTION = 'vpp_action';

// 状态机核心
let mode = 'auto';    // 'auto' | 'manual'
let action = 'stop';  // 'charge' | 'stop' | 'discharge'

// API接口
function setMode(newMode) { /* 切换模式 */ }
function setAction(newAction) { /* 设置动作 */ }
function getState() { return { mode, action }; }
```

### 2. 收益核算引擎
**文件：** `src/js/services/profit-service.js`
**计算公式规格：**
```javascript
// 核心收益公式
const STEP_HOURS = 5 / 60; // 5分钟步进转小时
const ETA_DISCHARGE = 0.88; // 放电效率88%
const ETA_CHARGE = 1.0; // 充电成本100%

// 计算逻辑
function calculateProfit(price, powerMw, batteryMode) {
    if (batteryMode === 'discharging' && powerMw < 0) {
        // 放电收益 = 价格 × |功率| × 时间 × 效率
        return price * Math.abs(powerMw) * STEP_HOURS * ETA_DISCHARGE;
    } else if (batteryMode === 'charging' && powerMw > 0) {
        // 充电成本 = 价格 × 功率 × 时间 × 1.0
        return -(price * powerMw * STEP_HOURS * ETA_CHARGE);
    }
    return 0;
}

// 日边界重置
function onMidnight() {
    dailyProfit = 0;
    stepCount = 0;
    saveState();
}
```

### 3. 手动控制UI规格
**文件：** `dispatch.html` (运维端页面)
**UI组件规格：**
```html
<!-- VPP Control Panel -->
<div id="vpp-control-panel">
    <h3>🎛️ VPP Control Panel</h3>
    
    <!-- Auto/Manual Toggle -->
    <label>
        <input type="checkbox" id="vpp-mode-toggle">
        <span>AUTO / MANUAL</span>
    </label>
    
    <!-- Action Buttons (仅Manual模式可用) -->
    <div id="vpp-actions">
        <button onclick="VPPControl.setAction('charge')">⚡ Charge</button>
        <button onclick="VPPControl.setAction('stop')">⏸ Stop</button>
        <button onclick="VPPControl.setAction('discharge')">🔋 Discharge</button>
    </div>
    
    <!-- Real-time Metrics -->
    <div id="vpp-metrics">
        <span>实时功率: <span id="vpp-power">0.0</span> MW</span>
        <span>当前电价: <span id="vpp-price">0.0</span> $/MWh</span>
        <span>今日收益: <span id="vpp-profit">$0.00</span></span>
    </div>
</div>
```

### 4. 物理约束保护
**规格要求：**
```javascript
// SoC边界保护
function applySoCBoundary(soc, currentAction) {
    if (soc >= 100 && currentAction === 'charge') {
        return 'stop'; // 强制停止充电
    }
    if (soc <= 0 && currentAction === 'discharge') {
        return 'stop'; // 强制停止放电
    }
    return currentAction;
}

// 网架功率限制
const MAX_POWER_MW = 2.5;
function applyPowerLimit(commandPower) {
    return Math.max(-MAX_POWER_MW, Math.min(MAX_POWER_MW, commandPower));
}
```

### 5. BatteryService集成钩子
**文件：** `src/js/services/battery-service.js`
**钩子函数规格：**
```javascript
// 手动状态设置钩子
function _setManualState(forceMode, forcePower) {
    _manualOverrideActive = true;
    _manualMode = forceMode; // 'charging' | 'discharging' | 'idle'
    _manualPower = forcePower; // MW, +充电 -放电
}

// 清除手动状态钩子
function _clearManualState() {
    _manualOverrideActive = false;
    _manualMode = 'idle';
    _manualPower = 0;
}

// 导出钩子
return {
    // ... 其他API
    _setManualState: _setManualState,
    _clearManualState: _clearManualState
};
```

### 6. 跨标签页同步机制
**规格要求：**
```javascript
// localStorage事件监听
window.addEventListener('storage', function(event) {
    if (event.key === 'vpp_mode' || event.key === 'vpp_action') {
        // 同步状态到当前标签页
        syncStateFromStorage();
        // 更新UI显示
        renderControlState();
    }
});

// 实时同步要求：100ms内跨标签页状态同步
const SYNC_TOLERANCE_MS = 100;
```

## 验收标准
1. **手动模式测试：** 切换到Manual，点击Charge按钮，SoC仪表盘立即开始上升
2. **自动模式测试：** 切换回Auto，系统恢复10点充电/18点放电时间表
3. **边界测试：** SoC到达100%时，Charge按钮自动变为Stop状态
4. **收益精度测试：** 60倍速下，收益累加公式准确无误差
5. **跨标签测试：** 一个标签页点击控制，其他标签页100ms内同步显示
6. **持久化测试：** 页面刷新后，Manual模式和动作状态保持

## 集成约束
- 必须基于现有的`/var/www/au-002/`项目结构
- 必须与TimeManager、MarketService、BatteryService集成
- 必须支持多标签页Master/Slave机制
- 所有localStorage键值前缀为`vpp_`

## 最终交付文件清单
- `src/js/core/control-manager.js` - 控制状态机
- `src/js/services/profit-service.js` - 收益计算引擎
- `pages/operator/dispatch.html` - 运维控制页面
- 修改的现有文件：`src/js/services/battery-service.js`
- 部署地址：`http://49.51.194.118:8082/`

## 完成标志
当实现完成后，必须提供：
1. Auto模式运行截图（按时间表自动充放电）
2. Manual模式截图（手动控制按钮高亮激活）
3. 收益累加截图（实时P&L数字更新）
4. 跨标签页同步截图（两个标签页状态一致）
5. 边界保护截图（SoC=100%时自动Stop）

---
**翻译日期：** 2026-02-28 23:15 GMT+8  
**翻译原则：** 机器可执行，无模糊描述，精确技术规格  
**实际执行状态：** ✅ 已由Opus完成实现（2026-02-28 22:47完成）