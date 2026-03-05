import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 严格类型定义，禁止any
export interface User {
  name: string
  email: string
  avatar: string
  role: 'owner' | 'operator' | null
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isLoggedIn = ref(false)
  const user = ref<User>({
    name: '',
    email: '',
    avatar: '',
    role: null
  })

  // 计算属性
  const isOwner = computed(() => user.value.role === 'owner')
  const isOperator = computed(() => user.value.role === 'operator')

  // 登录
  function login(email: string) {
    isLoggedIn.value = true
    user.value = {
      name: email.split('@')[0],
      email: email,
      avatar: '',
      role: null // 登录后去角色选择页
    }
  }

  // 选择角色
  function setRole(role: 'owner' | 'operator' | null) {
    user.value.role = role
  }

  // 登出
  function logout() {
    isLoggedIn.value = false
    user.value = { name: '', email: '', avatar: '', role: null }
  }

  return {
    isLoggedIn,
    user,
    isOwner,
    isOperator,
    login,
    setRole,
    logout
  }
}, {
  // pinia-plugin-persistedstate 自动接管localStorage
  persist: {
    key: 'au-bess-auth-v3',
    paths: ['isLoggedIn', 'user']
  }
})
