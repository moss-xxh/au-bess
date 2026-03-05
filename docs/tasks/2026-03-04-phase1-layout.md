# 阶段1：角色选择与全局Layout框架
## 日期: 2026-03-04
## 状态: 执行中

## 架构决策（已通过审查）
1. 路由守卫(beforeEach)统一权限校验，meta.roles声明权限
2. 菜单从路由表自动派生，不维护独立菜单配置
3. TopHeader为纯展示组件（Dumb Component）
4. 持久化角色记忆，重新打开浏览器直达Dashboard
5. persist key: au-bess-auth-v3

## 执行步骤
- Step 1: RoleSelectView.vue（1:1还原role-select.html）
- Step 2: Layout骨架（AppHeader/AppSidebar/AppLayout）
- Step 3: 路由守卫（beforeEach权限校验）
- Step 4: 交付审查
