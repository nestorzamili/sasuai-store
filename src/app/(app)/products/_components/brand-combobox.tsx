'use client';

import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function BrandCombobox({ value, onChange }: BrandComboboxProps) {
  const { brands, setOpenBrandCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={brands}
      placeholder="Select brand..."
      emptyPlaceholder="No brand found"
      searchPlaceholder="Search brands..."
      createEntityText="Create new brand"
      onCreateEntity={() => setOpenBrandCreate(true)}
      allowNone={true}
    />
  );
}
