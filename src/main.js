import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Paginator from "primevue/paginator";
import vuetify from "./plugins/vuetify"; // Import Vuetify

/* PrimeVue styles removed */

import "@/assets/primeicons/primeicons.css";

import "./style.css";
import App from "./App.vue";
import router from "@/core/router/index.js";
import toastPlugin from "@/shared/plugins/toastPlugin";
import { setUnauthorizedHandler } from "@/core/api/httpClient";
import { provideAuthService } from "@/modules/auth/application/containers/authContainer";
import { useToast } from "@/shared/composables/useToast";
import { useAuthStore } from "@/core/store/auth";
import vHasPermission from "@/shared/directives/v-has-permission";
(async () => {
  const authService = provideAuthService();

  // Wire the 401 handler so FetchHttpClient delegates to AuthService
  setUnauthorizedHandler(async () => {
    try {
      const { show } = useToast();
      show("Su sesión ha expirado", "error", 5000);
    } catch (_) {}
    authService._clearSession();
    // also clear the reactive user in Pinia store
    try {
      const authStore = useAuthStore();
      authStore.clearUser();
    } catch (_) {}
    router.replace({ name: "Login" });
  });

  const isValid = await authService.validateToken();

  const app = createApp(App);

  app.use(createPinia());
  // Register global directive for permission checks
  app.directive("has-permission", vHasPermission);
  app.use(PrimeVue);
  app.component("PButton", Button);
  app.component("Paginator", Paginator);

  app.use(router);
  app.use(toastPlugin);
  app.use(vuetify); // Use Vuetify
  app.mount("#app");

  if (!isValid && router.currentRoute.value.meta?.requiresAuth) {
    router.replace({ name: "Login", query: { redirect: router.currentRoute.value.fullPath } });
  }
})();
