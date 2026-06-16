<script setup lang="ts">
import { ref, watch } from "vue";
import CustomSelect from "@/shared/components/CustomSelect.vue";

interface PatientFormData {
  id?: number | string;
  medical_record_number: string;
  national_id: string;
  first_name: string;
  last_name: string;
  second_last_name: string;
  gender: string;
  date_of_birth: string;
  last_visit_at: string;
  city: string;
  is_active: boolean;
  insurance_id: string;
  email: string;
  phone: string;
  mobile: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  neighborhood: string;
  postal_code: string;
  state: string;
  country: string;
}

const props = defineProps<{
  patient: PatientFormData;
  saving: boolean;
}>();

const emit = defineEmits<{
  save: [payload: Record<string, unknown>];
  cancel: [];
}>();

const contactOpen = ref(false);
const addressOpen = ref(false);

const localForm = ref<PatientFormData>({ ...props.patient });

watch(
  () => props.patient,
  (newVal) => {
    if (newVal) {
      localForm.value = { ...newVal };
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <!-- Header: title + active toggle -->
    <div class="flex items-center justify-between mb-4 w-full">
      <h3 class="text-lg font-semibold text-slate-800">Editar paciente</h3>
      <div class="flex items-center gap-3 ml-auto">
        <button
          type="button"
          :aria-pressed="localForm.is_active"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          :class="localForm.is_active ? 'bg-indigo-600' : 'bg-slate-200'"
          @click="localForm.is_active = !localForm.is_active"
        >
          <span class="sr-only">Activo</span>
          <span
            class="transform rounded-full bg-white h-5 w-5 shadow transition-transform"
            :class="localForm.is_active ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
        <label class="text-sm text-slate-600 select-none">Activo</label>
      </div>
    </div>

    <!-- Form body -->
    <div class="space-y-4">
      <form
        id="patient-form"
        class="space-y-4"
        @submit.prevent="emit('save', { ...localForm })"
      >
        <!-- Identificación -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 class="text-sm font-semibold text-slate-700 mb-3">
            Identificación
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >NHC</label
              >
              <input
                v-model="localForm.medical_record_number"
                placeholder="NHC"
                class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >DNI</label
              >
              <input
                v-model="localForm.national_id"
                placeholder="DNI"
                class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Aseguradora (ID)</label
              >
              <input
                v-model="localForm.insurance_id"
                type="number"
                placeholder="ID"
                class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
          </div>
        </div>

        <!-- Personal -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 class="text-sm font-semibold text-slate-700 mb-3">Personal</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Nombre</label
              >
              <input
                v-model="localForm.first_name"
                required
                placeholder="Nombre"
                class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Primer apellido</label
              >
              <input
                v-model="localForm.last_name"
                required
                placeholder="Primer apellido"
                class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Segundo apellido</label
              >
              <input
                v-model="localForm.second_last_name"
                placeholder="Segundo apellido"
                class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Género</label
              >
              <CustomSelect
                v-model="localForm.gender"
                :options="[
                  { value: '', label: 'Todos' },
                  { value: 'M', label: 'M' },
                  { value: 'F', label: 'F' },
                  { value: 'other', label: 'Otro' },
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Fecha de nacimiento</label
              >
              <input
                v-model="localForm.date_of_birth"
                type="date"
                class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1"
                >Última visita</label
              >
              <input
                v-model="localForm.last_visit_at"
                type="date"
                class="w-full rounded-xl bg-slate-50 pl-3 pr-3 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
          </div>
        </div>

        <!-- Contacto (collapsible) -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-slate-700">Contacto</h4>
            <button
              type="button"
              :aria-expanded="contactOpen"
              class="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              @click="contactOpen = !contactOpen"
            >
              <i
                :class="[
                  'pi',
                  contactOpen ? 'pi-chevron-down' : 'pi-chevron-right',
                  'text-slate-600',
                ]"
              ></i>
            </button>
          </div>
          <transition name="fade">
            <div
              v-show="contactOpen"
              class="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Email</label
                >
                <input
                  v-model="localForm.email"
                  type="email"
                  placeholder="email@ejemplo.test"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Teléfono</label
                >
                <input
                  v-model="localForm.phone"
                  placeholder="Teléfono"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Móvil</label
                >
                <input
                  v-model="localForm.mobile"
                  placeholder="Móvil"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Contacto de emergencia</label
                >
                <input
                  v-model="localForm.contact_name"
                  placeholder="Nombre contacto"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Teléfono contacto</label
                >
                <input
                  v-model="localForm.contact_phone"
                  placeholder="Teléfono contacto"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
            </div>
          </transition>
        </div>

        <!-- Dirección (collapsible) -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-slate-700">Dirección</h4>
            <button
              type="button"
              :aria-expanded="addressOpen"
              class="flex items-center gap-2 text-slate-600 hover:text-slate-800"
              @click="addressOpen = !addressOpen"
            >
              <i
                :class="[
                  'pi',
                  addressOpen ? 'pi-chevron-down' : 'pi-chevron-right',
                  'text-slate-600',
                ]"
              ></i>
            </button>
          </div>
          <transition name="fade">
            <div
              v-show="addressOpen"
              class="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Dirección (línea 1)</label
                >
                <input
                  v-model="localForm.address_line1"
                  placeholder="Calle, número"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Dirección (línea 2)</label
                >
                <input
                  v-model="localForm.address_line2"
                  placeholder="Piso, puerta, etc."
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Ciudad</label
                >
                <input
                  v-model="localForm.city"
                  placeholder="Ciudad"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Provincia/Estado</label
                >
                <input
                  v-model="localForm.state"
                  placeholder="Provincia/Estado"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Código postal</label
                >
                <input
                  v-model="localForm.postal_code"
                  placeholder="Código postal"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >Barrio</label
                >
                <input
                  v-model="localForm.neighborhood"
                  placeholder="Barrio"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1"
                  >País</label
                >
                <input
                  v-model="localForm.country"
                  placeholder="País"
                  class="w-full rounded-xl bg-slate-50 pl-4 pr-4 py-2 text-sm text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
            </div>
          </transition>
        </div>
      </form>
    </div>

    <!-- Footer buttons -->
    <div class="flex justify-end gap-3 mt-4">
      <button
        type="button"
        class="px-4 py-2 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-100"
        @click="emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="patient-form"
        :disabled="saving"
        class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
      >
        Guardar
      </button>
    </div>
  </div>
</template>
