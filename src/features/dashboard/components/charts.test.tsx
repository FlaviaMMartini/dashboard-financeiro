import { screen } from '@testing-library/react'

import { dashboardData } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import { IndustryStackedBarChart } from './industry-stacked-bar-chart'
import { TrendLineChart } from './trend-line-chart'

describe('IndustryStackedBarChart', () => {
  it('exibe despesas por indústria e alterna para receitas', async () => {
    const { user } = renderWithProviders(
      <IndustryStackedBarChart breakdown={dashboardData.breakdown} />,
    )

    expect(screen.getByRole('figure', { name: /total de despesas por mês/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Receitas' }))
    expect(screen.getByRole('figure', { name: /total de receitas por mês/ })).toBeInTheDocument()

    // Clicar na opção já selecionada não desmarca o grupo.
    await user.click(screen.getByRole('button', { name: 'Receitas' }))
    expect(screen.getByRole('button', { name: 'Receitas' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('mostra estado vazio sem dados', () => {
    renderWithProviders(
      <IndustryStackedBarChart
        breakdown={{
          deposit: { industries: [], rows: [] },
          withdraw: { industries: [], rows: [] },
        }}
      />,
    )

    expect(screen.getByText('Nenhuma transação para os filtros selecionados')).toBeInTheDocument()
  })
})

describe('TrendLineChart', () => {
  it('renderiza o gráfico de linhas com descrição acessível', () => {
    renderWithProviders(<TrendLineChart data={dashboardData.monthly} />)

    expect(
      screen.getByRole('figure', { name: /receitas, despesas e saldo acumulado/ }),
    ).toBeInTheDocument()
  })

  it('mostra estado vazio sem dados', () => {
    renderWithProviders(<TrendLineChart data={[]} />)

    expect(screen.getByText('Nenhuma transação para os filtros selecionados')).toBeInTheDocument()
  })
})
