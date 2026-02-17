/**
 * Хелперы для работы со store
 * Обеспечивают безопасную нормализацию данных из API
 */

/**
 * Нормализует объект, удаляя undefined значения и создавая защищённую копию
 * Это предотвращает проблемы с реактивностью Vue и потенциальные уязвимости
 *
 * @param obj - Объект для нормализации
 * @returns Нормализованная копия объекта без undefined значений
 */
export function normalizeObject<T>(obj: Record<string, unknown>): T {
  if (!obj || typeof obj !== 'object') {
    return obj as T
  }

  // Создаём защищённую копию, исключая prototype pollution
  const result: Record<string, unknown> = {}

  for (const key in obj) {
    // Защита от prototype pollution
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue
    }

    // Пропускаем опасные ключи
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    const value = obj[key]

    // Пропускаем undefined значения
    if (value === undefined) {
      continue
    }

    // Рекурсивно нормализуем вложенные объекты
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        // Нормализуем массивы
        result[key] = value.map((item) =>
          item !== null && typeof item === 'object' && !Array.isArray(item)
            ? normalizeObject(item)
            : item
        )
      } else {
        // Нормализуем вложенные объекты
        result[key] = normalizeObject(value as Record<string, unknown>)
      }
    } else {
      result[key] = value
    }
  }

  return result as T
}

/**
 * Безопасно парсит JSON строку
 * Защищает от различных атак через JSON.parse
 *
 * @param jsonString - JSON строка для парсинга
 * @param fallback - Значение по умолчанию если парсинг не удался
 * @returns Распарсенное значение или fallback
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback
  }

  try {
    const parsed = JSON.parse(jsonString)

    // Дополнительная защита от prototype pollution
    if (parsed && typeof parsed === 'object') {
      return normalizeObject<T>(parsed)
    }

    return parsed as T
  } catch (error) {
    console.warn('[storeHelpers] Failed to parse JSON:', error)
    return fallback
  }
}

/**
 * Безопасно конвертирует значение в число
 *
 * @param value - Значение для конвертации
 * @param fallback - Значение по умолчанию
 * @returns Число или fallback
 */
export function safeParseNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

/**
 * Безопасно извлекает значение из вложенного объекта
 *
 * @param obj - Объект
 * @param path - Путь к значению (разделённый точками)
 * @param fallback - Значение по умолчанию
 * @returns Найденное значение или fallback
 */
export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  if (!obj || typeof obj !== 'object') {
    return fallback
  }

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return fallback
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current as T
}

/**
 * Клонирует объект глубоко и безопасно
 *
 * @param obj - Объект для клонирования
 * @returns Глубокая копия объекта
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T
  }

  const cloned: Record<string, unknown> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Защита от опасных ключей
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue
      }
      cloned[key] = deepClone((obj as Record<string, unknown>)[key])
    }
  }

  return cloned as T
}

/**
 * Сравнивает два объекта на глубокое равенство
 *
 * @param a - Первый объект
 * @param b - Второй объект
 * @returns true если объекты равны
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false
    }

    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }

  return true
}
