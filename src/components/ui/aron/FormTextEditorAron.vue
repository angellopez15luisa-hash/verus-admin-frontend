<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import { Field } from 'vee-validate'
const title = defineModel<string>('title')
const description = defineModel<string>('description')
const textHtml = defineModel<string>('textHtml')

defineProps<{
  errors: Record<string, string | undefined>
  disabled: boolean
  listLabelsFields: any[]
}>()
</script>

<template>
  <div
    class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
  >
    <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <font-awesome-icon icon="pen-to-square" class="text-emerald-500" />
      Editor de Contenido (Izquierda)
    </h2>

    <div>
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        Título Destacado (H2)
      </label>
      <input
        v-model="title"
        :disabled
        type="text"
        class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <span v-if="errors?.titleEditorAron" class="text-red-500 text-sm">
        {{ errors.titleEditorAron }}
      </span>
    </div>

    <div>
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        Primer Párrafo Descriptivo
      </label>
      <textarea
        v-model="description"
        :disabled
        rows="4"
        class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
      ></textarea>
      <span v-if="errors?.descriptionEditorAron" class="text-red-500 text-sm">
        {{ errors.descriptionEditorAron }}
      </span>
    </div>

    <div class="space-y-2">
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400">
        Viñetas con Check (Características)
      </label>
      <div v-for="(field, index) in listLabelsFields" :key="index" class="flex items-start gap-2">
        <span class="text-emerald-500 text-xs mt-2">✔</span>

        <!-- Contenedor vertical para que el error baje y no empuje el input al costado -->
        <div class="w-full flex flex-col">
          <Field
            :name="`listLabelsEditorAron[${index}].text`"
            v-slot="{ field: inputField, errorMessage }"
          >
            <input
              v-bind="inputField"
              :disabled="disabled"
              type="text"
              class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <span class="text-red-500 text-xs mt-1" v-if="errorMessage">
              {{ errorMessage }}
            </span>
          </Field>
        </div>
      </div>
    </div>
    <!-- Texto Inferior Enriquecido (Párrafos y Reservas) -->
    <div class="space-y-2 pt-2">
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400">
        Texto Inferior Enriquecido (Párrafos y Reservas)
      </label>
      <!-- Usamos exactamente el nombre del Zod Schema: textHtmlEditorAron -->
      <Field name="textHtmlEditorAron" v-slot="{ field, errorMessage }">
        <div class="flex flex-col">
          <div
            class="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition"
            :class="{ 'opacity-60': disabled }"
          >
            <QuillEditor
              v-model:content="textHtml"
              @update:content="
                (content) => {
                  const stripped = content ? content.replace(/<(.|\n)*?>/g, '').trim() : ''
                  const finalVal = stripped === '' ? '' : content
                  field.onChange(finalVal)
                  field.onInput(finalVal)
                }
              "
              contentType="html"
              theme="snow"
              style="min-height: 160px"
              :disabled="disabled"
            />
          </div>
          <!-- Apuntamos al error exacto que valida Zod -->
          <span
            class="text-red-500 text-xs mt-1 block"
            v-if="errorMessage || errors?.textHtmlEditorAron"
          >
            {{ errorMessage || errors?.textHtmlEditorAron }}
          </span>
        </div>
      </Field>
    </div>
  </div>
</template>

<style scoped></style>
