<template>
  <slot v-if="isMobile" />
</template>

<script setup lang="ts">
import { useBreakpoint } from '~/ui/composables/responsive/use-breakpoint'

const { isMobile } = useBreakpoint()
</script>
