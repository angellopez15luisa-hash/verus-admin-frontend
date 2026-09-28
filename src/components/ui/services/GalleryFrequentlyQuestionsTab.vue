<script setup lang="ts">
import type { ContentFrequentlyQuestion } from '@/types/general-setting'
import { computed, ref, watch } from 'vue'
import ModalGalleryFrequentlyQuestionsTab from './ModalGalleryFrequentlyQuestionsTab.vue'

const props = defineProps<{
  questionList: ContentFrequentlyQuestion[]
  serviceId: ContentFrequentlyQuestion['service_id']
}>()

const emit = defineEmits<{
  move: [fromIndex: number, toIndex: number]
  create: [item: ContentFrequentlyQuestion]
  update: [id: ContentFrequentlyQuestion['id'], item: ContentFrequentlyQuestion]
  delete: [id: ContentFrequentlyQuestion['id']]
}>()

const isOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedItemForEdit = ref<ContentFrequentlyQuestion | null>(null)
const searchQuery = ref<string>('')
const selectedStatus = ref<string>('Todos')
const currentPage = ref<number>(1)
const rowsPerPage = ref<number>(4)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = selectedStatus.value

  return props.questionList.filter((item) => {
    const matchesSearch =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)

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

const moveUp = (itemId: ContentFrequentlyQuestion['id']) => {
  const index = props.questionList.findIndex((s) => s.id == itemId)
  if (index !== -1) {
    const targetIndex = index === 0 ? props.questionList.length - 1 : index - 1
    emit('move', index, targetIndex)
  }
}

const moveDown = (itemId: ContentFrequentlyQuestion['id']) => {
  const index = props.questionList.findIndex((s) => s.id == itemId)
  if (index !== -1) {
    const targetIndex = index === props.questionList.length - 1 ? 0 : index + 1
    emit('move', index, targetIndex)
  }
}

const openEditModal = (item: ContentFrequentlyQuestion) => {
  modalMode.value = 'edit'
  isOpen.value = true
  selectedItemForEdit.value = { ...item }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  isOpen.value = true
  selectedItemForEdit.value = {} as ContentFrequentlyQuestion
}
</script>
<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors p-6 space-y-6 relative"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent border-b border-slate-200 dark:border-slate-800/60 pb-6"
    >
      <div>
        <h2 class="text-sm font-bold text-slate-800 dark:text-white">
          Catálogo de Preguntas frecuentes
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Filtra, agrega o administra las preguntas.
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
            :disabled="false"
            class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <div class="relative w-full sm:w-44">
          <!-- :disabled="imagesList.length < 3" -->
          <select
            v-model="selectedStatus"
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

        <!-- :disabled="imagesList.length < 3" -->
        <!-- :class="
            (!(imagesList.length < 3))
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
          " -->
        <button
          @click="openCreateModal"
          type="button"
          class="px-4 py-2 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
        >
          <font-awesome-icon icon="plus" class="text-xs" /> Nuevo Item
        </button>
      </div>
    </div>
    <div
      v-if="questionList.length < 3"
      class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2"
    >
      <font-awesome-icon icon="triangle-exclamation" />
      <span>* Debes agregar al menos 3 elementos a la lista de imágenes.</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in paginatedItems"
        :key="item.id"
        class="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition duration-300 shadow-sm relative"
      >
        <div class="absolute top-3 right-3 z-10">
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

        <div class="p-6 flex flex-col items-start text-left w-full mt-10 space-y-3 flex-1">
          <!-- Título principal -->
          <h3 class="text-xs font-bold text-slate-900 dark:text-white px-2 tracking-tight w-full">
            {{ item.question || 'Tarjeta de Paquete' }}
          </h3>

          <!-- Descripción compacta -->
          <p
            class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed px-1 w-full"
          >
            {{ item.answer || 'Espectáculos exclusivos adaptados a tus preferencias.' }}
          </p>
        </div>

        <div
          class="px-4 py-3 bg-slate-100/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400"
        >
          <div class="flex items-center gap-1">
            <button
              @click="moveUp(item.id)"
              type="button"
              class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-lg"
              title="Mover hacia atrás"
            >
              <font-awesome-icon icon="arrow-left" class="text-[10px]" />
            </button>
            <button
              @click="moveDown(item.id)"
              type="button"
              class="p-1.5 px-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-lg"
              title="Mover hacia adelante"
            >
              <font-awesome-icon icon="arrow-right" class="text-[10px]" />
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- :disabled="disabled" -->
            <button
              @click="openEditModal(item)"
              type="button"
              class="p-1.5 bg-white dark:bg-[#1f2937] text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Editar"
            >
              <font-awesome-icon icon="pen-to-square" class="text-xs" />
            </button>
            <button
              @click="emit('delete', item.id)"
              type="button"
              class="p-1.5 bg-white dark:bg-[#1f2937] text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500 cursor-pointer"
              title="Eliminar"
            >
              <font-awesome-icon icon="trash" class="text-xs" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="paginatedItems.length === 0"
        class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs"
      >
        No se encontraron servicios que coincidan con la búsqueda.
      </div>
    </div>

    <div
      class="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
    >
      <div class="flex items-center gap-2">
        <span>Showing {{ startIndex }} - {{ endIndex }} of {{ filteredItems.length }}</span>
        <div class="flex items-center gap-1.5 ml-4">
          <span>Rows</span>
          <!-- :disabled="imagesList.length < 3" -->
          <select
            v-model="rowsPerPage"
            @change="currentPage = 1"
            class="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          :disabled="currentPage === 1"
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
          <!-- :disabled="imagesList.length < 3" -->
          <button
            v-else
            @click="currentPage = Number(page)"
            type="button"
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
          :disabled="currentPage === totalPages || totalPages === 0"
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
  <ModalGalleryFrequentlyQuestionsTab
    v-model:isOpen="isOpen"
    v-model:model="selectedItemForEdit"
    :serviceId
    :mode="modalMode"
    @create="(item) => emit('create', item)"
    @update="(id, item) => emit('update', id, item)"
  />
</template>
