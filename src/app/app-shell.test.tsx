import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { redirect } from '@test/mocks/next-navigation'
import { renderWithProviders } from '@test/render'

import DashboardError from './dashboard/error'
import DashboardLayout from './dashboard/layout'
import DashboardLoading from './dashboard/loading'
import RootLayout, { metadata } from './layout'
import HomePage from './page'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('@/features/auth/actions', () => ({ login: jest.fn(), logout: jest.fn() }))

describe('RootLayout', () => {
  it('define idioma, fonte e metadados', () => {
    const html = RootLayout({ children: <p>app</p> } as never)

    expect(html.props.lang).toBe('pt-BR')
    expect(metadata.title).toEqual({
      default: 'Dashboard Financeiro',
      template: '%s · Dashboard Financeiro',
    })
  })
})

describe('HomePage', () => {
  it('redireciona para a dashboard (o proxy decide antes, conforme a sessão)', () => {
    HomePage()
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('DashboardLayout', () => {
  it('envolve as páginas com a sidebar exclusiva', () => {
    renderWithProviders(
      DashboardLayout({ children: <p>página</p>, params: Promise.resolve({}) } as never),
    )

    expect(screen.getByText('página')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Sair', hidden: true }).length).toBeGreaterThan(0)
  })
})

describe('DashboardLoading', () => {
  it('exibe skeletons acessíveis', () => {
    renderWithProviders(<DashboardLoading />)
    expect(screen.getByRole('status', { name: 'Carregando dashboard' })).toBeInTheDocument()
  })
})

describe('DashboardError', () => {
  it('permite tentar novamente', async () => {
    const reset = jest.fn()
    renderWithProviders(<DashboardError error={new Error('falhou')} reset={reset} />)

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(screen.getByText('Não foi possível carregar a dashboard')).toBeInTheDocument()
    expect(reset).toHaveBeenCalled()
  })
})
