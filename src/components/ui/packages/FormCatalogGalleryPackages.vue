<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import type { CatalogGalleryPackage } from '@/types/general-setting.ts'
import ModalCatalogGalleryPackages from './ModalCatalogGalleryPackages.vue'

// Define las propiedades (props) que recibe este componente principal
const props = defineProps<{
  packages: CatalogGalleryPackage[]
  isEditing: boolean
}>()

// Define los eventos personalizados que este componente puede emitir hacia su componente padre
const emit = defineEmits<{
  create: [pkg: CatalogGalleryPackage]
  update: [id: CatalogGalleryPackage['id'], pkg: CatalogGalleryPackage]
  delete: [id: CatalogGalleryPackage['id']]
  move: [fromIndex: number, toIndex: number]
}>()

const isCurrentDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}
const LIMIT = import.meta.env.VITE_LIMIT_PACKAGES

const searchQuery = ref<string>('')
const selectedStatus = ref<string>('Todos')
const currentPage = ref<number>(1)
const rowsPerPage = ref<number>(4)

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedPackageForEdit = ref<any>(null)

const openCreateModal = () => {
  modalMode.value = 'create'
  isModalOpen.value = true
  selectedPackageForEdit.value = null
}

const openEditModal = (pkg: CatalogGalleryPackage) => {
  modalMode.value = 'edit'
  isModalOpen.value = true
  selectedPackageForEdit.value = pkg
}

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

const handleCreatePackage = (newPackage: CatalogGalleryPackage) => {
  emit('create', newPackage)
}

const handleUpdatePackage = (
  id: CatalogGalleryPackage['id'],
  updatedPackage: CatalogGalleryPackage,
) => {
  emit('update', id, updatedPackage)
}

const disabled = computed(() => !props.isEditing)

const moveUp = (packageId: CatalogGalleryPackage['id']) => {
  const globalIndex = props.packages.findIndex((s) => s.id === packageId)
  if (globalIndex > 0) {
    emit('move', globalIndex, globalIndex - 1)
  }
}

const moveDown = (packageId: CatalogGalleryPackage['id']) => {
  const globalIndex = props.packages.findIndex((s) => s.id === packageId)
  if (globalIndex !== -1 && globalIndex < props.packages.length - 1) {
    emit('move', globalIndex, globalIndex + 1)
  }
}

const deletePackage = async (id: CatalogGalleryPackage['id']) => {
  const dark = isCurrentDarkMode()
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer y el paquete será eliminado.',
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
      text: 'El paquete ha sido borrado exitosamente.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: dark ? '#121824' : '#ffffff',
      color: dark ? '#f8fafc' : '#1e293b',
    })
  }
}

const filteredPackages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = selectedStatus.value

  return props.packages.filter((pkg) => {
    const matchesSearch = !query || pkg.title?.toLowerCase().includes(query)

    let matchesStatus = true
    if (statusFilter !== 'Todos') {
      const isTargetActive = statusFilter === 'Activo'
      matchesStatus = pkg.active === isTargetActive
    }

    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredPackages.value.length / rowsPerPage.value) || 1
})

const paginatedPackages = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + Number(rowsPerPage.value)
  return filteredPackages.value.slice(start, end)
})

const startIndex = computed(() => {
  if (filteredPackages.value.length === 0) return 0
  return (currentPage.value - 1) * Number(rowsPerPage.value) + 1
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * Number(rowsPerPage.value), filteredPackages.value.length)
})

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

watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

const quantityPackages = computed(() => props.packages.length)
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors p-6 space-y-6 relative"
  >
    <!-- Barra superior -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent border-b border-slate-200 dark:border-slate-800/60 pb-6"
    >
      <div>
        <h2 class="text-sm font-bold text-slate-800 dark:text-white">Catálogo de Paquetes</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Filtra, agrega o administra las tarjetas de paquetes de la landing.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
        <div
          v-if="quantityPackages >= LIMIT"
          class="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <font-awesome-icon icon="triangle-exclamation" class="text-xs" />
          <span>El límite es {{ LIMIT }}</span>
        </div>

        <div class="relative w-full sm:w-56">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <font-awesome-icon icon="magnifying-glass" class="text-xs" />
          </span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar paquete..."
            :disabled
            class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

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

        <button
          v-if="quantityPackages < LIMIT"
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
          <font-awesome-icon icon="plus" class="text-xs" /> Nuevo Paquete
        </button>
      </div>
    </div>

    <!-- Cuadrícula de Tarjetas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="pkg in paginatedPackages"
        :key="pkg.id"
        class="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition duration-300 shadow-sm relative"
      >
        <!-- Badge de Estado -->
        <div class="absolute top-3 right-3 z-10">
          <span
            :class="[
              'px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-md border backdrop-blur-md',
              pkg.active
                ? 'bg-slate-900/80 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900/80 text-amber-400 border-amber-500/40',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full shadow-sm',
                pkg.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
              ]"
            ></span>
            {{ pkg.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <!-- Contenido principal -->
        <div class="p-6 flex flex-col items-center text-center space-y-3 flex-1">
          <div
            class="w-12 h-12 rounded-full bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mt-1"
          >
            <!-- Contenedor circular perfecto con flexbox para centrar el icono -->
            <div
              class="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0"
            >
              <i :class="[pkg.icon, 'text-xl']"></i>
            </div>
            <!-- {{ pkg.icon }} -->
          </div>

          <!-- Título principal -->
          <h3 class="text-xs font-bold text-slate-900 dark:text-white px-2 tracking-tight">
            {{ pkg.title || 'Tarjeta de Paquete' }}
          </h3>

          <!-- Nombre específico -->
          <!-- <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2">
            {{ pkg.title }}
          </span> -->

          <!-- Descripción compacta -->
          <p
            class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed px-1"
          >
            {{ pkg.description || 'Espectáculos exclusivos adaptados a tus preferencias.' }}
          </p>

          <!-- Listado dinámico del arreglo pkg.features -->
          <div
            class="w-full pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 text-left"
          >
            <div
              v-for="(feature, index) in pkg.features && pkg.features.length > 0
                ? pkg.features
                : []"
              :key="index"
              class="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
            >
              <span
                class="w-4 h-4 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0"
              >
                <font-awesome-icon icon="check" class="text-[9px]" />
              </span>
              <span class="truncate">{{ feature }}</span>
            </div>
          </div>
        </div>

        <!-- Pie de tarjeta -->
        <div
          class="px-4 py-3 bg-slate-100/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400"
        >
          <div class="flex items-center gap-1">
            <button
              @click="moveUp(pkg.id!)"
              :disabled="disabled || props.packages.findIndex((m) => m.id === pkg.id) === 0"
              type="button"
              class="p-1.5 px-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Mover hacia atrás"
            >
              <font-awesome-icon icon="arrow-left" class="text-[10px]" />
            </button>
            <button
              @click="moveDown(pkg.id!)"
              :disabled="
                disabled ||
                props.packages.findIndex((s) => s.id === pkg.id) === props.packages.length - 1
              "
              type="button"
              class="p-1.5 px-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Mover hacia adelante"
            >
              <font-awesome-icon icon="arrow-right" class="text-[10px]" />
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="openEditModal(pkg)"
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
              @click="deletePackage(pkg.id)"
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

      <div
        v-if="paginatedPackages.length === 0"
        class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
      >
        No se encontraron paquetes que coincidan con la búsqueda.
      </div>
    </div>

    <!-- Paginación -->
    <div
      class="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
    >
      <div class="flex items-center gap-2">
        <span>Showing {{ startIndex }} - {{ endIndex }} of {{ filteredPackages.length }}</span>
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

    <!-- Modal -->
    <ModalCatalogGalleryPackages
      v-model:isOpen="isModalOpen"
      v-model:model="selectedPackageForEdit"
      :mode="modalMode"
      @create="handleCreatePackage"
      @update="handleUpdatePackage"
    />
  </div>
</template>
