<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { provideResetPasswordUseCase } from "@/modules/auth/application/containers/resetContainer";

const router = useRouter();
const route = useRoute();

const token = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const showPassword = ref(false);
const showConfirmation = ref(false);
const error = ref("");
const loading = ref(false);
const success = ref(false);

onMounted(() => {
  token.value = route.query.token || "";
  email.value = route.query.email || "";

  if (!token.value || !email.value) {
    error.value = "El enlace de recuperación no es válido. Solicita uno nuevo.";
  }
});

const isValid = computed(
  () => password.value.length >= 8 && password.value === passwordConfirmation.value
);

function clientValidate() {
  if (password.value.length < 8) {
    error.value = "La contraseña debe tener al menos 8 caracteres.";
    return false;
  }
  if (password.value !== passwordConfirmation.value) {
    error.value = "Las contraseñas no coinciden.";
    return false;
  }
  error.value = "";
  return true;
}

async function submit() {
  if (!clientValidate()) return;

  loading.value = true;
  try {
    const useCase = provideResetPasswordUseCase();
    await useCase.execute(email.value, token.value, password.value, passwordConfirmation.value);
    success.value = true;
  } catch (err) {
    if (err && err.body) {
      const b = err.body;
      if (typeof b === "string") {
        try {
          const parsed = JSON.parse(b);
          error.value = parsed?.message || b;
        } catch (e) {
          error.value = b || "Ha ocurrido un error.";
        }
      } else if (typeof b === "object") {
        if (b.message) {
          error.value = b.message;
        } else if (b.errors) {
          try {
            const msgs = Object.values(b.errors).flat().join(" ");
            error.value = msgs || "Ha ocurrido un error.";
          } catch (e) {
            error.value = "Ha ocurrido un error.";
          }
        } else {
          error.value = JSON.stringify(b);
        }
      } else {
        error.value = "Ha ocurrido un error.";
      }
    } else if (err && err.status === 401) {
      error.value = "El enlace ha expirado o no es válido.";
    } else {
      error.value = "No se pudo conectar con el servidor. Comprueba tu conexión.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    style="background: #513ad7"
  >
    <!-- decorative blurred shapes -->
    <div
      class="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#7A66E1] opacity-18 blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-[#6F5BEA] opacity-12 blur-2xl pointer-events-none"
    ></div>

    <div class="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
      <div class="mb-8 text-center">
        <div class="text-gray-600 text-2xl font-extrabold mb-2">MateIA</div>
        <h1 class="text-xl font-semibold text-gray-800">Restablecer contraseña</h1>
        <p class="text-sm text-gray-500 mt-1">Introduce tu nueva contraseña.</p>
      </div>

      <!-- Success state -->
      <div v-if="success" class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p class="text-gray-700 text-sm">Tu contraseña ha sido restablecida correctamente.</p>
        <button
          class="mt-4 w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition text-sm"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </button>
      </div>

      <!-- Form state -->
      <form v-else class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
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
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.968 9.968 0 012.293-3.95M6.636 6.636A9.969 9.969 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18"
                />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">Mínimo 8 caracteres.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
          <div class="relative">
            <input
              v-model="passwordConfirmation"
              :type="showConfirmation ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showConfirmation = !showConfirmation"
            >
              <svg
                v-if="!showConfirmation"
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
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.968 9.968 0 012.293-3.95M6.636 6.636A9.969 9.969 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading || !isValid || (!!error && !password)"
          class="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition text-sm"
        >
          <span v-if="loading">Restableciendo…</span>
          <span v-else>Restablecer contraseña</span>
        </button>

        <div class="text-center">
          <router-link to="/forgot-password" class="text-indigo-600 hover:underline text-sm">
            Solicitar nuevo enlace
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
