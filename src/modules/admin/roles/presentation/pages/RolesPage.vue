<script setup>
import { onMounted, ref, watch } from 'vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import TopBar from '@/shared/components/TopBar.vue'
import Breadcrumb from '@/shared/components/Breadcrumb.vue'
import Modal from '@/shared/components/Modal.vue'
import { useAuthStore } from '@/core/store/auth'
import { useRoles } from '@/modules/admin/roles/presentation/composables/useRoles'
import UiVuetifyDataTable from '@/shared/components/UiVuetifyDataTable.vue'
import RolePermissionsEditor from '@/modules/admin/roles/presentation/components/RolePermissionsEditor.vue'
import { useToast } from '@/shared/composables/useToast'

// Composables
const authStore = useAuthStore()
const { roles, loading, fetchRoles, fetchRole, createRole, updateRole, deleteRole, availablePermissions, fetchAvailablePermissions } = useRoles()
const { show: showToast } = useToast()

// Filters and global search
const globalFilter = ref('')
const filters = ref({ global: { value: null, matchMode: 'contains' } })
watch(globalFilter, (val) => {
  filters.value = { global: { value: val, matchMode: 'contains' } }
})

const columns = [
  { key: 'name', field: 'name', label: 'Nombre del Rol', sortable: true },
  { key: 'description', field: 'description', label: 'Descripción', sortable: true },
  { key: 'users_count', field: 'users_count', label: 'Usuarios', sortable: true },
  { key: 'actions', label: '', sortable: false }
]

const localRoles = ref([])
const editing = ref(false)
const isNewRole = ref(false)
const form = ref({ name: '', description: '', permissions: [] })
const loadingRole = ref(false)
const editorRef = ref(null)

watch(roles, (v) => { localRoles.value = (v || []).map(r => ({ ...r })) }, { immediate: true })

async function startNewRole() {
  editing.value = true
  isNewRole.value = true
  form.value = { name: '', description: '', permissions: [] }
  if (availablePermissions.value.length === 0) {
    await fetchAvailablePermissions()
  }
}

async function startEditRole(r) {
  editing.value = true
  isNewRole.value = false
  loadingRole.value = true
  
  try {
    if (availablePermissions.value.length === 0) {
      await fetchAvailablePermissions()
    }
    const fullRole = await fetchRole(r.id)
    form.value = { ...fullRole }
  } catch (err) {
    showToast('Error al cargar el rol', 'error')
    editing.value = false
  } finally {
    loadingRole.value = false
  }
}

function cancelEdit() {
  editing.value = false
  isNewRole.value = false
  form.value = { name: '', description: '', permissions: [] }
}

async function saveRole() {
  try {
    if (isNewRole.value) {
      await createRole(form.value)
      showToast('Rol creado exitosamente', 'success')
    } else {
      await updateRole(form.value.id, form.value)
      showToast('Rol actualizado exitosamente', 'success')
    }
    editing.value = false
  } catch (err) {
    showToast(err.message || 'Error al guardar el rol', 'error')
  }
}

async function confirmDelete(r) {
  if (r.is_system) {
    showToast('No se pueden eliminar roles del sistema', 'warning')
    return
  }
  
  if (!confirm(`¿Estás seguro de eliminar el rol "${r.name}"? Los usuarios vinculados podrían perder acceso.`)) return
  
  try {
    await deleteRole(r.id)
    showToast('Rol eliminado exitosamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el rol', 'error')
  }
}

const breadcrumb = [
   { text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' },
   { text: 'Seguridad', icon: 'pi pi-shield' },
   { text: 'Roles', icon: 'pi pi-users' }
]

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser()
  fetchRoles()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <AppSidebar />

    <div class="flex flex-1 min-w-0 overflow-hidden">
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-0">
          <Breadcrumb :items="breadcrumb" />
          <TopBar :user="authStore.user" />
        </div>

        <div v-if="authStore.hasPermission('admin.role.view')" class="card p-6 flex flex-col flex-1 min-h-0">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl text-indigo-600 font-bold flex items-center gap-2"> 
              <i class="pi pi-users text-indigo-600" style="font-size: 1.5rem"></i> 
              Gestión de Roles
            </h1>
          </div>

          <div v-if="loading && !editing" class="text-sm text-slate-500">Cargando roles...</div>

          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <input v-model="globalFilter" placeholder="Buscar roles..." aria-label="Buscar roles"
                class="form-input md:w-1/3" />
              <div class="ml-4">
                <button v-has-permission="'admin.role.create'" @click="startNewRole" class="btn btn-primary flex items-center gap-2">
                  <i class="pi pi-plus"></i>
                  Agregar Rol
                </button>
              </div>
            </div>

            <div class="flex-1 min-h-0">
              <UiVuetifyDataTable class="roles-table" :value="localRoles" dataKey="id" :filters="filters" :globalFilterFields="['name','description']" :columns="columns">
                <template #body-name="{ data }">
                  <div class="px-3 py-2">
                    <span class="font-semibold text-slate-800">{{ data.name }}</span>
                    <span v-if="data.is_system" class="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase">Sistema</span>
                  </div>
                </template>

                <template #body-description="{ data }">
                  <div class="px-3 py-2 text-sm text-slate-600">{{ data.description || '-' }}</div>
                </template>

                <template #body-users_count="{ data }">
                  <div class="px-3 py-2 text-sm text-center">
                    <span class="px-2 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">{{ data.users_count }}</span>
                  </div>
                </template>

                <template #body-actions="{ data }">
                  <div class="px-3 py-2 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button v-has-permission="'admin.role.update'" @click="startEditRole(data)" aria-label="Editar" class="icon-action group">
                        <i class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"></i>
                      </button>
                      <button v-if="!data.is_system" v-has-permission="'admin.role.delete'"
                        @click="confirmDelete(data)"
                        aria-label="Eliminar"
                        class="icon-action group hover:bg-red-50"
                      >
                        <i class="pi pi-trash h-4 w-4 transition-colors duration-150 text-current group-hover:text-red-600"></i>
                      </button>
                    </div>
                  </div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-slate-500">No hay roles configurados.</div>
                </template>
              </UiVuetifyDataTable>
            </div>

            <!-- Rol Modal -->
            <Modal :show="editing" size="xl" @close="cancelEdit">
              <template #header>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-bold text-slate-800">
                    {{ isNewRole ? 'Crear Nuevo Perfil' : 'Configurar Perfil: ' + form.name }}
                  </h3>
                </div>
              </template>

              <div v-if="loadingRole" class="py-20 flex flex-col items-center justify-center text-slate-500">
                 <i class="pi pi-spin pi-spinner text-4xl mb-4"></i>
                 Cargando configuración...
              </div>

              <div v-else class="space-y-6">
                <form @submit.prevent="saveRole" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Nombre del Perfil</label>
                      <input v-model="form.name" placeholder="Ej: Administrador Clínico" class="form-input" required :disabled="form.is_system" />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Descripción Funcional</label>
                      <input v-model="form.description" placeholder="Breve descripción de responsabilidades" class="form-input" :disabled="form.is_system" />
                    </div>
                  </div>

                  <div class="border-t border-slate-200 pt-4">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-sm font-bold text-indigo-600 uppercase tracking-widest">Matriz de Control de Permisos</h4>
                      <div class="flex gap-2">
                        <button 
                          type="button" 
                          @click="editorRef?.expandAll()" 
                          class="text-[10px] font-bold uppercase tracking-tight text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          <i class="pi pi-plus-circle"></i> Desplegar todo
                        </button>
                        <span class="text-slate-300">|</span>
                        <button 
                          type="button" 
                          @click="editorRef?.collapseAll()" 
                          class="text-[10px] font-bold uppercase tracking-tight text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                        >
                          <i class="pi pi-minus-circle"></i> Plegar todo
                        </button>
                      </div>
                    </div>
                    <RolePermissionsEditor 
                      ref="editorRef"
                      :availablePermissions="availablePermissions" 
                      v-model="form.permissions" 
                    />
                  </div>
                  
<div class="border-t border-slate-200 pt-4">
                    <p class="text-xs text-slate-500 mb-3">
                      <span class="font-semibold text-green-600">Permitir</span>: concede el permiso al rol.
                      <br>
                      <span class="font-semibold text-red-600">Denegar</span>: deniega explícitamente el permiso en el
                      rol; aunque otro rol lo conceda, este prevalece y no lo permitirá.
                      <br>
                      <span class="font-semibold text-slate-400">Neutral</span>: ni concedido ni denegado.
                    </p>
                    <div class="flex justify-end gap-3">
                      <button type="button" @click="cancelEdit" class="btn btn-ghost">Cancelar</button>
                      <button type="submit" class="btn btn-primary px-8">Guardar Cambios</button>
                    </div>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center p-10 bg-white rounded-xl shadow-sm border border-slate-200">
                <i class="pi pi-lock text-slate-300 text-6xl mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">Acceso Denegado</h2>
                <p class="text-slate-500">No tienes permisos para gestionar roles.</p>
            </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.roles-table :deep(.v-data-table__wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
