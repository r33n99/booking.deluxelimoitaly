<template>
  <div class="flex w-full flex-row items-center justify-between py-6 md:mt-[60px]">
    <div class="flex w-full flex-col rounded-[18px] bg-white p-8 dark:bg-[#333639] lg:p-12">
      <div class="flex w-full flex-col items-center">
        <h1 class="text-32 md:text-48 mb-6 text-center text-black dark:text-white">
          {{ pageTitle }}
        </h1>

        <div class="mb-8">
          <SuccessfullyIcon v-if="isSuccess" class="mx-auto h-16 w-16" />
        </div>

        <p
          class="text-18 md:text-24 text-grey-light-8 mb-8 max-w-2xl text-center"
          data-testid="status-message"
        >
          {{ statusMessage }}
        </p>
      </div>

      <hr class="border-under-line my-8 border-[#F2F2F2] dark:border-[#3D4043]" />

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
        <PreloaderAnimIcon class="size-12" theme="white" />
        <p class="text-16 text-grey-light-7 mt-4">Loading your order details...</p>
      </div>

      <div v-else class="flex w-full flex-col gap-8">
        <div class="bg-grey-dark/50 border-grey-dark flex flex-col rounded-2xl border-2 p-[18px]">
          <div class="flex w-full flex-col gap-8 xl:flex-row">
            <div
              class="relative h-[10.375rem] overflow-hidden rounded-[1rem] md:h-[16.313rem] md:min-w-[17.813rem] xl:h-auto xl:w-[38.7%]"
            >
              <tour-video-player
                v-if="successMedia?.video"
                :src="successMedia.video"
                loader
                only-view
                class="absolute inset-0 h-full w-full object-cover object-center"
                @loaded="imageLoadedMap[successMedia.video] = true"
                @loading="imageLoadedMap[successMedia.video] = false"
              />

              <div
                v-if="
                  successMedia &&
                  !successMedia.video &&
                  successMedia.image &&
                  !imageLoadedMap[successMedia.image]
                "
                class="absolute inset-0"
              >
                <tour-skeleton class="h-full w-full" />
              </div>

              <div
                v-else-if="!successMedia || (!successMedia.video && !successMedia.image)"
                class="absolute inset-0"
              >
                <tour-skeleton class="h-full w-full" />
              </div>

              <img
                v-if="successMedia?.image"
                :src="successMedia.image"
                :alt="`${tourData?.name} - tour media`"
                class="absolute inset-0 h-full w-full object-cover object-center"
                @load="imageLoadedMap[successMedia.image] = true"
                @error="imageLoadedMap[successMedia.image] = true"
              />
            </div>

            <div class="flex w-full flex-col">
              <h2 class="pb-[1.375rem] text-[24px] leading-[110%]">
                {{ tourData?.name }}
              </h2>
              <div
                class="flex flex-col gap-6 text-[1.125rem] font-normal md:flex-row md:gap-[3.75rem]"
              >
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

                <ul>
                  <li class="mb-1 text-black/40 dark:text-white/40">Total duration:</li>
                  <li class="pb-6 md:pb-8">
                    {{ formatDuration(customTourLocal?.total_duration) }}
                  </li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Total price:</li>
                  <li class="pb-6 md:pb-8">€ {{ customTourLocal?.total_price }}</li>
                  <li class="mb-1 text-black/40 dark:text-white/40">Transportation:</li>
                  <li>{{ getTransportationName() }}</li>
                </ul>

                <ul>
                  <li class="mb-1 text-black/40 dark:text-white/40">List of services:</li>
                  <li v-for="service in customTourLocal?.addons" :key="service.id">
                    {{ service.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-4 md:flex-row">
        <button @click="router.push('/')" class="button w-full px-8 md:w-auto">
          Return to Home
        </button>

        <button
          v-if="isAuthenticated"
          @click="router.push('/account/ridehistory')"
          class="button w-full px-8 md:w-auto"
        >
          Go to My Account
        </button>

        <button v-if="!isSuccess" @click="retryPayment" class="button w-full px-8 md:w-auto">
          Try Again
        </button>
      </div>
    </div>
  </div>

  <!-- Слайдер с похожими турами -->
  <div class="mt-12">
    <div v-if="toursToShow.length" class="hidden md:block">
      <div class="relative md:px-12">
        <div
          class="swiper-button-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
        <Swiper
          :slidesPerView="3"
          :spaceBetween="30"
          :modules="modules"
          :navigation="{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }"
          grab-cursor
          :loop="true"
          :autoplay="{ delay: 5000, disableOnInteraction: false }"
        >
          <SwiperSlide v-for="tour in toursToShow" :key="tour.id" class="p-1">
            <tour-card class="min-h-[600px]" :tour="tour" />
          </SwiperSlide>
        </Swiper>
        <div
          class="swiper-button-next absolute right-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
      </div>
    </div>
    <div v-if="toursToShow.length" class="mt-6 block md:hidden">
      <div class="flex flex-col gap-y-6">
        <tour-card v-for="tour in toursToShow" :key="tour.id" :tour="tour" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PreloaderAnimIcon from '@/components/ui/icons/PreloaderAnimIcon.vue'
import SuccessfullyIcon from '@/components/ui/icons/SuccessfullyIcon.vue'
import { useUserStore } from '@/stores/user'
import { useToursStore } from '@/stores/tours'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { PaymentService } from '@/utils/paymentService'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import { Autoplay, Navigation, Pagination } from 'swiper'
import TourCard from '@/components/ui/tours/TourCard.vue'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import { useMedia } from '@/compose/useMedia'
import type { MediaItem, Media, Tour } from '@/types/tours'

const route = useRoute()
const router = useRouter()

const toursStore = useToursStore()
const userStore = useUserStore()
const {
  getMediaUrl,
  getVideoPreviewUrl,
  isVideoItem,
  isImageItem,
  getBestImageFromLegacy,
  getVideoFromLegacy,
  IMAGE_SIZES
} = useMedia()

const { customTour } = storeToRefs(toursStore)
const { isLoggedIn } = storeToRefs(userStore)
const isAuthenticated = computed(() => isLoggedIn.value)

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

const paymentStatus = route.params.params
const orderData = {
  order_id: route.query.order_id,
  payment_code: route.query.payment_code,
  notes: route.query.notes
}

const isLoading = ref(true)
const tourData = ref<Tour | null>(null)

const accountData = reactive({
  firstName: route.query.firstName || '',
  lastName: route.query.lastName || '',
  email: route.query.email || '',
  phone: route.query.phone || '',
  dialCode: route.query.dialCode || '',
  iso2: route.query.iso2 || '',
  country: route.query.country || '',
  pickup: route.query.pickup || '',
  duration: route.query.duration || ''
})

const userData = computed(() => ({
  name: accountData.firstName,
  last_name: accountData.lastName,
  email: accountData.email,
  phone: typeof accountData.phone === 'string' ? accountData.phone.replaceAll(' ', '') : '',
  country_code: accountData.dialCode,
  pickup: accountData.pickup,
  duration: accountData.duration
}))

const isSuccess = computed(() => paymentStatus === 'success')

const pageTitle = computed(() => {
  switch (paymentStatus) {
    case 'success':
      return 'Thank You for Your Order!'
    case 'pending':
      return 'Your Payment is Being Processed'
    case 'failure':
      return 'Payment Unsuccessful'
    default:
      return 'Order Status'
  }
})

const statusMessage = computed(() => {
  switch (paymentStatus) {
    case 'success':
      return 'Your payment has been processed successfully. You will receive a confirmation email shortly with all the details of your tour.'
    case 'pending':
      return 'Your payment is currently being processed. Once completed, you will receive a confirmation email with all the details of your tour.'
    case 'failure':
      return 'We were unable to process your payment. Please check your payment details and try again, or contact our support team for assistance.'
    default:
      return "We're checking the status of your order."
  }
})

const isMobile = computed(() => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false))
const imageLoadedMap = ref<Record<string, boolean>>({})

/**
 * Обрабатывает медиа в новом формате MediaItem
 */
const processMediaItem = (item: MediaItem) => {
  if (isVideoItem(item)) {
    return {
      video: getMediaUrl(item, IMAGE_SIZES.MEDIUM),
      image: item.has_preview ? getVideoPreviewUrl(item, IMAGE_SIZES.MEDIUM) : ''
    }
  } else if (isImageItem(item)) {
    return {
      image: getMediaUrl(item, isMobile.value ? IMAGE_SIZES.MEDIUM : IMAGE_SIZES.LARGE),
      video: ''
    }
  }
  return null
}

/**
 * Обрабатывает медиа в старом формате Media (для обратной совместимости)
 */
const processLegacyMedia = (items: Media[]) => {
  const videoItems = items.filter((item) => {
    const mime = item.mime?.toLowerCase() || ''
    const format = item.format?.toLowerCase() || ''
    return mime.startsWith('video/') || format === 'mp4' || format === 'webm'
  })

  const imageItems = items.filter((item) => {
    const mime = item.mime?.toLowerCase() || ''
    const format = item.format?.toLowerCase() || ''
    return mime.startsWith('image/') || ['webp', 'jpg', 'jpeg', 'png'].includes(format)
  })

  const video = getVideoFromLegacy(videoItems)
  const image = getBestImageFromLegacy(
    imageItems,
    isMobile.value ? ['768', '320'] : ['1024', '768', '320']
  )

  return {
    video,
    image
  }
}

const successMedia = computed(() => {
  if (!tourData.value?.media) return null

  const media = tourData.value.media

  if (Array.isArray(media) && media.length > 0) {
    const firstItem = media[0]
    if (
      firstItem &&
      typeof firstItem === 'object' &&
      'type' in firstItem &&
      'filename' in firstItem
    ) {
      const videoItem = media.find((item: MediaItem) => item.type === 'video')
      const imageItem = media.find((item: MediaItem) => item.type === 'image')

      if (videoItem) {
        return processMediaItem(videoItem)
      }
      if (imageItem) {
        return processMediaItem(imageItem)
      }
      return processMediaItem(firstItem as MediaItem)
    }
  }

  if (Array.isArray(media)) {
    for (const group of media) {
      if (Array.isArray(group) && group.length > 0) {
        const processed = processLegacyMedia(group as Media[])
        if (processed.video || processed.image) {
          return processed
        }
      } else if (group && typeof group === 'object' && 'url' in group) {
        const processed = processLegacyMedia([group as unknown as Media])
        if (processed.video || processed.image) {
          return processed
        }
      }
    }
  }

  return null
})

const formatDate = (date: string | Date | null | undefined) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'
}

const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0
    ? `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min` : ''}`
    : `${mins} min`
}

const getTransportationName = () => {
  if (!customTourLocal.value?.addons || customTourLocal.value.addons.length === 0) {
    return 'N/A'
  }

  const transportAddon = customTourLocal.value.addons.find(
    (addon) => addon.segmentType === 'Transportation'
  )

  return transportAddon?.name || 'N/A'
}

const fetchTourData = async () => {
  try {
    const tourId = customTourLocal.value?.tour_id
    if (tourId) {
      const tour = await toursStore.getTourById(
        typeof tourId === 'string' ? Number(tourId) : tourId
      )
      tourData.value = tour || null
    }
  } catch (error) {
    console.error('Error fetching tour data:', error)
  }
}

const updatePaymentStatus = async () => {
  if (isSuccess.value && orderData.order_id && orderData.payment_code) {
    try {
      const paymentService = new PaymentService(import.meta.env.VITE_APP_API_INSP)

      // Формируем данные в формате, ожидаемом бэкендом
      const payload: Record<string, unknown> = {
        order_id: Number(orderData.order_id) || orderData.order_id,
        payment_code: orderData.payment_code,
        client_notes: orderData.notes || null
      }

      // Добавляем данные пользователя, если не авторизован
      if (userData.value.email) {
        payload.name = userData.value.name
        payload.last_name = userData.value.last_name
        payload.email = userData.value.email
        payload.phone = userData.value.phone
        payload.country_code = userData.value.country_code
      }

      await paymentService.updatePaymentStatus(payload)
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }
}

const retryPayment = () => {
  router.push('/tour/payment')
}

const { tours, selectedTourId } = storeToRefs(toursStore)

const modules = [Navigation, Pagination, Autoplay]

const toursToShow = computed(() => {
  return (tours.value || []).filter((t) => t.id !== selectedTourId.value)
})

onMounted(async () => {
  if (!customTourLocal.value) {
    router.push('/')
    return
  }

  try {
    isLoading.value = true

    await Promise.all([fetchTourData(), updatePaymentStatus()])
    toursStore.loadToursFromLocalStorage()
    toursStore.loadSelectedTourIdFromLocalStorage()
  } catch (error) {
    console.error('Error initializing payment result page:', error)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (isSuccess.value) toursStore.updateCustomTour(null)
})
</script>

<style scoped>
ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
