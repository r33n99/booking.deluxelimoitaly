import type { ComponentPublicInstance, Ref } from 'vue'

export type InvoiceType =
  | 'Simple receipt to Private Person'
  | 'Company or Fiscal Entity that requires and invoice'

export type MessengerType = 'main' | 'home' | 'office' | 'other'

export interface ContactProfile {
  title: string
  first_name: string
  last_name: string
  mailing_country: string
  mailing_city: string
  mailing_state: string
  mailing_street: string
  mailing_zip: string
  phone: string
  phone_send?: string
  code: string | null
  country_prefix?: string | null
  home_phone?: string
  home_phone_send?: string
  office_phone?: string
  office_phone_send?: string
  other_phone?: string
  other_phone_send?: string
  isWhatsApp: boolean
  isTelegram: boolean
  more_information?: string
  website?: string
  company_name?: string
  invoice_address?: string
  invoice_zip?: string
  invoice_city?: string
  invoice_state?: string
  invoice_country?: string
  invoice_code?: string
  invoice_vat?: string
  address_notes?: string
}

export interface CountryOption {
  name: string
  dialCode: string
  iso2: string
}

export interface VueTelInputEvent {
  number?: string
  country: CountryOption
  nationalNumber?: string
}

export interface VueTelInputRef extends ComponentPublicInstance {
  phoneObject: VueTelInputEvent
  $refs: {
    input: HTMLInputElement
  }
}

export interface ContactFormContext {
  closeModal(): void
  toggleDropdown(): void
  selectOption(option: string): void
}

export interface ContactDataFormValues {
  title: string
  first_name: string
  last_name: string
  mailing_country: string
  website?: string
}

export interface OrderDataMinimal {
  code: string | null
  type_of_service: string | null
  deal_id: string | number | null
  email: string | null
  allowedPages: Record<string, number>
}

export interface OrderStoreLike {
  update(data: Partial<OrderDataMinimal>): void
  changeHasPhoneStatus(status: boolean): void
}

export interface ContactStoreLike {
  updateContact(data: Partial<ContactProfile>): void
}

export interface UserStoreLike {
  update(data: Record<string, unknown>): void
}

export interface ProfileCompletionStoreLike {
  profileCompletion(dealId: string | number | null, email: string | boolean): void
}

export interface ContactDataRefs {
  mainTelInputRef: Ref<VueTelInputRef | null>
  otherTelInputRef: Ref<VueTelInputRef | null>
  homeTelInputRef: Ref<VueTelInputRef | null>
  officeTelInputRef: Ref<VueTelInputRef | null>
}

export interface UtilsInjected {
  isEmpty(value: unknown): boolean
}
