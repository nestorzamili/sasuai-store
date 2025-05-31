'use client';

import { useTranslations } from 'next-intl';
import { useProductForm } from './product-form-provider';
import { EntityCombobox } from './entity-combobox';

interface UnitComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitCombobox({ value, onChange }: UnitComboboxProps) {
  const t = useTranslations('product.unitCombobox');
  const { units, setOpenUnitCreate } = useProductForm();

  return (
    <EntityCombobox
      value={value}
      onChange={onChange}
      entities={units}
      placeholder={t('placeholder')}
      emptyPlaceholder={t('emptyPlaceholder')}
      searchPlaceholder={t('searchPlaceholder')}
      createEntityText={t('createEntityText')}
      onCreateEntity={() => setOpenUnitCreate(true)}
      displayWithSymbol={true}
    />
  );
}
