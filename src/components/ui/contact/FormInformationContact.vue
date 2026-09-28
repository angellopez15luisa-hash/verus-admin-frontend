<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed } from 'vue'

const props = defineProps<{
  isEditing: boolean
}>()

// Declaramos los campos usando la notación por puntos para el objeto anidado informationContact
const { value: address, errorMessage: addressError } = useField<string>(
  'informationContact.address',
)
const { value: phone, errorMessage: phoneError } = useField<string>('informationContact.phone')
const { value:whatsapp, errorMessage:whatsappError } = useField<string>('informationContact.whatsapp')
const { value: email, errorMessage: emailError } = useField<string>('informationContact.email')
const { value: businessHours, errorMessage: businessHoursError } = useField<string>(
  'informationContact.businessHours',
)

const disabled = computed(() => !props.isEditing)
</script>

<template>
  <!-- Contenedor con la misma clase de fondo y bordes de la tarjeta superior -->
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
  >
    <!-- Cabecera de la sección -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div
        class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-bold text-xs"
      >
        IC
      </div>
      <h3 class="text-slate-800 dark:text-slate-200 font-semibold text-base">
        Información de Contacto
      </h3>
    </div>

    <!-- Grid de campos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Dirección -->
      <div class="space-y-2">
        <label
          class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >Dirección</label
        >
        <div class="relative">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
          >
            <i class="ri-map-pin-line text-base"></i>
          </span>
          <input
            :disabled
            v-model="address"
            type="text"
            placeholder="Ej. Pasaje buena Ventura 155..."
            class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <span v-if="addressError" class="text-xs text-red-500 block">{{ addressError }}</span>
      </div>

      <!-- Teléfono -->
      <div class="space-y-2">
        <label
          class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >Teléfono</label
        >
        <div class="relative">
          <span
            class="absolute top-3 left-3 pointer-events-none text-emerald-500 dark:text-emerald-400"
          >
            <i class="ri-phone-line text-base"></i>
          </span>
          <textarea
            :disabled
            v-model="phone"
            rows="2"
            placeholder="Ej. +51 929 720 720"
            class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <span v-if="phoneError" class="text-xs text-red-500 block -mt-2">{{ phoneError }}</span>
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <label
          class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >Correo Electrónico</label
        >
        <div class="relative">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400"
          >
            <i class="ri-mail-line text-base"></i>
          </span>
          <input
            :disabled
            v-model="email"
            type="email"
            placeholder="Ej. info@tuweb.pe"
            class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <span v-if="emailError" class="text-xs text-red-500 block">{{ emailError }}</span>
      </div>

      <div class="space-y-2">
        <label
          class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >Whatsapp</label
        >
        <div class="relative">
          <span
            class="absolute top-3 left-3 pointer-events-none text-emerald-500 dark:text-emerald-400"
          >
           <i class="ri-whatsapp-line text-base"></i>
          </span>
          <textarea
            :disabled
            v-model="whatsapp"
            rows="2"
            placeholder="Ej. +51 929 720 720"
            class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <span v-if="whatsappError" class="text-xs text-red-500 block -mt-2">{{ whatsappError }}</span>
      </div>

      <!-- Horario de Atención -->
      <div class="space-y-2 md:col-span-2">
        <div class="flex justify-between items-center">
          <label
            class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >Horario de Atención</label
          >
          <span class="text-[10px] text-slate-400"
            >Puedes usar la tecla Enter para saltos de línea</span
          >
        </div>
        <div class="relative">
          <span
            class="absolute top-3 left-3 pointer-events-none text-emerald-500 dark:text-emerald-400"
          >
            <i class="ri-time-line text-base"></i>
          </span>
          <textarea
            :disabled
            v-model="businessHours"
            rows="2"
            placeholder="Lunes a Viernes: 10:00 - 20:00&#10;Sábados: 11:00 - 15:00"
            class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-pre-line resize-none"
          ></textarea>
        </div>
        <span v-if="businessHoursError" class="text-xs text-red-500 block -mt-2">{{
          businessHoursError
        }}</span>
      </div>
    </div>
  </div>
</template>
