import { screen } from '@testing-library/react'

import { dashboardData } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import { requireSession } from '@/features/auth/get-session'
import { getDashboardData } from '@/server/dashboard-service'

import DashboardPage, { metadata } from './page'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('@/features/auth/get-session', () => ({ requireSession: jest.fn() }))
jest.mock('@/server/dashboard-service', () => ({ getDashboardData: jest.fn() }))

describe('DashboardPage', () => {
  it('valida a sessão, lê os search params e renderiza os dados agregados', async () => {
    jest.mocked(requireSession).mockResolvedValue({ name: 'Ana', email: 'ana@bix.com.br' })
    jest.mocked(getDashboardData).mockResolvedValue(dashboardData)

    const ui = await DashboardPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ states: 'GA', page: '2', from: 'invalida' }),
    })
    renderWithProviders(ui)

    expect(getDashboardData).toHaveBeenCalledWith(
      { accounts: [], industries: [], states: ['GA'] },
      { page: 2, sortField: 'date', sortOrder: 'descend' },
    )
    expect(screen.getByRole('heading', { name: 'Olá, Ana' })).toBeInTheDocument()
    expect(metadata.title).toBe('Dashboard')
  })
})
