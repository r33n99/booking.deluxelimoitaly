import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createTestStore } from '../../helpers/createTestStore'
import { createApiMocker } from '../../helpers/mockAxios'
import { useOrderStore } from '@/stores/ride/order'

// Мокируем compose/axios
const mockAxiosPost = vi.fn()
vi.mock('@/compose/axios', () => ({
  useFetcher: vi.fn(() => ({
    axiosInstance: {
      post: mockAxiosPost
    }
  }))
}))

describe('OrderStore', () => {
  let store

  beforeEach(() => {
    vi.useFakeTimers()
    // Создание тестового окружения
    const testStore = createTestStore(useOrderStore, {
      stubActions: false // Используем реальные actions для тестирования логики
    })
    store = testStore.store

    // Очистка моков localStorage и sessionStorage
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    mockAxiosPost.mockClear()
    
    // Настройка API мокера
    createApiMocker()
  })

  describe('Инициализация store', () => {
    it('должен иметь правильные начальные значения', () => {
      expect(store.orderType).toBe('NEW')
      expect(store.duplicatedOrder).toBe(false)
      expect(store.updatedOrder).toBe(false)
      expect(store.orderId).toBeNull()
      expect(store.order).toBeNull()
      expect(store.fleet).toBeNull()
      expect(store.mailCar).toBeNull()
      expect(store.tour).toBeNull()
      expect(store.fromStayWithUs).toBe(false)
      expect(store.hasPhone).toBe(false)
    })

    it('должен иметь правильную структуру orderData по умолчанию', () => {
      expect(store.orderData).toEqual({
        pickup: null,
        dropoff: null,
        hours: null,
        email: null,
        type_of_service: null,
        website: import.meta.env.VITE_PROJECT_URL,
        reqs: null,
        date_start: null,
        first_name: null,
        last_name: null,
        notes: null,
        phone: null,
        car: null,
        status: 2,
        code: null,
        extra_kms: null,
        payment_code: null,
        payment_date: null,
        consulting: null,
        country_prefix: null,
        total: null,
        amount: null,
        distance: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        redis_id: null,
        deal_id: null,
        lead_id: null,
        redirectStep: null,
        full_url: null,
        file_number: null,
        number_of_passengers: null,
        main_passenger: null,
        other_language: null,
        pickup_specific: null,
        dropoff_specific: null,
        number_suitcases: null,
        transaction_id: null,
        contact_id: null,
        allowedPages: {
          vehicle: 0,
          contactData: 0,
          serviceData: 0,
          contact: 0,
          success_payment_intent: 0,
          success: 0
        },
        fromStart: null,
        ride_history: null,
        paymentSuccess: false,
        mainTypes: {
          pickup: null,
          dropoff: null
        }
      })
    })

    it('должен восстанавливать данные из sessionStorage при инициализации', () => {
      // Подготовка данных в sessionStorage
      const orderData = {
        pickup: 'Test Pickup',
        dropoff: 'Test Dropoff',
        email: 'test@example.com'
      }
      sessionStorage.setItem('orderData', JSON.stringify(orderData))
      sessionStorage.setItem('order_id', '12345')

      // Создаем новый store, который должен прочитать данные при инициализации
      const newStore = createTestStore(useOrderStore, { stubActions: false }).store

      expect(newStore.orderData.pickup).toBe('Test Pickup')
      expect(newStore.orderData.dropoff).toBe('Test Dropoff')
      expect(newStore.orderData.email).toBe('test@example.com')
      expect(newStore.orderId).toBe('12345')
    })

    it('должен читать orderType из localStorage', () => {
      localStorage.setItem('orderType', 'DUPLICATE')
      const newStore = createTestStore(useOrderStore, { stubActions: false }).store
      expect(newStore.orderType).toBe('DUPLICATE')
    })

    it('должен читать hasPhone из localStorage', () => {
      localStorage.setItem('hasPhone', 'true')
      const newStore = createTestStore(useOrderStore, { stubActions: false }).store
      expect(newStore.hasPhone).toBe(true)
    })
  })

  describe('Actions - управление типом заказа', () => {
    it('changeTypeOrder должен изменить тип заказа и сохранить в localStorage', () => {
      store.changeTypeOrder('DUPLICATE')
      
      expect(store.orderType).toBe('DUPLICATE')
      expect(localStorage.setItem).toHaveBeenCalledWith('orderType', 'DUPLICATE')
    })

    it('changeHasPhoneStatus должен изменить статус телефона и сохранить в localStorage', () => {
      store.changeHasPhoneStatus(true)
      
      expect(store.hasPhone).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('hasPhone', true)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Actions - обновление данных заказа', () => {
    it('update должен обновить orderData и сохранить в sessionStorage', () => {
      const updateData = {
        pickup: 'New Pickup Location',
        email: 'newemail@example.com'
      }

      const initialUpdatedOrder = store.updatedOrder
      store.update(updateData)
      vi.runAllTimers()

      expect(store.orderData.email).toBe('newemail@example.com')
      expect(store.updatedOrder).toBe(!initialUpdatedOrder)
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'orderData',
        JSON.stringify(store.orderData)
      )
    })

    it('update должен сохранять существующие данные при частичном обновлении', () => {
      // Устанавливаем начальные данные
      store.update({ pickup: 'Initial Pickup', email: 'initial@example.com' })
      vi.useFakeTimers()
      vi.runAllTimers()

      // Частичное обновление
      store.update({ dropoff: 'New Dropoff' })
      expect(store.orderData.pickup).toBe('Initial Pickup')
      expect(store.orderData.email).toBe('initial@example.com')
      expect(store.orderData.dropoff).toBe('New Dropoff')
    })

    it('updateOrder должен обновить order и сохранить в sessionStorage', () => {
      const orderData = { id: 1, status: 'confirmed' }
      
      store.updateOrder(orderData)

      expect(store.order).toEqual(orderData)
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'order',
        JSON.stringify(orderData)
      )
    })

    it('updateOrderId должен обновить orderId и сохранить в sessionStorage', () => {
      store.updateOrderId('67890')

      expect(store.orderId).toBe('67890')
      expect(sessionStorage.setItem).toHaveBeenCalledWith('order_id', '67890')
    })

    it('updateFleet должен обновить fleet и сохранить в sessionStorage', () => {
      const fleetData = { id: 1, name: 'Test Fleet' }
      
      store.updateFleet(fleetData)

      expect(store.fleet).toEqual(fleetData)
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'fleet',
        JSON.stringify(fleetData)
      )
    })

    it('updateTour должен обновить tour и сохранить в sessionStorage', () => {
      const tourData = { id: 1, name: 'Test Tour' }
      
      store.updateTour(tourData)

      expect(store.tour).toEqual(tourData)
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'tour',
        JSON.stringify(tourData)
      )
    })

    it('updateMailCar должен обновить mailCar без сохранения в storage', () => {
      const mailCarData = { id: 1, type: 'sedan' }
      
      store.updateMailCar(mailCarData)

      expect(store.mailCar).toEqual(mailCarData)
      // mailCar не сохраняется в sessionStorage
      expect(sessionStorage.setItem).not.toHaveBeenCalledWith(
        'mailCar',
        expect.any(String)
      )
    })
  })

  describe('Actions - API взаимодействие', () => {
    it('updateStorage должен отправить POST запрос и вернуть успешный ответ', async () => {
      const updateData = { pickup: 'API Location' };
      const successResponse = { data: { success: true } };
      mockAxiosPost.mockResolvedValue(successResponse);

      const result = await store.updateStorage(updateData);
      vi.runAllTimers()

      expect(store.orderData.pickup).toBe('API Location');
      expect(mockAxiosPost).toHaveBeenCalledWith('orders/cache/create', store.orderData);
      expect(result).toEqual(successResponse);
    });

    it('updateStorage должен пробросить ошибку, если API возвращает ошибку', async () => {
      const updateData = { pickup: 'API Error Location' };
      const error = new Error('API Error');
      mockAxiosPost.mockRejectedValue(error);

      await expect(store.updateStorage(updateData)).rejects.toThrow('API Error');

      expect(store.orderData.pickup).toBe('API Error Location');
    });
  })

  describe('Actions - сброс данных', () => {
    beforeEach(() => {
      // Устанавливаем данные для сброса
      store.update({ pickup: 'Test', email: 'test@example.com' })
      store.updateOrderId('12345')
      store.updateFleet({ id: 1 })
      store.updateTour({ id: 1 })
      store.updateMailCar({ id: 1 })
      store.updateOrder({ id: 1 })
    })

    it('$reset должен сбросить все данные и очистить sessionStorage', () => {
      store.$reset()

      expect(store.orderData).toEqual(expect.objectContaining({
        pickup: null,
        dropoff: null,
        email: null
      }))
      expect(store.orderId).toBeNull()
      expect(store.mailCar).toBeNull()
      expect(store.fleet).toBeNull()
      expect(store.tour).toBeNull()

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('order_id')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('fleet')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('order')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('mailCar')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tour')
    })

    it('$resetOrder должен сбросить только order', () => {
      store.$resetOrder()

      expect(store.order).toBeNull()
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('order')
      
      // Другие данные должны остаться
      expect(store.orderId).toBe('12345')
      expect(store.fleet).toEqual({ id: 1 })
    })

    it('$resetOrderId должен сбросить только orderId', () => {
      store.$resetOrderId()

      expect(store.orderId).toBeNull()
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('order_id')
      
      // Другие данные должны остаться
      expect(store.fleet).toEqual({ id: 1 })
      expect(store.tour).toEqual({ id: 1 })
    })
  })

  describe('Интеграционные тесты', () => {
    it('должен правильно обрабатывать полный цикл создания заказа', async () => {
      // Мокируем API ответ
      const mockResponse = {
        data: { id: 123, cached: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: {}
      }
      mockAxiosPost.mockResolvedValue(mockResponse)

      // 1. Обновляем тип заказа
      store.changeTypeOrder('NEW')

      // 2. Добавляем данные заказа
      store.update({
        pickup: 'Airport Terminal 1',
        dropoff: 'Grand Hotel',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890'
      })

      // 3. Сохраняем в кэш через API
      const response = await store.updateStorage({
        car: { id: 1, type: 'sedan' }
      })

      // 4. Обновляем ID заказа
      store.updateOrderId('ORD-123')

      // Проверяем результат
      expect(store.orderType).toBe('NEW')
      expect(store.orderData.pickup).toBe('Airport Terminal 1')
      expect(store.orderData.car).toEqual({ id: 1, type: 'sedan' })
      expect(store.orderId).toBe('ORD-123')
      expect(response.data.id).toBe(123)
    })

    it('должен восстанавливать состояние после перезагрузки страницы', () => {
      // Симулируем данные, сохраненные в sessionStorage
      const savedOrderData = {
        pickup: 'Saved Pickup',
        dropoff: 'Saved Dropoff',
        email: 'saved@example.com'
      }
      sessionStorage.setItem('orderData', JSON.stringify(savedOrderData))
      sessionStorage.setItem('order_id', 'SAVED-ORDER-123')
      localStorage.setItem('orderType', 'DUPLICATE')

      // Создаем новый store (симулируя перезагрузку)
      const restoredStore = createTestStore(useOrderStore, { stubActions: false }).store

      expect(restoredStore.orderData.pickup).toBe('Saved Pickup')
      expect(restoredStore.orderData.dropoff).toBe('Saved Dropoff')
      expect(restoredStore.orderId).toBe('SAVED-ORDER-123')
      expect(restoredStore.orderType).toBe('DUPLICATE')
    })
  })

  describe('Edge cases', () => {
    it('должен обрабатывать некорректные данные в localStorage', () => {
      localStorage.setItem('hasPhone', 'invalid-json')
      sessionStorage.setItem('orderData', 'invalid-json')

      expect(() => {
        createTestStore(useOrderStore, { stubActions: false })
      }).not.toThrow()
    })

    it('должен корректно обрабатывать null значения', () => {
      store.update(null)
      expect(store.orderData).toBeDefined()

      store.updateOrder(null)
      expect(store.order).toBeNull()

      store.updateOrderId(null)
      expect(store.orderId).toBeNull()
    })

    it('должен корректно обрабатывать пустые объекты', () => {
      store.update({})
      expect(store.orderData.pickup).toBeNull() // Должно остаться как было

      store.updateFleet({})
      expect(store.fleet).toEqual({})
    })
  })
}) 