'use client';

import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface UnitComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitCombobox({ value, onChange }: UnitComboboxProps) {
  const { units, setOpenUnitCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={units}
      placeholder="Select unit..."
      emptyPlaceholder="No unit found"
      searchPlaceholder="Search units..."
      createEntityText="Create new unit"
      onCreateEntity={() => setOpenUnitCreate(true)}
      displayWithSymbol={true}
    />
  );
}
