<script setup lang="ts">
import type { ContentItemsTrust } from '@/types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  isEditing: boolean
  // itemsTrustList:ContentItemsTrust[]
}>()
const emit = defineEmits<{
  move: [fromIndex: number, toIndex: number]
  'open-create-modal': []
  'open-edit-modal': [item: ContentItemsTrust]
  delete: [id: ContentItemsTrust['id']]
}>()
const itemsTrustList = defineModel<ContentItemsTrust[]>('itemsTrustList', { required: true })

const searchQuery = ref<string>('')
const selectedStatus = ref<string>('Todos')
const currentPage = ref<number>(1)
const rowsPerPage = ref<number>(4)

// const isModalOpen = ref(false)
// const modalMode = ref<'create' | 'edit'>('create')
// const selectedTrustForEdit = ref<ContentItemsTrust | null>(null)

watch(
  () => props.isEditing,
  (value) => {
    if (!value) {
      currentPage.value = 1
      rowsPerPage.value = 4
      searchQuery.value = ''
      selectedStatus.value = 'Todos'
    }
  },
)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = selectedStatus.value

  return itemsTrustList.value.filter((item) => {
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)

    let matchesStatus = true
    if (statusFilter !== 'Todos') {
      const isTargetActive = statusFilter === 'Activo'
      matchesStatus = item.isActive === isTargetActive
    }

    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / rowsPerPage.value) || 1
})
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + Number(rowsPerPage.value)
  return filteredItems.value.slice(start, end)
})

const startIndex = computed(() => {
  if (filteredItems.value.length === 0) return 0
  return (currentPage.value - 1) * Number(rowsPerPage.value) + 1
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * Number(rowsPerPage.value), filteredItems.value.length)
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

const moveUp = (itemId: ContentItemsTrust['id']) => {
  const index = itemsTrustList.value.findIndex((s) => s.id === itemId)
  if (index !== -1) {
    const targetIndex = index === 0 ? itemsTrustList.value.length - 1 : index - 1
    emit('move', index, targetIndex)
  }
}

const moveDown = (itemId: ContentItemsTrust['id']) => {
  const index = itemsTrustList.value.findIndex((s) => s.id === itemId)
  if (index !== -1) {
    const targetIndex = index === itemsTrustList.value.length - 1 ? 0 : index + 1
    emit('move', index, targetIndex)
  }
}

const disabled = computed(() => !props.isEditing)
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
        <h2 class="text-sm font-bold text-slate-800 dark:text-white">Catálogo de Servicios</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Filtra, agrega o administra las tarjetas de servicios de la landing.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <font-awesome-icon icon="magnifying-glass" class="text-xs" />
          </span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar servicio..."
            :disabled="disabled"
            class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <div class="relative w-full sm:w-44">
          <select
            v-model="selectedStatus"
            :disabled="disabled"
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
          type="button"
          @click="emit('open-create-modal')"
          :disabled="disabled"
          :class="
            !disabled
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
          "
          class="px-4 py-2 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <font-awesome-icon icon="plus" class="text-xs" /> Nuevo Item
        </button>
      </div>
    </div>

    <!-- Cuadrícula (Grid) de tarjetas mejoradas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in paginatedItems"
        :key="item.id"
        class="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition duration-300 shadow-sm"
      >
        <!-- Imagen y Estado -->
        <div class="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          <div class="absolute top-3 right-3">
            <span
              :class="[
                'px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-md border backdrop-blur-md',
                item.isActive
                  ? 'bg-slate-900/80 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900/80 text-amber-400 border-amber-500/40',
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full shadow-sm',
                  item.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                ]"
              ></span>
              {{ item.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <!-- Contenido Textual con Título, Subtítulo y Descripción al estilo Landing -->
        <!-- Contenido Textual con Título, Subtítulo y Descripción con puntos suspensivos -->
        <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div class="space-y-2">
            <!-- Fila superior: Título principal + Subtítulo -->
            <div class="flex items-baseline justify-between gap-2">
              <h3
                class="text-xs font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wide line-clamp-1"
              >
                {{ item.title }}
              </h3>
              <span
                class="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
              >
                {{ item.subtitle }}
              </span>
            </div>

            <!-- Descripción con corte automático en puntos suspensivos si es muy larga -->
            <p
              class="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 overflow-hidden text-ellipsis leading-relaxed"
            >
              {{ item.description }}
            </p>
          </div>

          <!-- Pie de tarjeta -->
          <div
            class="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400"
          >
            <!-- Botones de orden -->
            <div class="flex items-center gap-1">
              <button
                @click="moveUp(item.id)"
                :disabled
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-lg"
                title="Mover hacia atrás"
              >
                <font-awesome-icon icon="arrow-left" class="text-[10px]" />
              </button>
              <button
                @click="moveDown(item.id)"
                :disabled
                type="button"
                class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-lg"
                title="Mover hacia adelante"
              >
                <font-awesome-icon icon="arrow-right" class="text-[10px]" />
              </button>
            </div>

            <!-- Botones de editar / eliminar -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="emit('open-edit-modal', item)"
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
                type="button"
                @click="emit('delete', item.id)"
                :disabled
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
        v-if="paginatedItems.length === 0"
        class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
      >
        No se encontraron servicios que coincidan con la búsqueda.
      </div>
    </div>

    <!-- Paginación inferior -->
    <div
      class="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
    >
      <div class="flex items-center gap-2">
        <span>Showing {{ startIndex }} - {{ endIndex }} of {{ filteredItems.length }}</span>
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
  </div>
</template>
