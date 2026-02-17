import { bool } from 'yup'

export type RegistrationType = 'private' | 'request for Agency'

export interface FinalRegistrationFormValues {
  password: string
  confirm_password: string
  invoice_radio: RegistrationType
  title?: string
  company_name?: string
  vat?: string
  country?: string
  region?: string
  city?: string
  address?: string
  company_main_phone?: string
  company_main_email?: string
  cap_zip?: string
}

export interface AgencyDataState {
  company_main_phone: string
  company_main_phone_code: string | null
  company_main_phone_error: boolean
}

export interface CountryChangeEvent {
  iso2: string
  dialCode: string
}

export interface FinalizeRegistrationBase {
  hash: string
  email: string | null
  password: string
  password_confirmation: string
  type: RegistrationType
}

export type FinalizeRegistrationRequest = FinalizeRegistrationBase &
  Partial<Omit<FinalRegistrationFormValues, 'password' | 'confirm_password'>> & {
    invoice_radio?: RegistrationType
    company_main_phone_code?: string | null
    title?: string
  }

export interface FinalizeRegistrationResponse {
  status: string
  message?: string
  [key: string]: unknown
}

export interface LoginRequest {
  email: string | null
  password: string
  website: string
  check: boolean
}

export interface LoginResponse<T = unknown> {
  data?: T
  [key: string]: unknown
}

export type TooltipKey = 'private' | 'agency' | 'password' | 'confirm_password'

export type TooltipState = Record<TooltipKey, boolean>
