<template>
  <div class="mt-10 rounded-[40px] bg-white p-8 pt-0 dark:bg-[#333639]">
    <Form
      @submit="handleSubmit"
      class="form"
      ref="HourlyAsDirectedForm"
      :validation-schema="hourlySchema"
      v-slot="{ errors, isSubmitting }"
    >
      <span v-if="isSubmitting">
        {{ errorFill(errors) }}
      </span>

      <div
        v-if="!isEmpty(errorOnForm) && isShowModal"
        @click="closeModal"
        class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
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
            <p v-for="error in errors" :key="error">{{ error }}</p>
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

      <div :class="['home_form home_form-2', 'active']">
        <Field name="pickup" v-slot="{ field }" v-model="agencyData.pickup">
          <TrustyComplete
            clearable
            v-model="pickupRef"
            class="w-full md:w-[calc(100%/3-8px)]"
            classname="input !py-[22px] m-0 !w-full"
            @get:suggestions="fetchSuggestions"
            @update:suggestions="updateSuggestions"
            @clear:input="clearInput('pickup')"
            @select:suggestions="selectSuggestions"
            :autoCompleteString="agencyData.pickup"
            :suggestions="data"
            v-bind="field"
            placeholder="Pick Up Location*"
          />
        </Field>
        <Field
          as="select"
          class="input m-0 !py-[24px] text-sm !text-[#878787] dark:text-white/50 md:text-lg"
          :class="errors.hours ? 'error' : ''"
          name="hours"
          v-model="hourly"
        >
          <option
            v-for="value in [2, 3, 4, 5, 6, 7, 8, 9, 10]"
            :key="value"
            :value="value"
            :selected="value === 2"
          >
            {{ value }} hours
          </option>
        </Field>
        <Field name="date_start" v-slot="{ field }" v-model="datePicker">
          <VueDatePicker
            ref="datePickerRef"
            class="input m-0 text-sm md:text-lg"
            auto-apply
            partial-flow
            :teleport-center="Boolean(ssid)"
            placeholder="Date / Time*"
            :class="errors.date_start ? 'error' : ''"
            :preview-format="dateFormat"
            :clearable="false"
            :format="dateFormat"
            :dark="mode === 'dark'"
            :light="mode === 'light'"
            v-bind="field"
            v-model="datePicker"
            @internal-model-change="handleInternal"
            @open="handleCalendarOpen"
            :min-date="minDate"
            :min-time="minTime"
          >
            <template #right-sidebar>
              <div
                v-if="datePicker"
                ref="timeOptionsContainer"
                class="overflow-y-scroll px-3 py-2"
                style="max-height: 300px"
              >
                <div
                  v-for="time in timeOptions"
                  :key="time"
                  @click="setTime(time)"
                  :class="[
                    'time-option cursor-pointer',
                    time === selectedTime ? 'time-selected' : ''
                  ]"
                >
                  {{ time }}
                </div>
              </div>
            </template>
          </VueDatePicker>
        </Field>
        <div
          :class="{ disabled_map: disabledMap }"
          class="route_toggle inline-flex h-[64.4px] w-full min-w-[98px] cursor-pointer items-center justify-center rounded-full !bg-[#EEF2EE] dark:!bg-[#2B2D32] md:h-[69.8px] md:w-auto"
          @click="toggleRouteMap"
        >
          <LocationIcon :active="pathHasPickupAndDropOff" />
        </div>
      </div>
      <RouteMap
        v-if="showRouteMap"
        :pickupRef="pickupRef"
        formName="Hourly"
        :form="HourlyAsDirectedForm"
      />
      <div class="mt-6 grid w-full grid-cols-12 gap-x-4 gap-y-10">
        <div class="col-span-12 flex flex-col lg:col-span-6">
          <p class="mb-4 text-2xl font-medium">
            Choose Vehicle Type<span class="text-red-500">*</span>
          </p>
          <Field name="car" v-model="agencyData.car">
            <div class="relative">
              <div
                @click="toggleDropdownVehicle"
                @blur="isOpenVehicle = false"
                @keydown="handleKeyDownDropdown($event, 'vehicle')"
                tabindex="0"
                class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              >
                <p v-if="!agencyData.car" class="text-[#878787]">Select</p>
                <p v-else>{{ agencyData.car.slug_class_name }}</p>
                <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
              </div>
              <div
                v-if="isOpenVehicle"
                class="absolute z-10 mt-2 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
              >
                <div
                  v-for="(option, idx) in carsList"
                  :key="getCarKey(option, idx)"
                  @mousedown.prevent="selectVehicle(option)"
                  @keydown.enter="selectVehicle(option)"
                  :tabindex="0"
                  :class="[
                    'cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white',
                    agencyData.car === option
                      ? 'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white'
                      : '',
                    focusedVehicleIndex === idx ? 'ring-2 ring-main' : ''
                  ]"
                  @focus="focusedVehicleIndex = idx"
                >
                  {{ option.slug_class_name }}
                </div>
              </div>
            </div>
          </Field>
        </div>
        <div class="col-span-12 flex flex-col lg:col-span-6">
          <p class="mb-4 text-2xl font-medium">Performance<span class="text-red-500">*</span></p>
          <Field name="performance" v-model="agencyData.performance">
            <div class="relative">
              <div
                @click="toggleDropdownPerformance"
                @blur="isOpenPerformance = false"
                @keydown="handleKeyDownDropdown($event, 'performance')"
                tabindex="0"
                class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              >
                <p v-if="!agencyData.performance" class="text-[#878787]">Select</p>
                <p v-else>{{ agencyData.performance }}</p>
                <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
              </div>
              <div
                v-if="isOpenPerformance"
                class="absolute z-10 mt-2 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
              >
                <div
                  v-for="(option, idx) in performances"
                  :key="option"
                  @mousedown.prevent="selectPerformance(option)"
                  @keydown.enter="selectPerformance(option)"
                  :tabindex="0"
                  :class="[
                    'cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white',
                    agencyData.performance === option
                      ? 'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white'
                      : '',
                    focusedPerformanceIndex === idx ? 'ring-2 ring-main' : ''
                  ]"
                  @focus="focusedPerformanceIndex = idx"
                >
                  {{ option }}
                </div>
              </div>
            </div>
          </Field>
        </div>
        <div
          class="col-span-12 text-base leading-relaxed text-background dark:text-white md:text-2xl"
        >
          Service data
        </div>
        <div class="col-span-12 flex flex-col gap-y-4 lg:col-span-4 xl:col-span-2">
          <span class="text-nowrap text-background dark:text-white"
            >Number of passengers<span class="text-red-500">*</span></span
          >
          <Field name="number_of_passengers" v-model="passengersInput">
            <input
              data-testid="passengers"
              v-model="passengersInput"
              @keypress="allowOnlyDigits"
              type="text"
              class="rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
          </Field>
          <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
            >Add any notes regarding the composition of the party in “Your notes” at the
            buttom.</span
          >
        </div>
        <div class="col-span-12 flex flex-col gap-y-4 lg:col-span-4 xl:col-span-5">
          <span class="text-background dark:text-white">Passengers Name/Data</span>
          <input
            v-model="agencyData.main_passenger"
            type="text"
            placeholder="for example: They are my spouse, fiance, family, boss, colleague, client, etc"
            class="rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
            >If you are not the passenger yourself,<br />please indicate the name(s) of the lead
            passenger(s)</span
          >
        </div>
        <div class="col-span-12 flex flex-col gap-y-4 lg:col-span-4 xl:col-span-5">
          <p class="font-medium">Language<span class="text-red-500">*</span></p>
          <Field name="other_language" v-model="agencyData.other_language">
            <div class="relative">
              <div
                @click="toggleDropdownLang"
                @blur="isOpenLang = false"
                @keydown="handleKeyDownDropdown($event, 'lang')"
                tabindex="0"
                class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              >
                <p v-if="!agencyData.other_language" class="text-[#878787]">Select</p>
                <p v-else>{{ agencyData.other_language }}</p>
                <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
              </div>
              <div
                v-if="isOpenLang"
                class="absolute z-10 mt-2 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
              >
                <div
                  v-for="(option, idx) in languages"
                  :key="option"
                  @mousedown.prevent="selectLang(option)"
                  @keydown.enter="selectLang(option)"
                  :tabindex="0"
                  :class="[
                    'cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white',
                    agencyData.other_language === option
                      ? 'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white'
                      : '',
                    focusedLangIndex === idx ? 'ring-2 ring-main' : ''
                  ]"
                  @focus="focusedLangIndex = idx"
                >
                  {{ option }}
                </div>
              </div>
            </div>
          </Field>
          <p class="text-sm text-[#C8C8C8]">
            In our company all our chauffeurs are experienced and speak English if you prefer a
            different language please indicate it, if available we will take this into account
          </p>
        </div>
        <div class="col-span-12 border-t-2 border-[#D9D9D90D]"></div>
        <div class="col-span-12 flex w-full flex-col gap-2">
          <label class="text-background dark:text-white">{{ pickupSpecialText().title }}</label>
          <input
            v-model="agencyData.pickup_specific"
            type="text"
            class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <span
            class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
            v-if="pickupSpecialText().visibleText"
          >
            If applicable please indicate arrival Flight/Train Number or GPS coordinates if needed
            (such as for Villas in the countriside or difficult to reach locations)
          </span>
        </div>
        <div class="col-span-12 border-t-2 border-[#D9D9D90D]"></div>
        <div class="relative col-span-12 flex w-full flex-col justify-between gap-2 lg:col-span-6">
          <div class="flex flex-col gap-2">
            <p class="text-base font-medium text-background dark:text-white">
              Regular suitcases (medium/large)
            </p>
            <label for="large-luggage" class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
              >Regular suitcases are Medium and Large Suitcases of 25-32 inches (63-81 cm). Indicate
              in “Your notes” below the number of eventual Extra Large ones, unusal size pieces,
              mobility devices, sport equipment etc.</label
            >
          </div>
          <div class="relative">
            <input
              v-model.number="luggages.large.current"
              type="text"
              id="large-luggage"
              name="large-luggage"
              class="w-full rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
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
        <div class="relative col-span-12 flex w-full flex-col justify-between gap-2 lg:col-span-6">
          <div class="flex flex-col gap-2">
            <p class="text-base font-medium text-background dark:text-white">
              Small pieces of Luggage
            </p>
            <label for="small-luggage" class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
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
              class="w-full rounded-[53px] border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
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
        <div class="col-span-12 flex w-full flex-col gap-2">
          <span class="mb-2 text-xs text-[#3D4043] dark:text-white md:text-[16px]">Your notes</span>
          <input
            v-model="agencyData.notes"
            type="text"
            class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <span class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm">
            Type here any note or additional instruction which would help in correctly performing
            the service, including additional data on party composition, types of suitcases or any
            requirement.
          </span>
        </div>

        <div class="col-span-12 flex flex-col gap-y-4 lg:col-span-6">
          <p class="text-2xl font-medium">Ride price<span class="text-red-500">*</span></p>
          <Field name="ride_price" v-model="amountInput">
            <input
              placeholder="Enter the amount"
              v-model="amountInput"
              type="text"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-5 py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
          </Field>
        </div>
        <div class="col-span-12 flex flex-col gap-y-4 lg:col-span-6">
          <p class="text-2xl font-medium">File number</p>
          <input
            v-model="agencyData.file_number"
            type="text"
            class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-5 py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
        </div>
      </div>
      <div class="next_step_button_wrapper !mt-10 !justify-end gap-4 md:flex-row md:gap-10">
        <button
          type="submit"
          class="next_step_button group disabled:text-black"
          :disabled="paymentStateStore.isLoading || !agencyData.car"
        >
          <loading-spinner
            v-show="paymentStateStore.isLoading && paymentStateStore.paymentMethod === 'card'"
            class="mr-1 group-hover:stroke-main"
          />
          {{
            paymentStateStore.isLoading && paymentStateStore.paymentMethod === 'card'
              ? 'Loading'
              : hasEnoughCredits
                ? 'Pay Now'
                : 'Next'
          }}
        </button>
        <button
          v-if="hasEnoughCredits"
          data-payment="credits"
          type="submit"
          class="next_step_button gap-x-2.5 !bg-transparent !text-main"
          :disabled="paymentStateStore.isLoading || !agencyData.car"
        >
          <loading-spinner
            v-show="paymentStateStore.isLoading && paymentStateStore.paymentMethod === 'credits'"
            class="mr-1 stroke-main"
          />
          <span>{{
            paymentStateStore.isLoading && paymentStateStore.paymentMethod === 'credits'
              ? 'Processing...'
              : 'Add to Monthly Bill'
          }}</span>
          <info-icon
            v-if="!paymentStateStore.isLoading || paymentStateStore.paymentMethod !== 'credits'"
            class="fill-main"
          />
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch, onUnmounted, computed, nextTick, type Ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import * as yup from 'yup'
import { Form, Field, type SubmissionHandler } from 'vee-validate'
import { storeToRefs } from 'pinia'
import { useMobile } from '@/compose/ismobile'
import { useDatePicker } from '@/compose/datePicker'
import LocationIcon from '@/components/ui/icons/LocationIcon.vue'
import { useFetcher } from '@/compose/axios'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import TrustyComplete from '@/components/ui/autocomplete/TrustyComplete.vue'
import RouteMap from '@/components/features/map/RouteMap.vue'
import InfoIcon from '@/components/ui/icons/InfoIcon.vue'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import { useCarsStore } from '@/stores/ride/cars'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import { useUserStore } from '@/stores/user/profile'
import { useConfirmingCreditBasedPaymentModalStore } from '@/stores/ui/confirmingCreditBasedPaymentModal'
import { usePaymentStateStore } from '@/stores/ui/paymentState'
import type { OrderData, MainTypes, UtmData } from '@/types/stores/ride/order'
import type { CarSummary } from '@/types/stores/ride/cars'
import type { AgencyData, User } from '@/types/stores/user/profile'
import type { AxiosInstance, AxiosResponse } from 'axios'

type DropdownType = 'vehicle' | 'performance' | 'lang'

interface LatLng {
  lat: number | null
  lng: number | null
}

interface PathValidity {
  pickup: boolean
  dropoff: boolean
}

interface PathStartFinish {
  pickup: LatLng
  dropoff: LatLng
  valid: PathValidity
}

interface AutocompleteSuggestion {
  description?: string
  place_id?: string
  selected?: boolean
  [key: string]: unknown
}

interface HourlyAgencyFormValues {
  pickup: string
  date_start: string | Date | null
  hours: number
  car: CarSummary | null
  performance: string
  number_of_passengers: string
  ride_price: string
  main_passenger: string | null
  other_language: string
  pickup_specific: string | null
  dropoff_specific: string | null
  notes: string | null
  file_number: string | null
}

interface UtilsPlugin {
  isEmpty: (value: unknown) => boolean
}

const trustyStore = useTrustyStore()

const { pickupRef, data, pathStartFinish, mainTypes } = storeToRefs(trustyStore) as {
  pickupRef: Ref<string>
  data: Ref<AutocompleteSuggestion[]>
  pathStartFinish: Ref<PathStartFinish>
  mainTypes: Ref<MainTypes>
}
const { fetchSuggestions, selectSuggestions, updateSuggestions, clearInput } = trustyStore

const utils = inject<UtilsPlugin | undefined>('utils')
const router = useRouter()
const { isMobile } = useMobile()

const regexLink = inject<RegExp>('regexLink')
const regexIsHttps = inject<RegExp>('regexIsHttps')

const disabledMap = ref<boolean>(false)

const mainStore = useMainStore()
const orderStore = useOrderStore()

const carsStore = useCarsStore()
const userStore = useUserStore()
const confirmingCreditBasedPaymentModalStore = useConfirmingCreditBasedPaymentModalStore()
const paymentStateStore = usePaymentStateStore()
const { agencyData, user, isLoggedIn } = storeToRefs(userStore) as {
  agencyData: Ref<AgencyData>
  user: Ref<User | null>
  isLoggedIn: Ref<boolean>
}

const hasEnoughCredits = computed(() => {
  const userValue = user.value
  if (
    userValue &&
    userValue.type === 'agency' &&
    (userValue.show_information === null || userValue.show_information === 2) &&
    userValue.agency_balance > 0
  ) {
    const enteredAmount = Number(agencyData.value.amount ?? 0)
    return enteredAmount <= userValue.agency_balance
  }
  return false
})

const { cars } = storeToRefs(carsStore) as { cars: Ref<CarSummary[] | null> }

const { mode, ssid } = storeToRefs(mainStore) as {
  mode: Ref<string>
  ssid: Ref<string | null>
}
const { orderData, orderId, fleet, orderType } = storeToRefs(orderStore) as {
  orderData: Ref<OrderData>
  orderId: Ref<string | number | null>
  fleet: Ref<unknown>
  orderType: Ref<string>
}

const hourly = ref<number>(orderData.value.hours ?? 2)
const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL }) as {
  axiosInstance: AxiosInstance
}

const {
  datePickerRef,
  minDate,
  minTime,
  datePicker,
  handleInternal,
  dateFormat,
  initialDate,
  timeSetFirstTime,
  timeOptions
} = useDatePicker()

const selectedTime = ref<string>('')
const isShowModal = ref<boolean>(true)
const errorOnForm = ref<Record<string, string | undefined> | null>(null)
const HourlyAsDirectedForm = ref<InstanceType<typeof Form> | null>(null)
const showRouteMap = ref<boolean>(false)
const timeOptionsContainer = ref<HTMLDivElement | null>(null)
const languages = ref<string[]>(['English', 'Italian', 'Spanish'])

const pathHasPickupAndDropOff = computed(() =>
  Boolean(pathStartFinish.value.valid.pickup && pathStartFinish.value.valid.dropoff)
)

watch(pickupRef, (val) => {
  agencyData.value.pickup = val
})

const performances = ref<string[]>([
  'Chauffeur',
  'Driver/Guide',
  'Specialized Driver/Guide',
  'Assistant/Tour Escort',
  'Tour Guide'
])
interface SuitcaseCounts {
  large: number
  small: number
}

const luggages = ref<{
  large: { current: number; max: number }
  small: { current: number; max: number }
}>({
  large: {
    current: 0,
    max: 30
  },
  small: {
    current: 0,
    max: 30
  }
})
const isOpenVehicle = ref<boolean>(false)
const isOpenPerformance = ref<boolean>(false)
const isOpenLang = ref<boolean>(false)
const carsList = computed(() => cars.value ?? [])

const parseNumberSuitcases = (value: unknown): SuitcaseCounts | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    const result: Partial<SuitcaseCounts> = {}

    value.split(';').forEach((chunk) => {
      const [rawKey, rawValue] = chunk.split(':')
      if (!rawKey || !rawValue) {
        return
      }

      const key = rawKey.trim().toLowerCase() as keyof SuitcaseCounts
      if (key !== 'large' && key !== 'small') {
        return
      }

      const parsedValue = Number.parseInt(rawValue.trim(), 10)
      result[key] = Number.isNaN(parsedValue) ? 0 : parsedValue
    })

    if (typeof result.large === 'number' && typeof result.small === 'number') {
      return { large: result.large, small: result.small }
    }

    return null
  }

  if (typeof value === 'object') {
    const maybeObject = value as { large?: unknown; small?: unknown }
    const large = Number.parseInt(String(maybeObject.large ?? 0), 10)
    const small = Number.parseInt(String(maybeObject.small ?? 0), 10)

    return {
      large: Number.isNaN(large) ? 0 : large,
      small: Number.isNaN(small) ? 0 : small
    }
  }

  return null
}

const passengersInput = computed<string>({
  get: () => (agencyData.value.number_of_passengers ?? 1).toString(),
  set: (value: string) => {
    const numeric = value.replace(/\D/g, '')
    agencyData.value.number_of_passengers = numeric === '' ? null : Number.parseInt(numeric, 10)
  }
})

const amountInput = computed<string>({
  get: () => (agencyData.value.amount ?? '').toString(),
  set: (value: string) => {
    const sanitized = value.replace(/\D/g, '')
    agencyData.value.amount = sanitized === '' ? null : Number.parseInt(sanitized, 10)
  }
})

const getCarKey = (option: CarSummary, idx: number) => {
  const keyCandidate = option?.class_id ?? option?.id
  return (
    typeof keyCandidate === 'string' || typeof keyCandidate === 'number' ? keyCandidate : idx
  ) as string | number
}

const allowOnlyDigits = (event: KeyboardEvent) => {
  if (/^[0-9]$/.test(event.key)) {
    return
  }
  if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
    return
  }
  event.preventDefault()
}
const toggleDropdownVehicle = () => {
  isOpenVehicle.value = !isOpenVehicle.value
}
const toggleDropdownPerformance = () => {
  isOpenPerformance.value = !isOpenPerformance.value
}
const toggleDropdownLang = () => {
  isOpenLang.value = !isOpenLang.value
}

const focusedVehicleIndex = ref<number>(-1)
const focusedPerformanceIndex = ref<number>(-1)
const focusedLangIndex = ref<number>(-1)

const handleListKey = <T,>(
  event: KeyboardEvent,
  list: T[],
  focusedIndexRef: Ref<number>,
  isOpenRef: Ref<boolean>,
  onSelect: (item: T) => void
) => {
  if (!isOpenRef.value) {
    if (['Enter', 'ArrowDown', ' '].includes(event.key)) {
      isOpenRef.value = true
      focusedIndexRef.value = 0
      event.preventDefault()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    focusedIndexRef.value = Math.min(focusedIndexRef.value + 1, list.length - 1)
    event.preventDefault()
  } else if (event.key === 'ArrowUp') {
    focusedIndexRef.value = Math.max(focusedIndexRef.value - 1, 0)
    event.preventDefault()
  } else if (event.key === 'Enter') {
    if (focusedIndexRef.value >= 0 && focusedIndexRef.value < list.length) {
      onSelect(list[focusedIndexRef.value])
      isOpenRef.value = false
      focusedIndexRef.value = -1
      event.preventDefault()
    }
  } else if (event.key === 'Tab') {
    isOpenRef.value = false
    focusedIndexRef.value = -1
  } else if (event.key === 'Escape') {
    isOpenRef.value = false
    focusedIndexRef.value = -1
    event.preventDefault()
  }
}

const handleKeyDownDropdown = (event: KeyboardEvent, dropdownType: DropdownType) => {
  if (dropdownType === 'vehicle') {
    handleListKey(event, carsList.value, focusedVehicleIndex, isOpenVehicle, selectVehicle)
    return
  }
  if (dropdownType === 'performance') {
    handleListKey(
      event,
      performances.value,
      focusedPerformanceIndex,
      isOpenPerformance,
      selectPerformance
    )
    return
  }
  handleListKey(event, languages.value, focusedLangIndex, isOpenLang, selectLang)
}

watch(isOpenVehicle, (v) => {
  if (!v) focusedVehicleIndex.value = -1
})
watch(isOpenPerformance, (v) => {
  if (!v) focusedPerformanceIndex.value = -1
})
watch(isOpenLang, (v) => {
  if (!v) focusedLangIndex.value = -1
})

const validateInput = (event: Event, type: keyof typeof luggages.value) => {
  const target = event.target as HTMLInputElement
  const cleanedValue = Number.parseInt(target.value.replace(/\D/g, ''), 10)
  const sanitizedValue = Number.isNaN(cleanedValue) ? 0 : cleanedValue
  luggages.value[type].current = Math.min(sanitizedValue, luggages.value[type].max)
}

function decrementValue(type: keyof typeof luggages.value) {
  const current = Number.parseInt(String(luggages.value[type].current), 10)
  const newValue = Number.isNaN(current) ? 0 : current - 1
  luggages.value[type].current = newValue >= 0 ? newValue : 0
}

const selectVehicle = (option: CarSummary) => {
  agencyData.value.car = option
  carsStore.selectCar(option)
  isOpenVehicle.value = false
}

const selectPerformance = (option: string) => {
  agencyData.value.performance = option
  isOpenPerformance.value = false
}

const selectLang = (option: string) => {
  agencyData.value.other_language = option
  isOpenLang.value = false
}

function incrementValue(type: keyof typeof luggages.value) {
  const current = Number.parseInt(String(luggages.value[type].current), 10)
  const baseValue = Number.isNaN(current) ? 0 : current
  const newValue = baseValue + 1
  luggages.value[type].current =
    newValue <= luggages.value[type].max ? newValue : luggages.value[type].max
}

const pickupSpecialText = () => {
  if (orderData.value.mainTypes.pickup === 'airport')
    return { title: 'Arrival Flight information', visibleText: false }
  if (
    orderData.value.mainTypes.pickup === 'train_station' ||
    orderData.value.mainTypes.pickup === 'transit_station'
  )
    return { title: 'Arrival Train Information', visibleText: false }
  if (orderData.value.mainTypes.pickup === 'port')
    return { title: 'Arrival Ship Information', visibleText: false }
  return { title: 'Pick Up Location Specifics', visibleText: true }
}

const isEmpty = (value: unknown): boolean => {
  if (utils && typeof utils.isEmpty === 'function') {
    return utils.isEmpty(value)
  }
  if (value === null || value === undefined) {
    return true
  }
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0
  }
  return false
}

const errorFill = (errorBag: Record<string, string | undefined>) => {
  errorOnForm.value = errorBag
}

const setTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return
  }
  if (initialDate.value) {
    const updatedDate = new Date(initialDate.value)
    updatedDate.setHours(hours, minutes)
    datePicker.value = updatedDate
    orderData.value.date_start = dayjs(updatedDate).format('YYYY-MM-DD HH:mm')
  }
  selectedTime.value = time

  datePickerRef.value?.closeMenu?.()
}

watch(errorOnForm, (newVal) => {
  if (newVal && !isEmpty(newVal)) {
    isShowModal.value = true
  }
})

const toggleRouteMap = () => {
  if (disabledMap.value) return
  showRouteMap.value = !showRouteMap.value
}

watch(
  () => agencyData.value.car_id,
  (carId) => {
    if (!carId || !Array.isArray(cars.value)) {
      return
    }

    const car = cars.value.find((car) => car.class_id === carId)

    if (car) {
      selectVehicle(car)
    }
  },
  { immediate: true }
)

watch(
  () => agencyData.value.number_suitcases,
  (numberSuitcases) => {
    const parsed = parseNumberSuitcases(numberSuitcases)
    if (!parsed) {
      return
    }

    luggages.value.large.current = parsed.large
    luggages.value.small.current = parsed.small
  },
  { immediate: true }
)

watch(
  () => pathStartFinish.value?.valid?.pickup,
  (updatedPickupValid) => {
    const isValid = updatedPickupValid && Object.keys(pathStartFinish.value || {}).length > 1

    showRouteMap.value = isValid
  },
  { immediate: true }
)

watch(mainTypes, (value) => {
  orderStore.update({
    mainTypes: value
  })
})

function closeModal() {
  isShowModal.value = false
}

const hourlySchema = yup.object({
  pickup: yup
    .string()
    .required('Pick up is a required field')
    .max(230)
    .test(
      'location-restricted',
      'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
      (value) => !String(value).includes('Amerigo Vespucci Airport, Viale Belfiore')
    )
    .test(
      'google-complete',
      'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
      () => {
        if (orderData.value.ride_history) return true
        if (fleet.value) return true
        return Boolean(pathStartFinish.value?.valid?.pickup)
      }
    )
    .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
    .matches(regexLink ?? /.*/, { excludeEmptyString: true }),

  date_start: yup
    .string()
    .required('Date is a required field')
    .max(230, 'Date should not exceed 230 character')
    .matches(regexIsHttps ?? /.*/, { excludeEmptyString: true })
    .matches(regexLink ?? /.*/, { excludeEmptyString: true }),

  number_of_passengers: yup
    .number()
    .required('Number of passengers is a required field')
    .min(1, 'Number of passengers must be greater than 0'),

  ride_price: yup.string().required('Ride price is a required field'),

  car: yup.object().required('Vehicle type is required'),

  performance: yup.string().required('Performance selection is required'),

  main_passenger: yup.string().nullable(),

  other_language: yup.string().required('Language selection is required'),

  pickup_specific: yup.string().nullable(),
  dropoff_specific: yup.string().nullable(),
  notes: yup.string().nullable(),

  file_number: yup.string().nullable()
})

type AgencyOrderPayload = Partial<OrderData> & {
  performance?: string
  amount?: number | null
  credit?: boolean
  order_id?: string | number | null
}

const hourlySubmit = async (values: HourlyAgencyFormValues, ctx: { evt: SubmitEvent }) => {
  if (paymentStateStore.isLoading || !agencyData.value.car) return

  const submitter = ctx.evt.submitter as HTMLButtonElement | null
  const paymentMethod = submitter?.dataset.payment === 'credits' ? 'credits' : 'card'
  paymentStateStore.setLoading(true, paymentMethod as 'credits' | 'card')

  // Сохранить UTM-метки перед сбросом
  const orderMainTypes = orderData.value.mainTypes
  const formattedDate = dayjs(values.date_start ?? datePicker.value ?? new Date()).format(
    'YYYY-MM-DD HH:mm'
  )
  const utmData = orderStore.getUtmData() as UtmData

  const payload: AgencyOrderPayload = {
    pickup: agencyData.value.pickup,
    date_start: formattedDate,
    hours: values.hours,
    car: agencyData.value.car?.class_id ?? null,
    performance: agencyData.value.performance,
    number_of_passengers: agencyData.value.number_of_passengers ?? 1,
    main_passenger: agencyData.value.main_passenger || null,
    other_language: agencyData.value.other_language || null,
    pickup_specific: agencyData.value.pickup_specific || null,
    dropoff_specific: agencyData.value.dropoff_specific || null,
    notes: agencyData.value.notes || null,
    amount: agencyData.value.amount ?? 0,
    file_number: agencyData.value.file_number || null,
    number_suitcases: `Large: ${luggages.value.large.current}; Small: ${luggages.value.small.current}`,
    type_of_service: 'hourlyAsDirected',
    distance: values.hours * 20,
    status: 1,
    mainTypes: orderMainTypes,
    ...utmData
  }

  if (paymentMethod === 'credits') {
    confirmingCreditBasedPaymentModalStore.show()

    const result = await new Promise((resolve) => {
      const stopWatch = watch(
        [
          () => confirmingCreditBasedPaymentModalStore.agreed,
          () => confirmingCreditBasedPaymentModalStore.isOpen
        ],
        ([agreed, isOpen]) => {
          if (agreed) {
            stopWatch()
            resolve(true)
          } else if (!isOpen) {
            stopWatch()
            resolve(false)
          }
        }
      )
    })

    if (!result) {
      paymentStateStore.reset()
      return
    }

    // Блокируем модалку во время обработки
    paymentStateStore.setModalBlocked(true)

    try {
      orderStore.$reset()
      orderStore.update(payload)

      const response = await axiosInstance.post('/agency/order/create', {
        ...payload,
        credit: true
      })
      if (response.data.status === 'error') {
        console.error('Error:', response.data.message)
        confirmingCreditBasedPaymentModalStore.close()
      } else {
        const { order, transaction } = response.data.data

        if (!transaction) {
          orderStore.update({
            ...order,
            countdown: null,
            status: 1,
            allowedPages: {
              contact: 1,
              vehicle: 1,
              success_payment_intent: 1,
              success: 1
            }
          })

          orderStore.updateOrderId(order.id)
          confirmingCreditBasedPaymentModalStore.close()
          await router.push('/success/payment_intent/' + orderId.value)
        }
      }
    } catch (err) {
      console.error(err)
      confirmingCreditBasedPaymentModalStore.close()
    } finally {
      paymentStateStore.reset()
    }
  } else {
    try {
      orderStore.$reset()
      orderStore.update(payload)
      payload.order_id = agencyData.value.order_id

      const response = await axiosInstance.post('/agency/order/create', {
        ...payload,
        credit: false
      })
      const { order, transaction } = response.data.data

      if (!transaction || !transaction.transaction_id) {
        console.error('Transaction error:', transaction)
        return
      }

      orderStore.update({
        ...order,
        transaction_id: transaction.transaction_id,
        countdown: null,
        status: 1,
        allowedPages: {
          payment: 1
        }
      })

      orderStore.updateOrderId(order.id)
      await router.push('/payment/' + transaction.transaction_id)
    } catch (err) {
      console.error('Error creating order or transaction:', err)
    } finally {
      paymentStateStore.reset()
    }
  }
}

const scrollToSelectedTime = async () => {
  await nextTick()
  if (timeOptionsContainer.value) {
    const selectedElement = timeOptionsContainer.value.querySelector('.time-selected')
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  }
}

const handleCalendarOpen = () => {
  if (datePicker.value) {
    scrollToSelectedTime()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
  }
}

onMounted(() => {
  if (!isLoggedIn.value && orderType.value !== 'DUPLICATE') {
    orderStore.$resetGuestOrderData()
  }

  const loadCars = async () => {
    try {
      const response = await axiosInstance.get('/cars')
      carsStore.update(response.data.data)
    } catch (error) {
      // Тихо проигнорировать ошибку загрузки машин
    }
  }
  loadCars()
  if (orderData.value.date_start) {
    timeSetFirstTime.value = false
    datePicker.value = new Date(orderData.value.date_start)
  }
  if (orderId.value !== null) {
    // fields.value.pickup.valid = true
  }
  orderStore.update({ status: 1, type_of_service: 'hourlyAsDirected' })

  if (isMobile.value) {
    document.addEventListener('keydown', handleKeyDown)
  }
  if (datePicker.value) {
    const dateValue =
      datePicker.value instanceof Date ? datePicker.value : new Date(datePicker.value)
    if (!Number.isNaN(dateValue.getTime())) {
      const hours = dateValue.getHours().toString().padStart(2, '0')
      const minutes = dateValue.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${minutes}`
      if (Array.isArray(timeOptions.value) && timeOptions.value.includes(timeStr)) {
        selectedTime.value = timeStr
      }
    }
  }
})

onUnmounted(() => {
  if (isMobile.value) {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

watch(datePicker, async (val) => {
  if (val) {
    const dateValue = val instanceof Date ? val : new Date(val)
    if (Number.isNaN(dateValue.getTime())) {
      return
    }
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`
    await scrollToSelectedTime()

    if (Array.isArray(timeOptions.value) && timeOptions.value.includes(timeStr)) {
      selectedTime.value = timeStr
    }
  }
})

watch(datePicker, (val) => {
  if (val) {
    const dateValue = val instanceof Date ? val : new Date(val)
    if (Number.isNaN(dateValue.getTime())) {
      return
    }
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    selectedTime.value = `${hours}:${minutes}`
  }
})

const handleSubmit: SubmissionHandler = async (values, ctx) => {
  const submitEvent =
    (ctx as { event?: Event; evt?: Event })?.event ?? (ctx as { evt?: Event })?.evt
  const normalizedEvent =
    submitEvent instanceof SubmitEvent ? submitEvent : new SubmitEvent('submit')

  await hourlySubmit(values as HourlyAgencyFormValues, { evt: normalizedEvent })
}
</script>
