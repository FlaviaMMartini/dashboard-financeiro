import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

import { AppProviders } from '@/styles/app-providers'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Dashboard Financeiro', template: '%s · Dashboard Financeiro' },
  description: 'Análise de saldos, receitas, despesas e transações pendentes.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
