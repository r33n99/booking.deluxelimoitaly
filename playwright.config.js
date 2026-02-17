import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Папка с тестами
  testDir: 'tests/e2e',

  // Количество попыток перезапуска упавшего теста
  // retries: 1,

  // Увеличение времени на теста
  timeout: 130 * 1000,

  // ставим 3, чтобы тесты шли по очереди
  workers: 3,

  // Повтор попыток для нестабильных тестов
  // retries: process.env.CI ? 2 : 0,

  // Увеличение тайм-аута для CI
  // workers: process.env.CI ? 1 : undefined,

  // Репортеры для вывода результатов
  reporter: [
    // ['list'], // Удобный для локальной разработки
    // ['html', { open: 'never' }], // Генерация HTML отчета
    // ['junit', { outputFile: 'results.xml' }], // Для интеграции с CI/CD
    ['dot']
  ],

  use: {
    // Базовый URL для тестов
    // eslint-disable-next-line no-undef
    baseURL: process.env.VITE_APP_URL || 'http://localhost:3001',

    // Установка браузера и параметров
    // browserName: 'chromium',
    // headless: process.env.HEADLESS !== 'false', // Управление режимом headless через ENV
    // viewport: { width: 1920, height: 1080 },

    // Действия пользователя
    actionTimeout: 90 * 1000, // Тайм-аут для действий (например, кликов)
    navigationTimeout: 90 * 1000 // Тайм-аут для переходов между страницами

    // Скриншоты и видео
    // screenshot: 'only-on-failure', // Скриншоты только при падении
    // video: 'retain-on-failure', // Видео сохраняется только при падении

    // Сохранять журнал при ошибке
    // trace: 'on-first-retry',
  },

  // Настройка окружений (проектов) для браузеров и устройств
  projects: [
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }
    // },
    // {
    //   name: 'Desktop Firefox',
    //   use: { ...devices['Desktop Firefox'] }
    // },
    // {
    //   name: 'Desktop Safari',
    //   use: { ...devices['Desktop Safari'] }
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] }
    // }
  ]

  // Web server для запуска приложения перед тестами
  // webServer: {
  //   command: 'npm run dev', // Команда для запуска приложения
  //   port: 3001,
  //   reuseExistingServer: !process.env.CI, // Использовать существующий сервер в локальной разработке
  // },
})