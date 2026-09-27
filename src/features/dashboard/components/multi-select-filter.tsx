'use client'

import CheckBox from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import styled from 'styled-components'

/** Mantém o campo em uma única linha, independente de quantos itens estão selecionados. */
const StyledAutocomplete = styled(Autocomplete<string, true>)`
  && .MuiAutocomplete-inputRoot {
    flex-wrap: nowrap;
  }

  /* Sem foco, o resumo ocupa o espaço; com foco, reservamos espaço para digitar a busca. */
  && .MuiAutocomplete-input {
    min-width: 0;
  }

  && .Mui-focused .MuiAutocomplete-input {
    min-width: 48px;
  }
`

const Summary = styled.span`
  overflow: hidden;
  flex: 0 1 auto;
  min-width: 0;
  padding-left: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.navy};
  font-weight: 500;
`

const Option = styled.li`
  && {
    gap: 4px;
    padding-block: 2px;
    font-size: 14px;
  }
`

/** Um item mostra o próprio nome; vários mostram a contagem ("3 contas"). */
export function summarizeSelection(values: readonly string[], pluralNoun: string): string {
  return values.length === 1 ? values[0]! : `${values.length} ${pluralNoun}`
}

interface MultiSelectFilterProps {
  label: string
  placeholder: string
  pluralNoun: string
  name: string
  options: string[]
  value: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectFilter({
  label,
  placeholder,
  pluralNoun,
  name,
  options,
  value,
  onChange,
}: MultiSelectFilterProps) {
  return (
    <StyledAutocomplete
      className="full"
      multiple
      size="small"
      disableCloseOnSelect
      options={options}
      value={value}
      onChange={(_, values) => onChange(values)}
      noOptionsText="Nenhuma opção"
      // A lista pode ser mais larga que o campo para não quebrar nomes longos.
      slotProps={{ popper: { placement: 'bottom-start', style: { minWidth: 280 } } }}
      renderValue={(selected) => (
        <Summary title={selected.join(', ')}>{summarizeSelection(selected, pluralNoun)}</Summary>
      )}
      renderOption={({ key, ...props }, option, { selected }) => (
        <Option key={key} {...props}>
          <Checkbox
            size="small"
            icon={<CheckBoxOutlineBlank fontSize="small" />}
            checkedIcon={<CheckBox fontSize="small" />}
            checked={selected}
            tabIndex={-1}
            disableRipple
          />
          {option}
        </Option>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={value.length === 0 ? placeholder : undefined}
          slotProps={{
            ...params.slotProps,
            // Recomendação da documentação do MUI: impede o autofill de endereço do Chrome,
            // que ignora `autocomplete="off"` em campos como "Estados".
            htmlInput: { ...params.slotProps.htmlInput, autoComplete: 'new-password' },
          }}
        />
      )}
    />
  )
}
