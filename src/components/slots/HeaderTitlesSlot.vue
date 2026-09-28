<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5"
  >
    <div>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">
        <slot name="title" />
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        <slot name="description" />
      </p>
    </div>
    <!-- Botón Superior Habilitar Edición -->
    <!-- Botón Superior Habilitar Edición -->
    <slot name="button" />
  </div>
</template>
