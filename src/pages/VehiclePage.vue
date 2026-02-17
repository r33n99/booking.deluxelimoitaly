<template>
  <div class="flex items-center justify-between gap-x-1">
    <router-link type="button" class="go_back_button group" :to="backButtonUrl">
      <ArrowLeftIcon />
      <span class="go_back_button__text">{{ backButtonText }}</span>
    </router-link>
    <span class="mt-6 flex gap-1 text-black dark:text-white"
      >Step
      <p class="text-main">2</p>
      of 5</span
    >
  </div>
  <div class="flex flex-col">
    <h1 class="title md:text-[80px]/[110%]">Select Vehicle</h1>
    <SummaryInfo
      customStyle="true"
      classnames="summary_title_button_wrapper flex form_to_edit md:items-start flex-col"
      title="Ride Summary"
      disabled="false"
    >
      <div v-if="isHourly === true" class="mb-6 mt-7 w-full space-y-4 text-background">
        <p class="mb-4 dark:text-white md:text-2xl">
          If the above Kms are not enough please click on the 2 below options
        </p>
        <div class="flex justify-start gap-x-4">
          <button
            class="rounded-full border !border-dark_main bg-dark_main px-4 py-1.5 text-center text-sm/[18.4px] font-semibold text-white transition-all duration-[0.3s] ease-in hover:!bg-main hover:!text-[#2B2D3D] dark:!border-main dark:bg-main dark:text-background dark:hover:!text-[#2B2D3D] md:py-3 md:text-lg/[23.8px]"
            :class="{
              '!bg-transparent !text-dark_main dark:!text-main':
                activeFormName === 'AdditionalKmsForm' || activeFormName === 'notActive'
            }"
            @click="openConsultingForm()"
          >
            I need your consulting
          </button>
          <button
            v-if="!orderData.extra_kms"
            class="rounded-full border !border-dark_main bg-dark_main px-4 py-1.5 text-center text-sm/[18.4px] font-semibold text-white transition-all duration-[0.3s] ease-in hover:!bg-main hover:!text-[#2B2D3D] dark:!border-main dark:bg-main dark:text-background dark:hover:!text-[#2B2D3D] md:py-3 md:text-lg/[23.8px]"
            :class="{
              '!bg-transparent !text-dark_main dark:!text-main':
                activeFormName === 'ConsultingForm' || activeFormName === 'notActive'
            }"
            @click="openAdditionalKmsForm()"
          >
            I know amount of Kms to add
          </button>
        </div>
        <div
          class="hidden flex-col justify-start space-y-4"
          :class="{ 'active !flex': activeFormName === 'ConsultingForm' }"
        >
          <p class="text-sm text-[#878787] dark:text-[#C8C8C8] md:text-lg/[23.8px]">
            In order to properly estimate and quote your service, kindly let us have the specifics
            of what you require such as Destinations or Sights where you will stop, and if the Drop
            Off Location is different from that of the Pick Up. Number of Passengers, or Preferred
            Vehicle Type, and Pick up Time.
          </p>
          <Form
            @submit="consultingSubmit"
            class="form flex flex-nowrap gap-4 max-sm:flex-col"
            :validation-schema="consultingSchema"
            v-slot="{ errors, isSubmitting }"
          >
            <Field
              type="text"
              class="input m-0 w-full sm:md:w-[calc(65%-24px)] md:w-[calc(85%-24px)]"
              :class="errors.consultingMessage ? 'error' : ''"
              name="consultingMessage"
              v-model="consultingMessage"
              placeholder="Type here..."
            />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="next_step_button w-full px-8 sm:w-max"
            >
              Submit
            </button>
          </Form>
        </div>
        <div
          class="hidden flex-col justify-start"
          :class="{
            'active !flex': activeFormName === 'AdditionalKmsForm' && !orderData.extra_kms
          }"
        >
          <Form
            @submit="additionalSubmit"
            class="form flex flex-nowrap gap-4 max-sm:flex-col"
            :validation-schema="additionalSchema"
            v-slot="{ errors, isSubmitting }"
          >
            <div class="relative w-full">
              <Field
                type="text"
                v-model.number="additionalKms"
                v-on:beforeinput="utils.isNumber($event)"
                name="additionalKms"
                :class="errors.additionalKms ? 'error' : ''"
                class="input m-0 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                placeholder="Additional Kms"
              />
              <button
                @click="additionalKms = additionalKms && additionalKms - 1"
                type="button"
                class="absolute left-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main pb-1.5 font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:left-1.5 md:top-1.5 md:size-[51px]"
              >
                –
              </button>
              <button
                @click="additionalKms += 1"
                type="button"
                class="absolute right-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main pb-1.5 font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:right-1.5 md:top-1.5 md:size-[51px]"
              >
                +
              </button>
            </div>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="next_step_button w-full px-8 sm:w-max"
            >
              Submit
            </button>
          </Form>
        </div>
      </div>
    </SummaryInfo>
  </div>
  <div class="mx-auto my-5 w-fit" role="status" v-if="!cars">
    <svg
      aria-hidden="true"
      class="mx-auto h-[70px] w-[70px] animate-spin fill-background text-gray-200 dark:text-main"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span class="mt-[15px]">Loading cars...</span>
  </div>
  <div class="vehicles_wrapper mt-[-38px] bg-[#DDE5DC] dark:bg-[#272729]" v-if="cars">
    <div class="vehicle" :key="car.class_id" v-for="(car, carIndex) in cars">
      <div class="vehicle__slider_wrapper">
        <swiper
          :slides-per-view="1"
          :navigation="true"
          :space-between="32"
          :modules="modules"
          :speed="600"
          :pagination="{ clickable: true }"
          class="w-full max-w-[320px] md:max-w-full"
        >
          <swiper-slide :key="imageIndex" v-for="(image, imageIndex) in car.class_images">
            <picture>
              <source type="image/webp" :srcset="carsUrl + image.webp" />
              <img
                :src="carsUrl + image.original"
                :alt="'Car image ' + (imageIndex + 1)"
                class="vehicle__image"
                width="600"
                height="400"
                :loading="carIndex === 0 && imageIndex === 0 ? 'eager' : 'lazy'"
              />
            </picture>
          </swiper-slide>
        </swiper>
      </div>
      <div class="vehicle__content">
        <div class="vehicle__name_wrapper">
          <p class="vehicle__name">{{ car.class_full_name }}</p>
          <p class="vehicle__price" v-if="isTour !== true && car.price">{{ car.price }} EUR</p>
          <p class="vehicle__price" v-if="isTour !== true && !car.price">
            The price will be calculated individually
          </p>
        </div>
        <div class="vehicle__capability_wrapper">
          <div class="vehicle__capability">
            <PassengersIcon v-if="!isMobile" />
            <PassengersMobileIcon v-if="isMobile" />
            <span class="vehicle__capability__text">Max {{ car.max_passengers }} People</span>
          </div>
          <div class="vehicle__capability">
            <SeatsIcon v-if="!isMobile" />
            <SeatsMobileIcon v-if="isMobile" />
            <span class="vehicle__capability__text">Max {{ car.max_luggage }} Suitcases</span>
          </div>
          <div class="vehicle__capability">
            <SeatsIcon v-if="!isMobile" />
            <SeatsMobileIcon v-if="isMobile" />
            <span class="vehicle__capability__text"
              >Max {{ car.max_hand_luggage }} hand luggage</span
            >
          </div>
        </div>
        <div class="vehicle__service_wrapper">
          <span class="vehicle__service__text">Free Wi-Fi</span>
          <span class="ellipse"></span>
          <span class="vehicle__service__text">Mineral water</span>
          <span class="ellipse"></span>
          <span class="vehicle__service__text">Includes Meet & Greet</span>
        </div>
        <p class="vehicle__description">
          Free 60 minutes wait time for airport pickups, 30 minutes for all others
        </p>
        <button class="summary_edit_button mt-12 w-full py-5 text-lg" @click="chooseCar(car)">
          Select {{ car.class_full_name }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
// Import Swiper Vue.js components
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { onBeforeMount, onMounted, ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMobile } from '@/compose/ismobile'
import utils from '@/plugins/utils'
import * as yup from 'yup'

import { Form, Field } from 'vee-validate'
import { useUserStore } from '@/stores/user'
import { useCarsStore } from '@/stores/ride/cars'
import { useOrderStore } from '@/stores/ride/order'
import { useMainStore } from '@/stores'
import { Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'

import ArrowLeftIcon from '@/components/ui/icons/ArrowLeftIcon.vue'
import PassengersMobileIcon from '@/components/ui/icons/PassengersMobileIcon.vue'
import PassengersIcon from '@/components/ui/icons/PassengersIcon.vue'
import SeatsIcon from '@/components/ui/icons/SeatsIcon.vue'
import SeatsMobileIcon from '@/components/ui/icons/SeatsMobileIcon.vue'
import { captureError } from '@/utils/sentry'
import { useContactsStore } from '@/stores/user/contacts'
import SummaryInfo from '@/components/features/summary/SummaryInfo.vue'
import { trackGtmEvent } from '@/utils/gtm'

const modules = [Pagination, Navigation]
const carsStore = useCarsStore()
const mainStore = useMainStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const contactsStore = useContactsStore()
const { user } = storeToRefs(userStore)
const { cars } = storeToRefs(carsStore)
const { orderData, orderId, tour, orderType, order } = storeToRefs(orderStore)
const { isRequesting } = storeToRefs(mainStore)
const { isMobile } = useMobile()

const carsUrl = ref(import.meta.env.VITE_APP_API_URL.replace('/api', '/cars/'))

const isTour = computed(() => {
  return orderData.value.type_of_service === 'toursRoadshows'
})
const isHourly = computed(() => {
  return orderData.value.type_of_service === 'hourlyAsDirected'
})

const router = useRouter()
const axios = inject('axios')

let consultingMessage = ref('')
let additionalKms = ref(0)
let activeFormName = ref('notActive')

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName]
    }
  }
  return obj
}

let backButtonUrl = ref('/')
let backButtonText = ref('Go Back')

if (
  (tour.value && orderData.value.redirectStep === 1) ||
  (isTour.value && orderData.value.redirectStep !== 1) ||
  orderType.value === 'DUPLICATE'
) {
  backButtonUrl.value = '/'
  backButtonText.value = 'Go Back'
} else {
  backButtonUrl.value = '/contact'
  backButtonText.value = 'Go Back to Contact'
}

const createOrder = async (callback) => {
  await axios
    .post('/orders', orderData.value)
    .then(function (response) {
      callback(response)
    })
    .catch(async function (error) {
      captureError(error)
    })
}

const chooseCar = async (car) => {
  const serviceType = orderData.value.type_of_service

  let funnel, stepNumber

  switch (serviceType) {
    case 'oneWayTransfer':
      funnel = 'one_way_transfer'
      stepNumber = 3
      break
    case 'hourlyAsDirected':
      funnel = 'hourly_as_directed'
      stepNumber = 3
      break
    case 'toursRoadshows':
      funnel = 'tours_roadshows'
      stepNumber = 2
      break
  }

  if (funnel) {
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: stepNumber,
      booking_step_name: 'vehicle'
    })
  }

  carsStore.selectCar(car)
  let data = {
    car: car.class_id,
    total: car.price ? Number(car.price) : null,
    step: 2,
    status: 3
  }

  // Сохраняем extra_kms и distance при выборе автомобиля, чтобы они не потерялись на бэке
  if (orderData.value.extra_kms !== null && orderData.value.extra_kms !== undefined) {
    data.extra_kms = orderData.value.extra_kms
  }
  if (orderData.value.distance !== null && orderData.value.distance !== undefined) {
    data.distance = orderData.value.distance
  }

  if (!isTour.value) {
    isRequesting.value = true

    orderData.value.total = data.total

    if (orderId.value && orderId.value !== 'null' && orderId.value !== 'undefined') {
      if (orderData.value.transaction_id) {
        axios
          .patch('/orders/' + orderId.value, data)
          .then(function (response) {
            const responseDealId = response.data?.data?.deal_id
            const responseContactId = response.data?.data?.contact_id
            const responseLeadId = response.data?.data?.lead_id

            orderStore.update({
              ...data,
              deal_id: responseDealId || orderData.value.deal_id,
              contact_id: responseContactId || orderData.value.contact_id,
              lead_id: responseLeadId || orderData.value.lead_id
            })
            isRequesting.value = false
            if (
              orderData.value.distance === null ||
              orderData.value.distance === 0 ||
              car.price === 0
            ) {
              orderData.value.allowedPages['success'] = 1
              router.push('/success')
            } else {
              router.push('/payment/' + orderData.value.transaction_id)
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      } else {
        axios
          .patch('/orders/' + orderId.value, data)
          .then(function (response) {
            orderStore.update(data)

            const responseDealId = response.data.data.deal_id

            if (response.data.data.distance === 0 || car.price === 0) {
              orderData.value.allowedPages['success'] = 1
              router.push('/success')
            } else {
              if (orderData.value.deal_id != null) {
                router.push('/payment/' + String(orderData.value.deal_id))
              } else {
                router.push('/payment/' + String(responseDealId))
              }
            }
            isRequesting.value = false
          })
          .catch(function (error) {
            console.log(error)
            isRequesting.value = false
          })
      }
    }
  } else {
    orderStore.update(data)
    isRequesting.value = false
    if (orderType.value === 'NEW') {
      orderData.value.allowedPages['contact'] = 1
      await router.push('/contact')
    } else {
      orderData.value.allowedPages['success'] = 1
      await router.push('/success')
    }
  }
}

const consultingSchema = yup.object({
  consultingMessage: yup.string().required().max(230)
})

const additionalSchema = yup.object({
  additionalKms: yup.number().required().min(0)
})

const consultingSubmit = () => {
  const data = {
    consulting: consultingMessage.value
  }
  if (orderId.value) {
    axios
      .post('/orders/update/orderConsulting/' + orderId.value, clean(data))
      .then(function () {
        orderData.value.allowedPages['success'] = 1
        orderStore.update({
          consulting: true
        })
        router.push({ name: 'success' })
      })
      .catch(function (error) {
        console.log(error)
      })
  }
}
const additionalSubmit = () => {
  if (additionalKms.value === '') {
    orderStore.update({ extra_kms: 0 })
  } else {
    const data = {
      extra_kms: additionalKms.value,
      distance: orderData.value.distance + additionalKms.value
    }

    if (orderId.value) {
      isRequesting.value = true
      axios
        .post('/orders/update/orderAdditionalKms/' + orderId.value, data)
        .then(function (response) {
          if (response.data.data.cars !== undefined && response.data.data.cars != null) {
            let new_cars = response.data.data.cars
            carsStore.update(new_cars)
          }

          if (response.data.data.order !== undefined && response.data.data.order != null) {
            const responseOrder = response.data.data.order
            orderStore.update({
              extra_kms: responseOrder.extra_kms ?? additionalKms.value,
              distance: responseOrder.distance
            })
          }

          isRequesting.value = false
          activeFormName.value = 'notActive'
          additionalKms.value = 0
        })
        .catch(function (error) {
          console.error('[VehiclePage] Error in orderAdditionalKms:', error)
          isRequesting.value = false
        })
    }
  }
}
const openConsultingForm = () => {
  activeFormName.value = 'ConsultingForm'
}
const openAdditionalKmsForm = () => {
  activeFormName.value = 'AdditionalKmsForm'
}

onBeforeMount(async () => {
  if (orderData.value.allowedPages.success_payment_intent) {
    orderStore.$reset()
    await router.push('forbidden')
  }

  if (
    orderData.value.utm_source != null &&
    orderData.value.redirectStep < 1 &&
    typeof orderData.value.redirectStep != 'undefined' &&
    tour.value
  ) {
    orderData.value.redirectStep = 1
  }

  if (!cars.value) {
    isRequesting.value = true
    await axios
      .post('cars/redirect', orderData.value)
      .then(function (response) {
        let data_cars = response.data.data.cars
        let data_order = response.data.data.order

        carsStore.update(data_cars)
        orderStore.updateOrder(data_order)
        orderStore.updateOrderId(data_order.id)

        if (response.data.data.order.distance !== null) {
          orderStore.update({ distance: Number(response.data.data.order.distance || 0) })
        }
        isRequesting.value = false
      })
      .catch(function (response) {
        console.log(response)
      })
  }

  if (orderType.value === 'DUPLICATE') {
    isRequesting.value = true
    const contactData = {
      user_id: user.value?.id,
      first_name: user.value?.first_name || '',
      last_name: user.value?.last_name || '',
      email: user.value?.email || '',
      phone: user.value?.phone || '',
      code: user.value?.code || '',
      country_prefix: user.value?.country_prefix || ''
    }

    contactsStore.select(contactData)
    orderStore.update(contactData)

    if (order.value) {
      orderData.value.pickup = order.value.pickup
      orderData.value.date_start = order.value.date_start
      orderData.value.mainTypes = order.value.mainTypes
      orderData.value.type_of_service = order.value.type_of_service
      orderData.value.number_of_passengers = order.value.number_of_passengers
    }

    await createOrder(async (response) => {
      const { cars: carsData, order: orderDataResponse } = response.data.data
      carsStore.update(carsData)
      orderStore.update(orderDataResponse)
      orderStore.updateOrder(orderDataResponse)
      orderStore.updateOrderId(orderDataResponse.id)

      try {
        const transactionResponse = await axios.post('transaction/fetch/' + orderDataResponse.id)
        orderData.value.transaction_id = transactionResponse.data.data.transaction_id

        orderStore.update({
          transaction_id: orderData.value.transaction_id
        })

        isRequesting.value = false
      } catch {
        console.error('Error fetching transaction ID:', transactionError)
        isRequesting.value = false
        captureError(transactionError)
      }
    })
  }
  if (orderData.value.type_of_service === 'toursRoadshows') {
    orderStore.update({
      dropoff: null,
      hours: null,
      extra_kms: null,
      distance: null
    })
  }

  if (!orderData.value.transaction_id && orderId.value && orderId.value != 'null') {
    isRequesting.value = true
    await axios
      .post('transaction/fetch/' + orderId.value)
      .then(function (response) {
        orderData.value.transaction_id = response.data.data.transaction_id
        isRequesting.value = false
      })
      .catch(function (error) {
        isRequesting.value = false
        console.log(error)
      })
  }
  // Clear Timer in Payment
  orderData.value.countdown = 'stop'
})

const updateCars = async () => {
  try {
    const response = await axios.get('/orders/' + orderId.value)

    if (response.data.data.order) {
      const orderFromResponse = response.data.data.order

      // Обновляем distance и extra_kms из response для синхронизации с бэком
      // Используем значения из response, если они определены (включая 0)
      const updateData = {}

      if (orderFromResponse.distance !== undefined && orderFromResponse.distance !== null) {
        updateData.distance = orderFromResponse.distance
      }

      // extra_kms: обновляем если в response есть значение (включая 0)
      // null/undefined в response означает, что значение не было установлено, сохраняем локальное
      if (orderFromResponse.extra_kms !== undefined) {
        updateData.extra_kms = orderFromResponse.extra_kms
      }

      if (Object.keys(updateData).length > 0) {
        orderStore.update(updateData)
      }
    }

    carsStore.update(response.data.data.prices)
  } catch (e) {
    console.error('[VehiclePage] Error in updateCars:', e)
  }
}

onMounted(async () => {
  if (orderId.value) {
    await updateCars()
  }
})
</script>
