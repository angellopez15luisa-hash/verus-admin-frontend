<script setup lang="ts">
import type { ContentHowItWork } from '@/types'
import { Field, useField } from 'vee-validate'
import { computed, ref } from 'vue'

const props = defineProps<{
  isEditing: boolean
}>()

const { value: contentHowItWorks } = useField<ContentHowItWork[]>('contentHowItWorks')

const inputRefs = ref<HTMLInputElement[]>([])

const focusFirstInput = () => {
  const firstInput = inputRefs.value[0]
  if (firstInput) {
    firstInput.focus()
  }
}
defineExpose({
  focusFirstInput,
})

const disabled = computed(() => !props.isEditing)
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
  >
    <div
      class="flex items-center space-x-2 text-emerald-500 border-b border-slate-200 dark:border-slate-800 pb-4"
    >
      <span class="text-xs font-bold uppercase tracking-wider">Pasos del Proceso (04)</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
      <div
        class="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col justify-between space-y-4"
        v-for="(field, index) in contentHowItWorks"
        :key="field.id"
      >
        <span class="text-xl font-bold text-emerald-500">
          {{ String(index + 1).padStart(2, '0') }}
        </span>

        <div class="space-y-3">
          <!-- Título -->
          <div>
            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
              >Título del Paso</label
            >
            <Field
              :name="`contentHowItWorks[${index}].title`"
              v-slot="{ field: inputField, errorMessage }"
            >
              <div class="space-y-1">
                <input
                  v-bind="inputField"
                  type="text"
                  class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="disabled"
                  :ref="
                    (el) => {
                      if (el) inputRefs[index] = el as HTMLInputElement
                    }
                  "
                />
                <span class="text-red-500 text-xs block" v-if="errorMessage">
                  {{ errorMessage }}
                </span>
              </div>
            </Field>
            <!-- Mensaje de error para el título -->
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
              >Descripción</label
            >
            <Field
              :name="`contentHowItWorks[${index}].description`"
              v-slot="{ field: inputField, errorMessage }"
            >
              <div class="space-y-1">
                <textarea
                  v-bind="inputField"
                  rows="3"
                  class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="disabled"
                ></textarea>
                <span class="text-red-500 text-xs block" v-if="errorMessage">
                  {{ errorMessage }}
                </span>
              </div>
            </Field>
            <!-- Mensaje de error para la descripción -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
