<template>
  <h1 v-if="isLoggedIn" class="title mr-[15px] mt-8 pb-6 md:mt-[45px] md:pb-[64px]">
    Hello, {{ user?.first_name }}!
  </h1>
  <div v-if="isLoggedIn" class="flex flex-col max-lg:justify-between md:flex-row">
    <div
      class="left_side-wrapper scrollbar-hidden flex-nowrap overflow-x-scroll md:mr-[19.18%] md:overflow-x-visible"
    >
      <button
        @click="newRide"
        type="button"
        class="summary_edit_button m-0 text-nowrap px-[22px] py-[8px] font-bold md:px-[22px] md:py-[8px]"
      >
        Book a New Ride <span class="account__button__disc"></span>
      </button>
      <button type="button" class="account__button active text-nowrap">
        Account Information <span class="account__button__disc"></span>
      </button>
      <router-link
        v-if="isAgency"
        to="/account/agencyinformation"
        class="account__button text-nowrap"
        >Agency information <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/ridehistory" class="account__button text-nowrap"
        >Ride History <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/documentsreceipts" class="account__button text-nowrap"
        >Documents/Receipts<span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/termsofservice" class="account__button text-nowrap"
        >Terms of Service<span class="account__button__disc"></span
      ></router-link>
      <button v-if="!isMobile" @click="logOut" type="button" class="account__button text-[#878787]">
        Log Out
      </button>
    </div>
    <div v-if="isMobile" class="mt-[6px]">
      <button @click="logOut" type="button" class="account__button text-[#878787]">Log Out</button>
    </div>
    <div class="flex w-full flex-col-reverse xl:flex-row">
      <Form
        v-if="isUserReady"
        @submit="onSubmit"
        class="right_side-wrapper xl:mr-[45px] xl:min-w-[552px]"
        :validation-schema="accountInfoSchema"
        v-slot="{ errors }"
      >
        <div
          class="right_side w-full max-w-none rounded-[40px] bg-white px-4 py-6 dark:bg-[#333639] max-md:mb-0 md:p-8 lg:max-w-[552px]"
        >
          <p class="mb-5 text-background dark:text-white md:hidden">Account Data</p>

          <span class="account_label">First Name</span>
          <Field
            type="text"
            name="first_name"
            maxlength="50"
            class="input account_input"
            :class="{ error: errors.first_name, '!text-[#6c6d6f]': !isEditable }"
            v-model="userForm.first_name"
            placeholder="First Name*"
            @beforeinput="utils.isLetter($event)"
            :disabled="!isEditable"
          />
          <span class="account_label">Last Name</span>
          <Field
            type="text"
            name="last_name"
            maxlength="50"
            class="input account_input"
            :class="{ error: errors.last_name, '!text-[#6c6d6f]': !isEditable }"
            v-model="userForm.last_name"
            placeholder="Last Name*"
            @beforeinput="utils.isLetter($event)"
            :disabled="!isEditable"
          />
          <span class="account_label">E-mail Address</span>
          <Field
            name="email"
            type="email"
            class="input account_input"
            placeholder="E-mail Address"
            v-model="userForm.email"
            :class="{ error: errors.email, '!text-[#6c6d6f]': !isEditable }"
            :disabled="!isEditable"
          />
          <span class="account_label">Mobile Phone Number</span>
          <vue-tel-input
            v-model="userForm.phone"
            :defaultCountry="userForm.country_prefix || undefined"
            @onInput="onInputPhone"
            @country-changed="countryChanged"
            v-on:beforeinput="validPhone($event, country_prefix || userForm.country_prefix)"
            class="input account_input mb-8 px-4 py-0"
            :class="!isEditable ? 'disabled' : ''"
            :dropdownOptions="{
              showFlags: true,
              showDialCodeInList: true,
              showDialCodeInSelection: true
            }"
            v-bind="bindProps"
          ></vue-tel-input>
          <button
            type="button"
            v-if="!isEditable"
            class="summary_edit_button w-full border-dark_main px-4 py-[18px] text-base/[17.6px] text-dark_main dark:border-main dark:text-main dark:hover:text-background md:py-5 md:text-[18px]/[23.8px]"
            @click="openEdit"
          >
            Edit
          </button>
          <button
            :disabled="isSubmitting"
            type="submit"
            v-if="isEditable"
            class="summary_edit_button save w-full px-4 py-[18px] text-base/[17.6px] md:py-5 md:text-[18px]/[23.8px]"
          >
            <LoadingSpinner
              v-if="isSubmitting"
              class="size-[18px] animate-spin stroke-[#2B2D32] md:size-6"
            />
            <span v-else>Save</span>
          </button>
        </div>
      </Form>
      <div
        v-if="agencyInformation"
        class="border-1 mb-6 mt-6 flex h-max w-full flex-col rounded-[40px] border border-main p-8 md:mt-0"
        :class="agencyInformation.isCreditsBlock ? 'bg-main' : 'bg-main/5'"
      >
        <template v-if="agencyInformation.isCreditsBlock">
          <p class="flex items-center justify-between gap-x-3 leading-[25px] text-background">
            <span class="text-[14px] font-semibold md:text-[18px]">Credits balance</span>
            <span class="text-[19px] font-bold md:text-[24px]"
              >{{ agencyInformation.balance }} EUR</span
            >
          </p>
          <hr class="my-3 border-t border-black/5" />
          <p class="flex flex-col text-[12px] leading-[15px] text-background md:text-[14px]">
            Your Agency status has been approved!
            <template v-if="agencyInformation.discount > 0">
              You now receive an additional {{ agencyInformation.discount }}% discount.
            </template>
          </p>
        </template>

        <template v-else>
          <p
            class="mb-3 flex items-center gap-x-3 text-[14px] leading-[25px] text-main md:text-[18px]"
          >
            <info-icon class="fill-main" />
            Information
          </p>
          <p class="flex flex-col text-[12px] leading-[15px] text-[#878787] md:text-[14px]">
            <template v-if="agencyInformation && agencyInformation.isLink">
              <span>{{ agencyInformation.text }}</span>
              <span class="mt-[10px]">
                {{ agencyInformation.textBefore }}
                <router-link
                  :to="agencyInformation.to"
                  class="cursor-pointer text-black dark:text-white"
                >
                  {{ agencyInformation.linkText }}
                </router-link>
                {{ agencyInformation.textAfter }}
              </span>
            </template>
            <template v-else-if="agencyInformation">
              {{ agencyInformation.text }}
            </template>
          </p>
        </template>
      </div>
    </div>
  </div>
  <h1 v-if="!isLoggedIn" class="title mr-[15px] mt-[5rem]">
    Please login to view account information
  </h1>
  <router-link v-if="!isLoggedIn" to="/account/signin" class="button mt-[15px] w-fit"
    >Sign in
  </router-link>
  <swipe-modal
    v-model="isModal"
    v-if="isMobile"
    contents-height="60vh"
    border-top-radius="16px"
    background-color="ffffff"
    tip-color="#CDCFD0"
  >
    <car-popup-content />
  </swipe-modal>
</template>

<script setup lang="ts">
import { ref, inject, reactive, computed, onBeforeMount, watch } from 'vue'
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { useRouter } from 'vue-router'
import { AsYouType } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'
import { validPhone } from '@/plugins/validPhone'
import * as yup from 'yup'
import { Form, Field, type SubmissionHandler } from 'vee-validate'
import { useMobile } from '@/compose/ismobile'
import { useContactsStore, useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import { useOrderStore, useRidesHistoryStore } from '@/stores/ride'
import InfoIcon from '@/components/ui/icons/InfoIcon.vue'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useFetcher } from '@/compose/axios'

import type {
  AccountFormValues,
  AccountEditPayload,
  AgencyInformation,
  AccountFormModel,
  BindProps,
  UtilsInjection,
  VueTelInputEvent,
  VueTelCountry
} from '@/types/pages/account/AccountInformation'

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
const trustyStore = useTrustyStore()
const router = useRouter()
const ridesStore = useRidesHistoryStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const contactsStore = useContactsStore()
const { isLoggedIn, user } = storeToRefs(userStore)
const utils = inject<UtilsInjection>('utils')
if (!utils) {
  throw new Error('Utils helpers were not provided')
}

type EditUserSubmitPayload = Parameters<typeof userStore.editUserSubmit>[0]

const isSubmitting = ref<boolean>(false)
const isModal = ref<boolean>(false)

const code = ref<string | null>(null)
const country_prefix = ref<string | null>(null)

const userForm = reactive<AccountFormModel>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country_prefix: null
})

const isAgency = computed<boolean>(() => {
  const currentUser = user.value
  return currentUser?.type === 'agency' || currentUser?.type === 'request for Agency'
})

const agencyInformation = computed<AgencyInformation>(() => {
  const currentUser = user.value
  if (!currentUser) {
    return null
  }

  if (currentUser.show_information === 3) {
    return {
      isLink: true,
      text: 'Your Agency status is currently under verification. While we review your request, you can continue using the platform without restrictions.',
      textBefore: 'Please click on the ',
      linkText: 'Agency Information',
      textAfter:
        ' link in the left menu and complete the data — it will speed up the approval process',
      to: '/account/agencyinformation'
    }
  }

  if (currentUser.show_information === 1) {
    return {
      isLink: false,
      text: 'Your request for Agency status has been declined. However, you can still use the platform as a Private user.'
    }
  }

  if (currentUser.type === 'request for Agency' && currentUser.show_information === null) {
    return {
      isLink: false,
      text: 'Your Agency status is currently under verification. While we review your request, you can continue using the platform without restrictions.'
    }
  }

  if (currentUser.show_information === 2 && currentUser.type === 'request for Agency') {
    return {
      isLink: false,
      text: 'Your B2B Status has been approved!'
    }
  }

  if (
    currentUser.type === 'agency' &&
    (currentUser.show_information === null || currentUser.show_information === 2)
  ) {
    if (currentUser.agency_balance > 0) {
      return {
        isCreditsBlock: true,
        balance: currentUser.agency_balance,
        discount: currentUser.agency_discount
      }
    }

    const balanceText =
      currentUser.agency_balance > 0
        ? `Your current credits balance is ${currentUser.agency_balance},`
        : ''

    const discountText =
      currentUser.agency_discount > 0
        ? ` and you now receive an additional ${currentUser.agency_discount}% discount.`
        : ''

    return {
      isLink: false,
      text: `Your B2B Status has been approved! ${balanceText}${discountText}`.trim()
    }
  }

  return null
})

const isUserReady = computed<boolean>(() => {
  const currentUser = user.value
  return !!(
    currentUser &&
    typeof currentUser.first_name === 'string' &&
    typeof currentUser.last_name === 'string' &&
    typeof currentUser.email === 'string' &&
    typeof currentUser.phone === 'string'
  )
})

const newRide = () => {
  userStore.clearAgencyData()
  trustyStore.clearInput('pickup')
  trustyStore.clearInput('dropoff')
  orderStore.$reset()
  orderStore.changeTypeOrder('NEW')
  router.push({ name: 'home' })
}

const countryChanged = (country: VueTelCountry) => {
  code.value = `+${country.dialCode}`
  country_prefix.value = country.iso2
  userForm.country_prefix = country.iso2
}

const phoneNationalNumber = ref<string>('')

const onInputPhone = (number: string, phoneObject: VueTelInputEvent) => {
  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }
  const isoCode = phoneObject.country?.iso2
  const defaultCountry = isoCode ? (isoCode.toUpperCase() as CountryCode) : undefined
  userForm.phone = new AsYouType(defaultCountry).input(number)
  phoneNationalNumber.value = phoneObject.nationalNumber || ''

  code.value = `+${phoneObject?.country?.dialCode}`
  country_prefix.value = phoneObject?.country?.iso2 || null
  userForm.country_prefix = phoneObject?.country?.iso2 || null
}

const bindProps = reactive<BindProps>({
  enabledFlags: true,
  preferredCountries: ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'],
  inputClasses: 'input'
})

const isEditable = ref<boolean>(false)
const { isMobile } = useMobile()

const logOut = () => {
  ridesStore.$reset()
  userStore.preventLogout()
  axiosInstance.get(`/spy/logout`)
  setTimeout(() => router.push('/account/signin'), 100)
}

const openEdit = () => {
  isEditable.value = true
}
const onSubmit: SubmissionHandler = (rawValues) => {
  if (!user.value) return
  const values = rawValues as AccountFormValues

  isSubmitting.value = true
  const editPayload: AccountEditPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    phone: phoneNationalNumber.value,
    user_id: user.value.id,
    code: code.value,
    country_prefix: country_prefix.value
  }

  const requestPayload = {
    ...user.value,
    ...editPayload
  } as EditUserSubmitPayload

  userStore
    .editUserSubmit(requestPayload)
    .then((success) => {
      if (!success) return
      isEditable.value = false
      contactsStore.add({
        code: editPayload.code ?? undefined,
        country_prefix: editPayload.country_prefix ?? undefined,
        first_name: editPayload.first_name,
        last_name: editPayload.last_name,
        email: editPayload.email,
        phone: editPayload.phone
      })
    })
    .finally(() => {
      isSubmitting.value = false
    })
}
const accountInfoSchema = yup.object({
  email: yup.string().required().email().max(230),
  first_name: yup.string().required().max(50),
  last_name: yup.string().required().max(50)
})
const resetUserForm = () => {
  userForm.first_name = ''
  userForm.last_name = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.country_prefix = null
  code.value = null
  country_prefix.value = null
  phoneNationalNumber.value = ''
}

watch(
  user,
  (currentUser) => {
    if (!currentUser) {
      resetUserForm()
      return
    }

    userForm.first_name = currentUser.first_name ?? ''
    userForm.last_name = currentUser.last_name ?? ''
    userForm.email = currentUser.email ?? ''
    userForm.phone = currentUser.phone ?? ''
    userForm.country_prefix = currentUser.country_prefix ?? null

    code.value = currentUser.code
      ? currentUser.code.startsWith('+')
        ? currentUser.code
        : `+${currentUser.code}`
      : null
    country_prefix.value = currentUser.country_prefix ?? null
    phoneNationalNumber.value = currentUser.phone ?? ''
  },
  { immediate: true }
)

onBeforeMount(() => {
  userStore.getUserInfo().then(() => {
    const currentUser = user.value
    if (currentUser) {
      currentUser.phone = String(currentUser.phone || '')
      currentUser.email = String(currentUser.email || '')
      currentUser.first_name = String(currentUser.first_name || '')
      currentUser.last_name = String(currentUser.last_name || '')
    }
  })
})
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}
</style>
