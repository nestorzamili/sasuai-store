'use client';

import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const { categories, setOpenCategoryCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={categories}
      placeholder="Select category..."
      emptyPlaceholder="No category found"
      searchPlaceholder="Search categories..."
      createEntityText="Create new category"
      onCreateEntity={() => setOpenCategoryCreate(true)}
    />
  );
}
