import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { extractAccountProfiles, type AccountProfile } from '@/domain/filter-options'
import { getReferenceDate } from '@/domain/pending'
import { parseTransactions, type Transaction } from '@/domain/transaction'

export const DATASET_PATH = path.join(process.cwd(), 'data', 'transactions.json')

export interface Dataset {
  transactions: Transaction[]
  accountProfiles: AccountProfile[]
  /** Transação mais recente — "hoje" para a regra de pendentes (ADR-001). */
  referenceDate: number
  firstDate: number
}

let datasetPromise: Promise<Dataset> | undefined

async function readDataset(): Promise<Dataset> {
  const transactions = parseTransactions(JSON.parse(await readFile(DATASET_PATH, 'utf8')))
  return {
    transactions,
    accountProfiles: extractAccountProfiles(transactions),
    referenceDate: getReferenceDate(transactions),
    firstDate: transactions.reduce((min, tx) => Math.min(min, tx.date), Number.POSITIVE_INFINITY),
  }
}

/**
 * Lê, valida e normaliza os 50 mil registros uma única vez por processo.
 * Uma falha não fica memorizada: a próxima chamada tenta novamente.
 */
export function loadDataset(): Promise<Dataset> {
  datasetPromise ??= readDataset().catch((error: unknown) => {
    datasetPromise = undefined
    throw error
  })
  return datasetPromise
}
