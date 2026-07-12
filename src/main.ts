import { createApp } from "vue";
import { createPinia } from "pinia";
import vuetify from "./plugins/vuetify";

import "@/assets/primeicons/primeicons.css";

import "./style.css";
import "@/assets/css/print.css";
import 'splitpanes/dist/splitpanes.css'
import App from "./App.vue";
import router from "@/core/router/index";
import toastPlugin from "@/shared/plugins/toastPlugin";
import { setUnauthorizedHandler, setForbiddenHandler, setTokenGetter } from "@/core/api/httpClient";
import { provideAuthService } from "@/modules/auth/application/containers/authContainer";
import { setAuthService, setStorageGateway } from "@/core/services/serviceRegistry";
import { useToast } from "@/shared/composables/useToast";
import { useAuthStore } from "@/core/store/auth";
import { useClinicStore } from "@/core/store/clinic";
import vHasPermission from "@/shared/directives/v-has-permission";

(async () => {
  const authService = provideAuthService();

  setAuthService(authService);
  setStorageGateway(authService.storageGateway);

  setTokenGetter(() => authService.storageGateway.get("access_token"));

  setUnauthorizedHandler(async () => {
    // Only redirect if the current route actually requires auth
    if (!router.currentRoute.value.meta?.requiresAuth) return;
    try {
      const { show } = useToast();
      show("Su sesión ha expirado", "error", 5000);
    } catch { /* noop */ }
    authService.clearSession();
    try {
      const authStore = useAuthStore();
      authStore.clearUser();
    } catch { /* noop */ }
    router.replace({ name: "Login" });
  });

  setForbiddenHandler(() => {
    if (router.currentRoute.value.name !== "Dashboard") {
      router.replace({ name: "Dashboard" });
    }
  });

  const isValid = await authService.validateToken();

  const app = createApp(App);

  app.use(createPinia());
  app.directive("has-permission", vHasPermission);
  app.use(router);
  app.use(toastPlugin);
  app.use(vuetify);
  app.mount("#app");

  if (!isValid && router.currentRoute.value.meta?.requiresAuth) {
    router.replace({ name: "Login", query: { redirect: router.currentRoute.value.fullPath } });
  }

  // Fetch clinic data asynchronously (no await — non-blocking)
  const clinicStore = useClinicStore();
  clinicStore.fetchClinic();
})();
