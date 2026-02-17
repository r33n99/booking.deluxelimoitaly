import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseStickyBarOptions {
  /**
   * Порог видимости элемента (0-1)
   */
  threshold?: number

  /**
   * Отступ от края viewport
   */
  rootMargin?: string

  /**
   * Обратный режим (показывать когда элемент НЕ виден)
   */
  inverse?: boolean

  /**
   * Задержка перед показом/скрытием (мс)
   */
  delay?: number
}

export function useStickyBar(
  targetElement: Ref<HTMLElement | null>,
  options: UseStickyBarOptions = {}
) {
  const { threshold = 0, rootMargin = '0px', inverse = true, delay = 0 } = options

  const isVisible = ref(false)
  const isScrollingDown = ref(false)
  const lastScrollY = ref(0)

  let observer: IntersectionObserver | null = null
  let timeoutId: number | null = null
  let rafId: number | null = null

  /**
   * Обрабатывает изменение видимости целевого элемента
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const shouldShow = inverse ? !entry.isIntersecting : entry.isIntersecting

    if (delay > 0) {
      timeoutId = window.setTimeout(() => {
        isVisible.value = shouldShow
      }, delay)
    } else {
      isVisible.value = shouldShow
    }
  }

  /**
   * Отслеживает направление скролла для дополнительной логики
   */
  const handleScroll = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY
      isScrollingDown.value = currentScrollY > lastScrollY.value
      lastScrollY.value = currentScrollY
    })
  }

  /**
   * Инициализирует наблюдатель
   */
  const initObserver = () => {
    if (!targetElement.value) return

    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    })

    observer.observe(targetElement.value)
  }

  /**
   * Уничтожает наблюдатель
   */
  const destroyObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /**
   * Принудительно показать/скрыть sticky bar
   */
  const setVisible = (value: boolean) => {
    isVisible.value = value
  }

  /**
   * Переключить видимость
   */
  const toggle = () => {
    isVisible.value = !isVisible.value
  }

  onMounted(() => {
    initObserver()
    window.addEventListener('scroll', handleScroll, { passive: true })
    lastScrollY.value = window.scrollY
  })

  onUnmounted(() => {
    destroyObserver()
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isVisible,
    isScrollingDown,
    setVisible,
    toggle,
    initObserver,
    destroyObserver
  }
}

/**
 * Простая версия для случаев когда нужна только scroll логика
 */
export function useScrollDirection() {
  const isScrollingDown = ref(false)
  const scrollY = ref(0)
  const lastScrollY = ref(0)
  let rafId: number | null = null

  const handleScroll = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      scrollY.value = window.scrollY
      isScrollingDown.value = scrollY.value > lastScrollY.value
      lastScrollY.value = scrollY.value
    })
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    lastScrollY.value = window.scrollY
    scrollY.value = window.scrollY
  })

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isScrollingDown,
    scrollY
  }
}
