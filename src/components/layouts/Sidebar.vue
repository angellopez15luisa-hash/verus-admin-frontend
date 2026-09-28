<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
// import { ref } from 'vue'

defineProps<{
  isOpen: boolean
  isCollapsed?: boolean // Recibimos el estado de colapso para escritorio
}>()

defineEmits(['close'])

// Estado para abrir/cerrar el submenú de Eventos
// const isEventsOpen = ref(true)

// const toggleEvents = () => {
//   isEventsOpen.value = !isEventsOpen.value
// }
</script>

<template>
  <!-- SIDEBAR (Responsive con drawer deslizante en móviles y colapsable en desktop) -->
  <aside
    :class="[
      'fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0',
      // Control para móviles (deslizar con isOpen)
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      // Control para escritorio (colapsar ocultando margen y opacidad)
      isCollapsed ? 'md:-ml-64 md:opacity-0 md:pointer-events-none' : 'md:ml-0 md:opacity-100',
    ]"
  >
    <div>
      <!-- Logo y botón de cierre para móvil -->
      <div
        class="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold"
          >
            V
          </div>
          <span class="font-bold text-lg tracking-wide">VIREO</span>
        </div>
        <button
          @click="$emit('close')"
          class="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <font-awesome-icon icon="xmark" class="text-lg" />
        </button>
      </div>

      <!-- Navegación -->
      <div class="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)] text-sm">
        <div class="space-y-1">
          <!-- Menú normal: Inicio -->
          <router-link
            :to="{ name: 'start' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="house" /> Inicio
          </router-link>

          <router-link
            :to="{ name: 'how-it-works' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="person-circle-question" /> Como funciona
          </router-link>

          <router-link
            :to="{ name: 'risk' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="triangle-exclamation" /> Riesgo
          </router-link>

          <router-link
            :to="{ name: 'services' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="screwdriver-wrench" /> Servicios
          </router-link>

          <!-- <router-link
            :to="{ name: 'frequently-questions' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="circle-question" /> Preguntas Frecuentes
          </router-link> -->

          <router-link
            :to="{ name: 'trust' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="handshake" /> Confianza
          </router-link>

          <router-link
            :to="{ name: 'contact' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="users" /> Contacto
          </router-link>

           <router-link
            :to="{ name: 'information-aditional' }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            exact-active-class="!bg-emerald-100 dark:!bg-emerald-900/40 !text-emerald-700 dark:!text-emerald-300 !font-semibold"
          >
            <font-awesome-icon icon="pen-to-square" /> Informacion adicional
          </router-link>
        </div>
      </div>
    </div>

    <!-- Usuario inferior -->
    <div
      class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
          class="w-9 h-9 rounded-full object-cover"
          alt="Avatar"
        />
        <div>
          <h4 class="text-xs font-semibold">Jacob Gerrald</h4>
          <p class="text-[10px] text-slate-400">jacobg@vireo.io</p>
        </div>
      </div>
      <font-awesome-icon
        icon="arrow-right-from-bracket"
        class="text-slate-400 text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      />
    </div>
  </aside>
</template>
