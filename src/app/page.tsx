import { redirect } from 'next/navigation'

import { DASHBOARD_PATH } from '@/features/auth/redirect'

/** O proxy já decide o destino conforme a sessão; este é apenas o fallback. */
export default function HomePage() {
  redirect(DASHBOARD_PATH)
}
