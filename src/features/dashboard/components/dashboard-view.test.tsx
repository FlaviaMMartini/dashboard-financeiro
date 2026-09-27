import { fireEvent, screen } from '@testing-library/react'

import { dashboardData } from '@test/fixtures'
import { mockRouter } from '@test/mocks/next-navigation'
import { renderWithProviders } from '@test/render'

import { DEFAULT_TABLE_PARAMS } from '@/domain/table'

import { DashboardView } from './dashboard-view'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))

beforeEach(() => mockRouter.push.mockClear())

describe('DashboardView', () => {
  it('compõe cabeçalho, filtros, cards, gráficos e tabela', () => {
    renderWithProviders(
      <DashboardView
        userName="Ana"
        data={dashboardData}
        filters={{ accounts: [], industries: [], states: [] }}
        tableParams={DEFAULT_TABLE_PARAMS}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Olá, Ana' })).toBeInTheDocument()
    expect(screen.getByText('Visão geral de 10/11/2021 a 30/11/2023')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Filtros' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Resumo' })).toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getByRole('table', { name: 'Histórico de transações' })).toBeInTheDocument()
  })

  it('filtros atualizam a URL (fonte de verdade) voltando à primeira página', () => {
    renderWithProviders(
      <DashboardView
        userName="Ana"
        data={dashboardData}
        filters={{ from: '2023-01-01', to: '2023-03-31', accounts: [], industries: [], states: [] }}
        tableParams={{ page: 3, sortField: 'amount', sortOrder: 'ascend' }}
      />,
    )

    expect(screen.getByText('Visão geral de 01/01/2023 a 31/03/2023')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2023-02-28' } })

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/dashboard?from=2023-01-01&to=2023-02-28&sort=amount&order=ascend',
      { scroll: false },
    )
  })

  it('a paginação mantém os filtros e sempre explicita o período', async () => {
    const { user } = renderWithProviders(
      <DashboardView
        userName="Ana"
        data={dashboardData}
        filters={{ accounts: [], industries: [], states: ['GA'] }}
        tableParams={DEFAULT_TABLE_PARAMS}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/dashboard?from=2021-11-10&to=2023-11-30&states=GA&page=2',
      { scroll: false },
    )
  })
})
