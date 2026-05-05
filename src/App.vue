<template>
  <router-view />
  <div aria-live="polite">
    <transition-group name="toast" tag="div">
      <Toast v-for="t in toasts" :key="t.id" :id="t.id" :message="t.message" :type="t.type" />
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/shared/composables/useToast'
import Toast from '@/shared/components/Toast.vue'

const { toasts } = useToast()
</script>
