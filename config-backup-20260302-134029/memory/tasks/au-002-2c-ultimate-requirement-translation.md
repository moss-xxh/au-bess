# AU-002阶段2C终极版需求翻译文档

## 原始需求来源
- 时间：2026-02-28 23:45:23 GMT+8
- 来源：Gemini风格终极集成指令
- 需求标题：AU-002阶段2C终极总攻：视觉重塑与自动化硬核审计
- 执行方式：Option B完全重做，废弃现有2C版本

## Gemini原版特征分析
- ✅ 激励语言：已删除（"毕其功于一役"、"品牌感拉满"等表达）
- ✅ 审核管理语：已删除（"直接投喂OpenClaw"、"您是否同意总攻"等指令）
- ✅ 高层需求：已具体化（从"顶级视觉规范"到具体的flex-shrink保护机制）
- ✅ 模糊描述：已精确化（Logo保护、4Hz刷新频率、审计脚本等）

## 翻译后技术规格

### 1. 品牌与顶部导航钢结构
**架构要求：**
```html
<header id="main-header">
    <div class="header-left">
        <!-- Logo保护舱 -->
        <div class="logo-container" style="flex-shrink: 0; height: 40px;">
            <img src="logo.png" style="height: 40px; width: auto; object-fit: contain;">
        </div>
        <h1>澳洲储能电站 (Australia Energy Storage Power Station)</h1>
    </div>
    
    <nav class="header-center">
        <a href="#/operator/dispatch">调度中心</a>
        <a href="#/owner/dashboard">安全看板</a>
    </nav>
    
    <div class="header-right">
        <div class="sim-controls">[仿真时间/倍率]</div>
        <div class="lang-switcher">[语言切换]</div>
        <div class="role-switcher">[角色切换]</div>
    </div>
</header>
```

**CSS强制规范：**
```css
.logo-container {
    flex-shrink: 0 !important;
    min-width: 120px;
    height: 40px;
    overflow: hidden;
}

.logo-container img {
    height: 40px;
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
}

/* 禁止Logo变形的陷阱样式 */
.header-left { flex-shrink: 0; }
.header-center { flex: 1; min-width: 0; }
.header-right { flex-shrink: 0; }
```

### 2. 侧边栏彻底铲除
**清理要求：**
- 删除所有sidebar相关CSS类和DOM结构
- 删除sidebar相关JavaScript事件监听
- 移除sidebar路由和状态管理代码
- 更新页面布局为单栏布局（header + main content）

### 3. MasterLock防闪烁机制增强
**文件：** `src/js/core/master-lock-enhanced.js`
**技术规格：**
```javascript
const UI_UPDATE_FREQUENCY = 250; // 强制4Hz刷新
const MASTER_HEARTBEAT = 1000; // 1秒心跳
const LOCK_TIMEOUT = 3000; // 3秒锁超时

class MasterLockEnhanced {
    constructor() {
        this.ismaster = false;
        this.lastUpdate = 0;
        this.updateQueue = new Map();
    }
    
    // 强制节流更新
    scheduleUpdate(elementId, newValue) {
        if (Date.now() - this.lastUpdate < UI_UPDATE_FREQUENCY) {
            this.updateQueue.set(elementId, newValue);
            return;
        }
        this.flushUpdates();
    }
    
    flushUpdates() {
        this.updateQueue.forEach((value, elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value; // 强制使用textContent
            }
        });
        this.updateQueue.clear();
        this.lastUpdate = Date.now();
    }
}
```

### 4. 防溢出弹性盒模型
**CSS规范：**
```css
/* 自适应文本容器 */
.metric-card, .status-item, .nav-item {
    min-width: 120px; /* 支持英文长文本 */
    flex: 0 1 auto; /* 不收缩但可扩展 */
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 多语言容器规范 */
.i18n-container {
    min-width: 100px;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 英文长文本应急撑开 */
.header-right .lang-switcher,
.header-right .role-switcher {
    min-width: 80px;
    flex-shrink: 0;
}
```

### 5. 自动化审计脚本
**文件：** `src/tools/css-layout-auditor.js`
**审计规格：**
```javascript
// CSS Layout Auditor
function auditLayoutRisks() {
    const riskyProperties = [
        'width: 100%',
        'flex: 1',
        'max-width: none',
        'overflow: visible'
    ];
    
    // 扫描CSS文件中的风险属性
    const cssFiles = getAllCSSFiles();
    const risks = [];
    
    cssFiles.forEach(file => {
        const content = readFile(file);
        riskyProperties.forEach(prop => {
            if (content.includes(prop)) {
                risks.push(`${file}: Contains ${prop}`);
            }
        });
    });
    
    return risks;
}
```

**文件：** `src/tools/i18n-stress-tester.js`
**压力测试规格：**
```javascript
// i18n Stress Tester
const STRESS_STRINGS = {
    'nav.dispatch': 'Dispatch Control Center Management',
    'nav.dashboard': 'Owner Safety Dashboard Overview',
    'profit.daily': 'Total Accumulated Revenue for Today',
    'battery.soc': 'State of Charge Percentage Level',
    'vpp.manual.mode': 'Manual Override Control Mode Active'
};

function stressTestLayout() {
    // 注入超长字符串
    Object.keys(STRESS_STRINGS).forEach(key => {
        I18n.forceTranslation(key, STRESS_STRINGS[key]);
    });
    
    // 检查布局是否崩塌
    const layoutBreaks = checkLayoutIntegrity();
    return layoutBreaks;
}
```

### 6. 角色无缝切换增强
**文件：** `src/js/core/role-switcher-enhanced.js`
**切换规格：**
```javascript
function switchRole(newRole) {
    // 1. 保存当前状态
    saveCurrentState();
    
    // 2. 销毁现有图表和组件
    disposeAllCharts();
    clearAllTimers();
    
    // 3. 更新认证状态
    Auth.updateRole(newRole);
    
    // 4. 重新加载对应视图
    Router.navigate(getDefaultRouteForRole(newRole));
    
    // 5. 重新初始化服务
    reinitializeServices();
    
    // 6. 验证切换完成
    validateRoleSwitchComplete(newRole);
}
```

### 7. 项目名称标准化
**强制要求：**
- 官方名称：`澳洲储能电站 (Australia Energy Storage Power Station)`
- 禁止使用：VPP、Virtual Power Plant等非官方称呼
- 所有页面标题、文档、注释必须使用官方名称
- 英文版本必须保持`Australia Energy Storage`完整写法

## 验收标准
1. **Logo保护测试：** 窗口缩放到最小宽度，Logo依然40px高度不变形
2. **长文本测试：** 切换到英文，所有文本容器自动撑开无重叠
3. **侧边栏清理测试：** 全站无任何侧边栏残留代码或样式
4. **4Hz刷新测试：** 60倍速下数字每250ms更新一次，平滑不闪烁
5. **角色切换测试：** Operator⟷Owner切换无刷新，图表正确重建
6. **审计脚本测试：** CSS Layout Auditor + i18n Stress Tester输出通过报告
7. **品牌一致性测试：** 全站使用统一的官方项目名称

## 集成约束
- 必须保持2B阶段的手动控制功能完整性
- 必须支持现有的Master/Slave多标签页机制
- 必须兼容现有的TimeManager、MarketService、BatteryService
- 所有localStorage键值前缀为`au002_`
- ECharts图表必须正确dispose和重建

## 最终交付文件清单
**新增文件：**
- `src/js/core/master-lock-enhanced.js` - 增强版Master锁定
- `src/js/core/role-switcher-enhanced.js` - 增强版角色切换
- `src/tools/css-layout-auditor.js` - CSS布局审计工具
- `src/tools/i18n-stress-tester.js` - 多语言压力测试工具

**重构文件：**
- `index.html` - 顶部导航架构重建
- `src/css/global.css` - Logo保护+防溢出样式规范
- `js/auth.js` - 移除登录角色选择逻辑
- `js/router.js` - 单栏布局适配
- 所有页面模板 - 侧边栏彻底清理

**部署要求：**
- 部署地址：`http://49.51.194.118:8082/`
- 必须通过CSS Layout Auditor检测
- 必须通过i18n Stress Tester检测

## 完成标志
当实现完成后，必须提供：
1. Logo保护演示截图（窗口缩放测试）
2. 英文长文本布局截图（容器自适应）
3. 顶部导航完整截图（三段式布局）
4. 角色切换无刷新演示截图
5. CSS Layout Auditor输出报告
6. i18n Stress Tester输出报告
7. 60倍速4Hz刷新演示截图

---
**翻译日期：** 2026-02-28 23:47 GMT+8  
**翻译原则：** 机器可执行，像素级精确，品牌标准严格  
**执行方式：** 完全重做，废弃现有2C版本