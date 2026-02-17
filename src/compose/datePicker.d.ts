declare module '@/compose/datePicker' {
  import type { ComputedRef, Ref } from 'vue'
  import type { TimeModel } from '@vuepic/vue-datepicker'

  interface MinTime {
    hours: number
    minutes: number
  }

  interface DatePickerRef {
    closeMenu?: () => void
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

  export function useDatePicker(): UseDatePickerReturn
}
