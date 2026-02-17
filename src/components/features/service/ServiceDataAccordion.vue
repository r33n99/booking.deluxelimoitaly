<template>
  <div
    class="relative -left-4 !mt-8 w-[calc(100%+32px)] self-stretch rounded-[30px] border border-[#EAEAEA] bg-[#F9F9F9] dark:border-[#333639] dark:bg-[#333639] xl:-left-6 xl:!mt-10 xl:w-[calc(100%+48px)] xl:rounded-[40px]"
  >
    <button
      @click="$emit('toggle')"
      class="flex h-[62px] w-full items-center justify-between px-4 text-xl/[22px] text-background dark:text-white xl:h-[74px] xl:px-8"
    >
      <span>Service data</span>
      <ChevronsDownIcon :class="{ 'rotate-180': isOpen }" />
    </button>

    <div
      v-if="isOpen"
      class="mx-4 space-y-8 border-t-[#DDE5DC] pb-[18px] dark:border-t-[#D9D9D9]/5 xl:mx-8 xl:space-y-10 xl:border-t-2 xl:pb-6 xl:pt-6"
    >
      <!-- TODO: Add vee-validate and yup -->
      <form action="" class="flex w-full flex-col gap-8 xl:gap-10">
        <div class="flex gap-8 max-xl:flex-col xl:gap-4">
          <div class="flex w-full flex-col gap-2 xl:w-auto">
            <span class="text-background dark:text-white">Number of passengers</span>
            <input
              data-testid="passengers"
              v-model="profile.number_of_passengers"
              @keypress="allowOnlyDigits"
              @input="handlePassengerInput"
              type="text"
              class="rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
              :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm"
              >Add any notes regarding the composition of the party in “Your notes” at the
              buttom.</span
            >
          </div>
          <div
            class="flex w-full flex-col gap-2 max-xl:border-t-2 max-xl:border-t-[#DDE5DC] max-xl:pt-8 dark:max-xl:border-t-[#D9D9D9]/5 xl:grow"
          >
            <span class="text-background dark:text-white">Main passenger</span>
            <input
              v-model="profile.main_passenger"
              type="text"
              placeholder="for example: They are my spouse, fiance, family, boss, colleague, client, etc"
              class="rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
              :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm"
              >If you are not the passenger yourself, please indicate the name(s) of the lead
              passenger(s), and in which relationship you are with them</span
            >
          </div>
          <div
            class="flex w-full flex-col gap-2 max-xl:border-t-2 max-xl:border-t-[#DDE5DC] max-xl:pt-8 dark:max-xl:border-t-[#D9D9D9]/5 xl:grow"
          >
            <span class="text-background dark:text-white">Language</span>
            <select
              v-model="profile.other_language"
              name="select"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:w-auto xl:text-lg"
              :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
            >
              <option value="English">English</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
            </select>
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm"
              >In our company all our chauffeurs are experienced and speak English if you prefer a
              different language please indicate it, if available we will take this into
              account</span
            >
          </div>
        </div>
        <div class="flex flex-col gap-8 xl:gap-10">
          <div
            class="flex gap-8 border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 max-lg:flex-col xl:gap-4 xl:pt-10"
          >
            <div class="flex w-full flex-col gap-2">
              <label class="text-background dark:text-white">Pick Up Location Specifics</label>
              <input
                v-model="profile.pickup_specific"
                type="text"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
                :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
              />
              <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm">
                If applicable please indicate arrival Flight/Train Number or GPS coordinates if
                needed (such as for Villas in the countriside or difficult to reach locations)
              </span>
            </div>
            <div
              class="flex w-full flex-col gap-2 max-lg:border-t-2 max-lg:border-t-[#DDE5DC] max-lg:pt-8 dark:max-lg:border-t-[#D9D9D9]/5"
            >
              <label class="text-background dark:text-white">Drop Off Location Specifics</label>
              <input
                v-model="profile.dropoff_specific"
                type="text"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
                :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
              />
              <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm">
                If applicable please indicate departure Flight/Train Number or GPS coordinates if
                needed (such as for Villas in the countriside or difficult to reach locations)
              </span>
            </div>
          </div>
          <div
            class="flex gap-8 border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 max-lg:flex-col xl:gap-4 xl:pt-10"
          >
            <div class="relative flex w-full flex-col justify-between gap-2">
              <div class="flex flex-col gap-2">
                <p class="text-base text-background dark:text-white">
                  Regular suitcases (medium/large)
                </p>
                <label
                  for="large-luggage"
                  class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
                  >Regular suitcases are Medium and Large Suitcases of 25-32 inches (63-81 cm).
                  Indicate in “Your notes” below the number of eventual Extra Large ones, unusal
                  size pieces, mobility devices, sport equipment etc.</label
                >
              </div>
              <div class="relative" :class="{ 'pointer-events-none opacity-60': !isEditable }">
                <input
                  v-model.number="luggages.large.current"
                  type="text"
                  id="large-luggage"
                  name="large-luggage"
                  class="w-full rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
                  :class="{ '!text-[#878787]': !isEditable }"
                  @input="validateInput($event, 'large')"
                />

                <button
                  @click="decrementValue('large')"
                  type="button"
                  class="absolute left-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main xl:left-1.5 xl:top-1.5 xl:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0">–</p>
                </button>
                <button
                  data-testid="button-plus"
                  @click="incrementValue('large')"
                  type="button"
                  class="absolute right-1 top-1 flex size-11 origin-center items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main xl:right-1.5 xl:top-1.5 xl:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0">+</p>
                </button>
              </div>
            </div>
            <div class="relative flex w-full flex-col justify-between gap-2">
              <div class="flex flex-col gap-2">
                <p class="text-base text-background dark:text-white">Small pieces of Luggage</p>
                <label
                  for="small-luggage"
                  class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
                  >Small or Carry on luggage shoud not exceed 22 inches (55 cm). No need to indicate
                  hadbags, computer bags or small packpacks.</label
                >
              </div>
              <div class="relative" :class="{ 'pointer-events-none opacity-60': !isEditable }">
                <input
                  v-model.number="luggages.small.current"
                  type="text"
                  id="small-luggage"
                  name="small-luggage"
                  class="w-full rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
                  :class="{ '!text-[#878787]': !isEditable }"
                  @input="validateInput($event, 'small')"
                />

                <button
                  @click="decrementValue('small')"
                  type="button"
                  class="absolute left-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main xl:left-1.5 xl:top-1.5 xl:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0">–</p>
                </button>
                <button
                  @click="incrementValue('small')"
                  type="button"
                  class="absolute right-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main xl:right-1.5 xl:top-1.5 xl:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0">+</p>
                </button>
              </div>
            </div>
          </div>
          <div class="flex w-full flex-col gap-2">
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] xl:text-sm">Your notes</span>
            <input
              v-model="profile.description"
              type="text"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white xl:text-lg"
              :class="{ 'pointer-events-none !text-[#878787] opacity-60': !isEditable }"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm">
              Type here any note or additional instruction which would help in correctly performing
              the service, including additional data on party composition, types of suitcases or any
              requirement.
            </span>
          </div>
        </div>
      </form>
      <button
        class="button inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[37px] bg-main px-4 py-3 font-semibold leading-tight text-background xl:h-16 xl:text-lg"
        :disabled="isSubmitting"
        @click="toggleEditMode"
      >
        <LoadingSpinner
          v-if="isSubmitting"
          class="size-[18px] animate-spin stroke-[#2B2D32] md:size-6"
        />
        <span v-else>{{ isEditable ? 'Save' : 'Edit' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ChevronsDownIcon from '@/components/ui/icons/ChevronsDownIcon.vue'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import { useRidesHistoryStore } from '@/stores/ride/history'
import type { RideHistoryItem } from '@/types/stores/ride/history'
import type { AxiosInstance } from 'axios'

interface LuggageState {
  current: number
  max: number
}

interface LuggageCollection {
  large: LuggageState
  small: LuggageState
}

interface ProfileState {
  number_of_passengers: number | ''
  main_passenger: string | null
  other_language: string
  pickup_specific: string | null
  dropoff_specific: string | null
  number_suitcases: string | null
  description: string | null
}

interface ServiceDataAccordionProps {
  rideIndex: number
  ride: RideHistoryItem
  isOpen?: boolean
}

const props = withDefaults(defineProps<ServiceDataAccordionProps>(), {
  isOpen: false
})

const emit = defineEmits<{ (event: 'toggle'): void }>()

const axios = inject<AxiosInstance | undefined>('axios')

const ridesHistoryStore = useRidesHistoryStore()
const { rides } = storeToRefs(ridesHistoryStore)

const profile = ref<ProfileState>({
  number_of_passengers: 1,
  main_passenger: null,
  other_language: 'English',
  pickup_specific: null,
  dropoff_specific: null,
  number_suitcases: null,
  description: null
})

const isEditable = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const luggages = ref<LuggageCollection>({
  large: {
    current: 0,
    max: 30
  },
  small: {
    current: 0,
    max: 30
  }
})

const updateLuggages = (dataString: string) => {
  dataString.split('; ').forEach((item) => {
    const [key, value] = item.split(': ')
    const luggageKey = key.toLowerCase() as keyof LuggageCollection
    if (luggages.value[luggageKey]) {
      const numericValue = Number.parseInt(value, 10)
      luggages.value[luggageKey].current = Number.isNaN(numericValue) ? 0 : numericValue
    }
  })
}

const validateInput = (event: Event, type: keyof LuggageCollection) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  const cleanedValue = target.value.replace(/\D/g, '')
  const numericValue = Number.parseInt(cleanedValue, 10)

  if (Number.isNaN(numericValue)) {
    luggages.value[type].current = 0
    return
  }

  luggages.value[type].current = Math.min(numericValue, luggages.value[type].max)
}

const decrementValue = (type: keyof LuggageCollection) => {
  const current = luggages.value[type].current
  luggages.value[type].current = Math.max(0, current - 1)
}

const incrementValue = (type: keyof LuggageCollection) => {
  const current = luggages.value[type].current
  luggages.value[type].current = Math.min(current + 1, luggages.value[type].max)
}

const allowOnlyDigits = (event: KeyboardEvent) => {
  const isDigit = /\d/.test(event.key)
  const isControlKey = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)
  if (!isDigit && !isControlKey) {
    event.preventDefault()
  }
}

const handlePassengerInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  const cleanedValue = target.value.replace(/\D/g, '')
  profile.value.number_of_passengers = cleanedValue === '' ? '' : Number.parseInt(cleanedValue, 10)
}

const persistProfile = async () => {
  if (!axios) {
    return
  }

  const passengers =
    typeof profile.value.number_of_passengers === 'number' && profile.value.number_of_passengers > 0
      ? profile.value.number_of_passengers
      : 1

  const payload = {
    ...profile.value,
    number_of_passengers: passengers,
    number_suitcases: `Large: ${luggages.value.large.current}; Small: ${luggages.value.small.current}`,
    service: 1
  }

  isSubmitting.value = true
  try {
    const dealId = props.ride.deal_id
    if (!dealId || dealId === 'null' || dealId === 'undefined' || dealId === '0' || dealId === 0) {
      console.warn(
        '[ServiceDataAccordion] Skipping persistProfile: deal_id is invalid or missing:',
        dealId
      )
      ridesHistoryStore.updateRide(props.rideIndex, payload)
      profile.value.number_suitcases = payload.number_suitcases
      return
    }

    const dealIdString = String(dealId).trim()
    if (!dealIdString) {
      console.warn('[ServiceDataAccordion] Skipping persistProfile: deal_id is empty string')
      ridesHistoryStore.updateRide(props.rideIndex, payload)
      profile.value.number_suitcases = payload.number_suitcases
      return
    }

    await axios.post(`/profileCompletion/${dealIdString}`, payload)
    ridesHistoryStore.updateRide(props.rideIndex, payload)
    profile.value.number_suitcases = payload.number_suitcases
    profile.value.number_of_passengers = payload.number_of_passengers
  } finally {
    isSubmitting.value = false
  }
}

const toggleEditMode = async () => {
  if (isEditable.value) {
    await persistProfile()
    isEditable.value = false
  } else {
    isEditable.value = true
  }
}

const syncProfileFromRide = () => {
  const ride = props.ride
  const toNullableString = (value: unknown): string | null => {
    if (value == null) {
      return null
    }
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    return null
  }

  const toPassengerCount = (value: unknown): number | '' => {
    if (value === '' || value == null) {
      return ''
    }
    const numeric = Number.parseInt(String(value), 10)
    return Number.isNaN(numeric) ? '' : numeric
  }

  profile.value = {
    number_of_passengers: toPassengerCount(ride?.number_of_passengers ?? 1) || 1,
    main_passenger: toNullableString(ride?.main_passenger),
    other_language: toNullableString(ride?.other_language) ?? 'English',
    pickup_specific: toNullableString(ride?.pickup_specific),
    dropoff_specific: toNullableString(ride?.dropoff_specific),
    number_suitcases: toNullableString(ride?.number_suitcases),
    description: toNullableString(ride?.description)
  }

  if (profile.value.number_suitcases) {
    updateLuggages(profile.value.number_suitcases)
  } else {
    luggages.value.large.current = 0
    luggages.value.small.current = 0
  }
}

onMounted(() => {
  syncProfileFromRide()
})

watch(
  () => rides.value?.[props.rideIndex],
  (updatedRide) => {
    if (updatedRide) {
      syncProfileFromRide()
    }
  }
)
</script>
