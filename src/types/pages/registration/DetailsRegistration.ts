export interface RegistrationDetailsFormValues {
  first_name: string
  last_name: string
  email: string
}

export interface RegistrationDetailsRequest extends RegistrationDetailsFormValues {
  phone?: string
  country_code?: string
}

export interface RegistrationSendCodeResponse {
  status: string
  message: string
  [key: string]: unknown
}

export interface RegistrationUtils {
  isLetter(event: InputEvent): void
}

export interface VueTelInputCountry {
  dialCode: string
  iso2: string
}

export interface RegistrationTelInputBindProps {
  enabledFlags: boolean
  preferredCountries: string[]
  inputClasses: string
}
