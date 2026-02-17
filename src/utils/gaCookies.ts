/**
 * Утилита для извлечения Google Analytics данных из cookies
 * Используется для передачи client_id и session_id в Zoho CRM
 */

/**
 * Получить значение cookie по имени
 * @param name - имя cookie
 * @returns значение cookie или null
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

/**
 * Валидация извлеченного значения
 * Разрешены только цифры, точки и символ $
 * Ограничение длины для защиты от переполнения
 * @param value - значение для проверки
 * @returns true если значение валидно
 */
function isValidValue(value: string | null): boolean {
  if (!value || typeof value !== 'string') return false
  if (value.length > 100) return false
  return /^[\d.$]+$/.test(value)
}

/**
 * Извлечь client_id из cookie _ga
 * Удаляет префикс вида GAx.x. и возвращает только хвост
 * @returns client_id или null
 * @example
 * // cookie: _ga=GA1.1.1405948988.1764142353
 * getClientId() // возвращает "1405948988.1764142353"
 */
export function getClientId(): string | null {
  try {
    const gaCookie = getCookie('_ga')

    if (!gaCookie) {
      return null
    }

    const clientId = gaCookie.replace(/^GA\d+\.\d+\./, '')

    if (!isValidValue(clientId)) {
      console.warn('[GA Cookie] Invalid client_id format:', clientId)
      return null
    }

    return clientId
  } catch (error) {
    console.error('[GA Cookie] Error extracting client_id:', error)
    return null
  }
}

/**
 * Извлечь session_id из cookie _ga_*
 * Находит cookie начинающуюся на _ga_ (но не равную _ga)
 * Удаляет префикс GSx.x. и отсекает всё после первой точки/разделителя
 * @returns session_id или null
 * @example
 * // cookie: _ga_TYB9026PVG=GS2.1.1764142353.1.1.16000$o1...
 * getSessionId() // возвращает "1764142353"
 */
export function getSessionId(): string | null {
  try {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    let maxSessionId = 0
    let bestCookie = null

    // Ищем cookie начинающуюся на _ga_, но не равную _ga
    // И выбираем ту, у которой самый большой session_id (самая свежая сессия)
    for (let cookie of cookies) {
      cookie = cookie.trim()

      if (cookie.startsWith('_ga_') && !cookie.startsWith('_ga=')) {
        const [, value] = cookie.split('=')

        if (!value) continue

        // Удаляем префикс GSx.x.
        const sessionValue = value.replace(/^GS\d+\.\d+\./, '')

        // Извлекаем первый блок цифр (session_id)
        const match = sessionValue.match(/(\d+)/)

        if (match && match[1]) {
          const sessionId = match[1]
          const timestamp = parseInt(sessionId, 10)

          // Проверяем валидность и выбираем максимальный
          if (isValidValue(sessionId) && !isNaN(timestamp)) {
            if (timestamp > maxSessionId) {
              maxSessionId = timestamp
              bestCookie = sessionId
            }
          }
        }
      }
    }

    return bestCookie
  } catch (error) {
    console.error('[GA Cookie] Error extracting session_id:', error)
    return null
  }
}

export interface GAParameters {
  client_id: string | null
  session_id: string | null
}

/**
 * Получить оба параметра GA для отправки в Zoho
 * @returns объект с client_id и session_id
 */
export function getGAParameters(): GAParameters {
  return {
    client_id: getClientId(),
    session_id: getSessionId()
  }
}
