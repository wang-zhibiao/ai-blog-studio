<template>
  <slot v-if="isDesktop" />
</template>

<script setup lang="ts">
import { useBreakpoint } from '~/ui/composables/responsive/use-breakpoint'

const { isDesktop } = useBreakpoint()
</script>
