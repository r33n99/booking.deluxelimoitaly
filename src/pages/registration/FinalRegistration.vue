<template>
  <div class="flex !min-h-[80vh] flex-col justify-between">
    <div>
      <router-link
        @click="registrationStore.handleChangeStep(2)"
        type="button"
        class="go_back_button group"
        :to="backButtonUrl"
      >
        <ArrowLeftIcon />
        <span class="go_back_button__text">Go Back</span>
      </router-link>
      <p
        class="mb-[73px] mt-[32px] text-[40px] font-bold leading-[44px] text-[#2B2D32] dark:text-[#FFFFFF] md:mb-[64px] md:mt-[40px] md:text-[80px] md:leading-[70px]"
      >
        Finalize Registration
      </p>
    </div>
    <div class="flex flex-1 items-center justify-center">
      <Form
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
        class="finalizeRegistrationForm right_side-wrapper !mt-0 flex w-full flex-row items-center justify-center pt-8 md:pt-0"
        :validation-schema="passwordSchema"
        :validateOnBlur="true"
        :validateOnChange="false"
        :validateOnInput="false"
        :validateOnMount="false"
        v-slot="{ errors, setFieldValue, setFieldTouched, meta }"
      >
        <div
          class="w-full max-w-none rounded-[40px] bg-white px-4 py-6 dark:bg-[#333639] max-md:mb-0 md:rounded-b-[40px] md:p-8 lg:max-w-[552px]"
        >
          <span class="account_label">Password</span>
          <div class="relative">
            <Field name="password" v-slot="{ field, meta: fieldMeta }">
              <input
                v-bind="field"
                :type="showPass ? 'text' : 'password'"
                maxlength="50"
                class="input account_input mt-1"
                placeholder="Password"
                :class="{ 'error-input': errors.password && fieldMeta.touched }"
              />
            </Field>
            <div
              class="tooltip_input_info tooltip bg-[#FFFFFF] text-[#2B2D32] dark:bg-[#3D4043] dark:text-[#878787]"
              v-if="tooltip.password || errors.password"
            >
              <p>
                At least 8 characters, at least one capital and small letter, number and special
                character.
              </p>
            </div>
            <img
              class="eye_pass"
              @click="toggleShowPass('password')"
              :src="showPass ? eyeShowIcon : eyeHideIcon"
              alt="eye-show"
            />
            <img
              class="tooltip_input"
              :src="infoIcon"
              alt="info"
              @mouseover="showTooltip('password')"
              @mouseleave="hideTooltip('password')"
            />
          </div>
          <span class="account_label">Confirm password</span>
          <div class="relative">
            <Field name="confirm_password" v-slot="{ field, meta: fieldMeta }">
              <input
                v-bind="field"
                :type="showConfirmPass ? 'text' : 'password'"
                maxlength="50"
                class="input account_input mt-1"
                placeholder="Confirm password"
                :class="{ 'error-input': errors.confirm_password && fieldMeta.touched }"
              />
            </Field>
            <div
              class="tooltip_input_info tooltip bg-[#FFFFFF] text-[#2B2D32] dark:bg-[#3D4043] dark:text-[#878787]"
              v-if="tooltip.confirm_password || errors.confirm_password"
            >
              <p>Your password and confirmation password must match.</p>
            </div>
            <img
              class="eye_pass"
              @click="toggleShowPass('confirm_password')"
              :src="showConfirmPass ? eyeShowIcon : eyeHideIcon"
              alt="eye-show"
            />
            <img
              class="tooltip_input"
              :src="infoIcon"
              alt="info"
              @mouseover="showTooltip('confirm_password')"
              @mouseleave="hideTooltip('confirm_password')"
            />
          </div>
          <div
            :class="{ 'mb-8': passType === 'private', 'mb-2': passType === 'request for Agency' }"
          >
            <div class="relative flex items-center gap-3">
              <Field
                type="radio"
                value="private"
                name="invoice_radio"
                class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                v-model="passType"
                id="private-radio"
              />
              <label
                for="private-radio"
                class="cursor-pointer text-sm text-background dark:text-white md:text-[20px]"
                >Private</label
              >
              <div
                class="tooltip_radio_private tooltip bg-[#FFFFFF] text-[#2B2D32] dark:bg-[#3D4043] dark:text-[#878787]"
                v-if="tooltip.private"
              >
                <p>
                  Select this if you book services for yourself, your family, friends, or for
                  corporate travel for colleagues and company executives
                </p>
              </div>
              <img
                style="cursor: help"
                :src="info"
                alt="info"
                @mouseover="showTooltip('private')"
                @mouseleave="hideTooltip('private')"
              />
            </div>
            <div class="relative mt-[16px] flex items-center gap-3">
              <Field
                id="agency-radio"
                type="radio"
                value="request for Agency"
                name="invoice_radio"
                class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                v-model="passType"
              />
              <label
                for="agency-radio"
                class="cursor-pointer text-sm text-background dark:text-white md:text-[20px]"
                >Agency</label
              >
              <div
                class="tooltip_radio_agency tooltip bg-[#FFFFFF] text-[#2B2D32] dark:bg-[#3D4043] dark:text-[#878787]"
                v-if="tooltip.agency"
              >
                <p>
                  Select this if you are a travel agency, tour operator, chauffuer company or travel
                  broker of any level, booking services for your clients.
                </p>
              </div>
              <img
                style="cursor: help"
                :src="info"
                alt="info"
                @mouseover="showTooltip('agency')"
                @mouseleave="hideTooltip('agency')"
              />
            </div>
            <div v-if="passType === 'request for Agency'" class="mt-6" id="registerFinalize">
              <Field name="title" v-slot="{ field }">
                <div class="relative mb-8 flex w-full">
                  <div
                    @click="toggleDropdown"
                    :class="errors.title && 'error-input'"
                    class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                  >
                    <p v-if="!field.value" class="text-[#878787]">
                      Select <span class="text-[#E30000]">*</span>
                    </p>
                    <p v-else>{{ field.value }}</p>
                    <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
                  </div>
                  <div
                    v-if="isDropdownOpen"
                    class="absolute top-[calc(100%+8px)] z-10 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
                  >
                    <div
                      v-for="option in options"
                      :key="option"
                      @click="
                        () => {
                          setFieldValue('title', option)
                          setFieldTouched('title', true)
                          isDropdownOpen = false
                        }
                      "
                      class="cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white"
                      :class="{
                        'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white':
                          field.value === option
                      }"
                    >
                      {{ option }}
                    </div>
                  </div>
                </div>
              </Field>
              <div class="flex justify-between gap-6 max-sm:flex-col">
                <div class="w-full">
                  <span class="account_label">Company name*</span>
                  <Field
                    type="text"
                    name="company_name"
                    maxlength="230"
                    class="input account_input mb-8 mt-1"
                    :class="errors.company_name && 'error'"
                    placeholder="Company Name"
                  />
                </div>
                <div class="w-full">
                  <span class="account_label">VAT number*</span>
                  <Field
                    type="text"
                    name="vat"
                    maxlength="50"
                    class="input account_input mb-8 mt-1"
                    :class="errors.vat && 'error'"
                    placeholder="VAT number"
                  />
                </div>
              </div>
              <div class="flex justify-between gap-6 max-sm:flex-col">
                <div class="w-full">
                  <span class="account_label">Country*</span>
                  <Field
                    as="div"
                    name="country"
                    maxlength="100"
                    class="input account_input relative mb-8 mt-1 cursor-pointer"
                    :class="errors.country && 'error'"
                    placeholder="Country"
                    value="asda"
                    v-model="selectCountry"
                    id="selectCountry"
                    @click="showSelectCountry = !showSelectCountry"
                  >
                    <div class="flex items-center justify-between">
                      <p>{{ selectCountry }}</p>
                      <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
                    </div>
                    <div
                      v-if="showSelectCountry"
                      class="absolute left-0 top-14 z-10 flex max-h-[400px] w-[232px] flex-col overflow-hidden overflow-y-scroll rounded-[30px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
                    >
                      <div
                        v-for="(country, index) of countries"
                        :key="index"
                        @click.stop="selectedCountry(country)"
                        class="cursor-pointer rounded-md px-2 py-3 hover:bg-[#CCF2C8] dark:hover:bg-[#CCF2C8]/5"
                      >
                        {{ country }}
                      </div>
                    </div>
                  </Field>
                </div>
                <div class="w-full">
                  <span class="account_label">Region/State/Province*</span>
                  <Field
                    type="text"
                    name="region"
                    maxlength="230"
                    class="input account_input mb-8 mt-1 placeholder:text-[17px]"
                    :class="errors.region && 'error'"
                    placeholder="Region/State/Province"
                  />
                </div>
              </div>
              <div>
                <span class="account_label">City*</span>
                <Field
                  type="text"
                  name="city"
                  maxlength="100"
                  class="input account_input mb-8 mt-1"
                  :class="errors.city && 'error'"
                  placeholder="City"
                />
              </div>
              <div>
                <span class="account_label">Address*</span>
                <Field
                  type="text"
                  name="address"
                  maxlength="150"
                  class="input account_input mb-8 mt-1"
                  :class="errors.address && 'error'"
                  placeholder="Address"
                />
              </div>
              <div>
                <span class="account_label">Company Main Phone*</span>
                <Field name="company_main_phone" v-slot="{ field }">
                  <vue-tel-input
                    v-bind="field"
                    maxlength="20"
                    v-model="agencyData.company_main_phone"
                    @onInput="onInputPhone"
                    @blur="
                      () => {
                        if (!agencyData.company_main_phone)
                          agencyData.company_main_phone_error = true
                      }
                    "
                    @country-changed="countryChanged"
                    v-on:beforeinput="handleBeforeInput"
                    class="input ym-record-keys m-0 mb-8 w-full"
                    :class="agencyData.company_main_phone_error && 'error'"
                    inputClasses="input"
                    :dropdownOptions="{
                      showFlags: true,
                      showDialCodeInList: true,
                      showDialCodeInSelection: true
                    }"
                    :inputOptions="{
                      placeholder: 'Company Main Phone'
                    }"
                    :preferredCountries="preferredCountries"
                  />
                </Field>
              </div>
              <div>
                <span class="account_label">Company Main Email*</span>
                <Field
                  type="email"
                  name="company_main_email"
                  maxlength="230"
                  class="input account_input mb-8 mt-1"
                  :class="errors.company_main_email && 'error'"
                  placeholder="Company Main Email"
                />
              </div>
              <div>
                <span class="account_label">Postal/ZIP Code*</span>
                <Field
                  type="text"
                  name="cap_zip"
                  maxlength="230"
                  class="input account_input mb-8 mt-1"
                  :class="errors.cap_zip && 'error'"
                  placeholder="Postal/ZIP Code"
                />
              </div>
            </div>
          </div>
          <button
            :disabled="loading"
            type="submit"
            class="button w-full border-dark_main px-4 py-[18px] text-base/[17.6px] dark:border-main dark:hover:text-background md:py-5 md:text-[18px]/[23.8px]"
          >
            Save
          </button>
          <!--        <div-->
          <!--          v-if="isMobile"-->
          <!--          class="mt-6 flex flex-col items-center text-center text-[12px] leading-[17px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
          <!--        >-->
          <!--          <p>-->
          <!--            For multiple rides/days service-->
          <!--            <span @click="stayWithUsModalStore.show" class="text-main cursor-pointer"-->
          <!--              >click here</span-->
          <!--            >.-->
          <!--          </p>-->
          <!--          <p>For Agency requests add your IATA or License Code in the notes</p>-->
          <!--        </div>-->
        </div>
      </Form>
    </div>
    <!--    <div-->
    <!--      v-if="!isMobile"-->
    <!--      class="mt-[40px] flex flex-col items-center text-center text-[18px] leading-[25px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
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
import { onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue'
import * as yup from 'yup'
import { Form, Field, type SubmissionContext, type SubmissionHandler } from 'vee-validate'
// import { useMobile } from '@/compose/ismobile'
import { useRoute, useRouter } from 'vue-router'
import ArrowLeftIcon from '@/components/ui/icons/ArrowLeftIcon.vue'
import { validPhone } from '@/plugins/validPhone'
import { AsYouType } from 'libphonenumber-js'
import info from '~project_assets/images/info.svg'
import EyeShow from '~project_assets/images/eye-show.svg'
import EyeHide from '~project_assets/images/eye-hide.svg'
import { storeToRefs } from 'pinia'
import { useFetcher } from '@/compose/axios'
import { useRegistrationStore, useUserStore } from '@/stores/user'
import RegistrationModal from '@/components/layout/modals/RegistrationModal.vue'
// import { useStayWithUsModalStore } from '@/stores/ui/stayWithUsModal'

import type {
  AgencyDataState,
  CountryChangeEvent,
  FinalizeRegistrationRequest,
  FinalizeRegistrationResponse,
  FinalRegistrationFormValues,
  LoginRequest,
  LoginResponse,
  RegistrationType,
  TooltipKey,
  TooltipState
} from '@/types/pages/registration/FinalRegistration'
import type { User } from '@/types/stores/user/profile'

// const stayWithUsModalStore = useStayWithUsModalStore()

const registrationStore = useRegistrationStore()
const userStore = useUserStore()
const { hash, defaultData } = storeToRefs(registrationStore)
const password = ref<string>('')
const confirm_password = ref<string>('')
const backButtonUrl = ref<string>('/registration/emailconfirmation')
const passType = ref<RegistrationType>('private')
const loading = ref<boolean>(false)
const modal = ref<boolean>(false)
const errorText = ref<string>('')
const showPass = ref<boolean>(false)
const showConfirmPass = ref<boolean>(false)

// Экспортируем импортированные изображения для использования в template
const eyeShowIcon = EyeShow
const eyeHideIcon = EyeHide
const infoIcon = info
const agencyData = reactive<AgencyDataState>({
  company_main_phone: '',
  company_main_phone_code: null,
  company_main_phone_error: false
})
const country_prefix = ref<string | null>(null)
const selectCountry = ref<string>('Italy')
const showSelectCountry = ref<boolean>(false)
const preferredCountries = ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae']

const countries = [
  'Austria',
  'Belgium',
  'Bulgaria',
  'Greece',
  'Denmark',
  'Ireland',
  'Spain',
  'Italy',
  'Cyprus',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Finland',
  'France',
  'Croatia',
  'Czechia',
  'Sweden',
  'Estonia',
  'Germany',
  'Hungary',
  'Switzerland'
]

// const { isMobile } = useMobile()
const tooltip = reactive<TooltipState>({
  private: false,
  agency: false,
  password: false,
  confirm_password: false
})
const router = useRouter()
const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
const projectLink = ref<string>(import.meta.env.VITE_PROJECT_URL as string)

const options: string[] = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.', 'Dr.', 'Prof.']
const isDropdownOpen = ref<boolean>(false)

const toggleDropdown = (): void => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleBeforeInput = (event: InputEvent): void => {
  validPhone(event, country_prefix.value)
  agencyData.company_main_phone_error = false
}

const toggleShowPass = (type: TooltipKey): void => {
  if (type === 'password') {
    showPass.value = !showPass.value
  } else {
    showConfirmPass.value = !showConfirmPass.value
  }
}

const countryChanged = ({ iso2, dialCode }: CountryChangeEvent): void => {
  country_prefix.value = iso2
  agencyData.company_main_phone_code = dialCode
}

const onInputPhone = (number: string): void => {
  if (!number) {
    agencyData.company_main_phone = ''
    return
  }

  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }

  // AsYouType automatically extracts digits and formats them
  // This handles both manual input (blocked by validPhone) and paste operations
  // that might include +, spaces, or other characters
  const formatter = country_prefix.value
    ? //@ts-ignore
      new AsYouType(country_prefix.value)
    : new AsYouType()
  agencyData.company_main_phone = formatter.input(number)
}

const showTooltip = (type: TooltipKey): void => {
  tooltip[type] = true
}

const hideTooltip = (type: TooltipKey): void => {
  tooltip[type] = false
}
const route = useRoute()
const toStep = Number(route.meta.step ?? 3) || 3

const closeModal = (): void => {
  modal.value = false
}
const onInvalidSubmit = async ({ values, errors }: { values: any; errors: any }): Promise<void> => {
  if (passType.value === 'request for Agency') {
    if (!values.company_main_phone) {
      agencyData.company_main_phone_error = true
    }
    if (
      errors?.password ||
      errors?.confirm_password ||
      errors?.title ||
      errors?.company_name ||
      errors?.vat ||
      errors?.region
    ) {
      const formElement = document.querySelector('.finalizeRegistrationForm')
      if (formElement instanceof HTMLElement) {
        formElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}
const onSubmit: SubmissionHandler = async (values: any) => {
  try {
    if (!agencyData.company_main_phone && passType.value === 'request for Agency') {
      agencyData.company_main_phone_error = true
      return
    }
    if (!hash.value) {
      errorText.value =
        'Registration session expired or already completed. Please start registration again.'
      modal.value = true
      return
    }
    loading.value = true

    let data: FinalizeRegistrationRequest = {
      hash: hash.value,
      email: defaultData.value.email,
      password: values.password,
      password_confirmation: values.confirm_password,
      type: passType.value
    }
    if (passType.value === 'request for Agency') {
      data = {
        ...data,
        ...values,
        company_main_phone: agencyData.company_main_phone,
        company_main_phone_code: agencyData.company_main_phone_code,
        title: values?.title?.replace(/\.$/, '')
      }
    }
    delete data.invoice_radio

    const response = await axiosInstance.post<FinalizeRegistrationResponse>(
      '/auth/set_password',
      data
    )

    if (response.data.status === 'error') {
      loading.value = false
      return
    }

    await login(values)

    registrationStore.resetHash()
    registrationStore.handleChangeStep(1)

    loading.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    errorText.value = message
    modal.value = true
    loading.value = false
  } finally {
    loading.value = false
  }
}

const login = async (values: FinalRegistrationFormValues): Promise<void> => {
  try {
    const loginData: LoginRequest = {
      email: defaultData.value.email,
      password: values.password,
      website: projectLink.value,
      check: true
    }

    const response = await axiosInstance.post<LoginResponse<User>>('/auth/login', loginData)

    userStore.fill((response.data?.data as User | null) ?? null)
    router.push('/account/accountinformation')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    throw err
  }
}

const selectedCountry = (country: string): void => {
  selectCountry.value = country
  showSelectCountry.value = false
}
const handleClick = (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  if (!target.closest('#selectCountry')) showSelectCountry.value = false
}
const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[\W_]/, 'Password must contain at least one special character'),
  confirm_password: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  invoice_radio: yup.string().required(),
  title: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  company_name: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  vat: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  country: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  region: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  city: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  address: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  }),
  company_main_email: yup
    .string()
    .email()
    .when('invoice_radio', {
      is: (value: string) => value === 'request for Agency',
      then: (schema) =>
        schema
          .required()
          .test(
            'email-dot',
            'The email address must contain a dot (.) in the second part (after the @ symbol), as addresses without a dot will not be accepted',
            (value) => {
              return value.includes('.')
            }
          ),
      otherwise: (schema) => schema
    }),
  cap_zip: yup.string().when('invoice_radio', {
    is: (value: string) => value === 'request for Agency',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema
  })
})

onBeforeMount(() => {
  registrationStore.handleCheckStep(toStep)
  document.addEventListener('click', handleClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClick)
})
</script>

<style scoped>
button[disabled] {
  cursor: not-allowed !important;
}
.error-input {
  border: 1px solid #fa4141 !important;
}

input[type='radio']:focus {
  outline: none;
  box-shadow: none;
}
.tooltip {
  border-radius: 16px;
  padding: 16px 19px;
  font-size: 14px;
  line-height: 15px;
  cursor: help;
}
.tooltip_radio_private {
  width: 265px;
  position: absolute;
  top: -105px;
  left: 20%;
}
.tooltip_radio_agency {
  width: 265px;
  position: absolute;
  top: -115px;
  left: 20%;
  cursor: help;
}

.tooltip_input {
  position: absolute;
  width: 20px;
  right: 20px;
  top: 28%;
  cursor: help;
}
.tooltip_input_info {
  position: absolute;
  width: 240px;
  top: -70px;
  right: -40%;
}
.eye_pass {
  position: absolute;
  width: 20px;
  right: 55px;
  top: 28%;
  cursor: pointer;
  color: #5b5b5b;
}

@media screen and (max-width: 1024px) {
  .tooltip_input_info {
    width: 240px;
    top: -55px;
    right: 0;
  }
}
</style>
