<template>
  <Modal :show="show" size="xl" icon-class="h-6 w-6 text-[#7c3aed]" @close="onClose">
    <template #icon>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </template>
    <template #header>
      <h3 class="text-lg font-semibold text-[#0b0817] mb-4">
        Gestionar direcciones
      </h3>
    </template>

    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="relative flex-1 md:max-w-xs">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#9690a8] text-sm pointer-events-none" />
        <input
          v-model="globalFilter"
          placeholder="Buscar direcciones..."
          class="form-input pl-9 pr-8"
        />
        <button
          v-if="globalFilter"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-[#9690a8] hover:text-[#6b6b7b] transition-colors"
          @click="globalFilter = ''"
        >
          <i class="pi pi-times text-sm" />
        </button>
      </div>
      <button class="btn btn-primary whitespace-nowrap" @click="startNew">
        + Agregar dirección
      </button>
    </div>

    <UiVuetifyDataTable
      class="addresses-table"
      :value="localAddresses"
      data-key="id"
      :filters="filters"
      :global-filter-fields="['alias', 'street', 'number', 'postal_code', 'mobile_phone']"
      :columns="columns"
      :paginator="true"
      :rows="10"

    >
      <template #body-alias="{ data }">
        <div class="px-3 py-2 text-sm font-medium text-[#0b0817]">
          {{ data.alias || data.street }}
        </div>
      </template>

      <template #body-street="{ data }">
        <div class="px-3 py-2 text-sm text-[#6b6b7b]">{{ data.street }}</div>
      </template>

      <template #body-number="{ data }">
        <div class="px-3 py-2 text-sm text-[#6b6b7b]">{{ data.number }}</div>
      </template>

      <template #body-postal_code="{ data }">
        <div class="px-3 py-2 text-sm text-[#6b6b7b]">{{ data.postal_code }}</div>
      </template>

      <template #body-mobile_phone="{ data }">
        <div class="px-3 py-2 text-sm text-[#6b6b7b]">{{ data.mobile_phone }}</div>
      </template>

      <template #body-is_primary="{ data }">
        <div class="px-3 py-2">
          <span
            v-if="data.is_primary"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#ede9fe] text-[#7c3aed]"
          >
            Principal
          </span>
        </div>
      </template>

      <template #body-actions="{ data }">
        <div class="px-3 py-2 flex items-center justify-end gap-1.5">
          <button
            data-action-btn
            aria-label="Editar dirección"
            class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:shadow-sm transition-all duration-150 relative group"
            @click="startEdit(data)"
          >
            <i class="pi pi-pencil text-xs" />
            <span
              class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b0817] text-white text-[11px] leading-none py-1.5 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-sm"
            >
              Editar
            </span>
          </button>
          <button
            data-action-btn
            aria-label="Eliminar dirección"
            class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-sm transition-all duration-150 relative group"
            @click="confirmDelete(data)"
          >
            <i class="pi pi-trash text-xs" />
            <span
              class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b0817] text-white text-[11px] leading-none py-1.5 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10 shadow-sm"
            >
              Eliminar
            </span>
          </button>
        </div>
      </template>

      <template #empty>
        <div class="px-3 py-4 text-center text-[#9690a8]">
          No hay direcciones registradas.
        </div>
      </template>
    </UiVuetifyDataTable>

    <transition name="modal-fade">
      <div
        v-if="editing"
        class="mt-4 p-4 bg-[#f5f3ff] rounded-lg border border-[rgba(124,58,237,0.12)]"
      >
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-pencil text-[#7c3aed] text-sm" />
          <h4 class="text-sm font-semibold text-[#0b0817]">
            {{ isNew ? "Nueva dirección" : "Editar dirección" }}
          </h4>
        </div>

        <form @submit.prevent="saveEdit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Alias</label>
              <input v-model="form.alias" placeholder="Ej: Casa, Oficina..." class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Calle</label>
              <input v-model="form.street" placeholder="Nombre de la calle" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Número</label>
              <input v-model="form.number" placeholder="Nº" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Código Postal</label>
              <input v-model="form.postal_code" placeholder="CP" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Teléfono Móvil</label>
              <input v-model="form.mobile_phone" placeholder="Móvil" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Teléfono Fijo</label>
              <input v-model="form.landline_phone" placeholder="Fijo (opcional)" class="form-input" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Email de contacto</label>
              <input v-model="form.contact_email" placeholder="Email (opcional)" class="form-input" />
            </div>
          </div>

          <div class="flex items-center gap-3 mt-3">
            <ToggleSwitch v-model="form.is_primary" />
            <label class="text-sm text-[#6b6b7b] select-none">Dirección principal</label>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-2 border-t border-[rgba(124,58,237,0.10)]">
            <button type="button" class="btn btn-ghost" @click="cancelEdit">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar dirección</button>
          </div>
        </form>
      </div>
    </transition>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { animate } from "animejs";
import Modal from "@/shared/components/Modal.vue";
import UiVuetifyDataTable from "@/shared/components/UiVuetifyDataTable.vue";
import ToggleSwitch from "@/shared/components/ToggleSwitch.vue";
import { useToast } from "@/shared/composables/useToast";

interface Address {
  id: number;
  alias: string;
  street: string;
  number: string;
  postal_code: string;
  mobile_phone: string;
  landline_phone?: string;
  contact_email?: string;
  is_primary: boolean;
}

interface Props {
  show?: boolean;
  addresses?: Address[];
}

interface ColumnDef {
  key: string;
  field?: string;
  label: string;
  sortable: boolean;
  align?: string;
}

interface FilterDef {
  global: { value: string | null; matchMode: string };
}

const props = withDefaults(defineProps<Props>(), { show: false, addresses: () => [] });
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", addresses: Address[]): void;
}>();

const localAddresses = ref<Address[]>([]);
const editing = ref<boolean>(false);
const isNew = ref<boolean>(false);
const form = ref<Address>({} as Address);

const { show: showToast } = useToast();

const globalFilter = ref<string>("");
const filters = ref<FilterDef>({ global: { value: null, matchMode: "contains" } });

function attachHover(): void {
  document.querySelectorAll("[data-action-btn]:not([data-hover-ready])").forEach((btn) => {
    btn.setAttribute("data-hover-ready", "");
    btn.addEventListener("mouseenter", () => {
      animate(btn, { scale: [1, 1.2, 1], duration: 500, easing: "outElastic" });
    });
  });
}

watch(() => props.show, (v) => { if (v) setTimeout(attachHover, 300); });

onUnmounted(() => {
  document.querySelectorAll("[data-action-btn]").forEach((btn) => {
    btn.removeAttribute("data-hover-ready");
  });
});

watch(globalFilter, (val: string) => {
  filters.value = { global: { value: val, matchMode: "contains" } };
});

const columns: ColumnDef[] = [
  { key: "alias", field: "alias", label: "Alias", sortable: true },
  { key: "street", field: "street", label: "Calle", sortable: true },
  { key: "number", field: "number", label: "Número", sortable: true },
  { key: "postal_code", field: "postal_code", label: "CP", sortable: true },
  { key: "mobile_phone", field: "mobile_phone", label: "Móvil", sortable: true },
  { key: "is_primary", field: "is_primary", label: "Principal", sortable: true },
  { key: "actions", label: "", sortable: false, align: "end" },
];

watch(
  () => props.addresses,
  (v: Address[] | undefined) => {
    localAddresses.value = (v || []).map((a) => ({ ...a }));
  },
  { immediate: true }
);

function startNew(): void {
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

function startEdit(addr: Record<string, unknown>): void {
  editing.value = true;
  isNew.value = false;
  form.value = { ...addr } as unknown as Address;
}

function cancelEdit(): void {
  editing.value = false;
  isNew.value = false;
  form.value = {} as Address;
}

function saveEdit(): void {
  const requiredFields = ["alias", "street", "number", "postal_code", "mobile_phone", "landline_phone", "contact_email"] as const;
  const hasData = requiredFields.some((f) => (form.value[f] as string)?.trim() !== "");
  if (!hasData) {
    showToast("Completa al menos un campo para guardar la dirección", "error");
    return;
  }
  if (form.value.is_primary) {
    localAddresses.value = localAddresses.value.map((a) => ({ ...a, is_primary: false }));
  }
  const idx = localAddresses.value.findIndex((a) => a.id === form.value.id);
  if (idx === -1) localAddresses.value.unshift({ ...form.value });
  else localAddresses.value.splice(idx, 1, { ...form.value });
  editing.value = false;
  isNew.value = false;
  form.value = {} as Address;
}

function confirmDelete(addr: Record<string, unknown>): void {
  if (!confirm("¿Eliminar esta dirección?")) return;
  localAddresses.value = localAddresses.value.filter((a) => a.id !== (addr.id as number));
}

function onClose(): void {
  if (editing.value && (form.value.alias || form.value.street)) {
    if (!confirm("Hay cambios sin guardar. ¿Cerrar de todas formas?")) return;
  }
  emit("close");
}
</script>

<style scoped>
/* ── Header cell: remove Vuetify's 0 16px padding, set height auto ── */
.addresses-table :deep(.v-data-table__table > thead > tr > th) {
  padding: 0 !important;
  height: auto !important;
  background-color: #f5f3ff !important;
  border: none !important;
}

/* ── Header inner content (slot div) ── */
.addresses-table :deep(.v-data-table__table > thead > tr > th > div) {
  padding: 10px 12px;
  color: #7c3aed !important;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 2px solid rgba(124, 58, 237, 0.12);
  width: 100% !important;
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  box-sizing: border-box;
}

/* ── Sort icons ── */
.addresses-table :deep(.v-data-table__table > thead > tr > th .mdi-swap-vertical) {
  color: #c4b5e3 !important;
}

.addresses-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-up),
.addresses-table :deep(.v-data-table__table > thead > tr > th .mdi-arrow-down) {
  color: #7c3aed !important;
}

/* ── Body rows ── */
.addresses-table :deep(.v-data-table__table > tbody > tr) {
  background-color: #ffffff !important;
  transition: background-color 0.12s ease;
}

.addresses-table :deep(.v-data-table__table > tbody > tr:hover) {
  background-color: #faf9ff !important;
}

.addresses-table :deep(.v-data-table__table > tbody > tr:nth-child(even)) {
  background-color: #fcfbff !important;
}

.addresses-table :deep(.v-data-table__table > tbody > tr:nth-child(even):hover) {
  background-color: #f6f3ff !important;
}

/* ── Body cells ── */
.addresses-table :deep(.v-data-table__table > tbody > tr > td) {
  border-bottom: 1px solid rgba(124, 58, 237, 0.05) !important;
  padding: 10px 12px !important;
}

.addresses-table :deep(.v-data-table__table > tbody > tr:last-child > td) {
  border-bottom: none !important;
}
</style>
