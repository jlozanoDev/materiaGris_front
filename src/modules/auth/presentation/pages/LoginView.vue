<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { provideAuthService } from "@/modules/auth/application/containers/authContainer";
import { parseApiError } from "@/shared/utils/parseApiError";
import ToggleSwitch from "@/shared/components/ToggleSwitch.vue";
import AuthLayout from "@/modules/auth/presentation/components/AuthLayout.vue";

const router = useRouter();
const route = useRoute();
const authService = provideAuthService();
const email = ref<string>("");
const password = ref<string>("");
const remember = ref<boolean>(false);
const error = ref<string>("");
const loading = ref<boolean>(false);
const showPassword = ref<boolean>(false);

const isValid = computed<boolean>(() => {
  return email.value.trim() !== "" && password.value.length >= 6;
});

function clientValidate(): boolean {
  if (email.value.trim() === "") {
    error.value = "El email es obligatorio.";
    return false;
  }
  if (password.value.length < 6) {
    error.value = "La contraseña debe tener al menos 6 caracteres.";
    return false;
  }
  error.value = "";
  return true;
}

async function submit(): Promise<void> {
  if (!clientValidate()) return;
  loading.value = true;
  try {
    await authService.login({ email: email.value, password: password.value });
    const redirect = route.query.redirect as string | undefined;
    router.push(redirect || "/");
  } catch (e) {
    error.value = parseApiError(e);
    if (e && (e as { status?: number }).status === 401) error.value = "Credenciales inválidas o sesión expirada.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Iniciar sesión" subtitle="Ingresa tus credenciales para acceder a la plataforma.">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm transition-shadow"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm transition-shadow"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 3a7 7 0 00-6.32 9.39l9.71-9.71A6.98 6.98 0 0010 3z" />
              <path
                d="M3 3l14 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-3 text-gray-600">
          <ToggleSwitch v-model="remember" />
          <span class="select-none">Recordarme</span>
        </div>
        <router-link to="/forgot-password" style="color: #7c3aed;" class="hover:underline"
          >&iquest;Olvidaste la contrase&ntilde;a?</router-link
        >
      </div>

      <div>
        <button
          :disabled="!isValid || loading"
          type="submit"
          class="w-full h-12 flex items-center justify-center gap-2 font-semibold text-white rounded-xl transition disabled:opacity-60"
          style="background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
        >
          <svg
            v-if="loading"
            class="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ loading ? "Entrando..." : "Entrar" }}</span>
        </button>
      </div>

      <div v-if="error" class="text-sm text-red-600 text-center">{{ error }}</div>
    </form>

    <div class="mt-6 text-center border-t border-gray-100 pt-6">
      <router-link to="/welcome" class="text-sm font-medium hover:underline" style="color: #9690a8;">
        &larr; Volver a MaterIA Gris
      </router-link>
    </div>
  </AuthLayout>
</template>
