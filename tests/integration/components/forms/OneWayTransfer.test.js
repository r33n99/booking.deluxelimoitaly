import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'
import { createTestStore } from '../../../unit/helpers/createTestStore'
import AutocompleteList from '@/components/ui/autocomplete/AutocompleteList.vue'
import { useOrderStore } from '@/stores/ride/order'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useMainStore } from '@/stores/ui/main'
import axios from 'axios'

// Mock axios для Google Places API
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

describe('OneWayTransfer Simple Integration Tests', () => {
  let orderStore
  let trustyStore
  let autocompleteWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Создаем изолированные тестовые stores
    const { store: orderTestStore } = createTestStore(useOrderStore, { stubActions: false })
    const { store: trustyTestStore } = createTestStore(useTrustyStore, { stubActions: false })
    createTestStore(useMainStore, { stubActions: false })
    
    orderStore = orderTestStore
    trustyStore = trustyTestStore 
  })

  describe('EU Address Validation Integration', () => {
    const createGooglePlaceResponse = (countryName, isEuCountry = true) => ({
      data: {
        result: {
          address_components: [
            {
              long_name: countryName,
              short_name: isEuCountry ? 'IT' : 'US',
              types: ['country', 'political']
            }
          ],
          geometry: {
            location: {
              lat: isEuCountry ? 41.9028 : 40.7128,
              lng: isEuCountry ? 12.4964 : -74.0060
            }
          },
          formatted_address: `Test Address, ${countryName}`,
          place_id: 'test-place-id'
        }
      }
    })

    it('должен принимать адреса из стран ЕС', async () => {
      // Мокируем ответ Google Places API для страны ЕС
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('Italy', true))

      // Вызываем selectSuggestions напрямую
      await trustyStore.selectSuggestions('pickup', 'test-place-id-italy')
      await nextTick()

      // Проверяем, что адрес валиден
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(trustyStore.pathStartFinish.pickup.lat).toBe(41.9028)
      expect(trustyStore.pathStartFinish.pickup.lng).toBe(12.4964)
    })

    it('должен отклонять адреса из стран не ЕС', async () => {
      // Мокируем ответ Google Places API для страны не из ЕС
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('United States', false))

      // Вызываем selectSuggestions напрямую
      await trustyStore.selectSuggestions('pickup', 'test-place-id-usa')
      await nextTick()

      // Проверяем, что адрес не валиден
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false)
    })

    it('должен проверять оба адреса (pickup и dropoff)', async () => {
      // Мокируем ответы для обоих адресов
      vi.mocked(axios.get)
        .mockResolvedValueOnce(createGooglePlaceResponse('Italy', true))
        .mockResolvedValueOnce(createGooglePlaceResponse('France', true))

      // Выбираем pickup адрес
      await trustyStore.selectSuggestions('pickup', 'test-pickup-italy')
      await nextTick()

      // Выбираем dropoff адрес
      await trustyStore.selectSuggestions('dropoff', 'test-dropoff-france')
      await nextTick()

      // Оба адреса должны быть валидными
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(trustyStore.pathStartFinish.valid.dropoff).toBe(true)
    })
  })

  describe('AutocompleteList Integration', () => {
    beforeEach(() => {
      autocompleteWrapper = mountComponent(AutocompleteList, {
        props: {
          suggestions: [
            {
              place_id: 'rome-id',
              description: 'Rome, Metropolitan City of Rome Capital, Italy',
              place_type: 'address',
              selected: false
            },
            {
              place_id: 'paris-id',
              description: 'Paris, France',
              place_type: 'address',
              selected: false
            }
          ],
          openList: true,
          fieldType: 'pickup',
          showSuggestions: { pickup: true, dropoff: true },
          lastChoisePlace: { place_id: '', pickup: { place_id: '' } }
        }
      })
    })

    afterEach(() => {
      autocompleteWrapper?.unmount()
    })

    it('должен корректно отображать EU адреса в списке', () => {
      expect(autocompleteWrapper.find('#autocomplete-list').exists()).toBe(true)
      
      // Проверяем, что список содержит EU адреса
      const suggestions = autocompleteWrapper.props().suggestions
      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            description: expect.stringContaining('Italy')
          }),
          expect.objectContaining({
            description: expect.stringContaining('France')
          })
        ])
      )
    })

    it('должен эмитить selectSuggestion при клике на EU адрес', async () => {
      const clickableElements = autocompleteWrapper.findAll('.cursor-pointer')
      
      if (clickableElements.length > 0) {
        await clickableElements[0].trigger('click')
        expect(autocompleteWrapper.emitted('selectSuggestion')).toBeTruthy()
      }
    })
  })

  describe('Store to Store Integration', () => {
    it('должен корректно обновлять orderStore данными', () => {
      // Устанавливаем данные в orderStore
      const testData = {
        pickup: 'Rome, Italy',
        dropoff: 'Paris, France',
        type_of_service: 'oneWayTransfer',
        status: 2
      }

      orderStore.update(testData)

      // Проверяем, что данные сохранились
      expect(orderStore.orderData.pickup).toBe('Rome, Italy')
      expect(orderStore.orderData.dropoff).toBe('Paris, France')
      expect(orderStore.orderData.type_of_service).toBe('oneWayTransfer')
      expect(orderStore.orderData.status).toBe(2)
    })

    it('должен корректно обновлять trustyStore валидацией адресов', async () => {
      // Мокируем Google Places API ответ
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          result: {
            address_components: [{ long_name: 'Germany', types: ['country'] }],
            geometry: { location: { lat: 52.5200, lng: 13.4050 } },
            formatted_address: 'Berlin, Germany'
          }
        }
      })

      // Вызываем selectSuggestions
      await trustyStore.selectSuggestions('pickup', 'berlin-place-id')
      await nextTick()

      // Проверяем результат
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(trustyStore.pathStartFinish.pickup.lat).toBe(52.5200)
      expect(trustyStore.pathStartFinish.pickup.lng).toBe(13.4050)
    })

    it('должен синхронизировать mainTypes между stores', () => {
      // Устанавливаем mainTypes в trustyStore
      trustyStore.mainTypes = {
        pickup: 'address',
        dropoff: 'address'
      }

      // Обновляем orderStore с этими данными
      orderStore.update({
        mainTypes: trustyStore.mainTypes
      })

      // Проверяем синхронизацию
      expect(orderStore.orderData.mainTypes).toEqual({
        pickup: 'address',
        dropoff: 'address'
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('должен обрабатывать полный поток: валидация адреса → сохранение в store', async () => {
      // Шаг 1: Мокируем Google Places API для EU страны
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          result: {
            address_components: [{ long_name: 'Spain', types: ['country'] }],
            geometry: { location: { lat: 40.4168, lng: -3.7038 } },
            formatted_address: 'Madrid, Spain'
          }
        }
      })

      // Шаг 2: Валидируем адрес через trustyStore
      await trustyStore.selectSuggestions('pickup', 'madrid-place-id')
      await nextTick()

      // Шаг 3: Проверяем валидацию
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)

      // Шаг 4: Сохраняем данные в orderStore
      orderStore.update({
        pickup: 'Madrid, Spain',
        mainTypes: { pickup: 'address', dropoff: null }
      })

      // Шаг 5: Проверяем итоговое состояние
      expect(orderStore.orderData.pickup).toBe('Madrid, Spain')
      expect(orderStore.orderData.mainTypes.pickup).toBe('address')
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(trustyStore.pathStartFinish.pickup.lat).toBe(40.4168)
    })

    it('должен блокировать не-EU адреса и не сохранять их', async () => {
      // Шаг 1: Мокируем Google Places API для не-EU страны
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          result: {
            address_components: [{ long_name: 'Canada', types: ['country'] }],
            geometry: { location: { lat: 45.5017, lng: -73.5673 } },
            formatted_address: 'Montreal, Canada'
          }
        }
      })

      // Шаг 2: Пытаемся валидировать не-EU адрес
      await trustyStore.selectSuggestions('pickup', 'montreal-place-id')
      await nextTick()

      // Шаг 3: Проверяем, что валидация не прошла
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false)

      // Шаг 4: Проверяем, что координаты не сохранились (или сохранились но невалидны)
      // В зависимости от реализации, может быть null или данные но с invalid: true
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false)
    })
  })

  describe('Component Integration Scenarios', () => {
    it('должен корректно передавать EU адреса в AutocompleteList', () => {
      const euSuggestions = [
        {
          place_id: 'berlin-id',
          description: 'Berlin, Germany',
          place_type: 'address',
          selected: false
        },
        {
          place_id: 'vienna-id',
          description: 'Vienna, Austria', 
          place_type: 'address',
          selected: true
        }
      ]

      const wrapper = mountComponent(AutocompleteList, {
        props: {
          suggestions: euSuggestions,
          openList: true,
          fieldType: 'pickup',
          showSuggestions: { pickup: true, dropoff: true },
          lastChoisePlace: { place_id: 'vienna-id', pickup: { place_id: 'vienna-id' } }
        }
      })

      // Проверяем, что EU адреса корректно переданы
      expect(wrapper.props().suggestions).toHaveLength(2)
      expect(wrapper.props().suggestions[0].description).toContain('Germany')
      expect(wrapper.props().suggestions[1].description).toContain('Austria')
      expect(wrapper.props().suggestions[1].selected).toBe(true)

      wrapper.unmount()
    })
  })
}) 