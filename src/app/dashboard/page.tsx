import type { Metadata } from 'next'

import { parseFilters } from '@/domain/filters'
import { parseTableParams } from '@/domain/table'
import { requireSession } from '@/features/auth/get-session'
import { DashboardView } from '@/features/dashboard/components/dashboard-view'
import { getDashboardOverview, getTransactionsPage } from '@/server/dashboard-service'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
  const session = await requireSession()
  const query = await searchParams
  const filters = parseFilters(query)
  const tableParams = parseTableParams(query)
  // Dois caches independentes, buscados em paralelo (ver dashboard-service).
  const [overview, table] = await Promise.all([
    getDashboardOverview(filters),
    getTransactionsPage(filters, tableParams),
  ])

  return (
    <DashboardView
      userName={session.name}
      data={{ ...overview, table }}
      filters={filters}
      tableParams={tableParams}
    />
  )
}
