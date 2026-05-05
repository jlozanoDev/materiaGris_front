<script setup>
import { onMounted, ref } from 'vue'
import AppSidebar        from '@/shared/components/AppSidebar.vue'
import TopBar            from '@/shared/components/TopBar.vue'
import Breadcrumb        from '@/shared/components/Breadcrumb.vue'
import HeroCard          from '@/modules/dashboard/presentation/components/HeroCard.vue'
import PatientList       from '@/modules/dashboard/presentation/components/PatientList.vue'
import ConsultationPanel from '@/modules/dashboard/presentation/components/ConsultationPanel.vue'
import RightPanel        from '@/modules/dashboard/presentation/components/RightPanel.vue'
// Los modales ahora los gestiona `TopBar` internamente; el parent escucha eventos.

import { useAuthStore } from '@/core/store/auth'
const authStore = useAuthStore()

// Direcciones: se sincronizan con `TopBar` mediante eventos
const addresses = ref([])

const onSelectAddress = (addr) => {
  console.log('[DashboardPage] dirección seleccionada', addr)
}

const onManageAddresses = (newAddresses) => {
  if (Array.isArray(newAddresses)) addresses.value = newAddresses
}

const onSaveAddresses = (newAddresses) => {
  addresses.value = newAddresses
  try { localStorage.setItem('addresses', JSON.stringify(addresses.value)) } catch (e) {}
}

const onSaveEdited = (edited) => {
  authStore.user = { ...authStore.user, ...edited }
  try { localStorage.setItem('user', JSON.stringify(authStore.user)) } catch (e) {}
}

const onSavePassword = ({ password, oldPassword }) => {
  console.log('[DashboardPage] password change requested (frontend-only)')
  try { localStorage.setItem('passwordChangedAt', new Date().toISOString()) } catch (e) {}
}

const breadcrumb = [{ text: 'Dashboard', icon: 'pi pi-objects-column', to: '/' }]

onMounted(() => { authStore.fetchUser() })
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#EEF2FF]">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main + Right -->
    <div class="flex flex-1 min-w-0 overflow-hidden">
      <!-- Main content -->
      <main class="flex flex-1 min-w-0 flex-col overflow-y-auto p-5 gap-5">
        <div class="flex flex-col gap-1">
          <Breadcrumb :items="breadcrumb" />
          <TopBar :user="authStore.user" :addresses="addresses" @admin.user.updated="onSaveEdited" @password-changed="onSavePassword" @addresses-saved="onSaveAddresses" @select-address="onSelectAddress" @manage-addresses="onManageAddresses" />
          
        </div>
        <div class="flex gap-5">
          <HeroCard :user="authStore.user" class="flex-1" />
          <div class="w-160">
            <PatientList />
          </div>
        </div>
        <div class="mt-5">
          <ConsultationPanel />
        </div>
      </main>

      <!-- Right panel -->
      <RightPanel />
    </div>
  </div>
  
</template>
