<template>
  <div
    v-if="checkField('first_name')"
    class="summary_item_wrapper mb-0 h-max !max-w-none pb-0"
    :class="errors.first_name ? 'error' : ''"
  >
    <span class="summary_item_title">First Name:</span>
    <Field
      type="text"
      v-model="orderData.first_name"
      @beforeinput="handleBeforeInput"
      class="summary_item_input max-w-full border bg-[#E8EDE8]/50 disabled:border-[#878787] disabled:!text-[#878787] dark:border-[#3D4043] dark:bg-background dark:!text-white dark:disabled:!text-[#878787]"
      maxlength="50"
      name="first_name"
      placeholder="First Name"
      :disabled="!isEditable"
    />
  </div>
  <div
    v-if="checkField('last_name')"
    class="summary_item_wrapper mb-0 h-max !max-w-none pb-0"
    :class="errors.last_name ? 'error' : ''"
  >
    <span class="summary_item_title">Last Name:</span>
    <Field
      type="text"
      v-model="orderData.last_name"
      @beforeinput="handleBeforeInput"
      class="summary_item_input max-w-full border bg-[#E8EDE8]/50 disabled:border-[#878787] disabled:!text-[#878787] dark:border-[#3D4043] dark:bg-background dark:!text-white dark:disabled:!text-[#878787]"
      name="last_name"
      maxlength="50"
      placeholder="Last Name"
      :disabled="!isEditable"
    />
  </div>
  <div
    v-if="checkField('email')"
    class="summary_item_wrapper mb-0 h-max !max-w-none pb-0"
    :class="errors.email ? 'error' : ''"
  >
    <span class="summary_item_title">Email:</span>
    <Field
      type="text"
      v-model="orderData.email"
      class="summary_item_input max-w-full border bg-[#E8EDE8]/50 disabled:border-[#878787] disabled:!text-[#878787] dark:border-[#3D4043] dark:bg-background dark:!text-white dark:disabled:!text-[#878787]"
      name="email"
      placeholder="Email"
      :disabled="!isEditable"
    />
  </div>
  <div
    :class="{ hide_phone: !hasPhone }"
    v-if="checkField('phone') && route.name == 'success'"
    class="summary_item_wrapper mb-0 h-max !max-w-none pb-0"
  >
    <span class="summary_item_title">Phone:</span>
    <component
      v-if="VueTelInput"
      :is="VueTelInput"
      v-model="orderData.phone"
      class="vue-tel-input summary_item_input max-w-full bg-[#E8EDE8]/50 dark:bg-background"
      @onInput="onInputPhone"
      @country-changed="countryChanged"
      v-on:beforeinput="validPhone($event, orderData.country_prefix)"
      :defaultCountry="orderData.country_prefix ? orderData.country_prefix : ''"
      v-bind="defaultSettingsVueTel"
      :inputOptions="{
        placeholder: 'Phone',
        styleClasses:
          '!py-5 border disabled:border-[#878787] disabled:!text-[#878787] dark:border-[#3D4043] dark:!text-white dark:disabled:!text-[#878787]'
      }"
      :disabled="!isEditable"
    >
    </component>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Field } from 'vee-validate'
import { computed, inject, ref, toRef, onMounted, shallowRef } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import type { CountryCode } from 'libphonenumber-js'
import { validPhone, preloadValidPhone } from '@/plugins/validPhone'
import { useOrderStore } from '@/stores/ride/order'
import type { OrderData } from '@/types/stores/ride/order'

// Dynamic import of vue-tel-input - only load when phone field is visible
const VueTelInput = shallowRef<any>(null)

interface Utils {
  isLetter: (event: InputEvent) => void
}

interface ContactFieldsProps {
  isEditable?: boolean
  errors?: Partial<Record<string, string>>
  checkField: (field: string) => boolean
}

interface PhoneObject {
  nationalNumber?: string
  country?: {
    iso2?: string
  }
}

interface CountryChangedPayload {
  dialCode: string
  iso2: string
}

const props = withDefaults(defineProps<ContactFieldsProps>(), {
  isEditable: false,
  errors: () => ({}) as Partial<Record<string, string>>
})

const isEditable = toRef(props, 'isEditable')
const errors = computed(() => props.errors ?? {})
const checkField = props.checkField

const route = useRoute() as RouteLocationNormalizedLoaded
const utils = inject<Utils | null>('utils', null)
const orderStore = useOrderStore()
const { orderData, hasPhone } = storeToRefs(orderStore)

const phoneNationalNumber = ref<string>('')
const preferredCountries = ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'] as const
const defaultSettingsVueTel = {
  preferredCountries,
  inputClasses: 'input',
  dropdownOptions: {
    showFlags: true,
    showDialCodeInList: true,
    showDialCodeInSelection: true
  }
} as const

// Cache for AsYouType
let AsYouTypeClass: typeof import('libphonenumber-js').AsYouType | null = null

const onInputPhone = async (number: string, phoneObject: PhoneObject) => {
  // Safety check: ensure number is a string
  if (typeof number !== 'string') {
    return
  }

  // Dynamic import of AsYouType
  if (!AsYouTypeClass) {
    const module = await import('libphonenumber-js')
    AsYouTypeClass = module.AsYouType
  }

  const iso2 = phoneObject.country?.iso2
  const countryCode = iso2 ? (iso2.toUpperCase() as CountryCode) : undefined
  const formatter = new AsYouTypeClass(countryCode)
  orderData.value.phone = formatter.input(number) as OrderData['phone']
  phoneNationalNumber.value = phoneObject.nationalNumber ?? ''
}

const countryChanged = (country: CountryChangedPayload) => {
  orderData.value.code = country.dialCode
  orderData.value.country_prefix = country.iso2
}

const handleBeforeInput = (event: InputEvent) => {
  utils?.isLetter(event)
}

onMounted(async () => {
  // Preload libphonenumber-js and vue-tel-input only if phone field is visible
  if (checkField('phone') && route.name === 'success') {
    await preloadValidPhone()
    // Preload AsYouType as well
    if (!AsYouTypeClass) {
      const module = await import('libphonenumber-js')
      AsYouTypeClass = module.AsYouType
    }
    // Load vue-tel-input component
    if (!VueTelInput.value) {
      const module = await import('vue-tel-input')
      VueTelInput.value = module.default || module.VueTelInput
    }
  }
})

defineExpose({
  phoneNationalNumber
})
</script>
