<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { provideForgotUseCase } from "@/modules/auth/application/containers/forgotContainer";
import { parseApiError } from "@/shared/utils/parseApiError";

const router = useRouter();
const email = ref<string>("");
const error = ref<string>("");
const loading = ref<boolean>(false);
const success = ref<boolean>(false);

async function submit(): Promise<void> {
  error.value = "";

  if (email.value.trim() === "") {
    error.value = "El email es obligatorio.";
    return;
  }

  loading.value = true;
  try {
    const useCase = provideForgotUseCase();
    const result = await useCase.execute(email.value);

    const status: number = result?.status ?? 200;
    const data: Record<string, unknown> = result?.data ?? {};

    if (status === 429) {
      error.value = "Demasiados intentos. Espera un momento antes de volver a intentarlo.";
      return;
    }

    if (status < 200 || status >= 300) {
      error.value = (data.message as string) || "Ha ocurrido un error. Inténtalo de nuevo.";
      return;
    }

    success.value = true;
  } catch (e) {
    error.value = parseApiError(e);
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
        <h1 class="text-xl font-semibold text-gray-800">¿Olvidaste tu contraseña?</h1>
        <p class="text-sm text-gray-500 mt-1">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>
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
        <p class="text-gray-700 text-sm">
          Si el email <strong>{{ email }}</strong> está registrado, recibirás en breve un enlace
          para restablecer tu contraseña.
        </p>
        <p class="text-gray-500 text-xs">Revisa también la carpeta de spam.</p>
        <button
          class="mt-4 text-indigo-600 hover:underline text-sm font-medium"
          @click="router.push('/login')"
        >
          Volver al inicio de sesión
        </button>
      </div>

      <!-- Form state -->
      <form v-else class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition text-sm"
        >
          <span v-if="loading">Enviando…</span>
          <span v-else>Enviar enlace de recuperación</span>
        </button>

        <div class="text-center">
          <router-link to="/login" class="text-indigo-600 hover:underline text-sm">
            Volver al inicio de sesión
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
