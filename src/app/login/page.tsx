import type { Metadata } from 'next'

import { LoginView } from '@/features/auth/components/login-view'
import { getEnv } from '@/server/env'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  const { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = getEnv()
  // Conta de demonstração, exibida de propósito para facilitar a avaliação.
  return <LoginView demoCredentials={{ email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD }} />
}
