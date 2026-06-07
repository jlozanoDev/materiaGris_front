<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { provideResetPasswordUseCase } from "@/modules/auth/application/containers/resetContainer";
import { parseApiError } from "@/shared/utils/parseApiError";
import { Eye, EyeOff } from "lucide-vue-next";
import AuthLayout from "@/modules/auth/presentation/components/AuthLayout.vue";

const router = useRouter();
const route = useRoute();

const token = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const passwordConfirmation = ref<string>("");
const showPassword = ref<boolean>(false);
const showConfirmation = ref<boolean>(false);
const error = ref<string>("");
const loading = ref<boolean>(false);
const success = ref<boolean>(false);

onMounted(() => {
  token.value = (route.query.token as string) || "";
  email.value = (route.query.email as string) || "";

  if (!token.value || !email.value) {
    error.value = "El enlace de recuperaci&oacute;n no es v&aacute;lido. Solicita uno nuevo.";
  }
});

const isValid = computed<boolean>(
  () => password.value.length >= 8 && password.value === passwordConfirmation.value
);

function clientValidate(): boolean {
  if (password.value.length < 8) {
    error.value = "La contrase&ntilde;a debe tener al menos 8 caracteres.";
    return false;
  }
  if (password.value !== passwordConfirmation.value) {
    error.value = "Las contrase&ntilde;as no coinciden.";
    return false;
  }
  error.value = "";
  return true;
}

async function submit(): Promise<void> {
  if (!clientValidate()) return;

  loading.value = true;
  try {
    const useCase = provideResetPasswordUseCase();
    await useCase.execute(email.value, token.value, password.value, passwordConfirmation.value);
    success.value = true;
  } catch (err) {
    error.value = parseApiError(err);
    if (err && (err as { status?: number }).status === 401) error.value = "El enlace ha expirado o no es v&aacute;lido.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Restablecer contraseña" subtitle="Ingresá tu nueva contraseña.">
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
      <p class="text-gray-700 text-sm">Tu contrase&ntilde;a ha sido restablecida correctamente.</p>
      <button
        class="w-full h-12 font-semibold text-white rounded-xl transition"
        style="background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
        @click="router.push('/login')"
      >
        Iniciar sesi&oacute;n
      </button>
      <div class="mt-4">
        <router-link to="/welcome" class="text-sm font-medium hover:underline" style="color: #9690a8;">
          &larr; Volver a MaterIA Gris
        </router-link>
      </div>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nueva contrase&ntilde;a</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm transition-shadow"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="!showPassword" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-1">M&iacute;nimo 8 caracteres.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar contrase&ntilde;a</label>
        <div class="relative">
          <input
            v-model="passwordConfirmation"
            :type="showConfirmation ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm transition-shadow"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showConfirmation = !showConfirmation"
          >
            <EyeOff v-if="!showConfirmation" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading || !isValid || (!!error && !password)"
        class="w-full h-12 font-semibold text-white rounded-xl transition disabled:opacity-60"
        style="background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
      >
        <span v-if="loading">Restableciendo&hellip;</span>
        <span v-else>Restablecer contrase&ntilde;a</span>
      </button>

      <div class="text-center">
        <router-link to="/forgot-password" class="text-sm font-medium hover:underline" style="color: #7c3aed;">
          Solicitar nuevo enlace
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
