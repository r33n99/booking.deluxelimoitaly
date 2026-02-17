import * as Sentry from '@sentry/vue'
import type { PiniaPluginContext } from 'pinia'

interface ActionErrorContext {
  name: string
  onError: (callback: (error: unknown) => void) => void
}

export function piniaSentryPlugin({ store }: PiniaPluginContext): void {
  store.$onAction(({ name, onError }: ActionErrorContext) => {
    onError((error: unknown) => {
      Sentry.captureException(error, {
        extra: {
          actionName: name,
          storeId: store.$id
          // storeState: toRaw(store.$state)
        }
      })
    })
  })
}
