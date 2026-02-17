import type { Ref } from 'vue'
import { RideStatus } from '@/types/pages/account/RideHistory'

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

export interface RidesHistoryStoreState {
  rides: Ref<RideHistoryItem[]>
  isRidesFetched: Ref<boolean>
  isNoRides: Ref<boolean>
  isRequestPending: Ref<boolean>
  isRequestRefused: Ref<boolean>
  isRequestSuccessful: Ref<boolean>
  isRequestMessage: Ref<boolean>
  isRidesFilteredEmpty: Ref<boolean>
  requestSent: Ref<boolean>
}

export type RidesFilter = Record<string, unknown>

export interface RidesHistoryStoreActions {
  $reset(): void
  updateRides(newRides: { data: RideHistoryItem[] }): void
  updateRide(rideIndex: number, newRide: Partial<RideHistoryItem>): void
  loadRides(filter?: RidesFilter): Promise<void>
  updateRequestStatus(status: 'refused' | 'empty' | string): void
}
