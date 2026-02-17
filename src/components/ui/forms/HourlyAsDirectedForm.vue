<template>
  <Form
    @submit="handleSubmit"
    class="form"
    ref="HourlyAsDirectedForm"
    :validation-schema="hourlySchema"
    v-slot="{ errors, isSubmitting }"
  >
    <span v-if="isSubmitting">
      {{ errorFill(errors) }}
    </span>

    <div
      v-if="!isEmpty(errorOnForm) && isShowModal"
      @click="closeModal"
      class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
    >
      <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
        <div class="flex justify-end p-4">
          <button
            @click="closeModal"
            aria-label="close"
            class="closeButton inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400"
            type="button"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fill-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 pt-0">
          <p v-for="error in errors" :key="error">{{ error }}</p>
        </div>
        <div class="border-t border-gray-600 p-6">
          <button
            @click="closeModal"
            type="button"
            class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <div :class="['home_form home_form-2', 'active']">
      <Field name="pickup" v-slot="{ field }" v-model="orderData.pickup">
        <TrustyComplete
          clearable
          v-model="pickupRef"
          class="w-full md:w-[calc(100%/3-8px)]"
          classname="input !py-[22px] m-0 !w-full"
          @get:suggestions="fetchSuggestions"
          @update:suggestions="updateSuggestions"
          @clear:input="clearInput('pickup')"
          @select:suggestions="selectSuggestions"
          :autoCompleteString="orderData.pickup"
          :suggestions="data"
          v-bind="field"
          placeholder="Pick Up Location*"
          data-testid="pickup"
        />
      </Field>
      <Field
        as="select"
        class="input m-0 !py-[24px] text-sm !text-[#878787] dark:text-white/50 md:text-lg"
        :class="errors.hours ? 'error' : ''"
        name="hours"
        v-model="hourly"
      >
        <option
          v-for="value in [2, 3, 4, 5, 6, 7, 8, 9, 10]"
          :key="value"
          :value="value"
          :selected="value === 2"
        >
          {{ value }} hours
        </option>
      </Field>
      <Field name="date_start" v-slot="{ field }" v-model="datePicker">
        <VueDatePicker
          ref="datePickerRef"
          class="input m-0 text-sm md:text-lg"
          auto-apply
          partial-flow
          :teleport-center="Boolean(ssid)"
          placeholder="Date / Time*"
          :class="errors.date_start ? 'error' : ''"
          :preview-format="dateFormat"
          :clearable="false"
          :format="dateFormat"
          :dark="mode === 'dark'"
          :light="mode === 'light'"
          v-bind="field"
          v-model="datePicker"
          @internal-model-change="handleInternal"
          @open="handleCalendarOpen"
          :min-date="minDate"
          :min-time="minTime"
        >
          <template #right-sidebar>
            <div
              v-if="datePicker"
              ref="timeOptionsContainer"
              class="overflow-y-scroll px-3 py-2"
              style="max-height: 300px"
            >
              <div
                v-for="time in timeOptions"
                :key="time"
                @click="setTime(time)"
                :class="[
                  'time-option cursor-pointer',
                  time === selectedTime ? 'time-selected' : ''
                ]"
              >
                {{ time }}
              </div>
            </div>
          </template>
        </VueDatePicker>
      </Field>
      <div
        :class="{ disabled_map: disabledMap }"
        class="route_toggle inline-flex h-[64.4px] w-full min-w-[98px] cursor-pointer items-center justify-center rounded-full !bg-[#EEF2EE] dark:!bg-[#2B2D32] md:h-[69.8px] md:w-auto"
        @click="toggleRouteMap"
      >
        <LocationIcon :active="pathHasPickupAndDropOff" />
      </div>
    </div>
    <div class="next_step_button_wrapper mt-0">
      <button type="submit" class="next_step_button" :disabled="isSubmitting">Next</button>
    </div>
    <RouteMap
      v-if="showRouteMap"
      :pickupRef="pickupRef"
      formName="Hourly"
      :form="HourlyAsDirectedForm"
    />
  </Form>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch, onUnmounted, nextTick, computed, type Ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import * as yup from 'yup'
import { Form, Field, type SubmissionHandler } from 'vee-validate'
import { storeToRefs } from 'pinia'
import { useMobile } from '@/compose/ismobile'
import { useDatePicker } from '@/compose/datePicker'
import LocationIcon from '@/components/ui/icons/LocationIcon.vue'
import { useCentrifugoStore } from '@/stores/data/centrifugo'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import { useUserStore } from '@/stores/user/profile'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import RouteMap from '@/components/features/map/RouteMap.vue'
import TrustyComplete from '@/components/ui/autocomplete/TrustyComplete.vue'
import { trackGtmEvent } from '@/utils/gtm'
import type { OrderData, MainTypes, UtmData } from '@/types/stores/ride/order'

type FieldType = 'pickup' | 'dropoff'

interface LatLng {
  lat: number | null
  lng: number | null
}

interface PathValidity {
  pickup: boolean
  dropoff: boolean
}

interface PathStartFinish {
  pickup: LatLng
  dropoff: LatLng
  valid: PathValidity
}

interface AutocompleteSuggestion {
  description?: string
  place_id?: string
  selected?: boolean
  [key: string]: unknown
}

interface HourlyFormValues {
  pickup: string
  date_start: string | Date | null
  hours: number
}

interface UtilsPlugin {
  isEmpty: (value: unknown) => boolean
}

const trustyStore = useTrustyStore()

const { pickupRef, data, pathStartFinish, mainTypes } = storeToRefs(trustyStore) as {
  pickupRef: Ref<string>
  data: Ref<AutocompleteSuggestion[]>
  pathStartFinish: Ref<PathStartFinish>
  mainTypes: Ref<MainTypes>
}
const { fetchSuggestions, selectSuggestions, updateSuggestions, clearInput } = trustyStore

const utils = inject<UtilsPlugin | undefined>('utils')

const isEmpty = (value: unknown): boolean => {
  if (utils && typeof utils.isEmpty === 'function') {
    return utils.isEmpty(value)
  }
  if (value === null || value === undefined) {
    return true
  }
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0
  }
  return false
}
const router = useRouter()
const { isMobile } = useMobile()

const regexLink = inject<RegExp>('regexLink')
const regexIsHttps = inject<RegExp>('regexIsHttps')

const disabledMap = ref<boolean>(false)

const mainStore = useMainStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const centrifugoStore = useCentrifugoStore()

const { mode, flow, ssid, isRequesting } = storeToRefs(mainStore) as {
  mode: Ref<string>
  flow: Ref<string>
  ssid: Ref<string | null>
  isRequesting: Ref<boolean>
}
const { orderData, orderId, orderType, fleet } = storeToRefs(orderStore) as {
  orderData: Ref<OrderData>
  orderId: Ref<string | number | null>
  orderType: Ref<string>
  fleet: Ref<unknown>
}
const { isLoggedIn } = storeToRefs(userStore)

const hourly = ref<number>(orderData.value.hours ?? 2)

const {
  datePickerRef,
  minDate,
  minTime,
  datePicker,
  handleInternal,
  dateFormat,
  initialDate,
  timeSetFirstTime,
  timeOptions
} = useDatePicker()

const selectedTime = ref<string>('')
const isShowModal = ref<boolean>(true)
const errorOnForm = ref<Record<string, string | undefined> | null>(null)
const HourlyAsDirectedForm = ref<InstanceType<typeof Form> | null>(null)
const showRouteMap = ref<boolean>(false)
const timeOptionsContainer = ref<HTMLDivElement | null>(null)
let modalTimeoutId: ReturnType<typeof setTimeout> | null = null
const errorFill = (errorBag: Record<string, string | undefined>) => {
  errorOnForm.value = errorBag
}

const setTime = (time: string) => {
  const [hoursPart, minutesPart] = time.split(':').map(Number)
  if (Number.isNaN(hoursPart) || Number.isNaN(minutesPart)) {
    return
  }

  if (initialDate.value) {
    const updatedDate = new Date(initialDate.value)
    updatedDate.setHours(hoursPart, minutesPart)
    datePicker.value = updatedDate
    orderData.value.date_start = dayjs(updatedDate).format('YYYY-MM-DD HH:mm')
  }
  selectedTime.value = time

  datePickerRef.value?.closeMenu?.()
}

watch(
  errorOnForm,
  (newVal) => {
    const hasErrors = newVal && !isEmpty(newVal)

    // Очищаем предыдущий таймер, если он есть
    if (modalTimeoutId) {
      clearTimeout(modalTimeoutId)
      modalTimeoutId = null
    }

    if (hasErrors) {
      // Добавляем небольшую задержку перед показом модального окна,
      // чтобы избежать мигания при быстром исправлении ошибок
      modalTimeoutId = setTimeout(() => {
        const stillHasErrors = errorOnForm.value && !isEmpty(errorOnForm.value)
        if (stillHasErrors) {
          isShowModal.value = true
        }
        modalTimeoutId = null
      }, 100)
    } else {
      // Закрываем модальное окно, если ошибок нет
      isShowModal.value = false
    }
  },
  { immediate: true }
)

const toggleRouteMap = (): void => {
  if (disabledMap.value) {
    return
  }
  showRouteMap.value = !showRouteMap.value
}

const pathHasPickupAndDropOff = computed(() =>
  Boolean(pathStartFinish.value?.valid?.pickup && pathStartFinish.value?.valid?.dropoff)
)

watch(
  () => pathStartFinish.value?.valid?.pickup,
  (updatedPickupValid) => {
    const startFinish = pathStartFinish.value
    const isValid = Boolean(updatedPickupValid) && Object.keys(startFinish || {}).length > 1
    showRouteMap.value = isValid
  },
  { immediate: true }
)

watch(mainTypes, (value) => {
  orderStore.update({
    mainTypes: value
  })
})

watch(pickupRef, (val) => {
  orderData.value.pickup = val
})

const closeModal = () => {
  isShowModal.value = false
}

const hourlySchema = yup.object({
  pickup: yup
    .string()
    .required('Pick up is a required field')
    .max(230, 'Pick up should not exceed 230 characters')
    .test(
      'location-restricted',
      'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
      (value) => {
        if (typeof value !== 'string') {
          return false
        }
        return !value.includes('Amerigo Vespucci Airport, Viale Belfiore')
      }
    )
    .test(
      'google-complete',
      'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
      () => {
        if (orderData.value.ride_history) return true
        if (fleet.value) return true

        return Boolean(pathStartFinish.value.valid.pickup)
      }
    )
    .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
    .matches(regexLink ?? /.*/, { excludeEmptyString: true }),
  date_start: yup
    .string()
    .required('Date is a required field')
    .max(230, 'Date should not exceed 230 character')
    .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
    .matches(regexLink ?? /.*/, { excludeEmptyString: true })
})

const hourlySubmit = async (values: HourlyFormValues) => {
  trackGtmEvent('booking_next_step', {
    booking_funnel: 'hourly_as_directed',
    booking_step_number: 1,
    booking_step_name: 'locations'
  })

  const utmData = orderStore.getUtmData() as UtmData
  const serviceType = orderData.value.type_of_service ?? 'hourlyAsDirected'

  const dateSource = values.date_start ?? datePicker.value ?? new Date()
  const formattedDateStart = dayjs(dateSource).format('YYYY-MM-DD HH:mm')
  const orderMainTypes = orderData.value.mainTypes

  const normalizedHours = Number(values.hours)

  const orderUpdatePayload: Partial<OrderData> = {
    pickup: values.pickup,
    date_start: formattedDateStart,
    hours: normalizedHours,
    distance: normalizedHours * 20,
    status: 1,
    type_of_service: serviceType,
    mainTypes: orderMainTypes,
    ...utmData
  }

  orderStore.$reset()
  orderStore.update(orderUpdatePayload)

  orderData.value.allowedPages['contact'] = 1

  if (flow.value === 'mainsite') {
    try {
      isRequesting.value = true
      const storagePayload: Partial<OrderData> & { ssid?: string | null } = {
        ...orderUpdatePayload,
        type_of_service: 'hourlyAsDirected',
        ssid: ssid.value ?? null
      }

      const storageResponse = await orderStore.updateStorage(storagePayload)
      const cacheId = (storageResponse.data as { data?: { id?: string | number } })?.data?.id
      if (cacheId) {
        const socketData = {
          event: 'fill_form',
          cache_id: cacheId
        }
        centrifugoStore.send(`dli-${ssid.value}`, socketData)
      }
    } finally {
      isRequesting.value = false
    }
  }
  if (orderType.value === 'DUPLICATE' || flow.value !== 'mainsite') {
    await router.push('/contact')
  }
}

const handleSubmit: SubmissionHandler = async (values) => {
  await hourlySubmit(values as HourlyFormValues)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
  }
}

const scrollToSelectedTime = async () => {
  await nextTick()
  if (timeOptionsContainer.value) {
    const selectedElement = timeOptionsContainer.value.querySelector<HTMLElement>('.time-selected')
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  }
}

const handleCalendarOpen = () => {
  if (datePicker.value) {
    scrollToSelectedTime()
  }
}

watch(datePicker, async (val) => {
  if (val) {
    const dateValue = val instanceof Date ? val : new Date(val)
    if (Number.isNaN(dateValue.getTime())) {
      return
    }
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`
    await scrollToSelectedTime()

    if (Array.isArray(timeOptions.value) && timeOptions.value.includes(timeStr)) {
      selectedTime.value = timeStr
    }
  }
})

watch(datePicker, (val) => {
  if (val) {
    const dateValue = val instanceof Date ? val : new Date(val)
    if (Number.isNaN(dateValue.getTime())) {
      return
    }
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    selectedTime.value = `${hours}:${minutes}`
  }
})

onMounted(() => {
  if (!isLoggedIn.value && orderType.value !== 'DUPLICATE') {
    orderStore.$resetGuestOrderData()
  }

  if (datePicker.value) {
    const dateValue =
      datePicker.value instanceof Date ? datePicker.value : new Date(datePicker.value)
    if (!Number.isNaN(dateValue.getTime())) {
      const hours = dateValue.getHours().toString().padStart(2, '0')
      const minutes = dateValue.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${minutes}`
      if (Array.isArray(timeOptions.value) && timeOptions.value.includes(timeStr)) {
        selectedTime.value = timeStr
      }
    }
  }
  if (orderData.value.date_start) {
    timeSetFirstTime.value = false
    const parsedDate = new Date(orderData.value.date_start)
    if (!Number.isNaN(parsedDate.getTime())) {
      datePicker.value = parsedDate
    }
  }
  if (orderId.value !== null) {
    // fields.value.pickup.valid = true
  }
  orderStore.update({ status: 1, type_of_service: 'hourlyAsDirected' })

  if (isMobile.value) {
    document.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  // Очищаем таймер при размонтировании компонента
  if (modalTimeoutId) {
    clearTimeout(modalTimeoutId)
    modalTimeoutId = null
  }

  if (isMobile.value) {
    document.removeEventListener('keydown', handleKeyDown)
  }
})
</script>
