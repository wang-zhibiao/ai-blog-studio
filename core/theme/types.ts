export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan' | 'red' | 'indigo'

export type ColorScheme = 'light' | 'dark'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  surfaceLight: string
  text: string
  textMuted: string
  border: string
  success: string
  warning: string
  error: string
}

export interface Theme {
  id: ThemeColor
  name: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
}

export interface ThemeState {
  currentTheme: ThemeColor
  colorScheme: ColorScheme
}
