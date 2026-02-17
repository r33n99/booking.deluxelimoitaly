import { defineStore } from 'pinia'
import { useFetcher } from '@/compose/axios'
import { jwtDecode } from 'jwt-decode'
import { ref } from 'vue'

const STORE_NAME = 'centrifugo'
const LOCALSTORAGE_KEY = 'centrifugo'

export const useCentrifugoStore = defineStore(STORE_NAME, () => {
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
  const connection = ref(null)
  const token = ref(null)
  const isConnected = ref(false)

  const refreshToken = async () => {
    await axiosInstance.post('/centrifuge/refresh-token').then(function (response) {
      sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(response.data.data.token))
    })
  }

  const getToken = async () => {
    let data = sessionStorage.getItem(LOCALSTORAGE_KEY)

    if (data === null) {
      await refreshToken()
      data = sessionStorage.getItem(LOCALSTORAGE_KEY)
    }

    let jwtToken = JSON.parse(data)

    const decoded = jwtDecode(jwtToken)

    if (decoded.exp < (new Date().getTime() + 1) / 1000) {
      await refreshToken()
      data = sessionStorage.getItem(LOCALSTORAGE_KEY)
    }

    token.value = jwtToken
  }

  const connect = async (channels) => {
    try {
      const { Centrifuge } = await import('centrifuge')

      await getToken()

      if (!token.value || typeof token.value !== 'string') {
        throw new Error('Invalid token value. Ensure that getToken() returns a valid token.')
      }

      const centrifugoUrl = import.meta.env.VITE_CENTRIFUGO_BASE_URL
      if (!centrifugoUrl) {
        throw new Error('Centrifugo base URL is not defined. Check your environment variables.')
      }

      connection.value = new Centrifuge(centrifugoUrl, {
        token: token.value
      })

      if (!Array.isArray(channels) || channels.length === 0) {
        console.warn('No channels provided for connection.')
        return
      }

      channels.forEach((channel) => {
        if (!channel.name || typeof channel.name !== 'string') {
          console.warn(`Invalid channel configuration: ${JSON.stringify(channel)}`)
          return
        }

        let sub = connection.value.newSubscription(channel.name)

        sub.on('publication', (ctx) => {
          if (ctx.channel === channel.name && ctx.data.event === channel.event) {
            channel.action?.(ctx.data)
          }
        })
        sub.subscribe()
      })

      connection.value.connect()

      connection.value.on('connected', function () {
        isConnected.value = true
      })
    } catch (error) {
      console.error('Error during Centrifugo connection:', error)
    }
  }

  const send = async (channel, data) => {
    connection.value.publish(channel, data)
  }

  return {
    refreshToken,
    getToken,
    connect,
    send
  }
})
