<template>
  <Modal :show="show" size="max-w-5xl" icon-class="h-6 w-6 text-indigo-600" @close="onClose">
    <template #icon>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </template>
    <template #header>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-800">Gestionar direcciones</h3>
        <span
          v-if="editing"
          class="inline-flex items-center px-2 py-1 rounded-2xl text-xs font-medium bg-yellow-100 text-yellow-800"
          >Editando...</span
        >
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <input
            v-model="globalFilter"
            placeholder="Buscar..."
            aria-label="Buscar direcciones"
            class="form-input md:w-1/3"
          />
        </div>

        <UiVuetifyDataTable
          class="addresses-table"
          :value="localAddresses"
          data-key="id"
          :filters="filters"
          :global-filter-fields="['alias', 'street', 'number', 'postal_code', 'mobile_phone']"
          :columns="columns"
        >
          <template #body-alias="{ data }">
            <div class="px-3 py-2 text-sm">{{ data.alias || data.street }}</div>
          </template>

          <template #body-street="{ data }">
            <div class="px-3 py-2 text-sm">{{ data.street }}</div>
          </template>

          <template #body-number="{ data }">
            <div class="px-3 py-2 text-sm">{{ data.number }}</div>
          </template>

          <template #body-postal_code="{ data }">
            <div class="px-3 py-2 text-sm">{{ data.postal_code }}</div>
          </template>

          <template #body-mobile_phone="{ data }">
            <div class="px-3 py-2 text-sm">{{ data.mobile_phone }}</div>
          </template>

          <template #body-is_primary="{ data }">
            <div class="px-3 py-2 text-sm">
              <span v-if="data.is_primary" class="badge badge--primary">Principal</span>
            </div>
          </template>

          <template #body-actions="{ data }">
            <div class="px-3 py-2 text-right">
              <div class="flex items-center justify-end gap-2">
                <button aria-label="Editar" class="icon-action group" @click="startEdit(data)">
                  <i
                    class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"
                  ></i>
                  <span
                    class="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                    >Editar</span
                  >
                </button>
                <button
                  aria-label="Eliminar"
                  class="icon-action icon-action--danger group"
                  @click="confirmDelete(data)"
                >
                  <i class="pi pi-trash h-4 w-4 transition-colors duration-150"></i>
                  <span
                    class="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                    >Eliminar</span
                  >
                </button>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="px-3 py-2 text-slate-500">No hay direcciones.</div>
          </template>
        </UiVuetifyDataTable>

        <div class="mt-3">
          <button class="btn btn-primary" @click="startNew">Agregar dirección</button>
        </div>
      </div>

      <div class="md:col-span-2">
        <div v-if="editing" class="w-full">
          <div class="form-row">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="pi pi-pencil h-5 w-5 text-indigo-600"></i>
                <h4 class="font-medium text-slate-800">
                  {{ isNew ? "Nueva dirección" : "Editando dirección" }}
                </h4>
              </div>
            </div>
            <form class="space-y-3" @submit.prevent="saveEdit">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Alias</label>
                <input v-model="form.alias" placeholder="Alias" class="form-input" />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Calle</label>
                <input v-model="form.street" placeholder="Calle" class="form-input" />
              </div>

              <div class="flex gap-2">
                <div class="w-1/3">
                  <label class="block text-sm font-medium text-slate-600 mb-1">Número</label>
                  <input v-model="form.number" placeholder="Número" class="form-input" />
                </div>
                <div class="w-1/3">
                  <label class="block text-sm font-medium text-slate-600 mb-1">CP</label>
                  <input v-model="form.postal_code" placeholder="CP" class="form-input" />
                </div>
                <div class="w-1/3">
                  <label class="block text-sm font-medium text-slate-600 mb-1">Móvil</label>
                  <input v-model="form.mobile_phone" placeholder="Móvil" class="form-input" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  :aria-pressed="form.is_primary"
                  :class="['toggle', form.is_primary ? 'toggle--on' : '']"
                  @click="form.is_primary = !form.is_primary"
                >
                  <span class="sr-only">Dirección principal</span>
                  <span class="toggle-thumb"></span>
                </button>
                <label class="text-sm text-slate-600 select-none">Dirección principal</label>
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" class="btn btn-ghost" @click="cancelEdit">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="pt-4 flex items-center justify-end gap-3 mt-4">
        <button class="btn btn-ghost" @click="onClose">Cerrar</button>
        <button class="btn btn-primary" @click="saveAll">Guardar cambios</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from "vue";
import Modal from "@/shared/components/Modal.vue";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
const props = defineProps({
  show: { type: Boolean, default: false },
  addresses: { type: Array, default: () => [] },
});
const emit = defineEmits(["close", "save"]);

const localAddresses = ref([]);
const editing = ref(false);
const isNew = ref(false);
const form = ref({});

// Búsqueda/filtrado global para DataTable
const globalFilter = ref("");
const filters = ref({ global: { value: null, matchMode: "contains" } });

watch(globalFilter, (val) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns = [
  { key: "alias", field: "alias", label: "Alias", sortable: true },
  { key: "street", field: "street", label: "Calle", sortable: true },
  { key: "number", field: "number", label: "Número", sortable: true },
  { key: "postal_code", field: "postal_code", label: "CP", sortable: true },
  { key: "mobile_phone", field: "mobile_phone", label: "Móvil", sortable: true },
  { key: "is_primary", field: "is_primary", label: "", sortable: true },
  { key: "actions", label: "", sortable: false },
];

watch(
  () => props.addresses,
  (v) => {
    localAddresses.value = (v || []).map((a) => ({ ...a }));
  },
  { immediate: true }
);

function startNew() {
  editing.value = true;
  isNew.value = true;
  form.value = {
    id: Date.now(),
    alias: "",
    street: "",
    number: "",
    postal_code: "",
    mobile_phone: "",
    landline_phone: "",
    contact_email: "",
    is_primary: false,
  };
}

function startEdit(addr) {
  editing.value = true;
  isNew.value = false;
  form.value = { ...addr };
}

function cancelEdit() {
  editing.value = false;
  isNew.value = false;
  form.value = {};
}

function saveEdit() {
  // ensure single principal
  if (form.value.is_primary) {
    localAddresses.value = localAddresses.value.map((a) => ({ ...a, is_primary: false }));
  }
  const idx = localAddresses.value.findIndex((a) => a.id === form.value.id);
  if (idx === -1) localAddresses.value.unshift({ ...form.value });
  else localAddresses.value.splice(idx, 1, { ...form.value });
  editing.value = false;
  isNew.value = false;
  form.value = {};
}

function confirmDelete(addr) {
  if (!confirm("Eliminar dirección?")) return;
  localAddresses.value = localAddresses.value.filter((a) => a.id !== addr.id);
}

function saveAll() {
  emit("save", localAddresses.value);
  emit("close");
}

function onClose() {
  emit("close");
}
</script>
