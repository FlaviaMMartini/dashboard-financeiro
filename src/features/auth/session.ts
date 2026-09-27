import { jwtVerify, SignJWT } from 'jose'
import { z } from 'zod'

import { getSessionSecret } from '@/server/env'

/** Módulo compartilhado entre o proxy e o servidor: sem dependências de `next/headers`. */

export const SESSION_COOKIE = 'bix_session'
export const SESSION_DURATION_SECONDS = 60 * 60 * 8

const sessionSchema = z.object({ name: z.string(), email: z.email() })

export type Session = z.infer<typeof sessionSchema>

const getKey = () => new TextEncoder().encode(getSessionSecret())

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getKey())
}

/** Retorna `null` para token ausente, adulterado, expirado ou com payload inválido. */
export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    const parsed = sessionSchema.safeParse(payload)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
} as const
