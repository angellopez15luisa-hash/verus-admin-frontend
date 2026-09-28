<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import GalleryContentService from '@/components/ui/services/GalleryContentService.vue'
import ModalGalleryContentService from '@/components/ui/services/ModalGalleryContentService.vue'
import ButtonMain from '@/components/ui/shared/ButtonMain.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import HeaderSection from '@/components/ui/shared/HeaderSection.vue'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import type {
  ContentFrequentlyQuestion,
  GeneralSetting,
  ImageService,
  Service,
} from '@/types/general-setting'
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
const serviceList = ref<Service[]>([])
const imageServiceList = ref<ImageService[]>([])
const questionServiceList = ref<ContentFrequentlyQuestion[]>([])

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedItemForEdit = ref<Service>({} as Service)
const modalRef = ref<any>(null)

const { data: generalSetting, refetch } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { resetForm, handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        textHeaderSections: newValues.textHeaderSections,
        services: newValues.services,
        imagesService: newValues.imagesService,
        contentFrequentlyQuestions: newValues.contentFrequentlyQuestions,
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
      services: serviceList.value,
      imagesService: imageServiceList.value,
      contentFrequentlyQuestions: questionServiceList.value,
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
      serviceList.value =
        typeof newData.services === 'string' ? JSON.parse(newData.services) : newData.services || []

      imageServiceList.value =
        typeof newData.imagesService === 'string'
          ? JSON.parse(newData.imagesService)
          : newData.imagesService || []

      questionServiceList.value =
        typeof newData.contentFrequentlyQuestions === 'string'
          ? JSON.parse(newData.contentFrequentlyQuestions)
          : newData.contentFrequentlyQuestions || []
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
    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    // 1. Forzamos a ir a la BD a traer la data fresca original
    await refetch()

    // 2. Extraemos los datos frescos de la caché actualizada
    const rawServices = generalSetting.value?.services
    const rawImages = generalSetting.value?.imagesService
    const rawQuestions = generalSetting.value?.contentFrequentlyQuestions

    // 3. Sincronizamos las listas visuales
    serviceList.value =
      typeof rawServices === 'string' ? JSON.parse(rawServices) : rawServices || []
    imageServiceList.value = typeof rawImages === 'string' ? JSON.parse(rawImages) : rawImages || []
    questionServiceList.value =
      typeof rawQuestions === 'string' ? JSON.parse(rawQuestions) : rawQuestions || []

    // 4. Reseteamos el formulario descartando los cambios en memoria
    resetForm(
      {
        values: {
          textHeaderSections: generalSetting.value?.textHeaderSections,
          services: serviceList.value,
          imagesService: imageServiceList.value,
          contentFrequentlyQuestions: questionServiceList.value,
        },
      },
      { force: true },
    )

    toast.info('Edición cancelada, cambios descartados.')
  }
}

const reorderList = (fromIndex: number, toIndex: number) => {
  const newArr: any[] = [...serviceList.value]
  const temp = newArr[fromIndex]
  newArr[fromIndex] = newArr[toIndex]
  newArr[toIndex] = temp
  serviceList.value = newArr
}

const openCreateModal = () => {
  modalMode.value = 'create'
  isModalOpen.value = true
  selectedItemForEdit.value = GeneralSettingValue.serviceForm
  nextTick(() => {
    modalRef.value?.setEditorContent('')
    modalRef.value.setEditorContentWhichIncludes('')
    modalRef.value.setEditorContentSpecificProcess('')
  })
}

const openEditModal = (item: Service) => {
  modalMode.value = 'edit'
  isModalOpen.value = true
  selectedItemForEdit.value = item
  nextTick(() => {
    modalRef.value?.setEditorContent(item.description_long || '')
    modalRef.value.setEditorContentWhichIncludes(item.which_includes || '')
    modalRef.value.setEditorContentSpecificProcess(item.specific_process || '')
  })
}

const handleGlobalCreate = (item: Service) => {
  // 1. Actualizamos el listado local visual
  serviceList.value = [item, ...serviceList.value.filter((s) => String(s.id) !== String(item.id))]

  // 2. Actualizamos la caché de TanStack Query
  queryClient.setQueryData(['general-settings'], (oldData: GeneralSetting) => {
    if (!oldData) return oldData

    let currentServices = oldData.services
    if (typeof currentServices === 'string') {
      try {
        currentServices = JSON.parse(currentServices)
      } catch {
        currentServices = []
      }
    }

    const servicesArray = Array.isArray(currentServices) ? currentServices : []
    const exists = servicesArray.some((s: Service) => String(s.id) === String(item.id))
    if (exists) return oldData

    return {
      ...oldData,
      services: [item, ...servicesArray],
    }
  })
}

const handleGlobalUpdate = (id: Service['id'], updatedItem: Service) => {
  // 1. Actualizamos la lista local evitando cruces por referencia
  serviceList.value = serviceList.value.map((item) => {
    if (String(item.id) === String(id)) {
      return {
        ...item,
        ...updatedItem,
        id: item.id,
      }
    }
    return item
  })

  // 2. Actualizamos la caché de TanStack Query
  queryClient.setQueryData(['general-settings'], (oldData: GeneralSetting) => {
    if (!oldData) return oldData

    let currentServices = oldData.services
    if (typeof currentServices === 'string') {
      try {
        currentServices = JSON.parse(currentServices)
      } catch {
        currentServices = []
      }
    }

    const servicesArray = Array.isArray(currentServices) ? currentServices : []

    return {
      ...oldData,
      services: servicesArray.map((item: Service) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            ...updatedItem,
            id: item.id,
          }
        }
        return item
      }),
    }
  })
}

const handleGlobalDelete = (id: Service['id']) => {
  // 1. Actualizar la lista local inmediatamente
  serviceList.value = serviceList.value.filter((item) => String(item.id) !== String(id))

  // 2. Actualizar la caché de TanStack Query
  queryClient.setQueryData(['general-settings'], (oldData: GeneralSetting) => {
    if (!oldData) return oldData

    let currentServices = oldData.services
    if (typeof currentServices === 'string') {
      try {
        currentServices = JSON.parse(currentServices)
      } catch {
        currentServices = []
      }
    }

    const servicesArray = Array.isArray(currentServices) ? currentServices : []

    return {
      ...oldData,
      services: servicesArray.filter((item: Service) => String(item.id) !== String(id)),
    }
  })
}

// const handleImagesGlobalDelete = (id: ImageService['id']) => {
//   // 1. Actualiza la lista local instantáneamente para que la UI se refresque de golpe
//   imageServiceList.value = imageServiceList.value.filter((img) => String(img.id) !== String(id))

//   queryClient.setQueryData(['general-settings'], (oldData: any) => {
//     if (!oldData) return oldData

//     // Parseo seguro por si imagesService viene como string desde la base de datos
//     let currentImages = oldData.imagesService
//     if (typeof currentImages === 'string') {
//       try {
//         currentImages = JSON.parse(currentImages)
//       } catch {
//         currentImages = []
//       }
//     }
//     const imagesArray = Array.isArray(currentImages) ? currentImages : []

//     // Filtramos la lista global excluyendo el ID que llegó del hijo
//     return {
//       ...oldData,
//       imagesService: imagesArray.filter((img: any) => img.id !== id),
//     }
//   })
// }

const handleImagesGlobalSubmit = (finalImagesList: any[], serviceIdTarget: any) => {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData

    // 1. Usamos el ID que pasemos explícitamente, o lo rescatamos del primer elemento si aún tiene datos,
    // o del item seleccionado actualmente en edición
    const currentServiceId =
      serviceIdTarget || finalImagesList[0]?.service_id || selectedItemForEdit.value?.id

    const existingImages = oldData.imagesService || []

    // 2. Limpiamos cualquier rastro previo de este servicio de forma segura
    const filteredImages = existingImages.filter((img: any) => img.service_id != currentServiceId)

    return {
      ...oldData,
      // 3. Si llega vacío, solo se queda con los filtrados (borrando todo lo de este servicio)
      imagesService: [...filteredImages, ...finalImagesList],
    }
  })
}

const handleQuestionssGlobalSubmit = (items: ContentFrequentlyQuestion[], serviceId: ContentFrequentlyQuestion['service_id']) => {
  queryClient.setQueryData(['general-settings'], (oldData: GeneralSetting) => {
    if (!oldData) return oldData

    // 1. Usamos el ID que pasemos explícitamente, o lo rescatamos del primer elemento si aún tiene datos,
    // o del item seleccionado actualmente en edición
    const currentServiceId =
      serviceId|| items[0]?.service_id || selectedItemForEdit.value?.id

    const existingItems = oldData.contentFrequentlyQuestions || []

    // 2. Limpiamos cualquier rastro previo de este servicio de forma segura
    const filteredItems = existingItems.filter((item) => item.service_id != currentServiceId)

    return {
      ...oldData,
      // 3. Si llega vacío, solo se queda con los filtrados (borrando todo lo de este servicio)
      contentFrequentlyQuestions: [...filteredItems, ...items],
    }
  })
}





// ID del servicio que se está editando actualmente en el modal
const currentServiceId = computed(() => selectedItemForEdit.value?.id)

// 🖥️ Lista filtrada exclusivamente para el servicio activo
const imagesForCurrentService = computed(() => {
  if (!currentServiceId.value) return []

  return imageServiceList.value.filter(
    (img) => String(img.service_id) === String(currentServiceId.value),
  )
})

const questionsForCurrentService = computed(() => {
  if (!currentServiceId.value) return []

  return questionServiceList.value.filter(
    (item) => String(item.service_id) === String(currentServiceId.value),
  )
})

const currentHeaderIndex = computed(
  () =>
    generalSetting.value?.textHeaderSections?.findIndex((item) => item.section === 'services') ??
    -1,
)

const currentHeader = computed(() => {
  if (currentHeaderIndex.value === -1) return null
  return generalSetting.value?.textHeaderSections![currentHeaderIndex.value]
})

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <ContainerMainSectionSlot>
    <HeaderSection title="Servicios" :isEditing @toggle-edit="toggleEdit" />
    <form class="space-y-6" @submit.prevent="onSubmit">
      <FormTextHeader
        v-if="currentHeader && currentHeaderIndex !== -1"
        :title-field-name="`textHeaderSections.${currentHeaderIndex}.title`"
        :description-field-name="`textHeaderSections.${currentHeaderIndex}.description`"
        :is-editing
        ref="formTextHeaderRef"
      />
      <GalleryContentService
        v-model:serviceList="serviceList"
        :isEditing
        @move="reorderList"
        @open-create-modal="openCreateModal"
        @open-edit-modal="openEditModal"
        @delete="handleGlobalDelete"
      />
      <div class="flex justify-end w-full pt-5">
        <ButtonMain :disabled :isEditing :isPending />
      </div>
    </form>
  </ContainerMainSectionSlot>
  <ModalGalleryContentService
    ref="modalRef"
    v-model:isOpen="isModalOpen"
    v-model:model="selectedItemForEdit"
    :mode="modalMode"
    :imagesList="imagesForCurrentService"
    :questionList="questionsForCurrentService"
    @create="handleGlobalCreate"
    @update="handleGlobalUpdate"
    @save-images="handleImagesGlobalSubmit"
    @save-question="handleQuestionssGlobalSubmit"
    />
    <!-- @delete="handleImagesGlobalDelete" -->
</template>
