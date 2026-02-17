import type { CarSummary } from '@/types/stores/ride/cars'
import type { OrderData } from '@/types/stores/ride/order'

export type ActiveFormName = 'notActive' | 'ConsultingForm' | 'AdditionalKmsForm'

export interface VehiclePageCar extends CarSummary {
  class_id: number | string
  class_images: Array<{
    original: string
    webp: string
  }>
  class_full_name: string
  price: number | null
  max_passengers: number
  max_luggage: number
  max_hand_luggage: number
  [key: string]: unknown
}

export interface VehicleOrderUpdatePayload {
  car: VehiclePageCar['class_id']
  total: number | null
  step: number
  status: number
}

export interface ConsultingPayload {
  consulting: string
}

export interface AdditionalKmsPayload {
  extra_kms: number
  distance: number
}

export interface CarsRedirectData {
  cars: VehiclePageCar[] | null
  order: OrderData & { id: number }
}

export interface AdditionalKmsData {
  cars?: VehiclePageCar[] | null
  order?: Partial<OrderData>
}

export interface TransactionFetchData {
  transaction_id: string
}

export interface ApiEnvelope<T> {
  data: T
}
