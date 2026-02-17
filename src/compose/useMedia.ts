import type { MediaItem, Media } from '@/types/tours'

export const IMAGE_SIZES = {
  THUMBNAIL: 320,
  SMALL: 480,
  MEDIUM: 768,
  LARGE: 1024,
  XLARGE: 1440,
  ORIGINAL: 0
} as const

/**
 * Форматы видео
 */
const VIDEO_FORMATS = new Set(['mp4', 'webm', 'ogg', 'mov'])

/**
 * Форматы изображений
 */
const IMAGE_FORMATS = new Set(['webp', 'jpg', 'jpeg', 'png', 'gif'])

/**
 * Composable для работы с медиа
 */
export function useMedia() {
  /**
   * Проверяет является ли элемент видео (новый формат)
   */
  const isVideoItem = (item: MediaItem): boolean => {
    return item.type === 'video'
  }

  /**
   * Проверяет является ли элемент изображением (новый формат)
   */
  const isImageItem = (item: MediaItem): boolean => {
    return item.type === 'image'
  }

  /**
   * Получает расширение файла из URL
   */
  const getExtension = (url: string): string => {
    return url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Проверяет является ли старый формат Media видео
   */
  const isVideoMedia = (item: Media): boolean => {
    const mime = item.mime?.toLowerCase() || ''
    if (mime.startsWith('video/')) return true

    const format = item.format?.toLowerCase() || ''
    if (VIDEO_FORMATS.has(format)) return true

    return VIDEO_FORMATS.has(getExtension(item.url))
  }

  /**
   * Проверяет является ли старый формат Media изображением
   */
  const isImageMedia = (item: Media): boolean => {
    if (isVideoMedia(item)) return false

    const mime = item.mime?.toLowerCase() || ''
    if (mime.startsWith('image/')) return true

    const format = item.format?.toLowerCase() || ''
    if (IMAGE_FORMATS.has(format)) return true

    return IMAGE_FORMATS.has(getExtension(item.url))
  }

  /**
   * Получает URL оригинального файла
   * Формат: base_url/id/filename.extension
   */
  const getOriginalUrl = (item: MediaItem): string => {
    if (!item) return ''
    const baseUrl =
      import.meta.env.VITE_APP_MEDIA_URL ||
      'https://inspiritaly-test-storage.sfo3.digitaloceanspaces.com'
    return `${baseUrl}/${item.id}/${item.filename}.${item.extension}`
  }

  /**
   * Получает URL превью (thumbnail) с указанным размером
   * Формат: base_url/thumbs/id/size/filename.format
   *
   * @param item - MediaItem из API
   * @param size - Желаемый размер (ширина в пикселях)
   * @returns URL изображения
   */
  const getThumbnailUrl = (item: MediaItem, size: number = IMAGE_SIZES.MEDIUM): string => {
    if (!item) return ''

    // Для оригинального размера возвращаем оригинальный URL
    if (size === IMAGE_SIZES.ORIGINAL || size === 0) {
      return getOriginalUrl(item)
    }

    // Определяем формат (предпочитаем webp, fallback на оригинальный extension)
    const format = supportsWebP() ? 'webp' : item.extension

    // Формат как в InspirItaly: base_url/thumbs/id/size/filename.format
    const baseUrl =
      import.meta.env.VITE_APP_MEDIA_URL ||
      'https://inspiritaly-test-storage.sfo3.digitaloceanspaces.com'
    return `${baseUrl}/thumbs/${item.id}/${size}/${item.filename}.${format}`
  }

  /**
   * Генерирует URL для MediaItem с указанным размером
   *
   * @param item - MediaItem из API
   * @param size - Желаемый размер (ширина в пикселях)
   * @returns URL изображения или видео
   */
  const getMediaUrl = (item: MediaItem, size: number = IMAGE_SIZES.MEDIUM): string => {
    if (!item) return ''

    // Для видео возвращаем оригинальный URL
    if (item.type === 'video') {
      return getOriginalUrl(item)
    }

    // Для изображений возвращаем thumbnail URL
    return getThumbnailUrl(item, size)
  }

  /**
   * Генерирует URL превью для видео
   *
   * @param item - MediaItem видео
   * @param size - Размер превью
   * @returns URL превью или пустую строку
   */
  const getVideoPreviewUrl = (item: MediaItem, size: number = IMAGE_SIZES.MEDIUM): string => {
    if (!item || item.type !== 'video' || !item.has_preview) {
      return ''
    }

    // Превью видео использует тот же формат что и thumbnail
    // Формат: base_url/thumbs/id/size/filename.jpg
    const format = 'jpg'
    const baseUrl =
      import.meta.env.VITE_APP_MEDIA_URL ||
      'https://inspiritaly-test-storage.sfo3.digitaloceanspaces.com'
    return `${baseUrl}/thumbs/${item.id}/${size}/${item.filename}.${format}`
  }

  /**
   * Генерирует srcset для адаптивных изображений
   *
   * @param item - MediaItem изображения
   * @returns Строка srcset для тега img
   */
  const getImageSrcSet = (item: MediaItem): string => {
    if (!item || item.type !== 'image') return ''

    const sizes = [
      IMAGE_SIZES.THUMBNAIL,
      IMAGE_SIZES.SMALL,
      IMAGE_SIZES.MEDIUM,
      IMAGE_SIZES.LARGE,
      IMAGE_SIZES.XLARGE
    ]

    return sizes.map((size) => `${getThumbnailUrl(item, size)} ${size}w`).join(', ')
  }

  /**
   * Получает оптимальный размер изображения для текущего viewport
   *
   * @param isMobile - Флаг мобильного устройства
   * @returns Оптимальный размер
   */
  const getOptimalSize = (isMobile: boolean = false): number => {
    if (typeof window === 'undefined') {
      return isMobile ? IMAGE_SIZES.SMALL : IMAGE_SIZES.MEDIUM
    }

    const width = window.innerWidth

    if (width <= 480) return IMAGE_SIZES.SMALL
    if (width <= 768) return IMAGE_SIZES.MEDIUM
    if (width <= 1024) return IMAGE_SIZES.LARGE
    return IMAGE_SIZES.XLARGE
  }

  /**
   * Конвертирует старый формат Media в URL
   * Для обратной совместимости
   *
   * @param item - Старый формат Media
   * @returns URL медиа
   */
  const getMediaUrlFromLegacy = (item: Media): string => {
    return item.url || ''
  }

  /**
   * Определяет лучшее изображение из массива (приоритет webp)
   *
   * @param items - Массив Media (старый формат)
   * @param preferredSizes - Предпочитаемые размеры по приоритету
   * @returns URL лучшего изображения
   */
  const getBestImageFromLegacy = (
    items: Media[],
    preferredSizes: string[] = ['768', '1024', '1440', '320']
  ): string => {
    if (!items || items.length === 0) return ''

    const formats = ['webp', 'jpg', 'jpeg', 'png']

    for (const size of preferredSizes) {
      for (const format of formats) {
        const match = items.find((item) => {
          const mime = item.mime?.toLowerCase() || ''
          const currentFormat = item.format?.toLowerCase() || ''
          return item.width === size && (currentFormat === format || mime.includes(format))
        })
        if (match?.url) return match.url
      }
    }

    // Fallback на первое доступное изображение
    const fallback = items.find((item) => item.url)
    return fallback?.url || ''
  }

  /**
   * Выбирает видео из массива Media (старый формат)
   *
   * @param items - Массив Media
   * @returns URL видео
   */
  const getVideoFromLegacy = (items: Media[]): string => {
    if (!items || items.length === 0) return ''

    // Предпочитаем размер 768
    const preferred = items.find((item) => item.width === '768')
    if (preferred?.url) return preferred.url

    // Fallback на первое видео
    return items[0]?.url || ''
  }

  /**
   * Проверяет поддержку формата WebP браузером
   */
  const supportsWebP = (): boolean => {
    if (typeof document === 'undefined') return false

    const canvas = document.createElement('canvas')
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    return false
  }

  return {
    // Проверки типов
    isVideoItem,
    isImageItem,
    isVideoMedia,
    isImageMedia,

    // Работа с MediaItem (новый формат)
    getMediaUrl,
    getOriginalUrl,
    getThumbnailUrl,
    getVideoPreviewUrl,
    getImageSrcSet,
    getOptimalSize,

    // Работа с Media (старый формат)
    getMediaUrlFromLegacy,
    getBestImageFromLegacy,
    getVideoFromLegacy,

    // Утилиты
    getExtension,
    supportsWebP,

    // Константы
    IMAGE_SIZES
  }
}
