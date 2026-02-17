import type { Tour, Category, Segment, Area } from '@/types/tours'
import { normalizeObject } from './storeHelpers'

type TourLike = {
  destination?: string | null | { name?: string }
  area?: { name?: string }
}

function generateServiceCode(serviceName: string, isTransportation: boolean): string {
  if (!isTransportation || !serviceName) return ''

  const name = serviceName.toLowerCase()

  if (name.includes('mercedes e')) return 'MBE'
  if (name.includes('s-class') || name.includes('s class')) return 'SCLASS'
  if (name.includes('mercedes s') && !name.includes('sprinter') && !name.includes('gls'))
    return 'MBS'
  if (name.includes('mercedes v')) return 'MBV'
  if (name.includes('mercedes gls') || name.includes('gls')) return 'MBGLS'
  if (name.includes('sprinter long')) return 'MBSPL'
  if (name.includes('sprinter')) return 'MBSPC'

  return ''
}

function categoryToSegment(category: Category): Segment {
  const titleLower = category.title.toLowerCase()
  const isTransportation =
    titleLower.includes('vehicle') ||
    titleLower.includes('transportation') ||
    titleLower.includes('performance') ||
    titleLower.includes('upgrade your vehicle')

  const participantBaseServices =
    category.configs?.map((config) => ({
      id: 0,
      participants: config.participants_count,
      addon_id: config.base_service_id || 0
    })) || []

  const uniqueBaseServiceIds = new Set(
    category.configs?.map((c) => c.base_service_id).filter((id) => id !== null) || []
  )
  const hasUniformBaseService = uniqueBaseServiceIds.size === 1 ? 1 : null
  const baseServiceId =
    uniqueBaseServiceIds.size === 1
      ? Array.from(uniqueBaseServiceIds)[0] || 0
      : category.configs?.[0]?.base_service_id || 0

  return {
    id: category.id,
    name: category.title,
    description: category.description || '',
    duration: 0,
    base_service_id: baseServiceId,
    has_uniform_base_service: hasUniformBaseService,
    participant_base_services: participantBaseServices,
    type: {
      id: category.id,
      name: isTransportation ? 'Transportation' : 'Experience',
      description: category.description || '',
      mandatory: category.mandatory ? 1 : 0
    },
    order: category.order,
    addons: (category.services || [])
      .filter((service) => {
        const isGuidance = category.title?.toLowerCase().includes('guidance')
        if (isGuidance && (service.id === 17 || service.id === 20)) {
          return false
        }
        return true
      })
      .map((service) => {
        const code = generateServiceCode(service.name, isTransportation)

        return {
          id: service.id,
          name: service.name,
          description: service.description || '',
          internal_description: '',
          max_participants: service.max_participants,
          price: service.prices_per_person || [],
          cost_type: 'group_diff' as const,
          resource: { id: 0, name: '', description: '' },
          code,
          area: { id: 0, name: '', description: '' },
          duration: service.duration === null ? null : service.duration || 0,
          period: '',
          media: (service.media as unknown as never[]) || [],
          highlights: service.highlights || []
        }
      })
  }
}

export function adaptTour(tour: Tour): Tour {
  // Максимальное количество участников (хардкод, т.к. новое API не возвращает это поле)
  const maxParticipants = 8

  // Создаём объект Area для обратной совместимости из destination
  const areaCompat: Area | undefined = tour.destination
    ? { id: 0, name: tour.destination, description: '' }
    : undefined

  // Преобразуем categories в segments
  const segments = tour.categories?.map(categoryToSegment) || []

  // Расчет минимальной стоимости для отображения "От ... €"
  let calculatedMinCost = 0
  if (tour.categories) {
    for (const cat of tour.categories) {
      const config =
        cat.configs?.find((c) => c.participants_count === tour.default_participants_count) ||
        cat.configs?.[0]
      if (config && config.base_service_id) {
        const service = cat.services?.find((s) => s.id === config.base_service_id)
        if (service && service.prices_per_person) {
          const priceIndex = Math.min(
            (tour.default_participants_count || 1) - 1,
            service.prices_per_person.length - 1
          )
          calculatedMinCost += service.prices_per_person[priceIndex] || 0
        }
      }
    }
  }

  // Возвращаем нормализованный объект с добавленными deprecated полями
  return normalizeObject<Tour>({
    ...tour,
    meta_title: tour.meta?.title || null,
    meta_description: tour.meta?.description || null,
    area: areaCompat,
    segments,
    tour_default_participants_amount: tour.default_participants_count,
    max_participants: maxParticipants,
    min_cost: calculatedMinCost,
    min_cost_markup: calculatedMinCost,
    max_cost: null
  } as unknown as Record<string, unknown>)
}

/**
 * Адаптирует массив туров
 *
 * @param tours - Массив туров из API
 * @returns Адаптированный массив туров
 */
export function adaptTours(tours: Tour[]): Tour[] {
  if (!Array.isArray(tours)) {
    console.warn('[tourAdapter] adaptTours received non-array:', tours)
    return []
  }

  return tours.map(adaptTour)
}

/**
 * Получает значение meta title с fallback
 *
 * @param tour - Тур (частичный объект)
 * @returns Meta title
 */
export function getTourMetaTitle(tour: Partial<Tour>): string {
  if (!tour) return ''
  return tour.meta?.title || tour.meta_title || tour.name || ''
}

/**
 * Получает значение meta description с fallback
 *
 * @param tour - Тур (частичный объект)
 * @returns Meta description
 */
export function getTourMetaDescription(tour: Partial<Tour>): string {
  if (!tour) return ''
  return (
    tour.meta?.description ||
    tour.meta_description ||
    tour.short_description ||
    tour.description ||
    ''
  )
}

/**
 * Получает destination/area с fallback
 * Работает с Tour, CustomTour и другими объектами с полем destination/area
 *
 * @param tour - Объект с destination или area
 * @returns Название региона или null
 */
export function getTourDestination(tour: TourLike | null | undefined): string | null {
  if (!tour) return null

  // Новое API возвращает destination как строку
  if (typeof tour.destination === 'string') {
    return tour.destination
  }

  // Если destination - объект (старая структура Area)
  if (tour.destination && typeof tour.destination === 'object' && 'name' in tour.destination) {
    return tour.destination.name || null
  }

  // Fallback на старую структуру (tour.area.name)
  if (tour.area && typeof tour.area === 'object' && 'name' in tour.area) {
    return tour.area.name || null
  }

  return null
}

/**
 * Получает categories/segments с fallback
 *
 * @param tour - Тур (частичный объект)
 * @returns Массив категорий или сегментов
 */
export function getTourCategories(tour: Partial<Tour>): (Category | Segment)[] {
  if (!tour) return []
  return tour.categories || tour.segments || []
}

/**
 * Получает meta title для страницы с fallback
 *
 * @param page - Страница тура
 * @returns Meta title
 */
export function getPageMetaTitle(page: Record<string, unknown> | null | undefined): string {
  if (!page) return ''

  const meta = page.meta as { title?: string } | undefined
  return meta?.title || (page.meta_title as string) || (page.title as string) || ''
}

/**
 * Получает meta description для страницы с fallback
 *
 * @param page - Страница тура
 * @returns Meta description
 */
export function getPageMetaDescription(page: Record<string, unknown> | null | undefined): string {
  if (!page) return ''

  const meta = page.meta as { description?: string } | undefined
  return (
    meta?.description || (page.meta_description as string) || (page.description as string) || ''
  )
}
