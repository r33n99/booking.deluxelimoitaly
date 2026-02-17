<template>
  <div class="success_page flex h-full flex-col justify-between">
    <div v-if="fromServiceData">
      <div>
        <div class="mt-1 flex flex-col flex-wrap justify-between md:flex-row">
          <h1 class="title mr-[15px]" data-testid="success-title">
            Thanks for<br />
            providing this data!
          </h1>
          <div v-if="tours.length > 0" class="block md:hidden">
            <p class="subtitle">
              If you have any Questions Feel Free to Send us
              <a class="text-main" :href="'mailto:' + email">Email</a> or
              <a class="text-main" :href="'tel:' + phone">Call us</a>
            </p>
            <div
              class="mt-6 flex flex-col justify-between rounded-[40px] bg-main px-6 py-8 pt-5 text-background"
            >
              <span class="mb-3 text-[24px]/[110%] font-bold">New Service</span>
              <span>If you wish to book other services please click here.</span>
              <button
                type="button"
                @click="openSignUp"
                class="mt-6 rounded-[37px] border border-main bg-background px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-white hover:text-[#2B2D32]"
              >
                New Service
              </button>
            </div>
          </div>
          <div v-if="tours.length > 0" class="hidden md:flex">
            <div class="flex flex-col justify-between pt-5">
              <button
                type="button"
                @click="openSignUp"
                class="rounded-[37px] border border-main px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-main hover:bg-main hover:text-[#2B2D32]"
              >
                New Service
              </button>
              <p class="subtitle">
                If you have any Questions Feel<br />Free to Send us
                <a class="text-main" :href="'mailto:' + email">Email</a> or
                <a class="text-main" :href="'tel:' + phone">Call us</a>
              </p>
            </div>
          </div>
        </div>
        <p class="subscribe_text payment_message mt-[30px]">{{ paymentMessage }}</p>
        <SummaryInfo
          classnames="summary_title_button_wrapper dark:bg-[#272729] mt-[47px] md:mt-[56px] border-b-[1px] border-placeholder"
          title="Service Data - Completed"
          custom-style="false"
          disabled="true"
          prepare="serviceData"
        />
        <SummaryInfo
          classnames="summary_title_button_wrapper rounded-b-[40px] border-placeholder form_to_edit bg-white dark:bg-[#333639] mt-[-38px]"
          title="Contact Data - Completed"
          custom-style="false"
          disabled="false"
          prepare="contactData"
        />
      </div>
      <div
        v-if="tours.length > 0"
        class="mt-6 rounded-[40px] border-2 border-background p-8 dark:bg-dark_wind"
      >
        <p class="text-[17px]">
          You can find below our most advisable tours available from the locations where the ride
          starts and end. Don't miss the opportunity to book the most appealing ones!
        </p>
      </div>
      <template class="mt-6 block md:hidden">
        <div class="flex flex-col gap-y-6">
          <tour-card
            v-for="tour in tours"
            :key="tour.id"
            :tour="tour"
            @click="handleTourSelect(tour.id)"
          />
        </div>
      </template>
      <div class="relative mt-8 hidden md:block md:px-12" data-testid="success-tours">
        <div
          class="swiper-button-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
        <Swiper
          ref="swiper"
          :slidesPerView="3"
          :spaceBetween="30"
          :modules="modules"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }"
          grab-cursor
          :loop="true"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false
          }"
        >
          <SwiperSlide v-for="tour in tours" :key="tour.id" class="!h-[580px] p-1">
            <tour-card :tour="tour" @click="handleTourSelect(tour.id)" />
          </SwiperSlide>
        </Swiper>
        <div
          class="swiper-button-next absolute right-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
      </div>
      <div class="mt-4 grid grid-cols-12 gap-4 md:mt-8 lg:gap-8">
        <div
          :class="tours.length > 0 ? 'col-span-full' : 'col-span-full md:col-span-6'"
          class="flex w-full flex-col items-start justify-between gap-y-6 rounded-[40px] bg-[#DDE5DC] px-6 py-8 dark:bg-[#272729]"
        >
          <p class="subscribe_text">
            Please, Subscribe for your Newsletters to be Informed about our News and Promotions
          </p>
          <form
            v-on:submit.prevent="emailSubscribe"
            class="flex w-full items-center justify-start gap-3 max-sm:flex-col"
          >
            <span
              v-if="userEmailValidation"
              name="email"
              class="ml-5 inline-block w-full text-red-600 max-sm:ml-0 max-sm:text-center"
              >{{ userEmailValidation }}</span
            >

            <span
              v-if="emailSubscribeSuccess"
              name="email"
              class="ml-5 inline-block w-full text-main max-sm:ml-0 max-sm:text-center"
              >Success</span
            >
            <div class="grid w-full grid-cols-6 gap-3 max-sm:flex-col">
              <input
                class="input subscribe_input col-span-full dark:!border-[#878787] md:col-span-4"
                type="text"
                name="EMAIL"
                autocomplete="off"
                @input="userEmailValidation = false"
                placeholder="E-mail Address"
                data-required="true"
                v-model="userEmail"
                required
              />
              <input type="hidden" value="1" name="OPT_IN" />
              <input type="hidden" name="email_address_check" value="" />
              <input type="hidden" name="locale" value="en" />

              <button
                type="submit"
                class="subscribe_button col-span-full w-full transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D32] md:col-span-2"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <div
          v-if="!tours.length"
          class="col-span-full flex flex-grow flex-col items-start justify-between gap-y-6 rounded-[40px] bg-main px-6 py-8 sm:p-8 md:col-span-6"
        >
          <div class="space-y-3">
            <span class="text-2xl/[110%] font-bold text-background">New Service</span>
            <p class="text-base/[110%] text-background sm:text-[18px]/[138%]">
              If you wish to book other services please click here.
            </p>
          </div>
          <button
            type="submit"
            @click="openSignUp"
            class="w-full rounded-[37px] bg-background py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-[#E8E8E8]/90 hover:text-black"
          >
            New Service
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="fromStayWithUs">
      <div class="mt-1 flex flex-col flex-wrap justify-between md:flex-row">
        <h1 class="title mr-[15px]" data-testid="success-title">Thanks for<br />your Request!</h1>
        <div v-if="tours.length > 0" class="block md:hidden">
          <p class="subtitle">
            If you have any Questions Feel Free to Send us
            <a class="text-main" :href="'mailto:' + email">Email</a> or
            <a class="text-main" :href="'tel:' + phone">Call us</a>
          </p>
          <div
            class="mt-6 flex flex-col justify-between rounded-[40px] bg-main px-6 py-8 pt-5 text-background"
          >
            <span class="mb-3 text-[24px]/[110%] font-bold">New Service</span>
            <span>If you wish to book other services please click here.</span>
            <button
              type="button"
              @click="openSignUp"
              class="mt-6 rounded-[37px] border border-main bg-background px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-white hover:text-[#2B2D32]"
            >
              New Service
            </button>
          </div>
        </div>
        <div v-if="tours.length > 0" class="hidden md:flex">
          <div class="flex flex-col justify-between pt-5">
            <button
              type="button"
              @click="openSignUp"
              class="rounded-[37px] border border-main px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-main hover:bg-main hover:text-[#2B2D32]"
            >
              New Service
            </button>
            <p class="subtitle">
              If you have any Questions Feel<br />Free to Send us
              <a class="text-main" :href="'mailto:' + email">Email</a> or
              <a class="text-main" :href="'tel:' + phone">Call us</a>
            </p>
          </div>
        </div>
      </div>
      <p class="subscribe_text payment_message mt-[30px]">{{ paymentMessage }}</p>
      <div class="relative mt-8 md:px-12">
        <div
          class="swiper-button-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
        <Swiper
          ref="swiper"
          :slidesPerView="3"
          :spaceBetween="30"
          :modules="modules"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }"
          grab-cursor
          :loop="true"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false
          }"
        >
          <SwiperSlide v-for="tour in tours" :key="tour.id" class="!h-[580px] p-1">
            <tour-card :tour="tour" @click="handleTourSelect(tour.id)" />
          </SwiperSlide>
        </Swiper>
        <div
          class="swiper-button-next absolute right-0 top-1/2 z-10 -translate-y-1/2 transform"
        ></div>
      </div>
      <div class="mt-4 grid grid-cols-12 gap-4 md:mt-8 lg:gap-8">
        <div
          :class="tours.length > 0 ? 'col-span-full' : 'col-span-full md:col-span-6'"
          class="flex w-full flex-col items-start justify-between gap-y-6 rounded-[40px] bg-[#DDE5DC] px-6 py-8 dark:bg-[#272729]"
        >
          <p class="subscribe_text">
            Please, Subscribe for your Newsletters to be Informed about our News and Promotions
          </p>
          <form
            v-on:submit.prevent="emailSubscribe"
            class="flex w-full items-center justify-start gap-3 max-sm:flex-col"
          >
            <span
              v-if="userEmailValidation"
              name="email"
              class="ml-5 inline-block w-full text-red-600 max-sm:ml-0 max-sm:text-center"
              >{{ userEmailValidation }}</span
            >

            <span
              v-if="emailSubscribeSuccess"
              name="email"
              class="ml-5 inline-block w-full text-main max-sm:ml-0 max-sm:text-center"
              >Success</span
            >
            <div class="grid w-full grid-cols-6 gap-3 max-sm:flex-col">
              <input
                class="input subscribe_input col-span-4 dark:!border-[#878787]"
                type="text"
                name="EMAIL"
                autocomplete="off"
                @input="userEmailValidation = false"
                placeholder="E-mail Address"
                data-required="true"
                v-model="userEmail"
                required
              />
              <input type="hidden" value="1" name="OPT_IN" />
              <input type="hidden" name="email_address_check" value="" />
              <input type="hidden" name="locale" value="en" />

              <button
                type="submit"
                class="subscribe_button col-span-2 transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D32]"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <div
          v-if="!tours.length"
          class="col-span-full flex flex-grow flex-col items-start justify-between gap-y-6 rounded-[40px] bg-main px-6 py-8 sm:p-8 md:col-span-6"
        >
          <div class="space-y-3">
            <span class="text-2xl/[110%] font-bold text-background">New Service</span>
            <p class="text-base/[110%] text-background sm:text-[18px]/[138%]">
              If you wish to book other services please click here.
            </p>
          </div>
          <button
            type="submit"
            @click="openSignUp"
            class="w-full rounded-[37px] bg-background py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-[#E8E8E8]/90 hover:text-black"
          >
            New Service
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="mt-1 flex flex-col flex-wrap justify-between md:flex-row">
        <h1 class="title mr-[15px]" data-testid="success-title">Thanks for<br />your Request!</h1>
        <div v-if="tours.length > 0" class="block md:hidden">
          <p class="subtitle">
            If you have any Questions Feel Free to Send us
            <a class="text-main" :href="'mailto:' + email">Email</a> or
            <a class="text-main" :href="'tel:' + phone">Call us</a>
          </p>
          <div
            class="mt-6 flex flex-col justify-between rounded-[40px] bg-main px-6 py-8 pt-5 text-background"
          >
            <span class="mb-3 text-[24px]/[110%] font-bold">New Service</span>
            <span>If you wish to book other services please click here.</span>
            <button
              type="button"
              @click="openSignUp"
              class="mt-6 rounded-[37px] border border-main bg-background px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-white hover:text-[#2B2D32]"
            >
              New Service
            </button>
          </div>
        </div>
        <div v-if="tours.length > 0" class="hidden md:flex">
          <div class="flex flex-col justify-between pt-5">
            <button
              type="button"
              @click="openSignUp"
              class="rounded-[37px] border border-main px-[67px] py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-main hover:bg-main hover:text-[#2B2D32]"
            >
              New Service
            </button>
            <p class="subtitle">
              If you have any Questions Feel<br />Free to Send us
              <a class="text-main" :href="'mailto:' + email">Email</a> or
              <a class="text-main" :href="'tel:' + phone">Call us</a>
            </p>
          </div>
        </div>
      </div>
      <p class="subscribe_text payment_message mt-[30px]">{{ paymentMessage }}</p>
      <SummaryInfo
        classnames="summary_title_button_wrapper border-b-[1px] border-placeholder"
        title="Service Data"
        custom-style="false"
        disabled="true"
        prepare="serviceData"
      />
      <SummaryInfo
        classnames="bg-white shadow-none relative z-20 -mt-14 px-4 !py-4 dark:bg-[#333639] sm:p-8 rounded-[40px] mt-[-38px]"
        title="Account Data"
        custom-style="false"
        disabled="false"
        prepare="contactData"
      />
      <div
        v-if="tours.length > 0"
        class="mt-6 rounded-[40px] border-2 border-background p-8 dark:bg-dark_wind"
      >
        <p class="text-[17px]">
          You can find below our most advisable tours available from the locations where the ride
          starts and end. Don't miss the opportunity to book the most appealing ones!
        </p>
      </div>
      <template class="mt-6 block md:hidden">
        <div class="flex flex-col gap-y-6">
          <tour-card
            v-for="tour in tours"
            :key="tour.id"
            :tour="tour"
            @click="handleTourSelect(tour.id)"
          />
        </div>
      </template>
      <div class="relative mt-8 hidden md:block md:px-12" data-testid="success-tours">
        <div class="swiper-button-prev absolute top-1/2 z-10 -translate-y-1/2 transform"></div>
        <Swiper
          ref="swiper"
          :slidesPerView="3"
          :spaceBetween="30"
          :modules="modules"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }"
          grab-cursor
          :loop="true"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false
          }"
        >
          <SwiperSlide v-for="tour in tours" :key="tour.id" class="!h-[580px] p-1">
            <tour-card :tour="tour" @click="handleTourSelect(tour.id)" />
          </SwiperSlide>
        </Swiper>
        <div class="swiper-button-next absolute top-1/2 z-10 -translate-y-1/2 transform"></div>
      </div>
      <div class="mt-6 grid grid-cols-12 gap-4 md:mt-8 lg:gap-8">
        <div
          :class="tours.length > 0 ? 'col-span-full' : 'col-span-full md:col-span-6'"
          class="flex w-full flex-col items-start justify-between gap-y-6 rounded-[40px] bg-[#DDE5DC] px-6 py-8 dark:bg-[#272729]"
        >
          <p class="subscribe_text">
            Please, Subscribe for your Newsletters to be Informed about our News and Promotions
          </p>
          <form
            v-on:submit.prevent="emailSubscribe"
            class="w-full flex-col items-center justify-start gap-3 max-sm:flex-col"
          >
            <span
              v-if="userEmailValidation"
              class="ml-5 inline-block w-full text-red-600 max-sm:ml-0 max-sm:text-center"
              >{{ userEmailValidation }}</span
            >

            <span
              v-if="emailSubscribeSuccess"
              class="ml-5 inline-block w-full text-main max-sm:ml-0 max-sm:text-center"
              >Success</span
            >
            <div class="grid w-full grid-cols-6 gap-3 max-sm:flex-col">
              <input
                class="input subscribe_input col-span-full dark:!border-[#878787] md:col-span-4"
                type="text"
                name="EMAIL"
                autocomplete="off"
                @input="userEmailValidation = false"
                placeholder="E-mail Address"
                data-required="true"
                v-model="userEmail"
                required
              />
              <input type="hidden" value="1" name="OPT_IN" />
              <input type="hidden" name="email_address_check" value="" />
              <input type="hidden" name="locale" value="en" />

              <button
                type="submit"
                class="subscribe_button col-span-full w-full transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D32] md:col-span-2"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <div
          v-if="!tours.length"
          class="col-span-full flex flex-grow flex-col items-start justify-between gap-y-6 rounded-[40px] bg-main px-6 py-8 sm:p-8 md:col-span-6"
        >
          <div class="space-y-3">
            <span class="text-2xl/[110%] font-bold text-background">New Service</span>
            <p class="text-base/[110%] text-background sm:text-[18px]/[138%]">
              If you wish to book other services please click here.
            </p>
          </div>
          <button
            type="submit"
            @click="openSignUp"
            class="w-full rounded-[37px] bg-background py-[22px] text-[18px]/[110%] font-semibold text-main transition-all duration-[0.3s] ease-in hover:bg-[#E8E8E8]/90 hover:text-black"
          >
            New Service
          </button>
        </div>
      </div>
    </div>
    <SignUp
      :key="orderData?.deal_id ?? 'signup-modal'"
      :isOpen="isSignUpOpen"
      @close="isSignUpOpen = false"
      @open-signin="openSignIn"
    />
    <SignIn :isOpen="isSignInOpen" @close="isSignInOpen = false" @open-signup="openSignUp" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useContactsStore } from '@/stores/user/contacts'
import type { Contact } from '@/types/stores/user/contacts'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper'
import type { SwiperModule } from 'swiper/types'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import * as yup from 'yup'

import { useOrderStore } from '@/stores/ride/order'
import { useUserStore } from '@/stores/user'
import { useProfileCompletionStore } from '@/stores/user/profile_completion'
import SignIn from '@/components/features/auth/SignIn.vue'
import SignUp from '@/components/features/auth/SignUp.vue'
import SummaryInfo from '@/components/features/summary/SummaryInfo.vue'
import { trackGtmEvent } from '@/utils/gtm'
import TourCard from '@/components/ui/tours/TourCard.vue'
import { useToursStore } from '@/stores/tours.js'

import type { TourSummary, AreaSummary, EmailSubscribeSuccessResponse } from '@/types/pages/success'

const route = useRoute()
const router = useRouter()

const isSignUpOpen = ref<boolean>(false)
const isSignInOpen = ref<boolean>(false)
const phone = ref<string>(import.meta.env.VITE_PROJECT_PHONE || '')
const email = ref<string>(import.meta.env.VITE_PROJECT_EMAIL || '')
const userEmail = ref<string>('')
const userEmailValidation = ref<string | false>(false)
const emailSubscribeSuccess = ref<boolean>(false)
const profileCompletionStore = useProfileCompletionStore()
const orderStore = useOrderStore()
const contactsStore = useContactsStore()
const userStore = useUserStore()
const toursStore = useToursStore()

const { tours } = storeToRefs(toursStore)

const modules: SwiperModule[] = [Navigation, Pagination, Autoplay]

const { fromServiceData } = storeToRefs(profileCompletionStore)
const { orderData, fromStayWithUs } = storeToRefs(orderStore)
const { isLoggedIn, user } = storeToRefs(userStore)

const isAgency = computed(() => {
  return user.value?.type === 'agency'
})

let paymentMessage = computed<string>(() => {
  const messageRequest =
    'We are currently receiving a very high volume of requests and answering you may take longer than normal.'
  const messagePaymentReceived =
    'Thank you! We have received your payment and are now processing your booking. You will receive a confirmation email shortly.'

  if (orderData.value?.type_of_service === 'toursRoadshows' && !isAgency.value)
    return messageRequest
  if (orderData.value?.consulting) return messageRequest

  return messagePaymentReceived
})

const emailSubscribe = (event: Event): void => {
  try {
    emailRules.validateSync(userEmail.value)

    const form = event.target as HTMLFormElement | null
    if (!form) return

    const url = `https://fabb078e.sibforms.com/serve/MUIFAFW0qI_VDlfier73h0uBz-YLYLSzWxv7EYpVUTIz5i38_PUcxJ0p9ZyaceQq-XxzaUB1UFPYEwICLmr4YwK6BaWvqCOtjyrG-7lc1PR9Q2mIi9S7wCfdoa1jzRGIAMMPT6FKP8Sttz4JSrqDUTPm96gxlrFvblaiwnaLmoFNFuuQautxzm8MmH6Rxb-EshqcFqezVQmVFplz?isAjax=1`
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const response = JSON.parse(xhr.responseText) as EmailSubscribeSuccessResponse
          if (response?.success) {
            emailSubscribeSuccess.value = true
            userEmailValidation.value = false
          }
        } catch (parseError) {
          console.error('Failed to parse subscription response', parseError)
        }
      }
    }
    xhr.open('POST', url)
    xhr.send(new FormData(form))
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      userEmailValidation.value = error.errors[0] ?? false
    } else {
      userEmailValidation.value = 'Email validation failed'
    }
  }
}

const toNumericId = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  return null
}

const handleTourSelect = (tourId: TourSummary['id']): void => {
  const numericId = toNumericId(tourId)
  if (numericId === null) return
  toursStore.setSelectedTourId(numericId)
  toursStore.saveSelectedTourIdToLocalStorage()
}

onBeforeMount(async () => {
  let serviceType = orderData.value.type_of_service
  let pickup = orderData.value.pickup
  if (serviceType && pickup) {
    orderStore.saveOrderForSuccessPage()
  } else {
    await orderStore.restoreOrderForSuccessPage()
    serviceType = orderData.value.type_of_service
    pickup = orderData.value.pickup
    if (!serviceType || !pickup) {
      await router.push('/forbidden')
      return
    }
  }

  let funnel, stepNumber

  if (
    route.name === 'success_payment_intent' &&
    (serviceType === 'oneWayTransfer' || serviceType === 'hourlyAsDirected')
  ) {
    funnel = serviceType === 'oneWayTransfer' ? 'one_way_transfer' : 'hourly_as_directed'
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: 5,
      booking_step_name: 'contact_details'
    })
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: 6,
      booking_step_name: 'service_details'
    })
  }

  switch (serviceType) {
    case 'oneWayTransfer':
      funnel = 'one_way_transfer'
      stepNumber = 7
      break
    case 'hourlyAsDirected':
      funnel = 'hourly_as_directed'
      stepNumber = 7
      break
    case 'toursRoadshows':
      funnel = 'tours_roadshows'
      stepNumber = 4
      break
  }

  if (funnel) {
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: stepNumber,
      booking_step_name: 'success'
    })
  }

  if (orderData.value && Object.keys(orderData.value).length > 0) {
    contactsStore.add(orderData.value as Omit<Contact, 'id' | 'temp_id' | 'last_usage'>)
  } else {
    console.warn('orderData.value is null or empty. Skipping contactsStore.add.')
  }
})

const emailRules = yup
  .string()
  .email('Email must be email')
  .required('Email is required')
  .max(230)
  .test(
    'email-dot',
    'The email address must contain a dot (.) in the second part (after the @ symbol), as addresses without a dot will not be accepted',
    (value) => {
      return value.includes('.')
    }
  )

const openSignUp = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'ridehistory' })
  } else {
    isSignUpOpen.value = true
    isSignInOpen.value = false
  }
}

const openSignIn = () => {
  isSignInOpen.value = true
  isSignUpOpen.value = false
}

onMounted(async () => {
  userStore.clearAgencyData()
  toursStore.clearTours()
  await toursStore.fetchTours()

  toursStore.saveToursToLocalStorage()
})
</script>
<style>
.success_page .summary_title_button_wrapper {
  padding-bottom: 32px !important;
}
</style>
