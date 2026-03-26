/**
 * 主题相关类型定义
 */

// 主题颜色选项
export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan' | 'red' | 'indigo'

// 主题模式
export type ThemeMode = 'dark' | 'light'

// 完整主题配色
export interface FullThemeColors {
  primary: string
  primaryDark: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  surfaceLight: string
  text: string
  textMuted: string
  textInverse: string
  border: string
  borderLight: string
}
