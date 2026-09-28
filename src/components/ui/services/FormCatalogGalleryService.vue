<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// Importa el tipo de dato GeneralSetting desde los tipos globales del proyecto
// Importa las funciones reactivas y de ciclo de vida de Vue
import { computed, ref, watch } from 'vue'
// Importa el componente hijo para crear o editar los servicios en un modal
import ModalCatalogGalleryService from './ModalCatalogGalleryService.vue'
// Importa la librería SweetAlert2 para mostrar alertas y modales de confirmación interactivos
import Swal from 'sweetalert2'
import type { CatalogGalleryServiceT } from '@/types/general-setting.ts'

// Define las propiedades (props) que recibe este componente principal
const props = defineProps<{
  services: CatalogGalleryServiceT[] // Arreglo con la lista de servicios del catálogo
  disabled: boolean // Bandera booleana para deshabilitar controles globalmente si es necesario
}>()

// Define los eventos personalizados que este componente puede emitir hacia su componente padre
const emit = defineEmits<{
  (e: 'create', service: any): void // Evento para solicitar la creación de un nuevo servicio
  (e: 'update', id: number, service: any): void // Evento para solicitar la actualización de un servicio existente
  (e: 'delete', id: number): void // Evento para solicitar la eliminación de un servicio por su ID
  (e: 'move', fromIndex: number, toIndex: number): void // Evento para cambiar el orden (posición) de los servicios
}>()

const isCurrentDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}

const LIMIT = import.meta.env.VITE_LIMIT_SERVICES

// Variable reactiva para almacenar el texto que escribe el usuario en el buscador
const searchQuery = ref<string>('')
// Variable reactiva para almacenar el estado seleccionado en el filtro desplegable (Todos, Activo, Inactivo)
const selectedStatus = ref<string>('Todos')
// Variable reactiva para llevar el control de la página actual en la paginación
const currentPage = ref<number>(1)
// Variable reactiva que define cuántas filas o elementos se muestran por página
const rowsPerPage = ref<number>(4)

// Variable reactiva booleana para controlar si el modal secundario está abierto o cerrado
const isModalOpen = ref(false)
// Variable reactiva que define el modo del modal ('create' para nuevo o 'edit' para modificar)
const modalMode = ref<'create' | 'edit'>('create')
// Variable reactiva para almacenar temporalmente los datos del servicio seleccionado al momento de editar
const selectedServiceForEdit = ref<any>(null)

// Función que captura el evento de creación proveniente del modal y lo emite al componente padre
const handleCreateService = (newService: CatalogGalleryServiceT) => {
  emit('create', newService)
}

// Función que captura el evento de actualización de un servicio y lo emite hacia el padre
const handleUpdateService = (
  id: CatalogGalleryServiceT['id'],
  updatedService: CatalogGalleryServiceT,
) => {
  emit('update', id, updatedService)
}

// Función para abrir el modal configurado exclusivamente en modo creación
const openCreateModal = () => {
  modalMode.value = 'create' // Cambia el modo del modal a creación
  isModalOpen.value = true // Abre el modal cambiando su estado a verdadero
  selectedServiceForEdit.value = null // Limpia cualquier dato de edición anterior
}

// Función para abrir el modal en modo edición cargando los datos del servicio seleccionado
const openEditModal = (service: CatalogGalleryServiceT) => {
  modalMode.value = 'edit' // Cambia el modo del modal a edición
  isModalOpen.value = true // Abre el modal
  selectedServiceForEdit.value = service // Asigna los datos del servicio a editar
}

// Observador (watch) que vigila la propiedad 'disabled'; si se activa, reinicia los filtros y la paginación
watch(
  () => props.disabled,
  (newDisabled) => {
    if (newDisabled) {
      currentPage.value = 1 // Vuelve a la primera página
      rowsPerPage.value = 4 // Restablece las filas por página por defecto
      searchQuery.value = '' // Limpia el texto de búsqueda
      selectedStatus.value = 'Todos' // Restablece el filtro de estados
    }
  },
)

// Función para mover un servicio una posición hacia atrás (arriba/izquierda) en el orden general
const moveUp = (serviceId: number) => {
  const globalIndex = props.services.findIndex((s) => s.id === serviceId) // Busca el índice global del servicio
  if (globalIndex > 0) {
    emit('move', globalIndex, globalIndex - 1) // Emite el evento de movimiento si no está al inicio
  }
}

// Función para mover un servicio una posición hacia adelante (abajo/derecha) en el orden general
const moveDown = (serviceId: number) => {
  const globalIndex = props.services.findIndex((s) => s.id === serviceId) // Busca el índice global del servicio
  if (globalIndex !== -1 && globalIndex < props.services.length - 1) {
    emit('move', globalIndex, globalIndex + 1) // Emite el evento de movimiento si no está al final
  }
}

// Función asíncrona para manejar la eliminación de un servicio mediante una alerta de confirmación (SweetAlert2)
const deleteService = async (id: number) => {
  const dark = isCurrentDarkMode()
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer y el servicio será eliminado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: dark ? '#121824' : '#ffffff',
    color: dark ? '#f8fafc' : '#1e293b',
  })

  // Si el usuario confirma la acción de borrado en la alerta
  if (result.isConfirmed) {
    emit('delete', id) // Emite el evento 'delete' con el ID del servicio
    Swal.fire({
      title: '¡Eliminado!',
      text: 'El servicio ha sido borrado exitosamente.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: dark ? '#121824' : '#ffffff',
      color: dark ? '#f8fafc' : '#1e293b',
    })
  }
}

// Propiedad computada que filtra la lista de servicios según el texto de búsqueda y el estado seleccionado
const filteredServices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase() // Normaliza el texto de búsqueda a minúsculas y sin espacios extra
  const statusFilter = selectedStatus.value // Almacena el valor actual del filtro de estado

  return props.services.filter((service) => {
    // Comprueba si el título o la descripción coinciden con el texto buscado
    const matchesSearch =
      !query ||
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query)

    let matchesStatus = true
    // Evalúa el filtro por estado (Activo / Inactivo) si no está en 'Todos'
    if (statusFilter !== 'Todos') {
      const isTargetActive = statusFilter === 'Activo'
      matchesStatus = service.active === isTargetActive
    }

    return matchesSearch && matchesStatus // Retorna solo los elementos que cumplen ambas condiciones
  })
})

// Propiedad computada que calcula el número total de páginas disponibles basado en los elementos filtrados
const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / rowsPerPage.value) || 1
})

// Propiedad computada que corta el arreglo de servicios filtrados para mostrar únicamente los elementos de la página actual
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + Number(rowsPerPage.value)
  return filteredServices.value.slice(start, end)
})

// Propiedad computada para obtener el número de índice inicial que se muestra en el texto de paginación
const startIndex = computed(() => {
  if (filteredServices.value.length === 0) return 0
  return (currentPage.value - 1) * Number(rowsPerPage.value) + 1
})

// Propiedad computada para obtener el número de índice final que se muestra en el texto de paginación
const endIndex = computed(() => {
  return Math.min(currentPage.value * Number(rowsPerPage.value), filteredServices.value.length)
})

// Propiedad computada que genera la estructura de números y puntos suspensivos (...) para los botones de paginación
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
})

// Observador múltiple que reinicia la página actual a 1 cada vez que cambia el texto de búsqueda o el filtro de estado
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

const quantityServices = computed(() => props.services.length)



</script>

<template>
  <!-- Contenedor principal del componente con clases de diseño responsivo y modo oscuro -->
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors p-6 space-y-6 relative"
  >
    <!-- Barra superior que contiene el título, descripción, buscador, filtros y botón de agregar -->
     <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent border-b border-slate-200 dark:border-slate-800/60 pb-6"
      >
        <!-- Bloque de texto descriptivo del módulo -->
        <div>
          <h2 class="text-sm font-bold text-slate-800 dark:text-white">Catálogo de Servicios</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Filtra, agrega o administra las tarjetas de servicios de la landing.
          </p>
        </div>

        <!-- Contenedor para los controles interactivos de la barra superior -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">

          <!-- Alerta amarilla a la izquierda del buscador -->
          <div v-if="quantityServices>=LIMIT" class="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <font-awesome-icon icon="triangle-exclamation" class="text-xs" />
            <span>El límite es {{ LIMIT }}</span>
          </div>

          <!-- Contenedor del buscador de servicios -->
          <div class="relative w-full sm:w-64">
            <!-- Icono de lupa posicionado de manera absoluta a la izquierda -->
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <font-awesome-icon icon="magnifying-glass" class="text-xs" />
            </span>
            <!-- Input de texto enlazado a la variable reactiva searchQuery -->
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar servicio..."
              :disabled="disabled"
              class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Contenedor del menú desplegable para filtrar por estado -->
          <div class="relative w-full sm:w-44">
            <!-- Elemento select enlazado a la variable reactiva selectedStatus -->
            <select
              v-model="selectedStatus"
              :disabled="disabled"
              class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <!-- Icono de flecha hacia abajo ubicado de forma absoluta a la derecha -->
            <span
              class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none"
            >
              <font-awesome-icon icon="chevron-down" class="text-xs" />
            </span>
          </div>

          <!-- Botón para abrir el modal de creación de un nuevo servicio -->
          <button
            v-if="quantityServices < LIMIT"
            @click="openCreateModal"
            type="button"
            :disabled="disabled"
            :class="
              !disabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
            "
            class="px-4 py-2 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <font-awesome-icon icon="plus" class="text-xs" /> Nuevo Servicio
          </button>
        </div>
      </div>

    <!-- Cuadrícula (Grid) que renderiza de forma iterativa cada tarjeta de servicio paginado -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="service in paginatedServices"
        :key="service.id"
        class="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition duration-300 shadow-sm"
      >
        <!-- Sección superior de la tarjeta: Imagen del servicio y etiqueta (badge) de estado -->
        <div class="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
          <img
            :src="service.image"
            :alt="service.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          <!-- Contenedor absoluto para el indicador visual de estado -->
          <div class="absolute top-3 right-3">
            <span
              :class="[
                'px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-md border backdrop-blur-md',
                service.active
                  ? 'bg-slate-900/80 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900/80 text-amber-400 border-amber-500/40',
              ]"
            >
              <!-- Punto indicador con animación si está activo -->
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full shadow-sm',
                  service.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                ]"
              ></span>
              {{ service.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <!-- Sección de contenido textual de la tarjeta (Título y descripción) -->
        <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div class="space-y-1">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ service.title }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {{ service.description }}
            </p>
          </div>

          <!-- Pie de la tarjeta que incluye los botones de control de orden, edición y eliminación -->
          <div
            class="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400"
          >
            <!-- Grupo de botones para cambiar el orden horizontal de los servicios -->
            <div class="flex items-center gap-1">
              <button
                @click="moveUp(service.id!)"
                :disabled="disabled || props.services.findIndex((s) => s.id === service.id) === 0"
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover hacia atrás"
              >
                <font-awesome-icon icon="arrow-left" class="text-[10px]" />
              </button>
              <button
                @click="moveDown(service.id!)"
                :disabled="
                  disabled ||
                  props.services.findIndex((s) => s.id === service.id) === props.services.length - 1
                "
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover hacia adelante"
              >
                <font-awesome-icon icon="arrow-right" class="text-[10px]" />
              </button>
            </div>

            <!-- Grupo de botones para editar o eliminar el servicio específico -->
            <div class="flex items-center gap-1">
              <!-- Botón de edición -->
              <button
                @click="openEditModal(service)"
                type="button"
                :disabled="disabled"
                class="p-1.5 bg-white dark:bg-[#1f2937] text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                :class="
                  !disabled
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer'
                    : 'cursor-not-allowed'
                "
                title="Editar"
              >
                <font-awesome-icon icon="pen-to-square" class="text-xs" />
              </button>
              <!-- Botón de eliminación -->
              <button
                @click="deleteService(service.id)"
                type="button"
                :disabled="disabled"
                class="p-1.5 bg-white dark:bg-[#1f2937] text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                :class="
                  !disabled
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500 cursor-pointer'
                    : 'cursor-not-allowed'
                "
                title="Eliminar"
              >
                <font-awesome-icon icon="trash" class="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje informativo que se muestra condicionalmente si no hay resultados en la búsqueda -->
      <div
        v-if="paginatedServices.length === 0"
        class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
      >
        No se encontraron servicios que coincidan con la búsqueda.
      </div>
    </div>

    <!-- Barra inferior de paginación y control de cantidad de filas por vista -->
    <div
      class="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
    >
      <!-- Texto indicador de elementos mostrados y selector de filas por página -->
      <div class="flex items-center gap-2">
        <span>Showing {{ startIndex }} - {{ endIndex }} of {{ filteredServices.length }}</span>
        <div class="flex items-center gap-1.5 ml-4">
          <span>Rows</span>
          <select
            v-model="rowsPerPage"
            @change="currentPage = 1"
            class="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled
          >
            <option :value="4">4</option>
            <option :value="8">8</option>
            <option :value="12">12</option>
          </select>
        </div>
      </div>

      <!-- Controles de navegación numérica entre páginas -->
      <div class="flex items-center gap-1">
        <!-- Botón para retroceder a la página anterior -->
        <button
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1 || disabled"
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          &lt;
        </button>

        <!-- Bucle iterativo para renderizar cada número de página o puntos suspensivos -->
        <template v-for="(page, index) in displayedPages" :key="index">
          <span
            v-if="page === '...'"
            class="w-7 h-7 flex items-center justify-center text-slate-400 font-bold"
          >
            ...
          </span>
          <button
            v-else
            @click="currentPage = Number(page)"
            type="button"
            :disabled="disabled"
            class="disabled:opacity-40 disabled:cursor-not-allowed"
            :class="[
              'w-7 h-7 flex items-center justify-center rounded-lg font-semibold shadow-sm cursor-pointer transition-all',
              currentPage === page
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
            ]"
          >
            {{ page }}
          </button>
        </template>

        <!-- Botón para avanzar a la página siguiente -->
        <button
          @click="currentPage < totalPages && currentPage++"
          :disabled="currentPage === totalPages || totalPages === 0 || disabled"
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- Componente Modal utilizado para la creación y edición de elementos del catálogo de servicios -->
    <ModalCatalogGalleryService
      v-model:isOpen="isModalOpen"
      :mode="modalMode"
      :serviceData="selectedServiceForEdit"
      @create="handleCreateService"
      @update="handleUpdateService"
    />
  </div>
</template>
