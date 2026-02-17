import type { RegistrationUtils } from './DetailsRegistration'

export interface RegistrationUtilsExtended extends RegistrationUtils {
  isNumber(event: InputEvent): void
}

export interface RegistrationEmailConfirmFormValues {
  code: string
}

export interface RegistrationAcceptCodeRequest {
  code: string
  email: string | null
}

export interface RegistrationAcceptCodeResponse {
  status: string
  message: string
  data?: {
    hash?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface RegistrationResendCodeResponse {
  status: string
  message: string
  [key: string]: unknown
}
