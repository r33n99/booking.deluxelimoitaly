<template>
  <div class="w-full">
    <!-- Booking Info Expandable Panel -->
    <transition name="booking-info">
      <div
        v-if="bookingInfo"
        class="grid w-full grid-cols-3 overflow-y-auto rounded-t-[14px] bg-white p-6 dark:bg-[#272729] md:max-h-[500px] md:p-12 2xl:max-h-max"
      >
        <div class="col-span-2 md:col-span-1">
          <div class="max-w-[292px]">
            <p class="mb-9 flex flex-col gap-y-[10px]">
              <span class="text-[#8D8D8D] md:text-[16px]/[110%]">Final</span>
              <span class="text-[24px]/[110%] font-bold md:text-[32px]/[110%]">
                {{ priceService.formatPrice(totalPrice) }} EUR
              </span>
            </p>
            <span class="text-[#8D8D8D] lg:text-[18px]/[138%]">
              The words of the Romantic poet Lord Byron, written more than two centuries ago, still
              worthily represent one of the most beautiful countries of the world. And we at
              Inspiritaly are here to drive you through this magic that inspired world-known poets
              and artists, in a deep and Italian-passioned spirit.
            </span>
          </div>
        </div>

        <div class="col-span-3 mt-6 md:col-span-2 md:mt-0">
          <div
            class="rounded-[14px] border-2 border-transparent bg-[#F2F2F2] dark:border-[#1B1B1B] dark:bg-[#1B1B1B80]"
          >
            <!-- Header -->
            <div
              class="grid grid-cols-3 border-b-2 border-[#1B1B1B] px-[18px] py-5 dark:border-[#1B1B1B]"
            >
              <p class="text-14 md:text-16 col-span-1 font-light text-black dark:text-[#8D8D8D]">
                Service
              </p>
              <p class="text-14 md:text-16 col-span-1 font-light text-black dark:text-[#8D8D8D]">
                Price per participant
              </p>
              <p
                class="text-14 md:text-16 col-span-1 text-end font-light text-black dark:text-[#8D8D8D]"
              >
                Total
              </p>
            </div>

            <!-- Basic Tour -->
            <div
              class="grid grid-cols-3 gap-x-3 border-b-2 border-white/40 px-[18px] py-5 dark:border-[#1B1B1B]"
            >
              <p class="text-16 md:text-20 col-span-1 font-medium">Basic Tour</p>
              <p class="text-16 md:text-24 col-span-1 font-medium text-black dark:text-[#FFFFFF80]">
                {{ priceService.formatPrice(basicTourPricePerPerson) }} EUR
              </p>
              <p
                class="text-16 md:text-24 col-span-1 text-end font-medium text-black dark:text-[#FFFFFF80]"
              >
                {{ priceService.formatPrice(basicTourPriceTotal) }} EUR
              </p>
            </div>

            <!-- Addons -->
            <template v-for="addon in addonsList" :key="addon.id">
              <div
                v-if="!isBaseAddon(addon)"
                class="grid grid-cols-3 gap-x-3 border-b-2 border-white/40 px-[18px] py-5 dark:border-[#1B1B1B]"
              >
                <p class="col-span-1 text-[16px] md:text-[20px]">{{ addon.name }}</p>
                <p class="col-span-1 text-[16px] text-black dark:text-[#FFFFFF80] md:text-[20px]">
                  {{ getPriceWithSign(addon) }}
                </p>
                <p
                  class="col-span-1 text-end text-[16px] text-black dark:text-[#FFFFFF80] md:text-[20px]"
                >
                  {{ getPriceWithSign(addon, true) }}
                </p>
              </div>
            </template>
          </div>

          <!-- Participants Control in Expandable -->
          <div
            class="mt-6 flex items-center justify-between gap-4 rounded-[14px] border-2 border-transparent bg-[#F2F2F2] px-[18px] py-3 dark:border-[#1B1B1B] dark:bg-[#1B1B1B80] max-sm:flex-col"
          >
            <p class="text-[20px] font-medium">Amount of participants</p>
            <div class="flex w-full flex-row items-center gap-x-4 sm:max-lg:w-max xl:w-max">
              <button
                @click="emit('decrease-participants')"
                class="cursor-pointer rounded-full bg-[#0B0B0B]/50 p-4 dark:bg-[#0B0B0B] max-sm:w-full sm:px-[52px] lg:px-[68px] lg:py-5 lg:max-xl:w-full"
              >
                <minus-icon class="mx-auto stroke-white" />
              </button>
              <p class="text-[18px] font-medium text-black dark:text-white lg:text-[24px]">
                {{ participants }}
              </p>
              <button
                @click="emit('increase-participants')"
                class="cursor-pointer rounded-full bg-[#0B0B0B]/50 p-4 dark:bg-[#0B0B0B] max-sm:w-full sm:px-[52px] lg:px-[68px] lg:py-5 lg:max-xl:w-full"
              >
                <plus-icon class="mx-auto stroke-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bar Header (Selected Addons + Toggle) -->
    <div
      class="relative flex w-full flex-wrap justify-between gap-y-3 bg-white px-6 py-4 dark:bg-[#333639]"
      :class="bookingInfo ? 'rounded-t-0' : 'rounded-t-[14px]'"
    >
      <div class="flex max-w-full flex-wrap gap-[6px] overflow-hidden">
        <template v-for="(addon, index) in visibleAddons" :key="index">
          <div
            class="border-1 rounded-lg border-[#0B0B0B] bg-[#151515] px-4 text-[#C8C8C8] xl:text-nowrap"
          >
            <p>{{ addon.name }}</p>
          </div>
        </template>

        <div
          v-if="hiddenAddonsCount > 0"
          class="border-1 group cursor-pointer rounded-lg border-[#0B0B0B] bg-[#151515] px-4 text-[#C8C8C8] xl:text-nowrap"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
        >
          <p>+{{ hiddenAddonsCount }}</p>

          <div
            v-if="showTooltip"
            class="absolute bottom-full left-0 z-50 mt-1 min-w-max rounded-lg border border-[#0B0B0B] bg-[#151515] p-2 shadow-lg md:left-1/2"
          >
            <div
              v-for="(addon, index) in hiddenAddons"
              :key="index"
              class="max-w-[300px] text-wrap px-2 py-1"
            >
              <p>{{ addon.name }}</p>
            </div>
          </div>
        </div>
      </div>
      <div @click="toggleBookingInfo" class="rounded-[48px] bg-main">
        <div class="flex cursor-pointer flex-row items-center gap-x-[10px] px-3">
          <span class="text-black">Booking information</span>
          <arrow-down-outlined-icon
            :class="{ 'rotate-180': !bookingInfo }"
            class="transform stroke-black transition-all duration-300"
          />
        </div>
      </div>
    </div>

    <!-- Main Bar Content -->
    <div
      class="flex w-full gap-y-2 rounded-b-[12px] bg-main px-6 py-5 max-xl:flex-col xl:justify-between xl:gap-x-5"
    >
      <!-- Date Picker -->
      <div
        class="relative flex w-full flex-row items-center justify-center xl:max-w-[9.5rem] xl:flex-col"
        :translate="'no'"
      >
        <div class="max-w-[6.5rem] md:max-w-[8rem] xl:max-w-[9.5rem]">
          <VueDatePicker
            ref="datepicker"
            v-model="modelDate"
            :enable-time-picker="false"
            :auto-apply="true"
            :format="'dd.MM.yyyy'"
            :hide-input-icon="true"
            :clearable="false"
            min-date="today"
          />
        </div>
        <span
          v-show="!modelDate"
          @click="openCalendar"
          class="text-22 leading-24 absolute inset-0 flex cursor-pointer items-center justify-center font-medium text-background"
        >
          Select date
          <calendar-icon class="fill-current ml-2 h-5 w-5" />
        </span>
      </div>

      <div class="rounded-2xl border-b-[4px] border-black/20 xl:border-b-0 xl:border-r-[4px]"></div>

      <!-- Participants -->
      <div class="relative flex flex-col justify-between gap-y-[6px] xl:text-center">
        <span class="text-[12px]/[138%] text-background xl:text-[14px]/[138%]"
          >Amount of participants</span
        >
        <div class="relative z-10 flex flex-row justify-between gap-x-5 xl:justify-center">
          <button
            @click="emit('decrease-participants')"
            class="relative z-10 cursor-pointer rounded-full bg-white/40"
          >
            <minus-icon class="stroke-black" />
          </button>
          <p class="text-[18px] font-medium text-background lg:text-[24px]">
            {{ participants }}
          </p>
          <button
            @click="emit('increase-participants')"
            class="relative z-10 cursor-pointer rounded-full bg-white/40"
          >
            <plus-icon class="stroke-black" />
          </button>
        </div>
      </div>

      <div class="rounded-2xl border-b-[4px] border-black/20 xl:border-b-0 xl:border-r-[4px]"></div>

      <!-- Duration -->
      <div
        class="flex flex-row items-center justify-between gap-y-[6px] xl:flex-col xl:text-center"
      >
        <span class="text-[12px]/[138%] text-background xl:text-[14px]/[138%]">Total duration</span>
        <p class="text-[18px] font-medium leading-[110%] text-background lg:text-[24px]">
          {{ formattedDuration }}
        </p>
      </div>

      <div class="rounded-2xl border-b-[4px] border-black/20 xl:border-b-0 xl:border-r-[4px]"></div>

      <!-- Total Price -->
      <div
        class="flex flex-row items-center justify-between gap-y-[6px] xl:flex-col xl:text-center"
      >
        <span class="text-[12px]/[138%] text-background xl:text-[14px]/[138%]">Total price</span>
        <p class="text-[18px] font-medium leading-[110%] text-background lg:text-[24px]">
          € {{ priceService.formatPrice(totalPrice) }}
        </p>
      </div>

      <div class="rounded-2xl border-b-[4px] border-black/20 xl:border-b-0 xl:border-r-[4px]"></div>

      <!-- Price per person -->
      <div
        class="flex flex-row items-center justify-between gap-y-[6px] xl:flex-col xl:text-center"
      >
        <span class="text-[12px]/[138%] text-background xl:text-[14px]/[138%]"
          >Price per participant</span
        >
        <p
          class="text-nowrap text-[18px] font-medium leading-[110%] text-background lg:text-[24px]"
        >
          € {{ priceService.formatPrice(pricePerParticipant) }} P/P
        </p>
      </div>

      <div
        class="hidden rounded-2xl border-b-[4px] border-black/20 xl:block xl:border-b-0 xl:border-r-[4px]"
      ></div>

      <!-- Book Button -->
      <button
        @click="emit('book')"
        class="book-now-button button mt-4 select-none items-center !text-[20px] xl:mt-0 xl:w-full xl:max-w-[191px] xl:!text-[24px]"
        data-testid="book-now"
      >
        Book Now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import ArrowDownOutlinedIcon from '@/components/ui/icons/ArrowDownOutlinedIcon.vue'
import MinusIcon from '@/components/ui/icons/MinusIcon.vue'
import PlusIcon from '@/components/ui/icons/PlusIcon.vue'
import CalendarIcon from '@/components/ui/icons/CalendarIcon.vue'
import { PriceCalculationService } from '@/utils/priceCalculationService'
import type { Addon } from '@/types/tours'

const props = defineProps<{
  participants: number
  totalPrice: number
  pricePerParticipant: number
  formattedDuration: string
  addons: Record<string | number, any>
  tour: any
  basicTourPriceTotal: number
  basicTourPricePerPerson: number
  isBaseAddon: (addon: any) => boolean
  getPriceWithSign: (addon: any, isTotal?: boolean) => string
}>()

const emit = defineEmits<{
  (e: 'update:date', value: Date | null): void
  (e: 'increase-participants'): void
  (e: 'decrease-participants'): void
  (e: 'book'): void
}>()

const modelDate = defineModel<Date | null>('date')
const bookingInfo = ref(false)
const showTooltip = ref(false)
const priceService = PriceCalculationService
const MAX_VISIBLE_CHARS = 100
const datepicker = ref<any>(null)

const toggleBookingInfo = () => {
  bookingInfo.value = !bookingInfo.value
}

const openCalendar = () => {
  try {
    if (datepicker.value) {
      // В v11+ используется openMenu, toggleMenu может отсутствовать
      if (typeof datepicker.value.openMenu === 'function') {
        datepicker.value.openMenu()
      } else if (typeof datepicker.value.toggleMenu === 'function') {
        datepicker.value.toggleMenu()
      }
    }
  } catch (error) {
    // Component may be unmounted
    console.warn('DatePicker component may be unmounted:', error)
  }
}

defineExpose({
  openCalendar
})

const addonsList = computed(() => Object.values(props.addons))

const visibleAddons = computed(() => {
  if (!addonsList.value) return []
  let totalChars = 0
  const visible = []
  for (const addon of addonsList.value) {
    const addonLength = (addon as Addon).name.length
    if (totalChars + addonLength <= MAX_VISIBLE_CHARS) {
      visible.push(addon)
      totalChars += addonLength + 4
    } else {
      break
    }
  }
  return visible
})

const hiddenAddons = computed(() => {
  if (!addonsList.value) return []
  let totalChars = 0
  const hidden = []
  for (const addon of addonsList.value) {
    const addonLength = (addon as Addon).name.length
    if (totalChars + addonLength <= MAX_VISIBLE_CHARS) {
      totalChars += addonLength + 4
    } else {
      hidden.push(addon)
    }
  }
  return hidden
})

const hiddenAddonsCount = computed(() => hiddenAddons.value.length)
</script>

<style lang="scss" scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 14px;
  color: gray;
}

:deep(.dp__input) {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #2b2d32 !important;
  border: none;
  background: transparent !important;
  text-align: left;
  padding: 0;
  outline: none;
  box-shadow: none;
  position: relative;
  z-index: 1;
}

:deep(.dp__pointer) {
  max-width: 6.5rem;
  width: auto;
}

@media (min-width: 768px) {
  :deep(.dp__pointer) {
    max-width: 8rem;
  }
}

@media (min-width: 1280px) {
  :deep(.dp__pointer) {
    max-width: 9.5rem;
  }
}

:deep(.dp__menu) {
  border-radius: 12px;
}

:deep(.dp__instance_calendar) {
  padding: 10px;
  border-radius: 12px;
}

:deep(.dp__active_date) {
  border-radius: 8px;
}

:deep(.dp__today) {
  border-radius: 8px;
}

:deep(.dp__overlay_cell_active) {
  border-radius: 8px;
}

@media screen {
  @media (min-width: 1024px) {
    :deep(.dp__input) {
      font-size: 24px !important;
    }
  }
}

.group:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Анимация для booking info */
@keyframes expandHeight {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
}

@keyframes collapseHeight {
  from {
    max-height: 1000px;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
  }
}

.booking-info-enter-active {
  animation: expandHeight 0.4s ease-out forwards;
}

.booking-info-leave-active {
  animation: collapseHeight 0.3s ease-in forwards;
}

/* Стили кнопки Book Now как в inspiritaly-frontend */
.book-now-button {
  border-radius: 44px;
  padding: 13px 28px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease-in-out;
  background-color: #1a1a1a;
  color: #fff;
  font-weight: 500;
  line-height: 24px;
}

.book-now-button:hover {
  background: #383838 !important;
  border-radius: 12px !important;
}

.book-now-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.book-now-button:focus {
  outline: none;
}
</style>
