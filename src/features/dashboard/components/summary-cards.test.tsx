import { screen } from '@testing-library/react'

import { normalizeSpaces } from '@test/factories'
import { dashboardData } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import { SummaryCards } from './summary-cards'

const text = (value: string) => (_: string, element: Element | null) =>
  normalizeSpaces(element?.textContent) === value

describe('SummaryCards', () => {
  it('mostra receitas, despesas, pendentes e saldo formatados', () => {
    renderWithProviders(
      <SummaryCards summary={dashboardData.summary} pendingRule={dashboardData.pendingRule} />,
    )

    expect(screen.getByText(text('R$ 10.000,00'))).toBeInTheDocument()
    expect(screen.getByText(text('R$ 2.500,00'))).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(text('R$ 400,00 em compensação'))).toBeInTheDocument()
    expect(screen.getByText(text('R$ 7.500,00'))).toBeInTheDocument()
    expect(screen.getByText('1.234 transações no período')).toBeInTheDocument()
  })

  it('explica a regra de pendentes de forma acessível', () => {
    renderWithProviders(
      <SummaryCards summary={dashboardData.summary} pendingRule={dashboardData.pendingRule} />,
    )

    expect(
      screen.getByLabelText(/últimos 7 dias até 30\/11\/2023.*não entram no saldo/),
    ).toBeInTheDocument()
  })

  it('destaca saldo negativo', () => {
    renderWithProviders(
      <SummaryCards
        summary={{ ...dashboardData.summary, balanceInCents: -5000 }}
        pendingRule={dashboardData.pendingRule}
      />,
    )

    expect(screen.getByText(text('-R$ 50,00'))).toBeInTheDocument()
  })
})
