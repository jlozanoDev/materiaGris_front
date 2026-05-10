<template>
  <transition name="modal-fade">
    <teleport to="body">
      <div v-if="show" class="ds-modal-root fixed inset-0 flex items-center justify-center">
        <div class="modal-backdrop" @click="handleBackdropClick" />

        <div :class="['modal-container', sizeClass, customClass]" role="dialog" aria-modal="true">
          <div v-if="$slots.header || title" class="modal-header">
            <template v-if="$slots.header">
              <slot name="header" />
            </template>
            <template v-else>
              <div class="modal-header">
                <div class="flex items-center gap-3">
                  <div
                    v-if="$slots.icon"
                    class="flex-shrink-0 flex items-center modal-icon"
                    :class="iconClass"
                  >
                    <slot name="icon" />
                  </div>
                  <div
                    v-else-if="icon"
                    class="flex-shrink-0 flex items-center modal-icon"
                    :class="iconClass"
                    v-html="icon"
                  />

                  <div class="min-w-0">
                    <h3 class="text-lg font-semibold text-slate-800 truncate">{{ title }}</h3>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </teleport>
  </transition>
</template>

<script setup>
import { computed, watch, onUnmounted, ref } from "vue";

defineOptions({ name: "AppModal" });

const props = defineProps({
  show: { type: Boolean, default: false },
  size: { type: String, default: "md" },
  closeOnBackdrop: { type: Boolean, default: true },
  title: { type: String, default: "" },
  customClass: { type: String, default: "" },
  icon: { type: String, default: "" },
  iconClass: { type: String, default: "h-5 w-5 text-slate-600" },
});
const emit = defineEmits(["close", "backdrop-click"]);

const sizeClass = computed(() => {
  const map = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-4xl",
    full: "max-w-full",
  };
  return map[props.size] || props.size;
});

function handleBackdropClick() {
  if (props.closeOnBackdrop) emit("close");
  emit("backdrop-click");
}

// Body lock: prevents background elements from remaining interactive/selectable
// Use a per-instance `locked` ref so each Modal tracks its own lock state
const locked = ref(false);

function _addBodyLock() {
  const cur = parseInt(document.body.dataset.dsModalCount || "0", 10) || 0;
  document.body.dataset.dsModalCount = String(cur + 1);
  document.body.classList.add("ds-modal-open");
  locked.value = true;
}

function _removeBodyLock() {
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
  { immediate: true }
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
  vertical-align: middle;
}
.modal-icon svg {
  height: 1.5rem;
  width: 1.5rem;
}
.modal-header h3 {
  margin: 0;
}
.modal-header {
  padding-bottom: 0.25rem;
}
</style>
