import { reactive, readonly, type DeepReadonly } from "vue";

interface ToastItem {
  id: number;
  message: string;
  type: string;
}

interface ToastState {
  toasts: ToastItem[];
}

const state = reactive<ToastState>({ toasts: [] });
let id = 1;

export interface UseToastReturn {
  toasts: DeepReadonly<ToastItem[]>;
  show: (message: string, type?: string, timeout?: number) => number;
  dismiss: (toastId: number) => void;
}

export function useToast(): UseToastReturn {
  function show(message: string, type = "success", timeout = 3000): number {
    const toast: ToastItem = { id: id++, message, type };
    state.toasts.push(toast);
    if (timeout > 0) setTimeout(() => dismiss(toast.id), timeout);
    return toast.id;
  }

  function dismiss(toastId: number): void {
    const i = state.toasts.findIndex((t) => t.id === toastId);
    if (i !== -1) state.toasts.splice(i, 1);
  }

  return { toasts: readonly(state.toasts), show, dismiss };
}

export default useToast;
