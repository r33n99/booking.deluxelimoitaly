<template>
  <div
    v-if="isLoggedIn"
    class="mt-8 flex flex-row flex-wrap items-end justify-between pb-6 md:mt-[45px] md:pb-[64px]"
  >
    <div class="flex w-full items-center justify-between">
      <h1 class="title mr-[15px] mt-0">Your Rides</h1>
    </div>
  </div>
  <div v-if="isLoggedIn" class="flex max-md:flex-col">
    <div
      class="left_side-wrapper scrollbar-hidden flex-nowrap overflow-x-scroll md:mr-[2%] md:overflow-x-visible xl:mr-[19.18%]"
    >
      <button
        @click="newRide"
        type="button"
        class="summary_edit_button m-0 text-nowrap px-[22px] py-[8px] font-bold md:px-[22px] md:py-[8px]"
      >
        Book a New Ride <span class="account__button__disc"></span>
      </button>
      <router-link to="/account/accountinformation" class="account__button text-nowrap"
        >Account Information <span class="account__button__disc"></span
      ></router-link>
      <router-link
        v-if="isAgency"
        to="/account/agencyinformation"
        class="account__button text-nowrap"
        >Agency information <span class="account__button__disc"></span
      ></router-link>
      <button type="button" class="account__button active text-nowrap">
        Ride History <span class="account__button__disc"></span>
      </button>
      <router-link to="/account/documentsreceipts" class="account__button text-nowrap"
        >Documents/Receipts<span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/termsofservice" class="account__button text-nowrap"
        >Terms of Service<span class="account__button__disc"></span
      ></router-link>
      <button v-if="!isMobile" @click="logOut" type="button" class="account__button text-[#878787]">
        Log Out
      </button>
    </div>
    <div v-if="isMobile" class="mt-[6px]">
      <button @click="logOut" type="button" class="account__button text-[#878787]">Log Out</button>
    </div>
    <div class="fake-orders-wrapper relative w-full">
      <rides-filter />
      <template v-if="!isRidesFetched">
        <div
          class="right_side-wrapper mt-[15%] w-full"
          :class="{ ride: true, 'blur-sm': !isRidesFetched }"
          v-for="(fakeDataItem, index) in fakeData.slice(0, 4)"
          :key="index"
        >
          <div class="ride__top">
            <div class="ride__top__separator">
              <p class="ride_text">ID - {{ fakeDataItem.id }}</p>
              <p class="ride_text">Type of service - {{ fakeDataItem.typeOfService }}</p>
            </div>
            <div class="ride__top__separator">
              <p class="ride_text">Date - {{ fakeDataItem.date }}</p>
              <span class="ride_status waiting">Status - {{ fakeDataItem.status }}</span>
            </div>
          </div>
          <div class="ride__summary_button_wrapper">
            <div class="ride__summary_wrapper grid gap-x-8 lg:grid-cols-2 xl:grid-cols-3">
              <div class="summary_item_wrapper ride_summary_item_wrapper">
                <span class="summary_item_title ride_summary_title"
                  >Pick Up Location: {{ fakeDataItem.pickupLocation }}</span
                >
              </div>
              <div class="summary_item_wrapper ride_summary_item_wrapper">
                <span class="summary_item_title ride_summary_title"
                  >Drop Off Location: {{ fakeDataItem.dropOffLocation }}</span
                >
              </div>
              <div class="summary_item_wrapper ride_summary_item_wrapper">
                <span class="summary_item_title ride_summary_title"
                  >Duration: {{ fakeDataItem.duration }}</span
                >
              </div>
              <div class="summary_item_wrapper ride_summary_item_wrapper !mb-0 md:!mb-6">
                <span class="summary_item_title ride_summary_title"
                  >Date:{{ fakeDataItem.date }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <!-- Overlay -->
        <div class="absolute left-0 top-[15%] z-10 flex size-full items-center justify-center">
          <div class="relative size-full">
            <div class="sticky top-1/2 mt-12 flex flex-col items-center gap-4 md:mt-0 xl:mt-32">
              <button class="button ride__button w-max">
                <loading-spinner v-if="buttonText === 'Loading rides...'" class="mr-1" />
                {{ buttonText }}
              </button>
              <button
                v-if="isRequestRefused"
                @click="retryLoadRides"
                class="button ride__button w-max !bg-gray-600 hover:!bg-gray-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="right_side-wrapper w-full space-y-6">
          <div
            v-for="(history, index) in rides"
            :class="{
              'pb-6 xl:pb-8':
                ![4, 5].includes(history.status) || history.type_of_service === 'Inspiritaly Tour'
            }"
            :key="history.id || index"
            data-testid="order-block"
            class="space-y-4 rounded-[30px] bg-white px-4 pt-6 dark:bg-[#272729] xl:rounded-[40px] xl:px-6 xl:pt-8"
          >
            <div class="flex items-center justify-between gap-x-5">
              <div class="flex w-full justify-between md:text-lg">
                <p class="lg:hidden">{{ history.type_of_service }}</p>
                <p :class="{ 'opacity-0': !history.order_id }" class="max-lg:hidden">
                  ID - {{ history.order_id }}
                </p>
                <p class="max-lg:hidden">
                  {{ history.created_at.replaceAll('T', ' ').split('.')[0] }}
                </p>
              </div>
              <span v-if="history.status === 1" class="ride_status pending"
                >Model Selection Pending</span
              >
              <span v-if="history.status === 2" class="ride_status waiting">Payment Pending</span>
              <span v-if="history.status === 3" class="ride_status waiting"
                >Waiting Convert Tours</span
              >
              <span v-if="history.status === 4" class="ride_status done">Booked</span>
              <p v-if="history.status === 5" class="ride_status shrink-0 gap-x-2.5 bg-main">
                <CreditCardIcon />
                <span>Credit</span>
              </p>
              <span v-if="history.status === 7" class="ride_status cancelled">Payment expired</span>
            </div>
            <div
              class="grid gap-x-8 gap-y-4 border-y border-y-[#878787] py-4 *:space-y-2 dark:border-y-[#333639] sm:max-md:grid-cols-3 lg:grid-cols-3 lg:border-y-[#E8EDE8]/50 lg:py-6 dark:lg:border-y-[#3D4043] xl:grid-cols-4 xl:gap-x-16"
            >
              <div v-if="history.date_start != null">
                <span class="ride_summary_title">Date:</span>
                <input
                  type="text"
                  :value="history.date_start.split('.')[0].replaceAll('T', ' ').slice(0, 16)"
                  class="ride_summary_input"
                  placeholder="Date:"
                  data-testid="ride-date"
                  disabled
                />
              </div>
              <div class="max-lg:hidden">
                <span class="ride_summary_title">Service type:</span>
                <input
                  type="text"
                  :value="history.type_of_service"
                  class="ride_summary_input"
                  placeholder="Service type:"
                  disabled
                />
              </div>
              <div v-if="history.pickup != null" class="group relative">
                <span class="ride_summary_title">Pick Up Location:</span>
                <div class="tooltip">
                  <input
                    type="text"
                    :value="history.pickup"
                    class="ride_summary_input w-full"
                    placeholder="Pick Up Location:"
                    data-testid="ride-pickup"
                    readonly
                  />
                  <span v-if="history.pickup.length > 17" class="tooltiptext">
                    {{ history.pickup }}
                  </span>
                </div>
              </div>
              <div
                v-if="history.hours && history.type_of_service === 'Inspiritaly Tour'"
                class="flex flex-col justify-between"
              >
                <p class="text-[16px] font-normal text-[#878787] md:text-[18px]">Duration:</p>
                <p
                  class="text-[16px] font-normal leading-[20px] text-background dark:text-white md:text-[18px]"
                >
                  {{
                    Math.floor(Number(history.hours) / 60) +
                    ' hour' +
                    (Math.floor(Number(history.hours) / 60) !== 1 ? 's' : '')
                  }}
                </p>
              </div>
              <div
                v-if="
                  history.dropoff != null &&
                  (history.type_of_service === 'One Way Transfer' ||
                    history.type_of_service === 'Inspiritaly Tour')
                "
                class="group relative"
              >
                <span class="ride_summary_title">Drop Off Location:</span>
                <div class="tooltip">
                  <input
                    type="text"
                    :value="history.dropoff"
                    class="ride_summary_input"
                    placeholder="Drop Off Location"
                    data-testid="ride-dropoff"
                    readonly
                  />
                  <span v-if="history.dropoff.length > 17" class="tooltiptext">
                    {{ history.dropoff }}
                  </span>
                </div>
              </div>
            </div>
            <div class="space-y-1 lg:hidden">
              <p v-if="history.order_id">ID - {{ history.order_id }}</p>
              <p>{{ history.created_at.replaceAll('T', ' ').split('.')[0] }}</p>
            </div>
            <div class="flex flex-col md:flex-row md:justify-between">
              <div
                class="flex flex-row justify-between border-t-[1px] border-t-[#333639] py-4 lg:my-0 lg:border-0 lg:py-0"
              >
                <div
                  v-if="history.hours && history.type_of_service === 'Hourly as directed'"
                  class="mr-5 flex flex-col"
                >
                  <p class="text-[14px] font-normal leading-[15px] text-[#878787]">Duration:</p>
                  <p class="text-[14px] font-normal leading-[20px] text-background dark:text-white">
                    {{ history.hours }} hours
                  </p>
                </div>
                <div v-if="history.distance" class="mr-5 flex flex-col">
                  <p class="text-[14px] font-normal leading-[15px] text-[#878787]">Distance:</p>
                  <p class="text-[14px] font-normal leading-[20px] text-background dark:text-white">
                    {{ history.distance }} KMS
                  </p>
                </div>
                <div v-if="history.car" class="flex flex-col">
                  <p class="text-[14px] font-normal leading-[15px] text-[#878787]">Car:</p>
                  <p
                    class="text-[14px] font-normal leading-[20px] text-background dark:text-white md:text-nowrap"
                  >
                    {{ history.car }}
                  </p>
                </div>
              </div>
              <div
                class="flex flex-wrap gap-4 max-lg:flex-col lg:items-center lg:justify-end lg:text-lg/none"
              >
                <p
                  v-if="(history.amount ?? history.total) && history.status !== 2"
                  class="border-y-[1px] border-y-[#3339] py-4 text-end text-2xl font-bold text-background dark:text-main lg:border-0 lg:py-0 lg:text-start lg:text-lg lg:font-semibold"
                >
                  {{ history.amount ?? history.total }} EUR
                </p>
                <button
                  v-if="history.status === 1"
                  class="w-full rounded-full bg-main px-4 py-4 font-semibold text-background transition-all duration-[0.3s] ease-in hover:!bg-[#CCF2C8] dark:border dark:border-main dark:bg-background dark:text-main dark:hover:!bg-main dark:hover:text-[#2B2D38] lg:w-max lg:py-3"
                  @click="continueBooking(history)"
                >
                  Continue booking
                </button>
                <button
                  v-if="history.status === 2"
                  class="w-full rounded-full bg-main px-4 py-4 font-semibold text-background transition-all duration-[0.3s] ease-in hover:!bg-[#CCF2C8] dark:border dark:border-main dark:bg-background dark:text-main dark:hover:!bg-main dark:hover:text-[#2B2D38] lg:w-max lg:py-3"
                  @click="continueToPayment(history)"
                >
                  Finalize payment - {{ history.total }} EUR
                </button>
                <button
                  id="book_return_ride"
                  class="w-full rounded-full bg-main px-4 py-4 font-semibold text-background transition-all duration-[0.3s] ease-in hover:!bg-[#CCF2C8] dark:border dark:border-main dark:bg-background dark:text-main dark:hover:!bg-main dark:hover:text-[#2B2D38] lg:w-max lg:py-3"
                  v-if="
                    history.type_of_service !== 'Inspiritaly Tour' &&
                    ((!isAgency && history.type_of_service === 'Tours / Roadshows') ||
                      history.status === 4 ||
                      history.status === 5)
                  "
                  @click="formatHistoryData(history, 'return')"
                >
                  Book Return Ride
                </button>
                <button
                  id="duplicate_ride"
                  class="w-full rounded-full border border-dark_main px-4 py-4 font-semibold text-dark_main transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D38] dark:border-white dark:text-white dark:hover:bg-[#636363] lg:w-max lg:py-3"
                  v-if="
                    history.type_of_service !== 'Inspiritaly Tour' &&
                    ((!isAgency && history.type_of_service === 'Tours / Roadshows') ||
                      history.status === 4 ||
                      history.status === 5)
                  "
                  @click="formatHistoryData(history, 'duplicate')"
                >
                  Duplicate & Edit Ride
                </button>
                <button
                  id="duplicate_ride"
                  class="w-full rounded-full border border-dark_main px-4 py-4 font-semibold text-dark_main transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D38] dark:border-white dark:text-white dark:hover:bg-[#636363] lg:w-max lg:py-3"
                  v-if="history.status === 7"
                  @click="formatHistoryData(history, 'duplicate')"
                >
                  Duplicate Ride
                </button>
              </div>
            </div>
            <ServiceDataAccordion
              v-if="
                [4, 5].includes(history.status) && history.type_of_service !== 'Inspiritaly Tour'
              "
              :ride="history"
              :ride-index="index"
              :isOpen="activeAccordionIndex === index"
              @toggle="toggleAccordion(index)"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
  <h1 v-if="!isLoggedIn" class="title mr-[15px] mt-[5rem]">Please login to view ride history</h1>
  <router-link v-if="!isLoggedIn" to="/account/signin" class="button mt-[15px] w-fit"
    >Sign in
  </router-link>
  <swipe-modal
    class="md:hidden"
    v-model="isModal"
    contents-height="60vh"
    border-top-radius="16px"
    background-color="ffffff"
    tip-color="#CDCFD0"
    @close="closeModal()"
  >
    <history-popup-content
      :consulting="userObj.consulting"
      :reqs="userObj.reqs"
      :distance="userObj.distance"
      :transport="userObj.transport"
    />
  </swipe-modal>
</template>

<script setup lang="ts">
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { computed, inject, onMounted, ref } from 'vue'
import type { AxiosInstance } from 'axios'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useMobile } from '@/compose/ismobile'
import { useOrderStore } from '@/stores/ride/order'
import { useRidesHistoryStore } from '@/stores/ride/history'
import RidesFilter from '@/components/features/ride/RidesFilter.vue'
import ServiceDataAccordion from '@/components/features/service/ServiceDataAccordion.vue'
import HistoryPopupContent from '@/components/features/history/HistoryPopupContent.vue'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import { useGoBackStore } from '@/stores/ui/goBack'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import CreditCardIcon from '@/components/ui/icons/CreditCardIcon.vue'
import { useFetcher } from '@/compose/axios'
import type {
  FakeRideItem,
  HistoryActionType,
  NullableIndex,
  RideHistoryItem,
  TransactionResponse,
  UserPopupData
} from '@/types/pages/account/RideHistory'
import type { AllowedPages, OrderData } from '@/types/stores/ride/order'

const axios = inject('axios') as AxiosInstance | undefined
const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

const trustyStore = useTrustyStore()
const { isMobile } = useMobile()

const fakeData = ref<FakeRideItem[]>([
  {
    id: 'XXXX1',
    typeOfService: 'XXXX1',
    date: 'XXXX1',
    status: 'XXXX1',
    pickupLocation: 'XXXX1',
    dropOffLocation: 'XXXX1',
    duration: 'XXXX1'
  },
  {
    id: 'XXXX2',
    typeOfService: 'XXXX2',
    date: 'XXXX2',
    status: 'XXXX2',
    pickupLocation: 'XXXX2',
    dropOffLocation: 'XXXX2',
    duration: 'XXXX2'
  },
  {
    id: 'XXXX3',
    typeOfService: 'XXXX3',
    date: 'XXXX3',
    status: 'XXXX3',
    pickupLocation: 'XXXX3',
    dropOffLocation: 'XXXX3',
    duration: 'XXXX3'
  }
])

const userStore = useUserStore()
const ridesHistoryStore = useRidesHistoryStore()
const orderStore = useOrderStore()
const { orderData } = storeToRefs(orderStore)

const {
  rides,
  isRidesFetched,
  isRequestSuccessful,
  isRequestPending,
  isRequestRefused,
  isRidesFilteredEmpty,
  isNoRides,
  requestSent
} = storeToRefs(ridesHistoryStore)

const activeAccordionIndex = ref<NullableIndex>(null)

const toggleAccordion = (index: number): void => {
  activeAccordionIndex.value = activeAccordionIndex.value === index ? null : index
}

const enableVehicleStep = (): AllowedPages => ({
  ...orderData.value.allowedPages,
  vehicle: 1
})

const mapHistoryToOrderData = (history: RideHistoryItem): Partial<OrderData> => {
  const normalizedHours = toNumberOrNull(history.hours)
  const normalizedDistance = toNumberOrNull(history.distance)
  const normalizedTotal = toNumberOrNull(history.total)

  return {
    pickup: history.pickup ?? null,
    dropoff: history.dropoff ?? null,
    hours: normalizedHours,
    distance: normalizedDistance,
    email: history.email ?? null,
    type_of_service: normalizeServiceType(history.type_of_service),
    reqs: history.reqs ?? null,
    first_name: history.first_name ?? null,
    last_name: history.last_name ?? null,
    phone: history.phone ?? null,
    total: normalizedTotal,
    date_start: history.date_start ?? null,
    ride_history: true
  }
}

const buttonText = computed<string>(() => {
  if (isRequestSuccessful.value) return 'Succeed'
  if (isRidesFilteredEmpty.value) return 'No rides found for the given filter.'
  if (isRequestPending.value) return 'Loading rides...'
  if (isRequestRefused.value)
    return 'Failed to load rides. Server might be temporarily unavailable. Please try again later.'
  if (isNoRides.value && requestSent.value) return 'Rides histories empty'
  return 'Pending'
})

const { isLoggedIn, user } = storeToRefs(userStore)

const isAgency = computed<boolean>(() => {
  return user.value?.type === 'agency' || user.value?.type === 'request for Agency'
})

const goBackStore = useGoBackStore()
const router = useRouter()

const setGoBackAndNavigate = (): void => {
  goBackStore.setGoBack(true)
  localStorage.setItem('lastGoBackFrom', '/account/ridehistory')
  router.push({ name: 'home' })
}

type ServiceMap = Record<string, string>
const serviceToKeyMap: ServiceMap = {
  'Tours / Roadshows': 'Tours / Roadshows',
  'One Way Transfer': 'One Way Transfer',
  'Hourly as directed': 'Hourly as directed'
}

const normalizeServiceType = (type: string): string => {
  return serviceToKeyMap[type] ?? type
}

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const formatHistoryData = (history: RideHistoryItem, type: HistoryActionType): void => {
  setGoBackAndNavigate()
  orderStore.$reset()

  const normalizedService = normalizeServiceType(history.type_of_service)
  const normalizedHours = toNumberOrNull(history.hours)
  const normalizedPickup = history.pickup ?? null
  const normalizedDropoff = history.dropoff ?? null

  const normalizedOrderData = mapHistoryToOrderData(history)

  orderStore.update(normalizedOrderData)
  userStore.updateAgency({
    pickup: normalizedPickup ?? '',
    dropoff: normalizedDropoff ?? '',
    type_of_service: normalizedService,
    ride_history: true
  })

  if (type === 'return') {
    returnRide(history)
  } else {
    orderStore.update({
      date_start: null,
      allowedPages: enableVehicleStep()
    })
    orderStore.changeTypeOrder('DUPLICATE')
    orderStore.duplicatedOrder = true
  }
}

const returnRide = (history: RideHistoryItem): void => {
  const normalizedPickup = history.pickup ?? null
  const normalizedDropoff = history.dropoff ?? null

  orderStore.update({
    dropoff: normalizedPickup,
    pickup: normalizedDropoff
  })

  userStore.updateAgency({
    dropoff: normalizedPickup ?? '',
    pickup: normalizedDropoff ?? ''
  })
}

const continueBooking = (history: RideHistoryItem): void => {
  orderStore.$reset()
  const { id, order_id, created_at, status, ...rest } = history

  orderStore.update({
    ...mapHistoryToOrderData(history),
    allowedPages: enableVehicleStep()
  })
  orderStore.updateOrderId(order_id ?? null)
  if (order_id) {
    router.push({ name: 'vehicle' })
  }
}

const continueToPayment = async (history: RideHistoryItem): Promise<void> => {
  if (!history.order_id || !axios) {
    return
  }

  try {
    const transactionResponse = await axios.post<TransactionResponse>(
      `transaction/fetch/${history.order_id}`
    )
    const transactionId = transactionResponse.data?.data?.transaction_id
    if (transactionId) {
      router.push({ name: 'payment', params: { transaction_id: transactionId } })
    }
  } catch (error) {
    console.error('Failed to fetch transaction:', error)
  }
}

const closeModal = (): void => {
  isModal.value = false
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

const newRide = (): void => {
  userStore.clearAgencyData()
  trustyStore.clearInput('pickup')
  trustyStore.clearInput('dropoff')
  orderStore.$reset()
  orderStore.changeTypeOrder('NEW')
  router.push({ name: 'home' })
}

const retryLoadRides = (): void => {
  ridesHistoryStore.isRequestMessage = true
  ridesHistoryStore.loadRides()
}

const logOut = (): void => {
  ridesHistoryStore.$reset()
  userStore.preventLogout()
  void axiosInstance.get('/spy/logout')
  setTimeout(() => router.push('/account/signin'), 100)
}

const isModal = ref<boolean>(false)
const userObj = ref<UserPopupData>({
  consulting: '',
  reqs: '',
  distance: '',
  transport: ''
})

// onBeforeMount(() => {
//   ridesHistoryStore.loadRides()
// })
onMounted(() => userStore.clearAgencyData())
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}

.tooltip {
  position: relative;
  display: inline-block;
  width: 100%;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 100%;
  max-width: 300px;
  background-color: #e9eaeb;
  color: black;
  text-align: center;
  border-radius: 4px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .tooltip .tooltiptext {
  background-color: #272729;
  color: #ffffff;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
