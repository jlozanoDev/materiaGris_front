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

// ============================================================================
// Drag handlers
// ============================================================================

function onPaletteAdd(evt: any) {
  const type = evt.item?.dataset?.fieldType || evt.clone?.dataset?.fieldType
  if (type && builder.sections.length > 0) {
    // Add field to the first column of the first section
    const section = builder.sections[0]
    if (section.rows.length > 0 && section.rows[0].columns.length > 0) {
      builder.addField(section.rows[0].columns[0].id, type as FieldType)
    }
  }
}
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
                group="{ name: 'report-fields', pull: 'clone', put: false }"
                item-key="type"
                tag="div"
                class="space-y-1"
                :clone="(item: PaletteItem) => ({ ...item })"
                @change="onPaletteAdd"
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
                class="flex flex-col items-center justify-center h-full text-[#9690a8]"
              >
                <i class="pi pi-file-text text-5xl mb-3 opacity-40" />
                <p class="text-sm mb-4 font-medium">Arrastre una sección para comenzar</p>
                <button
                  class="btn btn-primary btn-sm"
                  data-add-section
                  @click="builder.addSection()"
                >
                  <i class="pi pi-plus mr-1" />
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

                <button
                  class="text-sm text-[#7c3aed] hover:text-[#6d28d9] border border-dashed border-[#7c3aed] rounded-lg w-full py-3 text-center font-medium transition-colors hover:bg-[#f5f3ff]"
                  @click="builder.addSection()"
                >
                  <i class="pi pi-plus mr-1" />
                  Añadir sección
                </button>
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
