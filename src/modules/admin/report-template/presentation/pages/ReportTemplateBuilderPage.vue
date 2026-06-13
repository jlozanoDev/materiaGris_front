<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import { BUILDER_KEY, useTemplateBuilder } from '../composables/useTemplateBuilder'
import TemplateBuilderToolbar from '../components/TemplateBuilderToolbar.vue'
import SectionPanel from '../components/SectionPanel.vue'
import FieldPropertiesPanel from '../components/FieldPropertiesPanel.vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import TopBar from '@/shared/components/TopBar.vue'
import Breadcrumb from '@/shared/components/Breadcrumb.vue'
import { useAuthStore } from '@/core/store/auth'
import { useLogout } from '@/shared/composables/useLogout'
import draggable from 'vuedraggable'
import type { FieldType } from '@/shared/types'

// ============================================================================
// Palette definition
// ============================================================================

interface PaletteItem {
  type: FieldType
  label: string
  icon: string
}

const PALETTE: PaletteItem[] = [
  { type: 'text', label: 'Texto Corto', icon: 'pi pi-pencil' },
  { type: 'textarea', label: 'Texto Largo', icon: 'pi pi-align-left' },
  { type: 'number', label: 'Número', icon: 'pi pi-hashtag' },
  { type: 'date', label: 'Fecha', icon: 'pi pi-calendar' },
  { type: 'select', label: 'Selección', icon: 'pi pi-chevron-circle-down' },
  { type: 'radio', label: 'Opción Única', icon: 'pi pi-circle-off' },
  { type: 'checkbox', label: 'Checkbox', icon: 'pi pi-check-square' },
  { type: 'dynamic_table', label: 'Tabla Dinámica', icon: 'pi pi-table' },
]

// ============================================================================
// State
// ============================================================================

const route = useRoute()
const authStore = useAuthStore()
const { logout } = useLogout()
const builder = useTemplateBuilder()
provide(BUILDER_KEY, builder)

const isEditMode = computed(() => route.name === 'AdminReportTemplateEdit')
const pageLoading = ref(true)

const breadcrumb = computed(() => [
  { text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' },
  { text: 'Tipos de Informe', icon: 'pi pi-file', to: '/admin/report-templates' },
  { text: isEditMode.value ? 'Editar Plantilla' : 'Nueva Plantilla', icon: 'pi pi-pencil' },
])

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  await authStore.fetchUser()
  pageLoading.value = false
  if (isEditMode.value && route.params.id) {
    const id = route.params.id as string
    await builder.loadTemplate(Number(id))
  }
})

</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f5f3ff]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden flex-col">
      <div class="flex flex-col gap-0 shrink-0 relative z-10 px-5 pt-5">
        <Breadcrumb :items="breadcrumb" />
        <TopBar
          :user="authStore.user"
          @logout="logout"
        />
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
          <div class="flex items-center gap-3 mb-4 shrink-0">
            <div class="h-8 w-8 rounded-full bg-[#ede9fe] flex items-center justify-center">
              <i class="pi pi-pencil text-[#7c3aed] text-sm" />
            </div>
            <h1 class="text-xl font-bold text-[#0b0817]">
              {{ isEditMode ? 'Editar Plantilla de Informe' : 'Nueva Plantilla de Informe' }}
            </h1>
          </div>

          <hr class="border-[rgba(124,58,237,0.08)] mb-4" />

          <!-- Toolbar -->
          <div class="mb-4 shrink-0">
            <TemplateBuilderToolbar />
          </div>

          <hr class="border-[rgba(124,58,237,0.08)] mb-4" />

          <!-- 3-panel layout -->
          <div class="flex flex-1 min-h-0 overflow-hidden gap-4">
            <!-- Left: Palette -->
            <aside class="w-56 border border-[rgba(124,58,237,0.10)] rounded-lg bg-white p-3 overflow-y-auto shrink-0">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
                Campos
              </h4>
              <draggable
                :list="PALETTE"
                :group="{ name: 'report-fields', pull: 'clone', put: false }"
                item-key="type"
                tag="div"
                class="space-y-1"
                :clone="(item: PaletteItem) => ({ ...item })"
              >
                <template #item="{ element }">
                  <div
                    :data-palette-item="element.type"
                    :data-field-type="element.type"
                    class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-grab border border-[rgba(124,58,237,0.10)] bg-white text-[#0b0817] hover:border-[#7c3aed] hover:bg-[#f5f3ff] transition-all duration-150"
                  >
                    <i :class="element.icon" class="text-xs text-[#7c3aed]" />
                    <span class="font-medium">{{ element.label }}</span>
                  </div>
                </template>
              </draggable>
            </aside>

            <!-- Center: Canvas -->
            <main class="flex-1 overflow-y-auto border border-[rgba(124,58,237,0.10)] rounded-lg bg-white p-4">
              <!-- Empty state -->
              <div
                v-if="builder.sections.length === 0"
                class="flex flex-col items-center justify-center h-full px-6"
              >
                <div class="relative mb-6">
                  <div class="absolute inset-0 bg-[#ede9fe] rounded-full blur-2xl opacity-60 scale-150" />
                  <div class="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-[#ede9fe] to-[#f5f3ff] border border-[rgba(124,58,237,0.15)] flex items-center justify-center shadow-sm">
                    <i class="pi pi-th-large text-3xl text-[#7c3aed]" />
                  </div>
                </div>
                <h3 class="text-lg font-bold text-[#0b0817] mb-1.5">
                  Crea tu primera sección
                </h3>
                <p class="text-sm text-[#9690a8] mb-6 max-w-xs text-center leading-relaxed">
                  Las secciones organizan los campos del informe. Arrastra campos desde la paleta para construir el formulario.
                </p>
                <button
                  class="btn btn-primary px-5 py-2.5 text-sm rounded-xl font-semibold shadow-md shadow-[#7c3aed]/20 hover:shadow-lg hover:shadow-[#7c3aed]/30 hover:-translate-y-0.5 transition-all duration-200"
                  data-add-section
                  @click="builder.addSection()"
                >
                  <i class="pi pi-plus mr-1.5 text-xs" />
                  Añadir sección
                </button>
              </div>

              <!-- Sections -->
              <div v-else class="space-y-3">
                <draggable
                  :list="builder.sections"
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
                      Añadir sección
                    </span>
                  </button>
                </div>
              </div>
            </main>

            <!-- Right: Properties -->
            <aside
              v-if="builder.selectedFieldId"
              class="w-72 border border-[rgba(124,58,237,0.10)] rounded-lg bg-white overflow-y-auto shrink-0"
            >
              <FieldPropertiesPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
