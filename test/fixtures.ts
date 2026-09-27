import type { DashboardData } from '@/server/dashboard-service'

export const period = { firstDay: '2021-11-10', lastDay: '2023-11-30' }

export const dashboardData: DashboardData = {
  summary: {
    revenueInCents: 1_000_000,
    expensesInCents: 250_000,
    balanceInCents: 750_000,
    pendingCount: 12,
    pendingAmountInCents: 40_000,
    transactionCount: 1_234,
  },
  monthly: [
    { month: '2023-10', revenue: 600_000, expenses: 100_000, balance: 500_000 },
    { month: '2023-11', revenue: 400_000, expenses: 150_000, balance: 750_000 },
  ],
  breakdown: {
    deposit: {
      industries: ['Hotels'],
      rows: [
        { month: '2023-10', Hotels: 600_000 },
        { month: '2023-11', Hotels: 400_000 },
      ],
    },
    withdraw: {
      industries: ['Airlines', 'Mail'],
      rows: [
        { month: '2023-10', Airlines: 60_000, Mail: 40_000 },
        { month: '2023-11', Airlines: 100_000, Mail: 50_000 },
      ],
    },
  },
  options: {
    accounts: ['Delta', 'Hilton'],
    industries: ['Airlines', 'Hotels'],
    states: ['GA', 'VA'],
  },
  table: {
    items: [
      {
        id: 'tx-1',
        date: Date.UTC(2023, 10, 29),
        amountInCents: 5565,
        type: 'deposit',
        account: 'Hilton',
        industry: 'Hotels',
        state: 'VA',
        pending: true,
      },
      {
        id: 'tx-2',
        date: Date.UTC(2023, 9, 1),
        amountInCents: 1480,
        type: 'withdraw',
        account: 'Delta',
        industry: 'Airlines',
        state: 'GA',
        pending: false,
      },
    ],
    total: 25,
    page: 1,
    pageSize: 10,
  },
  period,
  pendingRule: { referenceDay: '2023-11-30', windowDays: 7 },
}
