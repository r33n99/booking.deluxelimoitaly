import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import type {
  RegistrationData,
  RegistrationStoreActions,
  RegistrationStoreState
} from '@/types/stores/user/registration'

const STORE_NAME = 'registration'

const createDefaultRegistrationData = (): RegistrationData => ({
  first_name: null,
  last_name: null,
  email: null,
  country_prefix: null,
  code: '',
  phone: ''
})

const parseLocalStorageItem = <T>(key: string, fallback: () => T): T => {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      return (JSON.parse(item) as T) || fallback()
    }
  } catch (e) {
    console.error(e)
  }
  return fallback()
}

const parseSessionStorageItem = <T>(key: string, fallback: () => T): T => {
  try {
    const item = sessionStorage.getItem(key)
    if (item) {
      return (JSON.parse(item) as T) || fallback()
    }
  } catch (e) {
    console.error(e)
  }
  return fallback()
}

export const useRegistrationStore = defineStore(STORE_NAME, () => {
  const regStep = ref<number>(parseLocalStorageItem<number>('regStep', () => 1))

  const defaultData = ref<RegistrationData>(
    parseLocalStorageItem<RegistrationData>('regData', createDefaultRegistrationData)
  )

  const hash = ref<string | null>(parseSessionStorageItem<string | null>('hash', () => null))

  const state: RegistrationStoreState = {
    regStep,
    defaultData,
    hash
  }

  const setHash: RegistrationStoreActions['setHash'] = (value) => {
    hash.value = value
    sessionStorage.setItem('hash', JSON.stringify(hash.value))
  }

  const resetHash: RegistrationStoreActions['resetHash'] = () => {
    hash.value = null
    sessionStorage.removeItem('hash')
  }

  const updateData: RegistrationStoreActions['updateData'] = (data) => {
    defaultData.value = { ...defaultData.value, ...data }
    localStorage.setItem('regData', JSON.stringify(defaultData.value))
  }

  const handleChangeStep: RegistrationStoreActions['handleChangeStep'] = (step) => {
    regStep.value = step
    localStorage.setItem('regStep', JSON.stringify(regStep.value))
  }

  const handleCheckStep: RegistrationStoreActions['handleCheckStep'] = (toStep) => {
    const router = useRouter()
    const currentStep = regStep.value
    if (toStep > currentStep) {
      router.push({ name: `Step${currentStep}` })
    }
  }

  const resetStep: RegistrationStoreActions['resetStep'] = () => {
    regStep.value = 1
    localStorage.setItem('regStep', JSON.stringify(regStep.value))
  }

  const actions: RegistrationStoreActions = {
    setHash,
    resetHash,
    updateData,
    handleChangeStep,
    handleCheckStep,
    resetStep
  }

  return {
    ...state,
    ...actions
  }
})

export type RegistrationStore = ReturnType<typeof useRegistrationStore>
