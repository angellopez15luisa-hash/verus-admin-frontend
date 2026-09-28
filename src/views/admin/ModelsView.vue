<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { configure, useForm } from 'vee-validate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'

import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import FormCatalogGalleryModel from '@/components/ui/models/FormCatalogGalleryModel.vue'

import { GeneralSettingAction } from '@/business/actions'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import { GeneralSettingValue } from '@/values'
import type { CatalogGalleryModel } from '@/types/general-setting'

/* ========================================================================== */
/* CONFIGURACIÓN GLOBAL DE VEE-VALIDATE                                       */
/* ========================================================================== */
configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

/* ========================================================================== */
/* REFERENCIAS Y ESTADOS REACTIVOS PRINCIPALES                                */
/* ========================================================================== */
const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const queryClient = useQueryClient()
const isEditing = ref(false)

// Estados locales para la gestión de la galería y filtros
const catalogGalleryList = ref<CatalogGalleryModel[]>([])
const originalCatalogBackup = ref<CatalogGalleryModel[]>([])
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('Todos')
const currentPage = ref<number>(1)

/* ========================================================================== */
/* TANSTACK QUERY Y VEE-VALIDATE (FORMULARIO)                                 */
/* ========================================================================== */

// Consulta para obtener la configuración general desde el servidor
const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

// Configuración del formulario reactivo con VeeValidate y Zod
const { defineField, resetForm, errors, setValues, meta } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

const [titleHeader] = defineField('titleHeaderModels')
const [descriptionHeader] = defineField('descriptionHeaderModels')

// Mutación para actualizar los datos en el servidor
const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data

    // Actualiza la caché local de manera optimista
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        titleHeaderModels: newValues.titleHeaderModels,
        descriptionHeaderModels: newValues.descriptionHeaderModels,
        catalogGalleryModels: newValues.catalogGalleryModels,
      }
    })

    resetForm({ values: newValues })
    queryClient.invalidateQueries({ queryKey: ['general-settings'] })
    toast.success(data.message)
    isEditing.value = false
  },
  onError: (error: any) => {
    toast.error(error.message)
  },
})

/* ========================================================================== */
/* MÉTODOS Y ACCIONES DE CONTROL                                              */
/* ========================================================================== */

// Alterna entre el modo de edición y bloqueo
const toggleEdit = async () => {
  isEditing.value = !isEditing.value

  if (isEditing.value) {
    // Crea una copia de respaldo exacta en caso de cancelar la edición
    originalCatalogBackup.value = JSON.parse(JSON.stringify(catalogGalleryList.value))

    if (generalSetting.value) {
      resetForm(
        {
          values: {
            titleHeaderModels: generalSetting.value.titleHeaderModels || '',
            descriptionHeaderModels: generalSetting.value.descriptionHeaderModels || '',
            catalogGalleryModels: generalSetting.value.catalogGalleryModels || [],
          },
        },
        { force: true },
      )
    }

    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    // Restaura los datos anteriores si se cancela
    catalogGalleryList.value = JSON.parse(JSON.stringify(originalCatalogBackup.value))

    if (generalSetting.value) {
      resetForm(
        {
          values: { ...generalSetting.value },
        },
        { force: true },
      )
    }

    toast.info('Edición cancelada, cambios descartados.')
  }
}

// Handlers globales para manejar el estado del catálogo en caché
const handleGlobalCreate = (newModel: CatalogGalleryModel) => {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryModels: [newModel, ...(oldData.catalogGalleryModels || [])],
    }
  })
}

function handleGlobalUpdate(id: CatalogGalleryModel['id'], updatedModel: CatalogGalleryModel) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryModels: oldData.catalogGalleryModels.map((model: CatalogGalleryModel) =>
        model.id === id ? updatedModel : model,
      ),
    }
  })
}

function handleGlobalDelete(id: CatalogGalleryModel['id']) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryModels: oldData.catalogGalleryModels.filter(
        (model: CatalogGalleryModel) => model.id !== id,
      ),
    }
  })
}

watch(
  generalSetting,
  (value) => {
    console.log(value?.catalogGalleryModels)
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  catalogGalleryList,
  (value) => {
    console.log(value)
  },
  {
    deep: true,
    immediate: true,
  },
)

// Envío del formulario principal
const onSubmit = () => {
  if (!isEditing.value) return
  // console.log(descriptionHeader.value)
  console.log(generalSetting.value?.catalogGalleryModels)
  console.log(catalogGalleryList.value)
  mutate({
    id: generalSetting.value?.id,
    data: {
      titleHeaderModels: titleHeader.value,
      descriptionHeaderModels: descriptionHeader.value,
      catalogGalleryModels: catalogGalleryList.value,
    },
  })
}

/* ========================================================================== */
/* WATCHERS Y PROPIEDADES COMPUTADAS                                          */
/* ========================================================================== */

// Sincroniza los datos iniciales o del servidor con el formulario y la lista local
watch(
  generalSetting,
  (newData) => {
    if (newData) {
      setValues({
        titleHeaderModels: newData.titleHeaderModels,
        descriptionHeaderModels: newData.descriptionHeaderModels,
      })

      catalogGalleryList.value =
        typeof newData.catalogGalleryModels === 'string'
          ? JSON.parse(newData.catalogGalleryModels)
          : newData.catalogGalleryModels || []
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

// Reinicia la paginación al cambiar los filtros de búsqueda o categoría
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

// Controla si el botón principal de guardar debe estar deshabilitado
const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <div class="w-full p-6 space-y-6">
    <!-- CABECERA Y SECCIÓN 1: Mantenimiento de Textos -->
    <HeaderTitlesSlot>
      <template #title>Mantenimiento de Sección Modelos</template>
      <template #description>
        Personaliza el título principal, descripción y gestiona el catálogo de modelos del sitio
        web.
      </template>
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
          <font-awesome-icon :icon="isEditing ? 'lock' : 'pen-to-square'" />
          {{ isEditing ? 'Bloquear Edición' : 'Habilitar Edición' }}
        </button>
      </template>
    </HeaderTitlesSlot>

    <!-- FORMULARIO PRINCIPAL -->
    <form class="space-y-6" @submit.prevent="onSubmit">
      <!-- Componente para editar textos de cabecera -->
      <FormTextHeader
        ref="formTextHeaderRef"
        v-model:title="titleHeader"
        v-model:description="descriptionHeader"
        title-field-name="titleHeaderModels"
        desc-field-name="descriptionHeaderModels"
        :errors="errors"
        :disabled="!isEditing"
      />

      <!-- Componente del catálogo de la galería -->
      <FormCatalogGalleryModel
        :models="catalogGalleryList"
        :isEditing="isEditing"
        @create="handleGlobalCreate"
        @update="handleGlobalUpdate"
        @delete="handleGlobalDelete"
        @move="
          (fromIndex, toIndex) => {
            const newArr = [...catalogGalleryList]
            const [movedItem] = newArr.splice(fromIndex, 1)
            if (movedItem) {
              newArr.splice(toIndex, 0, movedItem)
            }
            catalogGalleryList = newArr
          }
        "
      />

      <!-- BOTÓN DE GUARDAR CAMBIOS -->
      <div class="flex justify-end w-full pt-0">
        <button
          type="submit"
          class="w-full md:w-auto px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          :disabled="disabled"
        >
          <!-- Icono dinámico (Disquete o Candado) -->
          <font-awesome-icon v-if="!isPending" :icon="isEditing ? 'floppy-disk' : 'lock'" />

          <!-- Spinner de carga activo durante la mutación -->
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

          <!-- Texto dinámico del botón -->
          <span>{{
            isPending
              ? 'Guardando...'
              : isEditing
                ? 'Guardar Cambios de Servicios'
                : 'Guardar Cambios'
          }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
