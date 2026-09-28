<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { configure, useForm } from 'vee-validate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'

import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import FormCatalogGalleryPackages from '@/components/ui/packages/FormCatalogGalleryPackages.vue'

import { GeneralSettingAction } from '@/business/actions'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import { GeneralSettingValue } from '@/values'
import type { CatalogGalleryPackage } from '@/types/general-setting'

/* ========================================================================== */
/* CONFIGURACIÓN GLOBAL DE VEE-VALIDATE                                      */
/* ========================================================================== */
configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

/* ========================================================================== */
/* REFERENCIAS Y ESTADOS REACTIVOS PRINCIPALES                               */
/* ========================================================================== */
const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const queryClient = useQueryClient()
const isEditing = ref(false)

// Estados locales para la gestión de la galería de paquetes y filtros
const catalogGalleryList = ref<CatalogGalleryPackage[]>([])
const originalCatalogBackup = ref<CatalogGalleryPackage[]>([])
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('Todos')
const currentPage = ref<number>(1)

/* ========================================================================== */
/* TANSTACK QUERY Y VEE-VALIDATE (FORMULARIO)                                */
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

const [titleHeader] = defineField('titleHeaderPackages')
const [descriptionHeader] = defineField('descriptionHeaderPackages')

// Mutación para actualizar los datos en el servidor
const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data

    // Actualiza la caché local de manera optimista
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        titleHeaderPackages: newValues.titleHeaderPackages,
        descriptionHeaderPackages: newValues.descriptionHeaderPackages,
        catalogGalleryPackages: newValues.catalogGalleryPackages,
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
/* MÉTODOS Y ACCIONES DE CONTROL                                             */
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
            titleHeaderPackages: generalSetting.value.titleHeaderPackages || '',
            descriptionHeaderPackages: generalSetting.value.descriptionHeaderPackages || '',
            catalogGalleryPackages: generalSetting.value.catalogGalleryPackages || [],
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
const handleGlobalCreate = (newPackage: CatalogGalleryPackage) => {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryPackages: [newPackage, ...(oldData.catalogGalleryPackages || [])],
    }
  })
}

function handleGlobalUpdate(
  id: CatalogGalleryPackage['id'],
  updatedPackage: CatalogGalleryPackage,
) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryPackages: oldData.catalogGalleryPackages.map((pkg: CatalogGalleryPackage) =>
        pkg.id === id ? updatedPackage : pkg,
      ),
    }
  })
}

function handleGlobalDelete(id: CatalogGalleryPackage['id']) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      catalogGalleryPackages: oldData.catalogGalleryPackages.filter(
        (pkg: CatalogGalleryPackage) => pkg.id !== id,
      ),
    }
  })
}

// Envío del formulario principal
const onSubmit = () => {
  if (!isEditing.value) return

  mutate({
    id: generalSetting.value?.id,
    data: {
      titleHeaderPackages: titleHeader.value,
      descriptionHeaderPackages: descriptionHeader.value,
      catalogGalleryPackages: catalogGalleryList.value,
    },
  })
}

/* ========================================================================== */
/* WATCHERS Y PROPIEDADES COMPUTADAS                                         */
/* ========================================================================== */

// Sincroniza los datos iniciales o del servidor con el formulario y la lista local
watch(
  generalSetting,
  (newData) => {
    if (newData) {
      setValues({
        titleHeaderPackages: newData.titleHeaderPackages,
        descriptionHeaderPackages: newData.descriptionHeaderPackages,
      })

      catalogGalleryList.value =
        typeof newData.catalogGalleryPackages === 'string'
          ? JSON.parse(newData.catalogGalleryPackages)
          : newData.catalogGalleryPackages || []
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
    <!-- CABECERA Y SECCIÓN: Mantenimiento de Textos de Paquetes -->
    <HeaderTitlesSlot>
      <template #title>Mantenimiento de Sección Paquetes</template>
      <template #description>
        Personaliza el título principal, descripción y gestiona el catálogo de paquetes del sitio
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
        title-field-name="titleHeaderPackages"
        desc-field-name="descriptionHeaderPackages"
        :errors="errors"
        :disabled="!isEditing"
      />

      <!-- Componente del catálogo de la galería de paquetes -->
      <FormCatalogGalleryPackages
        :packages="catalogGalleryList"
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
                ? 'Guardar Cambios de Paquetes'
                : 'Guardar Cambios'
          }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
