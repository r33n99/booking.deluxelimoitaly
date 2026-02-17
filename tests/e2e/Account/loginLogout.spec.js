import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../api/api'

test.describe('login-logout тестирование', () => {

  test('Тестирует регистрацию', async ({ page }) => {
    // HomePage
    await page.goto(baseUrl)

    // Клик по ссылке Sign in
    const signInLink = page.locator('a.button[href="/account/signin"]', { hasText: 'Sign in' })
    await signInLink.click()
    await page.waitForTimeout(2000)

    // Заполнение полей email и пароля
    await page.fill('input[name="email"]', 'testing-bot-trusty@proton.me')
    await page.fill('input[name="password"]', 'testingBOT123#')

    // Клик по кнопке Sign in
    const signInButton = page.locator('button.next_step_button', { hasText: 'Sign in' })
    await signInButton.click()
    await page.waitForTimeout(5000)

    // Проверка наличия кнопки Log Out и клик по ней
    const logoutButton = page.getByRole('button', { name: 'Log Out' })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    // Проверка появления заголовка Sign in
    const signInTitle = page.locator('h1.title', { hasText: 'Sign in' })
    await expect(signInTitle).toBeVisible()

    // Проверка наличия ссылки Sign up в шапке
    const signUpLink = page.locator('a[href="/registration/details"]', { hasText: 'Sign up' })
    await expect(signUpLink).toBeVisible()

  })
})