<template>
  <div
    class="vehicle vehicle_popup mb-0 mt-[43px] flex-col !bg-white dark:!bg-background md:mt-0 md:w-fit"
    v-if="selectedCar"
  >
    <div class="vehicle__slider_wrapper mx-auto w-[calc(100%-32px)] md:w-[450px] md:rounded-[30px]">
      <div
        class="vehicle__slider_wrapper mx-auto w-[calc(100%-32px)] md:w-[450px] md:rounded-[30px]"
      >
        <picture>
          <source type="image/webp" :srcset="primaryImage.webp" />
          <img
            :src="primaryImage.original"
            alt=""
            class="vehicle__image p-[1rem]"
            width="600"
            height="400"
          />
        </picture>
      </div>
    </div>
    <div class="vehicle__content relative p-4 pb-0 xl:p-6 xl:pb-6">
      <div class="vehicle__name_wrapper">
        <p class="vehicle__name text-2xl leading-[26.4px] !text-black dark:!text-white">
          {{ selectedCar.slug_class_name }}
        </p>
      </div>
      <div class="vehicle__capability_wrapper mt-[20px] xl:mt-[18px]">
        <div class="vehicle__capability !mb-[5px]">
          <PassengersIcon v-if="!isMobile" />
          <PassengersMobileIcon v-if="isMobile" />
          <span
            class="vehicle__capability__text !text-dark_main dark:!text-main xl:text-base xl:leading-[17.6px]"
            >Max {{ selectedCar.max_passengers }} People</span
          >
        </div>
        <div class="vehicle__capability !mb-[5px]">
          <SeatsIcon v-if="!isMobile" />
          <SeatsMobileIcon v-if="isMobile" />
          <span
            class="vehicle__capability__text !text-dark_main dark:!text-main xl:text-base xl:leading-[17.6px]"
            >Max {{ selectedCar.max_luggage }} Suitcases</span
          >
        </div>
        <div class="vehicle__capability !mb-[5px]">
          <SeatsIcon v-if="!isMobile" />
          <SeatsMobileIcon v-if="isMobile" />
          <span
            class="vehicle__capability__text !text-dark_main dark:!text-main xl:text-base xl:leading-[17.6px]"
            >Max {{ selectedCar.max_hand_luggage }} hand luggage</span
          >
        </div>
      </div>
      <div class="vehicle__service_wrapper mt-[17px] xl:mt-[20px]">
        <span
          class="vehicle__service__text !text-black dark:!text-white xl:text-base xl:leading-[17.6px]"
          >Free Wi-Fi</span
        >
        <span class="ellipse"></span>
        <span
          class="vehicle__service__text !text-black dark:!text-white xl:text-base xl:leading-[17.6px]"
          >Mineral Water</span
        >
        <span class="ellipse"></span>
        <span
          class="vehicle__service__text !text-black dark:!text-white xl:text-base xl:leading-[17.6px]"
          >Meet&Greet</span
        >
      </div>
      <p
        class="vehicle__description mt-[20px] !text-placeholder xl:mt-4 xl:text-base xl:leading-[22.08px]"
      >
        Free 60 minutes wait time for airport pickups, 30 minutes for all others
      </p>
      <span
        class="mx-auto mb-2 mt-[37px] h-[5px] w-[148px] rounded-[100px] bg-sheets_item_color xl:hidden"
      ></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMobile } from '@/compose/ismobile'
import { storeToRefs } from 'pinia'
import { useCarsStore } from '@/stores/ride/cars'
import SeatsMobileIcon from '@/components/ui/icons/SeatsMobileIcon.vue'
import SeatsIcon from '@/components/ui/icons/SeatsIcon.vue'
import PassengersMobileIcon from '@/components/ui/icons/PassengersMobileIcon.vue'
import PassengersIcon from '@/components/ui/icons/PassengersIcon.vue'

const carsStore = useCarsStore()
const { selectedCar } = storeToRefs(carsStore)

const { isMobile } = useMobile()

const primaryImage = computed(() => {
  if (
    typeof selectedCar.value === 'number' ||
    !selectedCar.value ||
    !selectedCar.value.class_images?.length
  ) {
    return { original: '', webp: '' }
  }

  const carsUrl = import.meta.env.VITE_APP_API_URL.replace('/api', '/cars/')
  const firstImage = selectedCar.value.class_images[0]

  return {
    original: carsUrl + firstImage.original,
    webp: carsUrl + firstImage.webp
  }
})
</script>
