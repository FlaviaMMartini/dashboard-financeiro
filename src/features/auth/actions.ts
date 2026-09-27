'use server'

import { timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getDemoUser } from '@/server/env'

import { getSafeRedirect, LOGIN_PATH } from './redirect'
import { loginSchema, type LoginInput, type LoginResult } from './schemas'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from './session'

const INVALID_CREDENTIALS = 'E-mail ou senha inválidos.'

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Em caso de sucesso, redireciona (não retorna). Em caso de erro, retorna a mensagem. */
export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: INVALID_CREDENTIALS }

  const demoUser = getDemoUser()
  const { email, password, from } = parsed.data
  const emailMatches = safeEqual(email.toLowerCase(), demoUser.email.toLowerCase())
  const passwordMatches = safeEqual(password, demoUser.password)
  if (!emailMatches || !passwordMatches) return { error: INVALID_CREDENTIALS }

  const token = await createSessionToken({ name: demoUser.name, email: demoUser.email })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions)

  redirect(getSafeRedirect(from))
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect(LOGIN_PATH)
}
