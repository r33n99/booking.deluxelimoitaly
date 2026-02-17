import { Ref } from 'vue'
import * as yup from 'yup'

export interface UtilsInjection {
  isEmpty: (value: unknown) => boolean
}

export type AgencyPhoneType = 'main' | 'operations' | 'booking' | 'administration'

export interface VueTelCountry {
  dialCode?: string | number
  iso2?: string
}

export interface VueTelInputEvent {
  country?: VueTelCountry | null
  nationalNumber?: string
}

export interface AgencyForm {
  title: string
  company_name: string
  email: string
  vat: string
  fiscal_code: string
  tax_id_code: string
  sdi_code: string
  country: string
  address: string
  cap_zip: string
  region: string
  city: string
  iata_code: string
  internal_number: string
  alternative_industry_code: string
  company_main_phone: string
  company_main_phone_code: string | number
  company_main_email: string
  operations_phone: string
  operations_phone_code: string | number
  operations_email: string
  booking_email: string
  booking_phone: string
  booking_phone_code: string | number
  administration_phone: string
  administration_phone_code: string | number
  administration_email: string
  erp_enterprise: string
  additional_notes: string
  isTelegram?: boolean
  isWhatsApp?: boolean
}

export interface AgencyAccountResponse {
  data: AgencyForm | null
}

export interface DefaultSettingsProps {
  mode: 'auto' | 'national' | 'international'
  preferredCountries: string[]
  inputClasses: string
  dropdownOptions: {
    showFlags: boolean
    showDialCodeInList: boolean
    showDialCodeInSelection: boolean
  }
}

export interface CountryCodeItem {
  code: string
  prefix: string
}

export type ErrorBag = Record<string, string | undefined>

export type AgencySalutation = 'Mr.' | 'Ms.' | 'Mrs.' | 'Miss' | 'Mx.' | 'Dr.' | 'Prof.'
export interface AgencyFormData {
  [key: string]: any
}

export interface AgencyValidationSchema {
  [key: string]: yup.StringSchema | yup.ObjectSchema<any>
}

export interface AgencyComponentState {
  isModal: Ref<boolean>
  isAgencyHasData: Ref<boolean>
  isOpen: Ref<boolean>
  loading: Ref<boolean>
  first_name: Ref<string>
  last_name: Ref<string>
  email: Ref<string>
  isEditable: Ref<boolean>
  noField: Ref<boolean>
  country_prefix: Ref<string | null>
  country_prefix_operations: Ref<string | null>
  country_prefix_booking: Ref<string | null>
  country_prefix_administration: Ref<string | null>
  isShowModal: Ref<boolean>
  errorOnForm: Ref<ErrorBag | null>
}

export interface AgencyComponentMethods {
  toggleDropdown: () => void
  selectOption: (option: string) => void
  newRide: () => void
  logOut: () => void
  errorFill: (errorBag: ErrorBag) => void
  openEdit: () => void
  countryChanged: (country: VueTelCountry, type: AgencyPhoneType) => void
  checkTurnMessengers: (e?: Event | null, isNoField?: boolean) => void
  cleanPhoneNumber: (phoneNumber: string) => string
  onFormSubmit: () => Promise<void>
  getCountryPrefixByCode: (countryCode: string) => string | null
  getAccInfo: () => Promise<void>
}

export interface AgencyComponentComputed {
  agencySchema: Ref<yup.ObjectSchema<any>>
}
