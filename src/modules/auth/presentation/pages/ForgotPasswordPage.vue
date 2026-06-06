<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { provideForgotUseCase } from "@/modules/auth/application/containers/forgotContainer";
import { parseApiError } from "@/shared/utils/parseApiError";
import AuthLayout from "@/modules/auth/presentation/components/AuthLayout.vue";

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
  <AuthLayout title="¿Olvidaste tu contraseña?" subtitle="Ingresá tu email y te enviaremos un enlace para restablecerla.">
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
        Si el email <strong>{{ email }}</strong> est&aacute; registrado, recibir&aacute;s en breve un enlace
        para restablecer tu contrase&ntilde;a.
      </p>
      <p class="text-gray-500 text-xs">Revis&aacute; tambi&eacute;n la carpeta de spam.</p>
      <button
        class="mt-4 font-medium text-sm hover:underline"
        style="color: #7c3aed;"
        @click="router.push('/login')"
      >
        Volver al inicio de sesi&oacute;n
      </button>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="tu@email.com"
          class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm transition-shadow"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-12 font-semibold text-white rounded-xl transition disabled:opacity-60"
        style="background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
      >
        <span v-if="loading">Enviando&hellip;</span>
        <span v-else>Enviar enlace de recuperaci&oacute;n</span>
      </button>

      <div class="text-center">
        <router-link to="/login" class="text-sm font-medium hover:underline" style="color: #7c3aed;">
          Volver al inicio de sesi&oacute;n
        </router-link>
      </div>
    </form>

    <div class="mt-6 text-center border-t border-gray-100 pt-6">
      <router-link to="/welcome" class="text-sm font-medium hover:underline" style="color: #9690a8;">
        &larr; Volver a MaterIA Gris
      </router-link>
    </div>
  </AuthLayout>
</template>
