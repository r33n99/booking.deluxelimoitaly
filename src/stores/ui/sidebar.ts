import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

interface SideBarState {
  isSideBarOpen: Ref<boolean>
}

interface SideBarActions {
  update(data: boolean): void
}

export const useSideBarStore = defineStore('sidebar', (): SideBarState & SideBarActions => {
  const isSideBarOpen = ref<boolean>(false)

  const update: SideBarActions['update'] = (data) => {
    isSideBarOpen.value = data
    if (!data) {
      setTimeout(() => {
        document.body.classList.remove('overflow-y-hidden')
      }, 500)
    } else {
      document.body.classList.add('overflow-y-hidden')
    }
  }

  return {
    update,
    isSideBarOpen
  }
})

export type SideBarStore = ReturnType<typeof useSideBarStore>
