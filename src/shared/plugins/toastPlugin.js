import { useToast } from '@/shared/composables/useToast'

export default {
  install: (app) => {
    const toast = useToast()
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}
