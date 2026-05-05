<script setup>
import { onMounted, ref, watch } from 'vue'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import TopBar from '@/shared/components/TopBar.vue'
import Breadcrumb from '@/shared/components/Breadcrumb.vue'
import Modal from '@/shared/components/Modal.vue'
import EditUserModal from '@/modules/admin/users/presentation/components/EditUserModal.vue'
import { useAuthStore } from '@/core/store/auth'
import { useUsers } from '@/modules/admin/users/presentation/composables/useUsers'
import UiVuetifyDataTable from '@/shared/components/UiVuetifyDataTable.vue'

// Composables
const authStore = useAuthStore()
const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsers()

// Filters and global search for DataTable
const globalFilter = ref('')
const filters = ref({ global: { value: null, matchMode: 'contains' } })
watch(globalFilter, (val) => {
  filters.value = { global: { value: val, matchMode: 'contains' } }
})

const columns = [
  { key: 'name', field: 'name', label: 'Nombre', sortable: true },
  { key: 'email', field: 'email', label: 'Email', sortable: true },
  { key: 'roles', field: 'roles', label: 'Roles', sortable: false },
  { key: 'override', field: 'user_permissions', label: 'Permisos Individuales', sortable: false },
  { key: 'actions', label: '', sortable: false }
]

function getUserPermissions(user) {
  return (user?.user_permissions || []).filter(p => p.origin === 'user')
}

// local UI-only state to allow add/edit/deactivate in the frontend
const localUsers = ref([])
const editing = ref(false)
const isNewUser = ref(false)
const form = ref({})

// keep local copy in sync with fetched users
watch(users, (v) => { localUsers.value = (v || []).map(u => ({ ...u })) }, { immediate: true })

function rowClass(row) {
  const base = 'border-b last:border-b-0'
  const data = row?.data ?? row
  if (!data) return base
  if (data.active === false || data.disabled === true || data.deleted_at) return base + ' opacity-60'
  return base
}

function startNewUser() {
  editing.value = true
  isNewUser.value = true
  form.value = { id: Date.now(), name: '', email: '', active: true }
}

function startEditUser(u) {
  editing.value = true
  isNewUser.value = false
  form.value = { ...u }
  // remove role from the editable form (UI no longer exposes role)
  if (form.value && form.value.role) delete form.value.role
}

function cancelEditUser() { editing.value = false; isNewUser.value = false; form.value = {} }

function handleSaveUser(payload) {
  if (isNewUser.value) {
    createUser(payload).then(() => {
      editing.value = false
      isNewUser.value = false
      form.value = {}
    }).catch(err => {
      console.error('createUser error', err)
    })
  } else {
    updateUser(form.value.id, payload).then(() => {
      editing.value = false
      isNewUser.value = false
      form.value = {}
    }).catch(err => {
      console.error('updateUser error', err)
    })
  }
}

function saveUser() {
  // Persist to backend
  if (isNewUser.value) {
    // create
    const payload = { name: form.value.name, email: form.value.email }
    // use same instance
    createUser(payload).then(() => {
      editing.value = false
      isNewUser.value = false
      form.value = {}
    }).catch(err => {
      // TODO: mostrar error en UI
      console.error('createUser error', err)
    })
  } else {
    const payload = { name: form.value.name }
    updateUser(form.value.id, payload).then(() => {
      editing.value = false
      isNewUser.value = false
      form.value = {}
    }).catch(err => {
      console.error('updateUser error', err)
    })
  }
}

function toggleActive(u) {
  const idx = localUsers.value.findIndex(x => x.id === u.id)
  if (idx === -1) return
  localUsers.value[idx] = { ...localUsers.value[idx], active: !localUsers.value[idx].active }
}

function confirmDeactivate(u) {
  const isActive = u.active !== false
  if (!confirm(isActive ? 'Desactivar usuario?' : 'Reactivar usuario?')) return
  // call delete (soft-delete) on backend
  deleteUser(u.id).catch(err => console.error('deleteUser error', err))
}

const breadcrumb = [
   { text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' },
   { text: 'Usuarios', icon: 'pi pi-user' }
]

onMounted(async () => {
  await authStore.fetchUser()
  fetchUsers()
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

          <div v-if="authStore.hasPermission('admin.user.view')" class="card p-6 flex flex-col flex-1 min-h-0">
            <h1 class="text-2xl text-indigo-600 font-bold mb-4"> <i class="pi pi-user text-indigo-600" style="font-size: 1.1rem" aria-hidden="true"></i> Usuarios</h1>

            <div v-if="loading" class="text-sm text-slate-500">Cargando usuarios...</div>

            <div v-else>
                <div class="flex items-center justify-between mb-3">
                <input v-model="globalFilter" placeholder="Buscar..." aria-label="Buscar usuarios"
                  class="form-input md:w-1/3" />
                <div class="ml-4">
                  <button v-has-permission="'admin.user.create'" @click="startNewUser" class="btn btn-primary">Agregar usuario</button>
                </div>
              </div>

              <div class="flex-1 min-h-0">
<UiVuetifyDataTable class="users-table" :value="localUsers" dataKey="id" :filters="filters" :globalFilterFields="['name','email']" :columns="columns">                <template #body-name="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data?.name }}</div>
                </template>

                <template #body-email="{ data }">
                  <div class="px-3 py-2 text-sm">{{ data?.email }}</div>
                </template>

                <template #body-roles="{ data }">
                  <div class="px-3 py-2 flex flex-wrap gap-1">
                    <span v-for="role in (data?.roles || [])" :key="role.id"
                      class="badge badge--primary text-xs">
                      {{ role.name }}
                    </span>
                    <span v-if="!data?.roles?.length" class="text-sm text-slate-400">-</span>
                  </div>
                </template>

                <template #body-override="{ data }">
                  <div class="px-3 py-2 flex flex-wrap gap-1">
                    <template v-for="perm in getUserPermissions(data)" :key="perm.id">
                      <span v-if="perm.grant === 1" class="badge badge--success text-xs">+ {{ perm.slug }}</span>
                      <span v-else-if="perm.grant === -1" class="badge badge--danger text-xs">- {{ perm.slug }}</span>
                    </template>
                    <span v-if="!getUserPermissions(data).length" class="text-sm text-slate-400">-</span>
                  </div>
                </template>

                

                <template #body-actions="{ data }">
                  <div class="px-3 py-2 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button v-has-permission="'admin.user.update'" @click="startEditUser(data)" aria-label="Editar" class="icon-action group">
                        <i class="pi pi-pencil h-4 w-4 transition-colors duration-150 text-current group-hover:text-indigo-600"></i>
                      </button>
                      <button v-has-permission="'admin.user.delete'"
                        @click="confirmDeactivate(data)"
                        :aria-label="(data?.active === false) ? 'Reactivar' : 'Desactivar'"
                        :class="[
                          'icon-action group',
                          data?.active === false
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        ]"
                      >
                        <i class="pi pi-ban h-4 w-4 transition-colors duration-150"></i>
                      </button>
                    </div>
                  </div>
                </template>

                <template #empty>
                  <div class="px-3 py-4 text-slate-500">No hay usuarios para mostrar.</div>
                </template>
                </UiVuetifyDataTable>
              </div>

              <!-- Usuario Modal - usando EditUserModal para roles y permisos -->
              <EditUserModal 
                :show="editing" 
                :user="form" 
                @close="cancelEditUser" 
                @save="handleSaveUser"
              />
            </div>
          </div>
      </main>
    </div>
  </div>
</template>
