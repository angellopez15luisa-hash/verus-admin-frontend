<script setup lang="ts">
// import { gallery_imagesSchema } from '@/schemas/general-setting.schema'
// import type { GalleryImage, GalleryImageForm } from '@/types/general-setting'
import { imagesServiceSchema } from '@/schemas/general-setting.schema'
import type { ImageService } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
// import { ImageServiceForm } from '../../../types/general-setting';

const props = defineProps<{
  mode: 'create' | 'edit'
  isOpen: boolean
  serviceId: ImageService['service_id']
}>()

const DEFAULT_CAMERA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'

const model = defineModel<ImageService | null>('model', { default: null })

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  create: [item: ImageService]
  update: [id: ImageService['id'], item: ImageService]
}>()

const hasSelectedNewImage = ref<boolean>(false)
const titleInputRef = ref<HTMLInputElement | null>(null)
const currentItemId = ref<ImageService['id'] | null>(null)
const isLoading = ref<boolean>(false)
const imageErrorMsg = ref<string>('')
const originalImage = ref<string>('')

const { handleSubmit, resetForm, errors, setFieldValue, defineField, meta, validate } = useForm({
  validationSchema: toTypedSchema(imagesServiceSchema),
  initialValues: GeneralSettingValue.imagesServiceForm,
})

const [name] = defineField('name')
const [image] = defineField('image')
const [isActive] = defineField('isActive')

const onSubmit = handleSubmit(async (values) => {

  const validationResult = await validate()
  if (!validationResult.valid) return
  isLoading.value = true
  if (props.mode === 'create') {
    const newItem: ImageService = {
      id: Date.now(),
      name: values.name,
      image: values.image,
      isActive: true,
      service_id: props.serviceId,
    }

    emit('create', newItem)
  } else {
    if (currentItemId.value !== null) {
      const updatedItem: ImageService = {
        id: currentItemId.value,
        name: values.name,
        image: values.image,
        isActive: values.isActive,
        service_id: props.serviceId,
      }
      emit('update', currentItemId.value, updatedItem)
    }
  }
  closeModal()
  isLoading.value = false
})

// Sincronizar datos cuando se abre o cambia el modo
watch(
  () => props.isOpen,
  async (value) => {
    if (!value) return

    await nextTick()
    imageErrorMsg.value = ''

    if (props.mode === 'edit' && model.value) {
      currentItemId.value = model.value.id
      hasSelectedNewImage.value = false
      originalImage.value = model.value.image || ''
      resetForm(
        {
          values: {
            name: model.value.name,
            image: model.value.image,
            isActive: model.value.isActive,
          },
        },
        { force: true },
      )
    } else {
      currentItemId.value = null
      hasSelectedNewImage.value = false
      originalImage.value = ''
      resetForm(
        {
          values: {
            ...GeneralSettingValue.imagesServiceForm,
            image: DEFAULT_CAMERA_IMAGE,
            isActive: true,
          },
        },
        { force: true },
      )
    }
    titleInputRef.value?.focus()
  },
)

// Manejar la carga de la imagen local
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        const base64Result = e.target.result as string
        setFieldValue('image', base64Result)
        hasSelectedNewImage.value = true
        imageErrorMsg.value = ''
      }
    }

    reader.readAsDataURL(file)
  }
}

const resetToOriginalImage = () => {
  if (originalImage.value) {
    setFieldValue('image', originalImage.value)
    hasSelectedNewImage.value = false
    imageErrorMsg.value = ''
  }
}

const closeModal = () => {
  emit('update:isOpen', false)
}

// const handleSave = handleSubmit((values) => {
//   // Aquí pones tu lógica para guardar con 'values'
//   console.log('Guardando datos:', values)

//   // Cierra el modal al terminar
//   closeModal()
// })

// Manejador para la tecla Escape aislado solo para este modal
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    // 1. Detiene la propagación del evento de teclado para que no llegue a los modales de atrás
    e.stopImmediatePropagation()
    e.stopPropagation()

    // 2. Cierra únicamente este modal
    closeModal()
  }
}

watch(
  () => props.isOpen,
  (value) => {
    if (value) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
const disabled = computed(
  () =>
    isLoading.value || !meta.value.valid || (props.mode === 'create' && !hasSelectedNewImage.value),
)
</script>

<template>
  <div
    v-if="isOpen"
    tabindex="-1"
    @keydown.escape.stop.prevent="closeModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
    @click.stop="closeModal"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"
      >
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
          {{ mode === 'create' ? 'Agregar Imagen a la Galería' : 'Editar Imagen de la Galería' }}
        </h3>
        <button
          @click.stop="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          type="button"
        >
          <font-awesome-icon icon="xmark" class="text-lg" />
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <!-- Body -->
        <div class="p-6 space-y-5 flex-1 overflow-y-auto">
          <!-- Input Nombre -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Título / Nombre de la Imagen
            </label>
            <input
              ref="titleInputRef"
              type="text"
              v-model="name"
              placeholder="Ej. ISO 9001"
              class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
            />
            <span v-if="errors.name" class="text-red-500 font-semibold text-xs block">
              {{ errors.name }}
            </span>
          </div>

          <!-- Carga de Imagen -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
              >Imagen</label
            >
            <div
              class="flex items-center gap-4 bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl p-3 shadow-sm"
            >
              <div
                class="relative h-20 w-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/60 flex-shrink-0 flex items-center justify-center p-2"
                :class="imageErrorMsg ? 'border-red-500 ring-1 ring-red-500/20' : ''"
              >
                <img
                  v-if="image === DEFAULT_CAMERA_IMAGE"
                  :src="DEFAULT_CAMERA_IMAGE"
                  alt="Vista previa"
                  class="w-8 h-8 opacity-50 object-contain"
                />
                <img
                  v-else
                  :src="image"
                  alt="Vista previa"
                  class="w-full h-full object-cover rounded-md"
                />
                <button
                  v-if="mode === 'edit' && image !== originalImage"
                  type="button"
                  @click.stop="resetToOriginalImage"
                  class="absolute top-1 right-1 bg-slate-900/80 dark:bg-slate-950/85 hover:bg-red-600/90 text-slate-200 hover:text-white p-1 rounded-md transition-all shadow-md cursor-pointer flex items-center justify-center text-[10px]"
                  title="Restablecer imagen original"
                >
                  <font-awesome-icon icon="rotate-left" />
                </button>
              </div>

              <div class="flex-1 space-y-2">
                <label
                  class="flex items-center justify-center px-3 py-2 bg-emerald-50 dark:bg-emerald-600/10 hover:bg-emerald-100 dark:hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <span>Seleccionar archivo</span>
                  <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                </label>
                <p
                  v-if="mode === 'create' && !hasSelectedNewImage && !imageErrorMsg"
                  class="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1"
                >
                  <font-awesome-icon icon="circle-exclamation" />
                  * Debe seleccionar una imagen para continuar.
                </p>
              </div>
            </div>
          </div>

          <!-- Estado Activo / Inactivo -->
          <div v-if="mode === 'edit'" class="flex items-center justify-between pt-2">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Estado Visible
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="isActive" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
              ></div>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/40"
        >
          <button
            @click.stop="closeModal"
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <!-- @click.stop="handleSave" -->
          <button
            type="submit"
            :disabled
            class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ mode === 'create' ? 'Añadir a la Galería' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
