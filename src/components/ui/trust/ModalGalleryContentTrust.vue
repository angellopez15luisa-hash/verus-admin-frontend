<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ContentItemsTrust } from '@/types'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { contentItemsTrustsSchema } from '@/schemas'
import { GeneralSettingValue } from '@/values'

const DEFAULT_CAMERA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<ContentItemsTrust | null>('model', { required: true, default: null })

const emit = defineEmits<{
  close: []
  save: []
  create: [item: ContentItemsTrust]
  update: [id: ContentItemsTrust['id'], item: ContentItemsTrust]
}>()

const hasSelectedNewImage = ref<boolean>(false)
const imageErrorMsg = ref<string>('')
const titleInputRef = ref<HTMLInputElement | null>(null)
const currentTrustId = ref<ContentItemsTrust['id'] | null>(null)
const isLoading = ref<boolean>(false)
const originalImage = ref<string>('')

const { handleSubmit, resetForm, errors, setFieldValue, defineField, meta, validate } = useForm({
  validationSchema: toTypedSchema(contentItemsTrustsSchema),
  initialValues: GeneralSettingValue.contentItemsTrustForm,
})

const [title] = defineField('title')
const [subtitle] = defineField('subtitle')
const [description] = defineField('description')
const [isActive] = defineField('isActive')
const [image] = defineField('image')

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

watch(isOpen, async (value) => {
  if (!value) {
    window.removeEventListener('keydown', handleKeyDown)
    return
  }
  window.addEventListener('keydown', handleKeyDown)

  await nextTick()
  imageErrorMsg.value = ''

  if (props.mode === 'edit' && model.value) {
    currentTrustId.value = model.value.id
    hasSelectedNewImage.value = false
    originalImage.value = model.value.image || ''
    resetForm(
      {
        values: {
          title: model.value.title,
          subtitle: model.value.subtitle,
          description: model.value.description,
          isActive: model.value.isActive,
          image: model.value.image,
        },
      },
      { force: true },
    )
  } else {
    currentTrustId.value = null
    hasSelectedNewImage.value = false
    originalImage.value = ''
    resetForm(
      {
        values: {
          ...GeneralSettingValue.contentItemsTrustForm,
          image: DEFAULT_CAMERA_IMAGE,
          isActive: true,
        },
      },
      { force: true },
    )
  }
  titleInputRef.value?.focus()
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

const onSubmit = handleSubmit(async (values) => {
  const validationResult = await validate()
  if (!validationResult.valid) return

  isLoading.value = true
  if (props.mode === 'create') {
    const newItem: ContentItemsTrust = {
      id: Date.now(),
      title: values.title,
      subtitle: values.subtitle,
      description: values.description,
      isActive: true,
      image: values.image,
    }
    emit('create', newItem)
  } else {
    if (currentTrustId.value !== null) {
      const updatedItem: ContentItemsTrust = {
        id: currentTrustId.value,
        title: values.title,
        subtitle: values.subtitle,
        description: values.description,
        isActive: values.isActive ?? true,
        image: values.image,
      }
      emit('update', currentTrustId.value, updatedItem)
    }
  }
  closeModal()
  isLoading.value = false
})

const disabled = computed(
  () =>
    isLoading.value || !meta.value.valid || (props.mode === 'create' && !hasSelectedNewImage.value),
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col"
    >
      <!-- Cabecera del Modal -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {{ mode === 'create' ? 'Crear Nuevo Item' : 'Editar Item' }}
        </h3>
        <button
          @click="closeModal"
          type="button"
          class="text-slate-400 hover:text-slate-700 dark:hover:text-white transition text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <!-- Formulario / Campos -->
      <form @submit.prevent="onSubmit">
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <!-- Fila: Título y Subtítulo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Título</label>
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

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Subtítulo</label>
              <input
                type="text"
                v-model="subtitle"
                placeholder="Ej. desde 2008"
                class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm"
              />
              <span v-if="errors.subtitle" class="text-red-500 font-semibold text-xs block">
                {{ errors.subtitle }}
              </span>
            </div>
          </div>

          <!-- Campo: Descripción -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción</label>
            <textarea
              rows="3"
              v-model="description"
              placeholder="Escribe la descripción detallada del servicio..."
              class="w-full bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"
            />
            <span v-if="errors.description" class="text-red-500 font-semibold text-xs block">
              {{ errors.description }}
            </span>
          </div>

          <!-- Campo: Imagen del Evento / Servicio -->
          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
            >
              Imagen del Evento
            </label>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div
                class="relative h-28 w-full sm:w-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex-shrink-0 shadow-sm flex items-center justify-center p-3 group"
                :class="imageErrorMsg ? 'border-red-500 ring-1 ring-red-500/20' : ''"
              >
                <img
                  :src="image || DEFAULT_CAMERA_IMAGE"
                  alt="Vista previa"
                  :class="[
                    'max-h-full max-w-full rounded-lg transition-all',
                    image === DEFAULT_CAMERA_IMAGE
                      ? 'w-12 h-12 opacity-60 object-contain'
                      : 'w-full h-full object-cover',
                  ]"
                />

                <!-- Botón flotante para restablecer la imagen original -->
                <button
                  v-if="mode === 'edit' && hasSelectedNewImage"
                  type="button"
                  @click="resetToOriginalImage"
                  class="absolute top-2 right-2 bg-slate-950/80 hover:bg-red-600/90 text-slate-200 hover:text-white p-1.5 rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center text-xs"
                  title="Restablecer imagen original"
                >
                  <font-awesome-icon icon="rotate-left" />
                </button>
              </div>

              <div class="flex-1 w-full space-y-2">
                <label
                  class="flex items-center justify-center px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <span>Seleccionar archivo</span>
                  <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                </label>

                <p
                  v-if="mode === 'create' && !hasSelectedNewImage && !imageErrorMsg"
                  class="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5"
                >
                  <font-awesome-icon icon="circle-exclamation" />
                  * Debe seleccionar una imagen para continuar.
                </p>

                <span
                  v-if="imageErrorMsg"
                  class="text-red-500 font-semibold text-[11px] block mt-1 flex items-center gap-1.5"
                >
                  <font-awesome-icon icon="circle-exclamation" />
                  {{ imageErrorMsg }}
                </span>
              </div>
            </div>
          </div>

          <!-- Campo: Estado Activo / Inactivo -->
          <div v-if="mode === 'edit'" class="flex items-center justify-between pt-2">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado del Servicio</span>

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

        <!-- Pie del Modal -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-[#080e1f] border-t border-slate-200 dark:border-slate-800/80"
        >
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="disabled"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
