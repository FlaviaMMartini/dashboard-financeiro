import { screen } from '@testing-library/react'

import { renderWithProviders } from '@test/render'

import LoginPage, { metadata } from './page'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('@/features/auth/actions', () => ({ login: jest.fn(), logout: jest.fn() }))

describe('LoginPage', () => {
  it('exibe o formulário e o acesso de demonstração', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulário de login' })).toBeInTheDocument()
    expect(screen.getByText('admin@bix.com.br')).toBeInTheDocument()
    expect(screen.getByText('bix@2024')).toBeInTheDocument()
    expect(metadata.title).toBe('Login')
  })
})
