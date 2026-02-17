import type { Ref } from 'vue'
import type { AxiosResponse } from 'axios'

export interface AllowedPages {
  vehicle: number
  contact: number
  success_payment_intent?: number
  contactData: number
  serviceData: number
  success: number
  payment?: number
}

export interface MainTypes {
  pickup: string | null
  dropoff: string | null
}
export interface OrderData {
  id?: string | number | null
  type?: string | null
  timer_updated?: string | null
  payment_timer?: number | null
  step?: number | null
  mail_car?: unknown
  pickup: string | null
  dropoff: string | null
  hours: number | null
  email: string | null
  type_of_service: string | null
  website: string | null
  reqs: string | null
  date_start: string | null
  first_name: string | null
  last_name: string | null
  notes: string | null
  phone: string | null
  car: number | string | null
  status: number
  code: string | null
  extra_kms: number | null
  payment_code: string | null
  payment_date: string | null
  consulting: string | null
  country_prefix: string | null
  total: number | null
  amount: number | null
  distance: number | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  redis_id: string | null
  deal_id: string | number | null
  lead_id: string | number | null
  redirectStep: number | null
  full_url: string | null
  file_number: string | null
  number_of_passengers: number | null
  main_passenger: string | null
  other_language: string | null
  pickup_specific: string | null
  dropoff_specific: string | null
  number_suitcases: string | number | null
  transaction_id: string | null
  contact_id: string | number | null
  allowedPages: AllowedPages
  fromStart: boolean | null
  ride_history: boolean | null
  paymentSuccess: boolean
  mainTypes: MainTypes
  countdown?: Date | string | null
  timer_expires?: boolean
  mailing_city?: string | null
}

export type UtmData = Pick<
  OrderData,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'
>

export interface OrderStoreState {
  orderType: Ref<string>
  duplicatedOrder: Ref<boolean>
  updatedOrder: Ref<boolean>
  fromStayWithUs: Ref<boolean>
  orderData: Ref<OrderData>
  orderId: Ref<string | number | null>
  order: Ref<unknown>
  mailCar: Ref<unknown>
  fleet: Ref<unknown>
  tour: Ref<unknown>
  hasPhone: Ref<boolean>
}

export interface OrderStoreActions {
  changeTypeOrder(type: string): void
  changeHasPhoneStatus(status: boolean): void
  getUtmData(): UtmData
  update(data: Partial<OrderData>): void
  updateWithoutToggle?(data: Partial<OrderData>): void
  updateStorage(data: Partial<OrderData>): Promise<AxiosResponse<unknown>>
  updateOrder(data: unknown): void
  updateFleet(data: unknown): void
  updateTour(data: unknown): void
  updateOrderId(data: string | number | null): void
  updateMailCar(data: unknown): void
  $reset(): void
  $resetOrder(): void
  $resetOrderId(): void
  $resetGuestOrderData(): void
  saveOrderForSuccessPage(): void
  restoreOrderForSuccessPage(): void
}
