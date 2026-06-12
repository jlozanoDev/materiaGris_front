<script setup lang="ts">
import { onMounted, provide, computed } from 'vue'
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

      <!-- Toolbar -->
      <div class="px-5 py-2 border-b border-slate-200 bg-white">
        <TemplateBuilderToolbar />
      </div>

      <!-- 3-panel layout -->
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <!-- Left: Palette -->
        <aside class="w-56 border-r border-slate-200 bg-white p-3 overflow-y-auto shrink-0">
          <h4 class="text-xs font-semibold text-slate-500 uppercase mb-3">
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
                class="flex items-center gap-2 px-2.5 py-2 rounded text-sm cursor-grab border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <i :class="element.icon" class="text-xs text-indigo-500" />
                <span>{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </aside>

        <!-- Center: Canvas -->
        <main class="flex-1 overflow-y-auto p-4">
          <!-- Empty state -->
          <div
            v-if="builder.sections.length === 0"
            class="flex flex-col items-center justify-center h-full text-slate-400"
          >
            <i class="pi pi-file-text text-5xl mb-3 opacity-40" />
            <p class="text-sm mb-4">Arrastre una sección para comenzar</p>
            <button
              class="btn btn-primary btn-sm"
              data-add-section
              @click="builder.addSection()"
            >
              + Añadir sección
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
              class="text-sm text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-200 rounded-lg w-full py-3 text-center"
              @click="builder.addSection()"
            >
              + Añadir sección
            </button>
          </div>
        </main>

        <!-- Right: Properties -->
        <aside
          v-if="builder.selectedFieldId"
          class="w-72 border-l border-slate-200 bg-white overflow-y-auto shrink-0"
        >
          <FieldPropertiesPanel />
        </aside>
      </div>
    </div>
  </div>
</template>
