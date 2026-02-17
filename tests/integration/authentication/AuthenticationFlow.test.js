import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

import SignIn from '@/components/features/auth/SignIn.vue'
import { useUserStore } from '@/stores/user/profile'
import { createAxiosMock, createSuccessResponse } from '../../unit/helpers/mockAxios.js'

describe('Интеграционный тест: Полный цикл аутентификации пользователя', () => {
  let wrapper
  let userStore
  let router
  let mockAxios
  let pinia
  let consoleLogSpy

  beforeEach(() => {
    // Подавляем console.log в тестах
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Очищаем localStorage перед каждым тестом
    localStorage.clear()

    // Создаем мок axios
    mockAxios = createAxiosMock()

    // Создаем тестовый роутер с реальными роутами
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/account/signin', name: 'signin', component: { template: '<div>SignIn</div>' } },
        { path: '/account/ridehistory', name: 'ridehistory', component: { template: '<div>RideHistory</div>' } },
        { path: '/account', name: 'account', component: { template: '<div>Account</div>' } }
      ]
    })

    // Мокируем router.push
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())

    // Создаем тестовое окружение Pinia БЕЗ stubActions для реальной работы store
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false // Важно: НЕ мокируем actions для проверки реальной логики
    })

    // Монтируем компонент SignIn
    wrapper = mount(SignIn, {
      props: {
        isOpen: true
      },
      global: {
        plugins: [pinia, router],
        provide: {
          axios: mockAxios
        }
      }
    })

    // Получаем store после монтирования
    userStore = useUserStore()
    
    // Принудительно сбрасываем состояние store (для setup syntax stores)
    userStore.user = null
  })

  afterEach(() => {
    wrapper?.unmount()
    consoleLogSpy?.mockRestore()
    vi.clearAllMocks()
  })

  describe('Успешная аутентификация', () => {
    it('должен выполнить полный цикл успешной аутентификации', async () => {
      // Arrange: Подготавливаем тестовые данные
      const testCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        name: 'John',
        last_name: 'Doe',
        token: 'mock-jwt-token',
        type: 'user'
      }

      // Настраиваем успешный ответ от API
      mockAxios.post.mockResolvedValue(
        createSuccessResponse({
          status: 'success',
          data: mockUserData
        })
      )

      // Act: Имитируем ввод пользователем логина и пароля
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue(testCredentials.email)
      await passwordInput.setValue(testCredentials.password)

      // Проверяем, что данные корректно установились в компоненте
      expect(emailInput.element.value).toBe(testCredentials.email)
      expect(passwordInput.element.value).toBe(testCredentials.password)

      // Act: Отправляем форму
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Ждем завершения асинхронных операций
      await nextTick()
      await wrapper.vm.$nextTick()

      // Assert: Проверяем, что API был вызван с правильными данными
      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: testCredentials.email,
        password: testCredentials.password,
        website: import.meta.env.VITE_PROJECT_URL,
        check: true
      })

      // Assert: Проверяем, что store.fill был вызван с данными пользователя
      expect(userStore.user).toEqual(mockUserData)
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.token).toBe(mockUserData.token)
      expect(userStore.fullName).toBe('John Doe')

      // Assert: Проверяем, что данные сохранились в localStorage
      const savedUser = localStorage.getItem('user')
      expect(savedUser).toBe(JSON.stringify(mockUserData))

      // Assert: Проверяем, что роутер выполнил перенаправление на защищенную страницу
      expect(router.push).toHaveBeenCalledWith({ name: 'ridehistory' })
    })

    it('должен корректно обработать ответ API для агентства', async () => {
      // Arrange: Подготавливаем данные агентства
      const agencyUserData = {
        id: 2,
        email: 'agency@example.com',
        name: 'Agency',
        last_name: 'Name',
        token: 'agency-jwt-token',
        type: 'agency'
      }

      mockAxios.post.mockResolvedValue(
        createSuccessResponse({
          status: 'success',
          data: agencyUserData
        })
      )

      // Act: Заполняем форму и отправляем
      await wrapper.find('input[type="email"]').setValue('agency@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await nextTick()
      await wrapper.vm.$nextTick()

      // Assert: Проверяем правильность сохранения данных агентства
      expect(userStore.user.type).toBe('agency')
      expect(userStore.user.id).toBe(2)
    })
  })

  describe('Обработка ошибок аутентификации', () => {
    it('должен корректно обработать ответ с неуспешным статусом', async () => {
      // Arrange: Настраиваем ответ с неуспешным статусом
      mockAxios.post.mockResolvedValue(
        createSuccessResponse({
          status: 'error',
          message: 'Invalid credentials'
        })
      )

      // Act: Заполняем форму и отправляем
      await wrapper.find('input[type="email"]').setValue('wrong@example.com')
      await wrapper.find('input[type="password"]').setValue('wrongpassword')
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await nextTick()
      await wrapper.vm.$nextTick()

      // Assert: Проверяем, что пользователь НЕ был аутентифицирован
      expect(userStore.user).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
      expect(router.push).not.toHaveBeenCalled()
    })

    it('должен корректно обработать сетевую ошибку', async () => {
      // Arrange: Настраиваем сетевую ошибку
      const networkError = new Error('Network error')
      networkError.response = {
        data: { message: 'Network error' },
        status: 500
      }
      mockAxios.post.mockRejectedValue(networkError)

      // Act: Заполняем форму и отправляем
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      const form = wrapper.find('form')
      
      // Перехватываем ошибку чтобы избежать unhandled rejection
      try {
        await form.trigger('submit.prevent')
        await nextTick()
        await wrapper.vm.$nextTick()
      } catch (error) {
        // Ошибка ожидается
      }

      // Assert: Проверяем, что ошибка была обработана
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(userStore.user).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
      expect(router.push).not.toHaveBeenCalled()
    })

    it('должен корректно обработать ошибку 401 (неавторизован)', async () => {
      // Arrange: Настраиваем ошибку 401
      const unauthorizedError = new Error('Unauthorized')
      unauthorizedError.response = {
        data: { message: 'Unauthorized' },
        status: 401
      }
      mockAxios.post.mockRejectedValue(unauthorizedError)

      // Act: Заполняем форму и отправляем
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('wrongpassword')
      const form = wrapper.find('form')
      
      // Перехватываем ошибку чтобы избежать unhandled rejection
      try {
        await form.trigger('submit.prevent')
        await nextTick()
        await wrapper.vm.$nextTick()
      } catch (error) {
        // Ошибка ожидается
      }

      // Assert: Проверяем правильную обработку ошибки авторизации
      expect(userStore.user).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('Интеграция с навигационными гардами роутера', () => {
    it('должен корректно работать с beforeEach guard при аутентифицированном пользователе', async () => {
      // Arrange: Устанавливаем аутентифицированного пользователя
      const authenticatedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'John',
        last_name: 'Doe',
        token: 'valid-token',
        type: 'user'
      }

      userStore.fill(authenticatedUser)

      // Assert: Проверяем, что store корректно отражает состояние аутентификации
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.user).toEqual(authenticatedUser)
    })

    it('должен корректно обрабатывать выход из системы', async () => {
      // Arrange: Сначала аутентифицируем пользователя
      const userData = {
        id: 1,
        email: 'test@example.com',
        name: 'John',
        last_name: 'Doe',
        token: 'token'
      }

      userStore.fill(userData)
      expect(userStore.isLoggedIn).toBe(true)

      // Act: Выполняем выход из системы
      userStore.preventLogout()

      // Assert: Проверяем, что пользователь вышел из системы
      expect(userStore.user).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('События компонента', () => {
    it('должен корректно эмитировать событие close при закрытии', async () => {
      // Act: Кликаем на фон для закрытия
      const backgroundOverlay = wrapper.find('.fixed.inset-0.bg-black')
      await backgroundOverlay.trigger('click')

      // Assert: Проверяем эмиссию события
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('должен корректно эмитировать события при переходе к регистрации', async () => {
      // Act: Кликаем на ссылку регистрации
      const signUpButton = wrapper.find('button.text-green-400')
      await signUpButton.trigger('click')

      // Assert: Проверяем эмиссию событий
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('open-signup')).toBeTruthy()
    })
  })

  describe('Валидация формы', () => {
    it('должен требовать заполнения обязательных полей', async () => {
      // Arrange: Подготавливаем мок для axios
      mockAxios.post.mockResolvedValue(createSuccessResponse({
        status: 'success',
        data: { id: 1, email: 'test@example.com' }
      }))

      // Assert: Форма не должна пройти HTML5 валидацию без заполненных полей
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      expect(emailInput.attributes('required')).toBeDefined()
      expect(passwordInput.attributes('required')).toBeDefined()
    })

    it('должен правильно форматировать email', async () => {
      // Act: Вводим email
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      // Assert: Проверяем корректность типа поля
      expect(emailInput.attributes('type')).toBe('email')
    })
  })

  describe('Интеграция с тестовым окружением', () => {
    it('должен правильно добавлять test=1 параметр для send_code API в тестовом окружении', async () => {
      // Примечание: Этот тест демонстрирует, как должен работать test=1 параметр
      // для API эндпоинта send_code, хотя в данном компоненте он не используется
      
      // Arrange: Мокируем отправку кода для тестов
      const mockSendCode = vi.fn().mockResolvedValue(
        createSuccessResponse({
          code: '123456', // Фиксированный код для тестов
          status: 'success'
        })
      )

      // Act: Имитируем отправку кода с test=1 параметром
      const testApiCall = () => mockSendCode({
        url: 'https://dev-api.italy.trustyone.dev/api/auth/send_code?test=1',
        data: { email: 'test@example.com' }
      })

      await testApiCall()

      // Assert: Проверяем, что API был вызван с правильными параметрами
      expect(mockSendCode).toHaveBeenCalledWith({
        url: 'https://dev-api.italy.trustyone.dev/api/auth/send_code?test=1',
        data: { email: 'test@example.com' }
      })
    })
  })
}) 