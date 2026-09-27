import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { LOGIN_PATH } from './redirect'
import { SESSION_COOKIE, verifySessionToken, type Session } from './session'

/**
 * Defesa em profundidade: o proxy já bloqueia rotas protegidas, mas a página
 * valida a sessão de novo antes de acessar dados.
 */
export async function requireSession(): Promise<Session> {
  const cookieStore = await cookies()
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
  if (!session) redirect(LOGIN_PATH)
  return session
}
