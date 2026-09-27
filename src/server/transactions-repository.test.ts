/** @jest-environment node */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { DATASET_PATH } from './transactions-repository'

jest.mock('node:fs/promises', () => {
  const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises')
  return { ...actual, readFile: jest.fn(actual.readFile) }
})

const readFileMock = jest.mocked(readFile)

/** SHA-256 do arquivo original recebido por e-mail. */
const ORIGINAL_DATASET_SHA256 = '70b3bd8a612ed5e53ade3d5818c4473df339c837d36f551c4c97a9e6e040e8f9'

const loadFreshModule = () => {
  let mod!: typeof import('./transactions-repository')
  jest.isolateModules(() => {
    mod = jest.requireActual('./transactions-repository')
  })
  return mod
}

describe('dataset', () => {
  it('permanece idêntico ao arquivo original (não pode ser alterado)', async () => {
    const content = await jest
      .requireActual<typeof import('node:fs/promises')>('node:fs/promises')
      .readFile(DATASET_PATH)
    expect(createHash('sha256').update(content).digest('hex')).toBe(ORIGINAL_DATASET_SHA256)
  })
})

describe('loadDataset', () => {
  afterEach(() => readFileMock.mockClear())

  it('carrega, valida e deriva metadados uma única vez por processo', async () => {
    const { loadDataset } = loadFreshModule()

    const [first, second] = await Promise.all([loadDataset(), loadDataset()])

    expect(first).toBe(second)
    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect(first.transactions).toHaveLength(50_000)
    expect(first.accountProfiles).toHaveLength(103)
    expect(new Date(first.firstDate).toISOString()).toMatch(/^2021-11-10/)
    expect(new Date(first.referenceDate).toISOString()).toMatch(/^2023-11-30/)
  })

  it('não memoriza falhas: a próxima chamada tenta novamente', async () => {
    const { loadDataset } = loadFreshModule()
    readFileMock.mockRejectedValueOnce(new Error('EACCES'))

    await expect(loadDataset()).rejects.toThrow('EACCES')
    await expect(loadDataset()).resolves.toHaveProperty('transactions')
    expect(readFileMock).toHaveBeenCalledTimes(2)
  })
})
