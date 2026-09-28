<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { GeneralSettingAction } from '@/business/actions'
import ContainerMainSectionSlot from '@/components/slots/ContainerMainSectionSlot.vue'
import ButtonMain from "@/components/ui/shared/ButtonMain.vue"
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
       <div class="flex justify-end w-full pt-5">
        <ButtonMain :disabled :isEditing :isPending />
      </div>
    </form>
  </ContainerMainSectionSlot>
</template>
