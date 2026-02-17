<template>
  <section
    class="flex justify-between gap-7 rounded-[18px] bg-white py-7 dark:bg-[#2B2D32] max-xl:flex-col lg:p-12"
  >
    <h2 class="text-[28px] font-medium -tracking-[1px] max-lg:px-7">{{ props.data.title }}</h2>
    <div class="flex w-full flex-col gap-y-7 lg:gap-y-12 xl:max-w-[898px]">
      <div
        v-for="block in props.data.blocks"
        :key="block.id"
        :class="{
          'max-lg:px-7': block.type !== 'gallery',
          'space-y-6': block.data?.title
        }"
      >
        <h3
          v-if="block.data?.title"
          class="text-[20px] font-medium lg:text-[24px]"
          :class="{ 'max-lg:px-7': block.type === 'gallery' }"
        >
          {{ block.data.title }}
        </h3>

        <div
          v-if="block.type === 'text' && block.data?.description"
          v-safe-html="block.data.description"
          class="space-y-6 font-light text-[#8D8D8D] lg:text-[20px]"
        ></div>

        <blockquote v-if="block.type === 'quote'" class="relative pl-7 lg:pl-[30px]">
          <div class="absolute left-0 top-0 h-full w-2 rounded-r-2xl bg-main lg:w-2.5"></div>
          <div
            v-safe-html="block.data.description"
            class="space-y-6 font-light italic text-[#8D8D8D] lg:text-[20px]"
          ></div>
        </blockquote>

        <tour-video-player
          v-if="block.type === 'video'"
          :autoplay="false"
          :onlyView="false"
          :src="block.data.url"
          class="absolute inset-0 h-full max-h-[420px] w-full rounded-lg object-cover object-bottom"
        />

        <div
          v-if="block.type === 'gallery' && block.data.images"
          class="relative flex h-[305px] w-full flex-col"
        >
          <div class="relative h-full w-full">
            <Swiper
              ref="swiperRef"
              :slides-per-view="1.3"
              :space-between="12"
              :initial-slide="1"
              :centered-slides="true"
              :centered-slides-bounds="true"
              :pagination="{
                el: '.gallery-swiper-pagination',
                clickable: true
              }"
              :speed="500"
              :autoplay="{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: true
              }"
              :breakpoints="{
                1024: {
                  loop: true,
                  slidesPerView: 3,
                  spaceBetween: 36,
                  centeredSlides: false,
                  centeredSlidesBounds: false
                }
              }"
              :modules="modules"
              class="relative h-full w-full lg:rounded-[18px]"
              @swiper="
                (swiper: SwiperType) => {
                  swiper.update()
                  swiper.pagination.update()
                }
              "
            >
              <SwiperSlide v-for="image in block.data.images" :key="image">
                <img
                  :src="image"
                  alt="Изображение галереи"
                  class="absolute inset-0 h-[259px] w-full rounded-[18px] object-cover brightness-50"
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import { onMounted, ref, type Ref } from 'vue'
import type { SwiperModule, Swiper as SwiperType } from 'swiper/types'
import type { TourAboutContentData } from '@/components/ui/tours/types'

interface TourAboutContentProps {
  data: TourAboutContentData
  pagination?: boolean
}

const props = withDefaults(defineProps<TourAboutContentProps>(), {
  pagination: true
})

const modules: SwiperModule[] = [Pagination, Autoplay]
</script>

<style lang="scss">
.gallery-swiper-pagination {
  position: absolute !important;
  bottom: -30px !important;
  gap: 12px !important;
  .swiper-pagination-bullet {
    width: 12px !important;
    height: 12px !important;
    background: #a8a6a6 !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
  }
  .swiper-pagination-bullet-active {
    width: 12px !important;
    height: 12px !important;
    background: #ffffff !important;
  }
}
.swiper {
  background: transparent !important;
}
</style>
