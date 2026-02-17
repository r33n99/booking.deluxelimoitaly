<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black opacity-50" @click="closePopUp"></div>
    <div
      class="relative z-10 w-full max-w-xl rounded-[35px] bg-white p-8 text-white shadow-lg dark:bg-[#272729]"
    >
      <button
        @click="closePopUp"
        aria-label="close"
        class="closeButton absolute right-4 top-4 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-black dark:text-white"
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
      <h1 class="title mb-6 text-6xl font-bold text-background dark:text-white">Sign Up</h1>
      <p class="mb-6 text-black dark:text-white">
        To book additional rides more efficiently and quickly, it's best to register. It only takes
        a few seconds and will enhance your experience on our site.
      </p>
      <!--      TODO понять что не так тут-->
      <Form @submit="submitForm" :validation-schema="validationSchema">
        <div class="mb-6 flex gap-4">
          <label for="" class="w-full space-y-2 text-gray-600 dark:text-[#878787]">
            <span>First Name <ErrorMessage class="text-red-600" name="first_name" /></span>
            <Field
              v-model="first_name"
              name="first_name"
              type="text"
              class="input ym-record-keys w-full"
              placeholder="First Name"
            />
          </label>
          <label for="" class="w-full space-y-2 text-gray-600 dark:text-[#878787]">
            <span>Last Name <ErrorMessage class="text-red-600" name="last_name" /></span>
            <Field
              v-model="last_name"
              name="last_name"
              type="text"
              class="input ym-record-keys w-full"
              placeholder="Last Name"
            />
          </label>
        </div>
        <div class="mb-6">
          <label for="" class="w-full space-y-2 text-gray-600 dark:text-[#878787]">
            <span
              >E-mail Address
              <ErrorMessage class="text-red-600" name="email" />
              <span class="float-end text-red-600" v-if="mailBusy">Mail is already registered</span>
            </span>
            <Field
              disabled
              v-model="email"
              name="email"
              type="email"
              class="input ym-record-keys w-full cursor-not-allowed !text-gray-400"
              :class="mailBusy ? 'outline outline-1 outline-red-600' : ''"
              @focus="mailBusy = false"
              placeholder="E-mail Address"
            />
          </label>
        </div>
        <div class="mb-6" :class="{ hide_phone: !hasPhone || !orderData.phone }">
          <label for="" class="w-full space-y-2 text-gray-600 dark:text-[#878787]">
            <span
              >Mobile Phone Number
              <ErrorMessage class="text-red-600" name="phone" />
            </span>
            <Field name="phone" v-slot="{ field }">
              <vue-tel-input
                v-bind="field"
                :defaultCountry="orderData.country_prefix"
                maxlength="230"
                @country-changed="countryChanged"
                @onInput="onInputPhone"
                v-on:beforeinput="validPhone($event, country_prefix)"
                class="input ym-record-keys m-0 w-full"
                v-model="phoneModel"
                inputClasses="input"
                :dropdownOptions="{
                  showFlags: true,
                  showDialCodeInList: true,
                  showDialCodeInSelection: true
                }"
              ></vue-tel-input>
            </Field>
          </label>
        </div>
        <button type="submit" class="button w-full">Sign Up</button>
      </Form>
      <p class="mt-4 space-x-1.5 text-center text-black dark:text-white">
        <span>If you already have an account, please</span>
        <button @click="handleSignInClick" type="button" class="text-main">log in here</button>
      </p>
    </div>
  </div>
  <PleaseWaitPreloader v-if="loading" />
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage } from 'vee-validate'
import type { SubmissionHandler } from 'vee-validate'
import { ref, inject, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { validPhone } from '@/plugins/validPhone'
import { AsYouType } from 'libphonenumber-js'
import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import PleaseWaitPreloader from '@/components/ui/loaders/PleaseWaitPreloader.vue'
import { useOrderStore } from '@/stores/ride'
import type { AxiosInstance } from 'axios'
import type { CountryCode } from 'libphonenumber-js'

interface CountryData {
  iso2: CountryCode
  dialCode: string
  [key: string]: any
}

interface SignUpFormValues {
  first_name: string
  last_name: string
  email: string
  country_prefix?: string
  website?: string
  phone?: string
  code?: string
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-signin'): void
}>()

const validationSchema = yup.object({
  email: yup.string().email('Email must be a valid email').required('Email is required').max(230),
  first_name: yup.string().required('Required').min(1, 'Minimum 1 symbol'),
  last_name: yup.string().required('Required').min(2, 'Minimum 2 symbols')
})

const phoneNationalNumber = ref<string>('')
const axios = inject('axios') as AxiosInstance
const router = useRouter()

const userStore = useUserStore()
const orderStore = useOrderStore()

const { orderData, updatedOrder, hasPhone } = storeToRefs(orderStore)
const phone = ref<string>('')
const country_prefix = ref<CountryCode>('US')
const code = ref<string>('')
const loading = ref<boolean>(false)
const first_name = ref<string>(orderData.value.first_name || '')
const last_name = ref<string>(orderData.value.last_name || '')
const email = ref<string>(orderData.value.email || '')
const mailBusy = ref<boolean>(false)

const projectLink = import.meta.env.VITE_PROJECT_URL as string

const phoneModel = computed({
  get: (): string => orderData.value.phone || phone.value,
  set: (value: string): void => {
    if (orderData.value.phone !== null) {
      orderData.value.phone = value
    } else {
      phone.value = value
    }
  }
})

const onInputPhone = (
  number: string,
  phoneObject: { country: { iso2: CountryCode }; nationalNumber: string }
): void => {
  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }
  orderData.value.phone = new AsYouType(phoneObject.country.iso2).input(number)
  phoneNationalNumber.value = phoneObject.nationalNumber
}

const countryChanged = (e: CountryData): void => {
  country_prefix.value = e.iso2
  if (orderData.value) {
    orderData.value.code = e.dialCode
    orderData.value.country_prefix = e.iso2
  }
  updatedOrder.value = !updatedOrder.value
}

const closePopUp = (): void => {
  emit('close')
}

const submitForm: SubmissionHandler = async (data) => {
  loading.value = true

  const formData = {
    ...data,
    country_prefix: country_prefix.value,
    website: projectLink,
    phone: phoneNationalNumber.value || '',
    code: code.value
  }

  try {
    const response = await axios.post('/auth/register', formData)

    if (response?.data?.status === 'success') {
      userStore.fill(response.data.data)
      router.push({ name: 'ridehistory' })
    } else {
      loading.value = false
    }
  } catch (error: any) {
    loading.value = false
    if (error?.response?.status === 409) {
      mailBusy.value = true
    }
    console.error('Registration error:', error)
  }
}

const handleSignInClick = (): void => {
  closePopUp()
  emit('open-signin')
}
</script>
