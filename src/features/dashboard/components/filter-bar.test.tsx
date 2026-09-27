import { fireEvent, screen } from '@testing-library/react'

import { dashboardData, period } from '@test/fixtures'
import { renderWithProviders } from '@test/render'

import type { Filters } from '@/domain/filters'

import { FilterBar } from './filter-bar'

const empty: Filters = { accounts: [], industries: [], states: [] }

function setup(filters: Filters = empty) {
  const onChange = jest.fn()
  const utils = renderWithProviders(
    <FilterBar
      filters={filters}
      options={dashboardData.options}
      period={period}
      onChange={onChange}
    />,
  )
  return { ...utils, onChange }
}

describe('FilterBar', () => {
  it('sem filtros mostra o período completo e desabilita "Limpar"', () => {
    setup()

    expect(screen.getByLabelText('De')).toHaveValue('2021-11-10')
    expect(screen.getByLabelText('Até')).toHaveValue('2023-11-30')
    expect(screen.getByRole('button', { name: 'Limpar filtros (0 ativos)' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /limpar/i })).toHaveTextContent(/^Limpar$/)
  })

  it('altera o início e o fim do período', () => {
    const { onChange } = setup()

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2023-01-01' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...empty, from: '2023-01-01', to: '2023-11-30' })

    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2023-06-30' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...empty, from: '2021-11-10', to: '2023-06-30' })
  })

  it('ignora data apagada no input', () => {
    const filters = { ...empty, from: '2023-01-01', to: '2023-02-01' }
    const { onChange } = setup(filters)

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '' } })

    expect(onChange).toHaveBeenLastCalledWith(filters)
  })

  it('seleciona contas, indústrias e estados com busca', async () => {
    const { user, onChange } = setup()

    await user.click(screen.getByLabelText('Contas'))
    await user.click(await screen.findByRole('option', { name: 'Delta' }))
    expect(onChange).toHaveBeenLastCalledWith({ ...empty, accounts: ['Delta'] })

    await user.type(screen.getByLabelText('Indústrias'), 'Hot')
    await user.click(await screen.findByRole('option', { name: 'Hotels' }))
    expect(onChange).toHaveBeenLastCalledWith({ ...empty, industries: ['Hotels'] })
  })

  it('limpa todos os filtros voltando ao período completo', async () => {
    const { user, onChange } = setup({
      from: '2023-01-01',
      to: '2023-02-01',
      accounts: ['Delta'],
      industries: [],
      states: ['GA'],
    })

    expect(screen.getByRole('button', { name: 'Limpar filtros (3 ativos)' })).toHaveTextContent(
      'Limpar (3)',
    )
    await user.click(screen.getByRole('button', { name: /limpar/i }))

    expect(onChange).toHaveBeenCalledWith({
      ...empty,
      from: period.firstDay,
      to: period.lastDay,
    })
  })
})
