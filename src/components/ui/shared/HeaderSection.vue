<script setup lang="ts">
import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'
withDefaults(
  defineProps<{
    title: string
    description?: string
    isEditing: boolean
  }>(),
  {
    description:
      'Personaliza los textos principales, el titulo y la descripcion de la cabecera en la seccion.',
  },
)
const emit = defineEmits<{
  'toggle-edit': []
}>()
</script>

<template>
  <HeaderTitlesSlot>
    <template #title>Mantenimiento Seccion : {{ title }}</template>
    <template #description>{{ description }}</template>
    <template #button>
      <button
        @click="emit('toggle-edit')"
        type="button"
        :class="[
          'px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-2 border shadow-sm cursor-pointer',
          isEditing
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
        ]"
      >
        <font-awesome-icon :icon="isEditing ? 'lock' : 'pen-to-square'" />
        {{ isEditing ? 'Bloquear Edición' : 'Habilitar Edición' }}
      </button>
    </template>
  </HeaderTitlesSlot>
</template>
