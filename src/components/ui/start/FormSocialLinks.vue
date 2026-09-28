<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Field, useField } from 'vee-validate'
import { getSocialMeta } from '@/constants/social-constant'
import { ref } from 'vue'
import type { SocialLink } from '@/types'
// Recibimos socialFields y la prop disabled que manda el padre
defineProps<{
  // socialFields: any[]
  disabled: boolean
}>()
// Arreglo para guardar las referencias de los inputs del v-for
const inputRefs = ref<HTMLInputElement[]>([])
// Función para enfocar específicamente el del índice 0 (Instagram)
const focusFirstInput = () => {
  const firstInput = inputRefs.value[0]
  if (firstInput) {
    firstInput.focus()
  }
}
defineExpose({
  focusFirstInput,
})

const { value: socialLinks } = useField<SocialLink[]>('socialLinks')
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
  >
    <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <font-awesome-icon icon="share-nodes" class="text-emerald-500" />
      Enlaces de Redes Sociales (Header Superior)
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <div v-for="(field, index) in socialLinks" :key="field.key">
        <label
          class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5"
        >
          <font-awesome-icon
            :icon="getSocialMeta(field.key).icon"
            :class="getSocialMeta(field.key).colorClass"
          />
          {{ getSocialMeta(field.key).name }}
        </label>

        <!-- El componente Field mantiene viva la ruta indexada conectada al Zod del padre -->
        <Field :name="`socialLinks[${index}].url`" v-slot="{ field: inputField, errorMessage }">
          <div class="space-y-1">
            <input
              v-bind="inputField"
              type="text"
              class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              :placeholder="getSocialMeta(field.key).placeholder"
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
      </div>
    </div>
  </div>
</template>
