/** @jest-environment node */
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import styled from 'styled-components'

import { StyledComponentsRegistry } from './styled-components-registry'

const inserted: Array<() => ReactNode> = []

// Build de servidor (o mapeamento padrão dos testes usa o de browser).
jest.mock('styled-components', () =>
  jest.requireActual('styled-components/dist/styled-components.cjs.js'),
)
jest.mock('next/navigation', () => ({
  useServerInsertedHTML: (callback: () => ReactNode) => inserted.push(callback),
}))

const Title = styled.h1`
  color: rgb(0, 104, 168);
`

describe('StyledComponentsRegistry (SSR)', () => {
  it('coleta os estilos do render no servidor para injetá-los no <head>', () => {
    const html = renderToString(
      <StyledComponentsRegistry>
        <Title>Olá</Title>
      </StyledComponentsRegistry>,
    )

    expect(html).toContain('Olá')
    const styles = renderToString(<>{inserted.map((callback) => callback())}</>)
    expect(styles).toContain('color:rgb(0,104,168)')
  })
})
