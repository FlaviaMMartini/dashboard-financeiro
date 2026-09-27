import type { Metadata } from 'next'

import { LoginView } from '@/features/auth/components/login-view'
import { getDemoUser } from '@/server/env'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  const { email, password } = getDemoUser()
  // Conta de demonstração, exibida de propósito para facilitar a avaliação.
  return <LoginView demoCredentials={{ email, password }} />
}
