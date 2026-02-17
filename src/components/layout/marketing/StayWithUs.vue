<template>
  <div
    v-if="stayWithUsModalStore.isOpen"
    @click="stayWithUsModalStore.close"
    class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 dark:bg-opacity-80"
  >
    <div
      @click.stop
      class="contact_form_wrapper m-0 h-max w-full max-w-[1440px] bg-white dark:bg-darkmode_form_background max-md:p-4"
    >
      <div class="w-full">
        <Form
          @submit="onSubmit"
          class="grid gap-4 md:grid-cols-3"
          :validation-schema="contactSchema"
          v-slot="{ errors, isSubmitting }"
        >
          <span v-if="isSubmitting">
            {{ errorFill(errors) }}
          </span>

          <div
            v-if="!utils.isEmpty(errorOnForm) && isShowErrorModal"
            @click="closeErrorModal"
            class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
          >
            <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
              <div class="flex justify-end p-4">
                <button
                  @click="stayWithUsModalStore.close"
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
                  @click="closeErrorModal"
                  type="button"
                  class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>

          <div
            class="relative col-span-full mb-4 grid grid-cols-[minmax(0,_1fr),_32px] items-center gap-x-4"
          >
            <span class="justify-self-center text-2xl/[26.4px] text-background dark:text-white"
              >Stay with us! We are offering promotions!</span
            >
            <button
              @click="stayWithUsModalStore.close"
              aria-label="close"
              class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
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
          <Field
            type="text"
            maxlength="50"
            name="full_name"
            class="input ym-record-keys m-0 w-full"
            :class="errors.full_name ? 'error' : ''"
            v-model="fullName"
            placeholder="Name"
            @beforeinput="utils.isLetter($event)"
          />
          <Field
            type="email"
            maxlength="230"
            name="email"
            class="input ym-record-keys m-0 w-full"
            :class="errors.email ? 'error' : ''"
            v-model="email"
            placeholder="E-mail Address*"
          />
          <vue-tel-input
            v-model="phone"
            maxlength="230"
            @country-changed="countryChanged"
            @onInput="onInputPhone"
            v-on:beforeinput="validateLengthNumber($event, $event.target.value)"
            class="input ym-record-keys m-0 w-full"
            :dropdownOptions="{
              showFlags: true,
              showDialCodeInList: true,
              showDialCodeInSelection: true
            }"
            v-bind="bindProps"
          ></vue-tel-input>
          <Field maxlength="230" v-model="notes" name="notes" v-slot="{ field }">
            <textarea
              ref="textarea"
              v-model="notes"
              maxlength="230"
              v-bind="field"
              :class="errors.notes ? 'error' : ''"
              class="input ym-record-keys col-span-full mb-0 w-full resize-none overflow-hidden"
              rows="1"
              placeholder="Number of passengers, pick up location, drop off location, pick up time & etc."
            ></textarea>
          </Field>
          <div
            class="next_step_button_wrapper col-span-full m-0 items-center gap-4 md:flex-row-reverse"
          >
            <button :disabled="isSubmitting" type="submit" class="next_step_button">Next</button>
            <p class="privacy_text m-0 max-md:text-center">
              By clicking Get a Quote, you accept our
              <a
                target="_blank"
                :href="projectLink + 'terms-and-conditions/'"
                class="text-dark_main"
                >Terms & conditions</a
              >
              and
              <a
                target="_blank"
                :href="projectLink + 'privacy-policy/#cookiepolicypar'"
                class="text-dark_main"
                >Privacy policy.</a
              >
            </p>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive, watch, onBeforeUnmount, computed } from 'vue'
import * as yup from 'yup'
import { Form, Field, type SubmissionHandler } from 'vee-validate'
import { useRouter } from 'vue-router'
import { AsYouType, type CountryCode } from 'libphonenumber-js'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/ride/order'
import { useStayWithUsModalStore } from '@/stores/ui/stayWithUsModal'
import type { AxiosInstance } from 'axios'
import type { OrderData } from '@/types/stores/ride/order'
import type { VueTelInputEvent } from 'vue-tel-input'

type StayWithUsFormValues = {
  full_name: string | null
  email: string
  notes: string | null
  code?: string
  phone?: string
  country_prefix?: string
  website?: string
}

const stayWithUsModalStore = useStayWithUsModalStore()
const axios = inject<AxiosInstance | undefined>('axios')
const utils = inject<any>('utils')
const projectLink = ref<string>(import.meta.env.VITE_PROJECT_URL ?? '')
const isShowErrorModal = ref<boolean>(true)
const errorOnForm = ref<Record<string, string | undefined> | null>(null)
const router = useRouter()

const errorFill = (errorBag: Record<string, string | undefined>) => {
  errorOnForm.value = errorBag
}

watch(errorOnForm, (newVal) => {
  if (newVal && !utils.isEmpty(newVal)) {
    showErrorModal()
  }
})

const closeErrorModal = () => {
  isShowErrorModal.value = false
}

const showErrorModal = () => {
  isShowErrorModal.value = true
}

const validateLengthNumber = (event: InputEvent, value: string) => {
  if (value.length > 20) {
    event.preventDefault()
  }
}

const regexLink = inject<RegExp | undefined>('regexLink')
const regexIsHttps = inject<RegExp | undefined>('regexIsHttps')
const regexNameField = inject<RegExp | undefined>('regexNameField')

const orderStore = useOrderStore()
const { orderData, fromStayWithUs } = storeToRefs(orderStore)
const fullName = ref<string | null>(null)
const email = ref<string | null>(null)
const phone = ref<string | null>(null)
const notes = ref<string | null>(null)
const code = ref<string>('')
const countryPrefix = ref<string>('')

const countryChanged = (country: VueTelInputEvent['country']) => {
  code.value = country.dialCode
  countryPrefix.value = country.iso2
}

const phoneNationalNumber = ref<string>('')

const onInputPhone = (number: string, phoneObject: VueTelInputEvent) => {
  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }
  const iso2 = phoneObject.country.iso2?.toUpperCase() as CountryCode | undefined
  const formatter = new AsYouType(iso2)
  const formatted = formatter.input(number)
  phone.value = formatted
  phoneNationalNumber.value = phoneObject.nationalNumber ?? ''
}

const bindProps = reactive({
  mode: 'national' as const,
  enabledFlags: true,
  preferredCountries: ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'],
  inputClasses: 'input'
})

const matchesRule = (regex: RegExp | undefined) =>
  regex ? { excludeEmptyString: true } : undefined

const contactSchema = computed(() =>
  yup.object({
    email: yup
      .string()
      .email('Email must be email')
      .required('Email is required')
      .test(
        'email-dot',
        'The email address must contain a dot (.) in the second part (after the @ symbol), as addresses without a dot will not be accepted',
        (value) => Boolean(value && value.includes('.'))
      )
      .max(230)
      .matches(regexIsHttps ?? /.*/, {
        excludeEmptyString: true,
        message: 'Email should not contain special characters or links'
      })
      .matches(regexLink ?? /.*/, {
        excludeEmptyString: true,
        message: 'Email should not contain special characters or links'
      }),
    full_name: yup
      .string()
      .nullable()
      .max(50, 'Name should not exceed 50 characters')
      .matches(regexNameField ?? /.*/, matchesRule(regexNameField))
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink)),
    notes: yup.string().nullable().max(230, 'Notes should not exceed 230 character')
  })
)

const submitStayWithUs = async (values: StayWithUsFormValues) => {
  if (!axios) {
    return
  }

  const submission: StayWithUsFormValues = {
    ...values,
    code: `+${code.value}`,
    phone: phoneNationalNumber.value,
    country_prefix: countryPrefix.value,
    website: 'limoitaly'
  }

  try {
    await axios.post('/zoho/createRequest', {
      name: submission.full_name,
      last_name: '–',
      email: submission.email,
      mobile_phone: `${code.value}${phoneNationalNumber.value}`,
      notes: submission.notes
    })
  } catch (error) {
    console.error('Failed to create Zoho request', error)
  }

  try {
    await axios.post('/email/stay_with_us', submission)
    fromStayWithUs.value = true
    stayWithUsModalStore.close()
    orderData.value.allowedPages.success = 1 as OrderData['allowedPages']['success']
    router.push('/success')
  } catch (error) {
    console.error('Failed to submit stay with us form', error)
  }
}

const onSubmit: SubmissionHandler = async (values) => {
  await submitStayWithUs(values as StayWithUsFormValues)
}

let initialMouseMoves = 0
const mouseMoveHandler = (event: MouseEvent) => {
  initialMouseMoves += 1
  if (initialMouseMoves > 20 && event.clientY < 16) {
    sessionStorage.setItem('wasStayWithUsShown', 'true')
    window.removeEventListener('mousemove', mouseMoveHandler)
    stayWithUsModalStore.show()
  }
}

if (!sessionStorage.getItem('wasStayWithUsShown')) {
  window.addEventListener('mousemove', mouseMoveHandler)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', mouseMoveHandler)
})
</script>
