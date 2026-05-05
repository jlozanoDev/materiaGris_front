import { reactive, readonly } from 'vue'

const state = reactive({ toasts: [] })
let id = 1

export function useToast() {
  function show(message, type = 'success', timeout = 3000) {
    const toast = { id: id++, message, type }
    state.toasts.push(toast)
    if (timeout > 0) setTimeout(() => dismiss(toast.id), timeout)
    return toast.id
  }

  function dismiss(toastId) {
    const i = state.toasts.findIndex(t => t.id === toastId)
    if (i !== -1) state.toasts.splice(i, 1)
  }

  return { toasts: readonly(state.toasts), show, dismiss }
}

export default useToast
