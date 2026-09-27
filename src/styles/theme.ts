import { createTheme } from '@mui/material/styles'

/**
 * Fonte única de verdade do design system, baseada na identidade visual da BIX.
 * Alimenta o ThemeProvider do styled-components E o tema do Material UI.
 */
export const theme = {
  colors: {
    primary: '#0068A8',
    primaryHover: '#00548A',
    primarySoft: '#E6F0F7',
    navy: '#0F1E3D',
    navyLight: '#1B2D52',
    text: '#334155',
    textMuted: '#64748B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    accent: '#14B8A6',
    success: '#0E9F6E',
    danger: '#DC2626',
    warning: '#D97706',
  },
  radii: { sm: '8px', md: '12px', lg: '16px', pill: '999px' },
  shadows: {
    card: '0 1px 2px rgba(15, 30, 61, 0.06), 0 8px 24px rgba(15, 30, 61, 0.06)',
    cardHover: '0 2px 4px rgba(15, 30, 61, 0.08), 0 12px 32px rgba(15, 30, 61, 0.1)',
  },
  font: 'var(--font-roboto), Roboto, "Helvetica Neue", Arial, sans-serif',
  sidebarWidth: 240,
  /** Paleta dos gráficos: tons de azul e turquesa derivados do logo. */
  chartPalette: [
    '#0068A8',
    '#14B8A6',
    '#3B82F6',
    '#0F1E3D',
    '#38BDF8',
    '#6366F1',
    '#0D9488',
    '#94A3B8',
    '#1E40AF',
    '#5EEAD4',
  ],
} as const

export type AppTheme = typeof theme

/** Mesmos valores dos breakpoints `md` e `lg` do Material UI. */
export const breakpoints = { md: 900, lg: 1200 } as const

export const media = {
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
} as const

export const muiTheme = createTheme({
  palette: {
    primary: { main: theme.colors.primary, dark: theme.colors.primaryHover },
    secondary: { main: theme.colors.accent },
    success: { main: theme.colors.success },
    error: { main: theme.colors.danger },
    warning: { main: theme.colors.warning },
    text: { primary: theme.colors.text, secondary: theme.colors.textMuted },
    background: { default: theme.colors.background, paper: theme.colors.surface },
    divider: theme.colors.border,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: theme.font,
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { elevation: 0 } },
  },
})
