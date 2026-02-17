<template>
  <tour-page-skeleton v-if="loading" />
  <div v-else class="tour-page my-3 lg:my-12 lg:mt-12">
    <!-- SEO контент для поисковых систем -->
    <tour-seo-content
      v-if="tour"
      :tour="tour"
      :page-data="pageData"
      :formatted-duration="formattedTotalDuration"
      :price-per-participant="pricePerParticipant"
    />

    <template v-if="tour">
      <tour-gallery-modal
        v-if="tourModal && tour.page_id"
        :page-data="pageData"
        @close="tourModal = false"
      />
      <tour-text-modal
        v-if="tourModal && !tour.page_id"
        :title="tour?.name || ''"
        :text="tour?.description || ''"
        @close="tourModal = false"
      />
    </template>

    <section v-if="tour" class="space-y-14 rounded-[18px]">
      <div class="lg:min-h-auto block xl:max-h-[750px] 2xl:max-h-[1024px]">
        <Suspense>
          <template #default>
            <AsyncTourSwiper
              :media="sortedMedia"
              :tour="tour"
              :imageLoadedMap="imageLoadedMap"
              :isVideo="isVideo"
              @videoPlay="handleVideoPlay"
              @videoPause="handleVideoPause"
              @prevSlide="prevSlide"
              @nextSlide="nextSlide"
              @swiperInit="onMainSwiperInit"
            />
          </template>
          <template #fallback>
            <tour-skeleton class="aspect-[4/3] w-full rounded-[14px] md:max-h-[550px]" />
          </template>
        </Suspense>
      </div>
    </section>
    <section
      v-if="tour"
      class="lg:gap-x-15 relative mt-12 flex overflow-hidden rounded-[18px] bg-white p-3 py-8 dark:bg-dark_wind max-lg:flex-col lg:p-12"
    >
      <div class="flex gap-y-6 pb-0 max-lg:flex-col lg:gap-x-[70px]">
        <div class="lg:max-w-[530px]">
          <h1
            class="mb-4 break-words text-[24px]/[110%] font-bold xl:text-[48px]/[110%]"
            data-testid="tour-name"
          >
            {{ tour?.name }}
          </h1>
          <div class="flex flex-row flex-wrap gap-1.5">
            <tour-chip variant="outlined" v-if="tour?.duration"
              >{{ priceService.formatDuration(+tour?.duration) }}
            </tour-chip>
            <tour-chip variant="outlined" class="!px-5">
              1-{{ tour?.default_participants_count || 8 }}participants</tour-chip
            >
          </div>
        </div>
        <div
          class="text-16 xl:text-20 text-grey-light-6 leading-28 col-span-full w-full lg:col-span-7"
        >
          <p
            class="line-clamp-30 text-black/60 dark:text-white/60"
            v-safe-html="tour?.description"
          ></p>
          <div class="mt-6 flex flex-wrap gap-2">
            <tour-chip
              v-for="chip in tour?.highlights"
              :key="chip.id"
              variant="outlined"
              class="flex items-center gap-2 !text-nowrap !border-main/40 text-black/70 dark:text-white/70"
            >
              <img v-if="chip.icon" alt="icon" :src="chip.icon" class="custom-svg-color h-4 w-4" />
              {{ chip.title }}
            </tour-chip>
          </div>
          <button @click="handleReadMore" class="button mt-6 w-full px-10 py-5 md:mt-12 lg:w-max">
            Read more
          </button>
        </div>
      </div>
    </section>

    <!-- Amount of participants block -->
    <section
      v-if="tour"
      ref="targetSection"
      class="lg:gap-x-15 relative mt-[6px] flex overflow-hidden rounded-[18px] bg-white p-3 dark:bg-dark_wind max-lg:flex-col lg:p-12 xl:mt-12"
    >
      <div class="flex w-full flex-col lg:mb-0 lg:max-w-[293px]">
        <p class="mb-2.5 text-[16px]/[22px] font-light text-[#8D8D8D]">Step 1</p>
        <p class="text-[22px]/110% mb-7 font-bold text-black dark:text-white lg:text-[32px]/[110%]">
          Amount of <br />
          participants
        </p>
      </div>
      <div class="flex w-full flex-col gap-y-6 lg:-col-end-1">
        <div
          class="flex h-full cursor-pointer justify-between gap-6 rounded-[40px] bg-[#F2F2F2] p-[18px] dark:bg-[#1E1E20] max-sm:flex-col sm:items-center lg:max-xl:flex-col"
        >
          <p
            class="text-[18px]/[110%] font-bold text-black dark:text-white lg:text-[24px]/[110%] lg:font-medium"
          >
            Amount of participants
          </p>
          <div class="flex w-full flex-row items-center gap-x-4 sm:max-lg:w-max xl:w-max">
            <button
              @click="decreaseParticipants"
              class="cursor-pointer rounded-full bg-[#0B0B0B]/50 p-4 dark:bg-[#0B0B0B] max-sm:w-full sm:px-[52px] lg:px-[68px] lg:py-5 lg:max-xl:w-full"
            >
              <minus-icon class="mx-auto stroke-white" />
            </button>
            <p
              class="text-[18px]/[110%] font-medium text-black dark:text-white lg:text-[23px]/[110%] 2xl:text-[26px]/[110%]"
            >
              {{ participants }}
            </p>
            <button
              @click="increaseParticipants"
              class="cursor-pointer rounded-full bg-[#0B0B0B]/50 p-4 dark:bg-[#0B0B0B] max-sm:w-full sm:px-[52px] lg:px-[68px] lg:py-5 lg:max-xl:w-full"
            >
              <plus-icon class="mx-auto stroke-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
    <tour-selector-block
      v-for="(segment, segmentIndex) in sortedSegments"
      :data="segment"
      :key="segment.id"
      :step="segmentIndex + 2"
      :participants="participants"
      @addon-selected="handleAddonSelected"
      @addon-removed="handleAddonRemoved"
      @addon-unavailable="handleAddonUnavailable"
      :driver-hour-rate="driverHourlyRate"
      :category="tour?.categories?.find((cat: Category) => cat.id === segment.id)"
      :get-price-with-sign="getPriceWithSign"
    />
    <div v-if="tour" class="border-b-1 my-[6px] border-[#313131] xl:my-12"></div>
    <div v-if="tour" class="sticky bottom-[20px] left-0 z-10 hidden w-full justify-center xl:block">
      <transition name="sticky">
        <section
          v-show="isStickyVisible"
          class="sticky-bar-hover block"
          :class="{ 'animate-in': isStickyVisible }"
        >
          <tour-booking-bar
            v-if="tour"
            ref="bookingBarDesktop"
            v-model:date="displayDate"
            :tour="tour"
            :participants="participants"
            :total-price="totalPrice"
            :price-per-participant="pricePerParticipant"
            :formatted-duration="formattedTotalDuration"
            :addons="selectedAddons"
            :basic-tour-price-total="calculateBasicTourPrice()"
            :basic-tour-price-per-person="calculateBasicTourPrice() / participants"
            :is-base-addon="isBaseAddon"
            :get-price-with-sign="getPriceWithSign"
            @increase-participants="increaseParticipants"
            @decrease-participants="decreaseParticipants"
            @book="bookTour"
          />
        </section>
      </transition>
    </div>
    <!--      FOR MOBILE-->
    <section
      v-if="tour"
      class="bottom-[20px] left-0 z-10 flex w-full flex-col items-center xl:hidden"
    >
      <tour-booking-bar
        v-if="tour"
        ref="bookingBarMobile"
        v-model:date="displayDate"
        :tour="tour"
        :participants="participants"
        :total-price="totalPrice"
        :price-per-participant="pricePerParticipant"
        :formatted-duration="formattedTotalDuration"
        :addons="selectedAddons"
        :basic-tour-price-total="calculateBasicTourPrice()"
        :basic-tour-price-per-person="calculateBasicTourPrice() / participants"
        :is-base-addon="isBaseAddon"
        :get-price-with-sign="getPriceWithSign"
        @increase-participants="increaseParticipants"
        @decrease-participants="decreaseParticipants"
        @book="bookTour"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect
} from 'vue'
import { FreeMode, Navigation, Thumbs } from 'swiper'
import { useRoute, useRouter } from 'vue-router'
import { PriceCalculationService } from '@/utils/priceCalculationService'
import TourGalleryModal from '@/components/ui/tours/TourGalleryModal.vue'
import TourTextModal from '@/components/ui/tours/TourTextModal.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import TourPageSkeleton from '@/components/ui/tours/TourPageSkeleton.vue'
import TourSeoContent from '@/components/ui/tours/TourSeoContent.vue'
import TourChip from '@/components/ui/tours/TourChip.vue'
import TourSelectorBlock from '@/components/ui/tours/TourSelectorBlock.vue'
import TourBookingBar from '@/components/ui/tours/TourBookingBar.vue'
import MinusIcon from '@/components/ui/icons/MinusIcon.vue'
import PlusIcon from '@/components/ui/icons/PlusIcon.vue'
import { useToursStore } from '@/stores/tours'
import { useMedia } from '@/compose/useMedia'
import type { MediaItem, Media, Tour, TourPage, Addon, Segment, Category } from '@/types/tours'
import type { Swiper as SwiperType } from 'swiper'
import type { TourAboutContentData, TourBlock } from '@/components/ui/tours/types'

const AsyncTourSwiper = defineAsyncComponent(
  () => import('@/components/ui/tours/AsyncTourSwiper.vue')
)

const route = useRoute()
const router = useRouter()
const priceService = PriceCalculationService

const toursStore = useToursStore()
const {
  getMediaUrl,
  getVideoPreviewUrl,
  isVideoItem,
  isImageItem,
  getBestImageFromLegacy,
  getVideoFromLegacy,
  IMAGE_SIZES
} = useMedia()

const isVideo = (item: unknown): boolean => {
  if (!item || typeof item !== 'object') return false

  const mediaItem = item as MediaItem
  // Новый формат
  if ('type' in mediaItem && mediaItem.type === 'video') return true

  // Старый формат
  const media = item as Media
  if ('mime' in media && media.mime?.toLowerCase().includes('video')) return true
  if ('format' in media && ['mp4', 'webm', 'ogg'].includes(media.format?.toLowerCase())) return true

  return false
}

const isSwiperReady = ref(false)
const mainSwiperComponent = ref<any>(null)
const mainSwiperRef = ref<SwiperType | null>(null)
const thumbsSwiperComponent = ref<any>(null)
const thumbsSwiper = ref<SwiperType | null>(null)
const activeIndex = ref(0)
const tour = ref<Tour | null>(null)
const rawPageData = ref<TourPage | null>(null)
const loading = ref(false)
const imageLoadedMap = ref<Record<string, boolean>>({})
const modules = [FreeMode, Navigation, Thumbs]
const participants = ref(1)
const tourDate = ref<string>('')
const tourModal = ref(false)
const targetSection = ref<HTMLElement | null>(null)
const isStickyVisible = ref(false)

const isMobile = computed(() => window?.innerWidth <= 767)

const pageData = computed((): TourAboutContentData | null => {
  if (!rawPageData.value) return null

  return {
    title: rawPageData.value.title,
    blocks: rawPageData.value.blocks.map((block, index) => ({
      ...block,
      id: `block-${index}`
    })) as TourBlock[]
  }
})

const allowedCodesMap: Record<number, string[]> = {
  1: ['MBE', 'SCLASS', 'MBGLS'],
  2: ['MBE', 'SCLASS', 'MBGLS'],
  3: ['MBE', 'MBV', 'MBGLS'],
  4: ['MBV', 'MBSPC', 'MBGLS'],
  5: ['MBV', 'MBSPC', 'MBGLS'],
  6: ['MBV', 'MBSPC', 'MBGLS'],
  7: ['MBV', 'MBSPC', 'MBSPL'],
  8: ['MBSPC', 'MBSPL']
}

watchEffect(() => {
  if (!tour.value) return

  participants.value =
    tour.value.tour_default_participants_amount ?? tour.value.default_participants_count ?? 1
})

interface ExtendedAddon extends Addon {
  [key: string]: unknown
}

const selectedAddons = ref<Record<string | number, ExtendedAddon>>({})

const sortedMedia = computed(() => {
  const list = [...(tour.value?.media || [])]
  return list.sort((a, b) => {
    const isA = isVideo(a)
    const isB = isVideo(b)
    return Number(!isA) - Number(!isB)
  })
})

const sortedSegments = computed(() => {
  if (!tour.value?.segments || !tour.value?.categories) return []

  // Создаём мапу категорий для быстрого поиска индекса
  const categoryIndexMap = new Map<number, number>()
  tour.value.categories.forEach((cat: Category, index: number) => {
    categoryIndexMap.set(cat.id, index)
  })

  // Сортируем сегменты согласно порядку в массиве categories
  return [...tour.value.segments].sort((a, b) => {
    const indexA = categoryIndexMap.get(a.id) ?? Infinity
    const indexB = categoryIndexMap.get(b.id) ?? Infinity
    return indexA - indexB
  })
})

const selectedAddonsList = computed((): ExtendedAddon[] => {
  return Object.values(selectedAddons.value)
})

const driverHourlyRate = computed(() => {
  if (!tour.value) return 0
  const baseTourDuration = Number(tour.value.duration) || 0
  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('vehicle')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  // Используем все сервисы (базовые + выбранные)
  const allServices = getAllServices()

  return priceService.calculateDriverHourlyRate(
    allServices as any,
    baseTourDuration,
    timeDiscount,
    participants.value
  )
})

const isBaseAddon = (addon: Addon | ExtendedAddon): boolean => {
  if (!tour.value?.segments) return false

  const segments = tour.value.segments as Segment[]
  const segment = segments.find((seg) => seg.addons?.some((a: Addon) => a.id === addon.id))

  if (!segment) return false

  const baseAddon = findBaseAddonForSegment(segment, participants.value)
  if (!baseAddon || baseAddon.id !== addon.id) return false

  const maxParticipants = Number(addon.max_participants)
  return (
    Number.isNaN(maxParticipants) || maxParticipants === 0 || participants.value <= maxParticipants
  )
}

const handleVideoPlay = () => {
  mainSwiperRef.value?.autoplay?.stop()
}

const handleVideoPause = () => {
  mainSwiperRef.value?.autoplay?.start()
}

const onMainSlideChange = () => {
  activeIndex.value = mainSwiperRef.value?.realIndex || 0
}

const onMainSwiperInit = (swiper: SwiperType) => {
  mainSwiperRef.value = swiper
  isSwiperReady.value = true
}

const nextSlide = () => {
  const swiper = mainSwiperRef.value
  if (!swiper) return

  swiper.slideNext()
}

const prevSlide = () => {
  const swiper = mainSwiperRef.value
  if (!swiper) return

  swiper.slidePrev()
}

const handleAddonSelected = (addon: Addon, segmentIndex: string | number, segment: Segment) => {
  selectedAddons.value[segmentIndex] = {
    ...addon,
    segmentType:
      (segment.type &&
        typeof segment.type === 'object' &&
        'name' in segment.type &&
        segment.type.name) ||
      ''
  }
}

const handleAddonRemoved = (segmentId: string | number) => {
  if (selectedAddons.value[segmentId]) {
    delete selectedAddons.value[segmentId]
  }
}

const displayDate = computed({
  get: () => (tourDate.value ? new Date(tourDate.value) : null),
  set: (val: Date | null) => {
    tourDate.value = val ? val.toISOString() : ''
  }
})

const totalDuration = computed(() => {
  if (!tour.value) return 0

  // Если есть данные о маршруте, используем их для точного расчета
  if (tour.value.route_pricing) {
    const routePricing = tour.value.route_pricing
    const garageDiscountPercent = routePricing.garage_discount_percent ?? 30
    const discountedGarageMin =
      (routePricing.garage_duration_minutes ?? 0) * (1 - garageDiscountPercent / 100)

    const baseDurationMinutes = routePricing.base_duration_minutes ?? 0
    const totalDurationMinutes =
      baseDurationMinutes + (routePricing.route_duration_minutes ?? 0) + discountedGarageMin
    const result = Math.ceil(totalDurationMinutes)

    return result
  }

  // Если нет routePricing, используем tour.value.duration как fallback
  // (в этом случае это может быть уже итоговое значение с маршрутом)
  return Number(tour.value.duration) || 0
})

const formattedTotalDuration = computed(() => {
  return priceService.formatTotalDuration(totalDuration.value)
})

const decreaseParticipants = () => {
  if (participants.value > 1) participants.value--
}

const increaseParticipants = () => {
  if (!tour.value) {
    return
  }
  const maxParticipants = tour.value.max_participants ?? tour.value.default_participants_count ?? 8
  if (participants.value < maxParticipants) {
    participants.value++
  }
}

const handleAddonUnavailable = (segmentId: string | number) => {
  if (!selectedAddons.value[segmentId]) return

  delete selectedAddons.value[segmentId]

  const segments = tour.value?.segments as Segment[] | undefined
  const segment = segments?.find((seg) => seg.id === segmentId)
  if (!segment) {
    return
  }

  const availableAddons = segment.addons?.filter((addon: Addon) => {
    const max = Number(addon.max_participants)
    return Number.isNaN(max) || max === 0 || participants.value <= max
  })

  const baseAddon = findBaseAddonForSegment(segment, participants.value)

  if (baseAddon && availableAddons.some((a: Addon) => a.id === baseAddon.id)) {
    selectedAddons.value[segmentId] = {
      ...baseAddon,
      segmentType:
        (segment.type &&
          typeof segment.type === 'object' &&
          'name' in segment.type &&
          segment.type.name) ||
        ''
    }
    return
  }

  if (availableAddons.length > 0) {
    selectedAddons.value[segmentId] = {
      ...availableAddons[0],
      segmentType:
        (segment.type &&
          typeof segment.type === 'object' &&
          'name' in segment.type &&
          segment.type.name) ||
        ''
    }
  }
}

const calculateTourPriceWithAddon = (addon: Addon | ExtendedAddon): number => {
  if (!tour.value) return 0

  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  // Calculate price if we swapped base selection in this segment for 'addon'
  // using BASE services for all other segments as baseline
  const baselineServices: Record<number, Addon> = {}
  if (tour.value.segments) {
    for (const segment of tour.value.segments as Segment[]) {
      const baseAddon = findBaseAddonForSegment(segment, participants.value)
      if (baseAddon) {
        baselineServices[segment.id] = baseAddon
      }
    }
  }

  return priceService.calculateTourPriceWithSpecificAddon(
    addon as Addon,
    baselineServices, // use baseline, not current selections
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    Number(tour.value.duration) || 0,
    timeDiscount,
    1
  )
}

const getPriceWithSign = (addon: Addon | ExtendedAddon, isTotal = false): string => {
  if (!tour.value?.segments) return ''

  const baseDurationMinutes = tour.value.route_pricing?.base_duration_minutes ?? 0

  // Находим сегмент для этого аддона
  const segment = (tour.value.segments as any[]).find((s: any) =>
    (s.addons || s.services)?.some((a: Addon) => Number(a.id) === Number(addon.id))
  )

  // Находим базовую услугу для этого сегмента
  const baseAddon = segment ? findBaseAddonForSegment(segment as Segment, participants.value) : null

  // Создаем набор текущих выбранных аддонов, исключая аддон из текущего сегмента
  // Это нужно для корректного сравнения: базовая цена vs цена с выбранным аддоном
  const currentSelectedAddons: Record<number, Addon | undefined> = {}
  ;(tour.value.segments as any[]).forEach((s: any) => {
    if (s.id !== segment?.id && selectedAddons.value[s.id]) {
      currentSelectedAddons[s.id] = selectedAddons.value[s.id]
    }
  })

  // Рассчитываем базовую цену с теми же выбранными аддонами + базовый аддон для текущего сегмента
  // Это обеспечивает корректное сравнение
  const baselineSelectedAddons: Record<number, Addon | undefined> = { ...currentSelectedAddons }
  if (segment && baseAddon) {
    baselineSelectedAddons[segment.id] = baseAddon
  }

  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  const basePriceRaw = priceService.calculateTotalPriceRaw(
    baselineSelectedAddons,
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    baseDurationMinutes,
    timeDiscount,
    1,
    tour.value.route_pricing,
    true // alwaysResolveGaps
  )

  const differenceRaw = priceService.calculatePriceDifference(
    addon as Addon,
    basePriceRaw,
    currentSelectedAddons,
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    baseDurationMinutes,
    timeDiscount,
    1,
    tour.value.route_pricing,
    true // alwaysResolveGaps
  )

  if (Math.abs(differenceRaw) < 0.01) {
    // Для услуг с нулевой разницей показываем "Included" вместо базовой цены
    return 'Included'
  }

  return formatDifference(differenceRaw, isTotal)
}

const formatDifference = (difference: number, isTotal: boolean): string => {
  const value = isTotal ? difference : Math.round(difference / participants.value)
  return value > 0
    ? `+${priceService.formatPrice(value)} EUR${isTotal ? '' : ' P/P'}`
    : `${priceService.formatPrice(value)} EUR${isTotal ? '' : ' P/P'}`
}

const calculateBasicTourPrice = (): number => {
  if (!tour.value) return 0

  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  return priceService.calculateTotalPrice(
    {}, // Пустой объект заставит сервис использовать базовые для каждого сегмента
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    Number(tour.value.duration) || 0,
    timeDiscount,
    1
  )
}

const findBaseAddonForSegment = (segment: Segment, currentParticipants: number): Addon | null => {
  let baseAddon: Addon | null = null

  // 1. Проверяем новую структуру через categories и configs
  const category = tour.value?.categories?.find(
    (cat: Category) => Number(cat.id) === Number(segment.id)
  )
  if (category?.configs?.length) {
    let config = category.configs.find(
      (c: any) => Number(c.participants_count) === Number(currentParticipants)
    )
    if (!config) config = category.configs[0]

    if (config?.base_service_id) {
      baseAddon =
        segment.addons?.find((a: Addon) => Number(a.id) === Number(config.base_service_id)) || null
    }
  }

  // 2. Старая логика: Проверяем participant_base_services
  if (!baseAddon && segment.participant_base_services?.length > 0) {
    let baseService = segment.participant_base_services.find(
      (service: any) => Number(service.participants) === Number(currentParticipants)
    )
    if (!baseService) baseService = segment.participant_base_services[0]

    if (baseService) {
      baseAddon =
        segment.addons?.find((a: any) => Number(a.id) === Number(baseService.addon_id)) || null
    }
  }

  // 3. Старая логика: Проверяем uniform_base_service
  if (!baseAddon && segment.has_uniform_base_service && segment.base_service_id) {
    baseAddon =
      segment.addons?.find((a: Addon) => Number(a.id) === Number(segment.base_service_id)) || null
  }

  // Last chance: берем просто первый в списке (важно для обязательных категорий)
  if (!baseAddon && segment.addons?.length > 0) {
    baseAddon = segment.addons[0]
  }

  return baseAddon
}

// Получает все сервисы (базовые, замененные на выбранные пользователем)
const getAllServices = (): Record<number, ExtendedAddon> => {
  if (!tour.value?.segments) return {}

  const segments = tour.value.segments as Segment[]
  const services: Record<number, ExtendedAddon> = {}

  // Сначала добавляем все базовые сервисы
  for (const segment of segments) {
    const baseAddon = findBaseAddonForSegment(segment, participants.value)
    if (baseAddon) {
      services[segment.id] = {
        ...baseAddon,
        segmentType:
          (segment.type &&
            typeof segment.type === 'object' &&
            'name' in segment.type &&
            segment.type.name) ||
          ''
      }
    }
  }

  // Затем заменяем на выбранные пользователем (upgrades)
  for (const [segmentId, selectedAddon] of Object.entries(selectedAddons.value)) {
    services[Number(segmentId)] = selectedAddon
  }

  return services
}

const totalHoursForCalc = computed(() => {
  if (!tour.value) return 0
  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  return priceService.calculateTotalHoursWithDiscount(
    Number(tour.value.duration) || 0,
    getAllServices() as any,
    (tour.value.segments || []) as any,
    tour.value.categories,
    timeDiscount,
    1,
    participants.value
  )
})

const pricePerParticipant = computed(() => {
  if (!tour.value) return 0

  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  // Используем базовую длительность тура (как на бэкенде)
  const baseDuration = Number(tour.value.duration) || 0

  // Используем selectedAddons напрямую, как в inspiritaly-frontend
  return priceService.calculatePricePerParticipant(
    selectedAddons.value as any,
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    baseDuration,
    timeDiscount,
    1,
    tour.value.route_pricing
  )
})

const totalPrice = computed(() => {
  if (!tour.value) return 0

  const transportationCategory = tour.value.categories?.find(
    (cat: Category) =>
      cat.title?.toLowerCase().includes('transportation') ||
      cat.title?.toLowerCase().includes('vehicle') ||
      cat.title?.toLowerCase().includes('groundtransportation') ||
      cat.title?.toLowerCase().includes('guidance') ||
      cat.title?.toLowerCase().includes('performance')
  )
  const timeDiscount = transportationCategory?.time_discount ?? 5

  // Используем базовую длительность из route_pricing, если доступна
  // ВАЖНО: НЕ используем tour.value.duration как fallback, так как оно уже включает маршрут
  const baseDuration = tour.value.route_pricing?.base_duration_minutes ?? 0

  // Используем selectedAddons напрямую, как в inspiritaly-frontend
  return priceService.calculateTotalPrice(
    selectedAddons.value as any,
    (tour.value.segments || []) as any,
    participants.value,
    driverHourlyRate.value,
    tour.value.categories,
    baseDuration,
    timeDiscount,
    1,
    tour.value.route_pricing
  )
})

const bookingBarDesktop = ref<any>(null)
const bookingBarMobile = ref<any>(null)

const bookTour = () => {
  if (!tour.value) {
    console.error('Cannot book tour: tour data is not available')
    return
  }

  if (!tourDate.value) {
    // Открываем календарь если дата не выбрана
    bookingBarDesktop.value?.openCalendar()
    bookingBarMobile.value?.openCalendar()
    return
  }

  const totalPriceInteger = Math.round(totalPrice.value)
  const durationInMinutes = Math.round(totalDuration.value)

  // Получаем все сервисы (базовые + выбранные)
  const allServices = getAllServices()

  // Определяем базовые addon_ids (только базовые, не выбранные пользователем)
  const segments = tour.value.segments as Segment[] | undefined
  const baseAddonIds = (segments || [])
    .map((segment: Segment) => {
      const baseAddon = findBaseAddonForSegment(segment, participants.value)
      return baseAddon ? baseAddon.id : null
    })
    .filter((id: number | null): id is number => id !== null)

  toursStore.updateCustomTour({
    tour_id: tour.value.id,
    date: tourDate.value,
    participants: participants.value,
    total_duration: durationInMinutes,
    total_price: totalPriceInteger,
    addons: Object.values(allServices) as Addon[],
    basic_addons_ids: baseAddonIds
  })

  router.push('/tour/payment')
}

const setThumbsSwiper = (swiper: SwiperType) => {
  thumbsSwiper.value = swiper
}

const getTour = async () => {
  try {
    loading.value = true
    const tourIdParam = route.params.id
    const tourId: string | number =
      typeof tourIdParam === 'string'
        ? Number(tourIdParam) || tourIdParam
        : Array.isArray(tourIdParam)
          ? Number(tourIdParam[0]) || tourIdParam[0]
          : tourIdParam

    const result = await toursStore.getTourById(tourId)
    if (result) {
      tour.value = result

      if (result.page_id) {
        try {
          const pageResult = await toursStore.getTourPage(result.page_id)
          if (pageResult) {
            rawPageData.value = pageResult
          }
        } catch (error) {
          console.error('Failed to fetch tour page data:', error)
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch tour data:', error)
  } finally {
    loading.value = false
  }
}

watch(
  [sortedMedia, isSwiperReady],
  ([mediaVal, ready]) => {
    if (mediaVal && ready) {
      nextTick(() => {
        mainSwiperRef.value?.slideToLoop?.(0)
      })
    }
  },
  { immediate: true }
)

const handleReadMore = () => {
  tourModal.value = !tourModal.value
}

const handleScroll = () => {
  if (!targetSection.value) return

  requestAnimationFrame(() => {
    if (!targetSection.value) return
    const rect = targetSection.value.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // Показываем sticky bar когда секция выходит за пределы экрана
    const shouldBeVisible = rect.top < 0 || rect.bottom < windowHeight - 100

    if (shouldBeVisible !== isStickyVisible.value) {
      isStickyVisible.value = shouldBeVisible
    }
  })
}

onMounted(() => {
  getTour()
  window.addEventListener('scroll', handleScroll, { passive: true })

  requestAnimationFrame(handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss">
.tour-page {
  .swiper {
    border-radius: 14px !important;
  }

  .swiper-button-prev-custom,
  .swiper-button-next-custom {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
  }

  .mySwiper2 .swiper-slide img {
    object-fit: cover;
    width: 100%;
  }

  .mySwiper2 .swiper-slide video {
    object-fit: cover;
    width: 100%;
  }

  .swiper-slide-thumb-active {
    filter: brightness(100%) !important;
  }

  .custom-svg-color {
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) hue-rotate(0deg) saturate(0%)
      brightness(100%) contrast(100%);
  }

  /* Улучшенные анимации для sticky bar */
  .sticky-enter-active {
    animation: slideUpFadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .sticky-leave-active {
    animation: slideDownFadeOut 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
  }

  @keyframes slideUpFadeIn {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    60% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDownFadeOut {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    40% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  /* Дополнительная анимация при наведении */
  .sticky-bar-hover {
    transition: all 0.2s ease-in-out;
  }

  .sticky-bar-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
