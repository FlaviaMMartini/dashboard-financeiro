export const DAY_IN_MS = 86_400_000

/**
 * Todas as datas são tratadas em UTC: o dataset traz epochs e o resultado
 * não pode depender do fuso horário do servidor ou do navegador.
 */
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
})

/** `YYYY-MM-DD` */
export function toIsoDay(epoch: number): string {
  return new Date(epoch).toISOString().slice(0, 10)
}

/** `YYYY-MM` */
export function toMonthKey(epoch: number): string {
  return new Date(epoch).toISOString().slice(0, 7)
}

export function startOfIsoDay(isoDay: string): number {
  return Date.parse(`${isoDay}T00:00:00.000Z`)
}

export function endOfIsoDay(isoDay: string): number {
  return startOfIsoDay(isoDay) + DAY_IN_MS - 1
}

export function formatDate(epoch: number): string {
  return dateFormatter.format(epoch)
}

/** `2023-11` → `nov. de 23` */
export function formatMonthKey(monthKey: string): string {
  return monthFormatter.format(Date.parse(`${monthKey}-01T00:00:00.000Z`))
}
