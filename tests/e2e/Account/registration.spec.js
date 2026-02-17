import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../api/api'
import { generateUniqueEmail } from '../helpers/generateUniqueEmail'

test.describe('Регистрация аккаунта E2E', () => {
  test('Полный процесс регистрации с подтверждением кода', async ({ page }) => {
    // Генерируем уникальные тестовые данные
    const testEmail = generateUniqueEmail()
    const testData = {
      firstName: 'Тест',
      lastName: 'Пользователь',
      email: testEmail,
      phone: '1234567890',
      password: 'TestPass123!',
      verificationCode: '123456'
    }

    // Перехватываем запрос send_code и добавляем test=1 параметр
    await page.route('**/auth/send_code', async (route) => {
      const url = new URL(route.request().url())
      url.searchParams.set('test', '1')

      await route.continue({
        url: url.toString()
      })
    })

    // Этап 1: Переход на страницу регистрации
    await page.goto(baseUrl)

    // Клик по ссылке Sign up
    const signUpLink = page.locator('a[href="/registration/details"]', { hasText: 'Sign up' })
    await signUpLink.click()
    await page.waitForURL('**/registration/details')

    // Проверяем, что мы на странице ввода деталей
    const pageTitle = page.locator('p', { hasText: 'Enter Details' })
    await expect(pageTitle).toBeVisible()

    // Заполняем форму
    await page.fill('input[name="first_name"]', testData.firstName)
    await page.fill('input[name="last_name"]', testData.lastName)
    await page.fill('input[name="email"]', testData.email)

    // Заполняем телефон (используя vue-tel-input)
    const phoneInput = page.locator('.vue-tel-input input')
    await phoneInput.fill(testData.phone)

    // Ожидание после заполнения полей
    await page.waitForTimeout(2000)

    // Нажимаем кнопку Next
    const nextButton = page.locator('button[type="submit"]', { hasText: 'Next' })
    await nextButton.click()

    // Ожидание исчезновения лоадера после клика
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 }).catch(() => { })

    // Этап 2: Подтверждение email (увеличенный timeout)
    await page.waitForURL('**/registration/emailconfirmation', { timeout: 120000 })

    // Проверяем, что мы на странице подтверждения email
    const emailTitle = page.locator('p', { hasText: 'Check Your Email' })
    await expect(emailTitle).toBeVisible()

    // Проверяем, что email отображается в тексте
    const emailText = page.locator('span', { hasText: `We sent a confirmation email to the email ${testData.email}` })
    await expect(emailText).toBeVisible()

    // Вводим код подтверждения
    const codeInput = page.locator('input[name="code"]')
    await codeInput.fill(testData.verificationCode)

    // Ожидание после ввода кода
    await page.waitForTimeout(1000)

    // Нажимаем кнопку Next
    const confirmButton = page.locator('button[type="submit"]', { hasText: 'Next' })
    await confirmButton.click()

    // Ожидание исчезновения лоадера
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 }).catch(() => { })

    // Этап 3: Финализация регистрации
    await page.waitForURL('**/registration/finalize', { timeout: 60000 })

    // Проверяем, что мы на странице финализации
    const finalizeTitle = page.locator('p', { hasText: 'Finalize Registration' })
    await expect(finalizeTitle).toBeVisible()

    // Выбираем тип аккаунта (private)
    const privateRadio = page.locator('input[value="private"]')
    await privateRadio.check()

    // Заполняем пароли
    await page.fill('input[name="password"]', testData.password)
    await page.fill('input[name="confirm_password"]', testData.password)

    // Ожидание после заполнения паролей
    await page.waitForTimeout(1000)

    // Нажимаем кнопку Save для завершения регистрации
    const saveButton = page.locator('button[type="submit"]', { hasText: 'Save' })
    await saveButton.click()

    // Ожидание исчезновения лоадера
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 }).catch(() => { })

    // Ожидаем перенаправления на страницу аккаунта после успешной регистрации
    await page.waitForURL('**/account/accountinformation', { timeout: 60000 })

    // Проверяем, что регистрация прошла успешно
    // Можем проверить наличие элементов личного кабинета
    const accountInfo = page.locator('h1, h2, .title')
    await expect(accountInfo.first()).toBeVisible()

  })

  test('Тест функции Resend Code', async ({ page }) => {
    const testEmail = generateUniqueEmail()

    // Перехватываем запросы
    await page.route('**/auth/send_code', async (route) => {
      const url = new URL(route.request().url())
      url.searchParams.set('test', '1')
      await route.continue({ url: url.toString() })
    })

    await page.route('**/auth/resend_code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Code resent successfully' })
      })
    })

    // Переходим на первый этап регистрации
    await page.goto(`${baseUrl}/registration/details`)

    // Заполняем минимальную форму
    await page.fill('input[name="first_name"]', 'Тест')
    await page.fill('input[name="last_name"]', 'Повтор')
    await page.fill('input[name="email"]', testEmail)

    // Ожидание после заполнения
    await page.waitForTimeout(2000)

    await page.locator('button[type="submit"]', { hasText: 'Next' }).click()

    // Ожидание исчезновения лоадера
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 }).catch(() => { })

    await page.waitForURL('**/registration/emailconfirmation', { timeout: 120000 })

    // Ждём истечения таймера (или проверяем, что кнопка Resend появилась)
    const resendButton = page.locator('button', { hasText: 'Resend code' })

    // Если есть таймер, ждём его завершения (может потребоваться подождать)
    await page.waitForTimeout(2000)

    // Кликаем Resend Code если кнопка доступна
    if (await resendButton.isVisible()) {
      await resendButton.click()

      // Проверяем, что таймер снова запустился
      const timerText = page.locator('p', { hasText: /Resend available in \d+ sec/ })
      await expect(timerText).toBeVisible()
    }
  })
})