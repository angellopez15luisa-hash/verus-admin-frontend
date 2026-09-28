<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { configure, useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { catalogGalleryPackageSchema } from '@/schemas/general-setting.schema'
import type { CatalogGalleryPackage } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'

configure({
  validateOnBlur: false,
})

// Lista exacta de los 50 iconos orientados a eventos, fiestas y servicios VIP
const availableIcons = [
  { class: 'ri-hotel-line', label: 'Hotel' },
  { class: 'ri-ship-line', label: 'Yates' },
  { class: 'ri-vip-crown-line', label: 'VIP' },
  { class: 'ri-cake-3-line', label: 'Fiestas' },
  { class: 'ri-user-star-line', label: 'Shows' },
  { class: 'ri-heart-line', label: 'Romántico' },
  { class: 'ri-car-line', label: 'Transporte' },
  { class: 'ri-music-2-line', label: 'Música' },
  { class: 'ri-camera-line', label: 'Cámara' },
  { class: 'ri-fire-line', label: 'Destacado' },
  { class: 'ri-gift-line', label: 'Regalos' },
  { class: 'ri-star-line', label: 'Estrella' },
  { class: 'ri-shield-star-line', label: 'Seguridad' },
  { class: 'ri-goblet-line', label: 'Bebidas' },
  { class: 'ri-magic-line', label: 'Especial' },
  { class: 'ri-map-pin-line', label: 'Ubicación' },
  { class: 'ri-phone-line', label: 'Contacto' },
  { class: 'ri-time-line', label: 'Horarios' },
  { class: 'ri-ticket-line', label: 'Tickets' },
  { class: 'ri-building-line', label: 'Local' },
  { class: 'ri-community-line', label: 'Eventos' },
  { class: 'ri-plane-line', label: 'Viajes' },
  { class: 'ri-flashlight-line', label: 'Rápido' },
  { class: 'ri-trophy-line', label: 'Premios' },
  { class: 'ri-medal-line', label: 'Calidad' },
  { class: 'ri-disc-line', label: 'DJ / Audio' },
  { class: 'ri-video-line', label: 'Video' },
  { class: 'ri-mic-line', label: 'Animación' },
  { class: 'ri-palette-line', label: 'Temática' },
  { class: 'ri-vip-diamond-line', label: 'Diamante' },
  { class: 'ri-bar-chart-box-line', label: 'Exclusivo' },
  { class: 'ri-beer-line', label: 'Cerveza' },
  { class: 'ri-cup-line', label: 'Cocktail' },
  { class: 'ri-restaurant-line', label: 'Catering' },
  { class: 'ri-moon-line', label: 'Nocturno' },
  { class: 'ri-sun-line', label: 'Pool Party' },
  { class: 'ri-umbrella-line', label: 'Playa' },
  { class: 'ri-group-line', label: 'Acompañantes' },
  { class: 'ri-user-heart-line', label: 'Citas' },
  { class: 'ri-service-line', label: 'Servicio' },
  { class: 'ri-store-2-line', label: 'Salón' },
  { class: 'ri-ticket-2-line', label: 'Acceso' },
  { class: 'ri-percent-line', label: 'Ofertas' },
  { class: 'ri-chat-smile-line', label: 'Atención' },
  { class: 'ri-smartphone-line', label: 'App / Web' },
  { class: 'ri-global-line', label: 'Global' },
  { class: 'ri-award-line', label: 'Garantía' },
  { class: 'ri-thumb-up-line', label: 'Recomendado' },
  { class: 'ri-circle-line', label: 'Círculo' },
  { class: 'ri-ship-line', label: 'Yates' },
  { class: 'ri-building-line', label: 'Local' },
]

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<CatalogGalleryPackage>('model', { required: true })

const emit = defineEmits<{
  create: [pkg: CatalogGalleryPackage]
  update: [id: CatalogGalleryPackage['id'], pkg: CatalogGalleryPackage]
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)
const iconContainerRef = ref<HTMLElement | null>(null)
const currentPackageId = ref<CatalogGalleryPackage['id'] | null>(null)
const isLoading = ref<boolean>(false)

const { handleSubmit, resetForm, errors, setValues, setFieldValue, defineField, validate } =
  useForm({
    validationSchema: toTypedSchema(catalogGalleryPackageSchema),
    initialValues: GeneralSettingValue.catalogGalleryPackageForm || {
      title: '',
      icon: 'ri-hotel-line',
      description: '',
      features: ['', '', ''],
      active: true,
    },
  })

const [formTitle, formTitleAttrs] = defineField('title')
const [formIcon] = defineField('icon')
const [formDescription, formDescriptionAttrs] = defineField('description')
const [formActive, formActiveAttrs] = defineField('active')

// Declaramos cada característica de manera independiente con useField para asegurar reactividad y errores precisos
const { value: feat1, errorMessage: err1 } = useField<string>('features[0]')
const { value: feat2, errorMessage: err2 } = useField<string>('features[1]')
const { value: feat3, errorMessage: err3 } = useField<string>('features[2]')

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
      currentPackageId.value = model.value.id
      const fList = model.value.features || ['', '', '']
      setValues({
        title: model.value.title || '',
        icon: model.value.icon || 'ri-hotel-line',
        description: model.value.description || '',
        features: [fList[0] || '', fList[1] || '', fList[2] || ''],
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
      currentPackageId.value = null
      resetForm({
        values: {
          title: '',
          icon: 'ri-hotel-line',
          description: '',
          features: ['', '', ''],
          active: true,
        },
        errors: {},
      })
    }

    titleInputRef.value?.focus()

    await nextTick()
    if (iconContainerRef.value) {
      const activeBtn = iconContainerRef.value.querySelector('.ring-emerald-500') as HTMLElement
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  },
)

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const selectIcon = (iconClass: string) => {
  setFieldValue('icon', iconClass)
}

const onSubmit = handleSubmit(async (formValues) => {
  const validationResult = await validate()
  if (!validationResult.valid) return

  isLoading.value = true
  if (props.mode === 'create') {
    const newPackage: CatalogGalleryPackage = {
      id: Date.now(),
      title: formValues.title,
      icon: formValues.icon,
      description: formValues.description,
      features: formValues.features || [],
      active: true, // Al crear siempre nace activo
    }
    emit('create', newPackage)
  } else {
    if (currentPackageId.value !== null) {
      const updatedPackage: CatalogGalleryPackage = {
        id: currentPackageId.value,
        title: formValues.title,
        icon: formValues.icon,
        description: formValues.description,
        features: formValues.features || [],
        active: formActive.value!, // 👈 Usamos directamente el valor reactivo del switch
      }
      emit('update', currentPackageId.value, updatedPackage)
    }
  }
  closeModal()
  isLoading.value = false
})

const isModalDisabled = computed(() => {
  if (isLoading.value) return true
  if (!formTitle.value) return true
  if (!formIcon) return true
  return false
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
  >
    <div
      class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col"
    >
      <!-- Cabecera del Modal -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
      >
        <div class="flex items-center gap-3">
          <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            {{
              mode === 'create' ? 'Administrar Tarjeta de Servicio' : 'Editar Tarjeta de Servicio'
            }}
          </h3>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            50 Íconos (Eventos & Fiestas)
          </span>
        </div>
        <!-- Botón de Cerrar (X) -->
        <button
          type="button"
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
        >
          <font-awesome-icon icon="xmark" class="text-sm" />
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <!-- Contenedor en 2 columnas sin scroll general -->
        <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- COLUMNA 1: SELECCIÓN DE ÍCONOS -->
          <div class="space-y-2 flex flex-col">
            <label
              class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Selecciona un Ícono (Haz clic para elegir)
            </label>

            <!-- Contenedor de iconos con scroll propio -->
            <div
              ref="iconContainerRef"
              class="flex-1 min-h-[340px] max-h-[380px] overflow-y-auto pr-1 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800 relative"
            >
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="item in availableIcons"
                  :key="item.class"
                  type="button"
                  @click="selectIcon(item.class)"
                  :class="[
                    'p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                    formIcon === item.class
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-[#1f2937] border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500',
                  ]"
                >
                  <i :class="[item.class, 'text-lg']"></i>
                  <span class="text-[9px] text-center truncate w-full">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <!-- Indicador de selección actual -->
            <p
              class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5"
            >
              <span>Seleccionado internamente:</span>
              <i :class="[formIcon, 'text-emerald-600 dark:text-emerald-400 text-sm']"></i>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{{
                formIcon
              }}</span>
            </p>
            <span v-if="errors.icon" class="text-red-500 font-semibold text-[11px] block mt-1">
              {{ errors.icon }}
            </span>
          </div>

          <!-- COLUMNA 2: CAMPOS DE TEXTO E INPUTS -->
          <div class="space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <!-- TÍTULO -->
              <div class="space-y-1.5">
                <label
                  class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Título
                </label>
                <input
                  ref="titleInputRef"
                  type="text"
                  v-model="formTitle"
                  v-bind="formTitleAttrs"
                  placeholder="Ej. Shows Privados"
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

              <!-- DESCRIPCIÓN -->
              <div class="space-y-1.5">
                <label
                  class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Descripción
                </label>
                <textarea
                  v-model="formDescription"
                  v-bind="formDescriptionAttrs"
                  rows="2"
                  placeholder="Breve descripción..."
                  class="w-full bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm transition-all resize-none"
                  :class="
                    errors.description
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700/60'
                  "
                ></textarea>
                <span
                  v-if="errors.description"
                  class="text-red-500 font-semibold text-[11px] block mt-1"
                >
                  {{ errors.description }}
                </span>
              </div>

              <!-- CARACTERÍSTICAS (3 CHECKS) -->
              <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label
                  class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Características (3 Checks)
                </label>
                <div class="space-y-3">
                  <!-- Característica 1 -->
                  <div>
                    <div
                      class="flex items-center gap-2 bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3 py-2 shadow-sm transition-all"
                      :class="
                        err1
                          ? 'border-red-500 ring-1 ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-700/60'
                      "
                    >
                      <span
                        class="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0"
                      >
                        <font-awesome-icon icon="check" class="text-[10px]" />
                      </span>
                      <input
                        type="text"
                        v-model="feat1"
                        placeholder="Característica 1"
                        class="w-full bg-transparent text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <span
                      v-if="err1"
                      class="text-red-500 font-semibold text-[11px] block mt-1 ml-1"
                      >{{ err1 }}</span
                    >
                  </div>

                  <!-- Característica 2 -->
                  <div>
                    <div
                      class="flex items-center gap-2 bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3 py-2 shadow-sm transition-all"
                      :class="
                        err2
                          ? 'border-red-500 ring-1 ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-700/60'
                      "
                    >
                      <span
                        class="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0"
                      >
                        <font-awesome-icon icon="check" class="text-[10px]" />
                      </span>
                      <input
                        type="text"
                        v-model="feat2"
                        placeholder="Característica 2"
                        class="w-full bg-transparent text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <span
                      v-if="err2"
                      class="text-red-500 font-semibold text-[11px] block mt-1 ml-1"
                      >{{ err2 }}</span
                    >
                  </div>

                  <!-- Característica 3 -->
                  <div>
                    <div
                      class="flex items-center gap-2 bg-slate-50 dark:bg-[#1f2937] border rounded-xl px-3 py-2 shadow-sm transition-all"
                      :class="
                        err3
                          ? 'border-red-500 ring-1 ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-700/60'
                      "
                    >
                      <span
                        class="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0"
                      >
                        <font-awesome-icon icon="check" class="text-[10px]" />
                      </span>
                      <input
                        type="text"
                        v-model="feat3"
                        placeholder="Característica 3"
                        class="w-full bg-transparent text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <span
                      v-if="err3"
                      class="text-red-500 font-semibold text-[11px] block mt-1 ml-1"
                      >{{ err3 }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- ESTADO (SOLO SE MUESTRA EN MODO EDITAR) -->
              <div
                v-if="mode === 'edit'"
                class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <span
                  class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Estado del Servicio
                </span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="formActive"
                    v-bind="formActiveAttrs"
                    class="sr-only peer"
                  />
                  <div
                    class="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"
                  ></div>
                  <span class="ml-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {{ formActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie del Modal -->
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
            {{ mode === 'create' ? 'Guardar Servicio' : 'Actualizar Servicio' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
