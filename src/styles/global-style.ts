'use client'

import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.font};
    -webkit-font-smoothing: antialiased;
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`
