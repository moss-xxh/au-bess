<template>
  <header class="app-header">
    <!-- Left: Logo -->
    <div class="header-logo">
      <img :src="logoPath" alt="X ENERGI" class="logo-img">
    </div>

    <!-- Center: Horizontal Nav -->
    <nav class="header-nav">
      <router-link
        v-for="item in visibleRoutes"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: isActive(item.path) }"
      >
        {{ i18n.t(item.title) }}
      </router-link>
    </nav>

    <!-- Right: Language + Role + User Avatar Dropdown -->
    <div class="header-actions">
      <span class="lang-btn" @click="i18n.toggleLocale()">{{ i18n.locale === 'en' ? 'EN' : '中' }}</span>
      <span class="role-badge" @click="$emit('switch-role')">{{ roleLabel }} 🔄</span>
      <!-- User Avatar with Hover Dropdown -->
      <div class="user-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
        <div class="user-avatar">{{ avatarLetter }}</div>
        <Transition name="dropdown-fade">
          <div v-show="showDropdown" class="dropdown-menu">
            <div class="dropdown-user-name">{{ user.name || user.email }}</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="handleSettings">
              <span class="dropdown-icon">⚙️</span>
              <span>{{ i18n.t('settings') }}</span>
            </div>
            <div class="dropdown-item dropdown-item-danger" @click="showLogoutConfirm = true">
              <span class="dropdown-icon">🚪</span>
              <span>{{ i18n.t('logout') }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Logout Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showLogoutConfirm" class="logout-overlay" @click.self="showLogoutConfirm = false">
          <div class="logout-confirm">
            <div class="logout-confirm-title">{{ i18n.t('confirmLogout') }}</div>
            <div class="logout-confirm-msg">{{ i18n.t('confirmLogoutMsg') }}</div>
            <div class="logout-confirm-btns">
              <button class="btn-cancel" @click="showLogoutConfirm = false">{{ i18n.t('cancel') }}</button>
              <button class="btn-confirm" @click="handleLogout">{{ i18n.t('confirmBtn') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18nStore'
import type { User } from '@/stores/authStore'

const props = defineProps<{
  user: User
  alertCount: number
}>()

const emit = defineEmits<{
  logout: []
  'switch-role': []
}>()

const route = useRoute()
const router = useRouter()
const i18n = useI18nStore()

const showDropdown = ref(false)
const showLogoutConfirm = ref(false)

const logoPath = computed(() => `${import.meta.env.BASE_URL}logo.png`)

const avatarLetter = computed(() => {
  const name = props.user.name || props.user.email || 'U'
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  if (!props.user.role) return ''
  return props.user.role === 'owner' ? i18n.t('owner') : i18n.t('operator')
})

// Derive visible routes from router config — single source of truth
const visibleRoutes = computed(() => {
  const layoutRoute = router.getRoutes().find(r => r.name === 'layout')
  if (!layoutRoute?.children) return []

  return layoutRoute.children
    .filter(child => {
      if (!child.meta?.title) return false
      const roles = child.meta?.roles as string[] | undefined
      if (roles && props.user.role && !roles.includes(props.user.role)) return false
      return true
    })
    .map(child => ({
      path: child.path.startsWith('/') ? child.path : `/${child.path}`,
      title: child.meta?.title as string,
    }))
})

function isActive(path: string): boolean {
  return route.path === path
}

function handleSettings() {
  showDropdown.value = false
}

function handleLogout() {
  showLogoutConfirm.value = false
  showDropdown.value = false
  emit('logout')
}
</script>

<style scoped>
.app-header {
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

/* === Logo === */
.header-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-img {
  height: 45px;
  object-fit: contain;
}

/* === Center Nav === */
.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* === Right Actions === */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.lang-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
}

.lang-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.4);
}

.role-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  padding: 4px 12px;
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
}

.role-badge:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.5);
}

/* === User Dropdown === */
.user-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #00aaff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  z-index: 9999;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-user-name {
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.dropdown-item-danger:hover {
  background: rgba(255, 68, 68, 0.1);
  color: #ff6666;
}

.dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* === Logout Confirm Modal === */
.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .logout-confirm,
.modal-fade-leave-to .logout-confirm {
  transform: scale(0.95);
}

.logout-confirm {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  min-width: 320px;
  text-align: center;
  transition: transform 0.25s ease;
}

.logout-confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.logout-confirm-msg {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 28px;
}

.logout-confirm-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.btn-confirm {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: rgba(255, 68, 68, 0.2);
  color: #ff6666;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: rgba(255, 68, 68, 0.3);
  color: #ff4444;
}
</style>
