<template>
  <div class="field">
    <label v-if="label" class="field-label" v-safe-html="label" />
    <div class="input-wrapper">
      <vue-tel-input
        v-if="type === 'tel'"
        :key="defaultCountry"
        v-bind="props"
        v-model="model"
        class="field-input-tel border-1 overflow-hidden border-black/30 focus-within:!border-black/40 dark:border-[#3D4043] dark:focus-within:!border-white/40"
        :dropdownOptions="{
          showDialCodeInSelection: true,
          showDialCodeInList: true,
          showFlags: true
        }"
        @country-changed="handleCountryChanged"
        :class="[inputClass, { 'border !border-red-500': error }, { '!text-gray-400': disabled }]"
        :placeholder="placeholder"
        :defaultCountry="defaultCountry"
        :autoDefaultCountry="true"
        :autoFormat="false"
        :autoInsertDialCode="false"
        :disableCountryStateSearch="true"
        :validCharactersOnly="true"
        mode="international"
        :ignoredCountries="['kz']"
        :enableLookup="false"
        :preferredCountries="[
          'it',
          'fr',
          'de',
          'es',
          'pt',
          'nl',
          'be',
          'lu',
          'ie',
          'at',
          'gr',
          'fi',
          'se',
          'dk',
          'pl',
          'cz',
          'hu',
          'sk',
          'si',
          'hr',
          'ro',
          'bg',
          'cy',
          'mt',
          'ee',
          'lv',
          'lt',
          'ru',
          'by',
          'ua',
          'kz',
          'uz',
          'kg',
          'tj',
          'tm',
          'az',
          'am',
          'ge',
          'md'
        ]"
      />
      <input
        v-else
        v-bind="props"
        v-model="model"
        class="field-input border-1 border-black/50 focus-within:!border-black/40 dark:border-white/30 dark:focus-within:!border-white/40"
        :class="[
          inputClass,
          { 'border !border-red-500': error },
          { 'cursor-not-allowed !text-gray-400': disabled }
        ]"
        :type="inputType"
        :placeholder="placeholder"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="toggle-password"
        @click="togglePassword"
      >
        <!--        <eye-icon class="w-[24px]" v-if="showPassword" />-->
        <!--        <eye-closed-icon class="w-[24px]" v-else />-->
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
// import EyeIcon from '@/components/icons/EyeIcon.vue'
// import EyeClosedIcon from '@/components/icons/EyeOffIcon.vue'

type PaymentFieldType = 'text' | 'email' | 'password' | 'tel'

interface PaymentFieldProps {
  label?: string
  type?: PaymentFieldType
  disabled?: boolean
  placeholder?: string
  inputClass?: string
  error?: boolean
  defaultCountry?: string
  ready?: boolean
}

const model = defineModel<string | number | null>({ default: null })

const props = withDefaults(defineProps<PaymentFieldProps>(), {
  type: 'text',
  disabled: false,
  placeholder: '',
  inputClass: '',
  error: false,
  defaultCountry: undefined,
  ready: true
})

type TelCountry = unknown

const emit = defineEmits<{ (e: 'country-changed', country: TelCountry): void }>()
const showPassword = ref(false)

const handleCountryChanged = (country: TelCountry): void => {
  emit('country-changed', country)
}

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  if (props.type === 'email') {
    return 'email'
  }
  if (props.type === 'tel') {
    return 'tel'
  }
  return 'text'
})

const togglePassword = (): void => {
  showPassword.value = !showPassword.value
}
</script>

<style lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 24px;
  overflow: hidden;

  .field-label {
    font-size: 14px;
    color: #ffffff99;
    margin-bottom: 8px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 24px;
  }

  .field-input {
    max-height: 64px;
    flex: 1;
    width: 100%;
    padding: 19px 50px 19px 22px;
    border-radius: 24px;
    background: transparent;
    outline: none;
    box-shadow: none !important;
  }
  .field-input-tel {
    max-height: 64px;
    flex: 1;
    width: 100%;
    color: #ffffff;
    padding: 19px 8px;
    border-radius: 24px;
    background: transparent;
    outline: none;
    box-shadow: none !important;
    overflow: hidden;
  }

  .toggle-password {
    position: absolute;
    right: 15px;
    background: none;
    border: none;
    cursor: pointer;
    color: #ffffff99;
  }

  .toggle-password:hover {
    color: #ffffff;
  }

  .vue-tel-input .vti__dropdown {
    background-color: transparent !important;
  }

  .vue-tel-input .vti__dropdown .vti__dropdown-list {
    background-color: #262626 !important;
    z-index: 99 !important;
  }

  .vti__country-code {
    color: #7c818a !important;
    margin-right: 5px;
  }
  .highlighted {
    background: #ffffff99 !important;
  }
}
</style>
