import { screen, within } from '@testing-library/react'

import { normalizeSpaces } from '@test/factories'
import { dashboardData } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import { DEFAULT_TABLE_PARAMS, type TableParams } from '@/domain/table'

import { TransactionsTable } from './transactions-table'

function setup({
  params = DEFAULT_TABLE_PARAMS,
  page = dashboardData.table,
  loading = false,
}: { params?: TableParams; page?: typeof dashboardData.table; loading?: boolean } = {}) {
  const onChange = jest.fn()
  const utils = renderWithProviders(
    <TransactionsTable page={page} params={params} loading={loading} onChange={onChange} />,
  )
  return { ...utils, onChange }
}

const clean = (element: Element) => normalizeSpaces(element.textContent)

describe('TransactionsTable', () => {
  it('lista transações com tipo, valor com sinal e status', () => {
    setup()
    const [, pendingRow, settledRow] = screen.getAllByRole('row')

    expect(within(pendingRow!).getByText('Hilton')).toBeInTheDocument()
    expect(within(pendingRow!).getByText('Receita')).toBeInTheDocument()
    expect(within(pendingRow!).getByText('Pendente')).toBeInTheDocument()
    expect(clean(pendingRow!)).toContain('+ R$ 55,65')

    expect(within(settledRow!).getByText('Despesa')).toBeInTheDocument()
    expect(within(settledRow!).getByText('Compensada')).toBeInTheDocument()
    expect(clean(settledRow!)).toContain('− R$ 14,80')
    expect(screen.getByText('1–10 de 25')).toBeInTheDocument()
  })

  it('indica a coluna ordenada para leitores de tela', () => {
    setup()
    expect(screen.getByRole('columnheader', { name: /data/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
  })

  it('pagina no servidor via onChange', async () => {
    const { user, onChange } = setup()

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TABLE_PARAMS, page: 2 })
  })

  it('ordena pelas colunas de data e valor', async () => {
    const { user, onChange } = setup({
      params: { page: 2, sortField: 'amount', sortOrder: 'ascend' },
    })

    expect(screen.getByRole('columnheader', { name: /valor/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    await user.click(screen.getByText('Valor'))
    expect(onChange).toHaveBeenLastCalledWith({
      page: 1,
      sortField: 'amount',
      sortOrder: 'descend',
    })

    await user.click(screen.getByText('Data'))
    expect(onChange).toHaveBeenLastCalledWith({ page: 1, sortField: 'date', sortOrder: 'descend' })
  })

  it('mostra carregamento e estado vazio', () => {
    setup({ loading: true, page: { items: [], total: 0, page: 1, pageSize: 10 } })

    expect(screen.getByRole('progressbar', { name: 'Atualizando transações' })).toBeInTheDocument()
    expect(screen.getByText('Nenhuma transação para os filtros selecionados')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  })
})
