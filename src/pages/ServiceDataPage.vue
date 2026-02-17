<template>
  <div
    class="font-['Basier Circle'] relative w-full flex-col items-start justify-start gap-10 pt-10 font-normal text-white md:inline-flex"
  >
    <div
      v-if="isShowModal"
      @click="closeModal"
      class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-[#333639] bg-opacity-70 p-4"
    >
      <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
        <div class="flex justify-end p-4">
          <button
            @click="closeModal"
            aria-label="close"
            class="closeButton inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400"
            type="button"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fill-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 pt-0">
          <p>Main Passenger is required field</p>
        </div>
        <div class="border-t border-gray-600 p-6">
          <button
            @click="closeModal"
            type="button"
            class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
    <div class="flex w-full items-center justify-between">
      <div
        class="data_header mb-3 text-[40px] font-bold leading-none text-background dark:text-white md:text-[80px]"
      >
        Service data
      </div>
      <span class="flex shrink-0 gap-1 text-black dark:text-white"
        >Step
        <p class="text-main">5</p>
        of 5</span
      >
    </div>
    <div class="data_description">
      You are over 90% through the process. The below data is specifically related to the specific
      service.
    </div>
    <div class="mb-6 inline-flex w-full items-center justify-between gap-x-3">
      <div class="relative h-2 w-full">
        <div
          class="absolute left-0 top-0 h-2 w-full rounded-[99px] bg-dark_main/20 dark:bg-[#3D4043]"
        ></div>
        <div
          class="dgt-theme rlt-theme absolute left-0 top-0 h-2 w-[90%] rounded-[99px] bg-main"
        ></div>
      </div>
      <div
        class="dgt-theme-progress rlt-theme-progress shrink-0 text-center font-bold leading-snug text-main md:text-xl"
      >
        90 %
      </div>
    </div>
    <div
      class="flex flex-col items-start justify-start gap-8 self-stretch rounded-[40px] bg-white px-4 pb-3 pt-6 dark:bg-[#333639] sm:p-8 lg:gap-10"
    >
      <div class="text-base leading-relaxed text-background dark:text-white md:text-2xl">
        Service data
      </div>

      <!-- TODO: Add vee-validate and yup -->
      <form action="" class="flex w-full flex-col gap-8 lg:gap-10">
        <div class="flex gap-8 max-lg:flex-col lg:gap-4">
          <div class="flex w-full flex-col gap-2 md:w-auto">
            <span class="text-background dark:text-white">Number of passengers</span>
            <input
              data-testid="passengers"
              v-model.number="profile.number_of_passengers"
              @keypress="
                (e: any) => {
                  // number_of_passengers CAN'T BE NULL
                  if (e.charCode >= 48 && e.charCode <= 57) {
                    return true
                  } else {
                    e.preventDefault()
                  }
                }
              "
              @input="handlePassengerInput"
              type="text"
              class="rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
              >Add any notes regarding the composition of the party in “Your notes” at the
              buttom.</span
            >
          </div>
          <div
            class="flex w-full flex-col gap-2 max-lg:border-t-2 max-lg:border-t-[#DDE5DC] max-lg:pt-8 dark:max-lg:border-t-[#D9D9D9]/5 md:grow"
          >
            <span class="text-background dark:text-white">Passengers Name/Data</span>
            <input
              v-model="profile.main_passenger"
              type="text"
              placeholder="for example: They are my spouse, fiance, family, boss, colleague, client, etc"
              class="rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
              >If you are not the passenger yourself,<br />please indicate the name(s) of the lead
              passenger(s)</span
            >
          </div>
          <div
            class="flex w-full flex-col gap-2 max-lg:border-t-2 max-lg:border-t-[#DDE5DC] max-lg:pt-8 dark:max-lg:border-t-[#D9D9D9]/5 md:grow"
          >
            <span class="text-background dark:text-white">Language</span>
            <select
              v-model="profile.other_language"
              name="select"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:w-auto md:text-lg"
            >
              <option value="English">English</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
            </select>
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
              >In our company all our chauffeurs are experienced and speak English if you prefer a
              different language please indicate it</span
            >
          </div>
        </div>
        <div class="flex flex-col gap-8 lg:gap-10">
          <div
            class="flex gap-8 border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 max-md:flex-col md:gap-4 lg:pt-10"
          >
            <div class="flex w-full flex-col gap-2">
              <label class="text-background dark:text-white">{{ pickupSpecialText().title }}</label>
              <input
                v-model="profile.pickup_specific"
                type="text"
                data-testid="pickup-specifics"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
              <span
                class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
                v-if="pickupSpecialText().visibleText"
              >
                If applicable please indicate arrival Flight/Train Number or GPS coordinates if
                needed (such as for Villas in the countriside or difficult to reach locations)
              </span>
            </div>
            <div
              class="flex w-full flex-col gap-2 max-md:border-t-2 max-md:border-t-[#DDE5DC] max-md:pt-8 dark:max-md:border-t-[#D9D9D9]/5"
            >
              <label class="text-background dark:text-white">{{
                dropoffSpecialText().title
              }}</label>
              <input
                v-model="profile.dropoff_specific"
                type="text"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
              <span
                class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
                v-if="dropoffSpecialText().visibleText"
              >
                If applicable please indicate departure Flight/Train Number or GPS coordinates if
                needed (such as for Villas in the countriside or difficult to reach locations)
              </span>
            </div>
          </div>
          <div
            class="flex gap-8 border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 max-md:flex-col md:gap-4 lg:pt-10"
          >
            <div class="relative flex w-full flex-col justify-between gap-2">
              <div class="flex flex-col gap-2">
                <p class="text-base font-medium text-background dark:text-white">
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
              <div class="relative">
                <input
                  v-model.number="luggages.large.current"
                  type="text"
                  id="large-luggage"
                  name="large-luggage"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                  @input="validateInput($event, 'large')"
                />

                <button
                  @click="decrementValue('large')"
                  type="button"
                  class="absolute left-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:left-1.5 md:top-1.5 md:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0 h-[1px]">–</p>
                </button>
                <button
                  data-testid="button-plus"
                  @click="incrementValue('large')"
                  type="button"
                  class="absolute right-1 top-1 flex size-11 origin-center items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:right-1.5 md:top-1.5 md:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0 h-[1px]">+</p>
                </button>
              </div>
            </div>
            <div class="relative flex w-full flex-col justify-between gap-2">
              <div class="flex flex-col gap-2">
                <p class="text-base font-medium text-background dark:text-white">
                  Small pieces of Luggage
                </p>
                <label
                  for="small-luggage"
                  class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
                  >Small or Carry on luggage shoud not exceed 22 inches (55 cm). No need to indicate
                  hadbags, computer bags or small packpacks.</label
                >
              </div>
              <div class="relative">
                <input
                  v-model.number="luggages.small.current"
                  type="text"
                  id="small-luggage"
                  name="small-luggage"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                  @input="validateInput($event, 'small')"
                />

                <button
                  @click="decrementValue('small')"
                  type="button"
                  class="absolute left-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:left-1.5 md:top-1.5 md:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0 h-[1px]">–</p>
                </button>
                <button
                  @click="incrementValue('small')"
                  type="button"
                  class="absolute right-1 top-1 flex size-11 items-center justify-center rounded-full border border-transparent bg-main font-sans text-4xl font-extralight text-white duration-300 hover:scale-95 dark:border-[#3D4043] dark:bg-[#1E1E20] dark:text-[#5FD052] dark:text-main md:right-1.5 md:top-1.5 md:size-[51px]"
                >
                  <p class="absolute bottom-0 left-0 right-0 top-0 h-[1px]">+</p>
                </button>
              </div>
            </div>
          </div>
          <div class="flex w-full flex-col gap-2">
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm">Your notes</span>
            <input
              v-model="profile.description"
              type="text"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
            <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm">
              Type here any note or additional instruction which would help in correctly performing
              the service, including additional data on party composition, types of suitcases or any
              requirement.
            </span>
          </div>
          <div
            class="flex flex-col gap-5 border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 lg:pt-10"
          >
            <p class="leading-tight text-background dark:text-white md:text-xl">
              If we ran in shortage of availability for the model of vehile you selected,<br />
              would you mind if we dispatched a superior model as a complimentary upgrade?
            </p>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex cursor-pointer items-center">
                <input
                  v-model="profile.change_vehicle"
                  checked
                  id="default-radio-5"
                  type="radio"
                  value="No"
                  name="default-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-main bg-transparent text-main"
                />
                <label
                  for="default-radio-5"
                  class="ms-2 cursor-pointer text-sm text-background dark:text-white md:text-xl"
                  translate="no"
                  >No</label
                >
              </div>
              <div class="flex cursor-pointer items-center">
                <input
                  v-model="profile.change_vehicle"
                  id="default-radio-4"
                  type="radio"
                  value="Yes, I only want the vehicles I selected"
                  name="default-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-main bg-transparent text-main"
                />
                <label
                  for="default-radio-4"
                  class="ms-2 cursor-pointer text-sm text-background dark:text-white md:text-xl"
                  >Yes, I only want the vehicles I selected</label
                >
              </div>
              <div class="flex cursor-pointer items-center">
                <input
                  v-model="profile.change_vehicle"
                  id="default-radio-3"
                  type="radio"
                  value="Please advise me, before you dispatch a different vehicle"
                  name="default-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-main bg-transparent text-main"
                />
                <label
                  for="default-radio-3"
                  class="ms-2 cursor-pointer text-sm text-background dark:text-white md:text-xl"
                  >Please advise me, before you dispatch a different vehicle</label
                >
              </div>
            </div>
          </div>
        </div>
      </form>
      <form
        action=""
        class="w-full border-t-2 border-t-[#DDE5DC] pt-8 dark:border-t-[#D9D9D9]/5 lg:pt-10"
      >
        <div class="flex gap-5 max-md:flex-col md:items-center">
          <p class="leading-tight tracking-[-0.32px] text-background dark:text-white md:text-xl">
            Would you enjoy being notified by email with Driver Contact Data before the service?
          </p>
          <div class="flex flex-col gap-4 md:flex-row">
            <div class="flex cursor-pointer items-center gap-3">
              <input
                v-model="profile.contact_before_service"
                checked
                id="default-radio-9"
                type="radio"
                value="Yes"
                name="default-radio"
                class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-main bg-transparent text-main"
              />
              <label
                for="default-radio-9"
                class="cursor-pointer text-sm text-background dark:text-white md:text-xl"
                >Yes</label
              >
            </div>
            <div class="flex cursor-pointer items-center gap-3">
              <input
                v-model="profile.contact_before_service"
                id="default-radio-8"
                type="radio"
                value="No"
                name="default-radio"
                class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-main bg-transparent text-main"
              />
              <label
                for="default-radio-8"
                class="cursor-pointer text-sm text-background dark:text-white md:text-xl"
                translate="no"
                >No</label
              >
            </div>
          </div>
        </div>
      </form>
      <div
        class="button dgt-theme-btn rlt-theme-btn inline-flex h-16 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[37px] bg-main px-4 py-3"
        :class="{ 'pointer-events-none opacity-50': isSubmitting }"
        @click="handleSubmitClick"
      >
        <div class="cursor-default font-semibold leading-tight text-background md:text-lg">
          {{ isSubmitting ? 'Processing...' : 'Submit' }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useProfileCompletionStore } from '@/stores/user/profile_completion'
import { useOrderStore } from '@/stores/ride/order'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { onBeforeMount, ref } from 'vue'
import { trackGtmEvent } from '@/utils/gtm'
import type { OrderStore } from '@/stores/ride/order'
import type { ProfileCompletionStore } from '@/stores/user/profile_completion'
import type { PickupDropoffText, LuggageType, LuggageCounters } from '@/types/pages/serviceData'

const orderStore: OrderStore = useOrderStore()
const profileCompletionStore: ProfileCompletionStore = useProfileCompletionStore()
const router = useRouter()
const { profile, fromServiceData } = storeToRefs(profileCompletionStore)
const { orderData } = storeToRefs(orderStore)

const isSubmitting = ref(false)
const isShowModal = ref<boolean>(false)

const luggages = ref<LuggageCounters>({
  large: {
    current: 0,
    max: 30
  },
  small: {
    current: 0,
    max: 30
  }
})

const pickupSpecialText = (): PickupDropoffText => {
  if (orderData.value.mainTypes.pickup == 'airport')
    return { title: 'Arrival Flight information', visibleText: false }
  if (
    orderData.value.mainTypes.pickup == 'train_station' ||
    orderData.value.mainTypes.pickup == 'transit_station'
  )
    return { title: 'Arrival Train Information', visibleText: false }
  if (orderData.value.mainTypes.pickup == 'port')
    return { title: 'Arrival Ship Information', visibleText: false }
  return { title: 'Pick Up Location Specifics', visibleText: true }
}

const dropoffSpecialText = (): PickupDropoffText => {
  if (orderData.value.mainTypes.dropoff == 'airport')
    return { title: 'Departure Flight information', visibleText: false }
  if (
    orderData.value.mainTypes.dropoff == 'train_station' ||
    orderData.value.mainTypes.dropoff == 'transit_station'
  )
    return { title: 'Departure Train Information', visibleText: false }
  if (orderData.value.mainTypes.dropoff == 'port')
    return { title: 'Departure Ship Information', visibleText: false }
  return { title: 'Drop Off Location Specifics', visibleText: true }
}

const validateInput = (event: Event, type: LuggageType): void => {
  const input = event.target as HTMLInputElement | null
  if (!input) return
  const cleanedValue = input.value.replace(/\D/g, '')
  const numericValue = Math.min(Number(cleanedValue || 0), luggages.value[type].max)
  luggages.value[type].current = Number.isNaN(numericValue) ? 0 : numericValue
}

function decrementValue(type: LuggageType): void {
  const newValue = luggages.value[type].current - 1
  luggages.value[type].current = newValue >= 0 ? newValue : 0
}

function incrementValue(type: LuggageType): void {
  const newValue = luggages.value[type].current + 1
  luggages.value[type].current =
    newValue <= luggages.value[type].max ? newValue : luggages.value[type].max
}

function closeModal() {
  isShowModal.value = false
}

const handleSubmitClick = () => {
  if (isSubmitting.value) {
    return
  }

  submitProfile()
}

const submitProfile = async () => {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  const serviceType = orderData.value.type_of_service

  let funnel: string | undefined

  if (serviceType === 'oneWayTransfer' || serviceType === 'hourlyAsDirected') {
    funnel = serviceType === 'oneWayTransfer' ? 'one_way_transfer' : 'hourly_as_directed'
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: 6,
      booking_step_name: 'service_details'
    })
  }

  fromServiceData.value = true
  const passengers = Number(profile.value.number_of_passengers ?? 1)
  profile.value.number_of_passengers =
    Number.isNaN(passengers) || profile.value.number_of_passengers < 1 ? 1 : passengers

  profile.value.number_suitcases = `Large: ${luggages.value.large.current}; Small: ${luggages.value.small.current}`
  orderData.value.allowedPages['success'] = 1

  const dealId = orderData.value.deal_id

  // Если deal_id отсутствует, пропускаем profileCompletion, но переходим на success
  if (dealId === null || dealId === undefined) {
    try {
      await router.push('/success')
    } catch (error) {
      console.error('[ServiceDataPage] Ошибка при переходе на /success:', error)
    } finally {
      isSubmitting.value = false
    }
    return
  }

  const dealIdString = String(dealId)

  // Таймаут для отслеживания зависших промисов
  const timeoutId = setTimeout(() => {
    console.error('[ServiceDataPage] Timeout: profileCompletion не завершился за 30 секунд')
    router
      .push('/success')
      .catch((err) => {
        console.error('[ServiceDataPage] Ошибка принудительного перехода:', err)
      })
      .finally(() => {
        isSubmitting.value = false
      })
  }, 30000)

  try {
    await profileCompletionStore.profileCompletion(dealIdString, orderData.value.email ?? undefined)
    clearTimeout(timeoutId)
    await router.push('/success')
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('[ServiceDataPage] Ошибка при отправке профиля или переходе:', error)

    // Попытка перехода даже при ошибке
    try {
      await router.push('/success')
    } catch (routerError) {
      console.error('[ServiceDataPage] Ошибка при переходе на /success:', routerError)
    }
  } finally {
    isSubmitting.value = false
  }
}

const handlePassengerInput = (): void => {
  if (profile.value.number_of_passengers < 0 || Number.isNaN(profile.value.number_of_passengers)) {
    profile.value.number_of_passengers = 1
  }
}

onBeforeMount(() => {
  // Инициализация компонента
})
</script>
