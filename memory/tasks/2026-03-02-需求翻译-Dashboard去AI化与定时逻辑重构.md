# 需求翻译文档：Dashboard去AI化与定时逻辑重构

## 📋 原始需求 (基于Gemini分析报告)
将AU-03 dashboard.html从"AI智能托管"模式重构为"定时模式"，清除AI相关UI逻辑，建立"时间+SOC+强制中断"三角约束

## 🎯 核心改版目标
1. **去AI化清理**: 删除所有AI托管相关UI和逻辑
2. **定时逻辑重建**: 基于现有condition-settings-modal构建定时功能
3. **SOC约束植入**: 充电/放电SOC限制的硬约束逻辑
4. **界面重组**: 从"智能托管"改为"定时模式"展示

## 🔧 四项核心任务拆解 (基于Gemini清单)

### DASH-01: 物理清算AI冗余 (P0) - 回应挑战1
#### 目标文件: dashboard.html, header-nav.js
```bash
# AI视觉残留的物理清算（回应Gemini挑战）：
# 1. 物理删除DOM节点：#aiOrbitRobot、#aiOrbitTrack
# 2. 物理删除JavaScript动画函数：orbitRobot()、aiCountdownFlip()
# 3. 清除动画计时器，释放CPU资源
# 4. autoToggleKnob → scheduledToggleKnob（消除Auto词根）

# 执行命令：
grep -n "ai\|AI\|智能托管\|机器人\|orbit" dashboard.html | head -15

# 物理删除DOM节点
sed -i '/<div id="aiOrbitRobot"/,/<\/div>/d' dashboard.html
sed -i '/<div id="aiOrbitTrack"/,/<\/div>/d' dashboard.html

# 删除动画函数和计时器
sed -i '/function orbitRobot/,/^}/d' dashboard.html
sed -i '/function aiCountdownFlip/,/^}/d' dashboard.html
sed -i '/setInterval.*orbitRobot/d' dashboard.html

# 变量名物理更名
sed -i 's/toggleAutoMode/toggleScheduledMode/g' dashboard.html
sed -i 's/autoToggleKnob/scheduledToggleKnob/g' dashboard.html
sed -i 's/智能托管/定时模式/g' dashboard.html
```

### DASH-02: 定时模式界面重组 (P0) - 回应挑战2&4
#### 目标: 基于condition-settings-modal重构主功能
```javascript
// 界面调整：
// 1. 将隐藏的设置按钮移至大圆下方
// 2. 标注为"配置定时方案" 
// 3. 大圆上方智能显示当前状态（解决时空覆盖问题）

// 定时任务显示逻辑（回应挑战2）：
function updateScheduledDisplay() {
    const currentTime = new Date();
    const settings = getScheduleSettings();
    const currentTask = getCurrentActiveTask(currentTime, settings);
    
    let displayText;
    if (currentTask) {
        // 处于定时时段内：显示执行中状态
        displayText = `执行中：${currentTask.action}至 ${currentTask.targetSOC}% SOC`;
    } else {
        // 不处于定时时段：显示下一次任务
        const nextTask = getNextScheduledTask(currentTime, settings);
        displayText = nextTask ? 
            `下一次定时：${nextTask.startTime} 开始${nextTask.action}` :
            "暂无定时任务";
    }
    
    document.getElementById('scheduled-display').textContent = displayText;
}

// 开关语义转换（回应挑战4）：
function toggleScheduledMode() {
    const isCurrentlyScheduled = getScheduledModeStatus();
    
    if (!isCurrentlyScheduled) {
        // 开启定时模式：直接弹出设置模态框确认参数
        showModal('condition-settings-modal', {
            title: '确认启用定时调度方案',
            onConfirm: function() {
                enableScheduledMode();
                updateScheduledDisplay();
            }
        });
    } else {
        // 关闭定时模式：确认弹窗
        showConfirm('确认关闭定时模式？', function() {
            disableScheduledMode();
            updateScheduledDisplay();
        });
    }
}

// 状态映射补充（回应补丁指令3）：
function updateStationStatusLabel(status) {
    const statusMap = {
        idle: getText('dashboard.status.idle'),
        charging: getText('dashboard.status.charging'),
        discharging: getText('dashboard.status.discharging'),
        scheduledCharge: getText('dashboard.status.scheduledCharge'),    // 新增
        scheduledDischarge: getText('dashboard.status.scheduledDischarge') // 新增
    };
    
    document.getElementById('station-status').textContent = statusMap[status] || 'Unknown';
}
```

### DASH-03: SOC动态约束植入 (P1)
#### 目标: station-app.js更新循环中的SOC停止逻辑
```javascript
// 定时模式三角约束逻辑：
function checkScheduledConstraints() {
    const currentTime = new Date();
    const currentSOC = getCurrentSOC();
    const settings = getScheduleSettings();
    
    // 充电约束检查
    if (isInTimeSegment(currentTime, settings.chargeTimeSegments)) {
        if (currentSOC >= settings.chargeStopSOC) {
            stopOperation('charge_soc_reached');
            showNotification(`充电已达${settings.chargeStopSOC}%，自动停止`);
        }
    }
    
    // 放电约束检查  
    if (isInTimeSegment(currentTime, settings.dischargeTimeSegments)) {
        if (currentSOC <= settings.dischargeStopSOC) {
            stopOperation('discharge_soc_reached');
            showNotification(`放电已降至${settings.dischargeStopSOC}%，自动停止`);
        }
    }
    
    // 时间段结束检查
    if (!isInAnyTimeSegment(currentTime, settings)) {
        stopOperation('time_segment_ended');
    }
}

// 手动模式安全垫（回应挑战3：SOC双重拦截）
function safeManualOperation(operation) {
    const currentSOC = getCurrentSOC();
    const settings = getScheduleSettings();
    
    // 充电安全检查
    if (operation === 'charge' && currentSOC >= settings.chargeStopSOC) {
        showAlert({
            type: 'error',
            title: 'SOC已达上限',
            message: `当前SOC已达${currentSOC}%，已触及充电停止限制(${settings.chargeStopSOC}%)。请先修改停止参数或切换至放电模式。`,
            buttons: [
                { text: '修改参数', action: () => showModal('condition-settings-modal') },
                { text: '切换放电', action: () => startDischarge() },
                { text: '取消', action: () => {} }
            ]
        });
        return false;
    }
    
    // 放电安全检查
    if (operation === 'discharge' && currentSOC <= settings.dischargeStopSOC) {
        showAlert({
            type: 'error', 
            title: 'SOC已达下限',
            message: `当前SOC仅剩${currentSOC}%，已触及放电停止限制(${settings.dischargeStopSOC}%)。请先修改停止参数或切换至充电模式。`,
            buttons: [
                { text: '修改参数', action: () => showModal('condition-settings-modal') },
                { text: '切换充电', action: () => startCharge() },
                { text: '取消', action: () => {} }
            ]
        });
        return false;
    }
    
    return true;
}

// 操作按钮点击处理（防止重复点击绕过限制）
function handleManualCharge() {
    if (!safeManualOperation('charge')) {
        return; // 被SOC限制拦截，直接返回
    }
    
    // 通过安全检查，执行充电
    startCharge();
}

function handleManualDischarge() {
    if (!safeManualOperation('discharge')) {
        return; // 被SOC限制拦截，直接返回
    }
    
    // 通过安全检查，执行放电
    startDischarge();
}
```

### DASH-04: i18n文案全面覆盖 (P1) - 回应补丁指令2
#### 目标: components/i18n.js新增定时模式翻译键值
```bash
# i18n物理校验（回应Gemini补丁指令2）：
grep -A5 -B5 "chargeStopSOC\|charge_stop_soc" components/i18n.js
# 如发现已存在键值，必须强制调用，严禁自造

# 检查现有dashboard相关键值
grep -A20 -B5 "dashboard.*:" components/i18n.js
```

```javascript
// 新增翻译键值（zh）：
dashboard: {
    // 现有键值...
    scheduled_mode: "定时模式",
    manual_mode: "手动模式", 
    configure_schedule: "配置定时方案",
    scheduled_task: "定时任务",
    // 注意：如果chargeStopSOC已存在，使用现有键值
    charge_stop_soc: "充电停止SOC",  // 或使用现有chargeStopSOC
    discharge_stop_soc: "放电停止SOC",
    time_segments: "时间段管理",
    next_scheduled: "下一次定时",
    executing: "执行中",
    no_scheduled_task: "暂无定时任务",
    soc_limit_reached: "SOC限制已达到",
    soc_upper_limit: "SOC已达上限", 
    soc_lower_limit: "SOC已达下限",
    modify_parameters: "修改参数",
    switch_to_discharge: "切换放电",
    switch_to_charge: "切换充电",
    
    // 状态映射（回应补丁指令3）：
    status: {
        idle: "待机",
        charging: "充电中",
        discharging: "放电中", 
        scheduledCharge: "定时充电中",
        scheduledDischarge: "定时放电中"
    }
}

// 新增翻译键值（en）：
dashboard: {
    // 现有键值...
    scheduled_mode: "Scheduled Mode",
    manual_mode: "Manual Mode",
    configure_schedule: "Configure Schedule", 
    scheduled_task: "Scheduled Task",
    charge_stop_soc: "Charge Stop SOC",
    discharge_stop_soc: "Discharge Stop SOC",
    time_segments: "Time Segments",
    next_scheduled: "Next Scheduled",
    executing: "Executing",
    no_scheduled_task: "No Scheduled Task",
    soc_limit_reached: "SOC Limit Reached",
    soc_upper_limit: "SOC Upper Limit Reached",
    soc_lower_limit: "SOC Lower Limit Reached", 
    modify_parameters: "Modify Parameters",
    switch_to_discharge: "Switch to Discharge",
    switch_to_charge: "Switch to Charge",
    
    // 状态映射：
    status: {
        idle: "Idle",
        charging: "Charging",
        discharging: "Discharging",
        scheduledCharge: "Scheduled Charging", 
        scheduledDischarge: "Scheduled Discharging"
    }
}
```

## 📊 技术实现方案

### 核心架构调整
1. **现有基础**: condition-settings-modal.js已有定时设置基础
2. **主要改动**: 将隐藏功能提升为主功能，去除AI包装
3. **约束逻辑**: 每分钟检查时间段+SOC双重条件
4. **安全机制**: 手动操作时SOC安全垫提醒

### 数据结构设计  
```javascript
// 定时设置数据结构
const scheduleSettings = {
    chargeTimeSegments: [
        {start: "22:00", end: "06:00"}  // 夜间充电
    ],
    dischargeTimeSegments: [
        {start: "17:00", end: "21:00"}  // 晚峰放电
    ],
    chargeStopSOC: 90,    // 充电停止SOC
    dischargeStopSOC: 20, // 放电停止SOC
    mode: "scheduled"     // scheduled | manual
};
```

### UI界面调整
- **开关按钮**: "智能托管" → "定时模式"
- **设置入口**: 齿轮按钮移至大圆下方，文字"配置定时方案"  
- **状态显示**: 大圆上方显示当前定时任务
- **模态框**: 基于现有condition-settings-modal扩展

## ✅ 验证要求 (回应Gemini审计挑战)

### 强制验证1: AI元素物理清除
```bash
# AI视觉残留检查
grep "ai\|AI\|智能\|机器人\|orbit" dashboard.html
# 必须返回空结果或仅存在注释

# DOM节点物理删除验证
grep "#aiOrbitRobot\|#aiOrbitTrack" dashboard.html
# 必须返回空结果

# 动画函数清除验证
grep "function orbitRobot\|function aiCountdownFlip" dashboard.html
# 必须返回空结果
```

### 强制验证2: 定时显示逻辑
- **时间段内**: 显示"执行中：充电至90% SOC"
- **时间段外**: 显示"下一次定时：22:00 开始充电" 
- **无任务时**: 显示"暂无定时任务"（严禁显示空字符串）

### 强制验证3: SOC双重拦截机制
- **定时模式**: 充电达90%自动停止，放电至20%自动停止
- **手动安全**: 再次点击受限操作时弹出红色警告，提供[修改参数][切换模式][取消]选项
- **防绕过**: 连续点击充电按钮不能绕过SOC限制

### 强制验证4: 开关语义转换
- **开启定时**: 点击后直接弹出condition-settings-modal确认参数
- **关闭定时**: 弹出确认对话框
- **变量更名**: autoToggleKnob → scheduledToggleKnob

### 强制验证5: i18n完整覆盖
- **现有键值**: 强制使用i18n.js中已存在的chargeStopSOC键值
- **状态映射**: scheduledCharge/scheduledDischarge状态正确显示
- **英文切换**: 所有新增功能100%翻译，包括错误提示

## ⚠️ 潜在风险
- condition-settings-modal.js可能与主界面集成复杂
- 定时检查逻辑可能影响性能（需要每分钟轮询）
- SOC约束可能与现有充放电逻辑冲突
- 大量UI改动可能影响现有页面稳定性

## 🎯 预期输出 (全面回应Gemini四项挑战)

### ✅ 物理AI清算完成
- DOM节点物理删除：#aiOrbitRobot、#aiOrbitTrack完全清除
- JavaScript函数物理删除：orbitRobot()、aiCountdownFlip()及相关计时器
- 变量语义转换：autoToggleKnob → scheduledToggleKnob
- CPU资源释放：无AI动画残留消耗

### ✅ 定时显示智能化
- 时空覆盖问题解决：根据当前时间智能显示状态
- 执行中显示：实时任务状态
- 待机显示：下一次定时任务预告
- 空状态处理：显示"暂无定时任务"，绝不显示空字符串

### ✅ SOC双重拦截机制
- 定时自动停止：达到SOC限制自动停止操作
- 手动安全垫：受限操作弹出红色警告，提供解决方案
- 防绕过设计：连续点击不能绕过SOC限制
- 用户引导：引导修改参数或切换操作模式

### ✅ 开关语义完全转换
- 点击逻辑重写：开启时直接弹出参数确认模态框
- 确认机制：关闭时弹出确认对话框
- 语义清晰：从"智能托管"转为"定时调度方案"

### ✅ i18n键值规范使用
- 现有键值优先：强制使用已存在的chargeStopSOC等键值
- 状态映射完整：scheduledCharge/scheduledDischarge状态支持
- 错误提示翻译：所有警告和错误信息支持中英文
- 基于现有模态框的流畅设置界面