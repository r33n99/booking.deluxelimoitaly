export interface User {
  agency_balance: number
  agency_discount: number
  code: string
  contact_id: number | null
  country_prefix: string | null
  created_at: string
  disposable_token: string | null
  email: string
  email_verified_at: string | null
  first_name: string
  hash_created_at: string | null
  id: number
  last_name: string
  load_rides_history: number
  name: string | null
  otp: string | null
  phone: string
  show_information: number | null
  token: string
  type: string
  updated_at: string
  website: string
}

export interface AgencyData {
  pickup: string
  dropoff: string
  car: any | null
  performance: string
  number_of_passengers: number | null
  main_passenger: string
  other_language: string
  pickup_specific: string
  number_suitcases: string
  notes: string
  amount: number | null
  file_number: string
  type_of_service: string
  [key: string]: any // For any additional properties
}

export interface UserStoreState {
  user: User | null
  agencyData: AgencyData
}

export interface UserStoreGetters {
  token: string | undefined
  isLoggedIn: boolean
  fullName: string | false
}

export interface UserStoreActions {
  fill(data: User | null): void
  update(data: Partial<User>): void
  updateAgency(data: Partial<AgencyData>): void
  preventLogout(): void
  getUserInfo(): Promise<any>
  editUserSubmit(data: any): Promise<boolean>
  clearAgencyData(): void
}
