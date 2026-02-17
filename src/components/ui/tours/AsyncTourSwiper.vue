<template>
  <div>
    <!-- Основной Swiper -->
    <Swiper
      @swiper="onMainSwiperInit"
      ref="mainSwiperComponent"
      @slideChange="onMainSlideChange"
      :allow-touch-move="false"
      :initial-slide="0"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false
      }"
      :style="{
        '--swiper-navigation-color': '#fff',
        '--swiper-pagination-color': '#fff'
      }"
      :loop="true"
      :spaceBetween="10"
      :thumbs="{ swiper: thumbsSwiper }"
      :slides-per-view="1"
      :modules="modules"
      class="mySwiper2 rounded-[14px]"
    >
      <SwiperSlide
        v-for="(slide, idx) in mainSlidesForDisplay"
        :key="idx"
        class="relative aspect-[4/3] h-full w-full overflow-hidden rounded-[14px] md:max-h-[550px]"
      >
        <tour-video-player
          v-if="slide?.video"
          @play="$emit('videoPlay')"
          @pause="$emit('videoPause')"
          :src="slide.video || ''"
          @load="imageLoadedMap[slide.video] = true"
          @error="imageLoadedMap[slide.video] = true"
          class="absolute inset-0 h-full w-full rounded-[14px] object-cover object-center"
        />
        <div
          v-if="!slide?.video && (!slide?.image || !imageLoadedMap[slide?.image])"
          class="absolute inset-0 h-full w-full rounded-[14px]"
        >
          <tour-skeleton class="h-full w-full" />
        </div>
        <img
          v-if="slide?.image && !slide?.video"
          :src="slide.image"
          :alt="`${tour?.name} - tour image`"
          class="absolute h-full w-full scale-100 rounded-[14px] object-cover object-center"
          @load="imageLoadedMap[slide.image] = true"
          @error="imageLoadedMap[slide.image] = true"
          loading="lazy"
        />
      </SwiperSlide>
    </Swiper>
    <!-- Превью -->
    <div class="relative mt-6">
      <template class="hidden xl:block">
        <button
          class="swiper-button-prev-custom bg-[#0E0D0D]/4 left-0 flex size-10 items-center justify-center rounded-r-lg backdrop-blur-md"
          @click="$emit('prevSlide')"
          aria-label="Предыдущий слайд"
        >
          <arrow-slide-icon class="h-5 rotate-180" />
        </button>
        <button
          class="swiper-button-next-custom bg-[#0E0D0D]/4 right-0 flex size-10 items-center justify-center rounded-l-lg backdrop-blur-md"
          @click="$emit('nextSlide')"
          aria-label="Следующий слайд"
        >
          <arrow-slide-icon class="h-5" />
        </button>
      </template>
      <Swiper
        ref="thumbsSwiperComponent"
        @swiper="setThumbsSwiper"
        :initial-slide="0"
        grab-cursor
        :spaceBetween="12"
        :breakpoints="{
          0: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            pagination: {
              el: '.custom-swiper-pagination',
              clickable: true
            }
          },
          1024: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            pagination: false
          }
        }"
        :freeMode="true"
        :modules="modules"
        class="mySwiper rounded-[14px]"
      >
        <SwiperSlide
          v-for="(slide, index) in secondarySlidesForDisplay"
          :key="index"
          class="relative cursor-pointer overflow-hidden rounded-[14px] brightness-50"
        >
          <div
            v-if="slide?.image && !imageLoadedMap[slide.image || index] && !slide?.video"
            class="h-full w-full rounded-[14px]"
          >
            <tour-skeleton class="aspect-[4/3] w-full lg:aspect-[16/9]" />
          </div>
          <tour-video-player
            only-view
            skeleton
            v-if="slide?.video"
            :src="slide.video || ''"
            @load="imageLoadedMap[slide.video || index] = true"
            @error="imageLoadedMap[slide.video || index] = true"
            class="aspect-[4/3] w-full rounded-[14px] object-cover object-bottom lg:aspect-[16/9]"
          >
            <template #skeleton>
              <tour-skeleton class="aspect-[4/3] w-full !bg-black lg:aspect-[16/9]" />
            </template>
          </tour-video-player>
          <img
            v-if="slide?.image && !slide?.video"
            v-show="imageLoadedMap[slide.image || index]"
            class="aspect-[4/3] w-full rounded-[14px] object-cover object-center lg:aspect-[16/9]"
            :alt="`${tour?.name} - tour image`"
            :src="slide.image"
            @load="imageLoadedMap[slide.image || index] = true"
            @error="imageLoadedMap[slide.image || index] = true"
          />
        </SwiperSlide>
      </Swiper>
      <div class="absolute bottom-[-30px] z-10 w-full">
        <div class="custom-swiper-pagination flex justify-center"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import ArrowSlideIcon from '@/components/ui/icons/ArrowSlideIcon.vue'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import type { Tour, MediaItem } from '@/types/tours'
import { useMedia } from '@/compose/useMedia'

type MediaLike = MediaItem | Record<string, unknown> | null | undefined

interface SlideData {
  key: string
  video: string
  image: string
}

const props = defineProps<{
  media: Array<MediaLike | MediaLike[]>
  tour: Tour
  imageLoadedMap: Record<string, boolean>
  isVideo: (slide: unknown) => boolean
}>()

const emit = defineEmits(['prevSlide', 'nextSlide', 'videoPlay', 'videoPause', 'swiperInit'])

const modules = [FreeMode, Navigation, Thumbs, Autoplay]
const mainSwiperComponent = ref(null)
const thumbsSwiperComponent = ref(null)
const thumbsSwiper = ref<any>(null)
const activeIndex = ref(0)

const { getMediaUrl, getVideoPreviewUrl, isVideoItem, isImageItem, IMAGE_SIZES } = useMedia()

const isMobile = computed(() => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false))

const getSlidesForDisplay = (
  tourMedia: Array<MediaLike | MediaLike[]>,
  sizes: number[]
): SlideData[] => {
  return (tourMedia || [])
    .map((item, index) => {
      if (item && typeof item === 'object' && 'id' in item && 'type' in item) {
        const mediaItem = item as MediaItem
        if (mediaItem.type === 'video') {
          // Для видео: video - это оригинальный URL видеофайла, image - это превью (poster)
          const videoUrl = getMediaUrl(mediaItem, IMAGE_SIZES.ORIGINAL)
          const posterUrl = mediaItem.has_preview
            ? getVideoPreviewUrl(mediaItem, IMAGE_SIZES.LARGE)
            : ''

          return {
            key: `video-${mediaItem.id}`,
            video: videoUrl,
            image: posterUrl
          }
        }

        // Для изображений
        const imageUrl = getMediaUrl(mediaItem, sizes[0] || IMAGE_SIZES.LARGE)

        return {
          key: `image-${mediaItem.id}`,
          video: '',
          image: imageUrl
        }
      }

      return null
    })
    .filter((slide): slide is SlideData => slide !== null)
}

const mainSlidesForDisplay = computed(() =>
  getSlidesForDisplay(props.media || props.tour?.media || [], [
    IMAGE_SIZES.XLARGE,
    IMAGE_SIZES.LARGE,
    IMAGE_SIZES.MEDIUM
  ])
)

const secondarySlidesForDisplay = computed(() =>
  getSlidesForDisplay(props.media || props.tour?.media || [], [
    IMAGE_SIZES.SMALL,
    IMAGE_SIZES.MEDIUM,
    IMAGE_SIZES.LARGE
  ])
)

const setThumbsSwiper = (swiper: any) => {
  thumbsSwiper.value = swiper
}

function onMainSwiperInit(swiper: any) {
  mainSwiperComponent.value = swiper
  emit('swiperInit', swiper)
}

function onMainSlideChange(swiper: any) {
  activeIndex.value = swiper.activeIndex
}
</script>

<style scoped>
.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  transition: background 0.3s;
}
</style>
