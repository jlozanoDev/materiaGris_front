<template>
  <transition name="modal-fade">
    <teleport to="body">
      <div v-if="show" class="ds-modal-root fixed inset-0 flex items-center justify-center">
        <div class="modal-backdrop" @click="handleBackdropClick" />

        <div :class="['modal-container', sizeClass, customClass]" role="dialog" aria-modal="true">
          <div v-if="$slots.header || title || $slots.icon" class="modal-header">
            <div class="flex items-center gap-3">
              <div v-if="$slots.icon" class="modal-icon flex-shrink-0" :class="iconClass">
                <slot name="icon" />
              </div>
              <div class="min-w-0 flex-1">
                <template v-if="$slots.header">
                  <slot name="header" />
                </template>
                <h3 v-else-if="title" class="text-lg font-semibold text-[#0b0817] truncate">
                  {{ title }}
                </h3>
              </div>
              <button
                type="button"
                class="modal-close-btn"
                aria-label="Cerrar"
                @click="emit('close')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
          <div v-else class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Cerrar</button>
          </div>
        </div>
      </div>
    </teleport>
  </transition>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted, ref } from "vue";

defineOptions({ name: "AppModal" });

interface Props {
  show?: boolean;
  size?: string;
  closeOnBackdrop?: boolean;
  title?: string;
  customClass?: string;
  iconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  size: "md",
  closeOnBackdrop: true,
  title: "",
  customClass: "",
  iconClass: "h-5 w-5 text-[#9690a8]",
});

const emit = defineEmits<{
  close: [];
  "backdrop-click": [];
}>();

const sizeClass = computed<string>(() => {
  const map: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-4xl",
    full: "max-w-full",
  };
  return map[props.size] || props.size;
});

function handleBackdropClick(): void {
  if (props.closeOnBackdrop) emit("close");
  emit("backdrop-click");
}

// Body lock: prevents background elements from remaining interactive/selectable
// Use a per-instance `locked` ref so each Modal tracks its own lock state
const locked = ref<boolean>(false);

function _addBodyLock(): void {
  const cur = parseInt(document.body.dataset.dsModalCount || "0", 10) || 0;
  document.body.dataset.dsModalCount = String(cur + 1);
  document.body.classList.add("ds-modal-open");
  locked.value = true;
}

function _removeBodyLock(): void {
  const cur = parseInt(document.body.dataset.dsModalCount || "0", 10) || 0;
  const next = Math.max(0, cur - 1);
  if (next === 0) {
    document.body.classList.remove("ds-modal-open");
    delete document.body.dataset.dsModalCount;
  } else {
    document.body.dataset.dsModalCount = String(next);
  }
  locked.value = false;
}

watch(
  () => props.show,
  (val) => {
    if (val) _addBodyLock();
    else if (locked.value) _removeBodyLock();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (locked.value) _removeBodyLock();
});
</script>

<style>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-icon svg {
  display: block;
}
.modal-header h3 {
  margin: 0;
}
.modal-header {
  padding-bottom: 0.25rem;
}
.modal-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: #9690a8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.modal-close-btn:hover {
  background: #f5f3ff;
  color: #7c3aed;
}
</style>
