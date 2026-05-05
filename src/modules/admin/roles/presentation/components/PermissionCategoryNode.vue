<script setup>
import { ref, watch } from 'vue'

defineOptions({
  name: 'PermissionCategoryNode'
})

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  expansionSignal: {
    type: Object,
    default: () => ({ count: 0, state: true })
  }
})

const emit = defineEmits(['update:modelValue'])

const expanded = ref(false)

watch(() => props.expansionSignal, (newSignal) => {
  expanded.value = newSignal.state
}, { deep: true })

function toggle() {
  expanded.value = !expanded.value
}

function getGrant(permissionId) {
  const found = props.modelValue.find(p => p.id === permissionId)
  return found ? found.grant : 0
}

function setGrant(permissionId, grant) {
  const newValue = [...props.modelValue]
  const idx = newValue.findIndex(p => p.id === permissionId)

  if (idx !== -1) {
    if (grant === 0) {
      newValue.splice(idx, 1)
    } else {
      newValue[idx] = { ...newValue[idx], grant }
    }
  } else if (grant !== 0) {
    newValue.push({ id: permissionId, grant })
  }

  emit('update:modelValue', newValue)
}

function updateModel(value) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 mb-3"
    :class="[
      expanded ? 'ring-1 ring-indigo-100 shadow-md' : '',
      depth > 0 ? 'ml-4 mt-2' : ''
    ]">
    <!-- Header -->
    <button type="button" @click="toggle"
      class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
          <i class="pi text-[10px] text-indigo-600 transition-transform duration-300"
            :class="[expanded ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
        </div>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-600">
          {{ node.name }}
        </span>
      </div>
    </button>

    <!-- Content -->
    <div v-show="expanded" class="animate-fade-in pb-2">
      <!-- Permissions in this category -->
      <div class="divide-y divide-slate-100">
        <div v-for="permission in node.permissions" :key="permission.id"
          class="px-4 py-3 flex items-center justify-between hover:bg-indigo-50/30 transition-colors group">
          <div class="flex-1 mr-4 pl-2 border-l-2 border-transparent group-hover:border-indigo-200">
            <div class="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
              {{ permission.name }}
            </div>
            <div class="text-[11px] text-slate-500 leading-tight mt-0.5">
              {{ permission.description }}
            </div>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button type="button" @click="setGrant(permission.id, 1)" title="Permitir"
              :class="['px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tighter', getGrant(permission.id) === 1 ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200']">
              Permitir
            </button>
            <button type="button" @click="setGrant(permission.id, 0)" title="Neutral"
              :class="['px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tighter', getGrant(permission.id) === 0 ? 'bg-slate-400 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200']">
              Neutral
            </button>
            <button type="button" @click="setGrant(permission.id, -1)" title="Denegar"
              :class="['px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tighter', getGrant(permission.id) === -1 ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200']">
              Denegar
            </button>
          </div>
        </div>
      </div>

      <!-- Recursive Subcategories -->
      <div class="px-2">
        <PermissionCategoryNode v-for="subNode in node.subcategories" :key="subNode.name" :node="subNode"
          :model-value="modelValue" :depth="depth + 1" :expansion-signal="expansionSignal" @update:model-value="updateModel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
