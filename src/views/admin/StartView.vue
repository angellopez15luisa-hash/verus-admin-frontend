<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { configure, useFieldArray, useForm } from 'vee-validate'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import { GeneralSettingValue } from '@/values'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { GeneralSettingAction } from '@/business/actions'
import FormSocialLinks from '@/components/ui/start/FormSocialLinks.vue'
import FormTextsBanner from '@/components/ui/start/FormTextsBanner.vue'
import { toTypedSchema } from '@vee-validate/zod'
import ListImageBanners from '@/components/ui/start/ListImageBanners.vue'
import { toast } from 'vue3-toastify'
import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

const formSocialLinksRef = ref<any>(null)
const queryClient = useQueryClient()

// Estado para controlar si la sección está en modo edición o bloqueada
const isEditing = ref(false)

const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { defineField, resetForm, errors, handleSubmit, meta, validate } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

// const [title1Start] = defineField('title1Start')
// const [title2Start] = defineField('title2Start')
// const [descriptionStart] = defineField('descriptionStart')
// const [textButtonLeftStart] = defineField('textButtonLeftStart')
// const [textButtonRightStart] = defineField('textButtonRightStart')
// const { fields: socialFields } = useFieldArray('socialLinks')
const { fields: bannerFields, move: moveBanner } = useFieldArray('banners')

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        title1Start: newValues.title1Start,
        title2Start: newValues.title2Start,
        descriptionStart: newValues.descriptionStart,
        textButtonLeftStart: newValues.textButtonLeftStart,
        textButtonRightStart: newValues.textButtonRightStart,
        socialLinks: newValues.socialLinks,
        banners: newValues.banners,
      }
    })
    resetForm({ values: newValues })
    queryClient.invalidateQueries({ queryKey: ['general-settings'] })
    toast.success(data.message)
    // Esto solo corre si el backend guardó con éxito
    isEditing.value = false
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

watch(
  generalSetting,
  (newData) => {
    if (newData) {
      resetForm(
        {
          values: {
            title1Start: newData.title1Start,
            title2Start: newData.title2Start,
            descriptionStart: newData.descriptionStart,
            textButtonLeftStart: newData.textButtonLeftStart,
            textButtonRightStart: newData.textButtonRightStart,
            socialLinks: newData.socialLinks,
            banners: newData.banners,
          },
        },
        { force: true },
      )
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => bannerFields.value,
  () => {
    validate()
  },
  { deep: true },
)
// Función para alternar el modo edición con reseteo al cancelar
const toggleEdit = async () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    await nextTick()
    formSocialLinksRef.value?.focusFirstInput()
  } else {
    // Si estaba editando y decide cancelar, restauramos la data original del servidor
    if (generalSetting.value) {
      resetForm(
        {
          values: { ...generalSetting.value },
        },
        { force: true },
      )
      toast.info('Edición cancelada, cambios descartados.')
    }
  }
}

const onSubmit = handleSubmit((values) => {
  if (!isEditing.value) return
  const id = generalSetting.value?.id
  const data = values
  mutate({ id, data })
})

// El botón se deshabilita si no es válido, si no está en modo edición, o si está guardando
const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>
<template>
  <div class="w-full p-6 space-y-6">
    <!-- Encabezado de la Sección con el Botón Habilitar Edición -->
    <HeaderTitlesSlot>
      <template #title>Mantenimiento de Sección Inicio</template>
      <template #description
        >Gestiona los textos globales, enlaces y el listado interactivo de imágenes para los
        banners.</template
      >
      <template #button>
        <button
          @click="toggleEdit"
          :class="[
            'px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-2 border shadow-sm cursor-pointer',
            isEditing
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
          ]"
        >
          <!-- Cambiamos el icono según el estado -->
          <font-awesome-icon :icon="isEditing ? 'lock' : 'pen-to-square'" />
          <!-- Cambiamos el texto dinámicamente -->
          {{ isEditing ? 'Bloquear Edición' : 'Habilitar Edición' }}
        </button>
      </template>
    </HeaderTitlesSlot>
    <!-- Formulario Principal -->
    <form class="space-y-6" @submit.prevent="onSubmit">
      <!-- REDES SOCIALES -->
      <FormSocialLinks :disabled="!isEditing" ref="formSocialLinksRef" />
      <!-- :socialFields="socialFields" -->
      <!-- TEXTOS DE BANNER -->
      <FormTextsBanner :disabled="!isEditing" />
      <!-- v-model:title="titleStart"
        v-model:description="descriptionStart"
        :errors="errors" -->

      <!-- SECCIÓN DE BANNERS -->
      <div class="relative w-full">
        <ListImageBanners :disabled="!isEditing" />
        <!-- :banners="bannerFields" -->
        <!-- :bannerError="errors" -->
        <!-- @move="({ from, to }) => moveBanner(from, to)" -->
        <!-- <div
          v-if="errors.banners"
          class="mt-4 z-10 flex items-center gap-2.5 text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-sm animate-fade-in"
        >
          <span>⚠️ {{ errors.banners }}</span>
        </div> -->
      </div>

      <!-- BOTÓN DE GUARDAR (Siempre visible abajo a la derecha, estilo referencia) -->
      <div class="flex justify-end w-full pt-0">
        <button
          type="submit"
          class="w-full md:w-auto px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          :disabled="disabled"
        >
          <font-awesome-icon v-if="!isPending" :icon="isEditing ? 'floppy-disk' : 'lock'" />
          <svg v-else class="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ isPending ? 'Guardando...' : 'Guardar Cambios' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
