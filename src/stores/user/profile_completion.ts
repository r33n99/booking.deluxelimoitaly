import { defineStore } from 'pinia'
import { useFetcher } from '@/compose/axios'
import { ref } from 'vue'
import type { ProfileCompletionData } from '@/types/stores/user/profileCompletion'

const STORE_NAME = 'profile_completion'
//const LOCALSTORAGE_KEY = 'profile_completion_locator'

const defaultData: ProfileCompletionData = {
  mailing_country: '',
  title: '',
  first_name: '',
  last_name: '',
  code: null,
  phone: null,
  country_prefix: null,
  other_phone: null,
  more_information: null,
  home_phone: null,
  office_phone: null,
  phone_send: null,
  other_phone_send: null,
  home_phone_send: null,
  office_phone_send: null,
  isWhatsApp: false,
  isTelegram: false,
  mailing_city: null,
  mailing_street: null,
  mailing_state: null,
  mailing_zip: null,
  website: null,
  invoice_address: null,
  invoice_city: null,
  invoice_state: null,
  invoice_zip: null,
  invoice_country: null,
  invoice_code: null,
  invoice_vat: null,
  contact_before_service: 'No',
  number_of_passengers: 1,
  main_passenger: null,
  relation_passenger: null,
  other_language: 'English',
  change_vehicle: 'No',
  pickup_specific: null,
  dropoff_specific: null,
  company_name: null,
  address_notes: null,
  number_suitcases: null,
  description: null
}

export const useProfileCompletionStore = defineStore(STORE_NAME, () => {
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

  const fromServiceData = ref<boolean>(false)
  const profile = ref<ProfileCompletionData>({ ...defaultData })

  const profileCompletion = async (deal_id: string | number, email?: string): Promise<void> => {
    if (
      !deal_id ||
      deal_id === 'null' ||
      deal_id === 'undefined' ||
      deal_id === '0' ||
      deal_id === 0
    ) {
      console.warn(
        '[ProfileCompletionStore] Skipping profileCompletion: deal_id is invalid or missing:',
        deal_id
      )
      return
    }

    const dealIdString = String(deal_id).trim()
    if (!dealIdString) {
      console.warn('[ProfileCompletionStore] Skipping profileCompletion: deal_id is empty string')
      return
    }

    const data: ProfileCompletionData = {
      ...profile.value,
      phone: profile.value.phone_send,
      home_phone: profile.value.home_phone_send,
      other_phone: profile.value.other_phone_send,
      office_phone: profile.value.office_phone_send,
      ...(email ? { email } : {})
    }

    try {
      await axiosInstance.post(`profileCompletion/${dealIdString}`, data)
    } catch {
      // Ошибка не блокирует переход пользователя на следующую страницу
    }
  }

  function $reset(): void {
    profile.value = { ...defaultData }
    fromServiceData.value = false
  }

  return {
    profile,
    profileCompletion,
    fromServiceData,
    $reset
  }
})

export type ProfileCompletionStore = ReturnType<typeof useProfileCompletionStore>
