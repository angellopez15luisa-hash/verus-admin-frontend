<script setup lang="ts">
import { ref } from 'vue'

const title = defineModel('title')
const subtitle = defineModel('subtitle')

defineProps<{
  errors: Record<string, string | undefined>
  disabled: boolean
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)

const focusTitle = () => {
  titleInputRef.value?.focus()
}

defineExpose({
  focusTitle,
  titleInputRef,
})
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
  >
    <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <font-awesome-icon icon="heading" class="text-emerald-500" />
      Encabezado de la Sección
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Título Principal (Ej. Araon el Indomable)
        </label>
        <input
          ref="titleInputRef"
          v-model="title"
          :disabled
          type="text"
          class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <span v-if="errors?.titleAron" class="text-red-500 text-sm">
          {{ errors.titleAron }}
        </span>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Subtítulo de Cabecera
        </label>
        <input
          v-model="subtitle"
          :disabled
          type="text"
          class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <span v-if="errors?.subtitleAron" class="text-red-500 text-sm">
          {{ errors.subtitleAron }}
        </span>
      </div>
    </div>
  </div>
</template>

<style></style>
