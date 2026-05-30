import type { App, Plugin } from "vue";
import { useToast } from "@/shared/composables/useToast";

const toastPlugin: Plugin = {
  install: (app: App) => {
    const toast = useToast();
    app.config.globalProperties.$toast = toast;
    app.provide("toast", toast);
  },
};

export default toastPlugin;
