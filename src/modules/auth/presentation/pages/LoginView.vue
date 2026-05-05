<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { provideLoginUseCase } from '@/modules/auth/application/containers/loginContainer'
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue'
import logo from '@/assets/materiagris.svg'
import doctor from '@/assets/doctor.png'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const isValid = computed(() => {
  return email.value.trim() !== '' && password.value.length >= 6
})

function clientValidate() {
  if (email.value.trim() === '') {
    error.value = 'El email es obligatorio.'
    return false
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return false
  }
  error.value = ''
  return true
}

async function submit() {
  if (!clientValidate()) return
  loading.value = true
  try {
    const useCase = provideLoginUseCase()
    const result = await useCase.execute({ email: email.value, password: password.value })
    if (result && result.access_token) localStorage.setItem('access_token', result.access_token)
    router.push('/')
  } catch (e) {
    const err = e
    if (err && err.body) {
      const b = err.body
      if (typeof b === 'string') {
        try {
          const parsed = JSON.parse(b)
          error.value = parsed?.message || b
        } catch (parseErr) {
          error.value = b || 'Ha ocurrido un error.'
        }
      } else if (typeof b === 'object') {
        if (b.message) {
          error.value = b.message
        } else if (b.errors) {
          try {
            const msgs = Object.values(b.errors).flat().join(' ')
            error.value = msgs || 'Ha ocurrido un error.'
          } catch (ee) {
            error.value = 'Ha ocurrido un error.'
          }
        } else {
          error.value = JSON.stringify(b)
        }
      } else {
        error.value = 'Ha ocurrido un error.'
      }
    } else if (err && err.status === 401) {
      error.value = 'Credenciales inválidas o sesión expirada.'
    } else {
      error.value = err?.message || 'Error en el login'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style="background: #23788E;">
    <!-- decorative blurred shapes (tonos azules suaves) -->
    <div class="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#7A66E1] opacity-18 blur-3xl transform rotate-12 pointer-events-none"></div>
    <div class="absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-[#6F5BEA] opacity-12 blur-2xl transform -rotate-6 pointer-events-none"></div>
    <!-- subtle diagonal lines SVG (muy sutiles) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-4" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="lg" x1="0" x2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.005" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lg)" stroke-width="1">
        <path d="M0 50 L800 0" />
        <path d="M0 150 L800 100" />
        <path d="M0 250 L800 200" />
        <path d="M0 350 L800 300" />
        <path d="M0 450 L800 400" />
      </g>
    </svg>

    <img
      :src="doctor"
      alt="Doctor MaterIA Gris"
      class="absolute bottom-0 left-6 w-512 object-contain drop-shadow-xl select-none"
      draggable="false"
    />

    <div class="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center">
      <!-- Left: Illustration / branding -->
      <div class="hidden md:flex flex-col items-start justify-between gap-4 px-8 pt-8 pb-0 bg-white relative overflow-hidden">

        <!-- Logo / Branding (centrado) -->
        <div class="flex-1 flex flex-col items-center justify-center gap-2 px-4">
          <img :src="logo" alt="Materiagris" class="h-72 w-auto object-contain" draggable="false" />
          <div class="text-center max-w-[22rem] -mt-6 mb-7">
            <p class="mt-2 text-lg text-gray-600">Ahorra tiempo con <span class="font-semibold text-[#0f677a]">informes médicos automáticos</span> impulsados por inteligencia artificial.</p>
            <div class="mt-3 inline-flex items-center justify-center">
              <span class="inline-block bg-[#e6f6f9] text-[#0f677a] text-xs font-semibold px-3 py-1 rounded-full">Mejora la productividad clínica</span>
              <span class="inline-block bg-[#e6f6f9] text-[#0f677a] text-xs font-semibold px-3 py-1 rounded-full">Genera informes automáticamente</span>
              <span class="inline-block bg-[#e6f6f9] text-[#0f677a] text-xs font-semibold px-3 py-1 rounded-full">Optimiza tu flujo de trabajo</span>
            </div>
          </div>
        </div>

        <!-- Feature bullets -->

        <!-- Feature bullets -->
      </div>

      <!-- Right: Form -->
      <div class="p-8 md:p-10">
        <div class="mb-6">          
          
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="email" type="email" autocomplete="email" required
              class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" autocomplete="current-password" required
                class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a7 7 0 00-6.32 9.39l9.71-9.71A6.98 6.98 0 0010 3z" />
                  <path d="M3 3l14 14" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-3 text-gray-600">
              <ToggleSwitch v-model="remember" />
              <span class="select-none">Recordarme</span>
            </div>
            <router-link to="/forgot-password" class="text-indigo-600 hover:underline">¿Olvidaste la contraseña?</router-link>
          </div>

          <div>
            <button :disabled="!isValid || loading" type="submit" class="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm disabled:opacity-60">
              <svg v-if="loading" class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
            </button>
          </div>

          <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>
