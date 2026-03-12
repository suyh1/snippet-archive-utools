<script setup lang="ts">
defineProps<{
  name?: string
  mode?: 'in-out' | 'out-in' | 'default'
}>()
</script>

<template>
  <Transition :name="name ?? 'app-fade'" :mode="mode === 'default' ? undefined : mode ?? 'out-in'">
    <slot />
  </Transition>
</template>

<style scoped>
.app-fade-enter-active,
.app-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.app-fade-enter-from,
.app-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
