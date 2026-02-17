<template>
  <div class="flex items-center justify-between gap-x-1">
    <router-link type="button" class="go_back_button group" :to="backButtonUrl">
      <svg
        width="22"
        height="14"
        viewBox="0 0 22 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.28801 1.87399L6.22701 0.812988L0.0400085 7L6.22701 13.187L7.28801 12.126L2.91101 7.75H22V6.25H2.91101L7.28801 1.87399Z"
          class="go_back_button_svg"
        />
      </svg>
      <span class="go_back_button__text">{{ backButtonText }}</span>
    </router-link>
    <span class="mt-6 flex gap-1 text-black dark:text-white"
      >Step
      <p class="text-main">1</p>
      of 5</span
    >
  </div>
  <div class="flex flex-col gap-x-16">
    <h1 class="title md:text-[80px]/[88px] lg:w-min">Contact</h1>
    <SummaryInfo
      customStyle="true"
      classnames="summary_title_button_wrapper form_to_edit md:items-start pb-16 md:pb-20"
      title="Ride Summary"
      disabled="false"
    />
  </div>
  <div class="contact_form_wrapper">
    <div class="w-full">
      <div v-if="contactsData.length" class="">
        <ContactsChoise @getContact="getContact($event)" />
      </div>
      <Form
        @submit="onSubmit"
        class="form"
        :validation-schema="contactSchema"
        v-slot="{ errors, isSubmitting }"
      >
        <span v-if="isSubmitting">
          {{ errorFill(errors) }}
        </span>

        <div
          v-if="!utils.isEmpty(errorOnForm) && isShowModal"
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
              <p :key="index" v-for="(error, index) in errors">{{ error }}</p>
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

        <Field
          type="text"
          maxlength="50"
          name="first_name"
          class="input ym-record-keys"
          :class="errors.first_name ? 'error' : ''"
          v-model="firstName"
          placeholder="First Name*"
          @beforeinput="utils.isLetter($event)"
        />
        <Field
          type="text"
          maxlength="50"
          name="last_name"
          class="input ym-record-keys"
          :class="errors.last_name ? 'error' : ''"
          v-model="lastName"
          placeholder="Last Name*"
          @beforeinput="utils.isLetter($event)"
        />
        <div
          class="relative mb-4 w-full md:w-[calc(100%/4-8px)]"
          :class="serverEmailError ? 'max-md:mb-6' : 'mb-4'"
        >
          <Field
            type="email"
            maxlength="230"
            name="email"
            v-model="email"
            class="input ym-record-keys mb-0 w-full"
            :class="{ error: errors.email || serverEmailError }"
            placeholder="E-mail Address*"
            @input="serverEmailError = ''"
          />
          <span
            v-if="serverEmailError"
            class="absolute left-0 top-full pl-4 text-xs text-error md:text-sm"
            >{{ serverEmailError }}</span
          >
        </div>
        <vue-tel-input
          :key="country_prefix"
          v-model="phone"
          maxlength="230"
          @country-changed="countryChanged"
          v-on:beforeinput="validPhone($event, country_prefix)"
          class="input ym-record-keys"
          :dropdownOptions="{
            showFlags: true,
            showDialCodeInList: true,
            showDialCodeInSelection: true
          }"
          :defaultCountry="country_prefix"
          v-bind="bindProps"
        ></vue-tel-input>
        <div class="next_step_button_wrapper">
          <button :disabled="isSubmitting" type="submit" class="next_step_button">Next</button>
          <p class="privacy_text">
            By clicking Get a Quote, you accept our
            <a
              target="_blank"
              :href="projectLink + 'terms-and-conditions/'"
              class="text-dark_main text-main"
              >Terms & conditions</a
            >
            and
            <a
              target="_blank"
              :href="projectLink + 'privacy-policy/#cookiepolicypar'"
              class="text-dark_main text-main"
              >Privacy policy.</a
            >
          </p>
        </div>
      </Form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, onBeforeMount, reactive, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { isAxiosError, type AxiosInstance } from 'axios'

import { validPhone, preloadValidPhone } from '@/plugins/validPhone'
import { useContactsStore, useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { Field, Form, SubmissionHandler } from 'vee-validate'
import * as yup from 'yup'
import { useCarsStore } from '@/stores/ride/cars'
import { useOrderStore } from '@/stores/ride/order'
import SummaryInfo from '@/components/features/summary/SummaryInfo.vue'
import ContactsChoise from '@/components/features/contacts/ContactsChoise.vue'
import { useOrderSubmit } from '@/compose/useOrderSubmit'
import type { Contact } from '@/types/stores/user/contacts'

interface TelCountry {
  name: string
  dialCode: string
  iso2: string
}

const projectLink = ref(import.meta.env.VITE_PROJECT_URL)
const carsStore = useCarsStore()
const { cars, selectedCar } = storeToRefs(carsStore)
const orderStore = useOrderStore()
const { orderData, orderId, fleet } = storeToRefs(orderStore)
const userStore = useUserStore()
const contactsStore = useContactsStore()
const { contactsData } = storeToRefs(contactsStore)
const { user, isLoggedIn } = storeToRefs(userStore)
const { selectedContact } = storeToRefs(contactsStore)

watch(selectedContact, (contact) => {
  if (!allowSelectedContactSync.value) {
    return
  }

  allowSelectedContactSync.value = false

  if (!contact) {
    firstName.value = null
    lastName.value = null
    email.value = null
    code.value = null
    country_prefix.value = null
    phone.value = null
    return
  }

  firstName.value = contact.first_name
  lastName.value = contact.last_name
  email.value = contact.email ?? null
  code.value = contact.code ?? null
  country_prefix.value = contact.country_prefix ?? null
  phone.value = contact.phone
})

const isShowModal = ref(true)
type ErrorBag = Record<string, string | undefined>

const errorOnForm = ref<ErrorBag | null>(null)
const errorFill = (errorBag: ErrorBag): string => {
  errorOnForm.value = errorBag
  return ''
}
const serverEmailError = ref('')

watch(errorOnForm, (newVal) => {
  if (!utils.isEmpty(newVal)) {
    isShowModal.value = true
  }
})

function closeModal() {
  isShowModal.value = false
}

const router = useRouter()
const axios = inject<AxiosInstance>('axios')
const utils = inject<any>('utils')
const regexLink = inject<RegExp>('regexLink')
const regexIsHttps = inject<RegExp>('regexIsHttps')
const regexNameField = inject<RegExp>('regexNameField')

if (!axios) {
  throw new Error('Axios instance is not provided')
}

const {
  prepareSubmission,
  createOrderRequest,
  handleOrderResponse,
  syncUserPhoneData,
  processServiceFlow,
  isRequesting
} = useOrderSubmit(axios)

if (!regexLink || !regexIsHttps || !regexNameField) {
  throw new Error('Validation regex patterns are not provided')
}
const isTour = orderData.value.type_of_service === 'toursRoadshows'

const firstName = ref<string | null>(null)
const lastName = ref<string | null>(null)
const email = ref<string | null>(null)
const phone = ref<string | null>(null)

watch(email, () => {
  serverEmailError.value = ''
})
const code = ref<string | null>(null)
const country_prefix = ref<string | null>(null)
const backButtonUrl = ref(isTour ? '/vehicle' : '/')
const backButtonText = ref(isTour ? 'Go Back to Select Vehicle' : 'Go Back')

function getContact(contact: Contact | null) {
  if (skipNextContactEmission.value) {
    skipNextContactEmission.value = false
    return
  }

  allowSelectedContactSync.value = true
  contactsStore.select(contact)
}

const countryChanged = (country: TelCountry) => {
  const countryName = country.name.split(' (')[0]
  localStorage.setItem('selectedCountry', countryName)
  code.value = country.dialCode
  country_prefix.value = country.iso2
}

const bindProps = reactive({
  enabledFlags: true,
  preferredCountries: ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'],
  inputClasses: 'input'
})

type SupportedEmailDomain = 'gmail' | 'hotmail'

const emailDomains: Record<SupportedEmailDomain, string> = {
  gmail: 'com',
  hotmail: 'com'
}

const isSupportedEmailDomain = (value: string): value is SupportedEmailDomain => {
  return value === 'gmail' || value === 'hotmail'
}

const contactSchema = yup.object({
  email: yup
    .string()
    .email('Email must be email')
    .required('Email is required')
    .test(
      'email-dot',
      'The email address must contain a dot (.) in the second part (after the @ symbol), as addresses without a dot will not be accepted',
      (value) => {
        if (!value) {
          return false
        }
        return value.includes('.')
      }
    )
    .test('email-right-domain', 'The email has not a valid domain', (value) => {
      if (!value) {
        return false
      }
      const listParts = value.split('@')
      if (listParts.length) {
        const listDomain = listParts[1]
        if (listDomain) {
          const listDomainParts = listDomain.split('.')
          if (listDomainParts.length === 2) {
            let domainZone = listDomainParts.pop()
            const domainKey = listDomainParts[0]

            if (isSupportedEmailDomain(domainKey)) {
              return emailDomains[domainKey] === domainZone
            }
            return true
          }
          return true
        }
        return true
      }
      return true
    })
    .max(230)
    .matches(regexIsHttps, {
      excludeEmptyString: true,
      message: 'Email should not contain special characters or links'
    })
    .matches(regexLink, {
      excludeEmptyString: true,
      message: 'Email should not contain special characters or links'
    }),
  first_name: yup
    .string()
    .required('First name is required')
    .max(50, 'First name should not exceed 50 characters')
    .matches(regexNameField, {
      excludeEmptyString: true,
      message: 'First name should not contain special characters or links'
    })
    .matches(regexIsHttps, {
      excludeEmptyString: true,
      message: 'First name should not contain special characters or links'
    })
    .matches(regexLink, {
      excludeEmptyString: true,
      message: 'First name should not contain special characters or links'
    }),
  last_name: yup
    .string()
    .required('Last name is required')
    .max(50, 'Last name should not exceed 50 character')
    .matches(regexNameField, {
      excludeEmptyString: true,
      message: 'Last name should not contain special characters or links'
    })
    .matches(regexIsHttps, {
      excludeEmptyString: true,
      message: 'Last name should not contain special characters or links'
    })
    .matches(regexLink, {
      excludeEmptyString: true,
      message: 'Last name should not contain special characters or links'
    })
})

const contactStorageKeys = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'code',
  'country_prefix'
] as const

const hasStoredContactValues = contactStorageKeys.some((key) => {
  const value = localStorage.getItem(key)
  return Boolean(value && value.length > 0)
})

const skipNextContactEmission = ref(hasStoredContactValues)
const allowSelectedContactSync = ref(false)

const getStoredValue = (key: string, ...fallbacks: Array<string | null | undefined>): string => {
  const stored = localStorage.getItem(key)
  if (stored && stored.length > 0) {
    return stored
  }

  for (const candidate of fallbacks) {
    if (candidate) {
      return candidate
    }
  }

  return ''
}

const onSubmit: SubmissionHandler = async (values) => {
  prepareSubmission({
    values,
    code: code.value,
    phone: phone.value,
    countryPrefix: country_prefix.value
  })

  const serviceType = orderData.value.type_of_service

  if (serviceType === 'hourlyAsDirected') {
    const hours = orderData.value.hours ?? 0
    orderStore.update({ distance: hours * 20 })
  }

  let apiData

  try {
    apiData = await createOrderRequest()
  } catch (error) {
    isRequesting.value = false

    if (isAxiosError(error) && error.response?.data?.message) {
      const message = error.response.data.message
      if (message.toLowerCase().includes('email')) {
        serverEmailError.value = message
        return
      }
    }

    console.error('Order creation failed:', error)
    // You might want to show a generic error message here if it's not an email error
    throw error
  }

  if (!apiData) {
    return
  }

  const { order: responseOrder } = handleOrderResponse(apiData)

  syncUserPhoneData()
  await processServiceFlow({
    serviceType,
    router,
    responseOrder
  })
}

onBeforeMount(async () => {
  // Preload libphonenumber-js for phone validation
  await preloadValidPhone()
  if (user.value?.id) {
    firstName.value = getStoredValue('firstName', user.value.first_name, orderData.value.first_name)
    lastName.value = getStoredValue('lastName', user.value.last_name, orderData.value.last_name)
    email.value = getStoredValue('email', user.value.email, orderData.value.email)
    phone.value = getStoredValue('phone', user.value.phone, orderData.value.phone)
    code.value = getStoredValue('code', user.value.code, orderData.value.code)
    country_prefix.value = getStoredValue(
      'country_prefix',
      user.value.country_prefix,
      orderData.value.country_prefix
    )

    contactsStore.select({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      phone: phone.value,
      code: code.value,
      country_prefix: country_prefix.value
    })
  } else if (orderData.value.first_name || orderData.value.email) {
    firstName.value = getStoredValue('firstName', orderData.value.first_name)
    lastName.value = getStoredValue('lastName', orderData.value.last_name)
    email.value = getStoredValue('email', orderData.value.email)
    phone.value = getStoredValue('phone', orderData.value.phone)
    code.value = getStoredValue('code', orderData.value.code)
    country_prefix.value = getStoredValue('country_prefix', orderData.value.country_prefix)
  } else {
    firstName.value = getStoredValue('firstName')
    lastName.value = getStoredValue('lastName')
    email.value = getStoredValue('email')
    phone.value = getStoredValue('phone')
    code.value = getStoredValue('code')
    country_prefix.value = getStoredValue('country_prefix')
  }

  if (orderData.value.type_of_service != 'toursRoadshows') {
    orderStore.update({
      car: null,
      extra_kms: null,
      total: null,
      deal_id: null,
      lead_id: null,
      contact_id: null,
      transaction_id: null,
      id: null,
      payment_timer: null,
      step: 1,
      mail_car: 0,
      type: null
    })

    orderStore.$resetOrder()
    orderStore.$resetOrderId()
    carsStore.$reset()
  } else {
    orderStore.update({
      extra_kms: null,
      total: null,
      deal_id: null,
      lead_id: null,
      contact_id: null,
      transaction_id: null,
      id: null,
      payment_timer: null,
      step: 1,
      mail_car: 0,
      type: null
    })

    orderStore.$resetOrder()
    orderStore.$resetOrderId()
  }

  if (orderData.value.allowedPages.success_payment_intent) {
    orderStore.$reset()
    await router.push('forbidden')
  }
  const redirectStep = orderData.value.redirectStep ?? 0
  if (orderData.value.utm_source != null && redirectStep < 1) {
    orderData.value.redirectStep = 1
  }

  switch (orderData.value.type_of_service) {
    case 'oneWayTransfer':
      orderStore.update({
        reqs: null,
        hours: null,
        extra_kms: null
      })
      break
    case 'hourlyAsDirected':
      orderStore.update({
        dropoff: null,
        reqs: null
      })
      break
  }

  contactsStore.removeNullPhone()

  // Clear Timer in Payment
  orderData.value.countdown = 'stop'
})

const persistContactFields = useDebounceFn(() => {
  localStorage.setItem('firstName', firstName.value || '')
  localStorage.setItem('lastName', lastName.value || '')
  localStorage.setItem('email', email.value || '')
  localStorage.setItem('phone', phone.value || '')
  localStorage.setItem('code', code.value || '')
  localStorage.setItem('country_prefix', country_prefix.value || '')
}, 500)

watch([firstName, lastName, email, phone, code, country_prefix], () => {
  persistContactFields()
})
</script>
