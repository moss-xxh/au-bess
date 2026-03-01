# AU-002阶段2C清场重建需求翻译文档

## 原始需求来源
- 时间：2026-02-28 23:50:44 GMT+8
- 来源：用户视觉审计失败反馈 + 清场重建指令
- 需求标题：登录流程重构 + UI架构彻底整容 + 物理清除sidebar
- 执行方式：暴力清理，从零重建

## 失败原因分析
- ❌ 当前实现：侧边栏未清理，Header重复渲染，项目名称错误
- ❌ 根本原因：在旧代码基础上打补丁，新旧代码混合产生"怪胎"
- ✅ 解决方案：物理删除sidebar代码，重建登录选角色流程

## Gemini原版特征分析
- ✅ 激励语言：已删除（"手术"、"清场"等表达）
- ✅ 审核管理语：已删除（"投喂OpenClaw"等指令语言）  
- ✅ 高层需求：已具体化（从"登录选角色"到具体的大图标UI）
- ✅ 模糊描述：已精确化（物理删除sidebar、Logo绝对保护等）

## 翻译后技术规格

### 1. 登录流程重构
**登录页改造（pages/login.html）：**
```html
<div class="login-container">
    <!-- 项目标题 -->
    <h1>澳洲储能电站</h1>
    <h2>Australia Energy Storage Power Station</h2>
    
    <!-- 登录表单 -->
    <form class="login-form">
        <input type="text" placeholder="用户名 / Username" />
        <input type="password" placeholder="密码 / Password" />
        <button type="submit">登录 / Sign In</button>
    </form>
    
    <!-- 角色选择区域（登录成功后显示） -->
    <div class="role-selection" style="display: none;">
        <h3>选择角色 / Select Role</h3>
        <div class="role-cards">
            <div class="role-card" data-role="operator">
                <div class="role-icon">👨‍💼</div>
                <h4>操作员</h4>
                <p>Operator</p>
                <span>设备调度与维护</span>
            </div>
            <div class="role-card" data-role="owner">
                <div class="role-icon">👨‍💻</div>
                <h4>所有者</h4>
                <p>Owner</p>
                <span>投资看板与收益</span>
            </div>
        </div>
    </div>
    
    <!-- 语言切换（底部） -->
    <div class="language-switcher">
        <button data-lang="en">English</button>
        <button data-lang="zh">中文</button>
    </div>
</div>
```

**登录逻辑规格：**
```javascript
// 登录成功后显示角色选择
function onLoginSuccess() {
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.role-selection').style.display = 'block';
}

// 角色选择完成后跳转
function selectRole(role) {
    Auth.login(username, role);
    const defaultRoute = Auth.getDefaultRoute(); // 获取角色默认页面
    Router.navigate(defaultRoute);
}
```

### 2. Sidebar物理清除
**删除文件清单：**
- `src/css/sidebar.css` - 如果存在，完全删除
- `src/js/components/sidebar.js` - 如果存在，完全删除  
- `components/sidebar-navigation.js` - 如果存在，完全删除

**清理代码规格：**
```bash
# 搜索并删除所有sidebar相关代码
grep -r "sidebar\|side-bar\|sidenav" /var/www/au-002/ --exclude-dir=node_modules
# 删除包含以下类名的CSS规则：
# .sidebar, .side-bar, .sidenav, .nav-sidebar, .sidebar-nav
```

**页面布局重构：**
```css
/* 新的页面布局：仅 header + main */
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.main-header {
    flex-shrink: 0;
    height: 60px;
}

.main-content {
    flex: 1;
    overflow: auto;
    width: 100%; /* 占满全宽，无sidebar挤压 */
}
```

### 3. Logo绝对保护机制
**Logo保护舱CSS：**
```css
.logo-container {
    position: relative;
    flex-shrink: 0 !important;
    width: 160px; /* 固定宽度 */
    height: 40px;
    overflow: hidden;
}

.logo-container img {
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    width: auto;
    object-fit: contain;
    max-width: none; /* 防止被压缩 */
}

/* 防止任何外部样式影响Logo */
.header-left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}
```

### 4. 项目名称全站替换
**强制替换规格：**
```javascript
// 全站搜索替换
const WRONG_NAMES = [
    "虚拟电厂", "VPP", "Virtual Power Plant",
    "虚拟发电厂", "虚拟电站"
];

const CORRECT_NAME_ZH = "澳洲储能电站";
const CORRECT_NAME_EN = "Australia Energy Storage Power Station";

// 替换所有HTML文件中的错误名称
function replaceProjectNames() {
    // 扫描所有HTML、JS、CSS文件
    // 将错误名称替换为正确名称
}
```

### 5. 顶部导航架构
**三段式Header布局：**
```html
<header class="main-header">
    <div class="header-left">
        <div class="logo-container">
            <img src="assets/logo.png" alt="澳洲储能电站">
        </div>
        <h1 class="project-title">澳洲储能电站</h1>
    </div>
    
    <nav class="header-center">
        <a href="#/operator/dispatch" class="nav-item">调度中心</a>
        <a href="#/owner/dashboard" class="nav-item">安全看板</a>
    </nav>
    
    <div class="header-right">
        <div class="sim-controls">
            <span id="sim-time">2024-01-15 14:30</span>
            <select id="sim-speed">
                <option value="1">1x</option>
                <option value="10">10x</option>
                <option value="60">60x</option>
            </select>
        </div>
        <div class="language-switcher">
            <button data-lang="en">EN</button>
            <button data-lang="zh">中文</button>
        </div>
    </div>
</header>
```

### 6. 系统内语言切换
**i18n集成规格：**
```javascript
// Header内的语言切换功能激活
document.querySelectorAll('.language-switcher button').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        I18n.setLanguage(lang);
        localStorage.setItem('au002_language', lang);
        // 重新渲染所有i18n元素
        I18n.updateDOM();
    });
});
```

### 7. 权限路由系统
**角色路由规格：**
```javascript
const ROLE_ROUTES = {
    operator: {
        default: '/operator/dispatch',
        allowed: ['/operator/dispatch', '/operator/maintenance']
    },
    owner: {
        default: '/owner/dashboard', 
        allowed: ['/owner/dashboard', '/owner/reports']
    }
};

// 角色权限检查
function checkRoutePermission(path, userRole) {
    const roleConfig = ROLE_ROUTES[userRole];
    return roleConfig && roleConfig.allowed.includes(path);
}
```

## 验收标准
1. **登录流程测试：** 登录成功后显示角色选择，选择后正确跳转到对应页面
2. **Sidebar清理测试：** 全站搜索无任何sidebar相关代码残留
3. **Logo保护测试：** 窗口缩放时Logo保持40px高度，不变形
4. **项目名称测试：** 全站使用"澳洲储能电站"，无"虚拟电厂"残留  
5. **顶部导航测试：** 三段式Header布局完整，功能正常
6. **语言切换测试：** Header内语言切换器功能激活，全站文字正确翻译
7. **权限路由测试：** 不同角色只能访问允许的页面

## 集成约束
- 必须保持2B阶段手动控制功能完整性
- 必须兼容现有TimeManager、MarketService、BatteryService
- localStorage键值前缀统一为au002_
- ECharts图表在页面切换时正确dispose和重建

## 最终交付文件清单
**重建文件：**
- `pages/login.html` - 重建登录页面（含角色选择）
- `index.html` - 重建主页面（三段式Header）
- `src/css/layout.css` - 重建布局样式（无sidebar）
- `js/auth.js` - 重建认证逻辑（角色路由）
- `js/router.js` - 适配新的权限路由

**删除文件：** 
- 所有sidebar相关CSS/JS文件

**部署地址：** `http://49.51.194.118:8082/`

## 完成标志
当实现完成后，必须提供：
1. 登录页面截图（含角色选择区域）
2. 操作员页面截图（顶部导航布局）
3. 所有者页面截图（确认无sidebar） 
4. Logo保护测试截图（窗口缩放）
5. 项目名称确认截图（无错误名称）
6. 语言切换功能截图
7. 清理确认：sidebar代码搜索结果为空

---
**翻译日期：** 2026-02-28 23:51 GMT+8  
**翻译原则：** 物理删除，从零重建，杜绝补丁代码  
**执行方式：** 暴力清理，先登录选角色，再进入系统