<template>
  <div class="app-layout">
    <AppHeader
      :user="authStore.user"
      :alert-count="0"
      @logout="handleLogout"
      @switch-role="handleSwitchRole"
    />
    <main class="layout-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from './AppHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function handleSwitchRole() {
  authStore.setRole(null)
  router.push('/role-select')
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #000000;
}

.layout-content {
  margin-top: 60px;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}
</style>
