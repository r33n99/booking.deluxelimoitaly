export interface UtilsInjection {
  isLetter: (event: InputEvent) => void
}

export interface VueTelCountry {
  dialCode: string | number
  iso2: string
}

export interface VueTelInputEvent {
  country?: VueTelCountry | null
  nationalNumber?: string
}

export interface AgencyLinkInfo {
  isLink: true
  isCreditsBlock?: false
  text: string
  textBefore: string
  linkText: string
  textAfter: string
  to: string
}

export interface AgencyCreditsInfo {
  isCreditsBlock: true
  balance: number
  discount: number
}

export interface AgencyTextInfo {
  isLink?: false
  isCreditsBlock?: false
  text: string
}

export type AgencyInformation = AgencyLinkInfo | AgencyCreditsInfo | AgencyTextInfo | null

export interface AccountFormValues {
  first_name: string
  last_name: string
  email: string
}

export interface AccountFormModel extends AccountFormValues {
  phone: string
  country_prefix: string | null
}

export type AccountEditPayload = AccountFormValues & {
  phone: string
  user_id: number | string
  code: string | null
  country_prefix: string | null
}

export interface BindProps {
  enabledFlags: boolean
  preferredCountries: string[]
  inputClasses: string
}
