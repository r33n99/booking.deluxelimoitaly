import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../../../api/api'
import { getNextDayDateTime } from '../../../helpers/getNextDay'
import { testData } from '../../../helpers/mockData'
import { generateUniqueEmail } from '../../../helpers/generateUniqueEmail'

test.describe('HourlyAsDirectedTab', () => {

  test('Тестирует форму бронирования HourlyAsDirectedTab', async ({ page }) => {
    // Переход на главную страницу
    await page.goto(baseUrl)

    // Проверка заголовка
    const header = page.locator('[data-testid="homepage-title"]')
    await expect(header).toHaveText(/Car Service\s*with Private Driver/i)

    // Найти и нажать кнопку "Hourly as directed"
    await page.getByRole('button', { name: 'Hourly as directed' }).click()
    await page.locator('.home_form-2.active').waitFor()

    const hourlyForm = page.locator('.home_form-2.active')
    await hourlyForm.locator('[data-testid="pickup"] input').fill('Rome')

    await page.locator('#autocomplete-list').waitFor()
    await page.getByText('Rome, Metropolitan City of Rome Capital, Italy', { exact: false }).click()
    await page.waitForTimeout(1000)

    // Раскрыть select и выбрать значение "4 hours"
    const hoursDropdown = page.locator('select[name="hours"]')
    await hoursDropdown.selectOption('4') // Выбираем 4 часа
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
    await page.waitForTimeout(1000)

    // Нажатие на кнопку следующего шага
    const nextButton = page.locator('button.next_step_button')
    await nextButton.click({ force: true })
    
    // СontactPage
    // Ожидаем исчезновения лоадера, если он отображается при загрузке страницы
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 10000 })
    await page.waitForURL(/contact/)

    // Заполнение данных
    await page.type('input[placeholder="First Name*"]', testData.passengerName, { delay: 180 })
    await page.waitForTimeout(1100)
    await page.type('input[placeholder="Last Name*"]', testData.passengerName, { delay: 180 })
    await page.waitForTimeout(1200)
    const uniqueEmail = generateUniqueEmail()
    await page.type('input[placeholder="E-mail Address*"]', uniqueEmail, { delay: 180 })
    await page.waitForTimeout(1300)
    await page.locator('.vue-tel-input input').type(testData.phone, { delay: 180 })
    await page.waitForTimeout(2000)

    // Нажатие кнопки Next
    const submitButton = page.locator('.next_step_button')
    await submitButton.click()

    // VehiclePage
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached'})
    await page.waitForURL(/vehicle/)
    // Проверка наличия списка автомобилей
    // const vehicles = page.locator('//div[@class="vehicle"]')

    // // Убедимся, что их ровно 6
    // await expect(vehicles).toHaveCount(6)

    // Выбор первого автомобиля
    const firstVehicleButton = page.locator('.vehicle .summary_edit_button').first()
    await expect(firstVehicleButton).toHaveText(/Select/i)
    await firstVehicleButton.click()

    // PaymentPage

    // Ожидание перехода на страницу /payment
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached' })
    await page.waitForURL(/payment/)

    // Проверяем отображение общей суммы
    const totalAmount = page.locator('.payment__price')
    await expect(totalAmount).toHaveText(/EUR/)

    // Проверяем наличие чекбокса "Create Personal Account After Payment"
    const accountCheckbox = page.locator('input[type="checkbox"]')
    await expect(accountCheckbox).toBeVisible()

    // Проверяем корректность отображения текста чекбокса
    const checkboxText = page.locator('.account_toggler_text')
    await expect(checkboxText).toHaveText(
      'Create Personal Account After Payment, it will facilitate you a lot if you book other services, and it requires no further data entry, only 1 click!'
    )

    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.

    // Проверяем, что таймер отображается
    const timer = page.locator('#countdown_wrap')
    await expect(timer).toBeVisible()

    // Убедиться, что форма оплаты загружена
    await expect(page.locator('#payment-form')).toBeVisible()

    // Ожидание появления iframe
    await page.waitForSelector('iframe[title="Secure payment input frame"]')
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]')

    // Проверить, что поле ввода номера карты доступно
    await expect(stripeFrame.locator('input[name="number"]')).toBeVisible()

    // Заполнение полей внутри iframe
    await stripeFrame.locator('input[name="number"]').type('4242 4242 4242 4242', { delay: 180 }) // Тестовая карта
    await page.waitForTimeout(1100)
    await stripeFrame.locator('input[name="expiry"]').type('12 / 34', { delay: 180 }) // Тестовый срок действия
    await page.waitForTimeout(1200)
    await stripeFrame.locator('input[name="cvc"]').type('123', { delay: 180 }) // Тестовый CVC
    await page.waitForTimeout(1500)
    // Имитация ухода с поля, как делает юзер
    await stripeFrame.locator('input[name="cvc"]').blur();
    await page.waitForTimeout(1000);
    await page.click('body');
    await page.waitForTimeout(1000);

    // await page.waitForTimeout(9000) // Необходимо для ожидания обновления интерфейса после выбора.

    // Нажать на кнопку оплаты
    await page.locator('[data-testid="paymentPage-submit"]').click()

    // ContactDataPage
    
    // Ожидаем автоматического перехода на ContactDataPage после оплаты
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached', timeout: 15000 })
    await page.waitForURL(/contactData/, { timeout: 30000 })

    // Нажимаем кнопку отправки без заполнения формы
    await page.click('[data-testid="contactDataPage-button"]')

    // Проверяем, что отображаются ошибки валидации
    const errorMessages = await page.locator('.wrapper.h-max.w-full.max-w-2xl.rounded-lg').innerText()
    expect(errorMessages).toContain('Select an appeal option')

    // Закрытие модального окна
    await page.click('button[aria-label="close"]')

    // Заполнение формы
    await page.fill('input[placeholder="First name*"]', 'Test')
    await page.fill('input[placeholder="Last name*"]', 'Test')
    await page.selectOption('select', { label: 'United States' })
    await page.fill('input[placeholder="City"]', 'New York')
    // await page.fill('input[placeholder="Enter a phone number"]', '12345678901')

    // Проверка функциональности дропдауна
    await page.click('p[class=\'text-[#878787]\']')
    const dropdownOption = page.locator('div:nth-child(6)')
    await dropdownOption.click()

    // Отправка формы
    await page.click('text=Go to next step')

    // ServiceDataPage

    //Проверка успешного перехода
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached' })
    await page.waitForURL(/serviceData/)


    const passengersInput = page.locator('[data-testid="passengers"]')
    await passengersInput.fill('3')
    await expect(passengersInput).toHaveValue('3')

    // Заполнение имени пассажиров
    const passengersName = page.locator('input[placeholder=\'for example: They are my spouse, fiance, family, boss, colleague, client, etc\']')
    await passengersName.fill(testData.passengerName)
    await expect(passengersName).toHaveValue(testData.passengerName)

    // Выбор языка
    const languageSelect = page.locator('select[name="select"]')
    await languageSelect.selectOption('Spanish')
    await expect(languageSelect).toHaveValue('Spanish')

    // Добавление крупного багажа
    const incrementLargeLuggage = page.locator('[data-testid="button-plus"]').nth(0)
    await incrementLargeLuggage.click()
    await incrementLargeLuggage.click() // 2 раза
    const largeLuggageInput = page.locator('#large-luggage')
    await expect(largeLuggageInput).toHaveValue('2')

    // Заполнение места отправления
    const pickupInputServices = page.locator('[data-testid="pickup-specifics"]')
    await pickupInputServices.fill('Central Station')
    await expect(pickupInputServices).toHaveValue('Central Station')

    // Выбор радиокнопки (уведомления)
    const notificationYes = page.locator('input[value="Yes"]').first()
    await notificationYes.click()
    await expect(notificationYes).toBeChecked()

    // Отправка формы
    const submitButtonServices = page.locator('.dgt-theme-btn')
    await submitButtonServices.click()

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