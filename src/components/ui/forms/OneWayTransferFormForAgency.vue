<template>
  <div class="mt-10 rounded-[40px] bg-white p-8 pt-0 dark:bg-[#333639]">
    <Form
      @submit="oneWaySubmit"
      class="form"
      ref="oneWayTransferForm"
      :validation-schema="oneWaySchema"
      v-slot="{ errors, isSubmitting }"
    >
      <span v-if="isSubmitting">
        {{ errorFill(errors) }}
      </span>
      <div
        v-if="hasErrorsOnForm && isShowModal"
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
            <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
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
      <div :class="['home_form home_form-1', { active: true }]">
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
            data-testid="homepage-PickUpLocation"
          />
        </Field>
        <Field name="dropoff" v-slot="{ field }" v-model="agencyData.dropoff">
          <TrustyComplete
            clearable
            v-model="dropoffRef"
            class="w-full md:w-[calc(100%/3-8px)]"
            classname="input !py-[22px] m-0 !w-full"
            @get:suggestions="fetchSuggestions"
            @update:suggestions="updateSuggestions"
            @clear:input="clearInput('dropoff')"
            @select:suggestions="selectSuggestions"
            :autoCompleteString="agencyData.dropoff"
            :suggestions="data"
            v-bind="field"
            fieldType="dropoff"
            placeholder="Drop Off Location*"
            autocomplete="off"
          />
        </Field>
        <Field name="date_start" v-slot="{ field }" v-model="datePicker">
          <VueDatePicker
            ref="datePickerRef"
            :teleport-center="Boolean(ssid)"
            class="input m-0 text-sm md:text-lg"
            placeholder="Date / Time*"
            :class="errors.date_start ? 'error' : ''"
            :preview-format="dateFormat"
            auto-apply
            partial-flow
            :clearable="false"
            :format="dateFormat"
            :dark="mode === 'dark'"
            :light="mode === 'light'"
            v-bind="field"
            v-model="datePicker"
            @internal-model-change="handleInternal"
            @open="handleCalendarOpen"
            @keydown="handleDateArrowKeys"
            :enable-keyboard-navigation="false"
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
        :form="oneWayTransferForm"
        :dropoffRef="dropoffRef"
        @markerdragged="markerDraggedHandler"
      />
      <div class="mt-6 grid w-full grid-cols-12 gap-x-4 gap-y-10">
        <div class="col-span-12 flex flex-col lg:col-span-6">
          <p class="mb-4 text-2xl font-medium">
            Choose Vehicle Type<span class="text-red-500">*</span>
          </p>
          <Field name="car" v-model="agencyData.car">
            <div class="relative" data-dropdown="vehicle">
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
            <div class="relative" data-dropdown="performance">
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
            <div class="relative" data-dropdown="lang">
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
          <p class="text-sm text-[#3D4043] dark:text-[#C8C8C8]">
            In our company all our chauffeurs are experienced and speak English if you prefer a
            different language please indicate it, if available we will take this into account
          </p>
        </div>
        <div class="col-span-12 border-t-2 border-[#D9D9D90D]"></div>
        <div class="relative col-span-12 flex w-full flex-col gap-2 lg:col-span-6">
          <label class="text-background dark:text-white">{{ pickupSpecialText().title }}</label>
          <input
            v-model="agencyData.pickup_specific"
            type="text"
            class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <span
            class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
            v-if="pickupSpecialText().visibleText"
          >
            If applicable please indicate arrival Flight/Train Number or GPS coordinates if needed
            (such as for Villas in the countriside or difficult to reach locations)
          </span>
        </div>
        <div
          class="col-span-12 flex w-full flex-col gap-2 max-md:border-t-2 max-md:border-t-[#DDE5DC] max-md:pt-8 dark:max-md:border-t-[#D9D9D9]/5 lg:col-span-6"
        >
          <label class="text-background dark:text-white">{{ dropoffSpecialText().title }}</label>
          <input
            v-model="agencyData.dropoff_specific"
            type="text"
            class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-14 py-4 text-center text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <span
            class="text-xs text-[#3D4043] dark:text-[#C8C8C8] md:text-sm"
            v-if="dropoffSpecialText().visibleText"
          >
            If applicable please indicate departure Flight/Train Number or GPS coordinates if needed
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
            class="mr-1 hover:stroke-main"
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
import LocationIcon from '@/components/ui/icons/LocationIcon.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { Field, Form } from 'vee-validate'
import type { SubmissionContext } from 'vee-validate'

import dayjs from 'dayjs'
import * as yup from 'yup'

import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { useMobile } from '@/compose/ismobile'
import { useDatePicker } from '@/compose/datePicker'
import { useCarsStore } from '@/stores/ride/cars'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import { useUserStore } from '@/stores/user/profile'
import { useConfirmingCreditBasedPaymentModalStore } from '@/stores/ui/confirmingCreditBasedPaymentModal'
import { usePaymentStateStore } from '@/stores/ui/paymentState'
import { storeToRefs } from 'pinia'
import { useFetcher } from '@/compose/axios'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import TrustyComplete from '@/components/ui/autocomplete/TrustyComplete.vue'
import RouteMap from '@/components/features/map/RouteMap.vue'
import InfoIcon from '@/components/ui/icons/InfoIcon.vue'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import type { CarSummary } from '@/types/stores/ride/cars'
import type { OrderData, MainTypes } from '@/types/stores/ride/order'
import type { AgencyData, User } from '@/types/stores/user/profile'
import type { AxiosInstance } from 'axios'

type DropdownType = 'vehicle' | 'performance' | 'lang'

type LuggageType = 'large' | 'small'

interface UtilsPlugin {
  isEmpty: (value: unknown) => boolean
}

interface AgencyFormValues {
  pickup: string
  dropoff: string
  date_start: string | Date | null
  performance: string
  car: unknown
  number_of_passengers: string | number | null
  main_passenger: string | null
  other_language: string
  pickup_specific: string | null
  dropoff_specific: string | null
  notes: string | null
  amount: string | number | null
  file_number: string | null
}

interface AgencyOrderPayload {
  pickup: string
  dropoff: string
  date_start: string
  hours: number | null
  car: string | number | null
  performance: string
  number_of_passengers: number
  main_passenger: string | null
  other_language: string
  pickup_specific: string | null
  dropoff_specific: string | null
  number_suitcases: string
  notes: string | null
  amount: number
  file_number: string | null
  type_of_service: string
  status: number
  mainTypes: MainTypes
  credit?: boolean
  [key: string]: unknown
}

const props = defineProps<{
  handleKeyDown?: (event: KeyboardEvent) => void
}>()

const oneWayTransferForm = ref(null)

const selectedTime = ref('')

const carsStore = useCarsStore()
const trustyStore = useTrustyStore()
const userStore = useUserStore()
const confirmingCreditBasedPaymentModalStore = useConfirmingCreditBasedPaymentModalStore()
const paymentStateStore = usePaymentStateStore()
const { agencyData, user, isLoggedIn } = storeToRefs(userStore)

const hasEnoughCredits = computed<boolean>(() => {
  if (
    user.value &&
    user.value.type === 'agency' &&
    (user.value.show_information === null || user.value.show_information === 2) &&
    user.value.agency_balance > 0
  ) {
    const enteredAmount = Number(agencyData.value.amount) || 0
    return enteredAmount <= user.value.agency_balance
  }
  return false
})

const hasErrorsOnForm = computed<boolean>(() => {
  if (!utils || typeof utils.isEmpty !== 'function') {
    return Boolean(errorOnForm.value)
  }
  return !utils.isEmpty(errorOnForm.value)
})

const { cars } = storeToRefs(carsStore) as { cars: Ref<CarSummary[] | null> }
const { dropoffRef, pickupRef, data, pathStartFinish, mainTypes } = storeToRefs(trustyStore)
const { fetchSuggestions, selectSuggestions, updateSuggestions, clearInput } = trustyStore
const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

const {
  datePickerRef,
  minDate,
  minTime,
  datePicker,
  timeOptions,
  dateFormat,
  handleInternal,
  initialDate,
  timeSetFirstTime
} = useDatePicker()

const { isMobile } = useMobile()
const router = useRouter()
const utils = inject<UtilsPlugin | undefined>('utils')
const regexLink = inject<RegExp | undefined>('regexLink')
const regexIsHttps = inject<RegExp | undefined>('regexIsHttps')
const performances = ref([
  'Chauffeur',
  'Driver/Guide',
  'Specialized Driver/Guide',
  'Assistant/Tour Escort',
  'Tour Guide'
])
const languages = ref(['English', 'Italian', 'Spanish'])
type SuitcaseCounts = Record<LuggageType, number>

const luggages = ref<Record<LuggageType, { current: number; max: number }>>({
  large: {
    current: 0,
    max: 30
  },
  small: {
    current: 0,
    max: 30
  }
})
const isOpenVehicle = ref(false)
const isOpenPerformance = ref(false)
const isOpenLang = ref(false)

const focusedVehicleIndex = ref(-1)
const focusedPerformanceIndex = ref(-1)
const focusedLangIndex = ref(-1)

const carsList = computed<CarSummary[]>(() => cars.value ?? [])

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

const allowOnlyDigits = (event: KeyboardEvent) => {
  if (/^[0-9]$/.test(event.key)) {
    return
  }
  if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
    return
  }
  event.preventDefault()
}

const getCarKey = (option: CarSummary, idx: number): string | number => {
  const candidate =
    option?.class_id ?? (option as Partial<CarSummary> & { id?: string | number })?.id
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    return candidate
  }
  return idx
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

const showRouteMap = ref<boolean>(false)
const isShowModal = ref<boolean>(true)
const errorOnForm = ref<Record<string, string | undefined> | null>(null)
const timeOptionsContainer = ref<HTMLDivElement | null>(null)
const markersMoved = ref<Record<'pickup' | 'dropoff', boolean>>({
  pickup: false,
  dropoff: false
})
const disabledMap = ref<boolean>(false)

const mainStore = useMainStore()
const orderStore = useOrderStore()
const { orderData, orderId, orderType } = storeToRefs(orderStore) as {
  orderData: Ref<OrderData>
  orderId: Ref<string | number | null>
  orderType: Ref<string>
}
const { mode, ssid } = storeToRefs(mainStore) as {
  mode: Ref<string>
  ssid: Ref<string | null>
}

const safeRegexIsHttps = regexIsHttps ?? /.*/
const safeRegexLink = regexLink ?? /.*/

const hasFleetAccess = computed<boolean>(() => {
  const fleetValue = (orderData.value as { fleet?: boolean }).fleet
  return Boolean(fleetValue)
})

const setTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (initialDate.value) {
    let updatedDate = new Date(initialDate.value)
    updatedDate.setHours(hours, minutes)
    datePicker.value = updatedDate
    orderData.value.date_start = dayjs(updatedDate).format('YYYY-MM-DD HH:mm')
  }
  selectedTime.value = time

  datePickerRef.value?.closeMenu?.()
}

const pickupSpecialText = () => {
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

const dropoffSpecialText = () => {
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

const validateInput = (event: Event, type: LuggageType) => {
  const target = event.target as HTMLInputElement
  const cleanedValue = target.value.replace(/\D/g, '')
  luggages.value[type].current = Math.min(Number(cleanedValue) || 0, luggages.value[type].max)
}

function decrementValue(type: LuggageType) {
  const newValue = Number.parseInt(String(luggages.value[type].current), 10) - 1
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

function incrementValue(type: LuggageType) {
  const newValue = Number.parseInt(String(luggages.value[type].current), 10) + 1
  luggages.value[type].current =
    newValue <= luggages.value[type].max ? newValue : luggages.value[type].max
}

const pathHasPickupAndDropOff = computed(() => {
  return pathStartFinish.value.valid.pickup && pathStartFinish.value.valid.dropoff
})

const errorFill = (errorBag: Record<string, string | undefined>) => {
  errorOnForm.value = errorBag
}

const markerDraggedHandler = (locationType: 'pickup' | 'dropoff') => {
  markersMoved.value[locationType] = true
}

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

      const key = rawKey.trim().toLowerCase() as LuggageType
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
    const maybeObject = value as Partial<Record<LuggageType, unknown>>
    const large = Number.parseInt(String(maybeObject.large ?? 0), 10)
    const small = Number.parseInt(String(maybeObject.small ?? 0), 10)

    return {
      large: Number.isNaN(large) ? 0 : large,
      small: Number.isNaN(small) ? 0 : small
    }
  }

  return null
}

watch(errorOnForm, () => {
  if (hasErrorsOnForm.value) {
    isShowModal.value = true
  }
})

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

function closeModal() {
  isShowModal.value = false
}

const toggleRouteMap = () => {
  if (disabledMap.value) return
  showRouteMap.value = !showRouteMap.value
}

watch(
  () => [pathStartFinish.value.valid.pickup, pathStartFinish.value.valid.dropoff],
  ([updatedPickupValid, updatedDropoffValid]) => {
    const isValid =
      updatedPickupValid && updatedDropoffValid && Object.keys(pathStartFinish.value).length > 1
    showRouteMap.value = isValid
  },
  { immediate: true }
)

watch(mainTypes, (value) => {
  orderStore.update({
    mainTypes: value
  })
})

const oneWaySchema = yup.object({
  pickup: yup
    .string()
    .required('Pick up is a required field')
    .max(230)
    .test(
      'location-restricted',
      'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
      (value) => !value.toString().includes('Amerigo Vespucci Airport, Viale Belfiore')
    )
    .test(
      'google-complete',
      'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
      () => {
        if (orderData.value.ride_history || hasFleetAccess.value) return true
        return pathStartFinish.value.valid.pickup
      }
    )
    .matches(safeRegexIsHttps, { excludeEmptyString: true })
    .matches(safeRegexLink, { excludeEmptyString: true }),

  dropoff: yup
    .string()
    .required('Drop Off is a required field')
    .max(230, 'Drop Off should not exceed 230 character')
    .test(
      'location-restricted',
      'The airport is located at:  Amerigo Vespucci Airport, Via del Termine, Florence, Metropolitan City of Florence, Italy',
      (value) => !value.toString().includes('Amerigo Vespucci Airport, Viale Belfiore')
    )
    .test(
      'google-complete',
      'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
      () => {
        if (orderData.value.ride_history || hasFleetAccess.value) return true
        return pathStartFinish.value.valid.dropoff
      }
    )
    .matches(safeRegexIsHttps, { excludeEmptyString: true })
    .matches(safeRegexLink, { excludeEmptyString: true }),
  ride_price: yup.string().required('Ride price is a required field'),
  number_of_passengers: yup
    .number()
    .required('Number of passengers is a required field')
    .min(1, 'Number of passengers must be greater than 0'),
  date_start: yup
    .string()
    .required('Date is a required field')
    .max(230, 'Date should not exceed 230 character')
    .matches(safeRegexIsHttps, { excludeEmptyString: true })
    .matches(safeRegexLink, { excludeEmptyString: true }),

  car: yup.object().required('Vehicle type is required'),

  performance: yup.string().required('Performance selection is required'),

  main_passenger: yup.string().nullable(),

  other_language: yup.string().required('Language selection is required'),

  pickup_specific: yup.string().nullable(),
  dropoff_specific: yup.string().nullable(),
  notes: yup.string().nullable(),

  file_number: yup.string().nullable()
})

const oneWaySubmit = async (
  values: Record<string, unknown>,
  ctx: SubmissionContext<Record<string, unknown>>
) => {
  const formValues = values as unknown as AgencyFormValues
  if (paymentStateStore.isLoading) return

  const submitEvent = (ctx as { evt?: SubmitEvent }).evt
  const submitter =
    submitEvent && 'submitter' in submitEvent
      ? (submitEvent.submitter as HTMLButtonElement | null)
      : null
  const paymentMethod = submitter?.dataset.payment === 'credits' ? 'credits' : 'card'
  paymentStateStore.setLoading(true, paymentMethod)

  // Сохранить UTM-метки перед сбросом
  const utmData = orderStore.getUtmData()

  const formattedDate = dayjs(formValues.date_start || datePicker.value).format('YYYY-MM-DD HH:mm')
  const orderMainTypes = orderData.value.mainTypes

  const numberOfPassengersRaw = agencyData.value.number_of_passengers
  const numberOfPassengers = Number.parseInt(String(numberOfPassengersRaw ?? 0), 10) || 0
  const amountRaw = agencyData.value.amount
  const amountValue = Number.parseInt(String(amountRaw ?? 0), 10) || 0
  const carClassId = agencyData.value.car?.class_id ?? null

  const hoursValue =
    agencyData.value.hours === null || agencyData.value.hours === undefined
      ? null
      : Number(agencyData.value.hours)

  const payload: AgencyOrderPayload = {
    pickup: agencyData.value.pickup,
    dropoff: agencyData.value.dropoff,
    date_start: formattedDate,
    hours: Number.isFinite(hoursValue) ? (hoursValue as number) : null,
    car: carClassId,
    performance: agencyData.value.performance,
    number_of_passengers: numberOfPassengers,
    main_passenger: agencyData.value.main_passenger || null,
    other_language: agencyData.value.other_language,
    pickup_specific: agencyData.value.pickup_specific || null,
    dropoff_specific: agencyData.value.dropoff_specific || null,
    number_suitcases: `Large: ${luggages.value.large.current}; Small: ${luggages.value.small.current}`,
    notes: agencyData.value.notes || null,
    amount: amountValue,
    file_number: agencyData.value.file_number || null,
    type_of_service: 'oneWayTransfer',
    status: 2,
    mainTypes: orderMainTypes,
    ...utmData // Добавить UTM-метки в payload
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

    paymentStateStore.setModalBlocked(true)

    try {
      payload.credit = true

      orderStore.$reset()
      orderStore.update(payload as Partial<OrderData>)

      const response = await axiosInstance.post('/agency/order/create', payload)

      if (response.data.status === 'error') {
        console.error('Server error:', response.data.message)
        confirmingCreditBasedPaymentModalStore.close()
      } else {
        const { order, transaction } = response.data.data

        if (!transaction) {
          orderStore.update({
            ...order,
            countdown: null,
            status: 2,
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
      console.error('Error during credit payment:', err)
      confirmingCreditBasedPaymentModalStore.close()
    } finally {
      paymentStateStore.reset()
    }
  } else {
    try {
      payload.credit = false

      orderStore.$reset()
      orderStore.update(payload as Partial<OrderData>)
      payload.order_id = agencyData.value.order_id
      const response = await axiosInstance.post('/agency/order/create', payload)
      const { order, transaction } = response.data.data

      if (!transaction || !transaction.transaction_id) {
        console.error('Transaction error:', transaction)
        return
      }

      orderStore.update({
        ...order,
        transaction_id: transaction.transaction_id,
        countdown: null,
        status: 2,
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

watch(datePicker, async (val) => {
  if (val) {
    const dateValue = typeof val === 'string' ? new Date(val) : val
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`
    await scrollToSelectedTime()

    if (Array.isArray(timeOptions.value) && timeOptions.value.includes(timeStr)) {
      selectedTime.value = timeStr
    }
  }
})

const handleClickOutside = (event: MouseEvent) => {
  // Check if click is outside all dropdown areas
  const target = event.target as HTMLElement | null
  const vehicleDropdown = target?.closest('[data-dropdown="vehicle"]')
  const performanceDropdown = target?.closest('[data-dropdown="performance"]')
  const langDropdown = target?.closest('[data-dropdown="lang"]')

  if (!vehicleDropdown && isOpenVehicle.value) {
    isOpenVehicle.value = false
  }
  if (!performanceDropdown && isOpenPerformance.value) {
    isOpenPerformance.value = false
  }
  if (!langDropdown && isOpenLang.value) {
    isOpenLang.value = false
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
  if (pathStartFinish.value.valid.pickup && pathStartFinish.value.valid.dropoff) {
    showRouteMap.value = true
  }

  if (orderData.value.date_start) {
    timeSetFirstTime.value = false
    datePicker.value = new Date(orderData.value.date_start)
  }
  orderStore.update({ status: 2, type_of_service: 'oneWayTransfer' })

  if (isMobile.value && props.handleKeyDown) {
    document.addEventListener('keydown', props.handleKeyDown)
  }

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (isMobile.value && props.handleKeyDown) {
    document.removeEventListener('keydown', props.handleKeyDown)
  }

  document.removeEventListener('click', handleClickOutside)
})

watch(datePicker, (val) => {
  if (val) {
    const dateValue = typeof val === 'string' ? new Date(val) : val
    const hours = dateValue.getHours().toString().padStart(2, '0')
    const minutes = dateValue.getMinutes().toString().padStart(2, '0')
    selectedTime.value = `${hours}:${minutes}`
  }
})

watch(pickupRef, (val) => {
  agencyData.value.pickup = val
})

watch(dropoffRef, (val) => {
  agencyData.value.dropoff = val
})

watch(isOpenVehicle, (v) => {
  if (!v) focusedVehicleIndex.value = -1
})
watch(isOpenPerformance, (v) => {
  if (!v) focusedPerformanceIndex.value = -1
})
watch(isOpenLang, (v) => {
  if (!v) focusedLangIndex.value = -1
})

const handleKeyDownDropdown = (event: KeyboardEvent, dropdownType: DropdownType) => {
  let rawList: unknown[] | null | undefined
  let focusedIndex = -1
  let setFocusedIndex: ((index: number) => void) | null = null
  let selectFn: ((option: unknown) => void) | null = null
  let isOpenRef: Ref<boolean> | null = null
  if (dropdownType === 'vehicle') {
    rawList = cars.value
    focusedIndex = focusedVehicleIndex.value
    setFocusedIndex = (i: number) => (focusedVehicleIndex.value = i)
    selectFn = (option: unknown) => selectVehicle(option as CarSummary)
    isOpenRef = isOpenVehicle
  } else if (dropdownType === 'performance') {
    rawList = performances.value
    focusedIndex = focusedPerformanceIndex.value
    setFocusedIndex = (i: number) => (focusedPerformanceIndex.value = i)
    selectFn = (option: unknown) => selectPerformance(option as string)
    isOpenRef = isOpenPerformance
  } else if (dropdownType === 'lang') {
    rawList = languages.value
    focusedIndex = focusedLangIndex.value
    setFocusedIndex = (i: number) => (focusedLangIndex.value = i)
    selectFn = (option: unknown) => selectLang(option as string)
    isOpenRef = isOpenLang
  }

  if (!Array.isArray(rawList) || !isOpenRef || !setFocusedIndex || !selectFn) {
    return
  }
  const list = rawList
  if (!isOpenRef.value) {
    if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === ' ') {
      isOpenRef.value = true
      setFocusedIndex(0)
      event.preventDefault()
    }
    return
  }
  if (event.key === 'ArrowDown') {
    setFocusedIndex(Math.min(focusedIndex + 1, list.length - 1))
    event.preventDefault()
  } else if (event.key === 'ArrowUp') {
    setFocusedIndex(Math.max(focusedIndex - 1, 0))
    event.preventDefault()
  } else if (event.key === 'Enter' && focusedIndex >= 0 && focusedIndex < list.length) {
    selectFn(list[focusedIndex])
    isOpenRef.value = false
    setFocusedIndex(-1)
    event.preventDefault()
  } else if (event.key === 'Escape') {
    isOpenRef.value = false
    setFocusedIndex(-1)
    event.preventDefault()
  }
}

const handleDateArrowKeys = (event: KeyboardEvent) => {
  if (!datePicker.value) return // если дата не выбрана, ничего не делаем

  const baseDate =
    typeof datePicker.value === 'string' ? new Date(datePicker.value) : datePicker.value
  const currentDate = new Date(baseDate)

  if (event.key === 'ArrowRight') {
    currentDate.setDate(currentDate.getDate() + 1)
    datePicker.value = currentDate
    event.preventDefault() // чтобы не было конфликтов с другими действиями
  } else if (event.key === 'ArrowLeft') {
    currentDate.setDate(currentDate.getDate() - 1)
    if (currentDate >= minDate.value) {
      datePicker.value = currentDate
    }
    event.preventDefault()
  }
}
</script>

<style>
.disabled_map {
  cursor: not-allowed !important;
}
</style>

<style>
.disabled_map {
  cursor: not-allowed !important;
}
</style>
