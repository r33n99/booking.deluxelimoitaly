import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../../../api/api'
import { getNextDayDateTime } from '../../../helpers/getNextDay'
import { testData } from '../../../helpers/mockData'
import { generateUniqueEmail } from '../../../helpers/generateUniqueEmail'

test.describe('ToursRoadshowsTab', () => {

  test('Тестирует форму бронирования ToursRoadshowsTab', async ({ page }) => {
    // Переход на главную страницу
    await page.goto(baseUrl)

    // Проверка заголовка
    const header = page.locator('[data-testid="homepage-title"]')
    await expect(header).toHaveText(/Car Service\s*with Private Driver/i)

    // Найти и нажать кнопку "Tours/Roadshows"
    const hourlyButtonHourlyDirected = await page.getByRole('button', { name: 'Tours/Roadshows' })
    await hourlyButtonHourlyDirected.click()
    await page.waitForTimeout(1000)
    // Ввод места отправления
    await page.locator('input[placeholder=\'Pick Up Location*\']').fill('Rome')
    await page.waitForTimeout(1000)
    // Ожидание появления автодополнений для поля ввода места отправления
    await page.locator('#autocomplete-list').waitFor()
    await page.getByText('Rome, Metropolitan City of Rome Capital, Italy', { exact: false }).click()
    await page.waitForTimeout(1000)

    // Получение строки с датой и временем следующего дня
    const nextDayDateTime = getNextDayDateTime()

    // Установка значения в поле даты
    await page.evaluate((dateTime) => {
      const dateInput = document.querySelector('input[placeholder="Date / Time*"]')
      if (dateInput) {
        dateInput.value = dateTime
        const event = new Event('input', { bubbles: true })
        dateInput.dispatchEvent(event)
      }
    }, nextDayDateTime)

    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.

    // Сброс ранее выбранной модалки времени
    const resetArea = page.locator('[data-testid="LocationIcon"]');
    await resetArea.click();

// Ожидание завершения действий после сброса
    await page.waitForTimeout(2000);

// Нажатие на кнопку следующего шага
    const nextButton = page.locator('button.next_step_button');
    await nextButton.click();


    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.
    // Ожидаем исчезновения лоадера, если он отображается при загрузке страницы
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached' })
    await page.waitForURL(/vehicle/)

    // // Проверка наличия списка автомобилей
    // const vehicles = page.locator('//div[@class="vehicle"]')
    //
    // // Убедимся, что их ровно 6
    // await expect(vehicles).toHaveCount(6)

    // Выбор первого автомобиля
    const firstVehicleButton = page.locator('.vehicle .summary_edit_button').first()
    await expect(firstVehicleButton).toHaveText(/Select/i)
    await firstVehicleButton.click()

    // СontactPage

    // Ожидаем исчезновения лоадера, если он отображается при загрузке страницы
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 })
    await page.waitForURL(/contact/)

    // Заполнение данных
    await page.fill('input[placeholder="First Name*"]', testData.passengerName)
    await page.fill('input[placeholder="Last Name*"]', testData.passengerName)
    const uniqueEmail = generateUniqueEmail()
    await page.fill('input[placeholder="E-mail Address*"]', uniqueEmail)
    await page.locator('.vue-tel-input input').fill(testData.phone)

    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.

    // Нажатие кнопки Next
    const submitButton = page.locator('.next_step_button')
    await submitButton.click()

    //SuccessPage
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached' })
    await page.waitForURL(/success/)

    const thankYouMessage = page.getByTestId('success-title')
    await expect(thankYouMessage).toBeVisible()

    const successTours = page.getByTestId('success-tours')
    await expect(successTours).toBeVisible()

    const tourCard = successTours.locator('[data-testid="tour-card"]').first()
    // const tourCard = successTours.locator('[data-testid="tour-card"]').nth(2)
    await expect(tourCard).toBeVisible()

    const tourNameFromCard = await tourCard.locator('[data-testid="tour-name"]').innerText()
    await tourCard.click()

    await page.waitForTimeout(5000)

    const tourPageTitle = page.getByTestId('tour-name')
    await expect(tourPageTitle).toBeVisible()
    await expect(tourPageTitle).toHaveText(tourNameFromCard)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    const bookNowBtn = page.getByRole('button', { name: 'Book Now' }).last()
    await bookNowBtn.waitFor({ state: 'visible' })
    await bookNowBtn.click({ force: true })

    // Получение информации о туре перед оплатой
    await page.waitForTimeout(3000)
    const paymentForm = page.locator('#payment-form')
    await expect(paymentForm).toBeVisible()

    const paymentFrame = page.frameLocator('iframe[title*="Secure payment input frame"]')

    // Заполнение данных карты
    const cardNumberInput = paymentFrame.locator('input[name="number"]')
    await cardNumberInput.fill('4242 4242 4242 4242')

    const cardExpiryInput = paymentFrame.locator('input[name="expiry"]')
    await cardExpiryInput.fill('12/55')

    const cvcInput = paymentFrame.locator('input[name="cvc"]')
    await cvcInput.fill('123')

    const paymentSubmitButton = page.getByTestId('paymentPage-submit')
    await expect(paymentSubmitButton).toBeVisible()
    await paymentSubmitButton.click()

    // Проверка успешной оплаты
    const successPayment = page.getByTestId('status-message')
    await expect(successPayment).toBeVisible({ timeout: 15000 })
  })
})