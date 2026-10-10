<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import { serviceSchema } from '@/schemas'
import type { ContentFrequentlyQuestion, ImageService, Service } from '@/types/general-setting'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, watch } from 'vue'
import { GeneralSettingValue } from '@/values'
import ModalGalleryIcon from './ModalGalleryIcon.vue'
import GalleryImagesTab from './GalleryImagesTab.vue'
import GalleryFrequentlyQuestionsTab from './GalleryFrequentlyQuestionsTab.vue'

const props = defineProps<{
  mode: 'create' | 'edit'
  imagesList: ImageService[]
  questionList: ContentFrequentlyQuestion[]
}>()

const DEFAULT_CAMERA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<Service>('model')
// Un estado local temporal para el modal
const localImages = ref<ImageService[]>([])
const localQuestions = ref<ContentFrequentlyQuestion[]>([])
const tempServiceId = ref(Date.now())

// const imageServiceList = defineModel<ImageService[]>('imageServiceList', { default: () => [] })
// const imagesServiceFiltered = ref<ImageService[]>([])
const isOpenModal = ref(false)

// const galleryImageList = ref<GalleryImage[]>([])
// const galleryImageBackup = ref<GalleryImage[]>([])

// Estado para controlar la pestaña activa ('main' o 'gallery')
const activeTab = ref<
  'main' | 'gallery' | 'which-includes' | 'specific-process' | 'frequemtly-questions'
>('main')

// Estado y filtros para la galería de imágenes estilo catálogo
// const galleryImages = ref<GalleryItem[]>([])
// const gallerySearchQuery = ref('')
// const galleryStatusFilter = ref('all') // 'all' | 'active' | 'inactive'

const emit = defineEmits<{
  close: []
  save: []
  create: [item: Service]
  update: [id: Service['id'], item: Service]
  // delete: [id: ImageService['id']]
  'save-images': [items: ImageService[], serviceId: ImageService['service_id']]
  'save-question': [
    items: ContentFrequentlyQuestion[],
    serviceId: ContentFrequentlyQuestion['service_id'],
  ]
}>()

const hasSelectedNewImage = ref<boolean>(false)
const imageErrorMsg = ref<string>('')
const titleInputRef = ref<HTMLInputElement | null>(null)
const currentItemId = ref<Service['id'] | null>(null)
const isLoading = ref<boolean>(false)
const originalImage = ref<string>('')
const originalIcon = ref<string>('')
const isInitializing = ref<boolean>(false)
let quillInstance: any = null
let quillWhichIncludesInstance: any = null
let quillSpecificProcessInstance: any = null

const { handleSubmit, resetForm, errors, setFieldValue, defineField, meta, validate } = useForm({
  validationSchema: toTypedSchema(serviceSchema),
  initialValues: GeneralSettingValue.serviceForm,
})

const [title] = defineField('title')
const [text_short] = defineField('text_short')
const [description_short] = defineField('description_short')
const [description_long] = defineField('description_long')
const [image] = defineField('image')
const [video] = defineField('video')
const [slug] = defineField('slug')
const [icon_risk] = defineField('icon_risk')
const [title_risk] = defineField('title_risk')
const [description_risk] = defineField('description_risk')
const [isActive] = defineField('isActive')
const [which_includes] = defineField('which_includes')
const [specific_process] = defineField('specific_process')

const onQuillReady = (quill: any) => {
  quillInstance = quill
}
const onQuillWhichIncludesReady = (quill: any) => {
  quillWhichIncludesInstance = quill
}
const onQuillSpecificProcessReady = (quill: any) => {
  quillSpecificProcessInstance = quill
}

const setEditorContent = (htmlText: any) => {
  if (quillInstance) {
    quillInstance.root.innerHTML = htmlText
  }
}

const setEditorContentWhichIncludes = (htmlText: any) => {
  if (quillWhichIncludesInstance) {
    quillWhichIncludesInstance.root.innerHTML = htmlText
  }
}
const setEditorContentSpecificProcess = (htmlText: any) => {
  if (quillSpecificProcessInstance) {
    quillSpecificProcessInstance.root.innerHTML = htmlText
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

defineExpose({
  setEditorContent,
  setEditorContentWhichIncludes,
  setEditorContentSpecificProcess,
})

const serviceIdToUse = computed(() => {
  return props.mode === 'edit' && model.value?.id ? model.value?.id : tempServiceId.value // o el Date.now() que uses para crear
})

// watch(() => props.imagesList, (newImages) => {
//   if (newImages) {
//     // Clonas el arreglo real de imágenes para manipularlo de forma segura localmente
//     localImages.value = JSON.parse(JSON.stringify(newImages))
//   }
// }, { immediate: true })

watch(
  () => isOpen.value,
  async (openVal) => {
    if (!openVal) {
      window.removeEventListener('keydown', handleKeyDown)
      return
    }

    window.addEventListener('keydown', handleKeyDown)
    isInitializing.value = true
    imageErrorMsg.value = ''
    activeTab.value = 'main'
    // gallerySearchQuery.value = ''
    // galleryStatusFilter.value = 'all'

    if (props.mode === 'edit' && model.value) {
      currentItemId.value = model.value.id
      hasSelectedNewImage.value = false
      originalImage.value = model.value.image || ''
      originalIcon.value = model.value.icon_risk || ''

      localImages.value = JSON.parse(JSON.stringify(props.imagesList || []))

      localQuestions.value = JSON.parse(JSON.stringify(props.questionList || []))

      resetForm(
        {
          values: {
            ...model.value,
          },
        },
        { force: true },
      )
    } else {
      currentItemId.value = null
      hasSelectedNewImage.value = false
      originalImage.value = ''
      originalIcon.value = ''
      localImages.value = []
      localQuestions.value = []
      // galleryImages.value = []
      resetForm(
        {
          values: {
            ...GeneralSettingValue.serviceForm,
            image: DEFAULT_CAMERA_IMAGE,
          },
        },
        { force: true },
      )
    }

    await nextTick()

    if (quillInstance) {
      quillInstance.root.innerHTML = model.value?.description_long || ''
    }
    if (quillWhichIncludesInstance) {
      quillWhichIncludesInstance.root.innerHTML = model.value?.which_includes || ''
    }
    if (quillSpecificProcessInstance) {
      quillSpecificProcessInstance.root.innerHTML = model.value?.specific_process || ''
    }

    setTimeout(() => {
      isInitializing.value = false
      titleInputRef.value?.focus()
    }, 150)
  },
)

const generateSlug = (text: string) => {
  if (!text) return ''
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

watch(title, (newTitle) => {
  if (isInitializing.value) return

  if (!newTitle) {
    setFieldValue('slug', '')
    return
  }

  setFieldValue('slug', generateSlug(newTitle))
})

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

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

const resetToOriginalIcon = () => {
  if (originalIcon.value) {
    icon_risk.value = originalIcon.value
  }
}

const handleTextChange = () => {
  if (isInitializing.value) return

  if (!description_long.value) {
    setFieldValue('description_long', '')
    return
  }

  const stripped = String(description_long.value)
    .replace(/<(.|\n)*?>/g, '')
    .trim()
  if (stripped === '') {
    setFieldValue('description_long', '')
  } else {
    setFieldValue('description_long', description_long.value)
  }
}

const handleSpecificProcessChange = () => {
  if (isInitializing.value) return

  if (!specific_process.value) {
    setFieldValue('specific_process', '')
    return
  }

  const stripped = String(specific_process.value)
    .replace(/<(.|\n)*?>/g, '')
    .trim()
  if (stripped === '') {
    setFieldValue('specific_process', '')
  } else {
    setFieldValue('specific_process', specific_process.value)
  }
}

const handleWhichIncludesChange = () => {
  if (isInitializing.value) return

  if (!which_includes.value) {
    setFieldValue('which_includes', '')
    return
  }

  const stripped = String(which_includes.value)
    .replace(/<(.|\n)*?>/g, '')
    .trim()
  if (stripped === '') {
    setFieldValue('which_includes', '')
  } else {
    setFieldValue('which_includes', which_includes.value)
  }
}

const disabled = computed(
  () =>
    isLoading.value || !meta.value.valid || (props.mode === 'create' && !hasSelectedNewImage.value),
)

const onSubmit = handleSubmit(async (values) => {
  const validationResult = await validate()
  if (!validationResult) return
  isLoading.value = true

  const finalImagesToSave = localImages.value.map((img) => ({
    ...img,
    service_id: serviceIdToUse.value,
  }))
  const finalQuestionToSave = localQuestions.value.map((item) => ({
    ...item,
    service_id: serviceIdToUse.value,
  }))
  if (props.mode === 'create') {
    // const newServiceId = Date.now()

    const newItem: Service = {
      id: serviceIdToUse.value,
      title: values.title,
      text_short: values.text_short,
      description_short: values.description_short,
      description_long: values.description_long,
      image: values.image,
      video: values.video,
      slug: values.slug,
      icon_risk: values.icon_risk,
      title_risk: values.title_risk,
      description_risk: values.description_risk,
      isActive: true,
      which_includes: values.which_includes,
      specific_process: values.specific_process,
    }
    emit('create', newItem)
  } else if (currentItemId.value !== null) {
    const updateItem: Service = {
      id: serviceIdToUse.value,
      title: values.title,
      text_short: values.text_short,
      description_short: values.description_short,
      description_long: values.description_long,
      image: values.image,
      video: values.video,
      slug: values.slug,
      icon_risk: values.icon_risk,
      title_risk: values.title_risk,
      description_risk: values.description_risk,
      isActive: values.isActive ?? true,
      which_includes: values.which_includes,
      specific_process: values.specific_process,
    }

    emit('update', currentItemId.value, updateItem)
  }

  emit('save-images', finalImagesToSave, serviceIdToUse.value)
  emit('save-question', finalQuestionToSave, serviceIdToUse.value)

  closeModal()
  isLoading.value = false
})

const openModalIcon = () => {
  isOpenModal.value = true
}

const closeModalIcon = () => {
  isOpenModal.value = false
}

const selectedIcon = (icon: string) => {
  icon_risk.value = icon
}

// Dentro del script de tu modal intermediario:
const handleInternalDelete = (imageId: ImageService['id']) => {
  // Filtramos la imagen eliminada del arreglo local para que desaparezca del buffer
  localImages.value = localImages.value.filter((img) => img.id !== imageId)
}

const handleQuestionDelete = (itemId: ContentFrequentlyQuestion['id']) => {
  // Filtramos la imagen eliminada del arreglo local para que desaparezca del buffer
  localQuestions.value = localQuestions.value.filter((item) => item.id !== itemId)
}

const reorderList = (fromIndex: number, toIndex: number) => {
  const newArr: any[] = [...localImages.value]

  const temp = newArr[fromIndex]
  newArr[fromIndex] = newArr[toIndex]
  newArr[toIndex] = temp

  localImages.value = newArr
}

const reorderListQuestion = (fromIndex: number, toIndex: number) => {
  const newArr: any[] = [...localQuestions.value]

  const temp = newArr[fromIndex]
  newArr[fromIndex] = newArr[toIndex]
  newArr[toIndex] = temp

  localQuestions.value = newArr
}

// Dentro del script de tu modal intermediario (donde vive 'localImages')
const handleImageCreated = (newImage: ImageService) => {
  localImages.value.push(newImage)
}

const handleQuestionCreated = (newItem: ContentFrequentlyQuestion) => {
  console.log(newItem)
  localQuestions.value.unshift(newItem)
}

const handleImageUpdated = (id: ImageService['id'], updatedImage: ImageService) => {
  // Usamos '==' para evitar problemas si uno es string y el otro número
  const index = localImages.value.findIndex((img) => img.id == updatedImage.id)
  if (index !== -1) {
    // Creamos un nuevo arreglo para asegurar que la reactividad de Vue se active
    localImages.value = localImages.value.map((img) => (img.id === id ? updatedImage : img))
  }
}

const handleQuestionUpdated = (
  id: ContentFrequentlyQuestion['id'],
  updatedItem: ContentFrequentlyQuestion,
) => {
  // Usamos '==' para evitar problemas si uno es string y el otro número
  const index = localQuestions.value.findIndex((item) => item.id == updatedItem.id)
  if (index !== -1) {
    // Creamos un nuevo arreglo para asegurar que la reactividad de Vue se active
    localQuestions.value = localQuestions.value.map((item) => (item.id === id ? updatedItem : item))
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-7xl overflow-hidden shadow-2xl transition-all overflow-y-auto"
    >
      <!-- Cabecera del Modal -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80"
      >
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {{ mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio' }}
        </h3>
        <button
          @click="closeModal"
          type="button"
          class="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <!-- Navegación por Pestañas (Tabs) -->
      <div
        class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f172a]/50 px-6 pt-3 gap-2"
      >
        <button
          type="button"
          @click="activeTab = 'main'"
          class="px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2"
          :class="
            activeTab === 'main'
              ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          Información Principal
        </button>
        <button
          type="button"
          @click="activeTab = 'gallery'"
          class="px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2"
          :class="
            activeTab === 'gallery'
              ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          Galería de Imágenes
        </button>
        <button
          type="button"
          @click="activeTab = 'which-includes'"
          class="px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2"
          :class="
            activeTab === 'which-includes'
              ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          ¿Que incluye?
        </button>
        <button
          type="button"
          @click="activeTab = 'specific-process'"
          class="px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2"
          :class="
            activeTab === 'specific-process'
              ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          Proceso específico
        </button>
        <button
          type="button"
          @click="activeTab = 'frequemtly-questions'"
          class="px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2"
          :class="
            activeTab === 'frequemtly-questions'
              ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          Preguntas Frecuentes
        </button>
      </div>

      <!-- Formulario / Campos -->
      <form @submit.prevent="onSubmit">
        <div class="p-6 space-y-1 overflow-y-auto flex-1">
          <!-- PESTAÑA 1: INFORMACIÓN PRINCIPAL -->
          <div v-show="activeTab === 'main'" class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-[3fr_5fr] gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >Título</label
                >
                <input
                  ref="titleInputRef"
                  type="text"
                  v-model="title"
                  placeholder="Ej. ISO 9001"
                  class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
                />
                <span v-if="errors.title" class="text-red-500 font-semibold text-xs block">
                  {{ errors.title }}
                </span>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >Subtitulo</label
                >
                <!-- <input
                  type="text"
                  v-model="text_short"
                  placeholder="Ej. desde 2008"
                  class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
                /> -->
                 <textarea
                  rows="3"
                  v-model="text_short"
                  placeholder="Escribe el texto corto..."
                  class="w-full flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"
                />
                <span v-if="errors.text_short" class="text-red-500 font-semibold text-xs block">
                  {{ errors.text_short }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-4 items-start">
              <div class="space-y-1 h-full flex flex-col">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >Descripción corta</label
                >
                <textarea
                  rows="4"
                  v-model="description_short"
                  placeholder="Escribe la descripción detallada del servicio..."
                  class="w-full flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"
                />
                <span
                  v-if="errors.description_short"
                  class="text-red-500 font-semibold text-xs block"
                >
                  {{ errors.description_short }}
                </span>
              </div>

              <div class="space-y-1">
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
                      @click="resetToOriginalImage"
                      class="absolute top-1 right-1 bg-slate-900/80 dark:bg-slate-950/85 hover:bg-red-600/90 text-slate-200 hover:text-white p-1 rounded-md transition-all shadow-md cursor-pointer flex items-center justify-center text-[10px]"
                      title="Restablecer imagen original"
                    >
                      <font-awesome-icon icon="rotate-left" />
                    </button>
                  </div>

                  <div class="flex-1 space-y-1">
                    <label
                      class="flex items-center justify-center px-3 py-2 bg-emerald-50 dark:bg-emerald-600/10 hover:bg-emerald-100 dark:hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
                    >
                      <span>Seleccionar archivo</span>
                      <input
                        type="file"
                        @change="handleFileUpload"
                        accept="image/*"
                        class="hidden"
                      />
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
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >Descripción Larga</label
              >
              <QuillEditor
                @ready="onQuillReady"
                ref="quillRef"
                v-model:content="description_long"
                contentType="html"
                theme="snow"
                style="height: 120px"
                :disabled="isLoading"
                @text-change="handleTextChange"
              />
              <span
                v-if="errors.description_long"
                class="text-red-500 font-semibold text-xs block p-2"
              >
                {{ errors.description_long }}
              </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[3fr_5fr] gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Slug</label>
                <input
                  type="text"
                  v-model="slug"
                  disabled
                  placeholder="Ej. iso-9001"
                  class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
                />
                <span v-if="errors.slug" class="text-red-500 font-semibold text-xs block p-2">
                  {{ errors.slug }}
                </span>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >Iframe Video</label
                >
                <textarea
                  v-model="video"
                  rows="3"
                  placeholder="Ej. https://youtube.com/..."
                  class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
                />
                <span v-if="errors.video" class="text-red-500 font-semibold text-xs block p-2">
                  {{ errors.video }}
                </span>
              </div>
            </div>

            <div
              class="bg-slate-50/60 dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4"
            >
              <div
                class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5"
              >
                <h4
                  class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider"
                >
                  Datos de seccion Riesgo
                </h4>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-[3fr_5fr] gap-4">
                <div class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >Titulo Riesgo</label
                    >
                    <input
                      type="text"
                      v-model="title_risk"
                      placeholder="Ej. Titulo de Riesgo"
                      class="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
                    />
                    <span
                      v-if="errors.title_risk"
                      class="text-red-500 font-semibold text-xs block p-2"
                    >
                      {{ errors.title_risk }}
                    </span>
                  </div>

                  <div class="space-y-2">
                    <div
                      class="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] items-end gap-3 -mt-2"
                    >
                      <div class="space-y-1.5">
                        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Icono Riesgo <span class="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          v-model="icon_risk"
                          disabled
                          placeholder="Ej. shield-halved"
                          :class="[
                            'w-full bg-white dark:bg-[#111827] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition shadow-sm disabled:opacity-80 disabled:cursor-not-allowed',
                            !icon_risk
                              ? 'border-amber-400 dark:border-amber-500/60 focus:border-amber-500'
                              : 'border-slate-300 dark:border-slate-700/60 focus:border-emerald-500',
                          ]"
                        />
                      </div>

                      <div class="space-y-1 flex flex-col items-center">
                        <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                          >Vista previa</span
                        >
                        <div
                          :class="[
                            'relative h-[38px] w-[38px] bg-slate-50 dark:bg-[#111827] border rounded-xl flex items-center justify-center shadow-sm transition',
                            !icon_risk
                              ? 'border-amber-400 text-amber-500 dark:border-amber-500/60'
                              : 'border-slate-300 dark:border-slate-700/60 text-emerald-600 dark:text-emerald-400',
                          ]"
                        >
                          <font-awesome-icon v-if="icon_risk" :icon="icon_risk" class="text-base" />
                          <font-awesome-icon
                            v-else
                            icon="triangle-exclamation"
                            class="text-sm text-amber-500 animate-pulse"
                          />

                          <!-- Botón para restablecer el icono original -->
                          <button
                            v-if="mode === 'edit' && icon_risk !== originalIcon"
                            type="button"
                            @click="resetToOriginalIcon"
                            class="absolute -top-1.5 -right-1.5 bg-slate-900/80 dark:bg-slate-950/85 hover:bg-red-600/90 text-slate-200 hover:text-white p-1 rounded-md transition-all shadow-md cursor-pointer flex items-center justify-center text-[9px]"
                            title="Restablecer icono original"
                          >
                            <font-awesome-icon icon="rotate-left" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          @click="openModalIcon"
                          class="h-[38px] px-4 bg-emerald-50 dark:bg-emerald-600/10 hover:bg-emerald-100 dark:hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2 whitespace-nowrap"
                        >
                          <font-awesome-icon icon="magnifying-glass" />
                          <span>Seleccionar Icono</span>
                        </button>
                      </div>
                    </div>
                    <!-- Alerta dinámica si no hay icono seleccionado -->
                    <p
                      v-if="!icon_risk"
                      class="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-1"
                    >
                      <font-awesome-icon icon="circle-exclamation" />
                      Es necesario seleccionar un icono para continuar con los datos de riesgo.
                    </p>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >Descripción Riesgo</label
                  >
                  <textarea
                    rows="5"
                    v-model="description_risk"
                    placeholder="Escribe la descripción detallada del servicio..."
                    class="w-full flex-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"
                  />
                  <span
                    v-if="errors.description_risk"
                    class="text-red-500 font-semibold text-xs block p-2"
                  >
                    {{ errors.description_risk }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="mode === 'edit'" class="flex items-center justify-between pt-2">
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >Estado del Servicio</span
              >
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="isActive" class="sr-only peer" />
                <div
                  class="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"
                ></div>
                <span class="ml-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {{ isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </label>
            </div>
          </div>

          <!-- PESTAÑA 2: GALERÍA DE IMÁGENES CON BUSCADOR, FILTROS Y TARJETAS ESTILO CATÁLOGO -->
          <div v-show="activeTab === 'gallery'" class="space-y-4 py-2">
            <!-- Barra de Filtros y Buscador similar a la imagen -->
            <GalleryImagesTab
              :imagesList="localImages"
              :disabled
              :serviceId="serviceIdToUse"
              @delete="handleInternalDelete"
              @move="reorderList"
              @create="handleImageCreated"
              @update="handleImageUpdated"
            />
            <!-- Grid de Tarjetas de la Galería -->
          </div>

          <!-- <div v-show="activeTab === 'which-includes'" class="space-y-4 py-2"> -->
          <!-- PESTAÑA: ¿QUÉ INCLUYE? -->
          <div v-show="activeTab === 'which-includes'" class="space-y-4 py-2">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detalle de lo que incluye el servicio
              </label>
              <QuillEditor
                @ready="onQuillWhichIncludesReady"
                v-model:content="which_includes"
                contentType="html"
                theme="snow"
                style="height: 200px"
                :disabled="isLoading"
                @text-change="handleWhichIncludesChange"
              />
              <span
                v-if="errors.which_includes"
                class="text-red-500 font-semibold text-xs block p-2"
              >
                {{ errors.which_includes }}
              </span>
            </div>
          </div>
          <!-- </div> -->

          <div v-show="activeTab === 'specific-process'" class="space-y-4 py-2">
            <!-- PESTAÑA: ¿QUÉ INCLUYE? -->
            <!-- <div v-show="activeTab === 'which-includes'" class="space-y-4 py-2"> -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detalle de lo que incluye el servicio
              </label>
              <QuillEditor
                @ready="onQuillSpecificProcessReady"
                v-model:content="specific_process"
                contentType="html"
                theme="snow"
                style="height: 200px"
                :disabled="isLoading"
                @text-change="handleSpecificProcessChange"
              />
              <span
                v-if="errors.specific_process"
                class="text-red-500 font-semibold text-xs block p-2"
              >
                {{ errors.specific_process }}
              </span>
            </div>
            <!-- </div> -->
          </div>

          <div v-show="activeTab === 'frequemtly-questions'" class="space-y-4 py-2">
            <GalleryFrequentlyQuestionsTab
              :questionList="localQuestions"
              :serviceId="serviceIdToUse"
              @move="reorderListQuestion"
              @create="handleQuestionCreated"
              @update="handleQuestionUpdated"
              @delete="handleQuestionDelete"
            />
          </div>
        </div>

        <!-- Pie del Modal -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-100 dark:bg-[#080e1f] border-t border-slate-200 dark:border-slate-800/80"
        >
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="disabled || localImages.length < 3 || localQuestions.length < 3"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
  <ModalGalleryIcon v-model:isOpen="isOpenModal" @close="closeModalIcon" @select="selectedIcon" />
</template>

<style>
.ql-container.ql-snow {
  max-height: 350px;
  overflow-y: auto;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  border-color: rgba(203, 213, 225, 1) !important;
  background-color: #ffffff;
  color: #0f172a;
}

.ql-toolbar.ql-snow {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  background-color: #f8fafc;
  border-color: rgba(203, 213, 225, 1) !important;
}

.dark .ql-container.ql-snow {
  border-color: rgba(51, 65, 85, 0.6) !important;
  background-color: #111827;
  color: #f1f5f9;
}

.dark .ql-toolbar.ql-snow {
  background-color: #0f172a;
  border-color: rgba(51, 65, 85, 0.6) !important;
}

/* Aplica color claro a cualquier editor Quill o componente de texto enriquecido en modo oscuro */
.dark :deep(.ql-editor),
.dark :deep(.p-editor-content),
.dark :deep(.ql-container) {
  color: #f8fafc !important;
}

/* Asegura que los textos dentro del editor también hereden el color correcto */
.dark :deep(.ql-editor *) {
  color: inherit !important;
}

/* Pégalo en tu CSS global para que afecte a todo el sistema en modo oscuro */
.dark .ql-editor,
.dark .ql-container,
.dark .p-editor-content {
  color: #f8fafc !important;
}

.dark .ql-editor * {
  color: inherit !important;
}
</style>
