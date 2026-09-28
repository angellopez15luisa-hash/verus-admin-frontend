<script setup lang="ts">
import { contentFrequentlyQuestionSchema } from '@/schemas'
import type { ContentFrequentlyQuestion } from '@/types/general-setting'
import { GeneralSettingValue } from '@/values'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, watch } from 'vue'


const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })
const model = defineModel<ContentFrequentlyQuestion>('model', { required: true })

const emit = defineEmits<{
  create: [question: ContentFrequentlyQuestion]
  update: [id: ContentFrequentlyQuestion['id'], question: ContentFrequentlyQuestion]
}>()

const questionInputRef = ref<HTMLInputElement | null>(null)
const currentQuestionId = ref<ContentFrequentlyQuestion['id'] | null>(null)
const isLoading = ref<boolean>(false)

const { handleSubmit, resetForm, errors, defineField, validate, meta } = useForm({
  validationSchema: toTypedSchema(contentFrequentlyQuestionSchema),
  initialValues: GeneralSettingValue.contentFrequentlyQuestionForm,
})

const [question] = defineField('question')
const [answer] = defineField('answer')
const [isActive] = defineField('isActive')

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

//  await nextTick()
//     questionInputRef.value?.focus()

watch(
  isOpen,
  async (newVal) => {
    if (!newVal) {
      window.removeEventListener('keydown', handleKeyDown)
      return
    }
    window.addEventListener('keydown', handleKeyDown)

    if (props.mode === 'edit' && model.value) {
      currentQuestionId.value = model.value.id
      resetForm({
        values: {
          question: model.value.question,
          answer: model.value.answer,
          isActive: model.value.isActive,
        },
      })
    } else {
      currentQuestionId.value = null
      resetForm({
        values: {
          ...GeneralSettingValue.contentFrequentlyQuestionForm,
        },
      })
    }

    await nextTick()
    questionInputRef.value?.focus()
  },
  {
    deep: true,
    immediate: true,
  },
)

const onSubmit = handleSubmit(async (values) => {
  const validationResult = await validate()
  console.log(validationResult.valid)
  if (!validationResult.valid) return
  console.log(values)
  isLoading.value = true
  if (props.mode === 'create') {
    const newQuestion: ContentFrequentlyQuestion = {
      id: Date.now(),
      question: values.question,
      answer: values.answer,
      isActive: true,
      service_id: 0
    }
    emit('create', newQuestion)
  } else {
    if (currentQuestionId.value !== null) {
      const updateQuestion: ContentFrequentlyQuestion = {
        id: currentQuestionId.value,
        question: values.question,
        answer: values.answer,
        isActive: values.isActive,
        service_id: 0
      }
      emit('update', currentQuestionId.value, updateQuestion)
    }
  }
  closeModal()
  isLoading.value = false
})
// const handleSave = () => {
//   // Aquí puedes disparar tu evento de guardado o validación si lo requieres
//   isOpen.value = false
// }

const disabled = computed(() => isLoading.value || !meta.value.valid)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
  >
    <div
      class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
    >
      <!-- Cabecera del Modal -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
      >
        <div class="flex items-center gap-3">
          <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            {{ mode === 'create' ? 'Crear Pregunta Frecuente' : 'Editar Pregunta Frecuente' }}
          </h3>
        </div>
        <!-- Botón de Cerrar (X) -->
        <button
          type="button"
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
        >
          <font-awesome-icon icon="xmark" class="text-sm" />
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <!-- Cuerpo del Formulario -->
        <div class="p-6 space-y-5 text-left">
          <!-- Campo: Pregunta -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pregunta
            </label>
            <!-- v-model="model.question" -->
            <input
              ref="questionInputRef"
              v-model="question"
              type="text"
              placeholder="Ej. ¿Cómo realizar una compra?"
              class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
            />
            <span v-if="errors.question" class="text-red-500 font-semibold text-xs block">
              {{ errors.question }}
            </span>
          </div>

          <!-- Campo: Respuesta -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Respuesta
            </label>
            <!-- v-model="model.answer" -->
            <textarea
              rows="4"
              v-model="answer"
              placeholder="Escribe la respuesta detallada aquí..."
              class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none shadow-inner"
            ></textarea>
            <span v-if="errors.answer" class="text-red-500 font-semibold text-xs block">
              {{ errors.answer }}
            </span>
          </div>

          <!-- Campo: Switch de Estado (Activo / Inactivo con bolita) -->
          <div v-if="mode === 'edit'" class="flex items-center justify-between pt-2">
            <div class="space-y-0.5">
              <span class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estado de la Pregunta
              </span>
              <span class="block text-[11px] text-slate-500 dark:text-slate-400">
                {{ model.isActive ? 'Visible en el sitio web' : 'Oculto temporalmente' }}
              </span>
            </div>

            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="isActive" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600 shadow-inner"
              ></div>
            </label>
          </div>
        </div>

        <!-- Pie del Modal (Botones de acción) -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2234]"
        >
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer shadow-sm"
          >
            Cancelar
          </button>
          <!-- @click="handleSave" -->
          <button
            type="submit"
            class="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
