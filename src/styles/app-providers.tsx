'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from './global-style'
import { StyledComponentsRegistry } from './styled-components-registry'
import { muiTheme, theme } from './theme'

/**
 * Material UI (componentes, via Emotion com a integração oficial do App Router)
 * + styled-components (estilização da aplicação). Os dois leem os mesmos tokens
 * de `theme.ts`; overrides do styled-components usam `&&` para vencer em especificidade.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <StyledComponentsRegistry>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyle />
            {children}
          </ThemeProvider>
        </MuiThemeProvider>
      </StyledComponentsRegistry>
    </AppRouterCacheProvider>
  )
}
