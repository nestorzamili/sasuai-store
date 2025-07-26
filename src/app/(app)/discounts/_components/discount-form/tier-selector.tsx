'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2 } from 'lucide-react';
import SelectedItemsTable from './selected-items-table';
import { getMemberTiersForSelection } from '../../action';
import {
  MemberTierForSelection,
  TierSelectorProps,
  Column,
} from '@/lib/types/discount';

export default function TierSelector({
  selectedIds,
  onChange,
}: TierSelectorProps) {
  const t = useTranslations('discount.form');
  const [allTiers, setAllTiers] = useState<MemberTierForSelection[]>([]);
  const [selectedItems, setSelectedItems] = useState<MemberTierForSelection[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  // Memoize selected item lookup for performance
  const selectedItemsMap = useMemo(() => {
    return new Set(selectedIds);
  }, [selectedIds]);

  // Load all tiers on component mount
  useEffect(() => {
    const loadAllTiers = async () => {
      setLoading(true);
      try {
        const response = await getMemberTiersForSelection('');
        if (response.success && response.tiers) {
          const transformedTiers: MemberTierForSelection[] = response.tiers.map(
            (tier) => ({
              id: tier.id,
              name: tier.name,
              minPoints: tier.minPoints,
              multiplier: tier.multiplier,
            }),
          );
          setAllTiers(transformedTiers);
        }
      } catch (error) {
        console.error('Error loading member tiers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllTiers();
  }, []);

  // Update selected items when selectedIds change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectedItems([]);
      return;
    }

    const newSelectedItems = allTiers.filter((tier) =>
      selectedIds.includes(tier.id),
    );
    setSelectedItems(newSelectedItems);
  }, [selectedIds, allTiers]);

  // Toggle tier selection
  const toggleTier = useCallback(
    (tier: MemberTierForSelection) => {
      const isSelected = selectedItemsMap.has(tier.id);
      let newSelectedIds: string[];

      if (isSelected) {
        newSelectedIds = selectedIds.filter((id) => id !== tier.id);
      } else {
        newSelectedIds = [...selectedIds, tier.id];
      }

      onChange(newSelectedIds);
    },
    [selectedIds, selectedItemsMap, onChange],
  );

  // Remove a selected tier
  const removeTier = useCallback(
    (id: string) => {
      const newSelectedIds = selectedIds.filter(
        (selectedId) => selectedId !== id,
      );
      onChange(newSelectedIds);
    },
    [selectedIds, onChange],
  );

  // Clear all selected tiers
  const clearSelection = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Define columns for the selected tiers table
  const tierColumns: Column<MemberTierForSelection>[] = useMemo(
    () => [
      { header: t('tierName'), accessor: 'name' },
      {
        header: t('minPoints'),
        accessor: (tier: MemberTierForSelection) =>
          tier.minPoints.toLocaleString(),
      },
      {
        header: t('pointsMultiplier'),
        accessor: (tier: MemberTierForSelection) => `${tier.multiplier}x`,
      },
    ],
    [t],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {selectedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            title={t('clearSelection')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {allTiers.map((tier) => (
          <label
            key={tier.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedItemsMap.has(tier.id)}
                onCheckedChange={() => toggleTier(tier)}
              />
              <div>
                <div className="font-medium text-sm">{tier.name}</div>
                <div className="text-xs text-muted-foreground">
                  {tier.minPoints.toLocaleString()} {t('points')} •{' '}
                  {tier.multiplier}x {t('multiplier')}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedItems.length} {t('itemsSelected')}
      </div>

      <SelectedItemsTable
        items={selectedItems}
        columns={tierColumns}
        onRemove={removeTier}
        emptyMessage={t('noItemsSelected')}
      />
    </div>
  );
}
