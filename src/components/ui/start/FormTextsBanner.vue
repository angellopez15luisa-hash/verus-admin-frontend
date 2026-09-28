<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useField } from 'vee-validate'

// const title = defineModel<string>('title') // o titleStart
// const description = defineModel<string>('description') // o descriptionStart

// Recibimos los errores y la prop disabled del padre
defineProps<{
  // errors: Record<string, string | undefined>
  disabled: boolean
}>()

const { value: title1Start, errorMessage: title1StartError } = useField<string>('title1Start')
const { value: title2Start, errorMessage: title2StartError } = useField<string>('title2Start')
const { value: descriptionStart, errorMessage: descriptionStartError } = useField<string>('descriptionStart')
const { value: textButtonLeftStart, errorMessage: textButtonLeftStartError } = useField<string>('textButtonLeftStart')
const { value:textButtonRightStart,errorMessage:textButtonRightStartError } = useField<string>('textButtonRightStart')

</script>

<template>
  <!-- TEXTOS GLOBALES -->
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
  >
    <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <font-awesome-icon icon="heading" class="text-emerald-500" />
      Textos Globales del Banner
    </h2>
    <div class="space-y-3">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="w-full">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >Título (1)</label
          >
          <input
            v-model="title1Start"
            type="text"
            :disabled="disabled"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span v-if="title1StartError" class="text-red-500 text-sm">
            {{ title1StartError }}
          </span>
        </div>
        <div class="w-full">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >Título (2)</label
          >
          <input
            v-model="title2Start"
            type="text"
            :disabled="disabled"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span v-if="title2StartError" class="text-red-500 text-sm">
            {{ title2StartError }}
          </span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >Descripción / Texto Largo</label
        >
        <textarea
          v-model="descriptionStart"
          rows="2"
          :disabled="disabled"
          class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
        <span v-if="descriptionStartError" class="text-red-500 text-sm">
          {{ descriptionStartError }}
        </span>
      </div>
       <div class="flex flex-col lg:flex-row gap-4">
        <div class="w-full">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >Texto / Boton Izquierda</label
          >
          <input
            v-model="textButtonLeftStart"
            type="text"
            :disabled="disabled"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span v-if="textButtonLeftStartError" class="text-red-500 text-sm">
            {{ textButtonLeftStartError }}
          </span>
        </div>
        <div class="w-full">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >Texto / Boton Derecha</label
          >
          <input
            v-model="textButtonRightStart"
            type="text"
            :disabled="disabled"
            class="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span v-if="textButtonRightStartError" class="text-red-500 text-sm">
            {{ textButtonRightStartError }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
