<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import type { CatalogGalleryVideo } from '@/types/general-setting.ts'
import ModalCatalogGalleryVideos from './ModalCatalogGalleryVideos.vue'

// Define las propiedades (props) que recibe este componente principal
const props = defineProps<{
  videos: CatalogGalleryVideo[] // Arreglo con la lista de videos del catálogo
  isEditing: boolean // Bandera booleana para deshabilitar controles globalmente si es necesario
}>()

// Define los eventos personalizados que este componente puede emitir hacia su componente padre
const emit = defineEmits<{
  create: [video: CatalogGalleryVideo]
  update: [id: CatalogGalleryVideo['id'], video: CatalogGalleryVideo]
  delete: [id: CatalogGalleryVideo['id']]
  move: [fromIndex: number, toIndex: number]
}>()

const isCurrentDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}

const LIMIT = import.meta.env.VITE_LIMIT_VIDEOS
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
// Variable reactiva para almacenar temporalmente los datos del video seleccionado al momento de editar
const selectedVideoForEdit = ref<any>(null)

// Función para abrir el modal configurado exclusivamente en modo creación
const openCreateModal = () => {
  modalMode.value = 'create'
  isModalOpen.value = true
  selectedVideoForEdit.value = null
}

// Función para abrir el modal en modo edición cargando los datos del video seleccionado
const openEditModal = (video: CatalogGalleryVideo) => {
  modalMode.value = 'edit'
  isModalOpen.value = true
  selectedVideoForEdit.value = video
}

// Observador (watch) que vigila la propiedad 'isEditing'; si se desactiva, reinicia los filtros y la paginación
watch(
  () => props.isEditing,
  (newDisabled) => {
    if (!newDisabled) {
      currentPage.value = 1
      rowsPerPage.value = 4
      searchQuery.value = ''
      selectedStatus.value = 'Todos'
    }
  },
)

const handleCreateVideo = (newVideo: CatalogGalleryVideo) => {
  emit('create', newVideo)
}

const handleUpdateVideo = (id: CatalogGalleryVideo['id'], updatedVideo: CatalogGalleryVideo) => {
  emit('update', id, updatedVideo)
}

const disabled = computed(() => !props.isEditing)

// Función para mover un video una posición hacia atrás (arriba/izquierda) en el orden general
const moveUp = (videoId: CatalogGalleryVideo['id']) => {
  const globalIndex = props.videos.findIndex((s) => s.id === videoId)
  if (globalIndex > 0) {
    emit('move', globalIndex, globalIndex - 1)
  }
}

// Función para mover un video una posición hacia adelante (abajo/derecha) en el orden general
const moveDown = (videoId: CatalogGalleryVideo['id']) => {
  const globalIndex = props.videos.findIndex((s) => s.id === videoId)
  if (globalIndex !== -1 && globalIndex < props.videos.length - 1) {
    emit('move', globalIndex, globalIndex + 1)
  }
}

// Función asíncrona para manejar la eliminación de un video mediante una alerta de confirmación (SweetAlert2)
const deleteVideo = async (id: CatalogGalleryVideo['id']) => {
  const dark = isCurrentDarkMode()
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer y el video será eliminado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: dark ? '#121824' : '#ffffff',
    color: dark ? '#f8fafc' : '#1e293b',
  })

  if (result.isConfirmed) {
    emit('delete', id)
    Swal.fire({
      title: '¡Eliminado!',
      text: 'El video ha sido borrado exitosamente.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: dark ? '#121824' : '#ffffff',
      color: dark ? '#f8fafc' : '#1e293b',
    })
  }
}

// Propiedad computada que filtra la lista de videos según el texto de búsqueda y estado seleccionado
const filteredVideos = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = selectedStatus.value

  return props.videos.filter((video) => {
    const matchesSearch = !query || video.title?.toLowerCase().includes(query)

    let matchesStatus = true
    if (statusFilter !== 'Todos') {
      const isTargetActive = statusFilter === 'Activo'
      matchesStatus = video.active === isTargetActive
    }

    return matchesSearch && matchesStatus
  })
})

// Propiedad computada que calcula el número total de páginas disponibles basado en los elementos filtrados
const totalPages = computed(() => {
  return Math.ceil(filteredVideos.value.length / rowsPerPage.value) || 1
})

// Propiedad computada que corta el arreglo de videos filtrados para mostrar únicamente los elementos de la página actual
const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + Number(rowsPerPage.value)
  return filteredVideos.value.slice(start, end)
})

// Propiedad computada para obtener el número de índice inicial que se muestra en el texto de paginación
const startIndex = computed(() => {
  if (filteredVideos.value.length === 0) return 0
  return (currentPage.value - 1) * Number(rowsPerPage.value) + 1
})

// Propiedad computada para obtener el número de índice final que se muestra en el texto de paginación
const endIndex = computed(() => {
  return Math.min(currentPage.value * Number(rowsPerPage.value), filteredVideos.value.length)
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

// Observador múltiple que reinicia la página actual a 1 cada vez que cambia el texto de búsqueda o estado
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

const quantityVideos = computed(() => props.videos.length)
</script>

<template>
  <!-- Contenedor principal del componente -->
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors p-6 space-y-6 relative"
  >
    <!-- Barra superior que contiene el título, descripción, buscador, filtros y botón de agregar -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent border-b border-slate-200 dark:border-slate-800/60 pb-6"
    >
      <div>
        <h2 class="text-sm font-bold text-slate-800 dark:text-white">Catálogo de Videos</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Filtra, agrega o administra las tarjetas de videos de la landing.
        </p>
      </div>

      <!-- Controles interactivos de la barra superior -->
      <div class="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
        <div
          v-if="quantityVideos >= LIMIT"
          class="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <font-awesome-icon icon="triangle-exclamation" class="text-xs" />
          <span>El límite es {{ LIMIT }}</span>
        </div>
        <!-- Buscador -->
        <div class="relative w-full sm:w-56">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <font-awesome-icon icon="magnifying-glass" class="text-xs" />
          </span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar video..."
            :disabled
            class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Filtro por estado -->
        <div class="relative w-full sm:w-40">
          <select
            v-model="selectedStatus"
            :disabled
            class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <span
            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none"
          >
            <font-awesome-icon icon="chevron-down" class="text-xs" />
          </span>
        </div>

        <!-- Botón para abrir el modal de creación de un nuevo video -->
        <button
          v-if="quantityVideos < LIMIT"
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
          <font-awesome-icon icon="plus" class="text-xs" /> Nuevo Video
        </button>
      </div>
    </div>

    <!-- Cuadrícula (Grid) que renderiza cada tarjeta de video paginado -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="video in paginatedVideos"
        :key="video.id"
        class="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition duration-300 shadow-sm"
      >
        <!-- Sección superior de la tarjeta: Reproductor nativo de video del hosting -->
        <!-- Sección superior de la tarjeta: Reproductor nativo de video del hosting -->
        <div
          class="relative h-44 w-full overflow-hidden bg-slate-900 flex items-center justify-center"
        >
          <video
            v-if="video.videoUrl"
            :src="video.videoUrl"
            class="w-full h-full object-cover"
            preload="metadata"
            controls
          ></video>
          <div v-else class="text-slate-500 text-xs flex items-center justify-center h-full">
            Sin URL de video
          </div>

          <!-- 👇 PÉGLALO AQUÍ: Muestra la URL guardada de forma flotante en la esquina inferior -->
          <span
            v-if="video.videoUrl"
            class="absolute bottom-2 left-2 text-[11px] text-white/80 bg-black/60 px-2 py-0.5 rounded truncate max-w-[90%] backdrop-blur-sm pointer-events-none z-10"
          >
            {{ video.videoUrl }}
          </span>

          <!-- Indicador visual de estado (Activo/Inactivo) -->
          <div class="absolute top-3 right-3 z-10 pointer-events-none">
            <span
              :class="[
                'px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-md border backdrop-blur-md',
                video.active
                  ? 'bg-slate-900/80 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900/80 text-amber-400 border-amber-500/40',
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full shadow-sm',
                  video.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                ]"
              ></span>
              {{ video.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
        <!-- Sección de contenido textual de la tarjeta (Título) -->
        <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div class="space-y-1">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
              {{ video.title }}
            </h3>
          </div>

          <!-- Pie de la tarjeta: Botones de control de orden, edición y eliminación -->
          <div
            class="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400"
          >
            <!-- Mover orden -->
            <div class="flex items-center gap-1">
              <button
                @click="moveUp(video.id!)"
                :disabled="disabled || props.videos.findIndex((m) => m.id === video.id) === 0"
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover hacia atrás"
              >
                <font-awesome-icon icon="arrow-left" class="text-[10px]" />
              </button>
              <button
                @click="moveDown(video.id!)"
                :disabled="
                  disabled ||
                  props.videos.findIndex((s) => s.id === video.id) === props.videos.length - 1
                "
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Mover hacia adelante"
              >
                <font-awesome-icon icon="arrow-right" class="text-[10px]" />
              </button>
            </div>

            <!-- Editar / Eliminar -->
            <div class="flex items-center gap-1">
              <button
                @click="openEditModal(video)"
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
              <button
                @click="deleteVideo(video.id)"
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

      <!-- Mensaje si no hay resultados -->
      <div
        v-if="paginatedVideos.length === 0"
        class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
      >
        No se encontraron videos que coincidan con la búsqueda.
      </div>
    </div>

    <!-- Paginación -->
    <div
      class="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
    >
      <div class="flex items-center gap-2">
        <span>Showing {{ startIndex }} - {{ endIndex }} of {{ filteredVideos.length }}</span>
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

      <div class="flex items-center gap-1">
        <button
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1 || disabled"
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          &lt;
        </button>

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

    <!-- Modal para creación y edición de videos -->
    <ModalCatalogGalleryVideos
      v-model:isOpen="isModalOpen"
      v-model:model="selectedVideoForEdit"
      :mode="modalMode"
      @create="handleCreateVideo"
      @update="handleUpdateVideo"
    />
  </div>
</template>
