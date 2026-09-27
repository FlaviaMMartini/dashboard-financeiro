import { screen, waitFor, within } from '@testing-library/react'

import { renderWithProviders } from '@test/render'

import { logout } from '@/features/auth/actions'

import { DashboardShell } from './dashboard-shell'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('@/features/auth/actions', () => ({ login: jest.fn(), logout: jest.fn() }))

const renderShell = () =>
  renderWithProviders(
    <DashboardShell>
      <p>conteúdo</p>
    </DashboardShell>,
  )

beforeEach(() => jest.clearAllMocks())

describe('DashboardShell', () => {
  it('exibe a sidebar exclusiva com Home e Sair, além do conteúdo', () => {
    renderShell()

    for (const link of screen.getAllByRole('link', { name: 'Home', hidden: true })) {
      expect(link).toHaveAttribute('href', '/dashboard')
    }
    expect(screen.getAllByRole('button', { name: 'Sair', hidden: true }).length).toBeGreaterThan(0)
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('no mobile abre o menu em um drawer e o fecha ao navegar', async () => {
    const { user } = renderShell()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const drawer = await screen.findByRole('presentation')
    await user.click(within(drawer).getByRole('link', { name: 'Home' }))

    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())
    expect(logout).not.toHaveBeenCalled()
  })

  it('faz logout ao clicar em Sair', async () => {
    const { user } = renderShell()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const drawer = await screen.findByRole('presentation')
    await user.click(within(drawer).getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
  })
})
