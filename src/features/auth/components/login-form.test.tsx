import { screen, waitFor } from '@testing-library/react'

import { searchParamsState } from '@test/mocks/next-navigation'
import { renderWithProviders } from '@test/render'

import { login } from '../actions'
import { LoginForm } from './login-form'

jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
jest.mock('../actions', () => ({ login: jest.fn(), logout: jest.fn() }))

const loginMock = jest.mocked(login)

beforeEach(() => {
  loginMock.mockReset()
  searchParamsState.current = new URLSearchParams()
})

async function fillAndSubmit(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.type(screen.getByLabelText('E-mail'), 'admin@bix.com.br')
  await user.type(screen.getByLabelText('Senha'), 'bix@2024')
  await user.click(screen.getByRole('button', { name: /entrar/i }))
}

describe('LoginForm', () => {
  it('valida no cliente com o mesmo schema da Server Action', async () => {
    const { user } = renderWithProviders(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('envia as credenciais com a rota de origem e exibe o erro retornado', async () => {
    searchParamsState.current = new URLSearchParams('from=/dashboard?states=TX')
    loginMock.mockResolvedValue({ error: 'E-mail ou senha inválidos.' })
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(loginMock).toHaveBeenCalledWith({
      email: 'admin@bix.com.br',
      password: 'bix@2024',
      from: '/dashboard?states=TX',
    })
  })

  it('não exibe erro quando a action redireciona (sem retorno)', async () => {
    loginMock.mockResolvedValue(undefined as never)
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user)

    await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1))
    expect(loginMock.mock.calls[0]![0].from).toBeUndefined()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
