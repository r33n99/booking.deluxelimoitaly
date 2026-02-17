<template>
  <section v-if="tours.length > 0" class="best-tours-slider">
    <div class="mb-6 flex items-center justify-between lg:mb-8">
      <h2 class="text-[24px]/[110%] font-bold text-black dark:text-white lg:text-[32px]/[110%]">
        {{ title }}
      </h2>
      <div class="flex gap-2">
        <button
          @click="prevSlide"
          :disabled="isBeginning"
          class="swiper-btn-prev flex size-10 items-center justify-center rounded-full bg-[#F2F2F2] transition-all hover:bg-[#E0E0E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#1E1E20] dark:hover:bg-[#2A2A2C]"
          aria-label="Previous tours"
        >
          <arrow-slide-icon class="h-4 w-4 rotate-180 text-black dark:text-white" />
        </button>
        <button
          @click="nextSlide"
          :disabled="isEnd"
          class="swiper-btn-next flex size-10 items-center justify-center rounded-full bg-[#F2F2F2] transition-all hover:bg-[#E0E0E0] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#1E1E20] dark:hover:bg-[#2A2A2C]"
          aria-label="Next tours"
        >
          <arrow-slide-icon class="h-4 w-4 text-black dark:text-white" />
        </button>
      </div>
    </div>

    <Swiper
      @swiper="onSwiperInit"
      @slideChange="onSlideChange"
      :modules="modules"
      :spaceBetween="16"
      :slidesPerView="1"
      :breakpoints="{
        640: {
          slidesPerView: 2,
          spaceBetween: 16
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        1440: {
          slidesPerView: 4,
          spaceBetween: 24
        }
      }"
      :autoplay="
        autoplay
          ? {
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }
          : false
      "
      :loop="loop && tours.length > 4"
      :grabCursor="true"
      class="best-tours-swiper"
    >
      <SwiperSlide v-for="tour in tours" :key="tour.id">
        <tour-card
          :tour="tour"
          @click="handleTourClick(tour)"
          class="h-full cursor-pointer transition-transform hover:scale-[1.02]"
        />
      </SwiperSlide>

      <!-- Loading Skeleton -->
      <SwiperSlide v-if="loading">
        <tour-card-skeleton />
      </SwiperSlide>
    </Swiper>

    <!-- Pagination Dots (optional) -->
    <div v-if="showPagination" class="mt-6 flex justify-center">
      <div class="swiper-pagination-custom"></div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="mt-4 rounded-lg bg-red-50 p-4 text-center text-red-700 dark:bg-red-900/20 dark:text-red-300"
    >
      {{ errorMessage || 'Failed to load tours' }}
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper'
import TourCard from './TourCard.vue'
import TourCardSkeleton from './TourCardSkeleton.vue'
import ArrowSlideIcon from '../icons/ArrowSlideIcon.vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  tours: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Popular Tours'
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['tourClick', 'slideChange'])

const router = useRouter()
const modules = [Autoplay, Navigation, Pagination]
const swiperRef = ref(null)
const isBeginning = ref(true)
const isEnd = ref(false)

const onSwiperInit = (swiper) => {
  swiperRef.value = swiper
  updateNavigationState(swiper)
}

const onSlideChange = (swiper) => {
  updateNavigationState(swiper)
  emit('slideChange', swiper.activeIndex)
}

const updateNavigationState = (swiper) => {
  if (!swiper) return
  isBeginning.value = swiper.isBeginning
  isEnd.value = swiper.isEnd
}

const prevSlide = () => {
  if (swiperRef.value && !isBeginning.value) {
    swiperRef.value.slidePrev()
  }
}

const nextSlide = () => {
  if (swiperRef.value && !isEnd.value) {
    swiperRef.value.slideNext()
  }
}

const handleTourClick = (tour) => {
  emit('tourClick', tour)
  router.push(`/tour/${tour.id}`)
}

// Pause autoplay on hover
let hoverTimeout = null
const handleMouseEnter = () => {
  if (swiperRef.value?.autoplay) {
    swiperRef.value.autoplay.stop()
  }
}

const handleMouseLeave = () => {
  if (swiperRef.value?.autoplay) {
    hoverTimeout = setTimeout(() => {
      swiperRef.value.autoplay.start()
    }, 500)
  }
}

onUnmounted(() => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  if (swiperRef.value) {
    swiperRef.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
.best-tours-slider {
  :deep(.swiper) {
    overflow: visible;
  }

  :deep(.swiper-slide) {
    height: auto;
  }

  // Custom pagination styles
  .swiper-pagination-custom {
    display: flex;
    gap: 8px;
    justify-content: center;

    :deep(.swiper-pagination-bullet) {
      width: 8px;
      height: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background: rgba(0, 0, 0, 0.4);
      }

      &.swiper-pagination-bullet-active {
        width: 24px;
        border-radius: 4px;
        background: var(--color-main, #d97959);
      }
    }
  }

  // Dark mode
  :global(.dark) & {
    .swiper-pagination-custom {
      :deep(.swiper-pagination-bullet) {
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        &.swiper-pagination-bullet-active {
          background: var(--color-main, #d97959);
        }
      }
    }
  }
}
</style>
