import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStayWithUsModalStore = defineStore('stayWithUsModal', () => {
  const isOpen = ref(false)

  function show() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    show,
    close
  }
})
