<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import ButtonMain from '@/components/ui/shared/ButtonMain.vue'
import HeaderSection from '@/components/ui/shared/HeaderSection.vue'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import { GeneralSettingValue } from '@/values'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

// const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const isEditing = ref(false)
const queryClient = useQueryClient()
const textInputRef = ref<HTMLInputElement | null>(null)
// Referencia o variable reactiva donde guardas la URL de la imagen

const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { resetForm, handleSubmit, meta, errors, defineField } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

const [text_verify] = defineField('informationAditional.text_verify')
const [text_button_verify] = defineField('informationAditional.text_button_verify')
const [iframe_map_contact] = defineField('informationAditional.iframe_map_contact')

const [title_seo] = defineField('informationAditional.title_seo')
const [description_seo] = defineField('informationAditional.description_seo')
const [keywords_seo] = defineField('informationAditional.keywords_seo')
const [ogTitle_title_seo] = defineField('informationAditional.ogTitle_title_seo')
const [ogDescription_seo] = defineField('informationAditional.ogDescription_seo')
const [image] = defineField('informationAditional.image')

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, Variables) => {
    const newValues = Variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        informationAditional: newValues.informationAditional,
      }
    })
    resetForm({ values: newValues }, { force: true })
    queryClient.invalidateQueries({ queryKey: ['general-settings'] })
    toast.success(data.message)
    isEditing.value = false
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

const onSubmit = handleSubmit((values) => {
  if (!isEditing.value) return
  console.log(values)
  // return
  mutate({
    id: generalSetting.value?.id,
    data: {
      informationAditional: values.informationAditional,
    },
  })
})

watch(
  generalSetting,
  (newData) => {
    if (newData) {
      resetForm(
        {
          values: {
            informationAditional: newData.informationAditional,
          },
        },
        {
          force: true,
        },
      )
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

// // Aquí guardamos la imagen original que vino de la base de datos (para poder restaurarla)
const originalOgImage = ref(image.value)

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Esto genera un string base64 largo (ej. "data:image/png;base64,...")
      const base64String = e.target?.result as string

      // Al asignar esto a ogImage_seo, tu preview se verá igualito
      // y tu JSON se irá con una cadena válida que tu backend sí podrá procesar y mandar a Cloudinary
      image.value = base64String
    }
    reader.readAsDataURL(file)
  }
}

// Función para volver a la imagen original
const restoreOriginalImage = () => {
  image.value = originalOgImage.value
  // Opcional: limpiar también el valor del input file si lo deseas
}

const toggleEdit = async () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    await nextTick()
    textInputRef.value?.focus()
  } else {
    resetForm(
      {
        values: {
          informationAditional: generalSetting.value?.informationAditional,
        },
      },
      { force: true },
    )
    toast.info('Edicion cancelada, cambios descartados.')
  }
}

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <ContainerMainSectionSlot>
    <HeaderSection
      title="Informacon adicional"
      description="Personaliza tus textos adicionales de tu contenido"
      :isEditing
      @toggle-edit="toggleEdit"
    />
    <form class="space-y-6" @submit.prevent="onSubmit">
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div
            class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-bold text-xs"
          >
            IC
          </div>
          <h3 class="text-slate-800 dark:text-slate-200 font-semibold text-base">
            Información adicional
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >Texto - verificacion</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-edit-line text-base"></i>
              </span>
              <textarea
                ref="textInputRef"
                :disabled="!isEditing"
                v-model="text_verify"
                placeholder="Ej. Mi texto"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <span
              v-if="errors['informationAditional.text_verify']"
              class="text-xs text-red-500 block"
              >{{ errors['informationAditional.text_verify'] }}</span
            >
          </div>
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >Texto boton - verificacion</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <input
                :disabled="!isEditing"
                v-model="text_button_verify"
                type="text"
                placeholder="Ej. Pasaje buena Ventura 155..."
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <span
              v-if="errors['informationAditional.text_button_verify']"
              class="text-xs text-red-500 block"
              >{{ errors['informationAditional.text_button_verify'] }}</span
            >
          </div>
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >Iframe Mapa - Contacto</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-map-pin-5-line text-base"></i>
              </span>
              <textarea
                :disabled="!isEditing"
                v-model="iframe_map_contact"
                rows="4"
                placeholder="Ej. Pasaje buena Ventura 155..."
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <span
              v-if="errors['informationAditional.iframe_map_contact']"
              class="text-xs text-red-500 block"
              >{{ errors['informationAditional.iframe_map_contact'] }}</span
            >
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div
            class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-bold text-xs"
          >
            IS
          </div>
          <h3 class="text-slate-800 dark:text-slate-200 font-semibold text-base">
            Información SEO
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Title SEO
              </label>
              <!-- Recomendación de caracteres al costado de la etiqueta -->
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Máx. 60 caracteres
              </span>
            </div>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <input
                :disabled="!isEditing"
                v-model="title_seo"
                type="text"
                placeholder="Ej. China Verus | Calidad y Proveedores"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Validación abajo -->
            <span
              v-if="errors['informationAditional.title_seo']"
              class="text-xs text-red-500 block"
            >
              {{ errors['informationAditional.title_seo'] }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Description SEO
              </label>
              <!-- Recomendación de caracteres al costado -->
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Máx. 160 caracteres
              </span>
            </div>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <textarea
                ref="textInputRef"
                :disabled="!isEditing"
                v-model="description_seo"
                rows="3"
                placeholder="Ej. Servicios especializados de inspección de carga, contenedores y verificación de proveedores en Asia con altos estándares de calidad."
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <!-- Validación abajo -->
            <span
              v-if="errors['informationAditional.description_seo']"
              class="text-xs text-red-500 block"
            >
              {{ errors['informationAditional.description_seo'] }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Keywords SEO
              </label>
              <!-- Indicador de formato al costado -->
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Separadas por comas
              </span>
            </div>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <input
                :disabled="!isEditing"
                v-model="keywords_seo"
                type="text"
                placeholder="Ej. inspección de carga, contenedores, china, proveedores"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Validación abajo -->
            <span
              v-if="errors['informationAditional.keywords_seo']"
              class="text-xs text-red-500 block"
            >
              {{ errors['informationAditional.keywords_seo'] }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Open Graph Title (Redes)
              </label>
              <!-- Recomendación de caracteres al costado -->
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Máx. 60 caracteres
              </span>
            </div>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <input
                :disabled="!isEditing"
                v-model="ogTitle_title_seo"
                type="text"
                placeholder="Ej. China Verus | Calidad y Proveedores"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Validación abajo -->
            <span
              v-if="errors['informationAditional.ogTitle_title_seo']"
              class="text-xs text-red-500 block"
            >
              {{ errors['informationAditional.ogTitle_title_seo'] }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Open Graph Description (Redes)
              </label>
              <!-- Recomendación de caracteres al costado -->
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Máx. 160 caracteres
              </span>
            </div>

            <div class="relative">
              <span
                class="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-emerald-500 dark:text-emerald-400"
              >
                <i class="ri-file-edit-fill text-base"></i>
              </span>
              <textarea
                ref="textInputRef"
                :disabled="!isEditing"
                v-model="ogDescription_seo"
                rows="3"
                placeholder="Ej. Servicios especializados de inspección de carga, contenedores y verificación de proveedores en Asia con altos estándares de calidad."
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <!-- Validación abajo -->
            <span
              v-if="errors['informationAditional.ogDescription_seo']"
              class="text-xs text-red-500 block"
            >
              {{ errors['informationAditional.ogDescription_seo'] }}
            </span>
          </div>
        <div class="space-y-2">
  <div class="flex items-center justify-between">
    <label
      class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
    >
      Open Graph & Twitter Image
    </label>
    <!-- Recomendación de archivo al costado -->
    <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
      Recomendado: 1200x630px (JPG/PNG)
    </span>
  </div>

  <div class="space-y-3">
    <!-- Vista previa con mayor altura (h-48) para que no se vea tan aplastada -->
    <div
      v-if="image"
      class="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2"
    >
      <img
        :src="image"
        alt="Preview OG Image"
        class="w-full h-full object-cover rounded-lg"
      />

      <!-- Botón flotante para restaurar la imagen original si ha seleccionado una nueva -->
      <div v-if="isEditing" class="absolute top-4 right-4 flex items-center gap-1.5">
        <button
          v-if="originalOgImage && image !== originalOgImage"
          type="button"
          @click="restoreOriginalImage"
          class="bg-amber-600/90 hover:bg-amber-600 text-white p-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 px-2.5 py-1"
          title="Restaurar imagen anterior"
        >
          <i class="ri-arrow-go-back-line"></i>
          <span class="text-[10px] font-medium">Restaurar</span>
        </button>
      </div>
    </div>

    <!-- Input file personalizado -->
    <div class="relative">
      <span
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
      >
        <i class="ri-image-add-line text-base"></i>
      </span>
      <input
        :disabled="!isEditing"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        class="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      />
    </div>
  </div>

  <!-- Validación abajo -->
  <span
    v-if="errors['informationAditional.image']"
    class="text-xs text-red-500 block"
  >
    {{ errors['informationAditional.image'] }}
  </span>
</div>
        </div>
      </div>
      <div class="flex justify-end w-full pt-5">
        <ButtonMain :disabled :isEditing :isPending />
      </div>
    </form>
  </ContainerMainSectionSlot>
</template>
