import { test, expect } from '@playwright/test'

const BASE = 'http://49.51.194.118:8080/v3/'

test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
  })

  test('页面正常加载', async ({ page }) => {
    await expect(page.locator('.auth-title').first()).toBeVisible({ timeout: 10000 })
  })

  test('默认填充用户名密码', async ({ page }) => {
    await expect(page.locator('#loginEmail')).toHaveValue('admin@xuheng.com', { timeout: 10000 })
    await expect(page.locator('#loginPassword')).toHaveValue('xuheng123')
  })

  test('语言切换正常', async ({ page }) => {
    await expect(page.locator('.auth-title').first()).toContainText('Sign In', { timeout: 10000 })
    await page.locator('#langSwitcher').click()
    await page.waitForTimeout(500)
    await expect(page.locator('.auth-title').first()).toContainText('登录')
    await page.locator('#langSwitcher').click()
    await page.waitForTimeout(500)
    await expect(page.locator('.auth-title').first()).toContainText('Sign In')
  })

  test('表单切换正常', async ({ page }) => {
    // 点击注册链接
    await page.locator('#registerLink').click()
    await page.waitForTimeout(500)
    // v-show控制display，检查Create Account标题出现
    await expect(page.locator('#registerForm .auth-title')).toContainText('Create Account')
    // 回到登录
    await page.locator('#registerForm .back-to-login').click()
    await page.waitForTimeout(500)
    await expect(page.locator('#loginForm .auth-title')).toContainText('Sign In')
  })

  test('登录后跳转', async ({ page }) => {
    await page.locator('.submit-btn').first().click()
    await page.waitForURL('**/home', { timeout: 10000 })
    expect(page.url()).toContain('/home')
  })
})
