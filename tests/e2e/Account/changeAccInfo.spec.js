import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../api/api'

test.describe('Редактирование информации в профиле', () => {

  test('Изменение номера телефона и проверка сохранения', async ({ page }) => {
    // Подготовка: Программно залогиниться
    await page.goto(baseUrl)

    const signInLink = page.locator('a.button[href="/account/signin"]', { hasText: 'Sign in' })
    await signInLink.click()
    await page.waitForTimeout(2000)

    await page.fill('input[name="email"]', 'testing-bot-trusty@proton.me')
    await page.fill('input[name="password"]', 'testingBOT123#')

    const signInButton = page.locator('button.next_step_button', { hasText: 'Sign in' })
    await signInButton.click()
    await page.waitForTimeout(5000)

    // Перейти на страницу информации об аккаунте (/account/information)
    const accInfoLink = page.locator('a.account__button.text-nowrap[href="/account/accountinformation"]', { hasText: 'Account Information' })
    await accInfoLink.click()
    
    // Ждем загрузки страницы аккаунта
    await page.waitForURL('**/account/accountinformation')
    await page.waitForTimeout(2000)

    // Проверяем что мы на правильной странице и форма загружена
    await expect(page.locator('h1.title')).toContainText('Hello')
    
    // Ждем появления формы и полей
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 })
    
    // Ищем кнопку Edit - она может не быть видна если форма уже в режиме редактирования
    const editButton = page.locator('button.summary_edit_button').filter({ hasText: 'Edit' })
    
    // Проверяем состояние формы
    const isEditMode = await page.locator('input[name="first_name"]').isEnabled()
    
    if (!isEditMode) {
      // Форма в режиме просмотра - нужно нажать Edit
      await expect(editButton).toBeVisible({ timeout: 10000 })
      await editButton.click()
      await page.waitForTimeout(1000)
    }

    // Теперь форма должна быть в режиме редактирования
    await expect(page.locator('input[name="first_name"]')).toBeEnabled()

    // Генерируем новый номер телефона
    const newPhoneNumber = '1234567' + Date.now().toString().slice(-3)
    
    // Работаем с vue-tel-input
    const phoneInput = page.locator('.vue-tel-input input')
    await phoneInput.clear()
    await phoneInput.fill(newPhoneNumber)
    
    // Сохранить изменения
    const saveButton = page.locator('button.summary_edit_button').filter({ hasText: 'Save' })
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Проверка: ждем появления кнопки Edit, что означает завершение сохранения
    // и переход в режим просмотра.
    await expect(editButton).toBeVisible({ timeout: 10000 })
    
    // Проверка: убедиться что форма перешла в режим просмотра
    await expect(page.locator('input[name="first_name"]')).toBeDisabled()
    
    // Перезагрузить страницу
    await page.reload()
    await page.waitForTimeout(2000)

    // Проверка: убедиться что в поле осталось новое, сохраненное значение
    const phoneInputAfterReload = page.locator('.vue-tel-input input')
    const phoneValue = await phoneInputAfterReload.inputValue()
    expect(phoneValue).toContain(newPhoneNumber)

    // Выход из системы
    const logoutButton = page.getByRole('button', { name: 'Log Out' })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    const signInTitle = page.locator('h1.title', { hasText: 'Sign in' })
    await expect(signInTitle).toBeVisible()
  })

  test('Изменение имени и фамилии (существующий функционал)', async ({ page }) => {
    // Подготовка: Программно залогиниться  
    await page.goto(baseUrl)

    const signInLink = page.locator('a.button[href="/account/signin"]', { hasText: 'Sign in' })
    await signInLink.click()
    await page.waitForTimeout(2000)

    await page.fill('input[name="email"]', 'testing-bot-trusty@proton.me')
    await page.fill('input[name="password"]', 'testingBOT123#')

    const signInButton = page.locator('button.next_step_button', { hasText: 'Sign in' })
    await signInButton.click()
    await page.waitForTimeout(5000)

    // Перейти на страницу информации об аккаунте
    const accInfoLink = page.locator('a.account__button.text-nowrap[href="/account/accountinformation"]', { hasText: 'Account Information' })
    await accInfoLink.click()
    
    // Ждем загрузки страницы
    await page.waitForURL('**/account/accountinformation')
    await page.waitForTimeout(2000)

    // Проверяем загрузку формы
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 })
    
    const editButton = page.locator('button.summary_edit_button').filter({ hasText: 'Edit' })
    // Проверяем состояние формы и активируем режим редактирования если нужно
    const isEditMode = await page.locator('input[name="first_name"]').isEnabled()
    
    if (!isEditMode) {
      await expect(editButton).toBeVisible({ timeout: 10000 })
      await editButton.click()
      await page.waitForTimeout(1000)
    }

    const firstNameInput = page.locator('input[name="first_name"]')
    const lastNameInput = page.locator('input[name="last_name"]')

    const uniqueSuffix = Date.now().toString(36)
    const newFirstName = `testBOT-first-${uniqueSuffix}`
    const newLastName = `testBOT-last-${uniqueSuffix}`

    await firstNameInput.fill(newFirstName)
    await lastNameInput.fill(newLastName)

    // Сохранить изменения
    const saveButton = page.locator('button.summary_edit_button').filter({ hasText: 'Save' })
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Проверка: ждем появления кнопки Edit, что означает завершение сохранения
    await expect(editButton).toBeVisible({ timeout: 10000 })

    // Проверка новых значений
    await expect(firstNameInput).toHaveValue(newFirstName)
    await expect(lastNameInput).toHaveValue(newLastName)

    // Перезагрузить страницу
    await page.reload()
    await page.waitForTimeout(2000)

    // Проверка новых значений после перезагрузки
    const firstNameInputReloaded = page.locator('input[name="first_name"]')
    const lastNameInputReloaded = page.locator('input[name="last_name"]')
    await expect(firstNameInputReloaded).toHaveValue(newFirstName)
    await expect(lastNameInputReloaded).toHaveValue(newLastName)
    
    await page.waitForTimeout(1000)

    const logoutButton = page.getByRole('button', { name: 'Log Out' })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    const signInTitle = page.locator('h1.title', { hasText: 'Sign in' })
    await expect(signInTitle).toBeVisible()
  })
})