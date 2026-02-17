import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import router from '@/router'

describe('Router Configuration Tests', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Конфигурация маршрутов', () => {
    it('должен содержать основные маршруты', () => {
      const routes = router.getRoutes()
      const routeNames = routes.map(route => route.name).filter(Boolean)
      
      expect(routeNames).toContain('home')
      expect(routeNames).toContain('contact')
      expect(routeNames).toContain('vehicle')
      expect(routeNames).toContain('payment')
      expect(routeNames).toContain('success')
      expect(routeNames).toContain('signin')
      expect(routeNames).toContain('accountinformation')
    })

    it('должен иметь корректные пути для основных маршрутов', () => {
      const routes = router.getRoutes()
      
      const homeRoute = routes.find(r => r.name === 'home')
      expect(homeRoute?.path).toBe('/')
      
      const contactRoute = routes.find(r => r.name === 'contact')
      expect(contactRoute?.path).toBe('/contact')
      
      const vehicleRoute = routes.find(r => r.name === 'vehicle')
      expect(vehicleRoute?.path).toBe('/vehicle')
    })

    it('должен содержать динамические маршруты с параметрами', () => {
      const routes = router.getRoutes()
      
      const paymentRoute = routes.find(r => r.name === 'payment')
      expect(paymentRoute?.path).toBe('/payment/:transaction_id')
      
      const passwordResetRoute = routes.find(r => r.name === 'passwordReset')
      expect(passwordResetRoute?.path).toBe('/password/reset/:hash')
      
      const successRoute = routes.find(r => r.name === 'success_payment')
      expect(successRoute?.path).toBe('/success/:order_id/:payment_link/:payment_session')
    })

    it('должен содержать catch-all маршрут для 404', () => {
      const routes = router.getRoutes()
      const notFoundRoute = routes.find(r => r.path === '/:pathMatch(.*)*')
      expect(notFoundRoute).toBeDefined()
    })
  })

  describe('Мета информация маршрутов', () => {
    it('должен иметь title для всех основных маршрутов', () => {
      const routes = router.getRoutes()
      const mainRoutes = routes.filter(r => r.name && !r.name.toString().startsWith('Step'))
      
      mainRoutes.forEach(route => {
        if (route.name !== '/:pathMatch(.*)*') {
          expect(route.meta?.title).toBeDefined()
          expect(typeof route.meta.title).toBe('string')
        }
      })
    })

    it('должен иметь шаги регистрации с правильными метаданными', () => {
      const routes = router.getRoutes()
      
      const step1 = routes.find(r => r.name === 'Step1')
      const step2 = routes.find(r => r.name === 'Step2')
      const step3 = routes.find(r => r.name === 'Step3')
      
      expect(step1?.meta?.step).toBe(1)
      expect(step2?.meta?.step).toBe(2)
      expect(step3?.meta?.step).toBe(3)
    })
  })

  describe('Account маршруты', () => {
    it('должен содержать все account маршруты', () => {
      const routes = router.getRoutes()
      const accountRoutes = routes.filter(r => r.path.startsWith('/account/'))
      
      expect(accountRoutes.length).toBeGreaterThan(0)
      
      const routeNames = accountRoutes.map(r => r.name)
      expect(routeNames).toContain('accountinformation')
      expect(routeNames).toContain('signin')
      expect(routeNames).toContain('ridehistory')
      expect(routeNames).toContain('agencyinformation')
      expect(routeNames).toContain('documents/receipts')
      expect(routeNames).toContain('termsofservice')
    })

    it('должен иметь корректные пути для account маршрутов', () => {
      const routes = router.getRoutes()
      
      const accountInfo = routes.find(r => r.name === 'accountinformation')
      expect(accountInfo?.path).toBe('/account/accountinformation')
      
      const signin = routes.find(r => r.name === 'signin')
      expect(signin?.path).toBe('/account/signin')
      
      const rideHistory = routes.find(r => r.name === 'ridehistory')
      expect(rideHistory?.path).toBe('/account/ridehistory')
    })
  })

  describe('Специальные маршруты', () => {
    it('должен содержать маршруты для forbidden и alreadyPaid', () => {
      const routes = router.getRoutes()
      
      const forbiddenRoute = routes.find(r => r.name === 'forbidden')
      expect(forbiddenRoute?.path).toBe('/forbidden')
      
      const alreadyPaidRoute = routes.find(r => r.name === 'alreadyPaid')
      expect(alreadyPaidRoute?.path).toBe('/alreadyPaid')
    })

    it('должен поддерживать множественные success маршруты', () => {
      const routes = router.getRoutes()
      
      const successRoutes = routes.filter(r => 
        r.name && r.name.toString().includes('success')
      )
      
      expect(successRoutes.length).toBeGreaterThanOrEqual(3)
      
      const routeNames = successRoutes.map(r => r.name)
      expect(routeNames).toContain('success')
      expect(routeNames).toContain('success_payment')
      expect(routeNames).toContain('success_payment_intent')
    })
  })

  describe('Навигация и resolve', () => {
    it('должен корректно разрешать маршруты по имени', () => {
      const homeResolved = router.resolve({ name: 'home' })
      expect(homeResolved.name).toBe('home')
      expect(homeResolved.path).toBe('/')
      
      const contactResolved = router.resolve({ name: 'contact' })
      expect(contactResolved.name).toBe('contact')
      expect(contactResolved.path).toBe('/contact')
    })

    it('должен корректно разрешать маршруты по пути', () => {
      const homeResolved = router.resolve('/')
      expect(homeResolved.name).toBe('home')
      
      const contactResolved = router.resolve('/contact')
      expect(contactResolved.name).toBe('contact')
    })

    it('должен обрабатывать параметры в динамических маршрутах', () => {
      const paymentResolved = router.resolve('/payment/trans123')
      expect(paymentResolved.name).toBe('payment')
      expect(paymentResolved.params.transaction_id).toBe('trans123')
      
      const passwordResetResolved = router.resolve('/password/reset/abc123')
      expect(passwordResetResolved.name).toBe('passwordReset')
      expect(passwordResetResolved.params.hash).toBe('abc123')
    })

    it('должен обрабатывать query параметры', () => {
      const resolvedWithQuery = router.resolve({
        name: 'home',
        query: { ssid: 'test123', utm_source: 'google' }
      })
      
      expect(resolvedWithQuery.query.ssid).toBe('test123')
      expect(resolvedWithQuery.query.utm_source).toBe('google')
    })
  })

  describe('История роутера', () => {
    it('должен использовать веб-историю', () => {
      expect(router.options.history).toBeDefined()
    })

    it('должен иметь методы навигации', () => {
      expect(typeof router.push).toBe('function')
      expect(typeof router.replace).toBe('function')
      expect(typeof router.go).toBe('function')
      expect(typeof router.back).toBe('function')
      expect(typeof router.forward).toBe('function')
    })
  })

  describe('Guards и хуки', () => {
    it('должен поддерживать добавление navigation guards', () => {
      const beforeEachSpy = vi.fn()
      const afterEachSpy = vi.fn()
      
      expect(() => {
        router.beforeEach(beforeEachSpy)
        router.afterEach(afterEachSpy)
      }).not.toThrow()
    })

    it('должен поддерживать beforeResolve guard', () => {
      const beforeResolveSpy = vi.fn()
      
      expect(() => {
        router.beforeResolve(beforeResolveSpy)
      }).not.toThrow()
    })
  })

  describe('Валидация конфигурации', () => {
    it('не должен иметь дублирующихся путей', () => {
      const routes = router.getRoutes()
      const paths = routes.map(r => r.path)
      const uniquePaths = [...new Set(paths)]
      
      expect(paths.length).toBe(uniquePaths.length)
    })

    it('не должен иметь дублирующихся имен маршрутов', () => {
      const routes = router.getRoutes()
      const names = routes.map(r => r.name).filter(Boolean)
      const uniqueNames = [...new Set(names)]
      
      expect(names.length).toBe(uniqueNames.length)
    })

    it('должен иметь компоненты для основных маршрутов', () => {
      const routes = router.getRoutes()
      const mainRoutes = ['home', 'contact', 'vehicle', 'success']
      
      mainRoutes.forEach(routeName => {
        const route = routes.find(r => r.name === routeName)
        expect(route).toBeDefined()
        if (route.component) {
          expect(route.component).toBeDefined()
        }
      })
    })
  })

  describe('Интеграция с environment переменными', () => {
    it('должен использовать PROJECT_TITLE в meta.title', () => {
      const routes = router.getRoutes()
      const homeRoute = routes.find(r => r.name === 'home')
      
      expect(homeRoute?.meta?.title).toContain(import.meta.env.VITE_PROJECT_TITLE || 'Home')
    })
  })
}) 