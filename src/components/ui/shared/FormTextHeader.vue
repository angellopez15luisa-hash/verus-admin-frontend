<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed, ref } from 'vue'

const props = defineProps<{
  titleFieldName: string // Ej: "textHeaderSections.0.title"
  descriptionFieldName: string // Ej: "textHeaderSections.0.description"
  isEditing: boolean
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)

const focusTitle = () => {
  titleInputRef.value?.focus()
}

// 💡 Dos useField independientes usando los getters dinámicos
const { value: titleValue, errorMessage: titleError } = useField<string>(() => props.titleFieldName)
const { value: descriptionValue, errorMessage: descriptionError } = useField<string>(
  () => props.descriptionFieldName,
)

const disabled = computed(() => !props.isEditing)

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
      Textos cabecera
    </h2>
    <div class="space-y-3">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="w-full">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >Título</label
          >
          <input
            ref="titleInputRef"
            v-model="titleValue"
            type="text"
            :disabled="disabled"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span v-if="titleError" class="text-red-500 text-xs block mt-1">
            {{ titleError }}
          </span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >Descripción / Texto Largo</label
        >
        <textarea
          v-model="descriptionValue"
          rows="2"
          :disabled="disabled"
          class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span v-if="descriptionError" class="text-red-500 text-xs block -mt-0.5">
          {{ descriptionError }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
