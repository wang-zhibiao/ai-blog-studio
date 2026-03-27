import { breakpoints, type Breakpoint } from '~/types/responsive'

export function getBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.sm) return 'xs'
  if (width < breakpoints.md) return 'sm'
  if (width < breakpoints.lg) return 'md'
  if (width < breakpoints.xl) return 'lg'
  return 'xl'
}

export function isMobile(breakpoint: Breakpoint): boolean {
  return breakpoint === 'xs' || breakpoint === 'sm'
}

export function isTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === 'md'
}

export function isDesktop(breakpoint: Breakpoint): boolean {
  return breakpoint === 'lg' || breakpoint === 'xl'
}
