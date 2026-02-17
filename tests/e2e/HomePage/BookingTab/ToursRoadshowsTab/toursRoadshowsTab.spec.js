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
    
    // Ожидание появления автодополнений для поля ввода места отправления
    const autocompleteList = page.locator('#autocomplete-list')
    await autocompleteList.waitFor({ state: 'visible', timeout: 10000 })

    // Выбор подходящего значения из автодополнений
    const pickupOption = autocompleteList.locator('text=/Rome.*Metropolitan City of Rome Capital.*Italy/').first()
    await pickupOption.click()

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
    await page.waitForSelector('[data-testid="loader"]', { state: 'detached'})
    await page.waitForURL(/success/)

    // Проверяем заголовок "Thanks for your Request!"
    const thankYouMessage = page.locator('h1.title')
    await expect(thankYouMessage).toContainText("Thanks foryour Request!")

    // --- Сохраняем значения из summary на success-странице ---
    const pickUpSummary = await page.locator('span.summary_item_title', { hasText: 'Pick Up Location:' }).locator('xpath=..').locator('p.summary_item_input').innerText();
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
      const dateRaw = await block.locator('[data-testid="ride-date"]').inputValue().catch(() => null);

      // Приводим формат даты к единому виду (убираем секунды)
      const date = dateRaw ? dateRaw.substring(0, 16) : null;

      if (pickUp === pickUpSummary && date && date.substring(0, 16) === dateSummary) {
        foundCount++;
      }
    }
    // Должен быть только один блок с такими данными (только что созданный)
    expect(foundCount).toBe(1);
  })
})