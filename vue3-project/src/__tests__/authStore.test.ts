import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态未登录', () => {
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.user.role).toBeNull()
  })

  it('登录后状态正确', () => {
    const store = useAuthStore()
    store.login('admin@xuheng.com')
    expect(store.isLoggedIn).toBe(true)
    expect(store.user.email).toBe('admin@xuheng.com')
  })

  it('角色设置正确', () => {
    const store = useAuthStore()
    store.login('admin@xuheng.com')
    store.setRole('owner')
    expect(store.isOwner).toBe(true)
    expect(store.isOperator).toBe(false)
  })

  it('登出后状态重置', () => {
    const store = useAuthStore()
    store.login('admin@xuheng.com')
    store.logout()
    expect(store.isLoggedIn).toBe(false)
    expect(store.user.email).toBe('')
  })
})
