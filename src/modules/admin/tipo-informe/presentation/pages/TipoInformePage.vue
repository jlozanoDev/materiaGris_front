<script setup lang="ts">
import AppSidebar from "@/shared/components/AppSidebar.vue";
import TopBar from "@/shared/components/TopBar.vue";
import Breadcrumb from "@/shared/components/Breadcrumb.vue";
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-50">
    <AppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <Breadcrumb />
        <div class="mt-4">
          <h1 class="text-2xl font-bold" style="color: #0b0817;">Tipos de informes</h1>
          <p class="mt-2 text-gray-500">Gestión de tipos de informes</p>
        </div>
      </div>
    </div>
  </div>
</template>
