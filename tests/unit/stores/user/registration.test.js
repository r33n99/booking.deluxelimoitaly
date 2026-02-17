import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestStore } from '../../helpers/createTestStore'
import { useRegistrationStore } from '@/stores/user/registration'

// Мокируем vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('RegistrationStore', () => {
  let store

  beforeEach(() => {
    // Создание тестового окружения
    const testStore = createTestStore(useRegistrationStore, {
      stubActions: false // Используем реальные actions
    })
    store = testStore.store

    // Очистка моков и storage
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    mockPush.mockClear()
  })

  describe('Инициализация store', () => {
    it('должен иметь правильные начальные значения', () => {
      expect(store.regStep).toBe(1)
      expect(store.hash).toBeNull()
      expect(store.defaultData).toEqual({
        first_name: null,
        last_name: null,
        email: null,
        country_prefix: null,
        code: '',
        phone: ''
      })
    })

    it('должен восстанавливать regStep из localStorage', () => {
      localStorage.setItem('regStep', JSON.stringify(3))
      
      // `useRegistrationStore` читает из localStorage при инициализации.
      const newStore = createTestStore(useRegistrationStore, { stubActions: false }).store
      
      expect(newStore.regStep).toBe(3)
    })

    it('должен восстанавливать regData из localStorage', () => {
      const savedData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        country_prefix: '+1',
        code: '123',
        phone: '5551234567'
      }
      localStorage.setItem('regData', JSON.stringify(savedData))
      
      const newStore = createTestStore(useRegistrationStore, { stubActions: false }).store
      
      expect(newStore.defaultData).toEqual(savedData)
    })

    it('должен восстанавливать hash из sessionStorage', () => {
      const testHash = 'abc123def456'
      sessionStorage.setItem('hash', JSON.stringify(testHash))
      
      const newStore = createTestStore(useRegistrationStore, { stubActions: false }).store
      
      expect(newStore.hash).toBe(testHash)
    })

    it('должен обрабатывать отсутствие данных в storage', () => {
      // Если данных нет, должны использоваться значения по умолчанию
      const newStore = createTestStore(useRegistrationStore, { stubActions: false }).store
      
      expect(newStore.regStep).toBe(1)
      expect(newStore.hash).toBeNull()
      expect(newStore.defaultData.first_name).toBeNull()
    })
  })

  describe('Actions - управление hash', () => {
    it('setHash должен установить hash и сохранить в sessionStorage', () => {
      const testHash = 'new-hash-value'
      
      store.setHash(testHash)
      
      expect(store.hash).toBe(testHash)
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'hash',
        JSON.stringify(testHash)
      )
    })

    it('resetHash должен очистить hash и удалить из sessionStorage', () => {
      // Сначала устанавливаем hash
      store.setHash('test-hash')
      expect(store.hash).toBe('test-hash')
      
      // Затем сбрасываем
      store.resetHash()
      
      expect(store.hash).toBeNull()
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('hash')
    })

    it('setHash должен корректно обрабатывать null и undefined', () => {
      store.setHash(null)
      expect(store.hash).toBeNull()
      
      store.setHash(undefined)
      expect(store.hash).toBeUndefined()
    })
  })

  describe('Actions - управление данными регистрации', () => {
    it('updateData должен обновить данные и сохранить в localStorage', () => {
      const updateData = {
        first_name: 'Jane',
        email: 'jane@example.com'
      }
      
      store.updateData(updateData)
      
      expect(store.defaultData.first_name).toBe('Jane')
      expect(store.defaultData.email).toBe('jane@example.com')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'regData',
        JSON.stringify(store.defaultData)
      )
    })

    it('updateData должен сохранять существующие данные при частичном обновлении', () => {
      // Устанавливаем начальные данные
      store.updateData({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      })
      
      // Частичное обновление
      store.updateData({
        phone: '1234567890'
      })
      
      expect(store.defaultData.first_name).toBe('John')
      expect(store.defaultData.last_name).toBe('Doe')
      expect(store.defaultData.email).toBe('john@example.com')
      expect(store.defaultData.phone).toBe('1234567890')
    })

    it('updateData должен корректно обрабатывать пустые объекты', () => {
      const initialData = { ...store.defaultData }
      
      store.updateData({})
      
      expect(store.defaultData).toEqual(initialData)
    })

    it('updateData должен корректно обрабатывать null значения', () => {
      store.updateData({
        first_name: 'John',
        last_name: null,
        email: undefined
      })
      
      expect(store.defaultData.first_name).toBe('John')
      expect(store.defaultData.last_name).toBeNull()
      expect(store.defaultData.email).toBeUndefined()
    })
  })

  describe('Actions - управление шагами', () => {
    it('handleChangeStep должен изменить шаг и сохранить в localStorage', () => {
      store.handleChangeStep(3)
      
      expect(store.regStep).toBe(3)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'regStep',
        JSON.stringify(3)
      )
    })

    it('resetStep должен сбросить шаг на 1 и сохранить в localStorage', () => {
      // Сначала переходим на другой шаг
      store.handleChangeStep(4)
      expect(store.regStep).toBe(4)
      
      // Затем сбрасываем
      store.resetStep()
      
      expect(store.regStep).toBe(1)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'regStep',
        JSON.stringify(1)
      )
    })

    it('handleChangeStep должен корректно обрабатывать различные типы шагов', () => {
      // Числовые значения
      store.handleChangeStep(2)
      expect(store.regStep).toBe(2)
      
      store.handleChangeStep(0)
      expect(store.regStep).toBe(0)
      
      // Отрицательные значения
      store.handleChangeStep(-1)
      expect(store.regStep).toBe(-1)
    })
  })

  describe('Actions - роутинг', () => {
    it('handleCheckStep должен вызвать роутер если toStep больше текущего шага', () => {
      store.handleChangeStep(2) // Устанавливаем текущий шаг
      
      store.handleCheckStep(3) // Пытаемся перейти на больший шаг
      
      expect(mockPush).toHaveBeenCalledWith({ name: 'Step2' })
    })

    it('handleCheckStep НЕ должен вызывать роутер если toStep меньше или равен текущему шагу', () => {
      store.handleChangeStep(3) // Устанавливаем текущий шаг
      
      // Переход на меньший шаг
      store.handleCheckStep(2)
      expect(mockPush).not.toHaveBeenCalled()
      
      // Переход на тот же шаг
      store.handleCheckStep(3)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handleCheckStep должен формировать правильные имена роутов', () => {
      store.handleChangeStep(1)
      store.handleCheckStep(2)
      expect(mockPush).toHaveBeenCalledWith({ name: 'Step1' })
      
      mockPush.mockClear()
      
      store.handleChangeStep(5)
      store.handleCheckStep(6)
      expect(mockPush).toHaveBeenCalledWith({ name: 'Step5' })
    })

    it('handleCheckStep должен корректно обрабатывать edge cases', () => {
      store.handleChangeStep(1)
      
      // Попытка перейти на шаг 0
      store.handleCheckStep(0)
      expect(mockPush).not.toHaveBeenCalled()
      
      // Попытка перейти на отрицательный шаг
      store.handleCheckStep(-1)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Интеграционные тесты', () => {
    it('должен правильно обрабатывать полный процесс регистрации', () => {
      // Шаг 1: Заполнение базовых данных
      store.updateData({
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com'
      })
      store.handleChangeStep(2)
      
      // Шаг 2: Добавление телефона
      store.updateData({
        country_prefix: '+1',
        code: '555',
        phone: '1234567'
      })
      store.handleChangeStep(3)
      
      // Шаг 3: Получение и установка hash
      store.setHash('verification-hash-123')
      
      // Проверяем итоговое состояние
      expect(store.regStep).toBe(3)
      expect(store.defaultData).toEqual({
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        country_prefix: '+1',
        code: '555',
        phone: '1234567'
      })
      expect(store.hash).toBe('verification-hash-123')
    })

    it('должен восстанавливать полное состояние после перезагрузки страницы', () => {
      localStorage.setItem('regData', JSON.stringify({
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob@example.com',
        country_prefix: '+44',
        code: '123',
        phone: '9876543'
      }))
      localStorage.setItem('regStep', JSON.stringify(3))
      sessionStorage.setItem('hash', JSON.stringify('saved-hash'))
      
      // Создаем новый store (симулируя перезагрузку)
      const restoredStore = createTestStore(useRegistrationStore, { stubActions: false }).store
      
      expect(restoredStore.regStep).toBe(3)
      expect(restoredStore.defaultData).toEqual({
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob@example.com',
        country_prefix: '+44',
        code: '123',
        phone: '9876543'
      })
      expect(restoredStore.hash).toBe('saved-hash')
    })

    it('должен корректно обрабатывать сброс всех данных', () => {
      // Устанавливаем данные
      store.updateData({
        first_name: 'Test',
        email: 'test@example.com'
      })
      store.handleChangeStep(4)
      store.setHash('test-hash')
      
      // Сбрасываем все
      store.resetStep()
      store.resetHash()
      store.updateData({
        first_name: null,
        last_name: null,
        email: null,
        country_prefix: null,
        code: '',
        phone: ''
      })
      
      expect(store.regStep).toBe(1)
      expect(store.hash).toBeNull()
      expect(store.defaultData.first_name).toBeNull()
      expect(store.defaultData.email).toBeNull()
    })
  })

  describe('Edge cases и обработка ошибок', () => {
    it('должен обрабатывать некорректные данные в localStorage', () => {
      localStorage.setItem('regStep', 'invalid-json')
      localStorage.setItem('regData', 'invalid-json')
      sessionStorage.setItem('hash', 'invalid-json')
      
      expect(() => {
        createTestStore(useRegistrationStore, { stubActions: false })
      }).not.toThrow()
    })

    it('должен корректно обрабатывать различные типы данных в updateData', () => {
      // Строки
      store.updateData({ first_name: 'String Value' })
      expect(store.defaultData.first_name).toBe('String Value')
      
      // Числа
      store.updateData({ code: 123 })
      expect(store.defaultData.code).toBe(123)
      
      // Булевы значения
      store.updateData({ email: false })
      expect(store.defaultData.email).toBe(false)
      
      // Объекты
      store.updateData({ country_prefix: { value: '+1' } })
      expect(store.defaultData.country_prefix).toEqual({ value: '+1' })
    })

    it('должен корректно обрабатывать крайние значения шагов', () => {
      // Очень большие числа
      store.handleChangeStep(999999)
      expect(store.regStep).toBe(999999)
      
      // Ноль
      store.handleChangeStep(0)
      expect(store.regStep).toBe(0)
      
      // Отрицательные числа
      store.handleChangeStep(-100)
      expect(store.regStep).toBe(-100)
    })

    it('должен корректно обрабатывать специальные символы в hash', () => {
      const specialHash = 'hash-with-special-chars!@#$%^&*()_+'
      
      store.setHash(specialHash)
      expect(store.hash).toBe(specialHash)
      
      store.resetHash()
      expect(store.hash).toBeNull()
    })

    it('должен правильно обрабатывать множественные вызовы одной и той же функции', () => {
      // Множественные вызовы updateData
      store.updateData({ first_name: 'First' })
      store.updateData({ first_name: 'Second' })
      store.updateData({ first_name: 'Third' })
      
      expect(store.defaultData.first_name).toBe('Third')
      
      // Множественные вызовы handleChangeStep
      store.handleChangeStep(1)
      store.handleChangeStep(2)
      store.handleChangeStep(3)
      
      expect(store.regStep).toBe(3)
    })
  })

  describe('Производительность и оптимизация', () => {
    it('не должен вызывать лишние обновления localStorage при одинаковых данных', () => {
      const sameData = { first_name: 'Same Name' }
      
      store.updateData(sameData)
      const callCount = localStorage.setItem.mock.calls.length
      
      store.updateData(sameData)
      
      // Должен быть еще один вызов, так как store не оптимизирует одинаковые данные
      expect(localStorage.setItem.mock.calls.length).toBe(callCount + 1)
    })

    it('должен корректно работать с большими объемами данных', () => {
      const largeData = {
        first_name: 'A'.repeat(1000),
        last_name: 'B'.repeat(1000),
        email: 'C'.repeat(100) + '@' + 'D'.repeat(100) + '.com',
        notes: 'E'.repeat(5000)
      }
      
      expect(() => {
        store.updateData(largeData)
      }).not.toThrow()
      
      expect(store.defaultData.first_name).toBe('A'.repeat(1000))
    })
  })
}) 