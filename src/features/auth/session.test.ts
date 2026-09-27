/** @jest-environment node */
import { SignJWT } from 'jose'

import { createSessionToken, sessionCookieOptions, verifySessionToken } from './session'

const session = { name: 'Usuário BIX', email: 'admin@bix.com.br' }
const key = (secret: string) => new TextEncoder().encode(secret)

describe('session', () => {
  it('assina e verifica um token válido', async () => {
    const token = await createSessionToken(session)
    await expect(verifySessionToken(token)).resolves.toEqual(session)
  })

  it('retorna null para token ausente, adulterado ou assinado com outro segredo', async () => {
    const token = await createSessionToken(session)
    const foreign = await new SignJWT(session)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key('y'.repeat(40)))

    await expect(verifySessionToken(undefined)).resolves.toBeNull()
    await expect(verifySessionToken(`${token}x`)).resolves.toBeNull()
    await expect(verifySessionToken(foreign)).resolves.toBeNull()
  })

  it('retorna null para token expirado', async () => {
    jest.useFakeTimers({ now: Date.UTC(2024, 0, 1) })
    const token = await createSessionToken(session)
    jest.setSystemTime(Date.UTC(2024, 0, 2))
    await expect(verifySessionToken(token)).resolves.toBeNull()
    jest.useRealTimers()
  })

  it('retorna null quando o payload não tem o formato esperado', async () => {
    const { getEnv } = jest.requireActual<typeof import('@/server/env')>('@/server/env')
    const token = await new SignJWT({ name: 'sem e-mail' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key(getEnv().SESSION_SECRET))
    await expect(verifySessionToken(token)).resolves.toBeNull()
  })

  it('usa um cookie HttpOnly e SameSite=Lax', () => {
    expect(sessionCookieOptions).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  })
})
