/** @jest-environment node */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { login, logout } from './actions'
import { SESSION_COOKIE, verifySessionToken } from './session'

jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

const cookieStore = { set: jest.fn(), delete: jest.fn() }
jest.mocked(cookies).mockResolvedValue(cookieStore as never)

const valid = { email: 'admin@bix.com.br', password: 'bix@2024' }

beforeEach(() => jest.clearAllMocks())

describe('login', () => {
  it('cria a sessão em cookie e redireciona para a origem segura', async () => {
    await expect(
      login({ ...valid, email: 'ADMIN@bix.com.br', from: '/dashboard?states=TX' }),
    ).rejects.toThrow('NEXT_REDIRECT')

    const [name, token, options] = cookieStore.set.mock.calls[0]
    expect(name).toBe(SESSION_COOKIE)
    expect(options).toMatchObject({ httpOnly: true })
    await expect(verifySessionToken(token)).resolves.toEqual({
      name: 'Usuário BIX',
      email: 'admin@bix.com.br',
    })
    expect(redirect).toHaveBeenCalledWith('/dashboard?states=TX')
  })

  it('ignora destinos externos', async () => {
    await expect(login({ ...valid, from: 'https://malicioso.com' })).rejects.toThrow()
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it.each([
    ['senha errada', { ...valid, password: 'errada' }],
    ['e-mail errado', { ...valid, email: 'outro@bix.com.br' }],
    ['e-mail inválido', { ...valid, email: 'nao-e-email' }],
    ['senha vazia', { ...valid, password: '' }],
  ])('retorna erro genérico para %s sem criar sessão', async (_, input) => {
    await expect(login(input)).resolves.toEqual({ error: 'E-mail ou senha inválidos.' })
    expect(cookieStore.set).not.toHaveBeenCalled()
  })
})

describe('logout', () => {
  it('remove a sessão e volta para o login', async () => {
    await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE)
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
