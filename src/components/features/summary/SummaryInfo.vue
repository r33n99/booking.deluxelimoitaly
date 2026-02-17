<template>
  <Form
    @submit="handleSubmit"
    @invalid-submit="handleInvalidSubmit"
    :class="classnames"
    ref="summaryForm"
    v-slot="{ errors, isSubmitting }"
    :validation-schema="getValidationSchema"
    :initial-values="getInitialValues"
    :validateOnMount="false"
    :validateOnBlur="false"
    :validateOnChange="false"
  >
    <span v-if="isSubmitting">
      {{ errorFill(errors) }}
    </span>
    <div class="summary_title_items_wrapper">
      <div class="flex w-full items-center gap-x-8 max-md:justify-between">
        <span class="summary_title">{{ props.title }}</span>
        <template v-if="props.disabled === 'false'">
          <button
            type="button"
            v-if="!summaryDataObject.isEditable"
            class="summary_edit_button border-dark_main px-3 py-1.5 text-dark_main hover:border-main dark:border-main dark:text-main dark:hover:text-background md:hidden"
            @click="openEdit()"
          >
            Edit {{ route.name == 'success' ? 'Profile' : 'ride' }}
          </button>
          <button
            :disabled="isSubmitting"
            type="submit"
            v-if="summaryDataObject.isEditable"
            class="summary_edit_button save min-w-max border-none px-3 py-1.5 md:hidden"
          >
            Confirm
          </button>
        </template>
      </div>
      <div class="flex w-full flex-row gap-x-[30px] max-md:flex-wrap md:gap-x-[60px]">
        <div
          class="!flex w-full flex-wrap gap-5 md:gap-x-10 md:gap-y-2"
          :class="{ 'lg:!grid lg:grid-cols-3': props.prepare === 'contactData' }"
        >
          <!-- Contact fields component - only load when contact fields are visible -->
          <ContactFields
            v-if="shouldShowContactFields"
            :is-editable="summaryDataObject.isEditable"
            :errors="errors"
            :check-field="checkField"
            ref="contactFieldsRef"
          />

          <!-- Location fields component -->
          <LocationFields
            :is-editable="summaryDataObject.isEditable"
            :errors="errors"
            :check-field="checkField"
          />

          <!-- Ride details fields component -->
          <RideDetailsFields
            :is-editable="summaryDataObject.isEditable"
            :errors="errors"
            :check-field="checkField"
          />

          <!-- Car selection field component -->
          <CarSelectionField
            :check-field="checkField"
            :is-modal-open="summaryDataObject.isModal"
            @open-modal="openModal"
            @close-modal="closeModal"
          />

          <template v-if="props.disabled === 'false' && !paymentVisited">
            <button
              type="button"
              v-if="!summaryDataObject.isEditable"
              :class="{
                '!w-[260px]': props.customStyle == 'true',
                'w-full': props.customStyle == 'false',
                'lg:col-start-3 lg:self-end': props.prepare === 'contactData'
              }"
              class="summary_edit_button ml-auto mr-0 h-16 w-full min-w-max border-dark_main px-3 py-1.5 text-dark_main hover:border-main dark:border-main dark:text-main dark:hover:text-background max-md:hidden"
              @click="openEdit"
            >
              Edit {{ route.name == 'success' ? 'Profile' : 'ride' }}
            </button>
            <button
              :disabled="isSubmitting"
              type="submit"
              v-if="summaryDataObject.isEditable"
              :class="{
                '!w-[260px]': props.customStyle == 'true',
                'w-full': props.customStyle == 'false',
                'lg:col-start-3 lg:self-end': props.prepare === 'contactData'
              }"
              class="summary_edit_button save ml-auto mr-0 h-16 w-full min-w-max border-none px-3 py-1.5 max-md:hidden"
            >
              Confirm
            </button>
          </template>
        </div>
      </div>
    </div>
    <slot></slot>
    <div
      v-if="!isEmpty(errorOnForm) && isShowErrorModal"
      @click="closeErrorModal"
      class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
    >
      <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
        <div class="flex justify-end p-4">
          <button
            @click="closeErrorModal"
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
          <p :key="index" v-for="(error, index) in errors">{{ error }}</p>
        </div>
        <div class="border-t border-gray-600 p-6">
          <button
            @click="closeErrorModal"
            type="button"
            class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  </Form>
  <swipe-modal
    v-model="summaryDataObject.isModal"
    v-if="(isMobile && !mailCar) || !mailCar"
    contents-height="60vh"
    border-top-radius="16px"
    :contents-color="mode === 'dark' ? '#2B2D32' : '#FFFFFF'"
    tip-color="#CDCFD0"
    @close="closeModal()"
  >
    <car-popup-content />
  </swipe-modal>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
  type Ref,
  defineAsyncComponent
} from 'vue'
import { useRoute } from 'vue-router'
import { Form, SubmissionHandler } from 'vee-validate'
import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import { useCarsStore } from '@/stores/ride/cars'
import { useContactsStore } from '@/stores/user/contacts'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { useMobile } from '@/compose/ismobile'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
// Dynamic import of ContactFields - only load when contact fields are needed
const ContactFields = defineAsyncComponent(() => import('./components/ContactFields.vue'))
import LocationFields from './components/LocationFields.vue'
import RideDetailsFields from './components/RideDetailsFields.vue'
import CarSelectionField from './components/CarSelectionField.vue'
import { useValidationSchema } from './composables/useValidationSchema'
import { useFieldVisibility } from './composables/useFieldVisibility'
import { captureError } from '@/utils/sentry'
import type { MainTypes, OrderData } from '@/types/stores/ride/order'
import type { CarSummary } from '@/types/stores/ride/cars'
import type { AxiosInstance } from 'axios'
import { useTrustyStore } from '@/stores/data/trustyComplete'

interface SummaryInfoProps {
  title: string
  customStyle: 'true' | 'false'
  disabled: 'true' | 'false'
  classnames?: string | Record<string, boolean> | (string | Record<string, boolean>)[]
  prepare?: string
}

type SubmitValues = Partial<OrderData> & {
  hours?: number
  distance?: number
  lead_id?: OrderData['lead_id']
  deal_id?: OrderData['deal_id']
  [key: string]: unknown
}

type ValidationSchema = Record<string, unknown>

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

interface SummaryData {
  isModal: boolean
  isEditable: boolean
  dateInputStyles: Record<string, string>
}

type ErrorBag = Record<string, string | undefined>

type SupportedEmailDomain = 'gmail' | 'hotmail'

const summaryForm = ref<InstanceType<typeof Form> | null>(null)
const errorOnForm = ref<ErrorBag | null>(null)
const isShowErrorModal = ref(false)

const errorFill = (errorBag: ErrorBag) => {
  errorOnForm.value = errorBag
  return ''
}

watch(errorOnForm, (newVal) => {
  if (newVal && !isEmpty(newVal)) {
    isShowErrorModal.value = true
  }
})

const mainStore = useMainStore()
const orderStore = useOrderStore()
const contactsStore = useContactsStore()
const carsStore = useCarsStore()
const { orderData, orderId, mailCar, fleet } = storeToRefs(orderStore)
const trustyStore = useTrustyStore()
const { pathStartFinish, lastChoisePlace } = storeToRefs(trustyStore) as {
  pathStartFinish: Ref<PathStartFinish>
  lastChoisePlace: Ref<{
    pickup: { formatted_address: string; place_id: string }
    dropoff: { formatted_address: string; place_id: string }
  }>
}
const { mode, isRequesting } = storeToRefs(mainStore)

const { isMobile } = useMobile()
const axios = inject<AxiosInstance | undefined>('axios')
const utils = inject<any>('utils')
const regexLink = inject<RegExp>('regexLink')
const regexIsHttps = inject<RegExp>('regexIsHttps')
const regexNameField = inject<RegExp>('regexNameField')
const route = useRoute()
type ContactFieldsExpose = {
  phoneNationalNumber?: Ref<string | null>
}

const contactFieldsRef = ref<ContactFieldsExpose | null>(null)

const paymentVisited = ref<boolean>(false)

const props = defineProps<SummaryInfoProps>()
const prepareRef = computed(() => props.prepare)
const { checkField } = useFieldVisibility(prepareRef) as {
  checkField: (field: string) => boolean
}
const { validationSchema } = useValidationSchema() as { validationSchema: ValidationSchema }

// Check if any contact fields should be visible
const shouldShowContactFields = computed(() => {
  return (
    checkField('first_name') ||
    checkField('last_name') ||
    checkField('email') ||
    checkField('phone')
  )
})

const emailDomains: Record<SupportedEmailDomain, string> = {
  gmail: 'com',
  hotmail: 'com'
}

const isSupportedEmailDomain = (value: string): value is SupportedEmailDomain => {
  return value === 'gmail' || value === 'hotmail'
}

if (!regexLink || !regexIsHttps || !regexNameField) {
  throw new Error('Validation regex patterns are not provided')
}

const getInitialValues = computed(() => {
  // Provide initial values from orderData so vee-validate knows field values
  // even when fields are not rendered (when form is not editable)
  const values: Record<string, unknown> = {}

  if (checkField('pickup')) {
    values.pickup = orderData.value.pickup || ''
  }
  if (checkField('dropoff')) {
    values.dropoff = orderData.value.dropoff || ''
  }
  if (checkField('hours')) {
    values.hours = orderData.value.hours || 0
  }
  if (checkField('date_start')) {
    values.date_start = orderData.value.date_start || ''
  }
  if (checkField('first_name')) {
    values.first_name = orderData.value.first_name || ''
  }
  if (checkField('last_name')) {
    values.last_name = orderData.value.last_name || ''
  }
  if (checkField('email')) {
    values.email = orderData.value.email || ''
  }
  if (checkField('phone')) {
    values.phone = orderData.value.phone || ''
  }

  return values
})

const getValidationSchema = computed<ValidationSchema>(() => {
  // If form is not editable, return empty schema to prevent validation
  // when nested forms (like additionalKms) submit
  if (!summaryDataObject.isEditable) {
    return {}
  }

  const fields = Object.keys(validationSchema).reduce((accumulator, field) => {
    if (checkField(field)) {
      accumulator[field] = validationSchema[field]
    }
    return accumulator
  }, {} as ValidationSchema)

  // Add custom error messages and validation for fields if they exist in the schema
  if ('pickup' in fields) {
    fields.pickup = yup
      .string()
      .required('Pick up is a required field')
      .max(230)
      .test(
        'location-restricted',
        'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
        (value) => {
          return !value?.toString().includes('Amerigo Vespucci Airport, Viale Belfiore')
        }
      )
      .test(
        'google-complete',
        'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
        (value) => {
          if (orderData.value.ride_history) return true
          if (fleet.value) return true

          const isValid = pathStartFinish.value?.valid?.pickup ?? false
          if (!isValid) return false

          const enteredValue = value?.toString().trim() ?? ''
          const savedAddress = lastChoisePlace.value?.pickup?.formatted_address?.trim() ?? ''
          const orderDataAddress = orderData.value.pickup?.trim() ?? ''

          return enteredValue === savedAddress || enteredValue === orderDataAddress
        }
      )
      .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
      .matches(regexLink ?? /.*/, { excludeEmptyString: true })
  }

  if ('dropoff' in fields) {
    fields.dropoff = yup
      .string()
      .required('Drop off is a required field')
      .max(230, 'Drop off should not exceed 230 characters')
      .test(
        'location-restricted',
        'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
        (value) => {
          return !value?.toString().includes('Amerigo Vespucci Airport, Viale Belfiore')
        }
      )
      .test(
        'google-complete',
        'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
        (value) => {
          if (orderData.value.ride_history) return true
          if (fleet.value) return true

          const isValid = pathStartFinish.value?.valid?.dropoff ?? false
          if (!isValid) return false

          const enteredValue = value?.toString().trim() ?? ''
          const savedAddress = lastChoisePlace.value?.dropoff?.formatted_address?.trim() ?? ''
          const orderDataAddress = orderData.value.dropoff?.trim() ?? ''

          return enteredValue === savedAddress || enteredValue === orderDataAddress
        }
      )
      .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
      .matches(regexLink ?? /.*/, { excludeEmptyString: true })
  }

  if ('first_name' in fields) {
    fields.first_name = yup
      .string()
      .required('First name is required')
      .max(50, 'First name should not exceed 50 characters')
      .matches(regexNameField, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
      .matches(regexIsHttps, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
      .matches(regexLink, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
  }

  if ('last_name' in fields) {
    fields.last_name = yup
      .string()
      .required('First name is required')
      .max(50, 'First name should not exceed 50 characters')
      .matches(regexNameField, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
      .matches(regexIsHttps, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
      .matches(regexLink, {
        excludeEmptyString: true,
        message: 'First name should not contain special characters or links'
      })
  }

  if ('email' in fields) {
    fields.email = yup
      .string()
      .email('Email must be email')
      .required('Email is required')
      .test(
        'email-dot',
        'The email address must contain a dot (.) in the second part (after the @ symbol), as addresses without a dot will not be accepted',
        (value) => {
          if (!value) {
            return false
          }
          return value.includes('.')
        }
      )
      .test('email-right-domain', 'The email has not a valid domain', (value) => {
        if (!value) {
          return false
        }
        const listParts = value.split('@')
        if (listParts.length) {
          const listDomain = listParts[1]
          if (listDomain) {
            const listDomainParts = listDomain.split('.')
            if (listDomainParts.length === 2) {
              let domainZone = listDomainParts.pop()
              const domainKey = listDomainParts[0]

              if (isSupportedEmailDomain(domainKey)) {
                return emailDomains[domainKey] === domainZone
              }
              return true
            }
            return true
          }
          return true
        }
        return true
      })
      .max(230)
      .matches(regexIsHttps, {
        excludeEmptyString: true,
        message: 'Email should not contain special characters or links'
      })
      .matches(regexLink, {
        excludeEmptyString: true,
        message: 'Email should not contain special characters or links'
      })
  }

  if ('hours' in fields) {
    fields.hours = yup
      .number()
      .transform((value) =>
        isNaN(value) || value === null || value === '' ? undefined : Number(value)
      )
      .required('Hours is a required field')
      .min(2, 'Hours must be at least 2')
      .max(10, 'Hours cannot be more than 10')
  }

  return fields
})

const pudoChanged = ref<boolean>(false)

const summaryDataObject = reactive<SummaryData>({
  isModal: false,
  isEditable: false,
  dateInputStyles: {
    pointerEvents: 'none'
  }
})

const changeButtonColor = (currentMode: string) => {
  if (currentMode === 'light') {
    summaryDataObject.dateInputStyles = {
      pointerEvents: 'all',
      color: 'rgb(45 132 35 / 1)',
      borderBottom: '1px solid rgb(45 132 35 / 1)'
    }
  } else {
    summaryDataObject.dateInputStyles = {
      pointerEvents: 'all',
      color: 'rgb(204 242 200 / 1)',
      borderBottom: '1px solid rgb(204 242 200 / 1)'
    }
  }
}

const initialValues = ref({
  pickup: '',
  dropoff: '',
  hours: 0,
  date_start: '',
  distance: 0
})

const openEdit = () => {
  initialValues.value = {
    pickup: orderData.value.pickup || '',
    dropoff: orderData.value.dropoff || '',
    hours: Number(orderData.value.hours || 0),
    date_start: orderData.value.date_start || '',
    distance: Number(orderData.value.distance || 0)
  }

  summaryDataObject.isEditable = true
  changeButtonColor(mode.value)
}

watch(mode, (newMode) => {
  changeButtonColor(newMode)
})

const normalizePhone = (phone: unknown): string => {
  if (phone == null) {
    return ''
  }
  return String(phone)
}

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

const handleInvalidSubmit = ({ errors, values }: { errors: any; values: any }) => {
  // Ignore validation errors if form is not in edit mode
  // This prevents showing errors when nested forms (like additionalKms) submit
  if (!summaryDataObject.isEditable) {
    return
  }
  // If form is editable, show errors normally
  errorFill(errors)
  isShowErrorModal.value = true
}

const handleSubmit: SubmissionHandler = async (values, ctx) => {
  // Only validate and submit if form is in edit mode
  // This prevents validation when nested forms (like additionalKms) submit
  if (!summaryDataObject.isEditable) {
    const submitEvent = (ctx as { evt?: SubmitEvent }).evt
    if (submitEvent) {
      submitEvent.preventDefault()
      submitEvent.stopPropagation()
    }
    return
  }
  await onSubmit(values as SubmitValues)
}

const onSubmit = async (values: SubmitValues) => {
  // Check if ride fields (pickup, dropoff, hours, date_start) were actually changed
  // This prevents unnecessary API calls when user just clicks Edit -> Confirm without changes
  // Save original form values before any modifications
  const formPickup = String(values.pickup || '').trim()
  const formDropoff = String(values.dropoff || '').trim()
  const formHours = Number(values.hours ?? 0)
  const formDateStart = String(values.date_start || '').trim()

  const initialPickup = String(initialValues.value.pickup || '').trim()
  const initialDropoff = String(initialValues.value.dropoff || '').trim()
  const initialHours = Number(initialValues.value.hours ?? 0)
  const initialDateStart = String(initialValues.value.date_start || '').trim()

  const pickupChanged = formPickup !== initialPickup
  const dropoffChanged = formDropoff !== initialDropoff
  const hoursChanged = formHours !== initialHours
  const dateChanged = formDateStart !== initialDateStart

  const hasRideFieldsChanged = pickupChanged || dropoffChanged || hoursChanged || dateChanged

  if (!hasRideFieldsChanged) {
    // No changes detected, just close edit mode without sending request
    summaryDataObject.isEditable = false
    return
  }

  // Safe access to component ref - check if component is still mounted
  let phoneNationalNumber = ''
  try {
    if (contactFieldsRef.value) {
      const phoneNationalRef = contactFieldsRef.value?.phoneNationalNumber as
        | Ref<string | null>
        | undefined
      phoneNationalNumber = phoneNationalRef?.value ?? ''
    }
  } catch (error) {
    // Component may be unmounted, use fallback value
    console.warn('ContactFields component may be unmounted:', error)
    phoneNationalNumber = ''
  }

  values.code = orderData.value.code
  values.phone = (phoneNationalNumber || orderData.value.phone || '') as OrderData['phone']
  values.country_prefix = orderData.value.country_prefix
  values.date_start = orderData.value.date_start
  values.contact_id = orderData.value.contact_id
  values.type_of_service = orderData.value.type_of_service

  if (orderData.value.type_of_service === 'hourlyAsDirected' && route.name !== 'success') {
    const hours = Number(values.hours ?? 0)
    values.hours = hours
    values.distance = hours * 20
  }

  if (orderData.value.lead_id && !orderData.value.deal_id) {
    values.step = 2
    if (values.distance === undefined && orderData.value.distance !== null) {
      values.distance = orderData.value.distance
    }
    if (values.total === undefined && orderData.value.total !== null) {
      values.total = orderData.value.total
    }
  }

  if (orderData.value.lead_id && !orderData.value.deal_id) {
    values.step = 2
    if (values.distance === undefined && orderData.value.distance !== null) {
      values.distance = orderData.value.distance
    }
    if (values.total === undefined && orderData.value.total !== null) {
      values.total = orderData.value.total
    }
  }

  type ContactAddPayload = Parameters<typeof contactsStore.add>[0]
  contactsStore.add(orderData.value as unknown as ContactAddPayload)

  if (
    orderId.value &&
    orderId.value !== 'null' &&
    orderId.value !== 'undefined' &&
    (route.name !== 'success' || Boolean(orderData.value.consulting)) &&
    axios
  ) {
    // Учитываем extra_kms при пересчете
    if (orderData.value.type_of_service === 'hourlyAsDirected' && route.name !== 'success') {
      const hours = Number(values.hours ?? 0)
      const extraKms = Number(orderData.value.extra_kms || 0)
      values.distance = hours * 20 + extraKms
    }
    isRequesting.value = true
    try {
      if (orderData.value.type_of_service === 'oneWayTransfer') {
        values.dropoff = orderData.value.dropoff
      }

      const response = await axios.post('/orders/update/orderSummary/' + orderId.value, values)
      const responseData = (
        response as { data?: { data?: { cars?: CarSummary[]; order?: OrderData } } }
      ).data?.data

      if (Array.isArray(responseData?.cars)) {
        carsStore.update(responseData.cars as CarSummary[])
      }

      if (responseData?.order) {
        const dataOrder = responseData.order
        orderStore.updateOrder(dataOrder)
        orderStore.updateOrderId((dataOrder as OrderData & { id?: string | number }).id ?? null)
        orderStore.update({
          distance: dataOrder.distance,
          extra_kms: dataOrder.extra_kms
        })

        if (pudoChanged.value) {
          axios.post('/fields/search/' + orderId.value, {}).catch(() => undefined)
        }
      }
    } catch (error) {
      console.error('[SummaryInfo] Error updating orderSummary:', error)
      captureError(error)
    } finally {
      isRequesting.value = false
    }
  } else {
    orderStore.update(values)
  }

  if (
    (orderData.value.deal_id || orderData.value.type_of_service === 'toursRoadshows') &&
    route.name === 'success' &&
    axios
  ) {
    if (orderData.value.type_of_service === 'toursRoadshows') {
      values['lead_id'] = orderData.value.lead_id
    }
    if (orderData.value.deal_id) {
      values['deal_id'] = orderData.value.deal_id
    }

    isRequesting.value = true

    values.phone = normalizePhone(values.phone)

    try {
      await axios.post('/success/editContact', values)
    } catch (error) {
      captureError(error)
    } finally {
      isRequesting.value = false
    }
  }

  summaryDataObject.isEditable = false
  summaryDataObject.dateInputStyles = {
    pointerEvents: 'none',
    color: 'unset',
    borderColor: 'transparent'
  }
}

const openModal = () => {
  summaryDataObject.isModal = true
  const html = document.querySelector('html') as HTMLElement | null
  const body = document.body

  if (html) {
    html.style.touchAction = 'none'
    html.style.overflowY = 'hidden'
    html.style.overscrollBehavior = 'none'
  }

  body.style.touchAction = 'none'
  body.style.overflowY = 'hidden'
  body.style.overscrollBehavior = 'none'
}

const closeModal = () => {
  summaryDataObject.isModal = false
  const html = document.querySelector('html') as HTMLElement | null
  const body = document.body

  if (html) {
    html.style.touchAction = 'auto'
    html.style.overflowY = 'auto'
    html.style.overscrollBehavior = 'auto'
  }

  body.style.touchAction = 'auto'
  body.style.overflowY = 'auto'
  body.style.overscrollBehavior = 'auto'
}

const closeErrorModal = () => {
  isShowErrorModal.value = false
  errorOnForm.value = null
}

// Clean up ref on unmount to prevent accessing unmounted component
onBeforeUnmount(() => {
  contactFieldsRef.value = null
})
</script>

<style>
.hide_phone {
  display: none;
}
</style>
