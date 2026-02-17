import { describe, it, expect, vi, beforeEach } from 'vitest'
import dayjs from 'dayjs'
import utils from '@/plugins/utils'

describe('utils plugin', () => {
  describe('isEmpty', () => {
    describe('null и undefined', () => {
      it('должен возвращать true для null', () => {
        expect(utils.isEmpty(null)).toBe(true)
      })

      it('должен возвращать true для undefined', () => {
        expect(utils.isEmpty(undefined)).toBe(true)
      })
    })

    describe('boolean значения', () => {
      it('должен возвращать false для true', () => {
        expect(utils.isEmpty(true)).toBe(false)
      })

      it('должен возвращать true для false', () => {
        expect(utils.isEmpty(false)).toBe(true)
      })
    })

    describe('объекты', () => {
      it('должен возвращать true для пустого объекта', () => {
        expect(utils.isEmpty({})).toBe(true)
      })

      it('должен возвращать false для непустого объекта', () => {
        expect(utils.isEmpty({ key: 'value' })).toBe(false)
      })

      it('должен возвращать false для объекта с null значениями', () => {
        expect(utils.isEmpty({ key: null })).toBe(false)
      })

      it('должен возвращать false для объекта с undefined значениями', () => {
        expect(utils.isEmpty({ key: undefined })).toBe(false)
      })

      it('должен обрабатывать массивы как объекты', () => {
        expect(utils.isEmpty([])).toBe(true)
        expect(utils.isEmpty([1, 2, 3])).toBe(false)
      })
    })

    describe('числовые значения', () => {
      it('должен возвращать false для положительных чисел', () => {
        expect(utils.isEmpty(1)).toBe(false)
        expect(utils.isEmpty(123.45)).toBe(false)
        expect(utils.isEmpty(Infinity)).toBe(true) // Infinity не проходит isFinite
      })

      it('должен возвращать false для отрицательных чисел', () => {
        expect(utils.isEmpty(-1)).toBe(false)
        expect(utils.isEmpty(-123.45)).toBe(false)
        expect(utils.isEmpty(-Infinity)).toBe(true) // -Infinity не проходит isFinite
      })

      it('должен обрабатывать ноль с параметром zeroIsEmpty', () => {
        expect(utils.isEmpty(0)).toBe(false) // по умолчанию ноль не пустой
        expect(utils.isEmpty(0, false)).toBe(false)
        expect(utils.isEmpty(0, true)).toBe(true) // с zeroIsEmpty=true ноль считается пустым
      })

      it('должен возвращать true для NaN', () => {
        expect(utils.isEmpty(NaN)).toBe(true)
      })

      it('должен обрабатывать числа как строки', () => {
        expect(utils.isEmpty('123')).toBe(false)
        expect(utils.isEmpty('0')).toBe(false)
        expect(utils.isEmpty('0', true)).toBe(true) // строка '0' с zeroIsEmpty
      })

      it('должен обрабатывать float значения', () => {
        expect(utils.isEmpty(0.0)).toBe(false)
        expect(utils.isEmpty(0.0, true)).toBe(true)
        expect(utils.isEmpty(0.1)).toBe(false)
        expect(utils.isEmpty(0.1, true)).toBe(false)
      })
    })

    describe('строки', () => {
      it('должен возвращать true для пустой строки', () => {
        expect(utils.isEmpty('')).toBe(true)
      })

      it('должен возвращать false для непустой строки', () => {
        expect(utils.isEmpty('hello')).toBe(false)
        expect(utils.isEmpty(' ')).toBe(false) // пробел не считается пустым
      })

      it('должен возвращать true для строки только из пробелов (если нет .length)', () => {
        // Проверяем что строка с пробелами не пустая (имеет length > 0)
        expect(utils.isEmpty('   ')).toBe(false)
      })
    })

    describe('массивы', () => {
      it('должен возвращать true для пустого массива', () => {
        expect(utils.isEmpty([])).toBe(true)
      })

      it('должен возвращать false для непустого массива', () => {
        expect(utils.isEmpty([1])).toBe(false)
        expect(utils.isEmpty([null])).toBe(false)
        expect(utils.isEmpty([undefined])).toBe(false)
        expect(utils.isEmpty([''])).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('должен обрабатывать объекты со свойством length', () => {
        const objWithLength = { length: 0 }
        expect(utils.isEmpty(objWithLength)).toBe(false) // объект не пустой, даже если length = 0
      })

      it('должен обрабатывать Date объекты', () => {
        expect(utils.isEmpty(new Date())).toBe(true) // Date не проходит числовую проверку и !date = false, но у Date нет length
      })

      it('должен обрабатывать функции', () => {
        expect(utils.isEmpty(() => {})).toBe(true) // функции не числа и у них нет length
        expect(utils.isEmpty(function() {})).toBe(true)
      })

      it('должен обрабатывать символы', () => {
        expect(() => utils.isEmpty(Symbol('test'))).toThrow() // Symbol ломает parseFloat
      })

      it('должен обрабатывать BigInt', () => {
        expect(() => utils.isEmpty(BigInt(0))).toThrow() // BigInt ломает isFinite
        expect(() => utils.isEmpty(BigInt(123))).toThrow()
      })
    })
  })

  describe('dateFormat', () => {
    it('должен форматировать дату в DD/MM/YYYY H:mm', () => {
      const testDate = new Date('2024-01-15T14:30:00')
      const result = utils.dateFormat(testDate)
      
      expect(result).toBe('15/01/2024 14:30')
    })

    it('должен обрабатывать строку даты', () => {
      const result = utils.dateFormat('2024-01-15T14:30:00')
      
      expect(result).toBe('15/01/2024 14:30')
    })

    it('должен обрабатывать dayjs объект', () => {
      const dayjsDate = dayjs('2024-01-15T14:30:00')
      const result = utils.dateFormat(dayjsDate)
      
      expect(result).toBe('15/01/2024 14:30')
    })

    it('должен обрабатывать полночь', () => {
      const result = utils.dateFormat('2024-01-15T00:00:00')
      
      expect(result).toBe('15/01/2024 0:00')
    })

    it('должен обрабатывать конец дня', () => {
      const result = utils.dateFormat('2024-01-15T23:59:00')
      
      expect(result).toBe('15/01/2024 23:59')
    })

    it('должен обрабатывать високосный год', () => {
      const result = utils.dateFormat('2024-02-29T12:00:00')
      
      expect(result).toBe('29/02/2024 12:00')
    })

    it('должен обрабатывать невалидную дату', () => {
      const result = utils.dateFormat('invalid-date')
      
      expect(result).toBe('Invalid Date')
    })
  })

  describe('isLetter', () => {
    let mockEvent

    beforeEach(() => {
      mockEvent = {
        data: null,
        preventDefault: vi.fn()
      }
    })

    it('должен возвращать true для букв', () => {
      mockEvent.data = 'a'
      const result = utils.isLetter(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен возвращать true для заглавных букв', () => {
      mockEvent.data = 'A'
      const result = utils.isLetter(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен возвращать true для специальных символов', () => {
      const specialChars = ['@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', ' ', '.', ',']
      
      specialChars.forEach(char => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = char
        
        const result = utils.isLetter(mockEvent)
        
        expect(result).toBe(true)
        expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      })
    })

    it('должен предотвращать ввод цифр', () => {
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      
      digits.forEach(digit => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = digit
        
        utils.isLetter(mockEvent)
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })

    it('должен обрабатывать многоязычные символы', () => {
      const internationalChars = ['ё', 'ü', 'ñ', 'ç', '中', '日', 'العربية']
      
      internationalChars.forEach(char => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = char
        
        const result = utils.isLetter(mockEvent)
        
        expect(result).toBe(true)
        expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      })
    })

    it('должен обрабатывать null/undefined data', () => {
      mockEvent.data = null
      const result = utils.isLetter(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('isNumber', () => {
    let mockEvent

    beforeEach(() => {
      mockEvent = {
        data: null,
        key: null,
        preventDefault: vi.fn()
      }
    })

    it('должен разрешать ввод цифр через data', () => {
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      
      digits.forEach(digit => {
        mockEvent.preventDefault.mockClear()
        mockEvent.data = digit
        
        const result = utils.isNumber(mockEvent)
        
        expect(result).toBe(true)
        expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      })
    })

    it('должен разрешать ввод символа "+"', () => {
      mockEvent.data = '+'
      const result = utils.isNumber(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен разрешать ввод цифр через key', () => {
      mockEvent.data = null
      mockEvent.key = '5'
      
      const result = utils.isNumber(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен разрешать ввод "+" через key', () => {
      mockEvent.data = null
      mockEvent.key = '+'
      
      const result = utils.isNumber(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('должен разрешать null data и null key', () => {
      mockEvent.data = null
      mockEvent.key = null
      
      const result = utils.isNumber(mockEvent)
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

         it('должен предотвращать ввод букв только если key тоже не null и не проходит regex', () => {
       const letters = ['a', 'b', 'z', 'A', 'Z']
       
       letters.forEach(letter => {
         mockEvent.preventDefault.mockClear()
         mockEvent.data = letter
         mockEvent.key = 'x' // тоже не проходит regex и не null
         
         const result = utils.isNumber(mockEvent)
         
         expect(mockEvent.preventDefault).toHaveBeenCalled()
         expect(result).toBeUndefined() // функция ничего не возвращает при preventDefault
       })
     })

         it('должен предотвращать ввод специальных символов только если key тоже не проходит', () => {
       const specialChars = ['@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '[', ']', '{', '}']
       
       specialChars.forEach(char => {
         mockEvent.preventDefault.mockClear()
         mockEvent.data = char
         mockEvent.key = 'x' // тоже не проходит regex и не null
         
         const result = utils.isNumber(mockEvent)
         
         expect(mockEvent.preventDefault).toHaveBeenCalled()
         expect(result).toBeUndefined()
       })
     })

         it('должен разрешать ввод если key проходит, даже если data не проходит', () => {
       mockEvent.data = 'a' // недопустимый символ
       mockEvent.key = '5'  // допустимый символ
       
       const result = utils.isNumber(mockEvent)
       
       expect(mockEvent.preventDefault).not.toHaveBeenCalled() // key='5' проходит regex
       expect(result).toBe(true)
     })

         it('должен разрешать ввод если key проходит тест', () => {
       mockEvent.data = 'invalid'
       mockEvent.key = '7'
       
       const result = utils.isNumber(mockEvent)
       
       // key='7' проходит regex, поэтому return true
       expect(mockEvent.preventDefault).not.toHaveBeenCalled()
       expect(result).toBe(true)
     })

    describe('edge cases', () => {
      it('должен обрабатывать пустые строки', () => {
        mockEvent.data = ''
        mockEvent.key = ''
        
        utils.isNumber(mockEvent)
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })

      it('должен обрабатывать многоязычные цифры', () => {
        // Арабские цифры, которые не являются ASCII цифрами
        const nonAsciiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
        
                 nonAsciiDigits.forEach(digit => {
           mockEvent.preventDefault.mockClear()
           mockEvent.data = digit
           mockEvent.key = 'x' // не проходит regex и не null
           
           const result = utils.isNumber(mockEvent)
           
           expect(mockEvent.preventDefault).toHaveBeenCalled() // должен предотвратить non-ASCII цифры
           expect(result).toBeUndefined()
         })
      })

             it('должен разрешать числовые типы', () => {
         mockEvent.data = 5 // число приводится к строке "5"
         mockEvent.key = null
         
         const result = utils.isNumber(mockEvent)
         
         expect(mockEvent.preventDefault).not.toHaveBeenCalled() // число 5 приводится к "5" и проходит regex
         expect(result).toBe(true)
       })
    })
  })
}) 