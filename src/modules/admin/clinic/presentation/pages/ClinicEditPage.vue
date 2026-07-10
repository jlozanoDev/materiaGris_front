<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useClinicStore } from "@/core/store/clinic";
import { useAuthStore } from "@/core/store/auth";
import { useLogout } from "@/shared/composables/useLogout";
import { useClinicForm } from "@/modules/admin/clinic/presentation/composables/useClinicForm";
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------

const clinicStore = useClinicStore();
const { clinic: clinicRef } = storeToRefs(clinicStore);
const authStore = useAuthStore();
const router = useRouter();
const { logout } = useLogout();

const {
  form,
  syncForm,
  saving,
  saveError,
  saveSuccess,
  fieldErrors,
  submit,
  clearFieldError,
} = useClinicForm(clinicRef);

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

const breadcrumb = [
  { text: "Dashboard", icon: "pi pi-objects-column", to: "/" },
  { text: "Clínica", icon: "pi pi-building" },
];

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(async () => {
  await authStore.fetchUser();

  if (!clinicStore.clinic) {
    await clinicStore.fetchClinic();
  }

  syncForm();
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleSave(): Promise<void> {
  const ok = await submit();
  if (ok) {
    setTimeout(() => {
      saveSuccess.value = false;
    }, 4000);
  }
}

function onFieldInput(key: string): void {
  clearFieldError(key);
  if (saveError.value) saveError.value = null;
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col p-5 gap-5 min-h-0">
        <div class="flex flex-col gap-0 shrink-0 relative z-10">
          <Breadcrumb :items="breadcrumb" />
          <TopBar
            :user="authStore.user"
            @logout="logout"
          />
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="card p-6 flex flex-col flex-1 min-h-0">
            <h1 class="text-2xl font-bold mb-4 text-primary">
              <i class="pi pi-building text-primary" style="font-size: 1.1rem" aria-hidden="true"></i>
              Datos de la Clínica
            </h1>

            <!-- Loading state -->
            <div v-if="clinicStore.loading" class="flex flex-col gap-4">
              <div
                v-for="i in 6"
                :key="i"
                class="h-12 bg-slate-200 rounded-md animate-pulse"
              />
            </div>

            <!-- Error loading clinic (non-404) -->
            <div
              v-else-if="clinicStore.error"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
            >
              {{ clinicStore.error }}
            </div>

            <!-- Form -->
            <div v-else>
              <form @submit.prevent="handleSave">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
                  Información institucional
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Nombre — full width -->
                  <div class="md:col-span-2">
                    <label for="field-nombre" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Nombre <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-nombre"
                      v-model="form.nombre"
                      type="text"
                      placeholder="Nombre de la clínica"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['nombre'] }"
                      @input="onFieldInput('nombre')"
                    />
                    <p v-if="fieldErrors['nombre']" class="text-xs text-red-500 mt-1">{{ fieldErrors['nombre'] }}</p>
                  </div>

                  <!-- CUIT | Email -->
                  <div>
                    <label for="field-cuit" class="block text-sm font-medium text-[#6b6b7b] mb-1">CUIT</label>
                    <input
                      id="field-cuit"
                      v-model="form.cuit"
                      type="text"
                      placeholder="30-12345678-9"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['cuit'] }"
                      @input="onFieldInput('cuit')"
                    />
                    <p v-if="fieldErrors['cuit']" class="text-xs text-red-500 mt-1">{{ fieldErrors['cuit'] }}</p>
                  </div>
                  <div>
                    <label for="field-email" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Email <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-email"
                      v-model="form.email"
                      type="email"
                      placeholder="contacto@clinica.com"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['email'] }"
                      @input="onFieldInput('email')"
                    />
                    <p v-if="fieldErrors['email']" class="text-xs text-red-500 mt-1">{{ fieldErrors['email'] }}</p>
                  </div>

                  <!-- Teléfono | Sitio Web -->
                  <div>
                    <label for="field-telefono" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Teléfono <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-telefono"
                      v-model="form.telefono"
                      type="text"
                      placeholder="+54 11 5555-0000"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['telefono'] }"
                      @input="onFieldInput('telefono')"
                    />
                    <p v-if="fieldErrors['telefono']" class="text-xs text-red-500 mt-1">{{ fieldErrors['telefono'] }}</p>
                  </div>
                  <div>
                    <label for="field-web" class="block text-sm font-medium text-[#6b6b7b] mb-1">Sitio Web</label>
                    <input
                      id="field-web"
                      v-model="form.web"
                      type="url"
                      placeholder="https://clinica.com"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['web'] }"
                      @input="onFieldInput('web')"
                    />
                    <p v-if="fieldErrors['web']" class="text-xs text-red-500 mt-1">{{ fieldErrors['web'] }}</p>
                  </div>

                  <!-- Dirección — full width -->
                  <div class="md:col-span-2">
                    <label for="field-direccion" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Dirección <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-direccion"
                      v-model="form.direccion"
                      type="text"
                      placeholder="Av. Siempre Viva 742"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['direccion'] }"
                      @input="onFieldInput('direccion')"
                    />
                    <p v-if="fieldErrors['direccion']" class="text-xs text-red-500 mt-1">{{ fieldErrors['direccion'] }}</p>
                  </div>

                  <!-- Ciudad | Provincia | Código Postal -->
                  <div>
                    <label for="field-ciudad" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Ciudad <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-ciudad"
                      v-model="form.ciudad"
                      type="text"
                      placeholder="Buenos Aires"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['ciudad'] }"
                      @input="onFieldInput('ciudad')"
                    />
                    <p v-if="fieldErrors['ciudad']" class="text-xs text-red-500 mt-1">{{ fieldErrors['ciudad'] }}</p>
                  </div>
                  <div>
                    <label for="field-provincia" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Provincia <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-provincia"
                      v-model="form.provincia"
                      type="text"
                      placeholder="CABA"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['provincia'] }"
                      @input="onFieldInput('provincia')"
                    />
                    <p v-if="fieldErrors['provincia']" class="text-xs text-red-500 mt-1">{{ fieldErrors['provincia'] }}</p>
                  </div>
                  <div>
                    <label for="field-codigo_postal" class="block text-sm font-medium text-[#6b6b7b] mb-1">
                      Cód. Postal <span class="text-red-400">*</span>
                    </label>
                    <input
                      id="field-codigo_postal"
                      v-model="form.codigo_postal"
                      type="text"
                      placeholder="C1425"
                      class="form-input"
                      :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': fieldErrors['codigo_postal'] }"
                      @input="onFieldInput('codigo_postal')"
                    />
                    <p v-if="fieldErrors['codigo_postal']" class="text-xs text-red-500 mt-1">{{ fieldErrors['codigo_postal'] }}</p>
                  </div>
                </div>

                <!-- Save error (API-level) -->
                <div
                  v-if="saveError"
                  class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {{ saveError }}
                </div>

                <!-- Save success -->
                <div
                  v-if="saveSuccess"
                  class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                >
                  Datos guardados correctamente
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-3 pt-5">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="saving"
                  >
                    <i v-if="!saving" class="pi pi-save mr-2" />
                    {{ saving ? 'Guardando...' : 'Guardar' }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-ghost"
                    :disabled="saving"
                    @click="router.push({ name: 'Dashboard' })"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
