import { defineStore } from 'pinia'
import { useFetcher } from '@/compose/axios'
import { ref } from 'vue'
import type { Centrifuge as CentrifugeType, PublicationContext, Subscription } from 'centrifuge'

const STORE_NAME = 'centrifugo'
const LOCALSTORAGE_KEY = 'centrifugo'

interface DecodedToken {
  exp: number
  [key: string]: unknown
}

interface CentrifugoChannel {
  name: string
  event?: string
  action?: (data: unknown) => void
}

interface CentrifugoStoreActions {
  refreshToken(): Promise<void>
  getToken(): Promise<void>
  connect(channels: CentrifugoChannel[]): Promise<void>
  send(channel: string, data: unknown): Promise<void>
}

export const useCentrifugoStore = defineStore(STORE_NAME, () => {
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
  const connection = ref<CentrifugeType | null>(null)
  const token = ref<string | null>(null)
  const isConnected = ref<boolean>(false)

  const persistToken = (value: string): void => {
    sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(value))
  }

  const loadStoredToken = (): string | null => {
    const stored = sessionStorage.getItem(LOCALSTORAGE_KEY)
    if (!stored) {
      return null
    }

    try {
      return JSON.parse(stored) as string
    } catch (error) {
      console.error('Failed to parse stored Centrifugo token', error)
      return null
    }
  }

  const refreshToken: CentrifugoStoreActions['refreshToken'] = async () => {
    const response = await axiosInstance.post('/centrifuge/refresh-token')
    const newToken = response?.data?.data?.token
    if (typeof newToken === 'string') {
      persistToken(newToken)
    } else {
      console.error('Unexpected token response format', response?.data)
    }
  }

  const getToken: CentrifugoStoreActions['getToken'] = async () => {
    let jwtToken = loadStoredToken()

    if (!jwtToken) {
      await refreshToken()
      jwtToken = loadStoredToken()
    }

    if (!jwtToken) {
      throw new Error('Unable to retrieve Centrifugo token from storage')
    }

    // Dynamic import of jwt-decode
    const { jwtDecode } = await import('jwt-decode')
    const decoded = jwtDecode<DecodedToken>(jwtToken)

    if (decoded.exp < (Date.now() + 1000) / 1000) {
      await refreshToken()
      jwtToken = loadStoredToken()
      if (!jwtToken) {
        throw new Error('Unable to refresh Centrifugo token')
      }
    }

    token.value = jwtToken
  }

  const connect: CentrifugoStoreActions['connect'] = async (channels) => {
    try {
      await getToken()

      if (!token.value) {
        throw new Error('Token is not available for Centrifugo connection')
      }

      const centrifugoUrl = import.meta.env.VITE_CENTRIFUGO_BASE_URL
      if (!centrifugoUrl) {
        throw new Error('Centrifugo base URL is not defined. Check environment variables.')
      }

      // Dynamic import of Centrifuge
      const { Centrifuge: CentrifugeClass } = await import('centrifuge')
      connection.value = new CentrifugeClass(centrifugoUrl, {
        token: token.value
      }) as CentrifugeType

      if (!Array.isArray(channels) || channels.length === 0) {
        console.warn('No channels provided for Centrifugo connection.')
        return
      }

      channels.forEach((channel) => {
        if (!channel?.name) {
          console.warn(`Invalid channel configuration: ${JSON.stringify(channel)}`)
          return
        }

        const subscription: Subscription = connection.value!.newSubscription(channel.name)

        subscription.on('publication', (ctx: PublicationContext) => {
          if (
            ctx.channel === channel.name &&
            (!channel.event || ctx.data?.event === channel.event)
          ) {
            channel.action?.(ctx.data)
          }
        })

        subscription.subscribe()
      })

      if (connection.value) {
        connection.value.on('connected', () => {
          isConnected.value = true
        })

        connection.value.connect()
      }
    } catch (error) {
      console.error('Error during Centrifugo connection:', error)
    }
  }

  const send: CentrifugoStoreActions['send'] = async (channel, data) => {
    if (!connection.value) {
      console.warn('Attempted to publish without an active Centrifugo connection')
      return
    }

    await connection.value.publish(channel, data)
  }

  return {
    refreshToken,
    getToken,
    connect,
    send
  }
})

export type CentrifugoStore = ReturnType<typeof useCentrifugoStore>
