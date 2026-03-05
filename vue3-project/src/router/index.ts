import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginView from '../views/LoginView.vue'
import RoleSelectView from '../views/RoleSelectView.vue'
import AppLayout from '../layout/AppLayout.vue'

// Extend RouteMeta type for TypeScript
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    roles?: string[]
    icon?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Static routes (no layout)
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/role-select',
      name: 'role-select',
      component: RoleSelectView,
    },

    // Layout routes
    {
      path: '/',
      name: 'layout',
      component: AppLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'navOverview', roles: ['owner', 'operator'], icon: 'dashboard' },
        },
        // Placeholder routes (Phase 3+)
        {
          path: 'stations',
          name: 'stations',
          component: () => import('../views/StationView.vue'),
          meta: { title: 'navStation', roles: ['owner', 'operator'] },
        },
        {
          path: 'fault-alarm',
          name: 'fault-alarm',
          component: () => import('../views/FaultAlarmView.vue'),
          meta: { title: 'navFaultAlarm', roles: ['owner', 'operator'] },
        },
        {
          path: 'map',
          name: 'map',
          component: () => import('../views/dashboard/OwnerMapView.vue'),
          meta: { title: 'navMap', roles: ['owner'] },
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('../views/DashboardView.vue'), // temp reuse
          meta: { title: 'navClients', roles: ['owner'] },
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/DashboardView.vue'), // temp reuse
          meta: { title: 'navReports', roles: ['operator'] },
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('../views/DashboardView.vue'), // temp reuse
          meta: { title: 'navLogs', roles: ['operator'] },
        },
      ],
    },

    // Preserve original routes (not shown in menu — no meta.title in layout context)
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// Global navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 1. Not logged in → /login (allow login page itself)
  if (!authStore.isLoggedIn && to.name !== 'login') {
    return { name: 'login' }
  }

  // 2. Logged in visiting login → redirect
  if (authStore.isLoggedIn && to.name === 'login') {
    return authStore.user.role ? { name: 'dashboard' } : { name: 'role-select' }
  }

  // 3. Logged in but no role → /role-select (allow role-select & login)
  if (authStore.isLoggedIn && !authStore.user.role && to.name !== 'role-select' && to.name !== 'login') {
    return { name: 'role-select' }
  }

  // 4. Role permission check
  if (to.meta.roles && authStore.user.role && !to.meta.roles.includes(authStore.user.role)) {
    return { name: 'dashboard' }
  }
})

export default router
