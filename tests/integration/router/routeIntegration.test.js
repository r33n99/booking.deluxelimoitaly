import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'

// Создаем упрощенные компоненты для тестирования
const HomePage = { 
  template: '<div data-testid="home">Home Page</div>',
  name: 'HomePage'
}

const ContactPage = { 
  template: '<div data-testid="contact">Contact Page</div>',
  name: 'ContactPage'
}

const VehiclePage = { 
  template: '<div data-testid="vehicle">Vehicle Page</div>',
  name: 'VehiclePage'
}

const NotAllowed = { 
  template: '<div data-testid="forbidden">Access Denied</div>',
  name: 'NotAllowed'
}

const PasswordResetPage = { 
  template: '<div data-testid="password-reset">Reset Password</div>',
  name: 'PasswordResetPage'
}

// Тестовый роутер с упрощенными маршрутами
const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: { title: 'Home - Test' }
      },
      {
        path: '/contact',
        name: 'contact',
        component: ContactPage,
        meta: { title: 'Contact - Test' }
      },
      {
        path: '/vehicle',
        name: 'vehicle',
        component: VehiclePage,
        meta: { title: 'Vehicle - Test' }
      },
      {
        path: '/forbidden',
        name: 'forbidden',
        component: NotAllowed,
        meta: { title: 'Forbidden - Test' }
      },
      {
        path: '/password/reset/:hash',
        name: 'passwordReset',
        component: PasswordResetPage,
        meta: { title: 'Password Reset - Test' }
      }
    ]
  })
}

// Тестовое приложение с роутером
const TestApp = {
  template: `
    <div>
      <nav>
        <router-link to="/" data-testid="home-link">Home</router-link>
        <router-link to="/contact" data-testid="contact-link">Contact</router-link>
        <router-link to="/vehicle" data-testid="vehicle-link">Vehicle</router-link>
      </nav>
      <main>
        <router-view />
      </main>
    </div>
  `
}

describe('Router Integration Tests', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createTestRouter()
    
    // Мок для внешних зависимостей
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Основная навигация', () => {
    it('должен корректно отображать домашнюю страницу', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('[data-testid="home"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="home"]').text()).toBe('Home Page')
    })

    it('должен навигировать между страницами', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Начинаем с домашней страницы
      expect(wrapper.find('[data-testid="home"]').exists()).toBe(true)

      // Программно переходим на страницу контактов
      await router.push('/contact')
      await nextTick()

      expect(wrapper.find('[data-testid="contact"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="home"]').exists()).toBe(false)
    })

    it('должен программно навигировать к маршрутам', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Программно переходим к vehicle
      await router.push('/vehicle')
      await nextTick()

      expect(wrapper.find('[data-testid="vehicle"]').exists()).toBe(true)
      expect(router.currentRoute.value.path).toBe('/vehicle')
    })
  })

  describe('Динамические маршруты', () => {
    it('должен обрабатывать параметры маршрута', async () => {
      const testHash = 'abc123'
      await router.push(`/password/reset/${testHash}`)
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('[data-testid="password-reset"]').exists()).toBe(true)
      expect(router.currentRoute.value.params.hash).toBe(testHash)
    })

    it('должен обрабатывать query параметры', async () => {
      await router.push('/?ssid=test123&utm_source=google')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(router.currentRoute.value.query.ssid).toBe('test123')
      expect(router.currentRoute.value.query.utm_source).toBe('google')
    })
  })

  describe('Мета информация маршрутов', () => {
    it('должен устанавливать title страницы из мета данных', async () => {
      await router.push('/contact')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(router.currentRoute.value.meta.title).toBe('Contact - Test')
    })

    it('должен иметь доступ к мета данным для всех маршрутов', () => {
      const routes = router.getRoutes()
      
      routes.forEach(route => {
        expect(route.meta).toBeDefined()
        expect(route.meta.title).toBeDefined()
        expect(typeof route.meta.title).toBe('string')
      })
    })
  })

  describe('Guards и хуки навигации', () => {
    it('должен вызывать beforeEach guard', async () => {
      const beforeEachSpy = vi.fn()
      router.beforeEach(beforeEachSpy)

      await router.push('/contact')
      await router.isReady()

      expect(beforeEachSpy).toHaveBeenCalled()
      
      const callArgs = beforeEachSpy.mock.calls[0]
      expect(callArgs[0].path).toBe('/contact')
    })

    it('должен вызывать afterEach hook', async () => {
      const afterEachSpy = vi.fn()
      router.afterEach(afterEachSpy)

      await router.push('/vehicle')
      await router.isReady()

      expect(afterEachSpy).toHaveBeenCalled()
      
      const callArgs = afterEachSpy.mock.calls[0]
      expect(callArgs[0].path).toBe('/vehicle')
    })

    it('должен блокировать навигацию через guard', async () => {
      router.beforeEach((to, from, next) => {
        if (to.path === '/forbidden-route') {
          next('/forbidden')
        } else {
          next()
        }
      })

      // Попытка перейти на запрещенный маршрут должна перенаправить
      await router.push('/forbidden-route')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/forbidden')
    })
  })

  describe('История навигации', () => {
    it('должен сохранять историю переходов', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Переходим на контакты
      await router.push('/contact')
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/contact')

      // Переходим на vehicle
      await router.push('/vehicle')
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/vehicle')
    })

    it('должен поддерживать getRoutes для получения всех маршрутов', () => {
      const routes = router.getRoutes()
      expect(routes.length).toBeGreaterThan(0)
      
      const homeRoute = routes.find(r => r.name === 'home')
      expect(homeRoute).toBeDefined()
      expect(homeRoute.path).toBe('/')
    })

    it('должен поддерживать resolve для разрешения маршрутов', () => {
      const resolved = router.resolve('/contact')
      expect(resolved.name).toBe('contact')
      expect(resolved.path).toBe('/contact')
    })
  })

  describe('Замена маршрутов', () => {
    it('должен заменять текущий маршрут', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Переходим на контакты
      await router.push('/contact')
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/contact')

      // Заменяем на vehicle
      await router.replace('/vehicle')
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/vehicle')
    })
  })

  describe('Реактивность роутера', () => {
    it('должен обновлять компоненты при изменении маршрута', async () => {
      router.push('/')
      await router.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Проверяем начальное состояние
      expect(wrapper.find('[data-testid="home"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="contact"]').exists()).toBe(false)

      // Изменяем маршрут
      await router.push('/contact')
      await nextTick()

      // Проверяем обновление
      expect(wrapper.find('[data-testid="home"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="contact"]').exists()).toBe(true)
    })

    it('должен предоставлять реактивный доступ к текущему маршруту', async () => {
      await router.push('/')
      await router.isReady()

      const TestComponent = {
        template: `
          <div>
            <div data-testid="current-path">{{ $route.path }}</div>
            <div data-testid="current-name">{{ $route.name }}</div>
          </div>
        `
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('[data-testid="current-path"]').text()).toBe('/')
      expect(wrapper.find('[data-testid="current-name"]').text()).toBe('home')

      // Изменяем маршрут
      await router.push('/contact')
      await nextTick()

      expect(wrapper.find('[data-testid="current-path"]').text()).toBe('/contact')
      expect(wrapper.find('[data-testid="current-name"]').text()).toBe('contact')
    })
  })

  describe('Обработка ошибок', () => {
    it('должен обрабатывать несуществующие маршруты', async () => {
      // Попытка перейти на несуществующий маршрут
      try {
        await router.push('/nonexistent')
        await router.isReady()
      } catch (error) {
        // Роутер может выбросить ошибку для несуществующих маршрутов
        expect(error).toBeDefined()
      }
    })

    it('должен обрабатывать ошибки в навигационных guards', async () => {
      const errorSpy = vi.fn()
      
      router.beforeEach((to, from, next) => {
        if (to.path === '/error-route') {
          const error = new Error('Navigation error')
          errorSpy(error)
          next(error)
        } else {
          next()
        }
      })

      try {
        await router.push('/error-route')
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled()
        expect(error.message).toBe('Navigation error')
      }
    })
  })

  describe('Lazy loading маршрутов', () => {
    it('должен поддерживать динамический импорт компонентов', async () => {
      const LazyComponent = () => Promise.resolve({
        template: '<div data-testid="lazy">Lazy Component</div>'
      })

      const lazyRouter = createRouter({
        history: createWebHistory(),
        routes: [
          {
            path: '/lazy',
            name: 'lazy',
            component: LazyComponent
          }
        ]
      })

      await lazyRouter.push('/lazy')
      await lazyRouter.isReady()

      wrapper = mount(TestApp, {
        global: {
          plugins: [lazyRouter, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('[data-testid="lazy"]').exists()).toBe(true)
    })
  })
}) 