<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { catalogGalleryEventSchema } from '@/schemas/general-setting.schema'
import type { CatalogGalleryEvent } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'
import { EVENT_CATEGORY_DICTIONARY } from '@/constants/categories.constant'

configure({
  validateOnBlur: false,
})

// Imagen por defecto minimalista y limpia
const DEFAULT_CAMERA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<CatalogGalleryEvent>('model', { required: true })

const emit = defineEmits<{
  create: [event: CatalogGalleryEvent]
  update: [id: CatalogGalleryEvent['id'], event: CatalogGalleryEvent]
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)
const currentEventId = ref<CatalogGalleryEvent['id'] | null>(null)
const hasSelectedNewImage = ref<boolean>(false)
const imageErrorMsg = ref<string>('')
const isLoading = ref<boolean>(false)

const { handleSubmit, resetForm, errors, setValues, setFieldValue, defineField, validate } =
  useForm({
    validationSchema: toTypedSchema(catalogGalleryEventSchema),
    initialValues: GeneralSettingValue.catalogGalleryEventForm,
  })

const [formName, formNameAttrs] = defineField('name')
const [formCategory, formCategoryAttrs] = defineField('category')
const [formActive, formActiveAttrs] = defineField('active')
const [formImage] = defineField('image')

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

watch(
  () => isOpen.value,
  async (isOpenVal) => {
    if (!isOpenVal) {
      window.removeEventListener('keydown', handleKeyDown)
      return
    }

    window.addEventListener('keydown', handleKeyDown)

    await nextTick()
    imageErrorMsg.value = ''
    if (props.mode === 'edit' && model.value) {
      currentEventId.value = model.value.id
      hasSelectedNewImage.value = true
      setValues({
        name: model.value.name || '',
        category: model.value.category || '',
        active: !!model.value.active,
        image: model.value.image || '',
      })
      resetForm(
        {
          values: model.value,
          errors: {},
        },
        { force: true },
      )
    } else {
      currentEventId.value = null
      hasSelectedNewImage.value = false
      resetForm({
        values: {
          name: '',
          category: '',
          active: true,
          image: DEFAULT_CAMERA_IMAGE,
        },
        errors: {},
      })
    }

    titleInputRef.value?.focus()
  },
)

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

const onSubmit = handleSubmit(async (values) => {
  console.log('ssas')
  if (props.mode === 'create' && !hasSelectedNewImage.value) {
    imageErrorMsg.value = 'La imagen del evento es requerida'
    return
  }

  const validationResult = await validate()
  if (!validationResult.valid) return

  isLoading.value = true
  if (props.mode === 'create') {
    const newEvent = {
      id: Date.now(),
      name: values.name,
      category: values.category,
      active: values.active,
      image: values.image,
    }
    emit('create', newEvent)
  } else {
    if (currentEventId.value !== null) {
      const updatedEvent = {
        id: currentEventId.value,
        name: values.name,
        category: values.category,
        active: values.active,
        image: values.image || '',
      }
      emit('update', currentEventId.value, updatedEvent)
    }
  }
  closeModal()
  isLoading.value = false
})

const isModalDisabled = computed(() => {
  if (isLoading.value) return true
  if (!formName.value) return true
  if (!formCategory.value) return true
  if (props.mode === 'create' && !hasSelectedNewImage.value) return true
  return false
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
  >
    {{ errors }}
    <div
      class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
      >
        <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {{ mode === 'create' ? 'Nuevo Evento' : 'Editar Evento' }}
        </h3>
        <button
          type="button"
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1"
        >
          <font-awesome-icon icon="xmark" class="text-sm" />
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="p-6 space-y-4">
          <!-- Campo: Título del evento -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Título del Evento
            </label>
            <input
              ref="titleInputRef"
              type="text"
              v-model="formName"
              v-bind="formNameAttrs"
              placeholder="Ej. Nombre del Evento"
              class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm transition-all"
              :class="
                errors.name
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-700/60'
              "
            />
            <span v-if="errors.name" class="text-red-500 font-semibold text-[11px] block mt-1">
              {{ errors.name }}
            </span>
          </div>

          <!-- Fila compartida: Categoría y Estado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Campo: Categoría -->
            <div class="space-y-1.5">
              <label
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Categoría
              </label>
              <div class="relative">
                <select
                  v-model="formCategory"
                  v-bind="formCategoryAttrs"
                  class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer shadow-sm transition-all"
                  :class="
                    errors.category
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700/60'
                  "
                >
                  <option
                    value=""
                    disabled
                    class="bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white font-black"
                  >
                    Seleccione
                  </option>
                  <option
                    v-for="(label, key) in EVENT_CATEGORY_DICTIONARY"
                    :key="key"
                    :value="key"
                    class="bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white font-medium"
                  >
                    {{ label }}
                  </option>
                </select>
                <span
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none"
                >
                  <font-awesome-icon icon="chevron-down" class="text-xs" />
                </span>
              </div>
              <span
                v-if="errors.category"
                class="text-red-500 font-semibold text-[11px] block mt-1"
              >
                {{ errors.category }}
              </span>
            </div>

            <!-- Campo: Estado -->
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
          </div>

          <!-- Sección: Imagen del evento -->
          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
            >
              Imagen del Evento
            </label>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div
                class="relative h-28 w-full sm:w-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex-shrink-0 shadow-sm flex items-center justify-center p-3"
                :class="imageErrorMsg ? 'border-red-500 ring-1 ring-red-500/20' : ''"
              >
                <img
                  :src="formImage || DEFAULT_CAMERA_IMAGE"
                  alt="Vista previa"
                  :class="[
                    'max-h-full max-w-full rounded-lg transition-all',
                    formImage === DEFAULT_CAMERA_IMAGE
                      ? 'w-12 h-12 opacity-60 object-contain'
                      : 'w-full h-full object-cover',
                  ]"
                />
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
                  class="text-[11px] text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1.5"
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
        </div>

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
            {{ mode === 'create' ? 'Crear Evento' : 'Actualizar Evento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
