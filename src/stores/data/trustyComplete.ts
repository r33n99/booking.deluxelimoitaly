import { ref, watch, type Ref } from 'vue'
import { defineStore } from 'pinia'
import axios, { type AxiosResponse } from 'axios'
import { useDebounceFn } from '@vueuse/core'
import { useOrderStore } from '@/stores/ride/order'

axios.defaults.headers.common['X-Project'] = import.meta.env.VITE_PROJECT_ALIAS

type PlaceType = 'pickup' | 'dropoff'
type PlaceCategory = 'airport' | 'port' | 'transit_station' | 'train_station' | 'other'

interface LatLng {
  lat: number | null
  lng: number | null
}

interface PathValidity {
  pickup: boolean
  dropoff: boolean
}

interface PathStartFinish {
  pickup: LatLng
  dropoff: LatLng
  valid: PathValidity
}

interface PlaceBrief {
  formatted_address: string
  place_id: string
}

interface PlaceChoiceState {
  pickup: boolean
  dropoff: boolean
}

interface PlaceBriefState {
  pickup: PlaceBrief
  dropoff: PlaceBrief
}

interface SuggestionVisibility {
  pickup: boolean
  dropoff: boolean
}

interface AutocompletePrediction {
  description?: string
  place_id?: string
  [key: string]: unknown
}

interface GeometryLocation {
  lat: number
  lng: number
}

interface AddressComponent {
  long_name?: string
  types: string[]
}

interface PlaceDetailsResult {
  name?: string
  formatted_address?: string
  place_id?: string
  geometry: {
    location: GeometryLocation
  }
  types?: string[]
  address_components?: AddressComponent[]
}

interface PlaceDetailsResponse {
  result: PlaceDetailsResult
}

interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
}

interface FindPlaceResponse {
  candidates?: AutocompletePrediction[]
  [key: string]: unknown
}

interface TrustyStoreState {
  inputValue: Ref<string>
  pickupRef: Ref<string>
  dropoffRef: Ref<string>
  data: Ref<AutocompletePrediction[]>
  pathStartFinish: Ref<PathStartFinish>
  activeAuto: Ref<string>
  showSuggestions: Ref<SuggestionVisibility>
  lastChoisePlace: Ref<PlaceBriefState>
  placeChoised: Ref<PlaceChoiceState>
  mainTypes: Ref<Record<PlaceType, PlaceCategory | null>>
  isSelectSuggestion: Ref<boolean>
}

interface TrustyStoreActions {
  updatePlaceChoised(value: boolean, type: PlaceType): void
  clearInput(mode: PlaceType): void
  resetPathStartFinish(): void
  updateLastChoisePlace(value: PlaceBrief, type: PlaceType): void
  updateSuggestions(value: AutocompletePrediction[]): void
  updatePathStartFinish(value: LatLng, type: PlaceType): void
  updateMainTypes(typeAddress: PlaceCategory, type?: PlaceType): void
  selectSuggestions(type: PlaceType, placeId: string): Promise<void>
  checkAddress(address: PlaceDetailsResult, type: PlaceType): boolean
  fetchSuggestions(query: string, fieldType?: PlaceType | false): Promise<void>
  findPlace(query: string, callback: (response: FindPlaceResponse) => void): Promise<void>
  updateLastChoisePlaceState(value: PlaceBriefState): void
  $reset(): void
}

const createLatLng = (): LatLng => ({ lat: null, lng: null })

const createPathStartFinish = (): PathStartFinish => ({
  pickup: createLatLng(),
  dropoff: createLatLng(),
  valid: {
    pickup: false,
    dropoff: false
  }
})

const createPlaceBrief = (): PlaceBrief => ({ formatted_address: '', place_id: '' })

const createPlaceBriefState = (): PlaceBriefState => ({
  pickup: createPlaceBrief(),
  dropoff: createPlaceBrief()
})

const SESSION_STORAGE_PATH_START_FINISH = 'pathStartFinish'
const SESSION_STORAGE_LAST_CHOISE_PLACE = 'lastChoisePlace'

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return (JSON.parse(value) as T) ?? fallback
  } catch (error) {
    console.error('[TrustyStore] Failed to parse stored value', error)
    return fallback
  }
}

const COUNTRIES_WHITE_LIST =
  'Austria, Belgium, Bulgaria, Greece, Denmark, Ireland, Spain, Italy, Cyprus, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Finland, France, Croatia, Czechia, Sweden, Estonia, Germany, Hungary, Switzerland, Vatican City, San Marino, Serbia, Bosnia and Herzegovina,  Montenegro, North Macedonia, Albania'

const PRIORITY_TYPES: PlaceCategory[] = ['airport', 'port', 'transit_station', 'train_station']

export const useTrustyStore = defineStore('trustyComplete', () => {
  const orderStore = useOrderStore()

  const data = ref<AutocompletePrediction[]>([])
  const inputValue = ref<string>('')
  const pickupRef = ref<string>('')
  const dropoffRef = ref<string>('')
  const pathStartFinish = ref<PathStartFinish>(createPathStartFinish())
  const mainTypes = ref<Record<PlaceType, PlaceCategory | null>>({ pickup: null, dropoff: null })
  const activeAuto = ref<string>('')
  const showSuggestions = ref<SuggestionVisibility>({ pickup: false, dropoff: false })
  const lastChoisePlace = ref<PlaceBriefState>(createPlaceBriefState())
  const placeChoised = ref<PlaceChoiceState>({ pickup: false, dropoff: false })
  const isSelectSuggestion = ref<boolean>(false)

  const persistPathStartFinishRaw = () => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_PATH_START_FINISH,
        JSON.stringify(pathStartFinish.value)
      )
    } catch (error) {
      console.error('[TrustyStore] Failed to persist pathStartFinish', error)
    }
  }

  const persistPathStartFinish = useDebounceFn(persistPathStartFinishRaw, 300)

  const persistLastChoisePlaceRaw = () => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_LAST_CHOISE_PLACE,
        JSON.stringify(lastChoisePlace.value)
      )
    } catch (error) {
      console.error('[TrustyStore] Failed to persist lastChoisePlace', error)
    }
  }

  const persistLastChoisePlace = useDebounceFn(persistLastChoisePlaceRaw, 300)

  const loadPathStartFinish = (): void => {
    const stored = parseJSON<PathStartFinish | null>(
      sessionStorage.getItem(SESSION_STORAGE_PATH_START_FINISH),
      null
    )

    if (stored) {
      const isValid =
        (stored.pickup.lat === null ||
          (typeof stored.pickup.lat === 'number' && !isNaN(stored.pickup.lat))) &&
        (stored.pickup.lng === null ||
          (typeof stored.pickup.lng === 'number' && !isNaN(stored.pickup.lng))) &&
        (stored.dropoff.lat === null ||
          (typeof stored.dropoff.lat === 'number' && !isNaN(stored.dropoff.lat))) &&
        (stored.dropoff.lng === null ||
          (typeof stored.dropoff.lng === 'number' && !isNaN(stored.dropoff.lng))) &&
        typeof stored.valid === 'object' &&
        typeof stored.valid.pickup === 'boolean' &&
        typeof stored.valid.dropoff === 'boolean'

      if (isValid) {
        pathStartFinish.value = stored
      } else {
        pathStartFinish.value = createPathStartFinish()
      }
    } else {
      pathStartFinish.value = createPathStartFinish()
    }
  }

  const loadLastChoisePlace = (): void => {
    const stored = parseJSON<PlaceBriefState | null>(
      sessionStorage.getItem(SESSION_STORAGE_LAST_CHOISE_PLACE),
      null
    )

    if (stored) {
      lastChoisePlace.value = stored
    }
  }

  loadPathStartFinish()
  loadLastChoisePlace()

  const apiInput = `${import.meta.env.VITE_APP_API_URL}/autocomplete`

  const updatePlaceChoised: TrustyStoreActions['updatePlaceChoised'] = (val, type) => {
    placeChoised.value = { ...placeChoised.value, [type]: val }
  }

  const clearInput: TrustyStoreActions['clearInput'] = (mode) => {
    if (mode === 'dropoff') {
      dropoffRef.value = ''
      orderStore.update({ dropoff: '' })
      // Сброс координат для dropoff
      pathStartFinish.value = {
        ...pathStartFinish.value,
        dropoff: createLatLng(),
        valid: {
          ...pathStartFinish.value.valid,
          dropoff: false
        }
      }
      // Очистка связанных данных
      lastChoisePlace.value = {
        ...lastChoisePlace.value,
        dropoff: createPlaceBrief()
      }
      mainTypes.value = {
        ...mainTypes.value,
        dropoff: null
      }
      placeChoised.value = {
        ...placeChoised.value,
        dropoff: false
      }
      persistPathStartFinish()
      persistLastChoisePlace()
    }

    if (mode === 'pickup') {
      pickupRef.value = ''
      orderStore.update({ pickup: '' })
      // Сброс координат для pickup
      pathStartFinish.value = {
        ...pathStartFinish.value,
        pickup: createLatLng(),
        valid: {
          ...pathStartFinish.value.valid,
          pickup: false
        }
      }
      // Очистка связанных данных
      lastChoisePlace.value = {
        ...lastChoisePlace.value,
        pickup: createPlaceBrief()
      }
      mainTypes.value = {
        ...mainTypes.value,
        pickup: null
      }
      placeChoised.value = {
        ...placeChoised.value,
        pickup: false
      }
      persistPathStartFinish()
      persistLastChoisePlace()
    }
  }

  const resetPathStartFinish: TrustyStoreActions['resetPathStartFinish'] = () => {
    pathStartFinish.value = createPathStartFinish()
    persistPathStartFinishRaw()
  }

  const updateLastChoisePlace: TrustyStoreActions['updateLastChoisePlace'] = (val, type) => {
    lastChoisePlace.value = { ...lastChoisePlace.value, [type]: val }
    persistLastChoisePlace()
  }

  const updateLastChoisePlaceState: TrustyStoreActions['updateLastChoisePlaceState'] = (value) => {
    lastChoisePlace.value = value
    persistLastChoisePlace()
  }

  const updateSuggestions: TrustyStoreActions['updateSuggestions'] = (val) => {
    data.value = val
  }

  const updatePathStartFinish: TrustyStoreActions['updatePathStartFinish'] = (val, type) => {
    // Валидация: lat и lng должны быть числами
    if (
      typeof val.lat !== 'number' ||
      typeof val.lng !== 'number' ||
      isNaN(val.lat) ||
      isNaN(val.lng)
    ) {
      return
    }

    pathStartFinish.value = {
      ...pathStartFinish.value,
      [type]: val,
      valid: {
        ...pathStartFinish.value.valid,
        [type]: true
      }
    }

    // Сохранение в sessionStorage
    persistPathStartFinish()
  }

  const updateMainTypes: TrustyStoreActions['updateMainTypes'] = (typeAddress, type = 'pickup') => {
    mainTypes.value = { ...mainTypes.value, [type]: typeAddress }
  }

  const guessPlaceType = (place: PlaceDetailsResult): PlaceCategory => {
    const name = (place.name ?? '').toLowerCase()
    const address = (place.formatted_address ?? '').toLowerCase()
    const types = Array.isArray(place.types) ? place.types : []

    for (const t of PRIORITY_TYPES) {
      if (types.includes(t)) {
        return t
      }
    }

    const keywords: Array<{ type: PlaceCategory; words: string[] }> = [
      { type: 'airport', words: ['airport', 'aeroporto', 'aéroport', 'flughafen', 'аэропорт'] },
      { type: 'port', words: ['port', 'harbor', 'porto', 'port de', 'molo', 'pier', 'порт'] },
      {
        type: 'transit_station',
        words: [
          'transit',
          'terminal',
          'hub',
          'interchange',
          'commuter',
          'автовокзал',
          'bus terminal',
          'автостанция',
          'пересадочный узел',
          'station centrale'
        ]
      },
      {
        type: 'train_station',
        words: [
          'train station',
          'railway station',
          'bahnhof',
          'gare',
          'estación',
          'stazione',
          'вокзал'
        ]
      }
    ]

    for (const { type, words } of keywords) {
      for (const word of words) {
        if (name.includes(word) || address.includes(word)) {
          return type
        }
      }
    }

    return 'other'
  }

  const selectSuggestions: TrustyStoreActions['selectSuggestions'] = async (type, placeId) => {
    isSelectSuggestion.value = true

    const response: AxiosResponse<PlaceDetailsResponse> = await axios.get(
      `${apiInput}/details?place_id=${placeId}`
    )

    const result = response.data.result
    const latLng = result.geometry.location
    const placeType = guessPlaceType(result)

    updateMainTypes(placeType, type)

    if (!checkAddress(result, type)) {
      return
    }

    // Валидация координат перед обновлением
    if (
      latLng &&
      typeof latLng.lat === 'number' &&
      typeof latLng.lng === 'number' &&
      !isNaN(latLng.lat) &&
      !isNaN(latLng.lng)
    ) {
      updatePathStartFinish(latLng, type)
    }
    updateLastChoisePlace(
      {
        place_id: result.place_id ?? '',
        formatted_address: result.formatted_address ?? ''
      },
      type
    )
  }

  watch(isSelectSuggestion, (value) => {
    if (value) {
      setTimeout(() => {
        isSelectSuggestion.value = false
      }, 700)
    }
  })

  const checkAddress: TrustyStoreActions['checkAddress'] = (address, type) => {
    const addressComponents = address.address_components ?? []
    const foundCountry = addressComponents.find((component) => component.types.includes('country'))

    if (foundCountry) {
      const countryName = foundCountry.long_name ?? ''
      const isValid = COUNTRIES_WHITE_LIST.includes(countryName)

      pathStartFinish.value.valid = { ...pathStartFinish.value.valid, [type]: isValid }

      // Сохранение в sessionStorage при изменении валидации
      persistPathStartFinish()

      return isValid
    }

    return false
  }

  let timerHandle: ReturnType<typeof setTimeout> | null = null

  const fetchSuggestions: TrustyStoreActions['fetchSuggestions'] = async (
    query,
    fieldType = false
  ) => {
    if (timerHandle) {
      clearTimeout(timerHandle)
    }

    timerHandle = setTimeout(async () => {
      if (!query.length) {
        return
      }

      const queryParam = String(query).toLowerCase()

      try {
        const response: AxiosResponse<AutocompleteResponse> = await axios.get(
          `${apiInput}/input?input=${queryParam}`
        )

        if (!isSelectSuggestion.value) {
          data.value = response.data.predictions
          if (fieldType) {
            showSuggestions.value = { ...showSuggestions.value, [fieldType]: true }
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions', error)
      }
    }, 250)
  }

  const findPlace: TrustyStoreActions['findPlace'] = async (query, callback) => {
    try {
      const response: AxiosResponse<FindPlaceResponse> = await axios.get(
        `${apiInput}/findPlace?input=${query}`
      )
      callback(response.data)
    } catch (error) {
      console.error('Error fetching suggestions', error)
    }
  }

  const $reset: TrustyStoreActions['$reset'] = () => {
    clearInput('dropoff')
    clearInput('pickup')
    updateLastChoisePlaceState(createPlaceBriefState())
    placeChoised.value = { pickup: false, dropoff: false }
    pickupRef.value = ''
    dropoffRef.value = ''
    pathStartFinish.value = createPathStartFinish()
    mainTypes.value = { pickup: null, dropoff: null }
    sessionStorage.removeItem(SESSION_STORAGE_PATH_START_FINISH)
    sessionStorage.removeItem(SESSION_STORAGE_LAST_CHOISE_PLACE)
  }

  return {
    inputValue,
    pickupRef,
    dropoffRef,
    data,
    pathStartFinish,
    activeAuto,
    showSuggestions,
    lastChoisePlace,
    placeChoised,
    mainTypes,
    isSelectSuggestion,
    $reset,
    resetPathStartFinish,
    updatePathStartFinish,
    findPlace,
    updatePlaceChoised,
    updateLastChoisePlace,
    checkAddress,
    selectSuggestions,
    updateSuggestions,
    fetchSuggestions,
    updateMainTypes,
    clearInput
  } as TrustyStoreState & TrustyStoreActions
})
