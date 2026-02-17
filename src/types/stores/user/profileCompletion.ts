export interface ProfileCompletionData {
  mailing_country: string | null
  title: string | null
  first_name: string | null
  last_name: string | null
  code: string | number | null
  phone: string | number | null
  country_prefix: string | null
  other_phone: string | number | null
  more_information: string | null
  home_phone: string | number | null
  office_phone: string | number | null
  phone_send: string | number | null
  other_phone_send: string | number | null
  home_phone_send: string | number | null
  office_phone_send: string | number | null
  isWhatsApp: boolean
  isTelegram: boolean
  mailing_city: string | null
  mailing_street: string | null
  mailing_state: string | null
  mailing_zip: string | null
  website: string | null
  invoice_address: string | null
  invoice_city: string | null
  invoice_state: string | null
  invoice_zip: string | null
  invoice_country: string | null
  invoice_code: string | null
  invoice_vat: string | null
  contact_before_service: 'Yes' | 'No'
  number_of_passengers: number
  main_passenger: string | null
  relation_passenger: string | null
  other_language: string
  change_vehicle: 'Yes' | 'No'
  pickup_specific: string | null
  dropoff_specific: string | null
  company_name: string | null
  address_notes: string | null
  number_suitcases: string | number | null
  description: string | null
  email?: string
}

export interface ProfileCompletionStoreState {
  profile: ProfileCompletionData
  fromServiceData: boolean
}

export interface ProfileCompletionStoreActions {
  profileCompletion(deal_id: string | number, email?: string): Promise<void>
  $reset(): void
}

export interface ProfileCompletionStoreGetters {
  // Add any getters here if needed
}
