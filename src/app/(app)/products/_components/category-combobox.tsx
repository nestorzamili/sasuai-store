'use client';

import { useTranslations } from 'next-intl';
import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const t = useTranslations('product.categoryCombobox');
  const { categories, setOpenCategoryCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={categories}
      placeholder={t('placeholder')}
      emptyPlaceholder={t('emptyPlaceholder')}
      searchPlaceholder={t('searchPlaceholder')}
      createEntityText={t('createEntityText')}
      onCreateEntity={() => setOpenCategoryCreate(true)}
    />
  );
}
