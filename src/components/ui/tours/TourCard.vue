<template>
  <div
    @click="onCardClick"
    class="tour-card group relative flex h-full min-h-[415px] w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-[40px] border border-[#272727] bg-white object-cover p-5 shadow duration-300 hover:border-main hover:shadow-lg dark:bg-[#333639]"
    data-testid="tour-card"
  >
    <div class="z-[2] flex h-full min-h-[19rem] w-full flex-col items-start self-start">
      <div class="w-full xl:mr-[30px]">
        <div class="relative mb-6 block">
          <div
            v-show="props.tour?.is_new"
            class="text-14 absolute left-4 top-4 z-10 rounded-[40px] bg-main px-2.5 font-medium text-black lg:py-1"
          >
            <p class="leading-[24px]">New</p>
          </div>
          <Swiper
            ref="swiper2"
            :autoplay="{
              delay: 5000,
              disableOnInteraction: false
            }"
            :modules="modules"
            :slidesPerView="1"
            @slideChange="onSlideChange"
            :loop="true"
            :spaceBetween="10"
            grab-cursor
            class="mb-6 !bg-transparent"
            :pagination="{ enabled: true, clickable: true }"
          >
            <SwiperSlide
              class="relative h-[189px] w-full max-w-[969px] overflow-hidden rounded-[32px] lg:h-[260px]"
              v-for="(slide, index) in slidesForDisplay"
              :key="slide.key ?? index"
            >
              <div
                v-if="!slide.video && (!slide.image || !imageLoadedMap[slide.image])"
                class="absolute inset-0 h-full w-full"
              >
                <tour-skeleton class="h-full w-full" />
              </div>
              <tour-video-player
                loader
                v-if="slide.video"
                @play="handleVideoPlay"
                @pause="handleVideoPause"
                @loaded="imageLoadedMap[slide.video] = true"
                @loading="imageLoadedMap[slide.video] = false"
                :src="slide.video"
                class="absolute inset-0 h-full w-full rounded-[32px] object-cover object-bottom"
                play-button-custom-class="md:!size-[50px]"
                play-button-icon-custom-class="md:!size-5"
              />
              <img
                v-if="slide.image"
                :src="slide.image"
                :alt="`${props.tour?.name} - изображение туров`"
                class="absolute h-full w-full rounded-[32px] object-cover object-bottom"
                @load="imageLoadedMap[slide.image] = true"
                @error="imageLoadedMap[slide.image] = true"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
      <h2 class="mb-2.5 line-clamp-4 text-[24px]/[110%] font-medium" data-testid="tour-name">
        {{ props.tour?.name }}
      </h2>
      <div class="relative mb-2.5 flex flex-wrap items-center gap-[0.375em]" @click.stop>
        <template v-for="(chip, index) in visibleChips" :key="index">
          <tour-chip
            v-if="chip.condition"
            variant="outlined"
            :class="chip.class"
            class="!px-2.5 !py-1 !text-[12px]/[110%] !font-normal !text-black/[0.6] dark:!text-white/[0.6]"
          >
            {{ chip.text }}
          </tour-chip>
        </template>

        <tour-chip
          v-if="hiddenChipsCount > 0"
          variant="outlined"
          class="!text-nowrap !border-main !px-2.5 !py-0 !text-main"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
        >
          +{{ hiddenChipsCount }}
        </tour-chip>

        <div
          v-if="showTooltip && hiddenChipsCount > 0"
          class="absolute bottom-8 left-1/2 z-10 mt-1 rounded-md bg-transparent p-2"
        >
          <div
            class="border-1 flex flex-col gap-y-1 rounded-[10px] border-[#484848] bg-[#313131] p-2"
          >
            <template v-for="(chip, index) in hiddenChips" :key="'hidden-' + index">
              <p :class="chip.class" class="!text-nowrap">
                {{ chip.text }}
              </p>
            </template>
          </div>
        </div>
      </div>
      <p class="text-14 mb-6 line-clamp-3 leading-[1.225rem] text-[#8D8D8D]">
        {{ props.tour?.short_description }}
      </p>
      <div class="mt-auto flex h-auto w-full items-center justify-between gap-4">
        <!-- <p class="text-14 font-medium">
          From {{ props.tour?.min_cost_markup && +props.tour?.min_cost_markup?.toFixed() }} € per
          person
        </p> -->
        <div></div>
        <!-- Arrow right icon (inside circle) -->
        <svg
          class="rounded-full bg-background duration-300 group-hover:bg-main"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect class="fill-coral duration-300" width="42" height="42" rx="21" />
          <path
            d="M18.2246 15.4502L23.7744 21L18.2246 26.5498"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TourChip from '@/components/ui/tours/TourChip.vue'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper'
import { computed, ref } from 'vue'
import { useMedia } from '@/compose/useMedia'
import type { MediaItem, Media, Tour } from '@/types/tours'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const router = useRouter()

const props = defineProps<{
  tour?: Tour | null
  largeCard?: boolean
}>()

const {
  getMediaUrl,
  getVideoPreviewUrl,
  isVideoItem,
  isImageItem,
  getBestImageFromLegacy,
  getVideoFromLegacy,
  IMAGE_SIZES
} = useMedia()

const showTooltip = ref(false)
const modules = [Navigation, Pagination, Autoplay]

const isMobile = computed(() => window?.innerWidth <= 767)

const allChips = computed(() =>
  [
    {
      text: formatDuration(props.tour?.duration ?? null),
      condition: !!props.tour?.duration,
      class: ''
    },
    {
      text: `1-${props.tour?.max_participants || 8} participants`,
      condition: !!props.tour?.max_participants,
      class: ''
    }
  ].filter((chip) => chip.condition && chip.text)
)

const maxChars = computed(() => (isMobile.value ? 35 : props.largeCard ? 50 : 50))

const visibleChips = computed(() => {
  if (allChips.value.length === 0) return []

  const firstChip = allChips.value[0]
  const visible = [firstChip]

  let totalChars = firstChip.text.length
  for (let i = 1; i < allChips.value.length; i++) {
    const chip = allChips.value[i]
    if (totalChars + chip.text.length <= maxChars.value) {
      visible.push(chip)
      totalChars += chip.text.length
    } else {
      break
    }
  }

  return visible
})

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

const slidesForDisplay = computed(() => {
  const media = props.tour?.media
  if (!media || !Array.isArray(media)) return []

  const slides = []

  if (media.length > 0) {
    const firstItem = media[0]

    if (
      firstItem &&
      typeof firstItem === 'object' &&
      'type' in firstItem &&
      'filename' in firstItem
    ) {
      for (const item of media) {
        const processed = processMediaItem(item as MediaItem)
        if (processed && (processed.video || processed.image)) {
          slides.push({
            key: `media-${item.id || slides.length}`,
            video: processed.video,
            image: processed.image
          })
        }
      }
    } else {
      for (let index = 0; index < media.length; index++) {
        const group = media[index]

        if (Array.isArray(group) && group.length > 0) {
          const processed = processLegacyMedia(group as Media[])
          if (processed.video || processed.image) {
            slides.push({
              key: `media-${index}`,
              video: processed.video,
              image: processed.image
            })
          }
        } else if (group && typeof group === 'object' && 'url' in group) {
          const processed = processLegacyMedia([group as unknown as Media])
          if (processed.video || processed.image) {
            slides.push({
              key: `media-${index}`,
              video: processed.video,
              image: processed.image
            })
          }
        }
      }
    }
  }

  return slides
})

const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '0 Min'
  const hrs = Math.floor(minutes / 60)
  const min = minutes % 60
  return `${hrs > 0 ? `${hrs} Hrs` : ''} ${min > 0 ? `${min} Min` : ''}`.trim()
}

const hiddenChips = computed(() => {
  if (visibleChips.value.length <= 1) {
    return allChips.value.slice(1)
  }
  return allChips.value.slice(visibleChips.value.length)
})

const hiddenChipsCount = computed(() => {
  return hiddenChips.value.length
})

const swiperRef = ref<any>(null)
const activeIndex = ref(0)

const imageLoadedMap = ref<Record<string, boolean>>({})

const handleVideoPlay = () => {
  swiperRef.value?.autoplay?.stop()
}
const handleVideoPause = () => {
  swiperRef.value?.autoplay?.start()
}

const onSlideChange = (swiper: any) => {
  activeIndex.value = swiper.activeIndex
}

const onCardClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (target?.closest('.play-button')) return

  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button === 1) {
    return
  }

  event.preventDefault()
  if (props.tour) {
    router.push(`/tour/${props.tour.slug || props.tour.id}`)
  }
}
</script>
<style lang="scss">
.tour-card {
  .swiper-container {
    --swiper-theme-color: #fff;
    border-radius: 8px !important;
    overflow: hidden;
  }

  swiper-slide {
    border-radius: 8px !important;
    overflow: hidden;
  }

  .swiper {
    border-radius: 8px !important;
    overflow: hidden;
  }

  .swiper-slide {
    height: 260px !important;
    border-radius: 8px !important;
    overflow: hidden;
  }

  @media screen and (max-width: 767px) {
    .swiper-slide {
      height: 189px !important;
    }
  }

  .swiper-pagination-bullet {
    width: 8px !important;
    height: 8px !important;
    margin: 0 5px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    border: none !important;
  }

  .swiper-pagination-bullet::after {
    content: '' !important;
    width: 8px !important;
    height: 8px !important;
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: 50% !important;
  }

  .swiper-pagination-bullet-active::after {
    background: white !important;
  }
}
</style>
