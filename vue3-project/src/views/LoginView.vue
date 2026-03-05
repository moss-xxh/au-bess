<template>
    <!-- Background Layer with VPP Elements -->
    <div class="background-layer">
        <!-- Grid Pattern -->
        <div class="grid-pattern"></div>
        
        <!-- VPP Elements -->
        <div class="vpp-elements">
            <!-- Solar Panel -->
            <div class="vpp-element solar-panel">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <rect x="10" y="30" width="80" height="50" rx="2" stroke-width="2"/>
                    <line x1="10" y1="45" x2="90" y2="45" stroke-width="1.5"/>
                    <line x1="10" y1="60" x2="90" y2="60" stroke-width="1.5"/>
                    <line x1="30" y1="30" x2="30" y2="80" stroke-width="1.5"/>
                    <line x1="50" y1="30" x2="50" y2="80" stroke-width="1.5"/>
                    <line x1="70" y1="30" x2="70" y2="80" stroke-width="1.5"/>
                </svg>
            </div>
            
            <!-- Wind Turbine -->
            <div class="vpp-element wind-turbine">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <line x1="50" y1="40" x2="50" y2="85" stroke-width="3"/>
                    <circle cx="50" cy="40" r="3" fill="currentColor"/>
                    <path class="turbine-blade" d="M50 40 L50 15 Q48 10 45 12 Q42 14 45 20 L50 40" stroke-width="2" fill="currentColor" opacity="0.3"/>
                    <path class="turbine-blade" d="M50 40 L70 50 Q75 52 73 55 Q71 58 65 55 L50 40" stroke-width="2" fill="currentColor" opacity="0.3"/>
                    <path class="turbine-blade" d="M50 40 L30 50 Q25 52 27 55 Q29 58 35 55 L50 40" stroke-width="2" fill="currentColor" opacity="0.3"/>
                </svg>
            </div>
            
            <!-- Battery -->
            <div class="vpp-element battery">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <rect x="25" y="20" width="50" height="60" rx="4" stroke-width="2"/>
                    <rect x="35" y="12" width="30" height="8" rx="2" stroke-width="2" fill="currentColor" opacity="0.3"/>
                    <rect x="35" y="30" width="30" height="10" fill="currentColor" opacity="0.5" class="battery-level"/>
                    <rect x="35" y="45" width="30" height="10" fill="currentColor" opacity="0.5" class="battery-level"/>
                    <rect x="35" y="60" width="30" height="10" fill="currentColor" opacity="0.5" class="battery-level"/>
                </svg>
            </div>
            
            <!-- Energy Grid -->
            <div class="vpp-element energy-grid">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="30" stroke-width="2" stroke-dasharray="5 5" opacity="0.3"/>
                    <circle cx="50" cy="50" r="20" stroke-width="2" stroke-dasharray="3 3" opacity="0.5"/>
                    <circle cx="50" cy="50" r="10" stroke-width="2" opacity="0.7"/>
                    <circle cx="50" cy="50" r="3" fill="currentColor" class="pulse"/>
                </svg>
            </div>
            
            <!-- Smart Home -->
            <div class="vpp-element smart-home">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M50 15 L20 40 L20 75 L80 75 L80 40 Z" stroke-width="2"/>
                    <path d="M35 75 L35 55 L65 55 L65 75" stroke-width="2"/>
                    <rect x="40" y="40" width="8" height="8" stroke-width="1.5"/>
                    <rect x="52" y="40" width="8" height="8" stroke-width="1.5"/>
                    <circle cx="50" cy="65" r="3" fill="currentColor" class="pulse"/>
                </svg>
            </div>
            
            <!-- EV Charging Station -->
            <div class="vpp-element ev-station">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <rect x="30" y="40" width="40" height="50" rx="4" stroke-width="2"/>
                    <rect x="40" y="30" width="20" height="10" rx="2" stroke-width="2"/>
                    <path d="M45 55 L55 55 L50 65 L55 65 L45 75 L50 65 L45 65 Z" stroke-width="1.5" fill="currentColor" opacity="0.5"/>
                    <line x1="70" y1="60" x2="85" y2="60" stroke-width="2"/>
                    <circle cx="85" cy="60" r="8" stroke-width="2"/>
                </svg>
            </div>
            
            <!-- Data Center -->
            <div class="vpp-element data-center">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <rect x="25" y="20" width="50" height="60" rx="2" stroke-width="2"/>
                    <rect x="30" y="25" width="40" height="8" rx="1" stroke-width="1.5" class="server-rack"/>
                    <rect x="30" y="36" width="40" height="8" rx="1" stroke-width="1.5" class="server-rack"/>
                    <rect x="30" y="47" width="40" height="8" rx="1" stroke-width="1.5" class="server-rack"/>
                    <rect x="30" y="58" width="40" height="8" rx="1" stroke-width="1.5" class="server-rack"/>
                    <rect x="30" y="69" width="40" height="8" rx="1" stroke-width="1.5" class="server-rack"/>
                    <circle cx="35" cy="29" r="1.5" fill="currentColor" class="blink"/>
                    <circle cx="35" cy="40" r="1.5" fill="currentColor" class="blink" style="animation-delay: 0.2s"/>
                    <circle cx="35" cy="51" r="1.5" fill="currentColor" class="blink" style="animation-delay: 0.4s"/>
                </svg>
            </div>
            
            <!-- Power Transmission Tower -->
            <div class="vpp-element transmission-tower">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M40 85 L45 60 L35 40 L45 20 L50 10 L55 20 L65 40 L55 60 L60 85" stroke-width="2"/>
                    <line x1="35" y1="40" x2="65" y2="40" stroke-width="2"/>
                    <line x1="45" y1="20" x2="55" y2="20" stroke-width="2"/>
                    <line x1="10" y1="30" x2="35" y2="40" stroke-width="1.5" class="power-line"/>
                    <line x1="65" y1="40" x2="90" y2="30" stroke-width="1.5" class="power-line"/>
                </svg>
            </div>
        </div>
        
        <!-- Energy Particles -->
        <div class="energy-particles">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>
        
        <!-- Connection Lines -->
        <svg class="connection-network" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:rgba(0,255,136,0);stop-opacity:1" />
                    <stop offset="50%" style="stop-color:rgba(0,255,136,0.3);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(0,255,136,0);stop-opacity:1" />
                </linearGradient>
            </defs>
            <path class="energy-flow" d="M20,30 Q50,40 80,20" stroke="url(#lineGradient)" stroke-width="0.2" fill="none"/>
            <path class="energy-flow" d="M10,60 Q40,50 70,70" stroke="url(#lineGradient)" stroke-width="0.2" fill="none" style="animation-delay: 1s"/>
            <path class="energy-flow" d="M30,80 Q60,70 90,85" stroke="url(#lineGradient)" stroke-width="0.2" fill="none" style="animation-delay: 2s"/>
        </svg>
    </div>

    <!-- Language Switcher -->
    <div class="language-switcher">
        <button class="lang-btn" id="langSwitcher" @click="toggleLanguage">
            <span class="lang-text" :class="{ active: currentLang === 'en' }">EN</span>
            <span class="lang-separator">|</span>
            <span class="lang-text" :class="{ active: currentLang === 'zh' }">中文</span>
        </button>
    </div>

    <!-- Main Container -->
    <div class="main-container">
        <div class="content-wrapper">
            <!-- Left VPP Content -->
            <div class="vpp-content">
                <div class="vpp-brand-group">
                    <img :src="logoPath" alt="VPP" class="logo">
                    <div class="vpp-text-group">
                        <h1 class="vpp-title" >{{ t.vppTitle }}</h1>
                        <p class="vpp-subtitle" >{{ t.vppSubtitle }}</p>
                    </div>
                </div>
            </div>

            <!-- Right Login Panel -->
            <div class="login-panel glass-panel">
                <!-- Auth Container -->
                <div class="auth-container">
                    <!-- Login Form -->
                    <div v-show="currentForm === 'login'" id="loginForm" class="auth-section active">
                        <h2 class="auth-title" >{{ t.signIn }}</h2>
                        
                        <form @submit.prevent="handleLogin" class="auth-form">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.username }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="loginForm.email" 
                                    type="text" 
                                    id="loginEmail" 
                                    :placeholder="t.usernamePlaceholder"
                                    required 
                                    value="admin@xuheng.com"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.password }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="loginForm.password" 
                                    type="password" 
                                    id="loginPassword" 
                                    :placeholder="t.passwordPlaceholder"
                                    required 
                                    value="xuheng123"
                                >
                            </div>
                            
                            <!-- Math Captcha (disabled) -->
                            <div class="form-group" style="display: none;">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.captcha }}</span>
                                    <span class="required">*</span>
                                </label>
                                <div class="captcha-container">
                                    <input type="text" id="loginCaptchaAnswer" class="captcha-input" :placeholder="t.captchaPlaceholder">
                                    <div class="captcha-question" id="loginCaptchaQuestion" title="Click to refresh"></div>
                                </div>
                            </div>
                            
                            <div class="form-links">
                                <a href="#" @click.prevent="switchForm('forgot')" class="link" id="forgotLink" >{{ t.forgotPassword }}</a>
                                <a href="#" @click.prevent="switchForm('register')" class="link" id="registerLink" >{{ t.userRegister }}</a>
                            </div>
                            
                            <button type="submit" class="submit-btn" >{{ t.submitLogin }}</button>
                        </form>
                        
                    </div>

                    <!-- Register Form -->
                    <div v-show="currentForm === 'register'" id="registerForm" class="auth-section">
                        <h2 class="auth-title" >{{ t.createAccount }}</h2>
                        
                        <form @submit.prevent="handleRegister" class="auth-form">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.account }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="registerForm.account" 
                                    type="text" 
                                    id="registerAccount" 
                                    :placeholder="t.accountPlaceholder"
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.email }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="registerForm.email" 
                                    type="email" 
                                    id="registerEmail" 
                                    :placeholder="t.emailPlaceholder"
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.password }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="registerForm.password" 
                                    type="password" 
                                    id="registerPassword" 
                                    :placeholder="t.passwordPlaceholder"
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.confirmPassword }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="registerForm.confirmPassword" 
                                    type="password" 
                                    id="confirmPassword" 
                                    :placeholder="t.confirmPasswordPlaceholder"
                                    required
                                >
                            </div>
                            
                            <!-- Math Captcha -->
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.captcha }}</span>
                                    <span class="required">*</span>
                                </label>
                                <div class="captcha-container">
                                    <input type="text" id="registerCaptchaAnswer" class="captcha-input" :placeholder="t.captchaPlaceholder" required>
                                    <div class="captcha-question" id="registerCaptchaQuestion" title="Click to refresh"></div>
                                </div>
                            </div>
                            
                            <div class="form-links">
                                <a href="#" @click.prevent="switchForm('login')" class="link back-to-login" >{{ t.backToLogin }}</a>
                            </div>
                            
                            <button type="submit" class="submit-btn" >{{ t.submitRegister }}</button>
                        </form>
                    </div>

                    <!-- Forgot Password Form -->
                    <div v-show="currentForm === 'forgot'" id="forgotForm" class="auth-section">
                        <h2 class="auth-title" data-i18n="forgotPassword">Forgot Password</h2>
                        
                        <form @submit.prevent="handleForgotPassword" class="auth-form">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.email }}</span>
                                    <span class="required">*</span>
                                </label>
                                <input 
                                    v-model="forgotForm.email" 
                                    type="email" 
                                    id="resetEmail" 
                                    :placeholder="t.emailPlaceholder"
                                    required
                                >
                            </div>
                            
                            <!-- Math Captcha -->
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text" >{{ t.captcha }}</span>
                                    <span class="required">*</span>
                                </label>
                                <div class="captcha-container">
                                    <input type="text" id="forgotCaptchaAnswer" class="captcha-input" :placeholder="t.captchaPlaceholder" required>
                                    <div class="captcha-question" id="forgotCaptchaQuestion" title="Click to refresh"></div>
                                </div>
                            </div>
                            
                            <div class="form-links">
                                <a href="#" @click.prevent="switchForm('login')" class="link back-to-login" >{{ t.backToLogin }}</a>
                            </div>
                            
                            <button type="submit" class="submit-btn" >{{ t.sendResetLink }}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-content">
            <span >{{ t.companyInfo }}</span>
            <span class="separator">|</span>
            <span >{{ t.contactPhone }}</span>
            <span class="separator">|</span>
            <span >{{ t.recordNumber }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 语言切换
const currentLang = ref<'en' | 'zh'>('en')

// 当前表单
const currentForm = ref('login')

// Logo路径
const logoPath = computed(() => '/v3/logo.png')

// 翻译数据
const translations = {
    en: {
        vppTitle: "Australia Energy Storage",
        vppSubtitle: "Australia's Clean Energy Storage Solution",
        signIn: "Sign In",
        createAccount: "Create Account",
        userRegister: "User Register",
        username: "Username/Email",
        password: "Password",
        account: "Account",
        email: "Email",
        confirmPassword: "Confirm Password",
        captcha: "Verification Code",
        forgotPassword: "Forgot password?",
        backToLogin: "Back to login",
        submitLogin: "Login",
        submitRegister: "Submit",
        sendResetLink: "Send Reset Link",
        usernamePlaceholder: "Please enter username/email",
        passwordPlaceholder: "Please enter password",
        accountPlaceholder: "Please enter account",
        emailPlaceholder: "Please enter email",
        confirmPasswordPlaceholder: "Please confirm password",
        captchaPlaceholder: "Answer",
        companyInfo: "System Copyright Owner: Xuheng Electronics (Shenzhen) Co., Ltd.",
        contactPhone: "Website Record: Guangdong ICP No. 2021169764",
        recordNumber: "Contact: xuheng@alwayscontrol.com.cn",
        loginSuccess: "Login successful!"
    },
    zh: {
        vppTitle: "澳洲储能电站",
        vppSubtitle: "澳洲清洁能源储存解决方案",
        signIn: "登录",
        createAccount: "创建账户",
        userRegister: "用户注册",
        username: "用户名/邮箱",
        password: "密码",
        account: "账号",
        email: "邮箱",
        confirmPassword: "确认密码",
        captcha: "验证码",
        forgotPassword: "忘记密码",
        backToLogin: "返回登录",
        submitLogin: "登录",
        submitRegister: "提交",
        sendResetLink: "发送重置链接",
        usernamePlaceholder: "请输入用户名/邮箱",
        passwordPlaceholder: "请输入密码",
        accountPlaceholder: "请输入账号",
        emailPlaceholder: "请输入邮箱",
        confirmPasswordPlaceholder: "请确认密码",
        captchaPlaceholder: "答案",
        companyInfo: "系统版权所有者：旭衡电子（深圳）有限公司",
        contactPhone: "网站备案信息：粤ICP备2021169764号",
        recordNumber: "联系方式：xuheng@alwayscontrol.com.cn",
        loginSuccess: "登录成功！"
    }
}

// 计算属性：当前语言的翻译（Vue响应式，不再操作DOM）
const t = computed(() => translations[currentLang.value])

// 表单数据
const loginForm = reactive({
    email: 'admin@xuheng.com',
    password: 'xuheng123'
})

const registerForm = reactive({
    account: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const forgotForm = reactive({
    email: ''
})

// 切换语言
const toggleLanguage = () => {
    currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}

// 切换表单
const switchForm = (formName: string) => {
    currentForm.value = formName
}

// 登录 → 真实路由跳转
const handleLogin = () => {
    authStore.login(loginForm.email)
    router.push('/role-select')
}

// 注册
const handleRegister = () => {
    setTimeout(() => switchForm('login'), 2000)
}

// 忘记密码
const handleForgotPassword = () => {
    setTimeout(() => switchForm('login'), 3000)
}
</script>

<style scoped>
/* ===== Background Layer ===== */
.background-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
    background: 
        radial-gradient(ellipse at 20% 20%, rgba(0, 255, 136, 0.08) 0%, transparent 30%),
        radial-gradient(ellipse at 80% 80%, rgba(0, 255, 136, 0.06) 0%, transparent 30%),
        radial-gradient(ellipse at 50% 50%, rgba(0, 255, 136, 0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 10% 90%, rgba(0, 255, 136, 0.04) 0%, transparent 40%),
        radial-gradient(ellipse at 90% 10%, rgba(0, 255, 136, 0.04) 0%, transparent 40%),
        linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 1) 100%);
}

.background-layer::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
        repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0, 255, 136, 0.01) 10px,
            rgba(0, 255, 136, 0.01) 20px
        ),
        repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(0, 255, 136, 0.01) 10px,
            rgba(0, 255, 136, 0.01) 20px
        );
    animation: texture-shift 60s linear infinite;
}

/* ===== Grid Pattern ===== */
.grid-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(rgba(0, 255, 136, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 136, 0.05) 1px, transparent 1px),
        linear-gradient(rgba(0, 255, 136, 0.02) 2px, transparent 2px),
        linear-gradient(90deg, rgba(0, 255, 136, 0.02) 2px, transparent 2px);
    background-size: 50px 50px, 50px 50px, 100px 100px, 100px 100px;
    background-position: 0 0, 0 0, 0 0, 0 0;
    animation: grid-move 40s linear infinite;
    opacity: 0.8;
}

/* ===== VPP Elements ===== */
.vpp-elements {
    position: absolute;
    width: 100%;
    height: 100%;
}

.vpp-element {
    position: absolute;
    color: rgba(0, 255, 136, 0.2);
    opacity: 0;
    animation: fadeInElement 2s ease forwards;
    filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.2));
}

.solar-panel {
    width: 80px;
    height: 80px;
    top: 12%;
    left: 8%;
    animation-delay: 0.3s;
}

.wind-turbine {
    width: 100px;
    height: 100px;
    top: 15%;
    right: 12%;
    animation-delay: 0.5s;
}

.battery {
    width: 70px;
    height: 70px;
    bottom: 20%;
    left: 15%;
    animation-delay: 0.7s;
}

.energy-grid {
    width: 90px;
    height: 90px;
    bottom: 15%;
    right: 8%;
    animation-delay: 0.9s;
}

.smart-home {
    width: 75px;
    height: 75px;
    top: 50%;
    left: 5%;
    animation-delay: 1.1s;
}

.ev-station {
    width: 85px;
    height: 85px;
    bottom: 40%;
    right: 20%;
    animation-delay: 1.3s;
}

.data-center {
    width: 70px;
    height: 70px;
    top: 35%;
    left: 25%;
    animation-delay: 1.5s;
}

.transmission-tower {
    width: 80px;
    height: 80px;
    top: 60%;
    right: 35%;
    animation-delay: 1.7s;
}

/* ===== SVG Element Animations ===== */
.turbine-blade {
    transform-origin: 50px 40px;
    animation: rotate-blade 10s linear infinite;
}

.battery-level {
    animation: battery-charge 3s ease-in-out infinite;
}

.battery-level:nth-child(3) { animation-delay: 0s; }
.battery-level:nth-child(4) { animation-delay: 0.5s; }
.battery-level:nth-child(5) { animation-delay: 1s; }

.pulse {
    animation: pulse 2s ease-in-out infinite;
}

.blink {
    animation: blink 2s ease-in-out infinite;
}

.server-rack {
    fill: rgba(0, 255, 136, 0.1);
}

.power-line {
    stroke-dasharray: 5 5;
    animation: power-flow 3s linear infinite;
}

/* ===== Connection Network ===== */
.connection-network {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.3;
}

.energy-flow {
    animation: energy-pulse 4s ease-in-out infinite;
}

/* ===== Energy Particles ===== */
.energy-particles {
    position: absolute;
    width: 100%;
    height: 100%;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(0, 255, 136, 0.8);
    border-radius: 50%;
    animation: float-particle 25s linear infinite;
    box-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
}

.particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { top: 60%; left: 30%; animation-delay: 3s; }
.particle:nth-child(3) { top: 30%; right: 20%; animation-delay: 6s; }
.particle:nth-child(4) { bottom: 40%; right: 30%; animation-delay: 9s; }
.particle:nth-child(5) { bottom: 20%; left: 40%; animation-delay: 12s; }
.particle:nth-child(6) { top: 45%; left: 60%; animation-delay: 15s; }
.particle:nth-child(7) { bottom: 55%; right: 15%; animation-delay: 18s; }
.particle:nth-child(8) { top: 70%; left: 80%; animation-delay: 21s; }

/* ===== Main Container ===== */
.main-container {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

/* ===== Content Wrapper ===== */
.content-wrapper {
    width: 100%;
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 80px;
}

/* ===== VPP Content (left side) ===== */
.vpp-content {
    flex: 1;
    animation: fadeInLeft 1s ease;
    padding-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.vpp-brand-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    position: relative;
    top: -80px;
}

.vpp-text-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
}

.vpp-title {
    font-size: 56px;
    font-weight: 800;
    color: var(--color-text);
    margin-bottom: 20px;
    letter-spacing: -0.5px;
    line-height: 1;
    background: linear-gradient(135deg, #ffffff 0%, var(--color-primary) 50%, #ffffff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: title-gradient 4s linear infinite;
    text-shadow: 0 2px 10px rgba(0, 255, 136, 0.1);
}

.vpp-subtitle {
    font-size: 22px;
    color: #cccccc;
    font-weight: 300;
    line-height: 1.4;
    max-width: 450px;
    letter-spacing: 0.5px;
    opacity: 0.9;
    margin-top: 8px;
    position: relative;
    padding-left: 24px;
}

.vpp-subtitle::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: var(--color-primary);
    border-radius: 2px;
    opacity: 0.6;
}

/* ===== Login Panel (right side) ===== */
.login-panel {
    flex: 0 0 420px;
    animation: fadeInRight 1s ease;
    margin-top: 0;
}

/* ===== Glass Panel ===== */
.glass-panel {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.85) 100%);
    backdrop-filter: blur(30px) saturate(120%);
    -webkit-backdrop-filter: blur(30px) saturate(120%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 
        0 25px 60px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 40px rgba(0, 255, 136, 0.05);
    padding: 40px;
    position: relative;
    overflow: hidden;
}

.glass-panel::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 136, 0.05) 0%, transparent 70%);
    animation: panel-glow 8s ease-in-out infinite;
    pointer-events: none;
}

/* ===== Logo in VPP Content ===== */
.vpp-content .logo {
    width: 150px;
    height: 150px;
    object-fit: contain;
    margin-bottom: 40px;
    margin-top: 0;
    filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.4));
    animation: logoGlow 3s ease-in-out infinite;
    transform: translateX(-10px);
}

/* ===== Language Switcher ===== */
.language-switcher {
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 1000;
}

.lang-btn {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #cccccc;
    font-size: 14px;
    padding: 8px 20px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.lang-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.lang-text {
    transition: color 0.3s ease;
}

.lang-text.active {
    color: var(--color-primary);
    font-weight: 500;
}

.lang-separator {
    color: #999999;
}

/* ===== Auth Container ===== */
.auth-container {
    width: 100%;
}

.auth-section.active {
    animation: fadeIn 0.5s ease;
}

/* Registration Form Special Layout */
#registerForm.auth-section.active {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 500px;
}

#registerForm .auth-title {
    flex-shrink: 0;
    margin-bottom: 20px;
}

#registerForm .auth-form {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    padding-right: 10px;
    margin-right: -10px;
}

/* Custom Scrollbar for Registration Form */
#registerForm .auth-form::-webkit-scrollbar {
    width: 6px;
}

#registerForm .auth-form::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

#registerForm .auth-form::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.3);
    border-radius: 3px;
}

#registerForm .auth-form::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.5);
}

.auth-title {
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 35px;
    text-align: left;
    opacity: 1;
    position: relative;
    padding-bottom: 12px;
}

.auth-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--color-primary);
    border-radius: 2px;
}

/* ===== Form Styles ===== */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--color-text);
    font-weight: 500;
    margin-bottom: 2px;
}

.required {
    color: #ff4d4f;
    font-size: 14px;
}

.form-group input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: rgba(0, 0, 0, 0.4);
    color: #ffffff;
    backdrop-filter: blur(5px);
}

.form-group input:hover {
    border-color: rgba(0, 255, 136, 0.5);
    background: rgba(0, 0, 0, 0.5);
}

.form-group input:focus {
    outline: none;
    border-color: var(--color-primary);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.15),
                0 0 20px rgba(0, 255, 136, 0.1);
}

/* ===== Captcha ===== */
.captcha-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.captcha-input {
    flex: 1;
    max-width: 120px;
}

.captcha-question {
    padding: 12px 16px;
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-primary);
    min-width: 140px;
    text-align: center;
    font-family: 'Courier New', monospace;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    letter-spacing: 1px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.captcha-question:hover {
    background: rgba(0, 255, 136, 0.15);
    border-color: var(--color-primary);
    transform: scale(1.02);
}

.captcha-question:active {
    transform: scale(0.98);
}

/* ===== Form Links ===== */
.form-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -8px;
}

.link {
    font-size: 13px;
    color: var(--color-primary);
    text-decoration: none;
    transition: all 0.3s ease;
}

.link:hover {
    color: var(--color-primary-active);
    text-decoration: underline;
}

/* ===== Submit Button ===== */
.submit-btn {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%);
    border: none;
    border-radius: 8px;
    color: #000000;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.submit-btn:hover {
    background: linear-gradient(135deg, var(--color-primary-active) 0%, var(--color-primary) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
}

.submit-btn:active {
    transform: translateY(0);
}

/* ===== Footer ===== */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    text-align: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
}

.footer-content {
    font-size: 12px;
    color: #666666;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 12px;
    line-height: 1.4;
}

.separator {
    color: #999999;
}

/* ===== Keyframe Animations ===== */
@keyframes texture-shift {
    from { transform: translate(0, 0); }
    to { transform: translate(20px, 20px); }
}

@keyframes grid-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
}

@keyframes rotate-blade {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes battery-charge {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.8; }
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
}

@keyframes fadeInElement {
    from { opacity: 0; transform: translateY(20px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes blink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
}

@keyframes power-flow {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -10; }
}

@keyframes energy-pulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

@keyframes float-particle {
    0% {
        opacity: 0;
        transform: translate(0, 0);
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: translate(100px, -100px);
    }
}

@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes title-gradient {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
}

@keyframes panel-glow {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
    50% { transform: translate(10%, 10%) scale(1.1); opacity: 1; }
}

@keyframes logoGlow {
    0%, 100% { 
        filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.4)) brightness(1);
        transform: translateX(-10px) scale(1);
    }
    50% { 
        filter: drop-shadow(0 16px 40px rgba(0, 255, 136, 0.3)) brightness(1.15);
        transform: translateX(-10px) scale(1.02);
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ===== Responsive Design ===== */
@media (max-width: 968px) {
    .content-wrapper {
        flex-direction: column;
        gap: 40px;
        text-align: center;
        padding-top: 40px;
    }
    
    .vpp-content {
        max-width: 500px;
        align-items: center;
        padding-top: 0;
    }
    
    .vpp-brand-group {
        align-items: center;
    }
    
    .vpp-text-group {
        align-items: center;
        text-align: center;
    }
    
    .vpp-content .logo {
        width: 120px;
        height: 120px;
        transform: translateX(0);
        margin-bottom: 30px;
        margin-top: 0;
    }
    
    .vpp-title {
        font-size: 42px;
    }
    
    .vpp-subtitle {
        font-size: 18px;
        padding-left: 0;
        max-width: 400px;
    }
    
    .vpp-subtitle::before {
        display: none;
    }
    
    .login-panel {
        flex: 0 0 auto;
        width: 100%;
        max-width: 400px;
    }
}

@media (max-width: 768px) {
    .vpp-content {
        display: none;
    }
    
    .content-wrapper {
        justify-content: center;
    }
    
    .glass-panel {
        padding: 30px;
    }
    
    .footer-content {
        flex-direction: column;
        gap: 4px;
    }
    
    .separator {
        display: none;
    }
}

@media (max-width: 480px) {
    .main-container {
        padding: 20px 15px;
    }
    
    .glass-panel {
        border-radius: 12px;
    }
    
    .auth-title {
        font-size: 20px;
    }
}
</style>