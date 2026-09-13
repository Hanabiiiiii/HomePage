
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(true)
  const isBackgroundReady = ref(false)

  function setBackgroundReady(value: boolean) {
    isBackgroundReady.value = value
  }

  function finishLoading() {
    isLoading.value = false
  }

  function startLoading() {
    isLoading.value = true
  }

  return {
    isLoading,
    isBackgroundReady,
    setBackgroundReady,
    finishLoading,
    startLoading,
  }
})