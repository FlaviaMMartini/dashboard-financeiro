import { screen, within } from '@testing-library/react'

import { normalizeSpaces } from '@test/factories'
import { renderWithProviders } from '@test/render'

import { ChartTooltip } from './chart-tooltip'

const payload = [
  { name: 'Airlines', value: 1_000, color: '#0068A8' },
  { name: 'Hotels', value: 0, color: '#14B8A6' },
  { name: 'Mail', value: 5_000, color: '#0F1E3D' },
  { name: 'Apparel', value: 2_500 },
]

const rowTexts = () =>
  within(screen.getByRole('list'))
    .getAllByRole('listitem')
    .map((item) => normalizeSpaces(item.textContent))

describe('ChartTooltip', () => {
  it('lista os itens em R$, sem zerados, com mês formatado', () => {
    renderWithProviders(<ChartTooltip active payload={payload} label="2022-08" />)

    expect(screen.getByText(/ago.*22/)).toBeInTheDocument()
    expect(rowTexts()).toEqual(['AirlinesR$ 10,00', 'MailR$ 50,00', 'ApparelR$ 25,00'])
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })

  it('ordena por valor e mostra o total quando solicitado', () => {
    renderWithProviders(
      <ChartTooltip active payload={payload} label="2022-08" sortByValue showTotal />,
    )

    expect(rowTexts()).toEqual(['MailR$ 50,00', 'ApparelR$ 25,00', 'AirlinesR$ 10,00'])
    expect(normalizeSpaces(screen.getByText('Total').parentElement?.textContent)).toBe(
      'TotalR$ 85,00',
    )
  })

  it.each([
    ['inativo', { active: false, payload }],
    ['sem payload', { active: true }],
    [
      'só com valores zerados ou não numéricos',
      {
        active: true,
        payload: [
          { name: 'x', value: 0 },
          { name: 'y', value: 'n/d' },
        ],
      },
    ],
  ])('não renderiza quando %s', (_, props) => {
    const { container } = renderWithProviders(<ChartTooltip {...props} />)
    expect(container).toBeEmptyDOMElement()
  })
})
