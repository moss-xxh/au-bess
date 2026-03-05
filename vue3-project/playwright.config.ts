import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://49.51.194.118:8080/v3/',
    headless: true,
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
          args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        }
      },
    },
  ],
})
