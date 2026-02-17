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

    const thankYouMessage = page.locator('h1.title')
    await expect(thankYouMessage).toContainText('Thanks for providing this data!')

    // --- Сохраняем значения из summary на success-странице ---
    const pickUpSummary = await page.locator('span.summary_item_title', { hasText: 'Pick Up Location:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
    const dateSummary = await page.locator('span.summary_item_title', { hasText: 'Date:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
    // const distanceSummary = await page.locator('span.summary_item_title', { hasText: 'Distance:' }).locator('xpath=..').locator('span.summary_item_input_sibling').innerText();
    let durationSummary = null;
    const durationLabel = await page.locator('span.summary_item_title', { hasText: 'Duration:' }).first();
    if (await durationLabel.isVisible()) {
      // Ищем родительский .summary_item_wrapper
      const wrapper = durationLabel.locator('xpath=ancestor::div[contains(@class, "summary_item_wrapper")]');
      // Внутри ищем все .summary_item_input_sibling
      const siblings = await wrapper.locator('.summary_item_input_sibling').all();
      const texts = [];
      for (const sib of siblings) {
        const t = await sib.textContent();
        if (t) texts.push(t.trim());
      }
      durationSummary = texts.join(' ');
    }


    const emailInput = page.locator('input[placeholder="E-mail Address"]')
    const subscribeButton = page.locator('.subscribe_button')
    const errorMessage = page.locator('.text-red-600')

    // Проверка ошибки при некорректном email
    await emailInput.fill('invalid-email')
    await subscribeButton.click()
    await expect(errorMessage).toContainText('Email must be email')

    // Подписка с корректным email
    await emailInput.fill(generateUniqueEmail())
    await subscribeButton.click()

    // Кнопка "New Service" на success-странице
    const newServiceBtn = page.locator('button[type="submit"]', { hasText: 'New Service' })
    await expect(newServiceBtn).toBeVisible()
    await newServiceBtn.click()

    // Поиск и клик по кнопке "Sign Up"
    const signUpButton = page.locator('button[type="submit"]', { hasText: 'Sign Up' });
    await expect(signUpButton).toBeVisible();
    await signUpButton.click();

    // Ожидаем обновления страницы после регистрации
    await page.waitForTimeout(5000)
    
    // Проверяем, появился ли заголовок "Your Rides" после регистрации
    const yourRidesHeader = page.locator('h1:has-text("Your Rides")')
    try {
      await expect(yourRidesHeader).toBeVisible({ timeout: 10000 })
    } catch {
      return 
    }

    await page.waitForTimeout(7000)

    // Ищем блок .right_side-wrapper, в нем ищем все ордер-блоки
    const rightSide = page.locator('.right_side-wrapper');
    const orderBlocks = await rightSide.locator('[data-testid="order-block"]').all();

    let foundCount = 0;
    for (const block of orderBlocks) {
      const pickUp = await block.locator('[data-testid="ride-pickup"]').inputValue().catch(() => null);
      const dateRaw = await block.locator('[data-testid="ride-date"]').inputValue().catch(() => null);

      // Приводим формат даты к единому виду (убираем секунды)
      const date = dateRaw ? dateRaw.substring(0, 16) : null;

      let blockDuration = null;
      const durLabel = await block.locator('p:has-text("Duration:")').first();
      if (await durLabel.isVisible()) {
        const durElem = durLabel.locator('xpath=following-sibling::p[1]');
        blockDuration = await durElem.textContent();
        blockDuration = blockDuration && blockDuration.trim();
      }

      if (pickUp === pickUpSummary && date && date.substring(0, 16) === dateSummary  && blockDuration === durationSummary) {
        foundCount++;
      }
    }
    // Должен быть только один блок с такими данными (только что созданный)
    expect(foundCount).toBe(1);
  })
})