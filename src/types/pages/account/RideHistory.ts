import type { ComponentPublicInstance, Ref } from 'vue'

export type RideStatus = 1 | 2 | 3 | 4 | 5 | 7
export type HistoryActionType = 'return' | 'duplicate'

export interface FakeRideItem {
  id: string
  typeOfService: string
  date: string
  status: string
  pickupLocation: string
  dropOffLocation: string
  duration: string
}

export interface RideHistoryItem {
  id?: number | string | null
  order_id?: string | null
  created_at: string
  status: RideStatus
  type_of_service: string
  pickup?: string | null
  dropoff?: string | null
  hours?: string | number | null
  distance?: string | number | null
  amount?: string | number | null
  total?: string | number | null
  reqs?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  car?: string | null
  number_of_passengers?: string | number | null
  date_start?: string | null
  [key: string]: unknown
}

export interface RidesResponse {
  data: RideHistoryItem[]
}

export interface TransactionResponse {
  data: {
    transaction_id?: string
    [key: string]: unknown
  }
}

export interface UserPopupData {
  consulting: string
  reqs: string
  distance: string
  transport: string
}

export type NullableIndex = number | null

export type HistoryRefs = Ref<(HTMLElement | Element | ComponentPublicInstance | null)[]>
