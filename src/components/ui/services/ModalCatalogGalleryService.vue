<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useForm, configure } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { generalSettingCatalogGalleryServiceSchema } from '@/schemas/general-setting.schema'
import type { CatalogGalleryServiceT } from '@/types/general-setting'

// Configura las reglas globales de validación para VeeValidate
configure({
  validateOnBlur: false,
  validateOnChange: true,
  validateOnInput: true,
})

// Define las propiedades que recibe el componente
const props = defineProps<{
  isOpen: boolean
  mode: 'create' | 'edit'
  serviceData?: CatalogGalleryServiceT | null
}>()

// Define los eventos que el componente puede emitir hacia el componente padre
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'create', service: CatalogGalleryServiceT): void
  (e: 'update', id: number, service: CatalogGalleryServiceT): void
}>()

// Referencia local para manipular directamente el input del título (focus)
const titleInputRef = ref<HTMLInputElement | null>(null)
// Almacena temporalmente el ID del servicio actual cuando se encuentra en modo edición
const currentServiceId = ref<number | null>(null)

const isLoading = ref<boolean>(false)

// Inicializa el hook useForm de VeeValidate y extrae defineField
const { handleSubmit, resetForm, errors, setValues, setFieldValue, defineField } = useForm({
  validationSchema: toTypedSchema(generalSettingCatalogGalleryServiceSchema),
  initialValues: {
    title: '',
    description: '',
    active: true,
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&auto=format&fit=crop',
  },
})

// Define los campos de manera limpia usando defineField (Tuplas: [valor, error])
const [formTitle, formTitleAttrs] = defineField('title')
const [formDescription, formDescriptionAttrs] = defineField('description')
const [formActive, formActiveAttrs] = defineField('active')
const [formImage] = defineField('image')

// Observa cambios en la propiedad isOpen para resetear, cargar datos o enfocar el input
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      // Espera a que el DOM monte los elementos del modal primero
      await nextTick()

      if (props.mode === 'edit' && props.serviceData) {
        currentServiceId.value = props.serviceData.id
        setValues({
          title: props.serviceData.title || '',
          description: props.serviceData.description || '',
          active: !!props.serviceData.active,
          image: props.serviceData.image || '',
        })
      } else {
        currentServiceId.value = null
        resetForm({
          values: {
            title: '',
            description: '',
            active: true,
            image:
              'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&auto=format&fit=crop',
          },
        })
      }

      // Coloca el foco automáticamente en el input del título
      titleInputRef.value?.focus()
    }
    // await validate()
  },
)

// Cierra el modal emitiendo el evento para cambiar el estado de isOpen a falso
const closeModal = () => {
  emit('update:isOpen', false)
}

// Maneja la selección de archivos locales convirtiéndolos a Base64
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        const base64Result = e.target.result as string
        setFieldValue('image', base64Result)
      }
    }

    reader.readAsDataURL(file)
  }
}

// Gestiona el envío del formulario validado; emite 'create' o 'update' según corresponda
const onSubmit = handleSubmit((values) => {
  const isActiveBoolean = values.active
  isLoading.value = true
  if (props.mode === 'create') {
    const newService = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      active: isActiveBoolean,
      image: values.image,
    }
    emit('create', newService)
  } else {
    if (currentServiceId.value !== null) {
      const updatedService = {
        id: currentServiceId.value,
        title: values.title,
        description: values.description,
        active: isActiveBoolean,
        image: values.image || '',
      }
      emit('update', currentServiceId.value, updatedService)
    }
  }
  closeModal()
  isLoading.value = false
})

// const disabled2 = computed(() => !meta.value.valid || isLoading.value)
const isModalDisabled = computed(() => {
  // 1. Si está cargando, deshabilitado.
  if (isLoading.value) return true

  // 2. Si los campos obligatorios están vacíos al inicio (modo create), deshabilitado por defecto.
  if (!formTitle.value || !formDescription.value) return true

  // 3. Si hay errores activos reportados por el esquema de Zod/VeeValidate, deshabilitado.
  const hasErrors = Object.keys(errors.value).length > 0

  return hasErrors
})
</script>

<template>
  <!-- Contenedor principal del modal que se muestra solo si isOpen es verdadero -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
  >
    <!-- Tarjeta central del modal -->
    <div
      class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
    >
      <!-- Cabecera del modal con título dinámico y botón de cierre -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
      >
        <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {{ mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio' }}
        </h3>
        <button
          type="button"
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1"
        >
          <font-awesome-icon icon="xmark" class="text-sm" />
        </button>
      </div>

      <!-- Formulario que intercepta el evento submit para validación -->
      <form @submit.prevent="onSubmit">
        <div class="p-6 space-y-4">
          <!-- Campo: Título del servicio -->
          <!-- Campo: Título del servicio -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Título del Servicio
            </label>
            <input
              ref="titleInputRef"
              type="text"
              v-model="formTitle"
              v-bind="formTitleAttrs"
              placeholder="Ej. Shows Privados Exclusivos"
              class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm"
              :class="errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'"
            />
            <!-- Aquí imprimimos el texto del error de forma limpia -->
            <span v-if="errors.title" class="text-red-500 font-medium text-xs mt-1 block">
              {{ errors.title }}
            </span>
          </div>

          <!-- Campo: Descripción del servicio -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Descripción
            </label>
            <textarea
              v-model="formDescription"
              v-bind="formDescriptionAttrs"
              rows="3"
              placeholder="Escribe los detalles del servicio..."
              class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
              :class="
                errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/60'
              "
            ></textarea>
            <!-- Aquí imprimimos el texto del error de descripción -->
            <span v-if="errors.description" class="text-red-500 font-medium text-xs mt-1 block">
              {{ errors.description }}
            </span>
          </div>

          <!-- Campo: Estado (Activo / Inactivo) -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Estado
            </label>
            <div class="relative">
              <select
                v-model="formActive"
                v-bind="formActiveAttrs"
                class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer shadow-sm"
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
              <span
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none"
              >
                <font-awesome-icon icon="chevron-down" class="text-xs" />
              </span>
            </div>
          </div>

          <!-- Sección: Imagen del servicio y selector de archivos -->
          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
            >
              Imagen del Servicio
            </label>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <!-- Vista previa de la imagen actual -->
              <div
                class="relative h-28 w-full sm:w-44 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 flex-shrink-0 shadow-sm"
              >
                <img :src="formImage" alt="Vista previa" class="w-full h-full object-cover" />
              </div>

              <!-- Botón personalizado para subir archivos locales -->
              <div class="flex-1 w-full space-y-2">
                <label
                  class="flex items-center justify-center px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <span>Seleccionar archivo</span>
                  <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
        <!-- Pie del modal con acciones de cancelar o confirmar -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
        >
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isModalDisabled"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
