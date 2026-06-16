<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import draggable from 'vuedraggable'
import { BUILDER_KEY, useTemplateBuilder } from '../composables/useTemplateBuilder'
import type { ZoneType } from '../composables/useTemplateBuilder'
import SectionPanel from '../components/SectionPanel.vue'
import FieldPropertiesPanel from '../components/FieldPropertiesPanel.vue'
import HeaderFooterEditor from '../components/HeaderFooterEditor.vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import TopBarLayout from '@/shared/components/TopBarLayout.vue'
import Breadcrumb from '@/shared/components/Breadcrumb.vue'
import { useAuthStore } from '@/core/store/auth'
import { useLogout } from '@/shared/composables/useLogout'
import FieldPalette from '../components/FieldPalette.vue'
import PreviewModal from '../components/PreviewModal.vue'
import PrintPreviewModal from '../components/PrintPreviewModal.vue'
import Modal from '@/shared/components/Modal.vue'
import { createDefaultFieldTypeRegistry } from '@/shared/types/defaultFieldTypeRegistry'
import { useSystemVariableRegistry, SYSTEM_VARIABLES_KEY } from '@/shared/composables/useSystemVariableRegistry'

const fieldRegistry = createDefaultFieldTypeRegistry()

const systemVariables = useSystemVariableRegistry()
provide(SYSTEM_VARIABLES_KEY, systemVariables)

const canSave = computed(() => authStore.hasPermission('admin.reporttemplate.update'))

// ============================================================================
// State
// ============================================================================

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { logout } = useLogout()
const builder = useTemplateBuilder()
provide(BUILDER_KEY, builder)

const isEditMode = computed(() => route.name === 'AdminReportTemplateEdit')
const pageLoading = ref(true)
const showPreview = ref(false)
const showPrintPreview = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const showUnsavedModal = ref(false)

// Store the route-leave next callback so the modal can use it
let pendingLeaveNext: ((v: boolean | void) => void) | null = null

// Save handler with error feedback
async function handleSave() {
  saveError.value = ''
  saveSuccess.value = false
  try {
    await builder.saveTemplate()
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 2500)
  } catch (e: any) {
    saveError.value = e?.message || 'Error al guardar la plantilla'
    setTimeout(() => { saveError.value = '' }, 5000)
  }
}

// Unsaved changes guard
onBeforeRouteLeave((_to, _from, next) => {
  if (builder.isDirty && !builder.isSaving) {
    pendingLeaveNext = next
    showUnsavedModal.value = true
  } else {
    next()
  }
})

function confirmLeave() {
  showUnsavedModal.value = false
  if (pendingLeaveNext) {
    pendingLeaveNext()
    pendingLeaveNext = null
  }
}

function cancelLeave() {
  showUnsavedModal.value = false
  if (pendingLeaveNext) {
    pendingLeaveNext(false)
    pendingLeaveNext = null
  }
}

// Browser tab close guard
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (builder.isDirty) {
    e.preventDefault()
    e.returnValue = ''
  }
}
onMounted(() => { window.addEventListener('beforeunload', handleBeforeUnload) })
onBeforeUnmount(() => { window.removeEventListener('beforeunload', handleBeforeUnload) })

const breadcrumb = computed(() => [
  { text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' },
  { text: 'Tipos de Informe', icon: 'pi pi-file', to: '/admin/report-templates' },
  { text: isEditMode.value ? 'Editar Plantilla' : 'Nueva Plantilla', icon: 'pi pi-pencil' },
])

// Save button visual states
const saveButtonClass = computed(() => {
  if (builder.isSaving) return 'btn-outline opacity-70 cursor-wait'
  if (saveSuccess.value) return 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
  if (!builder.isDirty) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return 'btn-primary'
})
const saveButtonIcon = computed(() => {
  if (builder.isSaving) return 'pi pi-spin pi-spinner'
  if (saveSuccess.value) return 'pi pi-check'
  if (!builder.isDirty) return 'pi pi-check'
  return 'pi pi-save'
})
const saveButtonText = computed(() => {
  if (builder.isSaving) return 'Guardando...'
  if (saveSuccess.value) return 'Guardado'
  if (!builder.isDirty) return 'Guardado'
  return 'Guardar'
})

const zoneTabs: { key: ZoneType; label: string; icon: string }[] = [
  { key: 'header', label: 'Cabecera', icon: 'pi pi-align-left' },
  { key: 'body', label: 'Cuerpo', icon: 'pi pi-align-center' },
  { key: 'footer', label: 'Pie', icon: 'pi pi-align-right' },
]

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  await authStore.fetchUser()
  await systemVariables.ensureLoaded()
  pageLoading.value = false
  if (isEditMode.value && route.params.id) {
    const id = route.params.id as string
    await builder.loadTemplate(Number(id))
  } else {
    builder.activeZone = 'header'
  }
})

</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden flex-col">
      <div class="flex flex-col gap-0 shrink-0 relative z-10 px-5 pt-5">
        <TopBarLayout
          :user="authStore.user"
          @logout="logout"
        />
        <Breadcrumb :items="breadcrumb" />
      </div>

      <div class="flex-1 overflow-hidden p-5">
        <!-- Loading state -->
        <div v-if="pageLoading" class="card p-6 h-full">
          <div class="flex items-center gap-3 mb-6">
            <div class="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
            <div class="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div class="flex gap-4 h-[calc(100%-60px)]">
            <div class="w-56 bg-slate-200 rounded-lg animate-pulse" />
            <div class="flex-1 bg-slate-200 rounded-lg animate-pulse" />
            <div class="w-72 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>

        <!-- Access denied -->
        <div v-else-if="!authStore.hasPermission('admin.reporttemplate.update')" class="flex-1 flex items-center justify-center h-full">
          <div class="text-center p-10 bg-white rounded-xl shadow-sm border border-[rgba(124,58,237,0.10)]">
            <i class="pi pi-lock text-[#9690a8] text-6xl mb-4"></i>
            <h2 class="text-xl font-bold text-[#0b0817]">Acceso Denegado</h2>
            <p class="text-[#9690a8]">No tienes permisos para editar plantillas.</p>
          </div>
        </div>

        <!-- Main builder -->
        <div v-else class="card p-6 flex flex-col h-full overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 shrink-0">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-[#ede9fe] flex items-center justify-center">
                <i class="pi pi-pencil text-[#7c3aed] text-sm" />
              </div>
              <h1 class="text-xl font-bold text-[#0b0817]">
                {{ isEditMode ? 'Editar Plantilla de Informe' : 'Nueva Plantilla de Informe' }}
              </h1>
              <button
                class="btn btn-outline btn-sm"
                :disabled="builder.sections.length === 0"
                title="Vista previa"
                @click="showPreview = true"
              >
                <i class="pi pi-eye mr-1" />
                Vista previa
              </button>
              <button
                class="btn btn-outline btn-sm"
                :disabled="builder.sections.length === 0"
                title="Vista impresión"
                @click="showPrintPreview = true"
              >
                <i class="pi pi-print mr-1" />
                Vista impresión
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="btn btn-ghost btn-sm"
                :disabled="builder.undoStack.length === 0"
                data-undo-btn
                title="Deshacer"
                @click="builder.undo()"
              >
                <i class="pi pi-undo mr-1" />
                Deshacer
              </button>
              <button
                class="btn btn-ghost btn-sm"
                :disabled="builder.redoStack.length === 0"
                data-redo-btn
                title="Rehacer"
                @click="builder.redo()"
              >
                <i class="pi pi-redo mr-1" />
                Rehacer
              </button>
              <button
                v-if="canSave"
                class="btn btn-sm transition-all duration-200"
                :class="saveButtonClass"
                :disabled="builder.isSaving"
                data-save-btn
                @click="handleSave"
              >
                <i :class="saveButtonIcon" class="mr-1" />
                {{ saveButtonText }}
              </button>
            </div>
          </div>

          <!-- Save error message -->
          <div
            v-if="saveError"
            class="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm shrink-0"
          >
            <i class="pi pi-exclamation-triangle" />
            {{ saveError }}
          </div>

          <!-- General info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 shrink-0">
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Nombre de la plantilla</label>
              <input
                v-model="builder.templateName"
                placeholder="Ej: Informe de Evaluación"
                class="form-input"
                :disabled="!canSave"
                aria-label="Nombre de la plantilla"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Descripción (opcional)</label>
              <input
                v-model="builder.templateDescription"
                placeholder="Breve descripción del propósito"
                class="form-input"
                :disabled="!canSave"
                aria-label="Descripción"
              />
            </div>
          </div>

          <hr class="border-[rgba(124,58,237,0.08)] mb-4" />

          <!-- Zone tabs -->
          <div class="flex gap-1 mb-4 shrink-0">
            <button
              v-for="tab in zoneTabs"
              :key="tab.key"
              type="button"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                builder.activeZone === tab.key
                  ? 'bg-[#ede9fe] text-[#7c3aed] shadow-sm'
                  : 'text-[#9690a8] hover:text-[#7c3aed] hover:bg-[#f5f3ff]',
              ]"
              @click="builder.switchZone(tab.key)"
            >
              <i :class="[tab.icon, 'mr-1.5']" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Header/Footer editor (only for header/footer zones) -->
          <HeaderFooterEditor
            v-if="builder.activeZone === 'header'"
            :enabled="builder.headerEnabled"
            :page-display="builder.headerPageDisplay"
            zone="header"
            class="mb-4 shrink-0"
            @update:enabled="builder.headerEnabled = $event"
            @update:page-display="builder.headerPageDisplay = $event as 'all' | 'first' | 'last'"
          />
          <HeaderFooterEditor
            v-if="builder.activeZone === 'footer'"
            :enabled="builder.footerEnabled"
            :page-display="builder.footerPageDisplay"
            zone="footer"
            class="mb-4 shrink-0"
            @update:enabled="builder.footerEnabled = $event"
            @update:page-display="builder.footerPageDisplay = $event as 'all' | 'first' | 'last'"
          />

          <!-- 3-panel layout -->
          <div class="flex flex-1 min-h-0 overflow-hidden gap-4">
            <!-- Left: Palette -->
            <aside class="w-56 border border-[rgba(124,58,237,0.10)] rounded-lg bg-white p-3 overflow-y-auto shrink-0 app-scrollbar">
              <FieldPalette :registry="fieldRegistry.getAll()" />
            </aside>

            <!-- Center: Canvas -->
            <main class="flex-1 overflow-y-auto border border-[rgba(124,58,237,0.10)] rounded-lg bg-white p-4 app-scrollbar">
              <!-- Empty state -->
              <div
                v-if="builder.activeSections.length === 0"
                class="flex flex-col items-center justify-center h-full px-6"
              >
                <div class="relative mb-6">
                  <div class="absolute inset-0 bg-[#ede9fe] rounded-full blur-2xl opacity-60 scale-150" />
                  <div class="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#f5f3ff] border border-[rgba(124,58,237,0.15)] flex items-center justify-center shadow-sm">
                    <i class="pi pi-th-large text-3xl text-[#7c3aed]" />
                  </div>
                </div>
                <h3 class="text-lg font-bold text-[#0b0817] mb-1.5">
                  {{ builder.activeZone === 'header' ? 'Añade contenido a la cabecera' : builder.activeZone === 'footer' ? 'Añade contenido al pie' : 'Crea tu primera sección' }}
                </h3>
                <p class="text-sm text-[#9690a8] mb-6 max-w-xs text-center leading-[1.625]">
                  {{ builder.activeZone === 'header' ? 'La cabecera aparece al inicio del informe. Arrastra campos desde la paleta.' : builder.activeZone === 'footer' ? 'El pie aparece al final del informe. Arrastra campos desde la paleta.' : 'Las secciones organizan los campos del informe. Arrastra campos desde la paleta para construir el formulario.' }}
                </p>
                <button
                  class="btn btn-primary px-5 py-2.5 text-sm rounded-xl font-semibold shadow-md shadow-[#7c3aed]/20 hover:shadow-lg hover:shadow-[#7c3aed]/30 hover:-translate-y-0.5 transition-all duration-200"
                  data-add-section
                  @click="builder.addSection()"
                >
                  <i class="pi pi-plus mr-1.5 text-xs" />
                  {{ builder.activeZone === 'body' ? 'Añadir sección' : 'Añadir contenido' }}
                </button>
              </div>

              <!-- Sections -->
              <div v-else class="space-y-3">
                <draggable
                  :list="builder.activeSections"
                  group="report-sections"
                  item-key="id"
                  tag="div"
                  class="space-y-3"
                  @change="() => {}"
                >
                  <template #item="{ element }">
                    <SectionPanel :section="element" />
                  </template>
                </draggable>

                <div class="relative pt-2">
                  <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.15)] to-transparent" />
                  <button
                    class="relative w-full text-sm text-[#7c3aed] font-semibold py-3.5 rounded-xl border-2 border-dashed border-[rgba(124,58,237,0.20)] hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
                    @click="builder.addSection()"
                  >
                    <span class="inline-flex items-center gap-1.5">
                      <i class="pi pi-plus text-xs transition-transform duration-200 group-hover:scale-110" />
                      {{ builder.activeZone === 'body' ? 'Añadir sección' : 'Añadir contenido' }}
                    </span>
                  </button>
                </div>
              </div>
            </main>

            <!-- Right: Properties -->
            <aside
              v-if="builder.selectedFieldId"
              class="w-72 border border-[rgba(124,58,237,0.10)] rounded-lg bg-white flex flex-col shrink-0 overflow-hidden"
            >
              <FieldPropertiesPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>

    <PreviewModal
      :show="showPreview"
      :sections="builder.sections"
      :header-sections="builder.headerEnabled ? builder.headerSections : undefined"
      :footer-sections="builder.footerEnabled ? builder.footerSections : undefined"
      :template-name="builder.templateName"
      @close="showPreview = false"
    />
    <PrintPreviewModal
      :show="showPrintPreview"
      :sections="builder.sections"
      :header-sections="builder.headerEnabled ? builder.headerSections : []"
      :footer-sections="builder.footerEnabled ? builder.footerSections : []"
      :template-name="builder.templateName"
      @close="showPrintPreview = false"
    />

    <!-- Unsaved changes modal -->
    <Modal
      :show="showUnsavedModal"
      title="Cambios sin guardar"
      size="sm"
      :close-on-backdrop="false"
      @close="cancelLeave"
    >
      <p class="text-[#6b6b7b] text-sm">
        Tienes cambios sin guardar. Si sales ahora, se perderán.
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-outline btn-sm"
            @click="cancelLeave"
          >
            Quedarme
          </button>
          <button
            class="btn btn-primary btn-sm"
            @click="confirmLeave"
          >
            Salir sin guardar
          </button>
        </div>
      </template>
    </Modal>
  </div>

</template>
