/** @jest-environment node */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { requireSession } from './get-session'
import { createSessionToken } from './session'

jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

const mockCookie = (value?: string) =>
  jest.mocked(cookies).mockResolvedValue({
    get: () => (value ? { name: 'bix_session', value } : undefined),
  } as never)

describe('requireSession', () => {
  it('retorna a sessão válida', async () => {
    const session = { name: 'Ana', email: 'ana@bix.com.br' }
    mockCookie(await createSessionToken(session))
    await expect(requireSession()).resolves.toEqual(session)
  })

  it('redireciona para o login sem sessão', async () => {
    mockCookie()
    await expect(requireSession()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
