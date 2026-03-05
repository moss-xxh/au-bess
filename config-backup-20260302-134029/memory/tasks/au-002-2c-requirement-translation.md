# AU-002阶段2C需求翻译文档

## 原始需求来源
- 时间：2026-02-28 23:04:08 GMT+8
- 来源：Gemini风格需求描述
- 需求标题：AU-002阶段2C - 全量UX升级方案

## Gemini原版特征分析
- ✅ 激励语言：已删除（"薛总非常到位"、"趁热打铁"等表达）
- ✅ 审核管理语：已删除（"请直接下令"等指令语言）
- ✅ 高层需求：已具体化（从"解决忽闪"到具体的Master锁定机制）

## 翻译后技术规格

### 1. Master强锁定机制
**文件：** `src/js/core/master-lock.js`
**功能规格：**
```javascript
// 锁定机制
const LOCK_KEY = 'au002_master_lock';
const HEARTBEAT_INTERVAL = 1000; // 1秒心跳
const LOCK_TIMEOUT = 3000; // 3秒超时

// 竞争逻辑
function acquireLock() {
    const timestamp = Date.now();
    const lockData = { timestamp, sessionId: generateSessionId() };
    localStorage.setItem(LOCK_KEY, JSON.stringify(lockData));
    return true;
}

// 渲染频率限制
const UI_UPDATE_INTERVAL = 250; // 250ms = 4Hz
```

### 2. Header驾驶舱改造
**文件：** `src/js/core/user-preferences.js` + Header组件
**UI规格：**
```html
<div id="system-settings" style="display: flex; gap: 16px;">
    <div id="role-switcher">
        <label>Role:</label>
        <select id="role-select">
            <option value="operator">Operator</option>
            <option value="owner">Owner</option>
        </select>
    </div>
    <div id="language-switcher">
        <label>Language:</label>
        <select id="lang-select">
            <option value="en">English</option>
            <option value="zh">中文</option>
        </select>
    </div>
</div>
```

### 3. 多语言系统
**文件：** `src/js/core/i18n-enhanced.js`
**数据结构：**
```javascript
const TRANSLATIONS = {
    en: {
        "vpp.control.panel": "VPP Control Panel",
        "vpp.mode.auto": "AUTO",
        "vpp.mode.manual": "MANUAL",
        "vpp.action.charge": "Charge",
        "vpp.action.stop": "Stop",
        "vpp.action.discharge": "Discharge",
        "profit.daily": "Daily P&L"
    },
    zh: {
        "vpp.control.panel": "VPP控制面板",
        "vpp.mode.auto": "自动",
        "vpp.mode.manual": "手动",
        "vpp.action.charge": "充电",
        "vpp.action.stop": "停止",
        "vpp.action.discharge": "放电",
        "profit.daily": "日收益"
    }
};
```

### 4. DOM更新优化
**规格要求：**
- 所有数字显示使用`element.textContent = newValue`
- 禁用`element.innerHTML`避免重绘
- 实现数值渐进过渡：`animateNumber(fromValue, toValue, duration)`

### 5. ECharts内存管理
**规格要求：**
```javascript
// 角色切换时的清理流程
function switchRole(newRole) {
    // 1. 销毁现有图表
    if (currentChart && !currentChart.isDisposed()) {
        currentChart.dispose();
        currentChart = null;
    }
    
    // 2. 清理事件监听
    removeAllChartListeners();
    
    // 3. 重建图表
    initChartForRole(newRole);
}
```

## 验收标准
1. **多标签测试：** 打开2个标签页，只有一个标签页的数字在变化（Master），另一个标签页跟随显示（Slave）
2. **角色切换测试：** Header点击切换，页面内容动态变化，无刷新
3. **语言切换测试：** 所有文字实时翻译，包括按钮、标签、数值单位
4. **60倍速测试：** 高倍速下数字平滑变化，250ms刷新率
5. **内存测试：** 角色切换多次后，浏览器内存使用稳定

## 集成约束
- 必须保持AU-002阶段2B的手动控制功能完整性
- 业主看板保持简洁大仪表盘风格
- 运维调度保持专业多维数据展示
- 所有localStorage键值前缀为`au002_`

## 最终交付文件清单
- `src/js/core/master-lock.js` - Master锁定机制
- `src/js/core/user-preferences.js` - 用户偏好管理
- `src/js/core/i18n-enhanced.js` - 多语言系统
- 修改的现有文件：`index.html`, Header组件, Router组件
- 部署地址：`http://49.51.194.118:8082/`

## 完成标志
当Opus执行完成后，必须提供：
1. 多标签页Master/Slave演示截图
2. 角色切换演示截图（Operator⟷Owner）
3. 语言切换演示截图（English⟷中文）
4. 60倍速下平滑数字变化演示

---
**翻译日期：** 2026-02-28 23:10 GMT+8  
**翻译原则：** 机器可执行，无模糊描述，精确技术规格