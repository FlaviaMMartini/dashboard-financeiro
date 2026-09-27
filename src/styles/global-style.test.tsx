import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from './global-style'
import { theme } from './theme'

describe('GlobalStyle', () => {
  it('aplica as cores e a fonte do tema no body', () => {
    render(
      <ThemeProvider theme={theme}>
        <GlobalStyle />
      </ThemeProvider>,
    )

    const css = [...document.querySelectorAll('style')].map((style) => style.textContent).join('')
    expect(css).toContain(`background:${theme.colors.background}`)
    expect(css).toContain(`color:${theme.colors.text}`)
    expect(css).toContain('outline:2px solid')
  })
})
