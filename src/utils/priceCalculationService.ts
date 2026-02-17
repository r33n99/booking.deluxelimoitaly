import { Addon, Segment, Category, RoutePricing } from '@/types/tours'

/**
 * Константы системных категорий
 */
const SYSTEM_CATEGORY_IDS = {
  TRANSPORTATION: 1, // Транспорт
  GUIDANCE: 4 // Гид
}

/**
 * Значения по умолчанию
 */
const DEFAULT_GARAGE_DISCOUNT = 30 // Скидка на путь от гаража (%)
const DEFAULT_TIME_DISCOUNT = 5 // Скидка на сверхурочное время (%)
const ROUND_FROM_MINUTES = 1 // Порог округления минут

/**
 * Service to centralize all price calculation logic
 *
 * Формулы расчёта согласно бэкенду:
 *
 * 1. total_tour_price = ROUND_UP(total sum price всех выбранных сервисов)
 *
 * 2. Для почасовых сервисов (GroundTransportation/Guidance):
 *    Итоговая цена = (Цена сервиса + наценка) * общее количество часов
 *
 * 3. Для непочасовых сервисов:
 *    Итоговая цена = (Цена сервиса + наценка) * количество участников
 *
 * 4. Общее количество часов:
 *    total_hours = base_hours + extra_hours_discounted
 *
 * 5. Дополнительные часы со скидкой:
 *    extra_hours_discounted = extra_hours_rounded - (extra_hours_rounded * (base_time_discount / 100))
 *
 * 6. Округлённые дополнительные часы:
 *    extra_hours_rounded = if (extra_duration % 60 >= round_from_minutes)
 *                            roundUp(extra_duration / 60)
 *                         else
 *                            roundDown(extra_duration / 60)
 *
 * 7. Дополнительная длительность:
 *    extra_duration = Сумма (addon.duration - segment.duration) для всех выбранных сервисов,
 *                     которые НЕ в категории Guidance и GroundTransportation,
 *                     где addon.duration > segment.duration
 */
export const PriceCalculationService = {
  /**
   * Проверка, является ли категория системной (транспорт или гид)
   */
  isSystemCategory(categoryId?: number): boolean {
    return (
      categoryId === SYSTEM_CATEGORY_IDS.TRANSPORTATION ||
      categoryId === SYSTEM_CATEGORY_IDS.GUIDANCE
    )
  },

  /**
   * Нормализация данных маршрута
   */
  normalizeRoutePricing(routePricing?: RoutePricing): RoutePricing | undefined {
    if (!routePricing) return undefined

    return {
      route_distance_km: routePricing.route_distance_km ?? 0,
      route_duration_minutes: routePricing.route_duration_minutes ?? 0,
      garage_distance_km: routePricing.garage_distance_km ?? 0,
      garage_duration_minutes: routePricing.garage_duration_minutes ?? 0,
      garage_discount_percent: routePricing.garage_discount_percent ?? DEFAULT_GARAGE_DISCOUNT,
      base_duration_minutes: routePricing.base_duration_minutes ?? 0,
      transport_hourly_rate: routePricing.transport_hourly_rate ?? 0,
      guidance_hourly_rate: routePricing.guidance_hourly_rate ?? 0,
      transport_price_per_km: routePricing.transport_price_per_km ?? 0,
      time_discount_percent: routePricing.time_discount_percent ?? DEFAULT_TIME_DISCOUNT,
      base_prices_per_person: routePricing.base_prices_per_person
    }
  },

  /**
   * Получение базовой цены за человека (без наценки)
   */
  getPricePerPersonRaw(addon: Addon, participants: number): number {
    const prices = addon.prices_per_person || addon.price
    if (!prices || !Array.isArray(prices)) {
      return 0
    }

    const index = Math.max(0, Math.min(participants - 1, prices.length - 1))
    return prices[index] ?? prices[prices.length - 1] ?? 0
  },

  /**
   * Получение цены за человека с наценкой
   */
  getPricePerPersonWithMarkup(addon: Addon, participants: number, category?: Category): number {
    if (!addon) return 0

    // Проверка максимума участников
    if (participants > addon.max_participants && addon.max_participants > 0) {
      return 0
    }

    // Получаем базовую цену
    const baseCost = this.getPricePerPersonRaw(addon, participants)

    // Применяем наценку
    return this.applyMarkup(baseCost, participants, category)
  },

  /**
   * Calculate price for a single addon
   * Формула согласно бэкенду:
   * - Для почасовых сервисов (GroundTransportation/Guidance): (Цена за человека + наценка) * общее количество часов
   * - Для непочасовых сервисов: (Цена за человека + наценка) * количество участников
   *
   * @param addon - Сервис для расчета
   * @param participants - Количество участников
   * @param segment - Сегмент (старая структура)
   * @param driverHourlyRate - Почасовая ставка водителя (не используется в новой логике)
   * @param category - Категория (новая структура) для применения наценки
   * @param totalHours - Общее количество часов тура (базовые + дополнительные со скидкой)
   */
  calculateAddonPrice(
    addon: Addon,
    participants: number,
    segment: Segment | undefined,
    driverHourlyRate: number,
    category?: Category,
    totalHours?: number
  ): number {
    if (!addon) {
      return 0
    }

    if (
      addon.max_participants != null &&
      addon.max_participants > 0 &&
      participants > addon.max_participants
    ) {
      return 0
    }

    // Определяем, является ли сервис почасовым (GroundTransportation или Guidance)
    const isHourlyService = this.isSystemCategory(category?.id)

    // Получаем цену за человека с наценкой
    const pricePerPerson = this.getPricePerPersonWithMarkup(addon, participants, category)

    // Для почасовых сервисов умножаем на общее количество часов (считается за группу)
    if (isHourlyService && totalHours !== undefined) {
      return this.roundPrice(pricePerPerson * totalHours)
    }

    // Для непочасовых сервисов умножаем на количество участников
    return this.roundPrice(pricePerPerson * participants)
  },

  /**
   * Применяет наценку из категории на основе количества участников
   * @param basePrice - Базовая цена за человека
   * @param participants - Количество участников
   * @param category - Категория с массивом наценок
   */
  applyMarkup(basePrice: number, participants: number, category?: Category): number {
    if (!category?.markups || !Array.isArray(category.markups)) {
      return basePrice
    }

    // Индекс = participants - 1 (для 1 участника индекс 0, для 2 - индекс 1)
    const markupIndex = Math.max(0, Math.min(participants - 1, category.markups.length - 1))
    const markupPercent = category.markups[markupIndex] ?? 0

    return basePrice * (1 + markupPercent / 100)
  },
  /**
   * Calculate driver hourly rate based on selected transportation
   */
  calculateDriverHourlyRate(
    selectedAddons: { [key: number]: Addon },
    baseTourDuration: number,
    hourDiscount: number = 0,
    participants: number = 1
  ): number {
    const transportAddon = Object.values(selectedAddons).find(
      (a) => a.segmentType === 'Transportation'
    )

    if (!transportAddon) {
      return 0
    }

    // Округляем цену вверх (до следующего целого)
    const rawTransportPrice = transportAddon.price[participants - 1] || 0
    const transportPrice = Math.ceil(rawTransportPrice)

    const baseTourHours = baseTourDuration / 60

    if (baseTourHours <= 0) {
      return 0
    }

    const hourlyRateBeforeDiscountRaw = transportPrice / baseTourHours
    const hourlyRateBeforeDiscount = Number(hourlyRateBeforeDiscountRaw.toFixed(2))

    const discountPercent = hourDiscount / 100
    const hourlyRateAfterDiscountRaw = hourlyRateBeforeDiscount * (1 - discountPercent)
    const hourlyRateAfterDiscount = Number(hourlyRateAfterDiscountRaw.toFixed(2))

    return Math.max(0, hourlyRateAfterDiscount)
  },

  /**
   * Calculate total hours with discount for price calculation
   * Формула согласно бэкенду (TourService::getTotalPrice):
   * total_hours = base_hours + extra_hours_discounted
   * extra_hours_discounted = extra_hours * (1 - time_discount / 100)
   * extra_hours = (total_minutes - base_minutes) / 60
   *
   * @param baseDurationMinutes - Базовая длительность тура в минутах
   * @param selectedAddons - Словарь выбранных аддонов
   * @param segments - Массив сегментов
   * @param categories - Массив категорий
   * @param timeDiscount - Скидка на дополнительное время в процентах
   * @param roundFromMinutes - Порог округления в минутах
   */
  calculateTotalHoursWithDiscount(
    baseDurationMinutes: number,
    selectedAddons: { [key: number]: Addon },
    segments: Segment[],
    categories?: Category[],
    timeDiscount: number = 0,
    roundFromMinutes: number = 1,
    participants: number = 1
  ): number {
    // Получаем total_duration в минутах (без скидки)
    const totalMinutes = this.calculateTotalDuration(
      baseDurationMinutes,
      selectedAddons,
      segments,
      categories,
      0, // скидка не применяется при расчёте длительности
      roundFromMinutes,
      participants
    )

    // extra_minutes = total_minutes - base_minutes
    const extraMinutes = Math.max(0, totalMinutes - baseDurationMinutes)
    const extraHours = extraMinutes / 60

    // Применяем скидку к дополнительным часам
    const discountCoefficient = 1 - timeDiscount / 100
    const discountedExtraHours = extraHours * discountCoefficient

    // total_hours = base_hours + discounted_extra_hours
    const baseHours = baseDurationMinutes / 60
    return baseHours + discountedExtraHours
  },

  /**
   * Internal helper to resolve base services for mandatory segments if not provided
   */
  resolveFullAddons(
    selectedAddons: { [key: number]: Addon | undefined },
    segments: Segment[],
    participants: number,
    categories?: Category[],
    alwaysResolve: boolean = false
  ): { [key: number]: Addon } {
    const full: { [key: number]: Addon } = {}

    for (const segment of segments) {
      const sId = Number(segment.id)
      let addon: Addon | undefined = selectedAddons[sId]
      const category = categories?.find((cat) => Number(cat.id) === sId)

      if (!addon) {
        const isMandatory = category?.mandatory === true
        if (
          alwaysResolve ||
          isMandatory ||
          category?.configs?.some((c) => Number(c.base_service_id) > 0)
        ) {
          if (category?.configs?.length) {
            let config = category.configs.find(
              (c: any) => Number(c.participants_count) === Number(participants)
            )
            if (!config) config = category.configs[0]
            if (config?.base_service_id) {
              addon = segment.addons?.find(
                (a: any) => Number(a.id) === Number(config.base_service_id)
              )
            }
          }
          if (!addon && segment.participant_base_services?.length) {
            let baseService = segment.participant_base_services.find(
              (s: any) => Number(s.participants) === Number(participants)
            )
            if (!baseService) baseService = segment.participant_base_services[0]
            if (baseService) {
              addon = segment.addons?.find(
                (a: any) => Number(a.id) === Number(baseService.addon_id)
              )
            }
          }
          if (!addon && segment.has_uniform_base_service && segment.base_service_id) {
            addon = segment.addons?.find(
              (a: any) => Number(a.id) === Number(segment.base_service_id)
            )
          }
        }
        if (!addon && segment.addons?.length > 0) {
          addon = segment.addons[0]
        }
      }

      if (addon) {
        full[sId] = addon
      }
    }
    return full
  },

  /**
   * Расчёт стоимости по Formula 2 (с учётом маршрута) - raw версия без округления
   */
  calculateTotalPriceRawFormula2(
    fullSelected: { [key: number]: Addon },
    segments: Segment[],
    participants: number,
    categories: Category[],
    baseDurationMinutes: number,
    routePricing: RoutePricing
  ): number {
    const normalized = this.normalizeRoutePricing(routePricing)!
    const transportCategory = categories.find(
      (cat) => cat.id === SYSTEM_CATEGORY_IDS.TRANSPORTATION
    )
    const guidanceCategory = categories.find((cat) => cat.id === SYSTEM_CATEGORY_IDS.GUIDANCE)

    // Шаг 1: Расчёт пути от гаража со скидкой
    const garageDiscountPercent = normalized.garage_discount_percent ?? DEFAULT_GARAGE_DISCOUNT
    const discountedGarageKm = normalized.garage_distance_km * (1 - garageDiscountPercent / 100)
    const discountedGarageMin =
      normalized.garage_duration_minutes * (1 - garageDiscountPercent / 100)

    // Шаг 2: Общий километраж и время
    const totalKm = normalized.route_distance_km + discountedGarageKm
    const totalRouteMinutes = normalized.route_duration_minutes + discountedGarageMin

    // Шаг 3: Расчёт оплачиваемых часов (Billable Hours)
    const timeDiscountPercent =
      normalized.time_discount_percent ?? transportCategory?.time_discount ?? DEFAULT_TIME_DISCOUNT

    // Базовые часы из длительности тура (как на бэкенде)
    const baseHours = baseDurationMinutes / 60
    const extraMinutes = Math.max(0, totalRouteMinutes - baseDurationMinutes)
    const extraHours = extraMinutes / 60
    const extraHoursDiscounted = extraHours * (1 - timeDiscountPercent / 100)
    const billableHours = baseHours + extraHoursDiscounted

    // Шаг 4: Получение почасовых ставок транспорта и гида
    let transportHourlyRate = 0
    let guidanceHourlyRate = 0

    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const category = categories.find((cat) => Number(cat.id) === sId)

      if (category?.id === SYSTEM_CATEGORY_IDS.TRANSPORTATION) {
        const baseRate = this.getPricePerPersonRaw(addon, participants)
        transportHourlyRate = this.applyMarkup(baseRate, participants, category)
      } else if (category?.id === SYSTEM_CATEGORY_IDS.GUIDANCE) {
        const baseRate = this.getPricePerPersonRaw(addon, participants)
        guidanceHourlyRate = this.applyMarkup(baseRate, participants, category)
      }
    }

    // Стоимость времени
    const timeCost = (transportHourlyRate + guidanceHourlyRate) * billableHours

    // Шаг 5: Расчёт стоимости за километраж (только для транспорта)
    let pricePerKm = 0

    // Находим транспорт из fullSelected
    let selectedTransport: Addon | null = null
    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const category = categories.find((cat) => Number(cat.id) === sId)
      if (category?.id === SYSTEM_CATEGORY_IDS.TRANSPORTATION) {
        selectedTransport = addon
        break
      }
    }

    // Приоритет поиска price_per_km:
    // 1. из categories.services (данные с API)
    if (selectedTransport && transportCategory?.services) {
      const transportFromCategories = transportCategory.services.find(
        (service) => service.id === selectedTransport!.id
      )
      if (transportFromCategories?.price_per_km && transportFromCategories.price_per_km > 0) {
        pricePerKm = transportFromCategories.price_per_km
      }
    }

    // 2. из addon.price_per_km
    if (pricePerKm === 0 && selectedTransport?.price_per_km && selectedTransport.price_per_km > 0) {
      pricePerKm = selectedTransport.price_per_km
    }

    // 3. fallback на routePricing.transport_price_per_km
    if (pricePerKm === 0) {
      pricePerKm = normalized.transport_price_per_km ?? 0
    }

    // ВАЖНО: Наценка на КМ НЕ накладывается!
    const distanceCost = totalKm * pricePerKm

    // Шаг 6: Стоимость дополнительных услуг
    let addonsPricePerPerson = 0

    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const category = categories.find((cat) => Number(cat.id) === sId)

      // Пропускаем системные категории (транспорт/гид)
      if (this.isSystemCategory(category?.id)) {
        continue
      }

      // Исключаем категории с order=0 (опциональные)
      if (category?.order === 0) {
        continue
      }

      // Исключаем необязательные категории без base_service_id
      const isMandatory = category?.mandatory === true
      const hasBaseService = category?.configs?.some((c) => c.base_service_id != null) ?? false

      if (!isMandatory && !hasBaseService) {
        continue
      }

      // Получаем цену с наценкой
      const priceWithMarkup = this.getPricePerPersonWithMarkup(addon, participants, category)
      addonsPricePerPerson += priceWithMarkup
    }

    // Итоговая стоимость услуг
    const addonsCost = addonsPricePerPerson * participants

    // Шаг 7: Итоговая сумма
    const totalRaw = timeCost + distanceCost + addonsCost
    return totalRaw
  },

  calculateTotalPrice(
    selectedAddons: { [key: number]: Addon },
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing,
    alwaysResolveGaps: boolean = false
  ): number {
    // Заполняем все пропуски в выбранных услугах
    const fullSelected = this.resolveFullAddons(
      selectedAddons,
      segments,
      participants,
      categories,
      alwaysResolveGaps
    )

    // Если есть routePricing, используем Formula 2
    if (routePricing) {
      const normalized = this.normalizeRoutePricing(routePricing)
      if (normalized && categories) {
        const totalRaw = this.calculateTotalPriceRawFormula2(
          fullSelected,
          segments,
          participants,
          categories,
          baseDurationMinutes || 0,
          normalized
        )
        return Math.ceil(this.roundPrice(totalRaw))
      }
    }

    // Fallback формула (без данных маршрута)
    const totalHours =
      baseDurationMinutes !== undefined
        ? this.calculateTotalHoursWithDiscount(
            baseDurationMinutes,
            fullSelected,
            segments,
            categories,
            timeDiscount || 0,
            roundFromMinutes || 1,
            participants
          )
        : undefined

    let total = 0

    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const segment = segments.find((s) => Number(s.id) === sId)
      const category = categories?.find((cat) => Number(cat.id) === sId)

      // Пропускаем системные категории (транспорт/гид) - они учитываются в timeCost
      if (this.isSystemCategory(category?.id)) {
        continue
      }

      // Исключаем категории с order=0 (опциональные)
      if (category?.order === 0) {
        continue
      }

      // Исключаем необязательные категории без base_service_id
      const isMandatory = category?.mandatory === true
      const hasBaseService = category?.configs?.some((c) => c.base_service_id != null) ?? false

      if (!isMandatory && !hasBaseService) {
        continue
      }

      // Для fallback формулы считаем услуги на человека
      const pricePerPerson = this.getPricePerPersonWithMarkup(addon, participants, category)
      total += pricePerPerson * participants
    }

    // Добавляем стоимость времени для транспорта и гида (fallback формула)
    if (totalHours !== undefined && categories) {
      let transportHourlyRate = 0
      let guidanceHourlyRate = 0

      for (const [segmentId, addon] of Object.entries(fullSelected)) {
        const sId = Number(segmentId)
        const category = categories.find((cat) => Number(cat.id) === sId)

        if (category?.id === SYSTEM_CATEGORY_IDS.TRANSPORTATION) {
          const baseRate = this.getPricePerPersonRaw(addon, participants)
          transportHourlyRate = this.applyMarkup(baseRate, participants, category)
        } else if (category?.id === SYSTEM_CATEGORY_IDS.GUIDANCE) {
          const baseRate = this.getPricePerPersonRaw(addon, participants)
          guidanceHourlyRate = this.applyMarkup(baseRate, participants, category)
        }
      }

      const timePriceGroup = (transportHourlyRate + guidanceHourlyRate) * totalHours
      total += timePriceGroup
    }

    return Math.ceil(this.roundPrice(total))
  },

  /**
   * Calculate total price raw (without rounding up) - для внутренних расчётов
   */
  calculateTotalPriceRaw(
    selectedAddons: { [key: number]: Addon | undefined },
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing,
    alwaysResolveGaps: boolean = false
  ): number {
    // Заполняем все пропуски в выбранных услугах
    const fullSelected = this.resolveFullAddons(
      selectedAddons,
      segments,
      participants,
      categories,
      alwaysResolveGaps
    )

    // Если есть routePricing, используем Formula 2
    if (routePricing) {
      const normalized = this.normalizeRoutePricing(routePricing)
      if (normalized && categories) {
        return this.calculateTotalPriceRawFormula2(
          fullSelected,
          segments,
          participants,
          categories,
          baseDurationMinutes || 0,
          normalized
        )
      }
    }

    // Fallback формула (без данных маршрута)
    // Используем те же методы что и в inspiritaly-frontend
    const totalHours =
      baseDurationMinutes !== undefined
        ? this.calculateTotalHoursWithDiscount(
            baseDurationMinutes,
            fullSelected,
            segments,
            categories,
            timeDiscount || 0,
            roundFromMinutes || 1,
            participants
          )
        : undefined

    const timePriceGroup = this.calculateTimePrice(
      fullSelected,
      categories,
      participants,
      totalHours
    )
    const addonsPricePerPerson = this.calculateAddonsPrice(fullSelected, categories, participants)

    const total = timePriceGroup + addonsPricePerPerson * participants

    return this.roundPrice(total)
  },

  /**
   * Рассчитывает стоимость времени (транспорт + гид) * часы
   */
  calculateTimePrice(
    fullSelected: { [key: number]: Addon },
    categories: Category[] | undefined,
    participants: number,
    totalHours: number | undefined
  ): number {
    let transportationRate = 0
    let guidanceRate = 0

    // Собираем почасовые ставки для транспорта и гида
    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const category = categories?.find((cat) => Number(cat.id) === sId)

      if (!category) continue

      const pricePerPerson = this.getPricePerPersonWithMarkup(addon, participants, category)

      if (category.id === SYSTEM_CATEGORY_IDS.TRANSPORTATION) {
        transportationRate = pricePerPerson
      } else if (category.id === SYSTEM_CATEGORY_IDS.GUIDANCE) {
        guidanceRate = pricePerPerson
      }
    }

    const hourlyRate = transportationRate + guidanceRate
    const result = totalHours !== undefined ? hourlyRate * totalHours : 0

    return result
  },

  /**
   * Рассчитывает сумму дополнительных услуг (не транспорт/гид) на одного человека
   */
  calculateAddonsPrice(
    fullSelected: { [key: number]: Addon },
    categories: Category[] | undefined,
    participants: number
  ): number {
    let addonsPricePerPerson = 0

    // Суммируем все услуги кроме транспорта и гида
    for (const [segmentId, addon] of Object.entries(fullSelected)) {
      const sId = Number(segmentId)
      const category = categories?.find((cat) => Number(cat.id) === sId)

      // Пропускаем системные категории (транспорт/гид)
      if (this.isSystemCategory(category?.id)) {
        continue
      }

      // Пропускаем необязательные категории, которые не входят в базовый пакет тура
      const isMandatory = category?.mandatory === true
      const hasBaseService = category?.configs?.some((c) => c.base_service_id != null) ?? false
      const categoryOrder = category?.order ?? 0

      // Исключаем категории с order=0 (опциональные, не входят в базовый пакет)
      if (categoryOrder === 0) {
        continue
      }

      // Исключаем необязательные категории без base_service_id
      if (!isMandatory && !hasBaseService) {
        continue
      }

      // Получаем цену с наценкой (как на бэкенде)
      const priceWithMarkup = this.getPricePerPersonWithMarkup(addon, participants, category)
      addonsPricePerPerson += priceWithMarkup
    }

    return addonsPricePerPerson
  },

  /**
   * Calculate total price if a specific addon was selected in its category (raw, without rounding)
   */
  calculateTourPriceWithSpecificAddonRaw(
    addon: Addon,
    currentSelectedAddons: { [key: number]: Addon | undefined },
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing,
    alwaysResolveGaps: boolean = false
  ): number {
    // Находим сегмент, которому принадлежит услуга
    const segment = segments.find((s: any) =>
      (s.addons || s.services)?.some((a: Addon) => Number(a.id) === Number(addon.id))
    )
    if (!segment) {
      return 0
    }

    // Создаем новый набор услуг с выбранной
    const newSelected = { ...currentSelectedAddons, [segment.id]: addon }

    return this.calculateTotalPriceRaw(
      newSelected,
      segments,
      participants,
      driverHourlyRate,
      categories,
      baseDurationMinutes,
      timeDiscount,
      roundFromMinutes,
      routePricing,
      alwaysResolveGaps
    )
  },

  /**
   * Calculate total price if a specific addon was selected in its category
   */
  calculateTourPriceWithSpecificAddon(
    specificAddon: Addon,
    currentSelectedAddons: Record<number, Addon>,
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing
  ): number {
    const tempSelected = { ...currentSelectedAddons }

    // Find which segment this addon belongs to
    const segment = segments.find((s) =>
      s.addons?.some((a) => Number(a.id) === Number(specificAddon.id))
    )
    if (segment) {
      tempSelected[Number(segment.id)] = specificAddon
    }

    return this.calculateTotalPrice(
      tempSelected,
      segments,
      participants,
      driverHourlyRate,
      categories,
      baseDurationMinutes,
      timeDiscount,
      roundFromMinutes,
      routePricing
    )
  },

  /**
   * Рассчитывает разницу в цене при выборе другой услуги (для UI)
   */
  calculatePriceDifference(
    addon: Addon,
    baselinePriceRaw: number,
    currentSelectedAddons: { [key: number]: Addon | undefined },
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing,
    alwaysResolveGaps: boolean = true
  ): number {
    // Считаем новую цену с выбранной услугой
    const newTotalRaw = this.calculateTourPriceWithSpecificAddonRaw(
      addon,
      currentSelectedAddons,
      segments,
      participants,
      driverHourlyRate,
      categories,
      baseDurationMinutes,
      timeDiscount,
      roundFromMinutes,
      routePricing,
      alwaysResolveGaps
    )

    const difference = newTotalRaw - baselinePriceRaw

    // Возвращаем разницу
    return difference
  },

  /**
   * Calculate price per participant
   * @param selectedAddons - Словарь выбранных аддонов
   * @param segments - Массив сегментов
   * @param participants - Количество участников
   * @param driverHourlyRate - Почасовая ставка водителя
   * @param categories - Массив категорий для применения наценок
   * @param routePricing - Данные маршрута для Formula 2
   */
  calculatePricePerParticipant(
    selectedAddons: Record<number, Addon>,
    segments: Segment[],
    participants: number,
    driverHourlyRate: number,
    categories?: Category[],
    baseDurationMinutes?: number,
    timeDiscount?: number,
    roundFromMinutes?: number,
    routePricing?: RoutePricing
  ): number {
    if (participants <= 0) return 0
    const total = this.calculateTotalPrice(
      selectedAddons,
      segments,
      participants,
      driverHourlyRate,
      categories,
      baseDurationMinutes,
      timeDiscount,
      roundFromMinutes,
      routePricing
    )
    // Округляем до целого числа (как в inspiritaly-frontend)
    return Math.round(total / participants)
  },

  /**
   * Calculate total duration in minutes
   * Формула согласно бэкенду (TourService::getTotalDuration):
   *
   * Если есть routePricing:
   *   total_duration = base_duration + route_duration_minutes + discounted_garage_minutes
   *
   * Если нет routePricing:
   *   total_duration = base_duration + extra_duration_rounded
   *   extra_duration_rounded = округление extra_duration до целых часов в минутах
   *   extra_duration = Сумма duration всех выбранных сервисов, которые НЕ в категории Guidance и GroundTransportation
   *
   * @param baseDurationMinutes - Базовая длительность тура в минутах
   * @param selectedAddons - Словарь выбранных аддонов
   * @param segments - Массив сегментов
   * @param categories - Массив категорий для проверки типа (Transportation/Guidance)
   * @param timeDiscount - Скидка на дополнительное время (не используется для расчёта длительности)
   * @param roundFromMinutes - Порог округления в минутах (round_from_minutes), по умолчанию 1
   * @param participants - Количество участников
   * @param routePricing - Данные маршрута (если есть)
   */
  calculateTotalDuration(
    baseDurationMinutes: number,
    selectedAddons: { [key: number]: Addon },
    segments: Segment[],
    categories?: Category[],
    _timeDiscount: number = 0,
    roundFromMinutes: number = 1,
    participants: number = 1,
    routePricing?: RoutePricing
  ): number {
    // Если есть данные о маршруте - используем их
    if (routePricing) {
      const normalized = this.normalizeRoutePricing(routePricing)
      if (normalized) {
        const garageDiscountPercent = normalized.garage_discount_percent ?? DEFAULT_GARAGE_DISCOUNT
        const discountedGarageMin =
          normalized.garage_duration_minutes * (1 - garageDiscountPercent / 100)
        const baseDuration = baseDurationMinutes || normalized.base_duration_minutes || 0
        const totalDurationMinutes =
          baseDuration + normalized.route_duration_minutes + discountedGarageMin
        return Math.ceil(totalDurationMinutes)
      }
    }

    // Иначе считаем по старому: базовое время + время дополнительных услуг
    // ВАЖНО: используем selectedAddons напрямую, как в inspiritaly-frontend
    // Не заполняем базовые автоматически через resolveFullAddons
    let extraDuration = 0

    for (const segment of segments) {
      const addon = selectedAddons[segment.id]
      if (!addon) continue

      const category = categories?.find((cat) => cat.id === segment.id)
      const isSystemService =
        this.isSystemCategory(category?.id) ||
        category?.title?.toLowerCase().includes('transportation') ||
        category?.title?.toLowerCase().includes('vehicle') ||
        category?.title?.toLowerCase().includes('guidance') ||
        category?.title?.toLowerCase().includes('performance') ||
        segment.type?.name?.toLowerCase().includes('transportation') ||
        segment.type?.name?.toLowerCase().includes('guidance') ||
        segment.type?.name?.toLowerCase().includes('performance')

      // Системные услуги не добавляют время
      if (isSystemService) continue

      extraDuration += Number(addon.duration) || 0
    }

    if (extraDuration === 0) return baseDurationMinutes

    // Округляем дополнительное время до часа
    const remainder = extraDuration % 60
    const extraDurationRounded =
      remainder < roundFromMinutes ? extraDuration - remainder : extraDuration + (60 - remainder)

    return baseDurationMinutes + extraDurationRounded
  },

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    if (!minutes) return '0 Min'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs > 0 ? `${hrs} Hrs` : ''} ${mins > 0 ? `${mins} Min` : ''}`.trim()
  },

  /**
   * Format total duration for display (e.g., "2h 30m")
   * @param durationInMinutes - Длительность в минутах
   */
  formatTotalDuration(durationInMinutes: number): string {
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)

    return parts.join(' ') || '0m'
  },

  /**
   * Rounds price to 2 decimal places to avoid floating point issues
   */
  roundPrice(price: number): number {
    return parseFloat((Math.round(price * 100) / 100).toFixed(2))
  },
  /**
   * Format price for display with 2 decimal places
   */
  formatPrice(price: number): string {
    const rounded = this.roundPrice(price)
    return Number(rounded).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }
}
