<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerButtonMainSlot from '@/components/slots/ContainerButtonMainSlot.vue'
import HeaderTitlesSlot from '@/components/slots/HeaderTitlesSlot.vue'
import FormInformationContact from '@/components/ui/contact/FormInformationContact.vue'
import FormTextHeader from "@/components/ui/shared/FormTextHeader.vue"
import FormTextHeader2 from "@/components/ui/shared/FormTextHeader2.vue"
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

const isEditing = ref(false)
const formTextHeaderRef = ref<InstanceType<typeof FormTextHeader> | null>(null)
const queryClient = useQueryClient()

const { data: generalSetting } = useQuery({
  queryKey: ['general-settings'],
  queryFn: () => GeneralSettingAction.getData(),
  retry: false,
  refetchOnWindowFocus: false,
})

const { defineField, resetForm, errors, handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(generalSettingUpdateSchema),
  initialValues: GeneralSettingValue.updateForm,
})

const [titleHeader] = defineField('titleHeaderContact')
const [descriptionHeader] = defineField('descriptionHeaderContact')
// const [address] = defineField('informationContact.address')
// const [phone] = defineField('informationContact.phone')
// const [email] = defineField('informationContact.email')
// const [businessHours] = defineField('informationContact.businessHours')

const { mutate, isPending } = useMutation({
  mutationFn: GeneralSettingAction.update,
  onSuccess: (data, variables) => {
    const newValues = variables.data

    // Actualiza la caché local de manera optimista
    queryClient.setQueryData(['general-settings'], (oldData: any) => {
      return {
        ...oldData,
        titleHeaderContact: newValues.titleHeaderContact,
        descriptionHeaderContact: newValues.descriptionHeaderContact,
        informationContact: newValues.informationContact,
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

watch(
  generalSetting,
  (newData) => {
    if (newData) {
      resetForm({
        values: {
          titleHeaderContact: newData.titleHeaderContact || '',
          descriptionHeaderContact: newData.descriptionHeaderContact || '',
          informationContact: newData.informationContact || {},
        },
        // values: { ...newData },
      })
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
    if (generalSetting.value) {
      resetForm(
        {
          values: {
            titleHeaderContact: generalSetting.value.titleHeaderContact || '',
            descriptionHeaderContact: generalSetting.value.descriptionHeaderContact || '',
            informationContact: generalSetting.value.informationContact || {},
          },
          // values: { ...generalSetting.value },
        },
        { force: true },
      )
    }

    await nextTick()
    formTextHeaderRef.value?.focusTitle()
  } else {
    if (generalSetting.value) {
      resetForm(
        {
          values: { ...generalSetting.value },
        },
        { force: true },
      )
    }
    toast.info('Edicion cancelada, cambios descartados.')
  }
}

const onSubmit = handleSubmit((values) => {
  if (!isEditing.value) return
  console.log(values)
  mutate({ id: generalSetting.value!.id, data: values })
})

const disabled = computed(() => !meta.value.valid || isPending.value || !isEditing.value)
</script>

<template>
  <div class="w-full p-6 space-y-6">
    <HeaderTitlesSlot>
      <template #title>Mantenimiento de Sección Contacto</template>
      <template #description>
        Administra los textos principales y la información de contacto visible en la landing page.
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
    <form class="space-y-6" @submit.prevent="onSubmit">
      <FormTextHeader2
        ref="formTextHeaderRef"
        v-model:title="titleHeader"
        v-model:description="descriptionHeader"
        title-field-name="titleHeaderContact"
        desc-field-name="descriptionHeaderContact"
        :errors="errors"
        :disabled="!isEditing"
      />
      <FormInformationContact :isEditing />
      <ContainerButtonMainSlot>
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
                ? 'Guardar Cambios de Contacto'
                : 'Guardar Cambios'
          }}</span>
        </button>
      </ContainerButtonMainSlot>
    </form>
  </div>
</template>
