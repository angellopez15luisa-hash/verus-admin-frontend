<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

// Definimos el modelo para sincronizar el icono seleccionado con el componente padre
const selectedIcon = defineModel<string>('modelValue', { default: '' })
const isOpen = defineModel<boolean>('isOpen', { default: false })

const emit = defineEmits<{
  close: []
  select: [icon: string]
}>()

// Variable temporal local (inicia vacía)
const tempSelectedIcon = ref('')

// Listado completo de íconos (Industria, Logística, Negocios y Servicios)
const businessIcons = [
  { name: 'fa-solid fa-industry', label: 'Fábrica' },
  { name: 'fa-solid fa-flask', label: 'Laboratorio' },
  { name: 'fa-solid fa-dolly', label: 'Carretilla' },
  { name: 'fa-solid fa-warehouse', label: 'Almacén' },
  { name: 'fa-solid fa-gears', label: 'Maquinaria' },
  { name: 'fa-solid fa-briefcase', label: 'Negocio' },
  { name: 'fa-solid fa-chart-line', label: 'Crecimiento' },
  { name: 'fa-solid fa-handshake', label: 'Alianza' },
  { name: 'fa-solid fa-bullhorn', label: 'Marketing' },
  { name: 'fa-solid fa-wallet', label: 'Finanzas' },
  { name: 'fa-solid fa-file-invoice-dollar', label: 'Factura' },
  { name: 'fa-solid fa-store', label: 'Tienda' },
  { name: 'fa-solid fa-truck', label: 'Logística' },
  { name: 'fa-solid fa-boxes-stacked', label: 'Inventario' },
  { name: 'fa-solid fa-credit-card', label: 'Pagos' },
  { name: 'fa-solid fa-building', label: 'Empresa' },
  { name: 'fa-solid fa-id-card', label: 'Identidad' },
  { name: 'fa-solid fa-receipt', label: 'Recibo' },
  { name: 'fa-solid fa-percent', label: 'Descuento' },
  { name: 'fa-solid fa-tags', label: 'Etiquetas' },
  { name: 'fa-solid fa-sack-dollar', label: 'Capital' },
  { name: 'fa-solid fa-calculator', label: 'Cálculos' },
  { name: 'fa-solid fa-globe', label: 'Global' },
  { name: 'fa-solid fa-shop', label: 'Comercio' },
  { name: 'fa-solid fa-shield-halved', label: 'Seguridad' },
  { name: 'fa-solid fa-headset', label: 'Soporte' },
  { name: 'fa-solid fa-phone', label: 'Contacto' },
  { name: 'fa-solid fa-envelope', label: 'Correo' },
  { name: 'fa-solid fa-clock', label: 'Horarios' },
  { name: 'fa-solid fa-award', label: 'Calidad' },
  { name: 'fa-solid fa-star', label: 'Destacado' },
  { name: 'fa-solid fa-comments', label: 'Opiniones' },
  { name: 'fa-solid fa-users', label: 'Clientes' },
  { name: 'fa-solid fa-map-location-dot', label: 'Ubicación' },
  { name: 'fa-solid fa-circle-check', label: 'Éxito' },
]

// Al tocar un icono, lo guardamos de forma temporal
const handleSelectTemp = (iconClass: string) => {
  tempSelectedIcon.value = iconClass
}

// Al confirmar (solo si hay algo seleccionado), guardamos y cerramos
const confirmSelection = () => {
  if (!tempSelectedIcon.value) return
  selectedIcon.value = tempSelectedIcon.value
  emit('select', tempSelectedIcon.value)
  emit('close')
}

// Manejador para detectar la tecla Escape de forma aislada
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    e.stopImmediatePropagation()
    e.preventDefault()
    emit('close')
  }
}

// Cada vez que se abre el modal, arrancamos sin nada seleccionado
watch(isOpen, (value) => {
  if (value) {
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    tempSelectedIcon.value = ''
  } else {
    window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown, { capture: true })
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl transition-all flex flex-col max-h-[70vh]"
    >
      <!-- Cabecera -->
      <div
        class="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800/80 shrink-0"
      >
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Selecciona un Ícono
          </h3>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Explora las opciones y haz clic en una para continuar
          </p>
        </div>
        <button
          @click="emit('close')"
          type="button"
          class="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition text-sm p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <!-- Mensaje de advertencia arriba (aparece solo si no hay selección) -->
      <div v-if="!tempSelectedIcon" class="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-1.5 text-amber-500 dark:text-amber-400 text-[11px] font-medium shrink-0">
        <font-awesome-icon icon="triangle-exclamation" />
        <span>* Debe seleccionar un ícono para continuar.</span>
      </div>

      <!-- Cuadrícula / Galería de Íconos -->
      <div class="p-5 overflow-y-auto flex-1 custom-scrollbar">
        <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          <button
            v-for="item in businessIcons"
            :key="item.name"
            type="button"
            @click="handleSelectTemp(item.name)"
            :class="[
              'group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer h-18',
              tempSelectedIcon === item.name
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <font-awesome-icon :icon="item.name" class="text-lg transition-transform group-hover:scale-110" />
            <span class="text-[9px] font-medium truncate w-full text-center">
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>

      <!-- Pie de página con botones de Cancelar y Confirmar -->
      <div
        class="flex items-center justify-between px-6 py-2.5 bg-slate-50 dark:bg-[#080e1f] border-t border-slate-200 dark:border-slate-800/80 text-xs shrink-0"
      >
        <span class="text-slate-500 dark:text-slate-400 truncate max-w-[45%]">
          Marcado:
          <code class="text-emerald-600 dark:text-emerald-400 font-mono">{{ tempSelectedIcon || 'Ninguno' }}</code>
        </span>

        <div class="flex items-center gap-2">
          <button
            @click="emit('close')"
            type="button"
            class="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition cursor-pointer text-xs"
          >
            Cancelar
          </button>

          <button
            @click="confirmSelection"
            :disabled="!tempSelectedIcon"
            type="button"
            :class="[
              'px-3.5 py-1 font-semibold rounded-lg transition text-xs shadow-sm',
              !tempSelectedIcon
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
            ]"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
