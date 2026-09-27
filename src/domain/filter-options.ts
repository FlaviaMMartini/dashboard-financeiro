import type { Filters } from './filters'
import type { Transaction } from './transaction'

/** No dataset, cada conta pertence a exatamente uma indústria e um estado. */
export interface AccountProfile {
  account: string
  industry: string
  state: string
}

export interface FilterOptions {
  accounts: string[]
  industries: string[]
  states: string[]
}

export function extractAccountProfiles(transactions: readonly Transaction[]): AccountProfile[] {
  const profiles = new Map<string, AccountProfile>()
  for (const { account, industry, state } of transactions) {
    if (!profiles.has(account)) profiles.set(account, { account, industry, state })
  }
  return [...profiles.values()]
}

const matches = (selected: string[], value: string) =>
  selected.length === 0 || selected.includes(value)

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

/**
 * Filtros em cascata: as opções de cada campo são restringidas pelas seleções
 * dos outros campos (nunca pela própria, para permitir adicionar mais itens).
 * Valores já selecionados sempre permanecem nas opções, para que possam ser desmarcados.
 */
export function getFilterOptions(
  profiles: readonly AccountProfile[],
  filters: Filters,
): FilterOptions {
  const pick = (
    predicate: (p: AccountProfile) => boolean,
    key: keyof AccountProfile,
    selected: string[],
  ) => uniqueSorted([...profiles.filter(predicate).map((p) => p[key]), ...selected])

  return {
    accounts: pick(
      (p) => matches(filters.industries, p.industry) && matches(filters.states, p.state),
      'account',
      filters.accounts,
    ),
    industries: pick(
      (p) => matches(filters.accounts, p.account) && matches(filters.states, p.state),
      'industry',
      filters.industries,
    ),
    states: pick(
      (p) => matches(filters.accounts, p.account) && matches(filters.industries, p.industry),
      'state',
      filters.states,
    ),
  }
}
