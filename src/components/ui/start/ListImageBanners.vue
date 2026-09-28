<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { Banner } from "@/types";
import { Field, useField } from 'vee-validate'

defineProps<{
  // banners: any[]
  // bannerError: Record<string, string | undefined> // Recibimos el error como prop
  disabled: boolean    // <-- Nueva prop para controlar el modo edición
}>()

const {value:banners} = useField<Banner[]>('banners')

// const emit = defineEmits(['move'])

const handleImageUpload = (event: Event, handleChange: (value: string) => void) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        handleChange(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
    <!-- Encabezado -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
        <font-awesome-icon icon="images" class="text-emerald-500" />
        Listado de Banners / Slides ({{ banners.length }})
      </h2>
    </div>

    <!-- Cuadrícula de Banners -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="(field, index) in banners"
        :key="field.id"
        class="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm flex flex-col transition hover:border-emerald-500/40"
      >
        <!-- Imagen y Badges -->
        <div class="relative w-full h-44 bg-slate-100 dark:bg-slate-700 overflow-hidden group">
          <Field :name="`banners[${index}].image`" v-slot="{ handleChange }">
            <img
              v-if="field.image"
              :src="field.image"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xs text-slate-400">
              Sin imagen
            </div>

            <!-- El botón de cambiar imagen solo se muestra si NO está disabled -->
            <label
              v-if="!disabled"
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
            >
              <span class="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs font-semibold shadow-md flex items-center gap-1.5">
                <font-awesome-icon icon="upload" class="text-emerald-500" /> Cambiar Imagen
              </span>
              <input
                type="file"
                class="hidden"
                accept="image/*"
                @change="(e) => handleImageUpload(e, handleChange)"
              />
            </label>
          </Field>

          <!-- <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
            #{{ index + 1 }}
          </span> -->

          <!-- <span
            class="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white shadow-sm transition-colors duration-200"
            :class="field.value.active ? 'bg-emerald-600/90' : 'bg-slate-600/90'"
          >
            {{ field.value.active ? 'Activo' : 'Inactivo' }}
          </span> -->
        </div>

        <!-- Controles Inferiores -->
        <!-- <div class="p-4 flex flex-col gap-3 flex-1 justify-between"> -->
          <!-- <div class="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Estado del Slide</span>
            <button
              type="button"
              :disabled="disabled"
              @click="!disabled && (field.value.active = !field.value.active)"
              class="relative inline-flex items-center focus:outline-none"
              :class="{ 'opacity-50 cursor-not-allowed': disabled, 'cursor-pointer': !disabled }"
            >
              <div
                class="w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-200 relative"
                :class="{ 'bg-emerald-600': field.value.active }"
              >
                <div
                  class="absolute top-[2px] left-[2px] bg-white border-slate-300 dark:border-none rounded-full h-4 w-4 transition-transform duration-200 shadow-sm"
                  :class="{ 'translate-x-full': field.value.active }"
                ></div>
              </div>
            </button>
          </div> -->

          <!-- Botones de Reordenar -->
          <!-- <div class="flex items-center justify-center pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <div
              class="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
              :class="{ 'opacity-50': disabled }"
            >
              <button
                type="button"
                @click="emit('move', { from: index, to: index - 1 })"
                :disabled="disabled || index === 0"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover anterior"
              >
                <font-awesome-icon icon="chevron-up" class="text-[10px] -rotate-90" />
              </button>
              <div class="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
              <button
                type="button"
                @click="emit('move', { from: index, to: index + 1 })"
                :disabled="disabled || index === banners.length - 1"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover siguiente"
              >
                <font-awesome-icon icon="chevron-down" class="text-[10px] -rotate-90" />
              </button>
            </div>
          </div> -->
        <!-- </div> -->
      </div>
    </div>

    <!-- Alerta ubicada limpiamente en el extremo inferior de la tarjeta -->
    <!-- <div
      v-if="bannerError.banners"
      class="flex items-center gap-2.5 text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl backdrop-blur-md shadow-sm animate-fade-in"
    >
      <span>⚠️ {{ bannerError.banners }}</span>
    </div> -->
  </div>
</template>
