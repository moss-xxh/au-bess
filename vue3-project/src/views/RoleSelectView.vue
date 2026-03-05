<template>
  <div class="background-layer"></div>

  <div class="content-wrapper">
    <!-- Header -->
    <header class="header">
      <div class="logo-area">
        <img :src="logoPath" alt="Logo">
      </div>
      <div class="lang-switcher" @click="toggleLang">
        <span class="lang-text" :class="{ active: currentLang === 'en' }">EN</span>
        <span class="lang-divider">|</span>
        <span class="lang-text" :class="{ active: currentLang === 'zh' }">中</span>
      </div>
    </header>

    <!-- Main -->
    <main class="main-content">
      <h1 class="page-title">{{ t.pageTitle }}</h1>
      <p class="page-subtitle">{{ t.pageSubtitle }}</p>

      <div class="cards-container">
        <!-- Owner Card -->
        <div class="role-card" @click="selectRole('owner')">
          <div class="role-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="role-title">{{ t.ownerTitle }}</div>
          <div class="role-subtitle">{{ t.ownerSubtitle }}</div>
          <div class="role-desc">{{ t.ownerDesc }}</div>
          <ul class="feature-list">
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.ownerF1 }}</span>
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.ownerF2 }}</span>
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.ownerF3 }}</span>
            </li>
          </ul>
          <button class="role-btn">{{ t.ownerBtn }}</button>
        </div>

        <!-- Operator Card -->
        <div class="role-card" @click="selectRole('operator')">
          <div class="role-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div class="role-title">{{ t.operatorTitle }}</div>
          <div class="role-subtitle">{{ t.operatorSubtitle }}</div>
          <div class="role-desc">{{ t.operatorDesc }}</div>
          <ul class="feature-list">
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.operatorF1 }}</span>
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.operatorF2 }}</span>
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.operatorF3 }}</span>
            </li>
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ t.operatorF4 }}</span>
            </li>
          </ul>
          <button class="role-btn">{{ t.operatorBtn }}</button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <a href="#" @click.prevent="handleLogout">{{ t.logoutLink }}</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const currentLang = ref<'en' | 'zh'>('en')
const logoPath = computed(() => '/v3/logo.png')

const translations = {
  en: {
    pageTitle: 'Select Your Role',
    pageSubtitle: 'Choose your role to enter the system',
    ownerTitle: 'Owner',
    ownerSubtitle: 'Property Owner',
    ownerDesc: 'Create and manage stations, handle faults, assign O&M accounts, and fully control your assets.',
    ownerF1: 'Create stations & view data',
    ownerF2: 'Fault detection & resolution',
    ownerF3: 'Create operators & assign stations',
    ownerBtn: 'Enter Owner Panel',
    operatorTitle: 'Operator',
    operatorSubtitle: 'O&M Provider',
    operatorDesc: 'AI-powered dispatch for assigned stations, energy reports, and historical scheduling records.',
    operatorF1: 'AI smart dispatch',
    operatorF2: 'View assigned station data',
    operatorF3: 'Energy & revenue reports',
    operatorF4: 'Dispatch history records',
    operatorBtn: 'Enter Operator Panel',
    logoutLink: 'Sign Out'
  },
  zh: {
    pageTitle: '选择您的角色',
    pageSubtitle: '请选择登录角色以进入系统',
    ownerTitle: '业主',
    ownerSubtitle: 'Property Owner',
    ownerDesc: '创建并管理电站，处理设备故障，分配运维方账号，全面掌控电站资产。',
    ownerF1: '创建电站与查看运行数据',
    ownerF2: '故障查看与处理',
    ownerF3: '创建运维方并分配电站',
    ownerBtn: '进入业主面板',
    operatorTitle: '运维方',
    operatorSubtitle: 'O&M Provider',
    operatorDesc: '智能调度归属电站，查看电量收益报表，记录历史调度操作，高效运维管理。',
    operatorF1: 'AI 智能调度',
    operatorF2: '查看归属站点运行数据',
    operatorF3: '电量收益报表',
    operatorF4: '历史调度记录',
    operatorBtn: '进入运维面板',
    logoutLink: '退出登录'
  }
}

const t = computed(() => translations[currentLang.value])

function toggleLang() {
  currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}

function selectRole(role: 'owner' | 'operator') {
  authStore.setRole(role)
  router.push('/dashboard')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Background */
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
    linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 1) 100%);
}

/* Content wrapper */
.content-wrapper {
  width: 100%;
  max-width: 100%;
  align-items: stretch;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-area img {
  height: 32px;
  object-fit: contain;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s;
  user-select: none;
}

.lang-switcher:hover {
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.05);
}

.lang-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s;
}

.lang-text.active {
  color: var(--color-primary);
  font-weight: 600;
}

.lang-divider {
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40px 60px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  color: #999999;
  text-align: center;
  margin-bottom: 48px;
}

/* Cards Container */
.cards-container {
  display: flex;
  gap: 28px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 860px;
  width: 100%;
}

/* Role Card */
.role-card {
  flex: 1;
  min-width: 320px;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 36px 32px 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.role-card:nth-child(1) { animation-delay: 0.15s; }
.role-card:nth-child(2) { animation-delay: 0.3s; }

.role-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 0%, rgba(0, 255, 136, 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
}

.role-card:hover {
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 40px rgba(0, 255, 136, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: translateY(-6px);
}

.role-card:hover::before { opacity: 1; }
.role-card:active { transform: translateY(-2px); }

/* Icon */
.role-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.role-icon svg {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}

/* Card Text */
.role-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  position: relative;
}

.role-subtitle {
  font-size: 13px;
  color: #999999;
  margin-bottom: 14px;
  position: relative;
}

.role-desc {
  font-size: 14px;
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 22px;
  position: relative;
}

/* Feature List */
.feature-list {
  list-style: none;
  margin-bottom: 28px;
  position: relative;
  padding: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.feature-list li .check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-list li .check svg {
  width: 11px;
  height: 11px;
  color: var(--color-primary);
}

/* Action Button */
.role-btn {
  width: 100%;
  padding: 13px 0;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: #000;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  letter-spacing: 0.3px;
  margin-top: auto;
}

.role-btn:hover {
  background: #00cc6a;
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.role-btn:active { transform: scale(0.98); }

/* Footer */
.footer {
  text-align: center;
  padding: 24px 40px;
  margin-top: -30px;
}

.footer a {
  color: #999999;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.footer a:hover { color: var(--color-primary); }

/* Entrance Animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-title, .page-subtitle {
  opacity: 0;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.page-subtitle { animation-delay: 0.08s; }

/* Responsive */
@media (max-width: 768px) {
  .header { padding: 20px 24px; }
  .main-content { padding: 0 20px 40px; }
  .cards-container { flex-direction: column; align-items: center; }
  .role-card { min-width: 280px; max-width: 100%; }
  .page-title { font-size: 26px; }
}
</style>
