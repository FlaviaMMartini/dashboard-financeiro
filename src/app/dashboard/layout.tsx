import { DashboardShell } from '@/features/dashboard/components/dashboard-shell'

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return <DashboardShell>{children}</DashboardShell>
}
