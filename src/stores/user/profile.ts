import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useFetcher } from '@/compose/axios'
import type { User, AgencyData } from '@/types/stores/user/profile'

const defaultAgencyData: AgencyData = {
  pickup: '',
  dropoff: '',
  car: null,
  performance: '',
  number_of_passengers: 1,
  main_passenger: '',
  other_language: 'English',
  pickup_specific: '',
  number_suitcases: '',
  notes: '',
  amount: null,
  file_number: '',
  type_of_service: ''
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const agencyData = ref<AgencyData>({ ...defaultAgencyData })

  // Getters
  const token = computed<string | undefined>(() => user.value?.token)
  const isLoggedIn = computed<boolean>(() => !!user.value?.id)
  const fullName = computed<string | false>(() => {
    if (!user.value) {
      return false
    }

    const firstName = user.value.name ?? ''
    const lastName = user.value.last_name ?? ''

    if (!firstName && !lastName) {
      return ' '
    }

    if (!firstName) {
      return lastName
    }

    if (!lastName) {
      return firstName
    }

    return `${firstName} ${lastName}`
  })

  const loginData = ref(null)

  function updateLoginData(data: any) {
    loginData.value = data
    localStorage.setItem('login-data', JSON.stringify(data))
  }
  function clearLoginData() {
    loginData.value = null
    localStorage.removeItem('login-data')
  }

  // Actions
  function fill(data: User | null): void {
    user.value = data

    if (data) {
      localStorage.setItem('user', JSON.stringify(data))
    } else {
      localStorage.setItem('user', JSON.stringify(null))
    }
  }

  function update(data: Partial<User>): void {
    const updatedUser = { ...(user.value ?? {}), ...data } as User
    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  function updateAgency(data: Partial<AgencyData>): void {
    agencyData.value = { ...agencyData.value, ...data }
    sessionStorage.setItem('agencyData', JSON.stringify(agencyData.value))
  }

  function preventLogout(): void {
    user.value = null
    localStorage.removeItem('user')
  }

  function clearAgencyData(): void {
    agencyData.value = { ...defaultAgencyData }
    sessionStorage.removeItem('agencyData')
  }

  // API Methods
  async function getUserInfo() {
    const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
    try {
      const res = await axiosInstance.get<{ data: User }>('/user/info')
      if (res?.data?.data) {
        update(res.data.data)
      }
      return res
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async function editUserSubmit(data: User & { user_id: string | number }) {
    const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
    try {
      await axiosInstance.patch(`/users/${data.user_id}`, data)
      update(data)
      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Initialization
  function fillData(): void {
    const userStorage = localStorage.getItem('user')
    if (userStorage) {
      try {
        const parsedUser = JSON.parse(userStorage) as User | null
        fill(parsedUser)
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e)
        fill(null)
      }
    } else {
      fill(null)
    }
  }

  function fillAgency(): void {
    const sessionStorageData = sessionStorage.getItem('agencyData')
    if (sessionStorageData) {
      try {
        const parsedAgencyData = JSON.parse(sessionStorageData) as Partial<AgencyData>
        updateAgency(parsedAgencyData)
      } catch (e) {
        console.error('Failed to parse agency data from sessionStorage', e)
      }
    }
  }

  const fillLoginData = () => {
    const loginDataStorage = localStorage.getItem('login-data')
    if (loginDataStorage) {
      try {
        updateLoginData(JSON.parse(loginDataStorage))
      } catch (e: any) {
        console.log('Failed to fill login data', e)
      }
    }
  }

  // Initialize store
  fillData()
  fillAgency()
  fillLoginData()

  return {
    // State
    agencyData,
    user,
    loginData,

    // Getters
    token,
    isLoggedIn,
    fullName,

    // Actions
    fill,
    update,
    updateAgency,
    preventLogout,
    getUserInfo,
    editUserSubmit,
    clearAgencyData,
    updateLoginData,
    clearLoginData
  }
})

export type UserStore = ReturnType<typeof useUserStore>
