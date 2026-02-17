import { defineStore } from 'pinia'

export const useGoBackStore = defineStore('goBack', {
  state: () => ({
    showGoBack: localStorage.getItem('showGoBack') === 'true'
  }),
  actions: {
    setGoBack(val: boolean) {
      this.showGoBack = val
      localStorage.setItem('showGoBack', JSON.stringify(val))
    }
  }
})
