<template>
  <component :is="currentView" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import OwnerOverview from './dashboard/OwnerOverview.vue'
import OperatorDispatch from './dashboard/OperatorDispatch.vue'

const authStore = useAuthStore()
const currentView = computed(() =>
  authStore.user?.role === 'operator' ? OperatorDispatch : OwnerOverview
)
</script>
