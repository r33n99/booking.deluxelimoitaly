<template>
  <div class="flex flex-col justify-between">
    <div>
      <p
        class="mb-[73px] mt-[32px] text-[40px] font-bold leading-[44px] text-[#2B2D32] dark:text-[#FFFFFF] md:mb-[64px] md:mt-[40px] md:text-[80px] md:leading-[70px]"
      >
        Enter Details
      </p>
      <Form
        @submit="onSubmit"
        class="right_side-wrapper flex w-full flex-row justify-center"
        :validation-schema="accountInfoSchema"
        v-slot="{ errors }"
      >
        <div
          class="right_side w-full max-w-none rounded-[40px] bg-white px-4 py-6 dark:bg-[#333639] max-md:mb-0 md:rounded-b-[40px] md:p-8 lg:max-w-[552px]"
        >
          <span class="account_label">First Name</span>
          <Field
            type="text"
            name="first_name"
            maxlength="50"
            class="input account_input"
            v-model="first_name"
            placeholder="First Name"
            :class="{ 'error-input': errors.first_name }"
            @beforeinput="utils.isLetter($event)"
          />
          <span class="account_label">Last Name</span>
          <Field
            type="text"
            name="last_name"
            maxlength="50"
            class="input account_input"
            v-model="last_name"
            placeholder="Last Name"
            :class="{ 'error-input': errors.last_name }"
            @beforeinput="utils.isLetter($event)"
          />
          <span class="account_label">E-mail Address</span>
          <Field
            name="email"
            type="email"
            class="input account_input"
            placeholder="E-mail Address"
            v-model="email"
            :class="{ 'error-input': errors.email }"
          />
          <span class="account_label">Mobile Phone Number</span>
          <vue-tel-input
            :key="country_prefix"
            v-model="phone"
            maxlength="230"
            @on-input="onInputPhone"
            @country-changed="countryChanged"
            v-on:beforeinput="validPhone($event, country_prefix)"
            class="input account_input mb-8 px-4 py-0"
            :dropdownOptions="{
              showFlags: true,
              showDialCodeInList: true,
              showDialCodeInSelection: true
            }"
            :defaultCountry="country_prefix"
            v-bind="bindProps"
          ></vue-tel-input>
          <button
            :disabled="loading"
            type="submit"
            class="button w-full border-dark_main px-4 py-[18px] text-base/[17.6px] dark:border-main dark:hover:text-background md:py-5 md:text-[18px]/[23.8px]"
          >
            Next
          </button>
          <!--          <div-->
          <!--            v-if="isMobile"-->
          <!--            class="mt-6 flex flex-col items-center text-center text-[12px] leading-[17px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
          <!--          >-->
          <!--            <p>-->
          <!--              For multiple rides/days service-->
          <!--              <span @click="stayWithUsModalStore.show" class="text-main cursor-pointer"-->
          <!--                >click here</span-->
          <!--              >.-->
          <!--            </p>-->
          <!--            <p>For Agency requests add your IATA or License Code in the notes</p>-->
          <!--          </div>-->
        </div>
      </Form>
    </div>
    <!--    <div-->
    <!--      v-if="!isMobile"-->
    <!--      class="flex flex-col items-center text-center text-[18px] leading-[25px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
    <!--    >-->
    <!--      <p>-->
    <!--        For multiple rides/days service-->
    <!--        <span @click="stayWithUsModalStore.show" class="text-main cursor-pointer">click here</span>.-->
    <!--      </p>-->
    <!--      <p>For Agency requests add your IATA or License Code in the notes</p>-->
    <!--    </div>-->
    <registration-modal v-if="modal" @close-modal="closeModal" :text="errorText" />
    <PleaseWaitPreloader v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { inject, onBeforeMount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AsYouType } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'
import * as yup from 'yup'
import { Form, Field, type SubmissionHandler } from 'vee-validate'
import { validPhone } from '@/plugins/validPhone'
import { useFetcher } from '@/compose/axios'
import { useRegistrationStore } from '@/stores/user/registration'
import RegistrationModal from '@/components/layout/modals/RegistrationModal.vue'
import PleaseWaitPreloader from '@/components/ui/loaders/PleaseWaitPreloader.vue'
// import { useMobile } from '@/compose/ismobile'
// import { useStayWithUsModalStore } from '@/stores/ui/stayWithUsModal'
import type {
  RegistrationDetailsFormValues,
  RegistrationDetailsRequest,
  RegistrationSendCodeResponse,
  RegistrationTelInputBindProps,
  RegistrationUtils,
  VueTelInputCountry
} from '@/types/pages/registration/DetailsRegistration'

// const stayWithUsModalStore = useStayWithUsModalStore()

const injectedUtils = inject<RegistrationUtils>('utils')
if (!injectedUtils) {
  throw new Error('Utils plugin is not provided')
}
const utils = injectedUtils

const registrationStore = useRegistrationStore()
const { defaultData } = storeToRefs(registrationStore)
const code = ref<string>(defaultData.value.code || '')
const country_prefix = ref<string | null>(defaultData.value.country_prefix || null)
const first_name = ref<string>(defaultData.value.first_name || '')
const last_name = ref<string>(defaultData.value.last_name || '')
const email = ref<string>(defaultData.value.email || '')
const phone = ref<string>(defaultData.value.phone || '')

const loading = ref<boolean>(false)
const modal = ref<boolean>(false)
const errorText = ref<string>('')
const router = useRouter()

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

const countryChanged = (country: VueTelInputCountry): void => {
  code.value = `+${country.dialCode}`
  country_prefix.value = country.iso2
}

const phoneNationalNumber = ref<string>('')

const onInputPhone = (number: string): void => {
  if (!number) {
    phone.value = ''
    phoneNationalNumber.value = ''
    return
  }

  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }
  const defaultCountry = country_prefix.value
    ? (country_prefix.value.toUpperCase() as CountryCode)
    : undefined
  const formatter = new AsYouType(defaultCountry)
  phone.value = formatter.input(number)

  phoneNationalNumber.value = phone.value.replace(/[^\d]/g, '')
}

const bindProps = reactive<RegistrationTelInputBindProps>({
  enabledFlags: true,
  preferredCountries: ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'],
  inputClasses: 'input'
})

// const { isMobile } = useMobile()
const route = useRoute()
const toStep = Number(route.meta.step ?? 1) || 1

const closeModal = (): void => {
  modal.value = false
}
const onSubmit: SubmissionHandler = (values) => {
  loading.value = true
  const data: RegistrationDetailsRequest = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email
  }
  if (phone.value) {
    data.phone = phone.value
    data.country_code = code.value.startsWith('+') ? code.value.slice(1) : code.value
  }
  registrationStore.updateData({
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    code: code.value,
    phone: phone.value,
    country_prefix: country_prefix.value
  })
  axiosInstance
    .post<RegistrationSendCodeResponse>('auth/send_code', data)
    .then((response) => {
      if (response.data.status === 'error' && response.data.message !== 'Code already send') {
        errorText.value = response.data.message
        modal.value = true
        loading.value = false
      } else {
        if (response.data.message === 'Code already send') {
          resendCode(data.email)
        }
        registrationStore.handleChangeStep(2)
        loading.value = false
        router.push('/registration/emailconfirmation')
      }
    })
    .catch((error: unknown) => {
      loading.value = false
      const message = error instanceof Error ? error.message : String(error)
      console.error(message)
    })
    .finally(() => {
      loading.value = false
    })
}
const resendCode = (email: string): void => {
  loading.value = true
  axiosInstance
    .post('/auth/resend_code', { email: email })
    .then(() => {
      loading.value = false
      code.value = ''
    })
    .catch((error: unknown) => {
      loading.value = false
      const message = error instanceof Error ? error.message : String(error)
      console.error(message)
    })
}

const accountInfoSchema = yup.object({
  email: yup.string().required().email().max(230),
  first_name: yup.string().required().max(50),
  last_name: yup.string().required().max(50)
})
onBeforeMount(() => {
  registrationStore.handleCheckStep(toStep)
})
</script>

<style scoped>
button[disabled] {
  cursor: not-allowed !important;
}
.error-input {
  border: 1px solid #fa4141 !important;
}
</style>
