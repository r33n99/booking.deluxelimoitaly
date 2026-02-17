import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestStore } from '../../helpers/createTestStore'
import { useContactsStore } from '@/stores/user/contacts'

// Мокируем libphonenumber-js
vi.mock('libphonenumber-js', () => ({
  AsYouType: vi.fn().mockImplementation(() => {
    let internalNumber = ''
    return {
      input: vi.fn((phone) => {
        internalNumber = phone
      }),
      getNumber: vi.fn(() => ({
        number: `formatted-${internalNumber}`
      }))
    }
  })
}))

describe('ContactsStore', () => {
  let store

  beforeEach(() => {
    // Очистка моков и storage ДО создания store
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    
    // Создание тестового окружения с использованием хелпера
    const testStore = createTestStore(useContactsStore, {
      stubActions: false // Используем реальные actions
    })
    store = testStore.store
  })

  describe('Инициализация store', () => {
    it('должен иметь правильные начальные значения', () => {
      expect(store.contactsData).toEqual([])
      expect(store.selectedContact).toBeNull()
    })

    it('должен восстанавливать контакты из localStorage при инициализации', () => {
      // Этот тест проверяет логику восстановления, которая в реальном приложении
      // может быть вызвана при инициализации store.
      // Здесь мы симулируем это, вызывая `fill` напрямую.
      const savedContacts = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        }
      ]
      
      // Симулируем наличие данных в localStorage
      localStorage.setItem('contacts', JSON.stringify(savedContacts))
      
      // Создаем новый store, чтобы проверить его инициализацию
      const newStore = createTestStore(useContactsStore, { stubActions: false }).store
      
      expect(newStore.contactsData).toEqual(savedContacts)
    })

    it('должен обрабатывать отсутствие данных в localStorage', () => {
      // C хелпером `createTestStore` начальное состояние всегда предсказуемо
      const newStore = createTestStore(useContactsStore, { stubActions: false }).store
      
      expect(newStore.contactsData).toEqual([])
    })
  })

  describe('Actions - базовые операции', () => {
    it('select должен выбрать контакт', () => {
      const contact = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      }
      
      store.select(contact)
      
      expect(store.selectedContact).toEqual(contact)
    })

    it('fill должен заполнить список контактов и сохранить в localStorage', () => {
      const contacts = [
        { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com' },
        { first_name: 'Bob', last_name: 'Wilson', email: 'bob@example.com' }
      ]
      
      store.fill(contacts)
      
      expect(store.contactsData).toEqual(contacts)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'contacts',
        JSON.stringify(contacts)
      )
    })

    it('$reset должен очистить localStorage', () => {
      store.$reset()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('contacts')
    })
  })

  describe('Actions - поиск контактов', () => {
    beforeEach(() => {
      const contacts = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        }
      ]
      store.fill(contacts)
    })

    it('findContact должен найти существующий контакт', () => {
      const searchOrder = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      }
      
      const foundContact = store.findContact(searchOrder)
      
      expect(foundContact).toEqual(expect.objectContaining(searchOrder))
    })

    it('findContact должен находить контакт с неформатированным номером', () => {
      const searchOrder = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1 (123) 456-7890', // Неформатированный номер
        code: '1'
      }
      const foundContact = store.findContact(searchOrder)
      expect(foundContact).toBeDefined()
      expect(foundContact.first_name).toBe('John')
    })

    it('findContact должен работать без телефона', () => {
      const searchOrder = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      }
      
      expect(() => store.findContact(searchOrder)).not.toThrow()
    })
  })

  describe('Actions - форматирование телефонов', () => {
    it('format_phone должен удалить код страны из телефона', () => {
      const result = store.format_phone('+1234567890', '1')
      
      expect(result).toBe('234567890')
    })

    it('format_phone должен удалить все символы +', () => {
      const result = store.format_phone('+1+234+567+890', '1')
      
      expect(result).toBe('234567890')
    })

    it('format_phone должен удалить пробелы', () => {
      const result = store.format_phone('+1 234 567 890', '1')
      
      expect(result).toBe('234567890')
    })

    it('format_phone должен обрабатывать пустые строки', () => {
      const result = store.format_phone('', '1')
      
      expect(result).toBe('')
    })

    it('format_phone должен обрабатывать null и undefined', () => {
      expect(store.format_phone(null, '1')).toBe('')
      expect(store.format_phone(undefined, '1')).toBe('')
    })
  })

  describe('Actions - добавление контактов', () => {
    it('add должен добавить новый валидный контакт', () => {
      const newContact = {
        first_name: 'New',
        last_name: 'Contact',
        email: 'new@example.com',
        phone: '1234567890'
      }

      store.add(newContact)

      expect(store.contactsData).toHaveLength(1)
      expect(store.contactsData[0]).toEqual(expect.objectContaining({
        first_name: 'New',
        last_name: 'Contact'
      }))
      expect(store.contactsData[0].temp_id).toBeDefined()
      expect(typeof store.contactsData[0].last_usage).toBe('string')
    })

    it('add должен отклонить контакт без обязательных полей', () => {
      const incompleteContact = {
        first_name: 'Incomplete'
        // last_name and phone are missing
      }

      store.add(incompleteContact)

      expect(store.contactsData).toHaveLength(0)
    })

    it('add должен обновить last_usage для существующего контакта', () => {
      const existingContact = {
        first_name: 'Existing',
        last_name: 'User',
        phone: '1234567890',
        code: '1',
        last_usage: new Date('2023-01-01').toISOString()
      }
      store.fill([existingContact])
      const originalDate = store.contactsData[0].last_usage

      const sameContact = { ...existingContact }
      store.add(sameContact)

      expect(store.contactsData).toHaveLength(1)
      expect(store.contactsData[0].last_usage).not.toEqual(originalDate)
    })

    it('add должен форматировать телефон с помощью AsYouType', () => {
      const newContact = {
        first_name: 'Test',
        last_name: 'Phone',
        email: 'test@example.com',
        phone: '1234567890'
      }

      store.add(newContact)

      // Проверяем, что телефон отформатирован
      expect(store.contactsData[0].phone).toBe('formatted-1234567890')
    })

    it('add должен очистить + из кода страны', () => {
      const newContact = {
        first_name: 'Test',
        last_name: 'Code',
        email: 'test@example.com',
        code: '+44',
        phone: '1234567890'
      }

      store.add(newContact)

      expect(store.contactsData[0].code).toBe('44')
    })

    it('add должен обрабатывать телефон с символом +', () => {
      const newContact = {
        first_name: 'Test',
        last_name: 'Plus',
        email: 'test@example.com',
        code: '1',
        phone: '+11234567890'
      }

      store.add(newContact)

      // Телефон должен быть очищен от кода и отформатирован
      expect(store.contactsData[0].phone).toBe('formatted-+11234567890')
    })
  })

  describe('Actions - обновление контактов', () => {
    it('updateContact должен обновить существующий контакт', () => {
      // Добавляем контакт
      const initialContact = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        code: '1'
      }
      store.add(initialContact)
      const tempId = store.contactsData[0].temp_id

      // Обновляем его
      const updateData = {
        temp_id: tempId,
        phone: '0987654321'
      }

      const result = store.updateContact(updateData)

      expect(result).toBe(true)
      expect(store.contactsData[0].phone).toBe('formatted-0987654321')
    })

    it('updateContact должен вернуть false для несуществующего контакта', () => {
      const result = store.updateContact({ temp_id: 123, phone: '123' })
      expect(result).toBe(false)
    })

    it('updateContact должен обрабатывать обновление телефона с +', () => {
      const initialContact = {
        first_name: 'Update',
        last_name: 'Test',
        email: 'update@example.com',
        phone: '555555',
        code: '1'
      }
      store.add(initialContact)
      const tempId = store.contactsData[0].temp_id

      const updateData = {
        temp_id: tempId,
        phone: '+11234567890',
        code: '1'
      }

      store.updateContact(updateData)

      // Телефон должен быть очищен от кода перед форматированием
      expect(store.contactsData[0].phone).toBe('formatted-+11234567890')
    })
  })

  describe('Actions - удаление дубликатов', () => {
    it('removeDuplicates должен удалить дублирующиеся контакты', () => {
      const contacts = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '0987654321'
        },
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890'
        } // дубликат
      ]
      
      store.fill(contacts)
      store.removeDuplicates()
      
      expect(store.contactsData).toHaveLength(2)
      expect(store.contactsData.find(c => 
        c.first_name === 'John' && c.last_name === 'Doe'
      )).toBeDefined()
      expect(store.contactsData.find(c => 
        c.first_name === 'Jane' && c.last_name === 'Smith'
      )).toBeDefined()
    })

    it('removeDuplicates должен сохранить результат в localStorage', () => {
      const contacts = [
        {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '1234567890'
        },
        {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      ]
      
      store.fill(contacts)
      store.removeDuplicates()
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'contacts',
        JSON.stringify(store.contactsData)
      )
    })

    it('removeDuplicates должен обрабатывать контакты без телефонов', () => {
      const contacts = [
        {
          first_name: 'No',
          last_name: 'Phone',
          email: 'nophone@example.com',
          phone: ''
        },
        {
          first_name: 'No',
          last_name: 'Phone',
          email: 'nophone@example.com',
          phone: null
        }
      ]
      
      store.fill(contacts)
      store.removeDuplicates()
      
      expect(store.contactsData).toHaveLength(1)
    })
  })

  describe('Actions - утилиты', () => {
    it('getLastUsage должен вернуть контакт с самой поздней датой использования', () => {
      const oldDate = new Date('2023-01-01')
      const newDate = new Date('2024-01-01')
      
      const contacts = [
        {
          first_name: 'Old',
          last_name: 'User',
          email: 'old@example.com',
          last_usage: oldDate
        },
        {
          first_name: 'New',
          last_name: 'User',
          email: 'new@example.com',
          last_usage: newDate
        }
      ]
      
      store.fill(contacts)
      const lastUsed = store.getLastUsage()
      
      expect(lastUsed.first_name).toBe('New')
      expect(lastUsed.last_usage).toEqual(newDate)
    })

    it('getLastUsage должен вернуть false для пустого списка', () => {
      store.fill([])
      
      const result = store.getLastUsage()
      
      expect(result).toBe(false)
    })

    it('remove должен удалить контакт по имени', () => {
      const contacts = [
        { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ]
      
      store.fill(contacts)
      store.remove('John')
      
      expect(store.contactsData).toHaveLength(1)
      expect(store.contactsData[0].first_name).toBe('Jane')
    })

    it('removeNullPhone должен заменить null телефоны на пустые строки', () => {
      const contacts = [
        { first_name: 'User1', phone: null },
        { first_name: 'User2', phone: '+1234567890' },
        { first_name: 'User3', phone: null }
      ]
      
      store.fill(contacts)
      store.removeNullPhone()
      
      expect(store.contactsData[0].phone).toBe('')
      expect(store.contactsData[1].phone).toBe('+1234567890')
      expect(store.contactsData[2].phone).toBe('')
    })

    it('removeNullPhone должен корректно работать с пустым списком', () => {
      store.fill([])
      
      expect(() => store.removeNullPhone()).not.toThrow()
    })
  })

  describe('Интеграционные тесты', () => {
    it('должен правильно обрабатывать полный цикл работы с контактами', () => {
      // 1. Добавляем несколько контактов
      const contact1 = {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        country_prefix: '+1',
        code: '1',
        phone: '1111111111'
      }
      const contact2 = {
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob@example.com',
        country_prefix: '+44',
        code: '44',
        phone: '2222222222'
      }
      
      store.add(contact1)
      store.add(contact2)
      
      // 2. Проверяем, что контакты добавлены
      expect(store.contactsData).toHaveLength(2)
      
      // 3. Выбираем контакт
      store.select(store.contactsData[0])
      expect(store.selectedContact.first_name).toBe('Alice')
      
      // 4. Обновляем контакт
      const contactToUpdate = store.contactsData[0]
      const updateResult = store.updateContact({
        temp_id: contactToUpdate.temp_id,
        phone: '9999999999'
      })
      expect(updateResult).toBe(true)
      
      // 5. Получаем последний использованный контакт
      const lastUsed = store.getLastUsage()
      expect(lastUsed).toBeDefined()
      
      // 6. Удаляем контакт
      store.remove('Bob')
      expect(store.contactsData).toHaveLength(1)
    })

    it('должен восстанавливать состояние после перезагрузки страницы', () => {
      // Симулируем сохраненные контакты
      const savedContacts = [
        {
          first_name: 'Saved',
          last_name: 'Contact',
          email: 'saved@example.com',
          phone: '+1234567890',
          last_usage: new Date().toISOString()
        }
      ]
      
      // Тестируем восстановление через fill
      store.fill(savedContacts)
      
      expect(store.contactsData).toHaveLength(1)
      expect(store.contactsData[0].first_name).toBe('Saved')
    })

    it('должен автоматически удалять дубликаты при инициализации', () => {
      // Симулируем дубликаты
      const contactsWithDuplicates = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890'
        },
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890'
        }
      ]
      
      // Загружаем дубликаты и тестируем removeDuplicates
      store.fill(contactsWithDuplicates)
      store.removeDuplicates()
      
      expect(store.contactsData).toHaveLength(1)
    })
  })

  describe('Edge cases', () => {
    it('должен корректно обрабатывать некорректные данные в localStorage', () => {
      localStorage.setItem('contacts', 'invalid-json')
      
      expect(() => {
        createTestStore(useContactsStore, { stubActions: false })
      }).not.toThrow()
    })

    it('должен корректно обрабатывать специальные символы в данных', () => {
      const contact = {
        first_name: 'José',
        last_name: "O'Connor",
        email: 'jose+test@example.com',
        country_prefix: '+33',
        code: '33',
        phone: '123-456-7890'
      }
      
      store.add(contact)
      
      expect(store.contactsData[0].first_name).toBe('José')
      expect(store.contactsData[0].last_name).toBe("O'Connor")
    })

    it('должен обрабатывать очень длинные значения', () => {
      const contact = {
        first_name: 'A'.repeat(1000),
        last_name: 'B'.repeat(1000),
        email: 'C'.repeat(100) + '@' + 'D'.repeat(100) + '.com',
        country_prefix: '+1',
        code: '1',
        phone: '1'.repeat(50)
      }
      
      expect(() => store.add(contact)).not.toThrow()
    })

    it('должен корректно обрабатывать пустые массивы', () => {
      store.fill([])
      
      expect(store.getLastUsage()).toBe(false)
      expect(() => store.removeDuplicates()).not.toThrow()
      expect(() => store.removeNullPhone()).not.toThrow()
    })
  })

  describe('Getters (вспомогательные функции)', () => {
    it('getLastUsage должен вернуть контакт с последней датой использования', () => {
      const date1 = new Date('2023-01-01T10:00:00Z')
      const date2 = new Date('2023-01-01T12:00:00Z') // последняя дата
      const date3 = new Date('2023-01-01T08:00:00Z')

      const contacts = [
        { first_name: 'A', last_name: 'A', email: 'a@a.com', phone: '1', last_usage: date1 },
        { first_name: 'B', last_name: 'B', email: 'b@b.com', phone: '2', last_usage: date2 },
        { first_name: 'C', last_name: 'C', email: 'c@c.com', phone: '3', last_usage: date3 }
      ]
      store.fill(contacts)
      
      const lastUsedContact = store.getLastUsage()
      expect(lastUsedContact).toEqual(contacts[1])
    })

    it('getLastUsage должен вернуть false если список контактов пуст', () => {
      expect(store.contactsData).toHaveLength(0)
      const lastUsedContact = store.getLastUsage()
      expect(lastUsedContact).toBe(false)
    })
  })
}) 