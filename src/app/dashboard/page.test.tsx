import { screen } from '@testing-library/react'

import { dashboardData } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import { requireSession } from '@/features/auth/get-session'
import { getDashboardOverview, getTransactionsPage } from '@/server/dashboard-service'

import DashboardPage, { metadata } from './page'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('@/features/auth/get-session', () => ({ requireSession: jest.fn() }))
jest.mock('@/server/dashboard-service', () => ({
  getDashboardOverview: jest.fn(),
  getTransactionsPage: jest.fn(),
}))

describe('DashboardPage', () => {
  it('valida a sessão, lê os search params e renderiza os dados agregados', async () => {
    jest.mocked(requireSession).mockResolvedValue({ name: 'Ana', email: 'ana@bix.com.br' })
    const { table, ...overview } = dashboardData
    jest.mocked(getDashboardOverview).mockResolvedValue(overview)
    jest.mocked(getTransactionsPage).mockResolvedValue(table)

    const ui = await DashboardPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ states: 'GA', page: '2', from: 'invalida' }),
    })
    renderWithProviders(ui)

    const filters = { accounts: [], industries: [], states: ['GA'] }
    expect(getDashboardOverview).toHaveBeenCalledWith(filters)
    expect(getTransactionsPage).toHaveBeenCalledWith(filters, {
      page: 2,
      sortField: 'date',
      sortOrder: 'descend',
    })
    expect(screen.getByRole('heading', { name: 'Olá, Ana' })).toBeInTheDocument()
    expect(screen.getByText('1–10 de 25')).toBeInTheDocument()
    expect(metadata.title).toBe('Dashboard')
  })
})
