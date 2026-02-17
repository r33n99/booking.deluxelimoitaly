import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validPhone } from '@/plugins/validPhone'

// Мокаем libphonenumber-js
vi.mock('libphonenumber-js', () => ({
  validatePhoneNumberLength: vi.fn()
}))

describe('validPhone', () => {
  let mockEvent
  let mockValidatePhoneNumberLength

  beforeEach(async () => {
    mockEvent = {
      data: null,
      target: { value: '' },
      preventDefault: vi.fn()
    }

    mockValidatePhoneNumberLength = vi.fn()
    vi.mocked(await import('libphonenumber-js')).validatePhoneNumberLength = mockValidatePhoneNumberLength
  })

  describe('обработка backspace', () => {
    it('должен возвращать true для backspace (data = null)', () => {
      mockEvent.data = null
      
      const result = validPhone(mockEvent, 'US')
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('обработка символа "+"', () => {
    it('должен предотвращать ввод символа "+"', () => {
      mockEvent.data = '+'
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('валидация символов', () => {
    it('должен разрешать ввод цифр', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '123456789'
      mockValidatePhoneNumberLength.mockReturnValue(undefined) // валидная длина
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен разрешать ввод цифры 0', () => {
      mockEvent.data = '0'
      mockEvent.target.value = '123456789'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен предотвращать ввод букв', () => {
      mockEvent.data = 'a'
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('должен предотвращать ввод специальных символов', () => {
      const specialChars = ['@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '[', ']', '{', '}', '|', '\\', ';', ':', '"', "'", '<', '>', ',', '.', '?', '/']
      
      specialChars.forEach(char => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = char
        
        validPhone(mockEvent, 'US')
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })

    it('должен разрешать ввод "+" в составе числа (edge case)', () => {
      mockEvent.data = '1'
      mockEvent.target.value = '+123456789'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('валидация длины номера', () => {
    it('должен предотвращать ввод при INVALID_LENGTH', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '123'
      mockValidatePhoneNumberLength.mockReturnValue('INVALID_LENGTH')
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('1235', 'US')
    })

    it('должен предотвращать ввод при TOO_LONG', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '12345678901234567'
      mockValidatePhoneNumberLength.mockReturnValue('TOO_LONG')
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('123456789012345675', 'US')
    })

    it('должен разрешать ввод при валидной длине', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '1234567890'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('12345678905', 'US')
    })

    it('должен передавать правильный country_prefix', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '1234567890'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'DE')
      
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('12345678905', 'DE')
    })
  })

  describe('комбинированные тесты', () => {
    it('должен правильно обрабатывать полный номер США', () => {
      const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      let currentValue = ''
      
      digits.forEach((digit, index) => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = digit
        mockEvent.target.value = currentValue
        
        // Имитируем валидную длину для всех цифр кроме последней
        if (index < digits.length - 1) {
          mockValidatePhoneNumberLength.mockReturnValue(undefined)
        } else {
          mockValidatePhoneNumberLength.mockReturnValue('TOO_LONG')
        }
        
        validPhone(mockEvent, 'US')
        
        if (index < digits.length - 1) {
          expect(mockEvent.preventDefault).not.toHaveBeenCalled()
          currentValue += digit
        } else {
          expect(mockEvent.preventDefault).toHaveBeenCalled()
        }
      })
    })

    it('должен обрабатывать ввод с существующим "+" в номере', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '+49123456789'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'DE')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('+491234567895', 'DE')
    })

    it('должен обрабатывать пустое значение в поле', () => {
      mockEvent.data = '1'
      mockEvent.target.value = ''
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'US')
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('1', 'US')
    })
  })

  describe('edge cases', () => {
    it('должен обрабатывать undefined country_prefix', () => {
      mockEvent.data = '5'
      mockEvent.target.value = '123'
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, undefined)
      
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('1235', undefined)
    })

    it('должен обрабатывать null в target.value', () => {
      mockEvent.data = '5'
      mockEvent.target.value = null
      mockValidatePhoneNumberLength.mockReturnValue(undefined)
      
      validPhone(mockEvent, 'US')
      
      expect(mockValidatePhoneNumberLength).toHaveBeenCalledWith('null5', 'US')
    })

    it('должен обрабатывать отсутствие метода preventDefault', () => {
      mockEvent.preventDefault = undefined
      mockEvent.data = 'a'
      
      expect(() => validPhone(mockEvent, 'US')).toThrow()
    })

         it('должен разрешать числа как строки', () => {
       mockEvent.data = 5 // число приводится к строке "5"
       mockEvent.target.value = '123'
       mockValidatePhoneNumberLength.mockReturnValue(undefined)
       
       // Число 5 приводится к строке "5" и проходит regex
       validPhone(mockEvent, 'US')
       
       expect(mockEvent.preventDefault).not.toHaveBeenCalled()
     })
  })
}) 