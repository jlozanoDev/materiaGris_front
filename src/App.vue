<template>
  <router-view />
  <div aria-live="polite">
    <transition-group name="toast" tag="div">
      <Toast v-for="t in toasts" :id="t.id" :key="t.id" :message="t.message" :type="t.type" />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "@/shared/composables/useToast";
import Toast from "@/shared/components/Toast.vue";

const { toasts } = useToast();
</script>
