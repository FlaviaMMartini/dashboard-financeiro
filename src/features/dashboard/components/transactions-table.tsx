'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import styled from 'styled-components'

import { formatDate } from '@/domain/dates'
import { formatCurrency } from '@/domain/money'
import { toggleSort, type SortField, type TablePage, type TableParams } from '@/domain/table'
import type { TransactionRow } from '@/server/dashboard-service'
import { media } from '@/styles/theme'

const StyledCard = styled(Card)`
  && {
    border-radius: ${({ theme }) => theme.radii.lg};
    box-shadow: ${({ theme }) => theme.shadows.card};
  }

  && .MuiCardHeader-title {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.navy};
  }

  && th {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.navy};
    background: ${({ theme }) => theme.colors.background};
    white-space: nowrap;
  }

  && td {
    white-space: nowrap;
  }

  /* Colunas secundárias ficam ocultas em telas pequenas. */
  && .secondary {
    display: none;

    ${media.md} {
      display: table-cell;
    }
  }
`

const Amount = styled.span<{ $type: TransactionRow['type'] }>`
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $type }) => ($type === 'deposit' ? theme.colors.success : theme.colors.danger)};
`

const Progress = styled.div`
  height: 4px;
`

interface TransactionsTableProps {
  page: TablePage<TransactionRow>
  params: TableParams
  loading: boolean
  onChange: (params: TableParams) => void
}

export function TransactionsTable({ page, params, loading, onChange }: TransactionsTableProps) {
  const direction = params.sortOrder === 'ascend' ? 'asc' : 'desc'

  const sortableCell = (field: SortField, label: string, align?: 'right') => {
    const active = params.sortField === field
    return (
      <TableCell align={align} sortDirection={active ? direction : false}>
        <TableSortLabel
          active={active}
          direction={active ? direction : 'desc'}
          onClick={() => onChange(toggleSort(params, field))}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    )
  }

  return (
    <StyledCard>
      <CardHeader title="Histórico de transações" />
      <Progress>{loading && <LinearProgress aria-label="Atualizando transações" />}</Progress>
      <TableContainer>
        <Table size="small" aria-label="Histórico de transações">
          <TableHead>
            <TableRow>
              {sortableCell('date', 'Data')}
              <TableCell>Conta</TableCell>
              <TableCell className="secondary">Indústria</TableCell>
              <TableCell className="secondary">Estado</TableCell>
              <TableCell>Tipo</TableCell>
              {sortableCell('amount', 'Valor', 'right')}
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {page.items.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>{row.account}</TableCell>
                <TableCell className="secondary">{row.industry}</TableCell>
                <TableCell className="secondary">{row.state}</TableCell>
                <TableCell>
                  {row.type === 'deposit' ? (
                    <Chip label="Receita" color="success" size="small" variant="outlined" />
                  ) : (
                    <Chip label="Despesa" color="error" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Amount $type={row.type}>
                    {row.type === 'deposit' ? '+' : '−'} {formatCurrency(row.amountInCents)}
                  </Amount>
                </TableCell>
                <TableCell>
                  {row.pending ? (
                    <Chip label="Pendente" color="warning" size="small" />
                  ) : (
                    <Chip label="Compensada" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {page.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma transação para os filtros selecionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={page.total}
        page={page.page - 1}
        rowsPerPage={page.pageSize}
        rowsPerPageOptions={[]}
        onPageChange={(_, nextPage) => onChange({ ...params, page: nextPage + 1 })}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count.toLocaleString('pt-BR')}`
        }
        getItemAriaLabel={(type) => (type === 'next' ? 'Próxima página' : 'Página anterior')}
      />
    </StyledCard>
  )
}
