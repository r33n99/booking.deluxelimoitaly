/**
 * Ответ API при создании заказа
 */
export interface PaymentResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    order: {
      id: string | number
      user_id?: string | number | null
      payment_status: string
      total: number
      total_sum?: number // Опциональное поле для обратной совместимости
      payment_code?: string | null
      payment_date?: string | null
      created_at?: string
    }
    payment: {
      id: string
      client_secret: string
      [key: string]: unknown
    }
  }
}

/**
 * Данные для обновления статуса платежа
 */
export interface OrderData {
  order_id: string
  payment_code: string
  notes?: string
  register?: boolean
  name?: string
  last_name?: string
  email?: string
  phone?: string
  country_code?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  [key: string]: unknown
}

/**
 * Ошибки валидации формы оплаты
 */
export interface PaymentValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  country?: string
  [key: string]: string | undefined
}

/**
 * Данные формы оплаты
 */
export interface PaymentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dialCode: string
  iso2: string
  country: string
  notes: string
  createAccount: boolean
}

/**
 * Данные тура для создания заказа
 */
export interface TourDataPayload {
  tour_id?: number | string
  date?: string
  participants?: number | string
  total_duration?: number | string
  total_price?: number | string
  addons?: TourAddon[]
  basic_addons_ids?: number[]
  client_notes?: string | null
  description?: string
  [key: string]: unknown
}

/**
 * Аддон тура для создания заказа
 */
export interface TourAddon {
  id?: number | string
  name?: string
  duration?: number | null
  segmentType?: string
  [key: string]: unknown
}
