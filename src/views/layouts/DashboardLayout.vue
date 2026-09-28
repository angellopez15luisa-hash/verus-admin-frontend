<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Sidebar from '@/components/layouts/Sidebar.vue'
import { ref } from 'vue'
import { RouterView } from 'vue-router'

// Estado para controlar la apertura del menú lateral en celulares
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Estado para ocultar/mostrar el sidebar en escritorio (Modo Colapso Total)
const isSidebarCollapsed = ref(false)

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div
    class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased flex h-screen overflow-hidden"
  >
    <!-- Backdrop oscuro translúcido para móviles cuando el sidebar está abierto -->
    <div
      v-if="isMobileMenuOpen"
      @click="toggleMobileMenu"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
    ></div>

    <!-- Sidebar Modularizado con su prop isCollapsed conectada -->
    <Sidebar
      :isOpen="isMobileMenuOpen"
      :isCollapsed="isSidebarCollapsed"
      @close="toggleMobileMenu"
    />

    <!-- Contenedor Derecho: Header fijo arriba + Main con scroll independiente -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Header conectado para alternar el menú móvil y también puedes pasarle el evento para colapsar en desktop si tu Header tiene el botón -->
      <Header
        @toggle-sidebar="toggleMobileMenu"
        @toggle-collapse="toggleSidebarCollapse"
      />

      <!-- Main que envuelve al RouterView para renderizar tus vistas -->
      <main class="flex-1 flex flex-col overflow-y-auto">
        <div class="p-4 w-full flex-1">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
