<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Field } from 'vee-validate'
defineProps<{
  galeryImages: any[]
  disabled: boolean
}>()
const emit = defineEmits(['move'])

// Manejar cambio de imagen individual sin errores de TS
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
  <div
    class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
  >
   <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <font-awesome-icon icon="images" class="text-emerald-500" />
        Galería Ampliada de 6 Imágenes Fijas
      </h2>
      <span
        class="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
      >
        Grid 2x3 Ancho
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-5">
      <div v-for="(field, index) in galeryImages" :key="field.id" class="space-y-2">
        <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
          Foto #{{ index + 1 }}
        </label>

        <!-- Tarjeta contenedor -->
        <div
          class="relative group block h-40 sm:h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md"
        >
          <!-- Imagen de fondo -->
          <Field :name="`galeryImagesAron[${index}].url`" v-slot="{ handleChange }">
            <img
              v-if="field.value.url"
              :src="field.value.url"
              alt="Preview"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />

            <!-- Input file oculto (Solo actúa si isEditing es true) -->
            <label
              v-if="!disabled"
              class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-center p-3 cursor-pointer z-10"
            >
              <font-awesome-icon icon="cloud-arrow-up" class="text-emerald-400 text-lg mb-1" />
              <span class="text-xs font-medium">Cambiar imagen</span>
              <input
                type="file"
                class="hidden"
                accept="image/*"
                @change="(e) => handleImageUpload(e, handleChange)"
              />
            </label>
          </Field>
          <!-- Botones de flechitas para ordenar (Solo aparecen si isEditing es true) -->
          <div
            v-if="!disabled"
            class="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              type="button"
              @click="emit('move', { from: index, to: index - 1 })"
              :disabled="disabled || index === 0"
              class="p-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Mover a la izquierda"
            >
              <font-awesome-icon icon="chevron-left" />
            </button>
            <span class="text-[10px] font-bold text-slate-400 px-1">#{{ index + 1 }}</span>
            <button
              type="button"
              @click="emit('move', { from: index, to: index + 1 })"
              :disabled="disabled || index === galeryImages.length - 1"
              class="p-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Mover a la derecha"
            >
              <font-awesome-icon icon="chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <p class="text-xs text-slate-400 italic text-center pt-2">
      {{
        !disabled
          ? 'Haz clic en las imágenes para cambiarlas o usa las flechas para reordenarlas.'
          : 'Activa "Habilitar Edición" arriba para modificar textos o imágenes.'
      }}
    </p>
  </div>
</template>

<style scoped></style>
