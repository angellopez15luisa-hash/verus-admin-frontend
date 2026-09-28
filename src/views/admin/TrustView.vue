<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import HeaderSection from '@/components/ui/shared/HeaderSection.vue'
import GalleryContentTrust from '@/components/ui/trust/GalleryContentTrust.vue'
import ModalGalleryContentTrust from '@/components/ui/trust/ModalGalleryContentTrust.vue'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import type { ContentItemsTrust } from '@/types'
import { GeneralSettingValue } from '@/values'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { configure, useForm } from 'vee-validate'
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const isEditing = ref(false)
const queryClient = useQueryClient()
const itemsTrustList = ref<ContentItemsTrust[]>([])
const itemsTrustListBackup = ref<ContentItemsTrust[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedTrustForEdit = ref<ContentItemsTrust | null>(null)

const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { resetForm, handleSubmit, meta, errors } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
  // <--- ¡ESTO EVITA QUE SE LLENE DE ERRORES AL CARGAR!
})

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        textHeaderSections: newValues.textHeaderSections,
        contentItemsTrusts: newValues.contentItemsTrusts,
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
  mutate({
    id: generalSetting.value?.id,
    data: {
      textHeaderSections: values.textHeaderSections,
      contentItemsTrusts: itemsTrustList.value,
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
            textHeaderSections: newData.textHeaderSections,
          },
        },
        { force: true },
      )
      itemsTrustList.value =
        typeof newData.contentItemsTrusts === 'string'
          ? JSON.parse(newData.contentItemsTrusts)
          : newData.contentItemsTrusts || []
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const toggleEdit = async () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    itemsTrustListBackup.value = JSON.parse(JSON.stringify(itemsTrustList.value))
    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    itemsTrustList.value = JSON.parse(JSON.stringify(itemsTrustListBackup.value))
    resetForm(
      {
        values: {
          textHeaderSections: generalSetting.value?.textHeaderSections,
          contentItemsTrusts: generalSetting.value?.contentItemsTrusts,
        },
      },
      { force: true },
    )
    toast.info('Edicion cancelada, cambios descartados.')
  }
}

const currentHeaderIndex = computed(
  () =>
    generalSetting.value?.textHeaderSections?.findIndex((item) => item.section === 'trust') ?? -1,
)

const currentHeader = computed(() => {
  if (currentHeaderIndex.value === -1) return null
  return generalSetting.value?.textHeaderSections![currentHeaderIndex.value]
})

const reorderList = (fromIndex: number, toIndex: number) => {
  const newArr: any[] = [...itemsTrustList.value]

  const temp = newArr[fromIndex]
  newArr[fromIndex] = newArr[toIndex]
  newArr[toIndex] = temp

  itemsTrustList.value = newArr
}

const openCreateModal = () => {
  modalMode.value = 'create'
  isModalOpen.value = true
  selectedTrustForEdit.value = null
}

const openEditModal = (item: ContentItemsTrust) => {
  modalMode.value = 'edit'
  isModalOpen.value = true
  selectedTrustForEdit.value = item
}

const handleGlobalCreate = (item: ContentItemsTrust) => {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentItemsTrusts: [item, ...(oldData.contentItemsTrusts || [])],
    }
  })
}

function handleGlobalUpdate(id: ContentItemsTrust['id'], updatedItem: ContentItemsTrust) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentItemsTrusts: oldData.contentItemsTrusts.map((item: ContentItemsTrust) =>
        item.id === id ? updatedItem : item,
      ),
    }
  })
}

function handleGlobalDelete(id: ContentItemsTrust['id']) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentItemsTrusts: oldData.contentItemsTrusts.filter(
        (item: ContentItemsTrust) => item.id !== id,
      ),
    }
  })
}

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <!-- Puedes borrar esto de abajo que era para debugear los errores en pantalla -->
  <ContainerMainSectionSlot>
    <HeaderSection title="Confianza" :isEditing @toggle-edit="toggleEdit" />
    <form class="space-y-6" @submit.prevent="onSubmit">
      <FormTextHeader
        v-if="currentHeader && currentHeaderIndex !== -1"
        :title-field-name="`textHeaderSections.${currentHeaderIndex}.title`"
        :description-field-name="`textHeaderSections.${currentHeaderIndex}.description`"
        :is-editing
        ref="formTextHeaderRef"
      />
      <GalleryContentTrust
        v-model:itemsTrustList="itemsTrustList"
        :isEditing
        @move="reorderList"
        @open-create-modal="openCreateModal"
        @open-edit-modal="openEditModal"
        @delete="handleGlobalDelete"
      />
      <div class="flex justify-end w-full pt-5">
        <button
          type="submit"
          class="w-full md:w-auto px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
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
  </ContainerMainSectionSlot>
  <ModalGalleryContentTrust
    v-model:isOpen="isModalOpen"
    v-model:model="selectedTrustForEdit"
    :mode="modalMode"
    @create="handleGlobalCreate"
    @update="handleGlobalUpdate"
  />
</template>
