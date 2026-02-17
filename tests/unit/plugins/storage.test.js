import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import storage from '@/plugins/storage'

describe('storage plugin', () => {
  let mockLocalStorage

  beforeEach(() => {
         // Создаем мок localStorage
     mockLocalStorage = {
       store: {},
       getItem: vi.fn((key) => Object.prototype.hasOwnProperty.call(mockLocalStorage.store, key) ? mockLocalStorage.store[key] : null),
       setItem: vi.fn((key, value) => {
         mockLocalStorage.store[key] = value
       }),
       removeItem: vi.fn((key) => {
         delete mockLocalStorage.store[key]
       })
     }

    // Заменяем глобальный localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // Очищаем store перед каждым тестом
    mockLocalStorage.store = {}
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getKeys', () => {
    it('должен возвращать объект с значениями для переданных ключей', () => {
      // Заполняем localStorage
      mockLocalStorage.store = {
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
      }

      const result = storage.getKeys(['key1', 'key2'])

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2'
      })
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key1')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key2')
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(2)
    })

    it('должен возвращать null для несуществующих ключей', () => {
      const result = storage.getKeys(['nonexistent1', 'nonexistent2'])

      expect(result).toEqual({
        nonexistent1: null,
        nonexistent2: null
      })
    })

    it('должен обрабатывать пустой массив ключей', () => {
      const result = storage.getKeys([])

      expect(result).toEqual({})
    })

    it('должен обрабатывать смесь существующих и несуществующих ключей', () => {
      mockLocalStorage.store = {
        'existing': 'value'
      }

      const result = storage.getKeys(['existing', 'nonexistent'])

      expect(result).toEqual({
        existing: 'value',
        nonexistent: null
      })
    })

         it('должен возвращать Error для non-array input', () => {
       // Строка не является объектом
       const result1 = storage.getKeys('string')
       expect(result1).toBeInstanceOf(Error)
       expect(result1.message).toBe('Expect array input keys')
       
       // Число не является объектом
       const result2 = storage.getKeys(123)
       expect(result2).toBeInstanceOf(Error)
       
       // null проходит typeof === 'object' и попадает в reduce блок
       expect(() => storage.getKeys(null)).toThrow('Cannot read properties of null')
       
       // {} является объектом и проходит typeof check, но у него нет reduce
       expect(() => storage.getKeys({})).toThrow('keys.reduce is not a function')
     })
  })

  describe('fillOutKeys', () => {
    it('должен заполнять объект значениями из localStorage', () => {
      mockLocalStorage.store = {
        'name': 'John',
        'email': 'john@example.com',
        'age': '30'
      }

      const data = {
        name: null,
        email: null,
        age: null,
        phone: null
      }

      const result = storage.fillOutKeys(data)

      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: '30',
        phone: null
      })
      expect(result).toBe(data) // Должен модифицировать исходный объект
    })

    it('должен перезаписывать существующие значения', () => {
      mockLocalStorage.store = {
        'name': 'John from localStorage'
      }

      const data = {
        name: 'Original John',
        email: 'original@example.com'
      }

      const result = storage.fillOutKeys(data)

      expect(result.name).toBe('John from localStorage')
      expect(result.email).toBe(null) // email не в localStorage
    })

    it('должен обрабатывать пустой объект', () => {
      const data = {}
      const result = storage.fillOutKeys(data)

      expect(result).toEqual({})
    })

    it('должен обрабатывать объект с ключами, не существующими в localStorage', () => {
      const data = {
        nonexistent1: 'value1',
        nonexistent2: 'value2'
      }

      const result = storage.fillOutKeys(data)

      expect(result).toEqual({
        nonexistent1: null,
        nonexistent2: null
      })
    })
  })

  describe('getItem', () => {
    it('должен возвращать значение для существующего ключа', () => {
      mockLocalStorage.store['testKey'] = 'testValue'

      const result = storage.getItem('testKey')

      expect(result).toBe('testValue')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey')
    })

    it('должен возвращать null для несуществующего ключа', () => {
      const result = storage.getItem('nonexistent')

      expect(result).toBe(null)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('nonexistent')
    })

    it('должен правильно передавать вызов в localStorage.getItem', () => {
      storage.getItem('anyKey')

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('anyKey')
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('setItem', () => {
    it('должен устанавливать значение для ключа', () => {
      const result = storage.setItem('testKey', 'testValue')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue')
      expect(mockLocalStorage.store['testKey']).toBe('testValue')
      expect(result).toBeUndefined() // localStorage.setItem не возвращает значение
    })

    it('должен обрабатывать различные типы значений', () => {
      storage.setItem('string', 'value')
      storage.setItem('number', 123)
      storage.setItem('boolean', true)
      storage.setItem('null', null)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('string', 'value')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('number', 123)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('boolean', true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('null', null)
    })

    it('должен перезаписывать существующие значения', () => {
      storage.setItem('key', 'oldValue')
      storage.setItem('key', 'newValue')

      expect(mockLocalStorage.store['key']).toBe('newValue')
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('removeItem', () => {
    it('должен удалять существующий ключ', () => {
      mockLocalStorage.store['testKey'] = 'testValue'

      const result = storage.removeItem('testKey')

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey')
      expect(mockLocalStorage.store['testKey']).toBeUndefined()
      expect(result).toBeUndefined()
    })

    it('должен обрабатывать удаление несуществующего ключа', () => {
      const result = storage.removeItem('nonexistent')

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeUndefined()
    })

    it('должен правильно передавать вызов в localStorage.removeItem', () => {
      storage.removeItem('anyKey')

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('anyKey')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('интеграционные тесты', () => {
    it('должен работать в связке setItem -> getItem', () => {
      storage.setItem('integrationKey', 'integrationValue')
      const result = storage.getItem('integrationKey')

      expect(result).toBe('integrationValue')
    })

    it('должен работать в связке setItem -> removeItem -> getItem', () => {
      storage.setItem('tempKey', 'tempValue')
      expect(storage.getItem('tempKey')).toBe('tempValue')

      storage.removeItem('tempKey')
      expect(storage.getItem('tempKey')).toBe(null)
    })

    it('должен работать с getKeys после setItem', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')

      const result = storage.getKeys(['key1', 'key2', 'key3'])

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: null
      })
    })

    it('должен работать с fillOutKeys после setItem', () => {
      storage.setItem('name', 'Alice')
      storage.setItem('age', '25')

      const data = {
        name: null,
        age: null,
        email: null
      }

      const result = storage.fillOutKeys(data)

      expect(result).toEqual({
        name: 'Alice',
        age: '25',
        email: null
      })
    })
  })

  describe('edge cases', () => {
    it('должен обрабатывать специальные символы в ключах', () => {
      const specialKey = 'key-with_special.symbols:123'
      storage.setItem(specialKey, 'specialValue')

      expect(storage.getItem(specialKey)).toBe('specialValue')
    })

         it('должен обрабатывать пустые строки как ключи и значения', () => {
       storage.setItem('', 'emptyKey')
       storage.setItem('emptyValue', '')

       expect(storage.getItem('')).toBe('emptyKey')
       expect(storage.getItem('emptyValue')).toBe('') // localStorage может сохранить пустую строку
     })

    it('должен обрабатывать Unicode символы', () => {
      storage.setItem('🔑', '🎯')
      expect(storage.getItem('🔑')).toBe('🎯')

      storage.setItem('ключ', 'значение')
      expect(storage.getItem('ключ')).toBe('значение')
    })
  })
}) 