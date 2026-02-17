import axios from 'axios'
import type { TourDataPayload, PaymentResponse, TourAddon } from '@/types/payment'
import { PriceCalculationService } from './priceCalculationService'

export class PaymentService {
  constructor(
    private readonly apiUrl: string | null = null,
    private readonly authToken: string | null = null
  ) {}

  private ensureApiUrl(): string {
    if (!this.apiUrl) {
      throw new Error('PaymentService API URL is not configured.')
    }
    return this.apiUrl
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private mapTourPayload(tourData: TourDataPayload) {
    const totalPrice = PriceCalculationService.roundPrice(Number(tourData?.total_price) || 0)
    const totalPriceInteger = Math.ceil(totalPrice)

    let formattedDate = tourData?.date
    if (formattedDate) {
      if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0]
      } else if (formattedDate.length > 10) {
        formattedDate = formattedDate.slice(0, 10)
      }
    }

    return {
      id: tourData?.tour_id,
      date: formattedDate,
      participants: Number(tourData?.participants),
      total_duration: Math.round(Number(tourData?.total_duration)),
      total_price: totalPriceInteger
    }
  }

  async createOrder(tourData: TourDataPayload, isAuthenticated: boolean): Promise<PaymentResponse> {
    const endpoint = `${this.ensureApiUrl()}/orders`

    // Валидация обязательных полей
    if (!tourData?.tour_id) {
      throw new Error('Tour ID is required')
    }
    if (!tourData?.date) {
      throw new Error('Tour date is required')
    }
    if (!tourData?.participants || Number(tourData.participants) < 1) {
      throw new Error('Participants count must be at least 1')
    }

    const mapped = this.mapTourPayload(tourData)

    // Дополнительная проверка после маппинга
    if (!mapped.id) {
      throw new Error('Mapped tour_id is missing')
    }
    if (!mapped.date) {
      throw new Error('Mapped date is missing')
    }

    // Собираем все ID аддонов (теперь addons содержит все сервисы: базовые + выбранные)
    const allAddonIds = tourData?.addons?.map((addon: TourAddon) => addon?.id).filter(Boolean) || []

    // Валидация и ограничение client_notes
    let clientNotes = tourData?.client_notes || null
    if (clientNotes === '' || clientNotes === undefined) {
      clientNotes = null
    }
    const validatedClientNotes =
      clientNotes && typeof clientNotes === 'string' && clientNotes.length > 1000
        ? clientNotes.substring(0, 1000)
        : clientNotes

    // Формируем payload в формате inspiritaly API
    const payload = {
      tours: [
        {
          id: mapped.id,
          date: mapped.date,
          participants: mapped.participants,
          total_duration: mapped.total_duration,
          total_price: mapped.total_price,
          addon_ids: allAddonIds
        }
      ],
      total: mapped.total_price,
      total_duration: mapped.total_duration,
      client_notes: validatedClientNotes
    }

    // Финальная валидация payload
    if (payload.tours.length === 0) {
      throw new Error('Payload must contain at least one tour')
    }
    if (!payload.tours[0].id) {
      throw new Error('Tour ID is missing in payload')
    }
    if (!payload.tours[0].date) {
      throw new Error('Tour date is missing in payload')
    }
    if (!Array.isArray(payload.tours[0].addon_ids)) {
      throw new Error('addon_ids must be an array')
    }

    try {
      const response = await axios.post(endpoint, payload, { headers: this.getHeaders() })

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`)
      }

      if (!response.data) {
        throw new Error('Empty response from server')
      }

      return response.data as PaymentResponse
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0
        const message = error.response?.data?.message || error.message
        const data = error.response?.data || {}

        throw new Error(`Backend error (${status}): ${message}`)
      }
      throw error
    }
  }

  async updatePaymentStatus(orderData: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${this.ensureApiUrl()}/orders`

    try {
      // Преобразуем notes в client_notes, если нужно
      const payload = { ...orderData }
      if (payload.notes && !payload.client_notes) {
        payload.client_notes = payload.notes
        delete payload.notes
      }

      const response = await axios.patch(endpoint, payload, { headers: this.getHeaders() })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update payment status')
      }
      throw error
    }
  }
}
