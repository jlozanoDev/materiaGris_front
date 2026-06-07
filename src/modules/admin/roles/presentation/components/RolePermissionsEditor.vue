<script setup lang="ts">
import { computed, ref } from "vue";
import PermissionCategoryNode from "./PermissionCategoryNode.vue";
import type { PermissionShape } from "@/shared/types";

// --- Local interfaces ---

interface PermissionGrant {
  id: number;
  grant: number;
}

interface TreeNode {
  name: string;
  permissions: PermissionShape[];
  subcategories: TreeNode[];
}

interface ExpansionSignal {
  count: number;
  state: boolean;
}

interface Props {
  availablePermissions: PermissionShape[];
  modelValue: PermissionGrant[];
}

// --- Props & emits ---

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: PermissionGrant[]];
}>();

// --- Permission tree ---

const permissionTree = computed<TreeNode[]>(() => {
  const findOrCreate = (list: TreeNode[], name: string): TreeNode => {
    const existing = list.find((n) => n.name === name);
    if (existing) return existing;
    const node: TreeNode = { name, permissions: [], subcategories: [] };
    list.push(node);
    return node;
  };

  const root: TreeNode[] = [];

  for (const p of props.availablePermissions) {
    const rawCategory = (p as unknown as Record<string, unknown>).category as string | undefined;
    const parts = (rawCategory || "General").split(" > ");
    let currentList = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const node = findOrCreate(currentList, part);

      if (i === parts.length - 1) {
        node.permissions.push(p);
      }

      currentList = node.subcategories;
    }
  }

  return root;
});

// --- Expansion controls ---

const expansionSignal = ref<ExpansionSignal>({ count: 0, state: false });

function expandAll(): void {
  expansionSignal.value = { count: expansionSignal.value.count + 1, state: true };
}

function collapseAll(): void {
  expansionSignal.value = { count: expansionSignal.value.count + 1, state: false };
}

function updateModel(value: PermissionGrant[]): void {
  emit("update:modelValue", value);
}

// Type-bridge: PermissionCategoryNode expects PermissionNode with stricter types
// than shared PermissionShape; both match at runtime.
const treeForTemplate = computed(() => permissionTree.value as any);

defineExpose({ expandAll, collapseAll });
</script>

<template>
  <div class="space-y-4">
    <PermissionCategoryNode
      v-for="node in treeForTemplate"
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
