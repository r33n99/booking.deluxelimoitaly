import { test, expect } from '@playwright/test'
import 'dotenv/config'
import { baseUrl } from '../../../api/api'
import { getNextDayDateTime } from '../../../helpers/getNextDay'
import { testData } from '../../../helpers/mockData'
import { generateUniqueEmail } from '../../../helpers/generateUniqueEmail'

test.describe('OneWayTransfer', () => {

  test('Тестирует форму бронирования OneWayTransferTab', async ({ page }) => {
    // HomePage
    await page.goto(baseUrl)

    // Проверка заголовка
    const header = page.locator('[data-testid="homepage-title"]')
    await expect(header).toHaveText(/Car Service\s*with Private Driver/i)

    // Проверка наличия и нажатие кнопки 'One Way Transfer'
    const oneWayButton = page.locator('.home_form__button.button').first()
    await expect(oneWayButton).toHaveText('One Way Transfer')

    // Ввод места отправления
    await page.locator('input[placeholder=\'Pick Up Location*\']').fill('Rome')

    // Ожидание появления автодополнений для поля ввода места отправления
    const autocompleteList = page.locator('#autocomplete-list')
    await autocompleteList.waitFor({ state: 'visible', timeout: 10000 })

    // Выбор подходящего значения из автодополнений
    const pickupOption = autocompleteList.locator('text=/Rome.*Metropolitan City of Rome Capital.*Italy/').first()
    await pickupOption.click()

    // Ожидание завершения обработки выбора места отправления
    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.

    // Ввод места назначения
    await page.locator('input[placeholder=\'Drop Off Location*\']').fill('Florence, Italy')

    // Ожидание появления автодополнений для поля ввода места назначения
    const dropoffAutocompleteList = page.locator('#autocomplete-list')
    await dropoffAutocompleteList.waitFor({ state: 'visible', timeout: 10000 })

    // Выбор подходящего значения из автодополнений
    const dropoffOption = dropoffAutocompleteList.locator('text=/Florence.*Metropolitan City of Florence.*Italy/').first()
    await dropoffOption.click()

    await page.waitForTimeout(5000) // Необходимо для ожидания обновления интерфейса после выбора.

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
      console.log(dateTime)
    }, nextDayDateTime)

    // Нажатие на кнопку следующего шага
    const nextButton = page.locator('button.next_step_button')
    await nextButton.click()

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

    // VehiclePage
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached' })
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
    await stripeFrame.locator('input[name="number"]').fill('4242 4242 4242 4242') // Тестовая карта
    await stripeFrame.locator('input[name="expiry"]').fill('12 / 34') // Тестовый срок действия
    await stripeFrame.locator('input[name="cvc"]').fill('123') // Тестовый CVC
    // await stripeFrame.locator('select[name="country"]').selectOption('United States') // США

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

    const thankYouMessage = page.locator('h1.title')
    await expect(thankYouMessage).toContainText('Thanks for providing this data!')

    // --- Сохраняем значения из summary на success-странице ---
    const pickUpSummary = await page.locator('span.summary_item_title', { hasText: 'Pick Up Location:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
    const dropOffSummary = await page.locator('span.summary_item_title', { hasText: 'Drop Off Location:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
    const dateSummary = await page.locator('span.summary_item_title', { hasText: 'Date:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
    // const distanceSummary = await page.locator('span.summary_item_title', { hasText: 'Distance:' }).locator('xpath=..').locator('span.summary_item_input_sibling').innerText();

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

    await page.waitForTimeout(5000)

    // Проверка наличия заголовка "Your Rides"
    const yourRidesHeader = page.locator('h1', { hasText: 'Your Rides' });
    await expect(yourRidesHeader).toBeVisible();

    await page.waitForTimeout(7000)
    
    // Ищем блок .right_side-wrapper, в нем ищем все ордер-блоки
    const rightSide = page.locator('.right_side-wrapper');
    const orderBlocks = await rightSide.locator('[data-testid="order-block"]').all();
    
    let foundCount = 0;
    for (const block of orderBlocks) {
      const pickUp = await block.locator('[data-testid="ride-pickup"]').inputValue().catch(() => null);
      const dropOff = await block.locator('[data-testid="ride-dropoff"]').inputValue().catch(() => null);
      const dateRaw = await block.locator('[data-testid="ride-date"]').inputValue().catch(() => null);
      
      // Приводим формат даты к единому виду (убираем секунды)
      const date = dateRaw ? dateRaw.substring(0, 16) : null;
      
      if (pickUp === pickUpSummary && dropOff === dropOffSummary && date && date.substring(0, 16) === dateSummary) {
        foundCount++;
      }
    }
    // Должен быть только один блок с такими данными (только что созданный)
    expect(foundCount).toBe(1);
  })
})