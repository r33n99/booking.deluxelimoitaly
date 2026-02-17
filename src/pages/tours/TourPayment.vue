<template>
  <div class="mt-8 flex w-full flex-col items-center justify-between py-6 md:mt-[60px]">
    <div class="flex w-full flex-wrap">
      <h1 class="text-[40px] font-bold leading-[90%] md:text-[80px]">Payment</h1>
      <span class="ml-auto text-[40px] font-bold leading-[110%] text-main md:text-[80px]">
        € {{ customTourLocal?.total_price }}
      </span>
    </div>
    <div
      class="mt-8 flex w-full flex-col rounded-[18px] bg-white p-8 dark:bg-[#333639] md:mt-[60px] lg:p-12"
    >
      <!-- Payment Header -->

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
        <preloader-anim-icon class="size-12" theme="white" />
        <p class="text-16 text-grey-light-7 mt-4">Preparing your payment...</p>
      </div>

      <!-- Payment Content -->
      <div v-else class="flex w-full flex-col gap-8">
        <!-- Tour Summary -->
        <div class="flex flex-col rounded-xl p-6">
          <div class="flex w-full flex-col gap-8 xl:flex-row">
            <!-- Tour Media -->
            <div
              class="relative h-[10.375rem] overflow-hidden rounded-xl md:h-[16.313rem] md:min-w-[17.813rem] xl:h-auto xl:w-[38.7%]"
            >
              <tour-video-player
                v-if="paymentMedia?.video"
                :src="paymentMedia.video"
                loader
                only-view
                class="absolute inset-0 h-full w-full object-cover object-center"
                @loaded="imageLoadedMap[paymentMedia.video] = true"
                @loading="imageLoadedMap[paymentMedia.video] = false"
              />

              <div
                v-if="
                  paymentMedia &&
                  !paymentMedia.video &&
                  paymentMedia.image &&
                  !imageLoadedMap[paymentMedia.image]
                "
                class="absolute inset-0"
              >
                <tour-skeleton class="h-full w-full" />
              </div>

              <div
                v-else-if="!paymentMedia || (!paymentMedia.video && !paymentMedia.image)"
                class="absolute inset-0"
              >
                <tour-skeleton class="h-full w-full" />
              </div>

              <img
                v-if="paymentMedia?.image"
                :src="paymentMedia.image"
                :alt="`${tourData?.name} - tour media`"
                class="absolute inset-0 h-full w-full object-cover object-center"
                @load="imageLoadedMap[paymentMedia.image] = true"
                @error="imageLoadedMap[paymentMedia.image] = true"
              />
            </div>

            <!-- Tour Details -->
            <div class="flex w-full flex-col">
              <h2 class="pb-[1.375rem] text-[24px] leading-[110%]" data-testid="payment-tour-name">
                {{ tourData?.name }}
              </h2>
              <div
                class="flex flex-col gap-6 text-[1.125rem] font-normal md:flex-row md:gap-[3.75rem]"
              >
                <!-- Column 1 -->
                <ul>
                  <li class="mb-1 text-black/40 dark:text-white/40">Area:</li>
                  <li class="pb-6 md:pb-8">{{ tourData?.area?.name }}</li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Date:</li>
                  <li class="pb-6 md:pb-8">
                    {{ formatDate(customTourLocal?.date) }}
                  </li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Number of participants:</li>
                  <li>
                    {{ customTourLocal?.participants }}
                    {{ customTourLocal?.participants === 1 ? 'Person' : 'People' }}
                  </li>
                </ul>

                <!-- Column 2 -->
                <ul>
                  <li class="mb-1 text-black/40 dark:text-white/40">Total duration:</li>
                  <li class="pb-6 md:pb-8">
                    {{ formatDuration(customTourLocal?.total_duration) }}
                  </li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Total price:</li>
                  <li class="pb-6 md:pb-8" data-testid="payment-total-price">
                    € {{ customTourLocal?.total_price }}
                  </li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Price per person:</li>
                  <li>€ {{ calculatePricePerPerson() }} P/P</li>
                </ul>

                <!-- Column 3 -->
                <ul>
                  <li class="mb-1 text-black/40 dark:text-white/40">List of services:</li>
                  <li v-for="service in customTourLocal?.addons" :key="service.id">
                    {{ service.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr class="border-under-line my-8 rounded-full border-[#F2F2F2] dark:border-[#3D4043]" />

          <!-- Accordion for service details -->
          <payment-accordion v-if="isStripeIframeLoaded" :title="'Show details'">
            <!-- Basic Tour -->
            <div
              v-if="basicAddons.length"
              class="mt-6 flex w-full flex-col gap-4 rounded-[24px] bg-[#F2F2F2] p-[18px] dark:bg-background"
            >
              <div class="flex flex-col gap-4 xl:flex-row xl:justify-between">
                <div class="flex flex-col gap-[0.625rem]">
                  <h3 class="text-[1.25rem] font-normal leading-[1.875rem]">Basic tour</h3>
                </div>
                <button
                  class="!leading-22 w-full cursor-auto items-center self-center rounded-[99px] bg-main !p-5 text-[24px] font-medium text-black xl:max-w-[168px]"
                >
                  {{ priceService.formatPrice(calculateBasicTourPrice()) }} EUR
                </button>
              </div>
            </div>
            <!-- Non-basic Addons -->
            <div
              v-for="addon in nonBasicAddons"
              :key="addon.id"
              class="mt-6 flex w-full flex-col gap-4 rounded-[24px] bg-[#F2F2F2] p-[18px] dark:bg-background"
            >
              <div class="flex flex-col gap-4 xl:flex-row xl:justify-between">
                <div class="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div v-if="getAddonMediaUrl(addon)" class="flex-shrink-0">
                    <img
                      :src="getAddonMediaUrl(addon)"
                      alt="Service image"
                      class="h-[7.563rem] w-[7.563rem] overflow-hidden rounded-[1rem] object-cover xl:min-w-[7.563rem]"
                    />
                  </div>
                  <div class="flex flex-col gap-[0.625rem]">
                    <h3 class="text-[1.25rem] font-normal leading-[1.875rem]">{{ addon.name }}</h3>
                    <p
                      class="text-12 font-light leading-[140%] text-[#8D8D8D]"
                      v-safe-html="addon.description"
                    ></p>
                  </div>
                </div>
                <button
                  class="!leading-22 w-full cursor-auto items-center self-center rounded-[99px] bg-main !p-5 text-[24px] font-medium text-black xl:max-w-[168px]"
                >
                  {{ getPriceWithSign(addon) }}
                </button>
              </div>
            </div>
          </payment-accordion>
        </div>
      </div>

      <!-- Payment Form -->
      <div>
        <form
          id="payment-form"
          class="payment_form form border-0 bg-[#151515] p-[1.125rem]"
          @submit.prevent="handleSubmit"
        >
          <input type="hidden" name="stripeToken" id="stripe-token-id" />

          <!-- Guest User Form -->
          <div
            v-if="!isAuthenticated && isStripeIframeLoaded"
            class="mb-8 flex w-full flex-col gap-4 xl:flex-row"
          >
            <payment-field
              class="h-[4rem] w-full bg-[#F3F6F3] dark:bg-background"
              v-model="formData.firstName"
              placeholder="First name"
              :error="validationErrors.firstName"
              @update:modelValue="clearValidationError('firstName')"
            />
            <payment-field
              class="h-[4rem] w-full bg-[#F3F6F3] dark:bg-background"
              v-model="formData.lastName"
              placeholder="Last name"
              :error="validationErrors.lastName"
              @update:modelValue="clearValidationError('lastName')"
            />
            <payment-field
              class="h-[4rem] w-full bg-[#F3F6F3] dark:bg-background"
              v-model="formData.email"
              placeholder="example@gmail.com"
              :error="validationErrors.email"
              @update:modelValue="clearValidationError('email')"
            />
            <payment-field
              class="!*:h-[4rem] w-full bg-[#F3F6F3] dark:bg-background"
              type="tel"
              v-model="formData.phone"
              @country-changed="handleCountryChanged"
              placeholder="44 44 44 44"
              :error="validationErrors.phone"
              @update:modelValue="clearValidationError('phone')"
            />
          </div>

          <!-- Create Account Toggle for Guest Users -->
          <!--          <label-->
          <!--            v-if="!isAuthenticated"-->
          <!--            class="relative my-[28px] flex w-full cursor-pointer items-start justify-center gap-4 xl:items-center"-->
          <!--          >-->
          <!--            <input-->
          <!--              v-model="formData.createAccount"-->
          <!--              type="checkbox"-->
          <!--              class="bg-[#CCCCCC peer sr-only"-->
          <!--            />-->
          <!--            <div-->
          <!--              class="peer-checked:bg-main peer-checked:bg-coral peer h-6 w-[39px] min-w-[3.5rem] rounded-full bg-[#CCCCCC] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-[160%] peer-checked:after:border-white peer-checked:after:bg-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 md:h-[31px] md:w-[56px] md:after:left-[4px] md:after:top-[4px] md:after:h-[24px] md:after:w-[24px] md:peer-checked:after:translate-x-[100%] xl:after:top-[13px]"-->
          <!--            ></div>-->
          <!--            <span class="account_toggler_text text-grey-light-6">-->
          <!--              Create Personal Account After Payment, it will facilitate you a lot if you book other-->
          <!--              services, and it requires no further data entry, only 1 click! Please-->
          <!--              <a href="/auth/sign-in" class="text-white underline">Login</a> if you already have an-->
          <!--              account-->
          <!--            </span>-->
          <!--          </label>-->

          <div class="payment-element-wrapper relative w-full">
            <!-- Stripe Payment Element -->
            <div id="payment-element" class="!border-0 !bg-transparent !p-0">
              <!-- Stripe.js injects the Payment Element here -->
            </div>

            <!-- Loading State -->
            <div
              class="absolute left-0 top-0 z-10 flex h-[calc(100%+20px)] w-full flex-col items-center justify-center bg-white py-8 duration-300 dark:bg-[#333639]"
              :class="{ 'invisible opacity-0': isPaymentElementReady }"
            >
              <preloader-anim-icon class="hidden size-12 dark:block" theme="white" />
              <preloader-anim-icon class="size-12 dark:hidden" theme="black" />
              <p class="text-16 text-grey-light-7 mt-4">Preparing your payment module...</p>
            </div>
          </div>

          <!-- Payment Error Message -->
          <div v-if="paymentError && isStripeIframeLoaded" class="mt-4 text-sm text-red-500">
            {{ paymentError }}
          </div>

          <div
            v-if="isStripeIframeLoaded"
            class="next_step_button_wrapper mt-[40px] flex flex-col items-center justify-center gap-6 xl:h-[4rem] xl:flex-row"
          >
            <!-- Notes Textarea -->
            <textarea
              ref="textareaRef"
              maxlength="230"
              class="input ym-record-keys bg-grey-light-1 border-1 mb-0 h-[4rem] w-full resize-none overflow-hidden rounded-[1rem] border-black/50 p-5 text-[0.875rem] dark:!border-white/30 md:text-[1.125rem]"
              rows="1"
              v-model="formData.notes"
              placeholder="Here you can leave any notes…"
            ></textarea>

            <!-- Submit Button -->
            <button
              class="button w-full items-center py-5 xl:w-1/4"
              id="submit"
              type="submit"
              data-testid="paymentPage-submit"
              :disabled="isProcessingPayment"
            >
              <div v-if="isProcessingPayment" class="flex items-center justify-center">
                <preloader-anim-icon class="mr-2 size-5" theme="black" />
                <span>Processing...</span>
              </div>
              <span v-else>Pay now</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Payment Timer -->
      <div
        v-if="isPaymentElementReady && isStripeIframeLoaded"
        class="text-grey-light-6 inline-flex flex-wrap items-center justify-center gap-1 pt-8 text-[0.75rem] xl:text-[1.125rem]"
      >
        <span>This offer will expire within the next </span>
        <payment-timer
          class="text-black dark:text-white"
          :minutes="4"
          :seconds="30"
          @time-up="handleTimerExpired"
        />
        <span>after which the price might be different</span>
      </div>
    </div>
  </div>

  <!-- Timer Expired Modal -->
  <payment-modal
    v-model="showTimerExpiredModal"
    :show-close-button="false"
    :show-default-footer="true"
    :close-on-backdrop="true"
    action-button-text="Return to Home"
    @confirm="redirectToHomePage"
    @close="redirectToHomePage"
  >
    <template #header>
      <h2 class="text-center text-[40px] font-bold text-black dark:text-white">
        Payment Time Expired
      </h2>
    </template>
    <div class="px-6 py-4 text-center">
      <p class="text-18 mb-4 text-black dark:text-white">
        Your payment session has expired. Please restart the booking process to ensure the latest
        pricing and availability.
      </p>
    </div>
  </payment-modal>

  <!-- Unexpected Error Modal -->
  <payment-modal
    v-model="showUnexpectedErrorModal"
    :show-close-button="false"
    :show-default-footer="true"
    :close-on-backdrop="true"
    action-button-text="Back to Tour"
    @confirm="redirectToTourPage"
    @close="redirectToTourPage"
  >
    <template #header>
      <h2 class="text-center text-[40px] font-bold text-white">Unexpected error</h2>
    </template>
    <div class="px-6 py-4 text-center">
      <p class="text-18 mb-4 text-white">
        Sorry for this inconvenience, please return to the Tour page and fill all the data again
      </p>
    </div>
  </payment-modal>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import PaymentField from '@/components/ui/tours/payment/PaymentField.vue'
import PaymentAccordion from '@/components/ui/tours/payment/PaymentAccordion.vue'
import PaymentTimer from '@/components/ui/tours/payment/PaymentTimer.vue'
import PaymentModal from '@/components/ui/tours/payment/PaymentModal.vue'
import { useContactsStore, useUserStore } from '@/stores/user'
import { useToursStore } from '@/stores/tours'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { PaymentService } from '@/utils/paymentService'
import { formatCreditCardError, validatePaymentForm } from '@/utils/paymentValidation'
import { PriceCalculationService as priceService } from '@/utils/priceCalculationService'
import PreloaderAnimIcon from '@/components/ui/tours/payment/PreloaderAnimIcon.vue'
import { useMainStore, useOrderStore } from '@/stores'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import { useMedia } from '@/compose/useMedia'

const router = useRouter()
const toursStore = useToursStore()
const userStore = useUserStore()
const mainStore = useMainStore()
const orderStore = useOrderStore()
const contactsStore = useContactsStore()
const { getMediaUrl, getVideoPreviewUrl, isImageItem, isVideoItem, IMAGE_SIZES } = useMedia()

const { mode } = storeToRefs(mainStore)
const { customTour } = storeToRefs(toursStore)
const { user } = storeToRefs(userStore)
const { orderData } = storeToRefs(orderStore)
const { contactsData } = storeToRefs(contactsStore)
const isAuthenticated = ref(false)

const isLoading = ref(true)
const isPaymentElementReady = ref(false)
const isStripeIframeLoaded = ref(false)
const isProcessingPayment = ref(false)
const tourData = ref(null)
const stripe = ref(null)
const elements = ref(null)
const paymentIntentSecret = ref(null)
const orderId = ref(null)
const paymentCode = ref(null)
const paymentError = ref('')
const showTimerExpiredModal = ref(false)
const showUnexpectedErrorModal = ref(false)
const textareaRef = ref(null)
const imageLoadedMap = ref({})
const lastContact = computed(() => contactsData.value[contactsData.value.length - 1])
const formData = reactive({
  firstName: orderData.value?.first_name || '',
  lastName: orderData.value?.last_name || '',
  email: orderData.value?.email || '',
  phone: '',
  dialCode: '',
  iso2: '',
  country: '',
  notes: '',
  createAccount: false
})

watch(
  lastContact,
  (newVal) => {
    if (newVal) {
      formData.firstName = newVal.first_name
      formData.lastName = newVal.last_name
      formData.email = newVal.email
      formData.phone = newVal.phone
    }
  },
  { deep: true, immediate: true }
)

const validationErrors = reactive({})

const paymentService = new PaymentService(import.meta.env.VITE_APP_API_INSP)

const customTourLocal = ref(customTour.value)

if (!customTour.value) {
  try {
    const stored = localStorage.getItem('customTour')
    customTourLocal.value = stored ? JSON.parse(stored) : null
  } catch {
    customTourLocal.value = null
  }
} else {
  customTourLocal.value = customTour.value
}

watch(customTour, (newVal) => {
  if (newVal) {
    customTourLocal.value = newVal
  }
})

const isMobile = computed(() => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false))

const VIDEO_FORMATS = new Set(['mp4', 'webm', 'ogg'])
const IMAGE_FORMATS = new Set(['webp', 'jpg', 'jpeg', 'png'])

const getExtension = (url = '') => url.split('?')[0].split('.').pop()?.toLowerCase() || ''

const isVideo = (item) => {
  if (!item) return false
  const mime = item.mime?.toLowerCase?.() || ''
  if (mime.startsWith('video/')) return true
  const format = item.format?.toLowerCase?.() || ''
  if (VIDEO_FORMATS.has(format)) return true
  return VIDEO_FORMATS.has(getExtension(item.url))
}

const isImage = (item) => {
  if (!item) return false
  if (isVideo(item)) return false
  const mime = item.mime?.toLowerCase?.() || ''
  if (mime.startsWith('image/')) return true
  const format = item.format?.toLowerCase?.() || ''
  if (IMAGE_FORMATS.has(format)) return true
  return IMAGE_FORMATS.has(getExtension(item.url))
}

// Проверка нового формата MediaItem
const isNewMediaItem = (item) => {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.type === 'string' &&
    typeof item.filename === 'string' &&
    typeof item.extension === 'string'
  )
}

// Проверка старого формата Media
const isOldMediaItem = (item) => {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.url === 'string' &&
    (typeof item.format === 'string' || typeof item.mime === 'string')
  )
}

const extractMediaFromGroup = (group) => {
  if (!group) return null

  // Если это новый формат MediaItem
  if (isNewMediaItem(group)) {
    const item = group
    if (isImageItem(item)) {
      const size = isMobile.value ? IMAGE_SIZES.MEDIUM : IMAGE_SIZES.LARGE
      return {
        key: `image-${item.id}`,
        video: '',
        image: getMediaUrl(item, size)
      }
    } else if (item.type === 'video') {
      return {
        key: `video-${item.id}`,
        video: getMediaUrl(item, IMAGE_SIZES.ORIGINAL),
        image: item.has_preview ? getMediaUrl(item, IMAGE_SIZES.MEDIUM) : ''
      }
    }
    return null
  }

  if (Array.isArray(group)) {
    const newFormatItem = group.find(isNewMediaItem)
    if (newFormatItem) {
      return extractMediaFromGroup(newFormatItem)
    }

    const oldFormatItems = group.filter(isOldMediaItem)
    if (!oldFormatItems.length) return null

    const videoItems = oldFormatItems.filter(isVideo)
    const imageItems = oldFormatItems.filter(isImage)

    const video = videoItems.length
      ? videoItems.find((item) => item.width === '768')?.url || videoItems[0]?.url || ''
      : ''

    const image = imageItems.length
      ? findBestImageOldFormat(imageItems)
      : oldFormatItems[0]?.url || ''

    if (!video && !image) return null

    return {
      key: video || image || `media-${Date.now()}`,
      video,
      image
    }
  }

  // Если это объект со старым форматом
  if (isOldMediaItem(group)) {
    const video = isVideo(group) ? group.url : ''
    const image = isImage(group) ? group.url : ''

    if (!video && !image) return null

    return {
      key: video || image || `media-${Date.now()}`,
      video,
      image
    }
  }

  return null
}

// Функция для поиска лучшего изображения в старом формате
const findBestImageOldFormat = (items) => {
  if (!items.length) return ''
  const sizes = isMobile.value ? ['320', '768'] : ['768', '1024', '320']
  const formats = ['webp', 'jpg']
  for (const size of sizes) {
    for (const format of formats) {
      const match = items.find((item) => {
        const mime = item.mime?.toLowerCase?.() || ''
        const currentFormat = item.format?.toLowerCase?.() || ''
        return item.width === size && (currentFormat === format || mime.includes(format))
      })
      if (match?.url) return match.url
    }
  }
  const fallback = items.find((item) => item.url)
  return fallback?.url || ''
}

const paymentMedia = computed(() => {
  const media = tourData.value?.media
  if (!media) {
    return null
  }

  // Если media - это массив MediaItem объектов (новый формат)
  if (Array.isArray(media)) {
    // Приоритет: сначала ищем изображение, потом видео
    let firstImage = null
    let firstVideo = null

    for (const item of media) {
      // Если это новый формат MediaItem
      if (isNewMediaItem(item)) {
        if (item.type === 'image' && !firstImage) {
          const size = isMobile.value ? IMAGE_SIZES.MEDIUM : IMAGE_SIZES.LARGE
          const imageUrl = getMediaUrl(item, size)
          firstImage = {
            key: `image-${item.id}`,
            video: '',
            image: imageUrl
          }
        } else if (item.type === 'video' && !firstVideo) {
          const videoUrl = getMediaUrl(item, IMAGE_SIZES.ORIGINAL)
          const previewUrl = item.has_preview ? getVideoPreviewUrl(item, IMAGE_SIZES.MEDIUM) : ''
          firstVideo = {
            key: `video-${item.id}`,
            video: videoUrl,
            image: previewUrl
          }
        }
      } else {
        // Старый формат - обрабатываем через extractMediaFromGroup
        const extracted = extractMediaFromGroup(item)
        if (extracted) {
          if (extracted.image && !firstImage) {
            firstImage = extracted
          } else if (extracted.video && !firstVideo) {
            firstVideo = extracted
          }
        }
      }
    }

    // Возвращаем изображение, если есть, иначе видео
    return firstImage || firstVideo
  }

  // Если media - это один элемент (новый или старый формат)
  return extractMediaFromGroup(media)
})
const handleCountryChanged = (event) => {
  formData.country = event.name
  formData.dialCode = event.dialCode
  formData.iso2 = event.iso2
}

const clearValidationError = (field) => {
  if (validationErrors[field]) {
    validationErrors[field] = undefined
  }
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'
}

const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0
    ? `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min` : ''}`
    : `${mins} min`
}

const calculatePricePerPerson = () => {
  if (
    !customTourLocal.value ||
    !customTourLocal.value.participants ||
    customTourLocal.value.participants === 0
  ) {
    return 0
  }

  return Math.round(customTourLocal.value.total_price / customTourLocal.value.participants)
}

const fetchTourData = async () => {
  try {
    tourData.value = await toursStore.getTourById(customTourLocal.value?.tour_id || 0)
  } catch (error) {
    console.error('Error fetching tour data:', error)
  }
}

const createOrder = async () => {
  try {
    const response = await paymentService.createOrder(customTourLocal.value)
    return response
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

const initStripe = async (paymentResponse) => {
  try {
    stripe.value = await loadStripe(import.meta.env.VITE_APP_STRIPE_KEY_INSP)
    const appearanceModes = {
      light: {
        rules: {
          '.Input': {
            color: '#2B2D32',
            border: '1px solid rgba(115,118,130,0.98)',
            borderRadius: '53px',
            padding: '22px 20px',
            backgroundColor: '#E8EDE880'
          },
          '.Input::placeholder': {
            color: '#878787'
          },
          '.Input:hover': {
            border: 'inputHover.value'
          },
          '.Input:active': {
            border: 'inputActive.value'
          },
          '.Input:focus': {
            boxShadow: 'none',
            borderColor: 'main'
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
        }
      },
      dark: {
        rules: {
          '.Input': {
            color: '#FFFFFF99',
            border: '1px solid #5B5C60',
            borderRadius: '1rem',
            padding: '22px 20px',
            backgroundColor: '#2B2D32'
          },
          '.Input::placeholder': {
            color: '#FFFFFF4A'
          },
          '.Input:hover': {
            border: 'inputHover.value'
          },
          '.Input:active': {
            border: 'inputActive.value'
          },
          '.Input:focus': {
            boxShadow: 'none',
            borderColor: 'none'
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
        }
      }
    }

    if (!stripe.value) {
      throw new Error('Failed to load Stripe')
    }

    // Save payment details for later use
    paymentIntentSecret.value = paymentResponse.data.payment.client_secret
    orderId.value = paymentResponse.data.order.id
    paymentCode.value = paymentResponse.data.payment.id

    // Configure Stripe elements
    elements.value = stripe.value.elements({
      clientSecret: paymentIntentSecret.value,
      appearance: appearanceModes['dark']
    })

    // Create and mount payment element
    const paymentElement = elements.value.create('payment')

    // Wait for the payment element container to be ready
    await new Promise((resolve) => {
      const checkElement = () => {
        const element = document.getElementById('payment-element')
        if (element) {
          resolve(true)
        } else {
          setTimeout(checkElement, 100)
        }
      }
      checkElement()
    })

    paymentElement.mount('#payment-element')

    // Handle payment element changes
    paymentElement.on('change', (event) => {
      const submitButton = document.querySelector('#submit')
      if (submitButton) {
        submitButton.disabled = !event.complete
      }
    })

    paymentElement.on('ready', () => {
      isPaymentElementReady.value = true
      // Проверяем загрузку iframe Stripe
      checkStripeIframeLoaded()

      // Fallback: если iframe не загрузится за 3 секунды, показываем компоненты
      setTimeout(() => {
        if (!isStripeIframeLoaded.value) {
          isStripeIframeLoaded.value = true
        }
      }, 3000)
    })

    watch(mode, () => {
      if (elements.value) {
        elements.value.update({ appearance: appearanceModes[mode.value] })
      }
    })
  } catch (error) {
    console.error('Error initializing Stripe:', error)
    paymentError.value = 'Failed to initialize payment system. Please try again.'
  }
}

const handleSubmit = async (event) => {
  event.preventDefault()

  if (isProcessingPayment.value) {
    return
  }

  if (!isAuthenticated.value) {
    const { isValid, errors } = await validatePaymentForm(formData)

    if (!isValid) {
      Object.assign(validationErrors, errors)
      return
    }
  }

  try {
    isProcessingPayment.value = true
    paymentError.value = ''

    if (!stripe.value || !elements.value) {
      paymentError.value =
        'Payment system is not initialized. Please refresh the page and try again.'
      return
    }

    const queryParams = new URLSearchParams({
      order_id: orderId.value || '',
      payment_code: paymentCode.value || '',
      notes: formData.notes || ''
    })

    if (!isAuthenticated.value) {
      queryParams.append('firstName', formData.firstName)
      queryParams.append('lastName', formData.lastName)
      queryParams.append('email', formData.email)
      queryParams.append('phone', formData.phone)
      queryParams.append('dialCode', formData.dialCode)
      queryParams.append('iso2', formData.iso2)
      queryParams.append('country', formData.country)
      queryParams.append('createAccount', formData.createAccount.toString())
      queryParams.append('pickup', tourData.value?.name)
      queryParams.append('duration', customTourLocal.value?.total_duration)
    }

    const { error, paymentIntent } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/tour/payment/success?${queryParams.toString()}`
      },
      redirect: 'if_required'
    })

    if (error) {
      paymentError.value = formatCreditCardError(error)
      isProcessingPayment.value = false
      return
    }

    if (paymentIntent) {
      switch (paymentIntent.status) {
        case 'succeeded':
          router.push(`/tour/payment/success?${queryParams.toString()}`)
          break
        case 'processing':
          router.push(`/tour/payment/pending?${queryParams.toString()}`)
          break
        case 'requires_payment_method':
          paymentError.value = 'Your payment was not successful, please try again.'
          break
        default:
          paymentError.value = 'Something went wrong with your payment. Please try again.'
          break
      }
    }
  } catch (err) {
    console.error('Payment error:', err)
    paymentError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isProcessingPayment.value = false
  }
}

const checkStripeIframeLoaded = () => {
  let attempts = 0
  const maxAttempts = 50 // Максимум 5 секунд (50 * 100ms)

  const checkIframe = () => {
    attempts++
    const paymentElement = document.getElementById('payment-element')

    if (!paymentElement) {
      if (attempts < maxAttempts) {
        setTimeout(checkIframe, 100)
      } else {
        // Если элемент не найден после всех попыток, считаем что загружено
        isStripeIframeLoaded.value = true
      }
      return
    }

    // Ищем все iframe внутри payment-element (Stripe может создать несколько)
    const iframes = paymentElement.querySelectorAll('iframe')

    if (iframes.length > 0) {
      let loadedCount = 0

      iframes.forEach((iframe) => {
        // Проверяем, загружен ли iframe
        if (iframe.complete) {
          // Пытаемся проверить readyState
          try {
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
              loadedCount++
            } else {
              // Если не можем получить доступ из-за CORS, считаем загруженным
              loadedCount++
            }
          } catch (e) {
            // Cross-origin ограничения - если можем получить доступ, значит iframe загружен
            loadedCount++
          }
        } else {
          // Слушаем событие load на iframe
          iframe.onload = () => {
            loadedCount++
            if (loadedCount === iframes.length) {
              isStripeIframeLoaded.value = true
            }
          }
        }
      })

      // Если все iframe загружены
      if (loadedCount === iframes.length) {
        isStripeIframeLoaded.value = true
        return
      }

      // Если не все загружены, проверяем снова через некоторое время
      if (attempts < maxAttempts) {
        setTimeout(() => {
          // Проверяем еще раз, возможно iframe загрузился
          if (Array.from(iframes).every((iframe) => iframe.complete)) {
            isStripeIframeLoaded.value = true
          } else {
            checkIframe()
          }
        }, 200)
      } else {
        // Если прошло много времени, считаем что загружено
        isStripeIframeLoaded.value = true
      }
    } else {
      // Если iframe еще не создан, проверяем снова
      if (attempts < maxAttempts) {
        setTimeout(checkIframe, 100)
      } else {
        // Если iframe не создан после всех попыток, все равно показываем компоненты
        isStripeIframeLoaded.value = true
      }
    }
  }

  checkIframe()
}

const handleTimerExpired = () => {
  showTimerExpiredModal.value = true
}

const redirectToHomePage = () => {
  router.push('/')
}

const redirectToTourPage = () => {
  router.push('/tours/' + customTourLocal.value?.tour_id)
}

onMounted(async () => {
  if (!customTourLocal.value) {
    router.push('/')
    return
  }

  try {
    isLoading.value = true

    await fetchTourData()

    // updateCustomTourData();

    const paymentResponse = await createOrder()

    // Проверяем оба возможных поля (total и total_sum) - бэкенд возвращает total
    const backendTotal =
      paymentResponse.data?.order?.total ?? paymentResponse.data?.order?.total_sum

    // Проверяем только если бэкенд вернул значение и оно отличается
    if (
      backendTotal !== undefined &&
      backendTotal !== null &&
      backendTotal !== customTourLocal.value.total_price
    ) {
      showUnexpectedErrorModal.value = true
      return
    }

    await initStripe(paymentResponse)

    if (isAuthenticated.value && user) {
      formData.firstName = user.name || ''
      formData.lastName = user.last_name || ''
      formData.email = user.email || ''
      formData.phone = user.phone || ''
    }
  } catch (error) {
    console.error('Error initializing payment page:', error)
    paymentError.value = 'Failed to initialize payment. Please try again.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (elements.value) {
    elements.value = null
  }
})

watch(
  () => formData.notes,
  () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  }
)

const basicAddons = computed(() => {
  if (!customTourLocal.value?.basic_addons_ids || !customTourLocal.value?.addons) return []
  return customTourLocal.value.addons.filter((a) =>
    customTourLocal.value.basic_addons_ids.includes(a.id)
  )
})

const nonBasicAddons = computed(() => {
  if (!customTourLocal.value?.basic_addons_ids || !customTourLocal.value?.addons) return []
  return customTourLocal.value.addons.filter(
    (a) => !customTourLocal.value.basic_addons_ids.includes(a.id)
  )
})

// Функция для получения URL медиа аддона с поддержкой нового формата
const getAddonMediaUrl = (addon) => {
  if (!addon?.media || !Array.isArray(addon.media) || addon.media.length === 0) {
    return null
  }

  // Ищем первое изображение (приоритет изображениям)
  const imageItem = addon.media.find((item) => {
    if (isNewMediaItem(item)) {
      return isImageItem(item)
    }
    return false
  })

  if (imageItem) {
    const size = isMobile.value ? IMAGE_SIZES.MEDIUM : IMAGE_SIZES.LARGE
    return getMediaUrl(imageItem, size)
  }

  // Если нет изображения, ищем видео с превью
  const videoItem = addon.media.find((item) => {
    if (isNewMediaItem(item)) {
      return isVideoItem(item) && item.has_preview
    }
    return false
  })

  if (videoItem) {
    return getVideoPreviewUrl(videoItem, IMAGE_SIZES.LARGE)
  }

  // Старый формат - просто URL
  const firstMedia = addon.media[0]
  if (typeof firstMedia === 'string') {
    return firstMedia
  }

  // Старый формат - объект с url
  if (firstMedia && typeof firstMedia === 'object' && 'url' in firstMedia) {
    return firstMedia.url
  }

  return null
}

const getAddonPrice = (addon) => {
  if (!addon.price) return 0
  const p = addon.price
  let price = 0
  if (Array.isArray(p) && typeof p[0] === 'number') {
    const idx = Math.max(0, (customTourLocal.value.participants || 1) - 1)
    price = p[idx] ?? p[0] ?? 0
  } else if (Array.isArray(p) && typeof p[0] === 'object') {
    const priceForParticipant = p.find(
      (pr) => pr.participants === customTourLocal.value.participants
    )
    price = priceForParticipant ? priceForParticipant.price : p[0]?.price || 0
  }
  return Math.ceil(price)
}

const calculateBasicTourPrice = () => {
  return basicAddons.value.reduce(
    (sum, addon) => sum + getAddonPrice(addon) * customTourLocal.value.participants,
    0
  )
}

const calculateTourPriceWithAddon = (addon) => {
  if (!tourData.value) return 0
  const addonSegment = tourData.value.segments.find((s) => s.addons?.some((a) => a.id === addon.id))
  if (!addonSegment) return calculateBasicTourPrice()
  let total = 0
  for (const segment of tourData.value.segments) {
    if (segment.id === addonSegment.id) {
      total += getAddonPrice(addon) * customTourLocal.value.participants
    } else {
      const baseAddon = basicAddons.value.find((a) =>
        segment.addons?.some((segA) => segA.id === a.id)
      )
      if (baseAddon) total += getAddonPrice(baseAddon) * customTourLocal.value.participants
    }
  }
  return total
}

const formatDifference = (difference) => {
  const sign = difference > 0 ? '+' : ''
  return `${sign}${priceService.formatPrice(difference)} EUR`
}

const getPriceWithSign = (addon) => {
  const baseTourPrice = calculateBasicTourPrice()
  const tourPriceWithThisAddon = calculateTourPriceWithAddon(addon)
  const difference = tourPriceWithThisAddon - baseTourPrice
  if (difference === 0) return `${priceService.formatPrice(tourPriceWithThisAddon)} EUR`
  return formatDifference(difference)
}
</script>

<style>
.field-input {
  height: 4rem;
}

:deep(.StripeElement) {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.29);
  border-radius: 16px;
  background-color: #313131;
  color: white;
}

:deep(.StripeElement--focus) {
  border-color: white;
}

:deep(.StripeElement--invalid) {
  border-color: #fa4141;
}

.payment-element-wrapper {
  min-height: 344px;
}

@media (min-width: 676px) {
  .payment-element-wrapper {
    min-height: 246px;
  }
}

@media (min-width: 768px) {
  .payment-element-wrapper {
    min-height: 344px;
  }
}

@media (min-width: 854px) {
  .payment-element-wrapper {
    min-height: 246px;
  }
}

ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
