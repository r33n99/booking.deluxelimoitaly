import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDatePicker } from '@/compose/datePicker.ts'
import dayjs from 'dayjs'

describe('useDatePicker', () => {
  let originalToLocaleString

  beforeEach(async () => {
    vi.clearAllMocks()

    // Сохраняем оригинальный метод
    originalToLocaleString = Date.prototype.toLocaleString

    // Мокаем Date.prototype.toLocaleString для контроля часового пояса Rome
    Date.prototype.toLocaleString = vi.fn(function(locale, options) {
      if (options?.timeZone === 'Europe/Rome') {
        // Возвращаем время в формате, который ожидает dayjs
        // Просто возвращаем локальное время (предполагаем что тест запускается в подходящем часовом поясе)
        return this.toLocaleString('en-US')
      }
      return originalToLocaleString.call(this, locale, options)
    })

    vi.setSystemTime(new Date('2024-01-15 12:30:00')) // Понедельник, 12:30
  })

  afterEach(() => {
    // Восстанавливаем оригинальный метод
    Date.prototype.toLocaleString = originalToLocaleString
  })

  it('должен инициализироваться с правильными значениями по умолчанию', () => {
    const {
      dateInternal,
      minDate,
      minTime,
      dateTime,
      datePicker,
      initialDate,
      timeSetFirstTime,
      timeOptions,
      handleInternal,
      dateFormat
    } = useDatePicker()

    expect(dateInternal.value).toBeNull()
    expect(dateTime.value).toBeNull()
    expect(datePicker.value).toBeNull()
    expect(initialDate.value).toBeNull()
    expect(timeSetFirstTime.value).toBe(true)
    expect(minDate.value).toBeInstanceOf(Date)
    expect(minTime.value).toHaveProperty('hours')
    expect(minTime.value).toHaveProperty('minutes')
    expect(typeof minTime.value.hours).toBe('number')
    expect(typeof minTime.value.minutes).toBe('number')
    expect(timeOptions.value).toBeInstanceOf(Array)
    expect(typeof handleInternal).toBe('function')
    expect(typeof dateFormat).toBe('function')
  })

  describe('handleInternal', () => {
    it('должен обрабатывать валидную дату', () => {
      const { handleInternal, initialDate, datePicker, timeSetFirstTime } = useDatePicker()
      const testDate = new Date('2024-01-20 15:30:00')

      handleInternal(testDate)

      expect(initialDate.value).toBeInstanceOf(Date)
      expect(datePicker.value).toBeInstanceOf(Date)
      expect(timeSetFirstTime.value).toBe(false)
    })

    it('должен обрабатывать строку даты', () => {
      const { handleInternal, initialDate } = useDatePicker()

      handleInternal('2024-01-20 15:30:00')

      expect(initialDate.value).toBeInstanceOf(Date)
    })

    it('должен игнорировать невалидные даты', () => {
      const { handleInternal, initialDate } = useDatePicker()

      handleInternal('invalid-date')

      expect(initialDate.value).toBeNull()
    })

    it('должен игнорировать null/undefined значения', () => {
      const { handleInternal, initialDate } = useDatePicker()

      handleInternal(null)
      expect(initialDate.value).toBeNull()

      handleInternal(undefined)
      expect(initialDate.value).toBeNull()
    })

    it('должен сбрасывать время в 07:00 при первом вызове', () => {
      const { handleInternal, initialDate, timeSetFirstTime } = useDatePicker()
      const testDate = new Date('2024-01-20 15:30:00')

      handleInternal(testDate)

      expect(timeSetFirstTime.value).toBe(false)
      expect(initialDate.value.getHours()).toBe(7)
      expect(initialDate.value.getMinutes()).toBe(0)
    })

    it('должен сохранять время при повторных вызовах', () => {
      const { handleInternal, initialDate } = useDatePicker()
      const testDate1 = new Date('2024-01-20 15:30:00')
      const testDate2 = new Date('2024-01-21 10:45:00')

      handleInternal(testDate1) // первый вызов - время сбросится
      handleInternal(testDate2) // второй вызов - время сохранится

      expect(initialDate.value.getHours()).toBe(10)
      expect(initialDate.value.getMinutes()).toBe(45)
    })
  })

  describe('minDate computed', () => {
    it('должен возвращать сегодня если текущий час в Риме < 19', () => {
      // Мокаем toLocaleString чтобы время в Риме было 12:30 (< 19)
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 12:30:00 PM'
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minDate } = useDatePicker()

      const today = dayjs().format('YYYY-MM-DD')
      expect(dayjs(minDate.value).format('YYYY-MM-DD')).toBe(today)
    })

    it('должен возвращать завтра если текущий час в Риме >= 19', () => {
      // Мокаем toLocaleString чтобы время в Риме было 20:00 (>= 19)
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 8:00:00 PM' // 20:00
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minDate } = useDatePicker()

      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
      expect(dayjs(minDate.value).format('YYYY-MM-DD')).toBe(tomorrow)
    })
  })

  describe('minTime computed', () => {
    it('должен возвращать 11:00 для завтрашнего дня', () => {
      const { minTime, dateInternal } = useDatePicker()

      // Устанавливаем дату на завтра
      dateInternal.value = dayjs().add(1, 'day').toDate()

      expect(minTime.value.hours).toBe(11)
      expect(minTime.value.minutes).toBe(0)
    })

    it('должен возвращать 11:00 для сегодня если время < 9 утра в Риме', () => {
      // Мокаем toLocaleString чтобы время в Риме было 7:00 утра
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 7:00:00 AM'
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minTime, dateInternal } = useDatePicker()

      dateInternal.value = new Date() // сегодня

      expect(minTime.value.hours).toBe(11)
      expect(minTime.value.minutes).toBe(0)
    })

    it('должен возвращать текущее время + 2 часа для сегодня если toDay = true и >= 9 утра', () => {
      // Мокаем toLocaleString чтобы время в Риме было 12:30 и toDay = true
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 12:30:00 PM'
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minTime, dateInternal } = useDatePicker()

      dateInternal.value = new Date() // сегодня

      expect(minTime.value.hours).toBe(14) // 12 + 2
      expect(minTime.value.minutes).toBe(30)
    })

    it('должен возвращать 0:00 по умолчанию для прошлых дат или поздних часов', () => {
      // Мокаем время как поздний вечер (toDay = false)
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 8:00:00 PM' // 20:00
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minTime, dateInternal } = useDatePicker()

      dateInternal.value = new Date() // сегодня, но поздно

      expect(minTime.value.hours).toBe(0)
      expect(minTime.value.minutes).toBe(0)
    })
  })

  describe('timeOptions computed', () => {
    it('должен генерировать опции времени каждые 15 минут', () => {
      const { timeOptions } = useDatePicker()

      expect(timeOptions.value).toContain('00:00')
      expect(timeOptions.value).toContain('00:15')
      expect(timeOptions.value).toContain('00:30')
      expect(timeOptions.value).toContain('00:45')
      expect(timeOptions.value).toContain('23:45')
      expect(timeOptions.value).toHaveLength(96) // 24 * 4 = 96 опций
    })

    it('должен фильтровать опции времени для сегодняшней даты', () => {
      // Мокаем время в Риме как 12:30
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 12:30:00 PM'
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { timeOptions, dateInternal, initialDate } = useDatePicker()

      // Устанавливаем дату как сегодня
      const today = new Date()
      dateInternal.value = today
      initialDate.value = today

      // Получаем минимальное время (должно быть 14:30)
      const availableOptions = timeOptions.value
      expect(availableOptions.includes('12:00')).toBe(false) // раньше минимального
      expect(availableOptions.includes('15:00')).toBe(true) // после минимального
    })
  })

  describe('dateFormat', () => {
    it('должен форматировать дату правильно', () => {
      const { dateFormat } = useDatePicker()
      const testDate = new Date('2024-01-15 14:30:00')

      const formatted = dateFormat(testDate)

      expect(formatted).toBe('15/01/2024 14:30')
    })

    it('должен обрабатывать разные форматы входных данных', () => {
      const { dateFormat } = useDatePicker()

      expect(dateFormat('2024-01-15 14:30:00')).toBe('15/01/2024 14:30')
      expect(dateFormat(new Date('2024-01-15 14:30:00'))).toBe('15/01/2024 14:30')
    })
  })

  describe('edge cases', () => {
    it('должен обрабатывать переход через полночь в часовом поясе', () => {
      // Мокаем время близко к полуночи
      Date.prototype.toLocaleString = vi.fn(function(locale, options) {
        if (options?.timeZone === 'Europe/Rome') {
          return '1/15/2024, 11:30:00 PM'
        }
        return originalToLocaleString.call(this, locale, options)
      })

      const { minDate, minTime } = useDatePicker()

      expect(minDate.value).toBeInstanceOf(Date)
      expect(typeof minTime.value.hours).toBe('number')
      expect(typeof minTime.value.minutes).toBe('number')
    })

    it('должен обрабатывать високосные годы', () => {
      const { dateFormat } = useDatePicker()
      const testDate = new Date('2024-02-29 12:00:00')

      expect(dateFormat(testDate)).toBe('29/02/2024 12:00')
    })

    it('должен обрабатывать смену часового пояса', () => {
      // Тестируем разные времена для проверки логики часового пояса
      const testTimes = [
        { mockTime: '1/15/2024, 1:00:00 AM', desc: '01:00' },
        { mockTime: '1/15/2024, 8:00:00 AM', desc: '08:00' },
        { mockTime: '1/15/2024, 6:00:00 PM', desc: '18:00' },
        { mockTime: '1/15/2024, 10:00:00 PM', desc: '22:00' }
      ]

      testTimes.forEach(({ mockTime }) => {
        Date.prototype.toLocaleString = vi.fn(function(locale, options) {
          if (options?.timeZone === 'Europe/Rome') {
            return mockTime
          }
          return originalToLocaleString.call(this, locale, options)
        })

        const { minDate, minTime } = useDatePicker()

        expect(minDate.value).toBeInstanceOf(Date)
        expect(typeof minTime.value.hours).toBe('number')
        expect(typeof minTime.value.minutes).toBe('number')
      })
    })
  })
}) 