'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'

import { serializeFilters, type Filters, type Period } from '@/domain/filters'
import { serializeTableParams, type TableParams } from '@/domain/table'
import { DASHBOARD_PATH } from '@/features/auth/redirect'

/**
 * A URL é a fonte de verdade do estado da dashboard. O período é sempre explícito
 * na URL: uma query vazia significa "restaurar o último estado salvo" (ver proxy).
 */
export function useDashboardNavigation(period: Period) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (filters: Filters, tableParams: TableParams) => {
      const withPeriod: Filters = {
        ...filters,
        from: filters.from ?? period.firstDay,
        to: filters.to ?? period.lastDay,
      }
      const query = serializeTableParams(tableParams, serializeFilters(withPeriod))
      startTransition(() => router.push(`${DASHBOARD_PATH}?${query.toString()}`, { scroll: false }))
    },
    [router, period.firstDay, period.lastDay],
  )

  return { navigate, isPending }
}
