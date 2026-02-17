import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestStore } from '../../helpers/createTestStore'
import { createApiMocker, createSuccessResponse } from '../../helpers/mockAxios'
import { useUserStore } from '@/stores/user/profile'

// Мокируем compose/axios
const mockAxiosGet = vi.fn()
const mockAxiosPatch = vi.fn()
vi.mock('@/compose/axios', () => ({
  useFetcher: vi.fn(() => ({
    axiosInstance: {
      get: mockAxiosGet,
      patch: mockAxiosPatch
    }
  }))
}))

describe('UserStore (Profile)', () => {
  let store

  beforeEach(() => {
    // Очистка моков и storage ДО создания store
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    mockAxiosGet.mockClear()
    mockAxiosPatch.mockClear()

    // Создание тестового окружения
    const testStore = createTestStore(useUserStore, {
      stubActions: false // Используем реальные actions
    })
    store = testStore.store
    
    // Настройка API мокера
    createApiMocker()
  })

  describe('Инициализация store', () => {
    it('должен иметь правильные начальные значения', () => {
      expect(store.user).toBeNull()
      expect(store.agencyData).toEqual({
        pickup: '',
        dropoff: '',
        car: null,
        performance: '',
        number_of_passengers: null,
        main_passenger: '',
        other_language: 'English',
        pickup_specific: '',
        number_suitcases: '',
        notes: '',
        amount: null,
        file_number: '',
        type_of_service: ''
      })
    })

    it('должен восстанавливать данные пользователя из localStorage', () => {
      const userData = {
        id: 1,
        name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        token: 'test-token'
      }
      localStorage.setItem('user', JSON.stringify(userData))
      
      // `useUserStore` при инициализации читает из localStorage.
      // Создаем новый store, чтобы симулировать этот процесс.
      const newStore = createTestStore(useUserStore, { stubActions: false }).store
      
      expect(newStore.user).toEqual(userData)
    })

    it('должен восстанавливать данные агентства из sessionStorage', () => {
      const agencyData = {
        pickup: 'Test Pickup',
        dropoff: 'Test Dropoff',
        car: { id: 1, type: 'sedan' },
        performance: 'high',
        notes: 'Test notes'
      }
      sessionStorage.setItem('agencyData', JSON.stringify(agencyData))
      
      // `useUserStore` также читает из sessionStorage.
      const newStore = createTestStore(useUserStore, { stubActions: false }).store
      
      expect(newStore.agencyData).toEqual(expect.objectContaining(agencyData))
    })

    it('должен обрабатывать отсутствие данных в storage', () => {
      const newStore = createTestStore(useUserStore, { stubActions: false }).store
      
      expect(newStore.user).toBeNull()
      expect(newStore.agencyData.pickup).toBe('')
    })
  })

  describe('Computed свойства', () => {
    it('token должен возвращать токен пользователя', () => {
      store.fill({ id: 1, token: 'user-token-123' })
      
      expect(store.token).toBe('user-token-123')
    })

    it('token должен возвращать undefined если пользователь null', () => {
      store.fill(null)
      
      expect(store.token).toBeUndefined()
    })

    it('isLoggedIn должен возвращать true если пользователь авторизован', () => {
      store.fill({ id: 1, name: 'John' })
      
      expect(store.isLoggedIn).toBe(true)
    })

    it('isLoggedIn должен возвращать false если пользователь не авторизован', () => {
      store.fill(null)
      
      expect(store.isLoggedIn).toBe(false)
    })

    it('isLoggedIn должен возвращать false если у пользователя нет id', () => {
      store.fill({ name: 'John' }) // без id
      
      expect(store.isLoggedIn).toBe(false)
    })

    it('fullName должен возвращать полное имя авторизованного пользователя', () => {
      store.fill({
        id: 1,
        name: 'Jane',
        last_name: 'Smith'
      })
      
      expect(store.fullName).toBe('Jane Smith')
    })

    it('fullName должен возвращать false для неавторизованного пользователя', () => {
      store.fill(null)
      
      expect(store.fullName).toBe(false)
    })

    it('fullName должен корректно обрабатывать пустые имена', () => {
      store.fill({
        id: 1,
        name: '',
        last_name: ''
      })
      
      expect(store.fullName).toBe(' ')
    })
  })

  describe('Actions - управление данными пользователя', () => {
    it('fill должен заполнить данные пользователя и сохранить в localStorage', () => {
      const userData = {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com'
      }
      
      store.fill(userData)
      
      expect(store.user).toEqual(userData)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(userData)
      )
    })

    it('fill должен корректно обрабатывать null', () => {
      store.fill(null)
      
      expect(store.user).toBeNull()
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(null)
      )
    })

    it('update должен обновить данные пользователя частично', () => {
      // Устанавливаем начальные данные
      store.fill({
        id: 1,
        name: 'John',
        email: 'john@example.com',
        phone: '123456789'
      })
      
      // Частичное обновление
      store.update({
        name: 'Johnny',
        phone: '987654321'
      })
      
      expect(store.user).toEqual({
        id: 1,
        name: 'Johnny', // обновлено
        email: 'john@example.com', // сохранено
        phone: '987654321' // обновлено
      })
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(store.user)
      )
    })

    it('update должен корректно обрабатывать обновление когда user null', () => {
      store.fill(null)
      
      store.update({ name: 'New User' })
      
      expect(store.user).toEqual({ name: 'New User' })
    })

    it('preventLogout должен очистить данные пользователя', () => {
      store.fill({ id: 1, name: 'Test User' })
      expect(store.user).not.toBeNull()
      
      store.preventLogout()
      
      expect(store.user).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Actions - управление данными агентства', () => {
    it('updateAgency должен обновить данные агентства и сохранить в sessionStorage', () => {
      const agencyUpdate = {
        pickup: 'New Pickup Location',
        car: { id: 2, type: 'business' },
        notes: 'Special requirements'
      }
      
      store.updateAgency(agencyUpdate)
      
      expect(store.agencyData.pickup).toBe('New Pickup Location')
      expect(store.agencyData.car).toEqual({ id: 2, type: 'business' })
      expect(store.agencyData.notes).toBe('Special requirements')
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'agencyData',
        JSON.stringify(store.agencyData)
      )
    })

    it('updateAgency должен сохранять существующие данные при частичном обновлении', () => {
      // Устанавливаем начальные данные
      store.updateAgency({
        pickup: 'Initial Pickup',
        dropoff: 'Initial Dropoff',
        performance: 'standard'
      })
      
      // Частичное обновление
      store.updateAgency({
        pickup: 'Updated Pickup',
        amount: 100
      })
      
      expect(store.agencyData.pickup).toBe('Updated Pickup')
      expect(store.agencyData.dropoff).toBe('Initial Dropoff')
      expect(store.agencyData.performance).toBe('standard')
      expect(store.agencyData.amount).toBe(100)
    })

    it('clearAgencyData должен очистить данные агентства из sessionStorage', () => {
      store.updateAgency({ pickup: 'Test Location' })
      store.clearAgencyData()
      
      expect(store.agencyData.pickup).toBe('')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('agencyData')
    })
  })

  describe('API-взаимодействие', () => {
    const userData = { id: 1, name: 'John', last_name: 'Doe' }

    it('getUserInfo должен обновить store при успешном запросе', async () => {
      mockAxiosGet.mockResolvedValue({ data: { data: userData } })
      
      await store.getUserInfo()

      expect(mockAxiosGet).toHaveBeenCalledWith('/user/info')
      expect(store.user).toEqual(expect.objectContaining(userData))
    })

    it('getUserInfo не должен изменять store при ошибке запроса', async () => {
      store.fill(null) // Начинаем с чистого состояния
      mockAxiosGet.mockRejectedValue(new Error('Network error'))
      
      try {
        await store.getUserInfo()
      } catch (e) {
        // Ожидаем ошибку
      }

      expect(mockAxiosGet).toHaveBeenCalledWith('/user/info')
      expect(store.user).toBeNull()
    })

    it('editUserSubmit должен обновить store и вернуть true при успехе', async () => {
      const newUserData = { user_id: 1, name: 'Jane' }
      mockAxiosPatch.mockResolvedValue({ data: { success: true } })

      const result = await store.editUserSubmit(newUserData)

      expect(mockAxiosPatch).toHaveBeenCalledWith('/users/1', newUserData)
      expect(store.user).toEqual(expect.objectContaining(newUserData))
      expect(result).toBe(true)
    })

    it('editUserSubmit должен вернуть ошибку и не изменять store при ошибке', async () => {
      store.fill({ user_id: 1, name: 'John' }) // Начальное состояние
      const newUserData = { user_id: 1, name: 'Jane' }
      mockAxiosPatch.mockRejectedValue(new Error('Update failed'))
      
      await expect(store.editUserSubmit(newUserData)).rejects.toThrow('Update failed')

      expect(mockAxiosPatch).toHaveBeenCalledWith('/users/1', newUserData)
      expect(store.user.name).toBe('John') // Убедимся, что имя не изменилось
    })
  })

  describe('Интеграция с storage', () => {
    it('должен восстанавливать полное состояние после перезагрузки', () => {
      // Симулируем сохраненные данные
      const savedUser = {
        id: 2,
        name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      }
      const savedAgency = {
        pickup: 'Saved Pickup',
        dropoff: 'Saved Dropoff',
        performance: 'premium'
      }
      
      localStorage.setItem('user', JSON.stringify(savedUser))
      sessionStorage.setItem('agencyData', JSON.stringify(savedAgency))
      
      // Создаем новый store (симулируя перезагрузку)
      const restoredStore = createTestStore(useUserStore, { stubActions: false }).store
      
      expect(restoredStore.user).toEqual(savedUser)
      expect(restoredStore.agencyData).toEqual(expect.objectContaining(savedAgency))
      expect(restoredStore.isLoggedIn).toBe(true)
      expect(restoredStore.fullName).toBe('Jane Smith')
    })

    it('должен корректно обрабатывать логаут и очистку данных', async () => {
      // Устанавливаем данные пользователя и агентства
      store.fill({ id: 1, name: 'Test User' })
      store.updateAgency({ pickup: 'Test Location' })
      
      expect(store.isLoggedIn).toBe(true)
      
      // Логаут
      store.preventLogout()
      
      expect(store.isLoggedIn).toBe(false)
      expect(store.user).toBeNull()
      expect(store.token).toBeUndefined()
      expect(store.fullName).toBe(false)
      
      // Данные агентства остаются
      expect(store.agencyData.pickup).toBe('Test Location')
    })
  })

  describe('Edge cases', () => {
    it('должен обрабатывать некорректные данные в localStorage', () => {
      localStorage.setItem('user', 'invalid-json')
      sessionStorage.setItem('agencyData', 'invalid-json')
      
      expect(() => {
        createTestStore(useUserStore, { stubActions: false })
      }).not.toThrow()
    })

    it('должен корректно обрабатывать null значения в update', () => {
      store.fill({ id: 1, name: 'Test' })
      
      store.update(null)
      expect(store.user).toBeDefined()
      
      store.update({ name: null })
      expect(store.user.name).toBeNull()
    })

    it('должен корректно обрабатывать пустые объекты', () => {
      store.fill({})
      expect(store.isLoggedIn).toBe(false) // нет id
      
      store.updateAgency({})
      expect(store.agencyData.pickup).toBe('') // значения по умолчанию сохраняются
    })

    it('должен обрабатывать отсутствие callback в editUserSubmit', async () => {
      const updateData = { user_id: 1 }
      
      mockAxiosPatch.mockResolvedValue(createSuccessResponse({}))
      
      expect(() => store.editUserSubmit(updateData)).not.toThrow()
    })

    it('должен корректно обрабатывать специальные символы в данных', () => {
      const userData = {
        id: 1,
        name: 'João',
        last_name: "O'Connor",
        email: 'user+test@example.com'
      }
      
      store.fill(userData)
      expect(store.fullName).toBe("João O'Connor")
      
      store.updateAgency({
        notes: 'Special chars: !@#$%^&*()_+'
      })
      expect(store.agencyData.notes).toBe('Special chars: !@#$%^&*()_+')
    })
  })
}) 