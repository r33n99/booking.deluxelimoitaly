export interface Area {
  id: number
  name: string
  description: string
}

/**
 * Основной интерфейс тура с поддержкой новой и старой структуры API
 */
export interface Tour {
  id: number
  name: string
  description: string | null
  featured: boolean
  short_description: string | null
  duration: number | null
  slug: string | null
  meta: {
    title: string | null
    description: string | null
  }
  default_participants_count: number
  destination: string | null
  is_new: boolean
  categories: Category[]
  media: MediaItem[]
  highlights: Highlight[]
  page_id: number | null

  // Deprecated fields для обратной совместимости
  /** @deprecated Использовать meta.title */
  meta_title?: string
  /** @deprecated Использовать meta.description */
  meta_description?: string
  /** @deprecated Использовать destination */
  area?: Area
  /** @deprecated Использовать categories */
  segments?: Category[] | Segment[]
  /** @deprecated Использовать default_participants_count */
  tour_default_participants_amount?: number
  /** @deprecated Поле больше не возвращается API */
  max_participants?: number
  /** @deprecated Поле больше не возвращается API */
  min_cost?: number | null
  /** @deprecated Поле больше не возвращается API */
  min_cost_markup?: number | null
  /** @deprecated Поле больше не возвращается API */
  max_cost?: number | null
  /** Минуты для округления дополнительного времени */
  round_from_minutes?: number
  /** Данные маршрута для расчёта стоимости (Formula 2) */
  route_pricing?: RoutePricing
}

/**
 * Основные моменты тура (иконка + текст)
 */
export interface Highlight {
  id: number
  title: string
  icon: string
}

/**
 * Новая структура категории из API
 * Категория объединяет сервисы одного типа (Transportation, Guidance, Experience)
 */
export interface Category {
  id: number
  title: string
  description: string
  order: number
  mandatory: boolean
  markups: number[] // Наценки для каждого количества участников (1-8)
  configs: CategoryConfig[]
  services: Service[]
  time_discount?: number // Скидка на дополнительное время для категории Transportation
}

/**
 * Конфигурация базовых сервисов для конкретного количества участников
 */
export interface CategoryConfig {
  participants_count: number
  base_service_id: number | null
  upgrades: number[]
}

/**
 * Сервис (новая структура из API)
 */
export interface Service {
  id: number
  name: string
  description: string | null
  max_participants: number
  prices_per_person: number[]
  price_per_km?: number | null // Цена за км (только для транспорта)
  duration: number | null
  highlights: Highlight[]
  media: MediaItem[]
}

/**
 * Старая структура сегмента для обратной совместимости
 */
export interface Segment {
  id: number
  name: string
  description: string
  duration: number
  base_service_id: number
  has_uniform_base_service: number | null
  participant_base_services: ParticipantBaseService[]
  type: {
    id: number
    name: string
    description: string
    mandatory: number
  }
  order: number
  addons: Addon[]
}

/**
 * Связь участников с базовым сервисом
 */
export interface ParticipantBaseService {
  id: number
  participants: number
  addon_id: number
}

/**
 * Новая структура медиа из API
 */
export interface MediaItem {
  id: number
  type: 'image' | 'video'
  filename: string
  extension: string
  has_preview?: boolean // для видео
}

/**
 * Старая структура медиа для обратной совместимости
 */
export interface Media {
  format: string
  width: string
  url: string
  mime: string
}

/**
 * Addon/сервис (старая совместимая структура)
 */
export interface Addon {
  id: number
  name: string
  description: string
  internal_description: string
  max_participants: number
  price: number[] // Цены для 1, 2, 3, ..., N участников (prices_per_person)
  prices_per_person?: number[] // Альтернативное название для совместимости
  price_per_km?: number | null // Цена за км (только для транспорта)
  cost_type: 'group_diff' | 'group_fix'
  resource: Resource
  code: string
  area: Area
  duration: number | null // null означает что длительность = длительности тура (для Transportation/Guidance)
  period: string
  media: Media[]
  segmentType?: string
  highlights?: Highlight[]
  unavailable?: boolean
  is_base?: boolean
}

/**
 * Ресурс (автомобиль, гид и т.д.)
 */
export interface Resource {
  id: number
  name: string
  description: string
}

/**
 * Кастомизированный тур (в корзине)
 */
export interface CustomTour {
  addons: Addon[]
  tour_id: number | string
  date: string | null | Date
  participants: number
  total_duration: number
  total_price: number
  basic_addons_ids?: number[]
  preview_img?: string
  destination?: string | null
  name?: string
  cart_timestamp?: string

  /** @deprecated Использовать destination */
  area?: Area
}

/**
 * Фильтры для списка туров
 */
export interface TourFilters {
  searchInput?: string
  featured?: number | boolean
  page?: number
}

/**
 * Данные маршрута для расчёта стоимости (Formula 2)
 */
export interface RoutePricing {
  route_distance_km: number // Расстояние маршрута в км
  route_duration_minutes: number // Время маршрута в минутах
  garage_distance_km: number // Расстояние от гаража в км
  garage_duration_minutes: number // Время от гаража в минутах
  garage_discount_percent?: number // Скидка на путь от гаража (по умолчанию 30)
  base_duration_minutes: number // Базовая длительность тура в минутах
  transport_hourly_rate?: number // Почасовая ставка транспорта
  guidance_hourly_rate?: number // Почасовая ставка гида
  transport_price_per_km?: number // Цена за км транспорта (fallback)
  time_discount_percent?: number // Скидка на сверхурочное время (по умолчанию 5)
  base_prices_per_person?: Array<{
    // Базовые цены на человека для каждого транспорта
    transport_id: number
    transport_name: string
    total: number
    price_per_person: number
  }>
}

/**
 * Фильтры для истории заказов
 */
export interface OrderHistoryFilters {
  area?: string
  sort?: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc'
}

/**
 * Данные заказа из истории
 */
export interface OrderData {
  id: number
  date: string
  assembledTours: TourResponse[]
}

/**
 * Тур в ответе API
 */
export interface TourResponse {
  id: number
  tour: {
    id: number
    name: string
    media: string[] | MediaItem[]
    destination?: string | null
    /** @deprecated Использовать destination */
    area?: {
      id: number
      name: string
      description: string | null
      created_at: string
      updated_at: string
    }
  }
  participants: number
  total_duration: number
  total_price: number
  price_per_participant: number
  addons: Addon[]
  date?: string
}

/**
 * Страница тура (дополнительный контент)
 */
export interface TourPage {
  id: number
  slug: string
  meta: {
    title: string | null
    description: string | null
  }
  /** @deprecated Использовать meta.title */
  meta_title?: string
  /** @deprecated Использовать meta.description */
  meta_description?: string
  title: string
  description?: string
  slide?: unknown
  blocks: Array<{
    type: 'title' | 'text' | 'gallery' | 'quote' | 'video'
    data: {
      title?: string
      description?: string
      images?: string[] | MediaItem[]
      url?: string
    }
  }>
}

/**
 * Чек оплаты
 */
export interface Receipt {
  id: number
  payment_status: string
  area: string
  tour: string
  total_sum: number
  date: string
  payment_code: string
  payment_date: string
  addons: Addon[]
}

/**
 * Ответы API
 */
export interface ToursApiResponse {
  data: Tour[]
  links?: object
  meta?: object
}

export interface TourApiResponse {
  data: Tour
}

export interface TourPageResponse {
  data: TourPage
}

export interface OrderHistoryResponse {
  data: OrderData[]
}

export interface OrderHistoryFiltersResponse {
  data: unknown
}
