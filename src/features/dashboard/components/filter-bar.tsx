'use client'

import FilterAltOffOutlined from '@mui/icons-material/FilterAltOffOutlined'
import FilterListOutlined from '@mui/icons-material/FilterListOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import type { ChangeEvent } from 'react'
import styled from 'styled-components'

import type { FilterOptions } from '@/domain/filter-options'
import { countActiveFilters, withDateRange, type Filters, type Period } from '@/domain/filters'
import { media } from '@/styles/theme'

const Bar = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};

  > .full {
    grid-column: 1 / -1;
  }

  ${media.lg} {
    grid-template-columns: repeat(2, 160px) repeat(3, minmax(0, 1fr)) auto;
    align-items: start;

    > .full {
      grid-column: auto;
    }
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  min-height: 40px;
  color: ${({ theme }) => theme.colors.textMuted};
`

type ListKey = 'accounts' | 'industries' | 'states'

const LIST_FIELDS: Array<{ key: ListKey; label: string; placeholder: string }> = [
  { key: 'accounts', label: 'Contas', placeholder: 'Todas as contas' },
  { key: 'industries', label: 'Indústrias', placeholder: 'Todas as indústrias' },
  { key: 'states', label: 'Estados', placeholder: 'Todos os estados' },
]

interface FilterBarProps {
  filters: Filters
  options: FilterOptions
  period: Period
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, options, period, onChange }: FilterBarProps) {
  const activeCount = countActiveFilters(filters, period)
  const from = filters.from ?? period.firstDay
  const to = filters.to ?? period.lastDay

  const handleFrom = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(withDateRange(filters, [event.target.value, to]))

  const handleTo = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(withDateRange(filters, [from, event.target.value]))

  const handleClear = () =>
    onChange({
      from: period.firstDay,
      to: period.lastDay,
      accounts: [],
      industries: [],
      states: [],
    })

  return (
    <Bar aria-label="Filtros">
      <TextField
        label="De"
        type="date"
        size="small"
        value={from}
        onChange={handleFrom}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: period.firstDay, max: to },
        }}
      />
      <TextField
        label="Até"
        type="date"
        size="small"
        value={to}
        onChange={handleTo}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: from, max: period.lastDay },
        }}
      />
      {LIST_FIELDS.map(({ key, label, placeholder }) => (
        <Autocomplete
          key={key}
          className="full"
          multiple
          size="small"
          limitTags={2}
          disableCloseOnSelect
          options={options[key]}
          value={filters[key]}
          onChange={(_, values) => onChange({ ...filters, [key]: values })}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={filters[key].length === 0 ? placeholder : undefined}
            />
          )}
          noOptionsText="Nenhuma opção"
        />
      ))}
      <Actions className="full">
        <Badge
          badgeContent={activeCount}
          color="primary"
          aria-label={`${activeCount} filtros ativos`}
        >
          <FilterListOutlined />
        </Badge>
        <Button
          variant="outlined"
          startIcon={<FilterAltOffOutlined />}
          onClick={handleClear}
          disabled={activeCount === 0}
        >
          Limpar
        </Button>
      </Actions>
    </Bar>
  )
}
