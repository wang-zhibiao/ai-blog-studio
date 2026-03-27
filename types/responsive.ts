export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const breakpoints = {
  xs: 375,   // 手机
  sm: 640,   // 大屏手机
  md: 768,   // 平板
  lg: 1024,  // 小屏笔记本
  xl: 1280   // 桌面
} as const

export type BreakpointValues = typeof breakpoints

export interface ResponsiveState {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}
