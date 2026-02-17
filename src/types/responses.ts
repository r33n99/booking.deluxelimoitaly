import { User } from '@/types/stores/user/profile'

export interface LoginResponse {
  status: string
  data: User
}
