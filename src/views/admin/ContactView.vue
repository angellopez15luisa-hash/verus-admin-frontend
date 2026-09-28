<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import FormInformationContact from '@/components/ui/contact/FormInformationContact.vue'
import ButtonMain from '@/components/ui/shared/ButtonMain.vue'
import FormTextHeader from '@/components/ui/shared/FormTextHeader.vue'
import HeaderSection from '@/components/ui/shared/HeaderSection.vue'
import { generalSettingUpdateSchema } from '@/schemas/general-setting.schema'
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

const { data: generalSetting } = useQuery({
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
  onSuccess: (data, Variables) => {
    const newValues = Variables.data
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        textHeaderSections: newValues.textHeaderSections,
        informationContact: newValues.informationContact,
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
      informationContact: values.informationContact,
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
            informationContact: newData.informationContact,
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

const toggleEdit = async () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    resetForm(
      {
        values: {
          textHeaderSections: generalSetting.value?.textHeaderSections,
          informationContact: generalSetting.value?.informationContact,
        },
      },
      { force: true },
    )
    toast.info('Edicion cancelada, cambios descartados.')
  }
}

const currentHeaderIndex =
  computed(() =>
    generalSetting.value?.textHeaderSections?.findIndex((item) => item.section === 'contact'),
  ) ?? -1

const currentHeader = computed(() => {
  if (currentHeaderIndex.value === -1) return null
  return generalSetting.value?.textHeaderSections![currentHeaderIndex.value!]
})

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <ContainerMainSectionSlot>
    <HeaderSection title="Contacto" :isEditing @toggle-edit="toggleEdit" />
    <form class="space-y-6" @submit.prevent="onSubmit">
      <FormTextHeader
        v-if="currentHeader && currentHeaderIndex !== -1"
        :title-field-name="`textHeaderSections.${currentHeaderIndex}.title`"
        :description-field-name="`textHeaderSections.${currentHeaderIndex}.description`"
        :is-editing
        ref="formTextHeaderRef"
      />
      <FormInformationContact :isEditing />
      <div class="flex justify-end w-full pt-5">
        <ButtonMain :disabled :isEditing :isPending />
      </div>
    </form>
  </ContainerMainSectionSlot>
</template>
