import { computed } from 'vue'

// by convention, composable function names start with "use"
export function useMobile() {
  const isMobile = computed(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  })

  // expose managed state as return value
  return { isMobile }
}
