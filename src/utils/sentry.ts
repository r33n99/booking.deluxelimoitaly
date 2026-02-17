import * as Sentry from '@sentry/vue'
import { useUserStore } from '@/stores/user'

type CaptureTags = Record<string, string>
type CaptureExtra = Record<string, unknown>

interface CaptureContext {
  tags?: CaptureTags
  extra?: CaptureExtra
}

export function captureError(error: unknown, context: CaptureContext = {}): void {
  const userStore = useUserStore()
  const { user } = userStore

  Sentry.withScope((scope) => {
    if (user) {
      scope.setUser({
        id: user.id != null ? String(user.id) : undefined,
        email: user.email ?? undefined
      })
    }

    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    Sentry.captureException(error)
  })
}
