<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { catalogGalleryVideoSchema } from '@/schemas/general-setting.schema'
import type { CatalogGalleryVideo } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'

configure({
  validateOnBlur: false,
})

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<CatalogGalleryVideo>('model', { required: true })

const emit = defineEmits<{
  create: [video: CatalogGalleryVideo]
  update: [id: CatalogGalleryVideo['id'], video: CatalogGalleryVideo]
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)
const currentVideoId = ref<CatalogGalleryVideo['id'] | null>(null)
const isLoading = ref<boolean>(false)

const { handleSubmit, resetForm, errors, setValues, defineField, validate } = useForm({
  validationSchema: toTypedSchema(catalogGalleryVideoSchema),
  initialValues: GeneralSettingValue.catalogGalleryVideoForm,
})

const [formTitle, formTitleAttrs] = defineField('title')
const [formVideoUrl, formVideoUrlAttrs] = defineField('videoUrl')
const [formActive, formActiveAttrs] = defineField('active')

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
    if (props.mode === 'edit' && model.value) {
      currentVideoId.value = model.value.id
      setValues({
        title: model.value.title || '',
        videoUrl: model.value.videoUrl || '',
        active: !!model.value.active,
      })
      resetForm(
        {
          values: model.value,
          errors: {},
        },
        { force: true },
      )
    } else {
      currentVideoId.value = null
      resetForm({
        values: {
          title: '',
          videoUrl: '',
          active: true,
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

const onSubmit = handleSubmit(async (values) => {
  const validationResult = await validate()
  if (!validationResult.valid) return

  isLoading.value = true
  if (props.mode === 'create') {
    const newVideo = {
      id: Date.now(),
      title: values.title,
      videoUrl: values.videoUrl,
      active: values.active,
    }
    emit('create', newVideo)
  } else {
    if (currentVideoId.value !== null) {
      const updatedVideo = {
        id: currentVideoId.value,
        title: values.title,
        videoUrl: values.videoUrl,
        active: values.active,
      }
      emit('update', currentVideoId.value, updatedVideo)
    }
  }
  closeModal()
  isLoading.value = false
})

const isModalDisabled = computed(() => {
  if (isLoading.value) return true
  if (!formTitle.value) return true
  if (!formVideoUrl.value) return true
  return false
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
  >
    <div
      class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
      >
        <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {{ mode === 'create' ? 'Nuevo Video' : 'Editar Video' }}
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
          <!-- Campo: Título del video -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Título del Video
            </label>
            <input
              ref="titleInputRef"
              type="text"
              v-model="formTitle"
              v-bind="formTitleAttrs"
              placeholder="Ej. Presentación Oficial"
              class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm transition-all"
              :class="
                errors.title
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-700/60'
              "
            />
            <span v-if="errors.title" class="text-red-500 font-semibold text-[11px] block mt-1">
              {{ errors.title }}
            </span>
          </div>

          <!-- Campo: URL del video -->
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              URL del Video
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <font-awesome-icon icon="link" class="text-xs" />
              </span>
              <input
                type="text"
                v-model="formVideoUrl"
                v-bind="formVideoUrlAttrs"
                placeholder="https://tuweb.com/videos/video.mp4"
                class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm transition-all"
                :class="
                  errors.videoUrl
                    ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700/60'
                "
              />
            </div>
            <span v-if="errors.videoUrl" class="text-red-500 font-semibold text-[11px] block mt-1">
              {{ errors.videoUrl }}
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
            {{ mode === 'create' ? 'Crear Video' : 'Actualizar Video' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
