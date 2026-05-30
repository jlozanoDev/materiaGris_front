<template>
  <nav aria-label="Breadcrumb" class="mb-3">
    <ol class="flex items-center text-sm text-slate-600">
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <router-link
          v-if="item.to && index !== items.length - 1"
          :to="item.to"
          class="inline-flex items-center gap-2 px-2 py-1 rounded-2xl hover:bg-slate-50 text-slate-600 transition"
        >
          <i
            v-if="item.icon"
            :class="[iconClass(item.icon), 'text-slate-400']"
            aria-hidden="true"
          ></i>
          <span class="text-sm">{{ item.text }}</span>
        </router-link>

        <span
          v-else
          class="inline-flex items-center gap-2 px-2 py-1 rounded-2xl font-medium text-slate-500"
        >
          <i
            v-if="item.icon"
            :class="[iconClass(item.icon), 'text-slate-500']"
            aria-hidden="true"
          ></i>
          <span class="text-sm">{{ item.text }}</span>
        </span>

        <svg
          v-if="index !== items.length - 1"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-slate-300 mx-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M7.21 4.21a1 1 0 011.42 0L13.7 9.3a1 1 0 010 1.4l-5.07 5.07a1 1 0 11-1.42-1.42L11.59 10 7.21 5.63a1 1 0 010-1.42z"
            clip-rule="evenodd"
          />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineOptions({ name: "AppBreadcrumb" });

interface BreadcrumbItem {
  text: string;
  to?: string;
  icon?: string;
}

interface Props {
  items?: BreadcrumbItem[];
  primePrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  primePrefix: "pi pi-",
});

function iconClass(icon?: string): string {
  if (!icon) return "";
  return icon.includes("pi") ? icon : `${props.primePrefix}${icon}`;
}
</script>

<style scoped>
/* Ajustes sutiles para que los iconos PrimeVue encajen visualmente */
.pi {
  font-size: 0.9rem;
  line-height: 1;
}
</style>
