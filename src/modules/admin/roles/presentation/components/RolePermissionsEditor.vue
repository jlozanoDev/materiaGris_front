<script setup>
import { computed, ref } from "vue";
import PermissionCategoryNode from "./PermissionCategoryNode.vue";

const props = defineProps({
  availablePermissions: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const permissionTree = computed(() => {
  const root = { subcategories: {} };

  props.availablePermissions.forEach((p) => {
    const parts = (p.category || "General").split(" > ");
    let current = root;

    parts.forEach((part, index) => {
      if (!current.subcategories[part]) {
        current.subcategories[part] = {
          name: part,
          permissions: [],
          subcategories: {},
        };
      }
      if (index === parts.length - 1) {
        current.subcategories[part].permissions.push(p);
      }
      current = current.subcategories[part];
    });
  });

  return root.subcategories;
});

const expansionSignal = ref({ count: 0, state: false });

function expandAll() {
  expansionSignal.value = { count: expansionSignal.value.count + 1, state: true };
}

function collapseAll() {
  expansionSignal.value = { count: expansionSignal.value.count + 1, state: false };
}

function updateModel(value) {
  emit("update:modelValue", value);
}

defineExpose({ expandAll, collapseAll });
</script>

<template>
  <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
    <PermissionCategoryNode
      v-for="node in permissionTree"
      :key="node.name"
      :node="node"
      :model-value="modelValue"
      :depth="0"
      :expansion-signal="expansionSignal"
      @update:model-value="updateModel"
    />

    <div
      v-if="Object.keys(permissionTree).length === 0"
      class="text-center py-10 text-slate-400 italic"
    >
      No hay permisos disponibles para configurar.
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
