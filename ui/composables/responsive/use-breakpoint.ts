import type { Breakpoint } from '~/types/responsive'
import { getBreakpoint, isMobile, isTablet, isDesktop } from '~/utils/responsive'

export function useBreakpoint() {
  const breakpoint = ref<Breakpoint>('xl')
  const isMobileValue = computed(() => isMobile(breakpoint.value))
  const isTabletValue = computed(() => isTablet(breakpoint.value))
  const isDesktopValue = computed(() => isDesktop(breakpoint.value))

  const updateBreakpoint = () => {
    if (typeof window !== 'undefined') {
      breakpoint.value = getBreakpoint(window.innerWidth)
    }
  }

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateBreakpoint)
    }
  })

  return {
    breakpoint,
    isMobile: isMobileValue,
    isTablet: isTabletValue,
    isDesktop: isDesktopValue
  }
}
