import { screen, within } from '@testing-library/react'

import { renderWithProviders } from '@test/render'

import { MultiSelectFilter, summarizeSelection } from './multi-select-filter'

function setup(value: string[] = []) {
  const onChange = jest.fn()
  const utils = renderWithProviders(
    <MultiSelectFilter
      label="Contas"
      placeholder="Todas as contas"
      pluralNoun="contas"
      name="filtro-accounts"
      options={['Delta', 'Hilton', 'United']}
      value={value}
      onChange={onChange}
    />,
  )
  return { ...utils, onChange }
}

describe('summarizeSelection', () => {
  it('mostra o nome de um item ou a contagem de vários', () => {
    expect(summarizeSelection(['Delta'], 'contas')).toBe('Delta')
    expect(summarizeSelection(['Delta', 'Hilton', 'United'], 'contas')).toBe('3 contas')
  })
})

describe('MultiSelectFilter', () => {
  it('sem seleção mostra o placeholder e bloqueia o autofill do navegador', () => {
    setup()
    const input = screen.getByLabelText('Contas')

    expect(input).toHaveAttribute('placeholder', 'Todas as contas')
    expect(input).toHaveAttribute('autocomplete', 'new-password')
    expect(input).toHaveAttribute('name', 'filtro-accounts')
  })

  it('resume várias seleções em uma única linha, com a lista completa no title', () => {
    setup(['Delta', 'Hilton'])

    const summary = screen.getByText('2 contas')
    expect(summary).toHaveAttribute('title', 'Delta, Hilton')
    expect(screen.getByLabelText('Contas')).not.toHaveAttribute('placeholder')
  })

  it('opções têm checkbox; clicar em uma selecionada a remove', async () => {
    const { user, onChange } = setup(['Delta'])

    await user.click(screen.getByLabelText('Contas'))
    const selected = await screen.findByRole('option', { name: 'Delta' })
    expect(within(selected).getByRole('checkbox')).toBeChecked()
    expect(
      within(screen.getByRole('option', { name: 'Hilton' })).getByRole('checkbox'),
    ).not.toBeChecked()

    await user.click(selected)
    expect(onChange).toHaveBeenLastCalledWith([])

    await user.click(screen.getByRole('option', { name: 'United' }))
    expect(onChange).toHaveBeenLastCalledWith(['Delta', 'United'])
  })
})
