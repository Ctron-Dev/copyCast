<script setup lang="ts">
defineProps<{
  src: string
}>()
</script>

<template>
  <img :src="src" alt="Logo" class="w-auto h-6 shrink-0" v-bind="$attrs" />
</template>
