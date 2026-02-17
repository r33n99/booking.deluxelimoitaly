<template>
  <div class="flex items-center justify-between gap-x-1">
    <router-link
      class="go_back_button group"
      :to="backSideLink"
      v-if="backSideLinkCriteria || isAgency"
    >
      <GoBackIcon />
      <span v-if="isAgency" @click="updateAgencyData" class="go_back_button__text">Go Back</span>
      <span v-else class="go_back_button__text">Go Back to Select Vehicle</span>
    </router-link>
    <span v-if="backSideLinkCriteria" class="mt-6 flex gap-1 text-black dark:text-white">
      Step
      <p class="text-main">3</p>
      of 5</span
    >
  </div>
  <div
    v-if="modalVisible"
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
        <b>Important Notice:</b><br />The price has been updated. Click on OK below to see the new
        offer.
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
  <div class="">
    <div
      class="flex flex-row flex-wrap items-center justify-between px-4"
      :class="!backSideLinkCriteria ? 'py-[40px] pb-[10px]' : ''"
    >
      <h1 class="title">Payment</h1>
      <h1 class="title payment__price">{{ orderData.amount ?? orderData.total ?? 0 }} EUR</h1>
    </div>
    <SummaryInfo
      classnames="summary_title_button_wrapper form_to_edit"
      title="Book Now the Following Ride"
      custom-style="false"
      disabled="true"
    >
      <PaymentForm />
    </SummaryInfo>
    <div class="w-full">
      <p id="time_over" style="display: none" class="payment_timer_text text-error">
        The time to book this ride on line has expired, but no worries, our consultants will reach
        out to you with an updated offer in due course.
      </p>
      <form id="payment-form" class="payment_form form mt-[-38px]">
        <div id="payment-element">
          <!--Stripe.js injects the Payment Element-->
        </div>
        <label
          v-if="!isLoggedIn"
          class="relative mt-[28px] inline-flex w-full cursor-pointer items-start"
        >
          <input
            type="checkbox"
            value=""
            class="peer sr-only"
            v-model="user_add_value"
            :true-value="1"
            :false-value="0"
            @change="changeCheckbox"
          />
          <div
            class="peer h-6 w-[39px] min-w-[39px] rounded-full bg-toggler_gray after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:bg-main peer-checked:after:translate-x-[80%] peer-checked:after:border-white peer-checked:after:bg-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 md:h-[31px] md:w-[51px] md:after:h-[27px] md:after:w-[27px] md:peer-checked:after:translate-x-[70%]"
          ></div>
          <span class="account_toggler_text"
            >Create Personal Account After Payment, it will facilitate you a lot if you book other
            services, and it requires no further data entry, only 1 click!</span
          >
        </label>
        <textarea
          ref="textarea"
          v-model="textareaField"
          maxlength="230"
          :class="noteError ? 'error' : ''"
          class="input ym-record-keys mb-0 mt-[30px] w-full resize-none overflow-hidden"
          rows="1"
          placeholder="Here you can leave any notes…"
        ></textarea>
        <p v-if="noteError" class="ml-1 mt-2 inline-block text-sm font-extralight text-[#df1b41]">
          {{ noteError }}
        </p>

        <div v-if="paymentMount" class="next_step_button_wrapper mt-[40px]">
          <button class="next_step_button" id="submit" data-testid="paymentPage-submit">
            Pay now
          </button>
        </div>
        <p id="payment-message" class="payment_timer_text hidden"></p>
        <!-- Time Counter start -->

        <div
          :class="!countdownTimer ? 'hidden' : ''"
          id="countdown_wrap"
          class="payment_timer_text mt-6 xl:mt-10"
        >
          <PaymentTimer
            v-if="orderData.timer_updated || timerExpires"
            :initial_time="orderData.countdown ?? undefined"
            :timerExpires="timerExpires"
          />
        </div>
        <!--  Time Counter end -->
      </form>
      <div
        v-if="orderData.timer_expires"
        class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
      >
        <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
          <div class="flex justify-center p-4">Payment timer expired. Please refill</div>
          <div class="p-6 pt-0">
            <button class="modal_refill_button" @click="router.push({ name: 'home' })">
              Fill out again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import GoBackIcon from '@/components/ui/icons/GoBackIcon.vue'
import { captureError } from '@/utils/sentry'
import {
  onMounted,
  onBeforeMount,
  inject,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  nextTick
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import * as yup from 'yup'
import { useUserStore } from '@/stores/user'
import { useCarsStore } from '@/stores/ride/cars'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import SummaryInfo from '@/components/features/summary/SummaryInfo.vue'
import PaymentTimer from '@/components/features/payment/PaymentTimer.vue'
import { trackGtmEvent } from '@/utils/gtm'
import type {
  PaymentIntentData,
  PaymentMode,
  StoragePlugin,
  TransactionInitResponse
} from '@/types/pages/payment'
import type { OrderData } from '@/types/stores/ride/order'
import type { User } from '@/types/stores/user/profile'
import type { AxiosInstance, AxiosError } from 'axios'
import type { CarSummary } from '@/types/stores/ride/cars'
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripePaymentElement,
  type StripePaymentElementChangeEvent,
  type Appearance
} from '@stripe/stripe-js'

const router = useRouter()
const route = useRoute()
const mainStore = useMainStore()
const orderStore = useOrderStore()
const carsStore = useCarsStore()
const userStore = useUserStore()

const storage = inject<StoragePlugin>('storage')
if (!storage) {
  throw new Error('Storage plugin is not provided')
}

const axios = inject<AxiosInstance>('axios')
if (!axios) {
  throw new Error('Axios instance is not provided')
}

const { isLoggedIn, user } = storeToRefs(userStore)
const { orderData, orderId } = storeToRefs(orderStore)
const { paymentVisited, priceChanged, isRequesting, mode } = storeToRefs(mainStore)

const textareaField = ref<string>('')
const noteError = ref<string | false>(false)
const countdownTimer = ref<OrderData['countdown']>(orderData.value.countdown)
const timerExpires = ref<boolean>(false)
interface PaymentOrderSnapshot extends Partial<OrderData> {
  performance?: string | null
  priceChanged?: boolean
}

const localData = ref<PaymentOrderSnapshot | null>(null)

// Initialize user_add from sessionStorage or default to 0
const storedUserAdd = sessionStorage.getItem('user_add')
const user_add_value = ref<number>(storedUserAdd ? parseInt(storedUserAdd) : 0)

const isAgency = computed<boolean>(() => {
  return (user.value as User | null)?.type === 'agency'
})

const backSideLink = ref<string>(isAgency.value ? '/' : '/vehicle')

const paymentMount = ref<boolean>(false)

const colors: Record<string, Record<string, string>> = {
  dli: {
    '.Input:hover': '1px solid #5FD052',
    '.Input:active': '1px solid #5FD052'
  },
  rlt: {
    '.Input:hover': '1px solid #c6a65f',
    '.Input:active': '1px solid #c6a65f'
  },
  dgt: {
    '.Input:hover': '1px solid #e5ba8c',
    '.Input:active': '1px solid #e5ba8c'
  }
}
const payment_button_color = [
  'pointer-events-none',
  '!bg-gray-400',
  '!border-gray-800',
  '!cursor-not-allowed'
]
const inputHover = computed<string>(() => {
  return colors[import.meta.env.VITE_PROJECT_ALIAS]['.Input:hover']
})
const inputActive = computed<string>(() => {
  return colors[import.meta.env.VITE_PROJECT_ALIAS]['.Input:active']
})

const backSideLinkCriteria = computed<boolean>(() => {
  return Boolean(orderData.value.fromStart)
})
const modalView = ref<boolean>(false)

function closeModal(): void {
  modalView.value = false
}

const modalVisible = computed<boolean>(() => {
  return priceChanged.value && modalView.value
})

function changeCheckbox(): void {
  sessionStorage.setItem('user_add', String(user_add_value.value))
}

async function initPayment(paymentData: PaymentIntentData): Promise<void> {
  // This is a public sample test API key.
  // Don't submit any personally identifiable information in requests made with this key.
  // Sign in to see your own test API key embedded in code samples.
  const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPE_KEY as string, {
    locale: 'en'
  })

  if (!stripe) {
    return
  }
  const appearanceModes: Record<PaymentMode, Appearance> = {
    light: {
      rules: {
        '.Input': {
          color: '#2B2D32',
          border: '1px solid #878787',
          borderRadius: '53px',
          padding: '22px 20px',
          backgroundColor: '#E8EDE880'
        },
        '.Input::placeholder': {
          color: '#878787'
        },
        '.Input:hover': {
          border: inputHover.value
        },
        '.Input:active': {
          border: inputActive.value
        },
        '.Input:focus': {
          boxShadow: 'none',
          borderColor: 'black'
        },
        '.Label': {
          opacity: '0',
          visibility: 'hidden',
          width: '0',
          height: '0',
          display: 'none !important'
        },
        '.Input--invalid': {
          boxShadow: 'none',
          color: '#FA4141',
          borderColor: '#FA4141'
        },
        '.p-FieldError': {
          color: '#FA4141'
        }

        // See all supported class names and selector syntax below
      }
    },
    dark: {
      rules: {
        '.Input': {
          color: '#FFFFFF',
          border: '1px solid #3D4043',
          borderRadius: '53px',
          padding: '22px 20px',
          backgroundColor: '#2B2D32'
        },
        '.Input::placeholder': {
          color: '#878787'
        },
        '.Input:hover': {
          border: inputHover.value
        },
        '.Input:active': {
          border: inputActive.value
        },
        '.Input:focus': {
          boxShadow: 'none',
          borderColor: 'black'
        },
        '.Label': {
          opacity: '0',
          visibility: 'hidden',
          width: '0',
          height: '0',
          display: 'none !important'
        },
        '.Input--invalid': {
          boxShadow: 'none',
          color: '#FA4141',
          borderColor: '#FA4141'
        }

        // See all supported class names and selector syntax below
      }
    }
  }
  // The items the customer wants to buy
  // const items = {
  //   amount: orderData.value.total,
  //   email: orderData.value.email,
  //   website: import.meta.env.VITE_PROJECT_URL
  // }

  let elements: StripeElements

  await initialize(paymentData)
  await checkStatus()

  async function waitForElement(selector: string): Promise<void> {
    while (!document.querySelector(selector)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  async function setupForm(): Promise<void> {
    await waitForElement('#payment-form')

    document.querySelector('#payment-form')?.addEventListener('submit', handleSubmit)
  }

  setupForm()

  // Fetches a payment intent and captures the client secret\
  async function initialize(payment: PaymentIntentData): Promise<void> {
    const clientSecret = payment.client_secret
    const currentMode = (mode.value === 'light' ? 'light' : 'dark') as PaymentMode
    elements = stripe!.elements({ clientSecret, appearance: appearanceModes[currentMode] })
    const paymentElement: StripePaymentElement = elements.create('payment')
    await waitForElement('#payment-element')
    paymentElement.mount('#payment-element')

    paymentElement.on('change', async function (event: StripePaymentElementChangeEvent) {
      paymentMount.value = true

      await nextTick()

      const submitButton = document.querySelector<HTMLButtonElement>('#submit')
      const buttonWrapper = document.querySelector<HTMLDivElement>('.next_step_button_wrapper')

      if (submitButton && buttonWrapper) {
        if (event.complete) {
          submitButton.classList.remove(...payment_button_color)
          buttonWrapper.classList.remove('!cursor-not-allowed')
        } else {
          submitButton.classList.add(...payment_button_color)
          buttonWrapper.classList.add('!cursor-not-allowed')
        }
      }
    })
    watch(mode, () => {
      const newMode = (mode.value === 'light' ? 'light' : 'dark') as PaymentMode
      elements.update({ appearance: appearanceModes[newMode] })
    })

    setLoading(false)
  }

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    const serviceType = orderData.value.type_of_service

    let funnel: string | undefined

    if (serviceType === 'oneWayTransfer' || serviceType === 'hourlyAsDirected') {
      funnel = serviceType === 'oneWayTransfer' ? 'one_way_transfer' : 'hourly_as_directed'
      trackGtmEvent('booking_next_step', {
        booking_funnel: funnel,
        booking_step_number: 4,
        booking_step_name: 'payment'
      })
    }

    const schema = yup.object({
      notes: yup.string().nullable().max(230, 'Notes should not exceed 230 character')
    })

    try {
      const res = await schema.validate({ notes: textareaField.value || null })
      orderStore.update({ notes: res.notes ?? null })
      await confirm()
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        noteError.value = error.errors[0] ?? false
      }
    }

    async function confirm(): Promise<void> {
      setLoading(true)
      const { error } = await stripe!.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${import.meta.env.VITE_APP_URL}/success/payment_intent/${orderId.value}`
        }
      })

      if (error && 'type' in error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          showMessage(error.message)
        } else {
          showMessage('An unexpected error occurred.')
        }
      }

      setLoading(false)
    }
  }

  // Fetches the payment intent status after payment submission
  async function checkStatus(): Promise<void> {
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    const { paymentIntent } = await stripe!.retrievePaymentIntent(clientSecret)
    if (!paymentIntent) {
      return
    }

    switch (paymentIntent.status) {
      case 'succeeded':
        showMessage('Payment succeeded!')
        mainStore.updatePaymentComplete(true)
        break
      case 'processing':
        showMessage('Your payment is processing.')
        break
      case 'requires_payment_method':
        showMessage('Your payment was not successful, please try again.')
        break
      default:
        showMessage('Something went wrong.')
        break
    }
  }

  function showMessage(messageText?: string): void {
    if (!messageText) return
    const messageContainer = document.querySelector<HTMLParagraphElement>('#payment-message')
    if (!messageContainer) return

    messageContainer.classList.remove('hidden')
    messageContainer.textContent = messageText

    setTimeout(function () {
      messageContainer.classList.add('hidden')
      messageContainer.textContent = ''
    }, 4000)
  }

  // Show a spinner on payment submission
  function setLoading(isLoading: boolean): void {
    isRequesting.value = isLoading
    if (isRequesting.value) {
      // Disable the button and show a spinner
      const submitButton = document.querySelector<HTMLButtonElement>('#submit')
      if (submitButton) {
        submitButton.disabled = true
      }
    } else {
      const submitButton = document.querySelector<HTMLButtonElement>('#submit')
      if (submitButton) {
        submitButton.disabled = false
      }
    }
  }
}

const parseNumberSuitcases = (value: unknown): { large: number; small: number } | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    const result: Partial<{ large: number; small: number }> = {}

    value.split(';').forEach((chunk) => {
      const [rawKey, rawValue] = chunk.split(':')
      if (!rawKey || !rawValue) {
        return
      }

      const key = rawKey.trim().toLowerCase()
      if (key !== 'large' && key !== 'small') {
        return
      }

      const parsedValue = Number.parseInt(rawValue.trim(), 10)
      result[key as 'large' | 'small'] = Number.isNaN(parsedValue) ? 0 : parsedValue
    })

    if (typeof result.large === 'number' && typeof result.small === 'number') {
      return { large: result.large, small: result.small }
    }

    return null
  }

  if (typeof value === 'object') {
    const maybeObject = value as { large?: unknown; small?: unknown }
    const large = Number.parseInt(String(maybeObject.large ?? 0), 10)
    const small = Number.parseInt(String(maybeObject.small ?? 0), 10)

    return {
      large: Number.isNaN(large) ? 0 : large,
      small: Number.isNaN(small) ? 0 : small
    }
  }

  if (typeof value === 'number') {
    const numeric = Number.isNaN(value) ? 0 : value
    return { large: numeric, small: 0 }
  }

  return null
}

const updateAgencyData = () => {
  const source = localData.value
  if (!source || user.value?.type !== 'agency') {
    return
  }

  const parsedSuitcases = parseNumberSuitcases(source.number_suitcases)
  const suitcasesString = parsedSuitcases
    ? `Large: ${parsedSuitcases.large}; Small: ${parsedSuitcases.small}`
    : ''

  userStore.updateAgency({
    pickup: source.pickup ?? '',
    dropoff: source.dropoff ?? '',
    date_start: source.date_start ?? null,
    hours: source.hours ?? null,
    car_id: source.car ?? null,
    performance: source.performance ?? '',
    number_of_passengers: source.number_of_passengers ?? 1,
    main_passenger: source.main_passenger ?? '',
    other_language: source.other_language ?? 'English',
    pickup_specific: source.pickup_specific ?? '',
    dropoff_specific: source.dropoff_specific ?? '',
    number_suitcases: suitcasesString,
    notes: source.notes ?? '',
    amount: source.total ?? null,
    file_number: source.file_number ?? '',
    type_of_service: source.type_of_service ?? '',
    status: source.status ?? null,
    order_id: source.id ?? null
  })
}

onBeforeMount(async () => {
  const { transaction_id } = { ...route.params } as { transaction_id?: string }
  isRequesting.value = true

  if (transaction_id) {
    try {
      const response = await axios.post<TransactionInitResponse>(
        'transaction/init/' + transaction_id
      )

      if (response.data.status === 'error') {
        timerExpires.value = true
        orderStore.update({ timer_expires: true })
      }

      if (response.data.status === 'success') {
        const payload = response.data?.data
        const responseOrder = payload?.order as PaymentOrderSnapshot | undefined

        if (!responseOrder) {
          isRequesting.value = false
          return
        }

        let countdown = null
        if (!payload?.type && responseOrder.timer_updated) {
          const timerUpdatedDate = new Date(responseOrder.timer_updated)
          const now = new Date()
          if (timerUpdatedDate <= now) {
            timerExpires.value = true
            orderStore.update({ timer_expires: true })
          } else {
            const datetime = new Date(responseOrder.timer_updated).getTime() - 3600000
            countdown = new Date(datetime)
          }
        }

        const deal_id =
          typeof responseOrder.deal_id === 'string'
            ? responseOrder.deal_id.replace('n', '')
            : (responseOrder.deal_id ?? '')
        const contact_id =
          typeof responseOrder.contact_id === 'string'
            ? responseOrder.contact_id.replace('n', '')
            : (responseOrder.contact_id ?? '')

        let distance = responseOrder.distance ?? orderData.value.distance ?? null

        if (!distance) {
          distance = orderData.value.distance
        }
        localData.value = { ...responseOrder }
        updateAgencyData()

        orderStore.update({
          ...(responseOrder as Partial<OrderData>),
          deal_id,
          contact_id,
          distance,
          countdown,
          fromStart: orderData.value.fromStart,
          transaction_id
        })

        countdownTimer.value = countdown

        orderData.value.allowedPages = {
          contact: 1,
          vehicle: 1,
          success_payment_intent: 0,
          contactData: 0,
          serviceData: 0,
          success: 0
        }
        if (user.value && user.value.type === 'agency') {
          orderStore.update({
            allowedPages: {
              contact: 1,
              vehicle: 1,
              success_payment_intent: 1,
              contactData: 0,
              serviceData: 0,
              success: 1
            }
          })
        }

        if (payload?.cars && responseOrder?.car) {
          const selectedCar = payload.cars.find(
            (car) => String(car.class_id) === String(responseOrder.car)
          )
          if (selectedCar) {
            const rawId = (selectedCar as { id?: unknown }).id
            const idValue =
              typeof rawId === 'string' || typeof rawId === 'number' ? rawId : selectedCar.class_id

            const rawName = (selectedCar as { name?: unknown }).name
            const nameValue = typeof rawName === 'string' ? rawName : String(selectedCar.class_id)

            const normalizedCar: CarSummary = {
              ...(selectedCar as Record<string, unknown>),
              id: idValue,
              name: nameValue
            } as CarSummary

            carsStore.selectCar(normalizedCar)
          }
        }

        orderStore.updateOrderId(responseOrder?.id ?? null)
        if (payload?.payment) {
          await initPayment(payload.payment)
        }
        if (responseOrder?.priceChanged) {
          mainStore.updatePriceChanged(true)
        }
        if (priceChanged.value) {
          modalView.value = true
        }
      }
      isRequesting.value = false
    } catch (error) {
      orderStore.$reset()
      carsStore.$reset()
      captureError(error instanceof Error ? error : new Error('Payment init failed'))
      isRequesting.value = false
      // If the order has already been paid
      const axiosError = error as AxiosError | undefined
      if (axiosError?.response?.status === 410) {
        router.push({ name: 'alreadyPaid' })
      }
      if (axiosError?.response?.status === 404) {
        console.log('error', axiosError)
      }
    }
  }
})

onMounted(() => {
  paymentVisited.value = true

  let now = new Date()
  let countdown = new Date(now.getTime() + 5 * 60000)
  storage.setItem('countdown', countdown, 'session')

  console.log('orderData:', orderData)
})
onBeforeUnmount(() => {
  priceChanged.value = false
})
</script>
