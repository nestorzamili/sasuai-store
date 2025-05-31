'use client';

import { useTranslations } from 'next-intl';
import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function BrandCombobox({ value, onChange }: BrandComboboxProps) {
  const t = useTranslations('product.brandCombobox');
  const { brands, setOpenBrandCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={brands}
      placeholder={t('placeholder')}
      emptyPlaceholder={t('emptyPlaceholder')}
      searchPlaceholder={t('searchPlaceholder')}
      createEntityText={t('createEntityText')}
      onCreateEntity={() => setOpenBrandCreate(true)}
      allowNone={true}
    />
  );
}
