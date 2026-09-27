import { makeTransaction } from '@test/factories'

import { extractAccountProfiles, getFilterOptions } from './filter-options'

const profiles = extractAccountProfiles([
  makeTransaction({ account: 'Delta', industry: 'Airlines', state: 'GA' }),
  makeTransaction({ account: 'Delta', industry: 'Airlines', state: 'GA' }),
  makeTransaction({ account: 'United', industry: 'Airlines', state: 'IL' }),
  makeTransaction({ account: 'Hilton', industry: 'Hotels', state: 'VA' }),
  makeTransaction({ account: 'Marriott', industry: 'Hotels', state: 'MD' }),
])

describe('extractAccountProfiles', () => {
  it('gera um perfil por conta', () => {
    expect(profiles.map((p) => p.account)).toEqual(['Delta', 'United', 'Hilton', 'Marriott'])
  })
})

describe('getFilterOptions (cascata)', () => {
  it('sem seleção retorna todas as opções ordenadas', () => {
    expect(getFilterOptions(profiles, { accounts: [], industries: [], states: [] })).toEqual({
      accounts: ['Delta', 'Hilton', 'Marriott', 'United'],
      industries: ['Airlines', 'Hotels'],
      states: ['GA', 'IL', 'MD', 'VA'],
    })
  })

  it('a indústria restringe contas e estados, mas não as próprias indústrias', () => {
    expect(
      getFilterOptions(profiles, { accounts: [], industries: ['Hotels'], states: [] }),
    ).toEqual({
      accounts: ['Hilton', 'Marriott'],
      industries: ['Airlines', 'Hotels'],
      states: ['MD', 'VA'],
    })
  })

  it('conta e estado restringem as demais opções', () => {
    expect(
      getFilterOptions(profiles, { accounts: ['Delta'], industries: [], states: ['GA', 'VA'] }),
    ).toEqual({
      accounts: ['Delta', 'Hilton'],
      industries: ['Airlines'],
      states: ['GA'],
    })
  })
})
