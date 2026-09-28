<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'
import FormFrequentlyQuestions from '@/components/ui/frequently-questions/FormFrequentlyQuestions.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
import type { ContentFrequentlyQuestion } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { configure, useForm } from 'vee-validate'
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import ModalFrequentlyQuestions from '@/components/ui/frequently-questions/ModalFrequentlyQuestions.vue'

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const isEditing = ref(false)
const queryClient = useQueryClient()
const questionListBackup = ref<ContentFrequentlyQuestion[]>([])
const questionList = ref<ContentFrequentlyQuestion[]>([])
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedQuestionForEdit = ref<any>(null)

const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { resetForm, handleSubmit, meta, } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

// 💡 Conectamos contentFrequentlyQuestions directamente al estado reactivo de VeeValidate
// const { value: contentFrequentlyQuestions } = useField<ContentFrequentlyQuestion[]>(
//   'contentFrequentlyQuestions',
// )

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        textHeaderSections: newValues.textHeaderSections,
        contentFrequentlyQuestions: newValues.contentFrequentlyQuestions,
      }
    })
    resetForm({ values: newValues })
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
  mutate({
    id: generalSetting.value!.id,
    data: {
      textHeaderSections: values.textHeaderSections,
      contentFrequentlyQuestions: questionList.value,
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
            // contentFrequentlyQuestions: newData.contentFrequentlyQuestions,
          },
        },
        { force: true },
      )
      questionList.value =
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
    // Hacemos respaldo usando el valor controlado por VeeValidate
    questionListBackup.value = JSON.parse(JSON.stringify(questionList.value || []))
    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    // Restauramos el respaldo en el campo de VeeValidate
    questionList.value = JSON.parse(JSON.stringify(questionListBackup.value))
    resetForm(
      {
        values: {
          textHeaderSections: generalSetting.value?.textHeaderSections,
          contentFrequentlyQuestions: generalSetting.value?.contentFrequentlyQuestions,
        },
      },
      {
        force: true,
      },
    )
    toast.info('Edicion cancelada, cambios descartados.')
  }
}

// Handlers globales para manejar el estado del catálogo en caché
const handleGlobalCreate = (newQuestion: ContentFrequentlyQuestion) => {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentFrequentlyQuestions: [newQuestion, ...(oldData.contentFrequentlyQuestions || [])],
    }
  })
}

function handleGlobalUpdate(
  id: ContentFrequentlyQuestion['id'],
  updatedQuestion: ContentFrequentlyQuestion,
) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentFrequentlyQuestions: oldData.contentFrequentlyQuestions.map(
        (item: ContentFrequentlyQuestion) => (item.id === id ? updatedQuestion : item),
      ),
    }
  })
}

function handleGlobalDelete(id: ContentFrequentlyQuestion['id']) {
  queryClient.setQueryData(['general-settings'], (oldData: any) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      contentFrequentlyQuestions: oldData.contentFrequentlyQuestions.filter(
        (item: ContentFrequentlyQuestion) => item.id !== id,
      ),
    }
  })
}

const openCreateModal = () => {
  modalMode.value = 'create'
  isModalOpen.value = true
  selectedQuestionForEdit.value = {
    id: Date.now(),
    question: '',
    answer: '',
    isActive: true,
  }
}

const openEditModal = (question: ContentFrequentlyQuestion) => {
  modalMode.value = 'edit'
  isModalOpen.value = true
  selectedQuestionForEdit.value = question
  console.log(selectedQuestionForEdit)
}

const currentHeaderIndex = computed(
  () =>
    generalSetting.value?.textHeaderSections?.findIndex(
      (item: any) => item.section === 'frequently-questions',
    ) ?? -1,
)

const currentHeader = computed(() => {
  if (currentHeaderIndex.value === -1) return null
  return generalSetting.value?.textHeaderSections?.[currentHeaderIndex.value]
})

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <ContainerMainSectionSlot>
    <HeaderTitlesSlot>
      <template #title>Mantenimento Seccion : Preguntas frecuentes</template>
      <template #description>
        Personaliza los textos principales, el titulo y la descripcion de los cuatro pasos.
      </template>
      <template #button>
        <button
          @click="toggleEdit"
          type="button"
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

    <form class="space-y-6" @submit.prevent="onSubmit">
      <FormTextHeader
        v-if="currentHeader && currentHeaderIndex !== -1"
        :titleFieldName="`textHeaderSections.${currentHeaderIndex}.title`"
        :descriptionFieldName="`textHeaderSections.${currentHeaderIndex}.description`"
        :isEditing="isEditing"
        ref="formTextHeaderRef"
      />

      <!-- Pasamos directamente el campo sincronizado con v-model a través de la propiedad questionList -->
      <FormFrequentlyQuestions
        :isEditing="isEditing"
        :questionList="questionList"
        @move="
          (fromIndex, toIndex) => {
            const newArr = [...questionList]
            // Lógica circular para permitir bucle entre el primero y el último
            let targetIndex = toIndex
            if (targetIndex < 0) {
              targetIndex = newArr.length - 1 // Si estás en el primero y vas hacia atrás, vas al último
            } else if (targetIndex >= newArr.length) {
              targetIndex = 0 // Si estás en el último y vas hacia adelante, vas al primero
            }

            const [movedItem] = newArr.splice(fromIndex, 1)
            if (movedItem) {
              newArr.splice(targetIndex, 0, movedItem)
              questionList = newArr
            }
          }
        "
        @open-create-modal="openCreateModal"
        @open-edit-modal="openEditModal"
        @delete="handleGlobalDelete"
      />
      <!-- @create="handleGlobalCreate"
        @update="handleGlobalUpdate"
        @delete="handleGlobalDelete" -->

      <div class="flex justify-end w-full pt-0">
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
  <ModalFrequentlyQuestions
    v-model:isOpen="isModalOpen"
    v-model:model="selectedQuestionForEdit"
    :mode="modalMode"
    @create="handleGlobalCreate"
    @update="handleGlobalUpdate"
  />
</template>
