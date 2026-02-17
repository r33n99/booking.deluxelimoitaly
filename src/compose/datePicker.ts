import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { TimeModel } from '@vuepic/vue-datepicker'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'

dayjs.extend(dayOfYear)

/**
 * Компонент (composable) для управления выбором даты.
 */
interface DatePickerRef {
  closeMenu?: () => void
}

interface MinTime {
  hours: number
  minutes: number
}

type CalendarContext = {
  month: string | number
  year: string | number
}

type DatePickerFormatValue = Date | Date[] | TimeModel | TimeModel[] | CalendarContext
type DatePickerInputValue = DatePickerFormatValue | string | number | null | undefined

interface UseDatePickerReturn {
  dateInternal: Ref<Date | null>
  minDate: ComputedRef<Date>
  minTime: ComputedRef<MinTime>
  dateTime: Ref<Date | null>
  datePicker: Ref<string | Date | null>
  initialDate: Ref<Date | null>
  timeSetFirstTime: Ref<boolean>
  datePickerRef: Ref<DatePickerRef | null>
  timeOptions: ComputedRef<string[]>
  handleInternal: (value: DatePickerInputValue) => void
  dateFormat: (date: DatePickerFormatValue) => string
}

export function useDatePicker(): UseDatePickerReturn {
  const dateInternal = ref<Date | null>(null)
  const dateTime = ref<Date | null>(null)
  const datePicker = ref<string | Date | null>(null)
  const timeSetFirstTime = ref<boolean>(true)
  const initialDate = ref<Date | null>(null)
  const datePickerRef = ref<DatePickerRef | null>(null)

  /**
   * Обработчик установки даты.
   * Проверяет, является ли значение валидной датой.
   * Если дата невалидна — можно либо прервать установку, либо подставить дату "по умолчанию".
   */
  const handleInternal = (value: DatePickerInputValue) => {
    // Если вообще никакого значения не пришло, просто выходим
    if (!value) {
      return
    }

    // Преобразуем к Date, если это не Date
    let dateValue: Date

    if (value instanceof Date) {
      dateValue = value
    } else if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value)
      if (isNaN(parsedDate.getTime())) {
        return
      }
      dateValue = parsedDate
    } else if (Array.isArray(value) && value.length > 0) {
      const firstItem = value[0]
      const parsedDate = new Date(firstItem as string | number | Date)
      if (isNaN(parsedDate.getTime())) {
        return
      }
      dateValue = parsedDate
    } else if (typeof value === 'object' && value !== null && 'month' in value && 'year' in value) {
      const { month, year } = value as CalendarContext
      const parsedDate = new Date(Number(year), Number(month), 1)
      if (isNaN(parsedDate.getTime())) {
        return
      }
      dateValue = parsedDate
    } else {
      return
    }

    // Теперь value гарантированно объект Date
    if (timeSetFirstTime.value) {
      // При первом выставлении сбрасываем часы/минуты в 07:00
      const firstDate = new Date(dateValue)
      firstDate.setHours(7, 0)
      initialDate.value = firstDate
      datePicker.value = firstDate
      timeSetFirstTime.value = false
    } else {
      // Если уже выставляли время, просто сохраняем текущую дату
      initialDate.value = new Date(dateValue)
    }

    dateInternal.value = initialDate.value ? new Date(initialDate.value) : null
  }

  /**
   * Генерация вариантов времени (каждые 15 минут).
   * При необходимости — фильтруем по минимально допустимому времени (minTime).
   */
  const timeOptions = computed<string[]>(() => {
    const allOptions = Array.from({ length: 24 }, (_, i) => i)
      .map((hour) =>
        [0, 15, 30, 45].map(
          (minute) => `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        )
      )
      .flat()

    const minMinutes = minTime.value.hours * 60 + minTime.value.minutes

    if (
      dayjs(initialDate.value).format('YYYY-MM-DD') === dayjs(minDate.value).format('YYYY-MM-DD')
    ) {
      return allOptions.filter((option) => {
        const [hours, minutes] = option.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes
        return totalMinutes >= minMinutes
      })
    }

    return allOptions
  })

  /**
   * Проверка, доступна ли текущая дата для "сегодня" (например, если сейчас ещё не поздний вечер).
   */
  const toDay = computed(() => {
    const rightNow = new Date()
    const nowRome = dayjs(Date.parse(rightNow.toLocaleString('en-US', { timeZone: 'Europe/Rome' })))

    // Если сейчас (по Риму) час < 19, значит сегодня ещё доступно
    return nowRome.hour() < 19
  })

  /**
   * Минимально допустимая дата. Если сейчас ещё "доступно сегодня" — возвращаем сегодня,
   * иначе сдвигаем на завтра.
   */
  const minDate = computed<Date>(() => {
    const rightNow = new Date()
    const nowRome = dayjs(Date.parse(rightNow.toLocaleString('en-US', { timeZone: 'Europe/Rome' })))

    if (toDay.value) {
      return nowRome.toDate()
    }

    return nowRome.add(1, 'day').toDate()
  })

  /**
   * Минимально допустимое время (часы и минуты), опираясь на выбранную дату
   * и текущее время в часовом поясе "Europe/Rome".
   */
  const minTime = computed<MinTime>(() => {
    const selectedNow = dateInternal.value ?? new Date()

    const selectedNowRome = dayjs(
      Date.parse(selectedNow.toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
    )
    const nowRome = dayjs(
      Date.parse(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
    )

    // Если разница в дне (вперёд) ровно 1 день ИЛИ сейчас (по Риму) < 9 утра того же дня
    if (
      selectedNowRome.dayOfYear() - nowRome.dayOfYear() === 1 ||
      (selectedNowRome.dayOfYear() - nowRome.dayOfYear() === 0 && nowRome.hour() < 9)
    ) {
      return { hours: 11, minutes: 0 }
    }

    // Если сегодня (один и тот же день) и "доступно сегодня"
    if (selectedNowRome.dayOfYear() - nowRome.dayOfYear() === 0 && toDay.value) {
      // Ставим плюс 2 часа к текущему
      return { hours: nowRome.hour() + 2, minutes: nowRome.minute() }
    }

    // По умолчанию — время с 00:00
    return { hours: 0, minutes: 0 }
  })

  /**
   * Форматирование даты в удобный для вывода вид (DD/MM/YYYY H:mm).
   */
  const toDayjsInput = (date: DatePickerFormatValue): dayjs.ConfigType => {
    if (Array.isArray(date)) {
      const firstValue = date[0]
      return firstValue ? toDayjsInput(firstValue as DatePickerFormatValue) : null
    }

    if (date && typeof date === 'object') {
      if ('month' in date && 'year' in date) {
        const context = date as CalendarContext
        return new Date(Number(context.year), Number(context.month), 1)
      }

      if ('hours' in date && 'minutes' in date) {
        const time = date as TimeModel
        const hours = Number(time.hours ?? 0)
        const minutes = Number(time.minutes ?? 0)
        const seconds = Number('seconds' in time ? (time.seconds ?? 0) : 0)
        const base = dayjs().hour(hours).minute(minutes).second(seconds)
        return base.toDate()
      }
    }

    return date as dayjs.ConfigType
  }

  const dateFormat = (date: DatePickerFormatValue) => {
    return dayjs(toDayjsInput(date)).format('DD/MM/YYYY H:mm')
  }

  // Возвращаем из composable необходимые ссылки и вычисления
  return {
    dateInternal,
    minDate,
    minTime,
    dateTime,
    datePicker,
    initialDate,
    timeSetFirstTime,
    datePickerRef,
    timeOptions,
    handleInternal,
    dateFormat
  }
}
