'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconBadge, IconLoader2 } from '@tabler/icons-react';
import { getMemberTiers } from '../../action';
import type { MemberTierForSelection } from '@/lib/services/discount/types';

interface TierSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelectionSave: (selectedIds: string[]) => void;
}

const TierItem = memo(
  ({
    tier,
    isSelected,
    onToggle,
  }: {
    tier: MemberTierForSelection;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <div
      className={`flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => onToggle(tier.id)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(tier.id)}
      />
      <div className="flex items-center gap-3 flex-1">
        <IconBadge size={20} className="text-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{tier.name}</span>
            {isSelected && (
              <Badge variant="default" className="text-xs">
                Dipilih
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Min. Points: {tier.minPoints.toLocaleString('id-ID')}</span>
            <span>Multiplier: {tier.multiplier}x</span>
          </div>
        </div>
      </div>
    </div>
  ),
);

TierItem.displayName = 'TierItem';

export default function TierSelectionDialog({
  open,
  onOpenChange,
  selectedIds,
  onSelectionSave,
}: TierSelectionDialogProps) {
  const [tiers, setTiers] = useState<MemberTierForSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local selection state that's separate from the form
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // Initialize local selection when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds([...selectedIds]);
    }
  }, [open, selectedIds]);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMemberTiers();
      if (result.success && result.data) {
        setTiers(result.data);
      } else {
        setError(result.error || 'Failed to load member tiers');
      }
    } catch {
      if (open) {
        setError('Failed to load member tiers');
      }
    } finally {
      if (open) {
        setLoading(false);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setError(null);
    } else {
      fetchTiers();
    }
  }, [open, fetchTiers]);

  const localSelectedSet = useMemo(
    () => new Set(localSelectedIds),
    [localSelectedIds],
  );

  const handleToggleTier = useCallback(
    (tierId: string) => {
      const newSelection = localSelectedSet.has(tierId)
        ? localSelectedIds.filter((id) => id !== tierId)
        : [...localSelectedIds, tierId];

      setLocalSelectedIds(newSelection);
    },
    [localSelectedSet, localSelectedIds],
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(() => {
    // Save the local selection to the form
    onSelectionSave(localSelectedIds);
    onOpenChange(false);
  }, [localSelectedIds, onSelectionSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBadge size={20} />
            Pilih Member Tier
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-sm font-medium">Tier Tersedia</h3>
            <Badge variant="secondary">{localSelectedIds.length} dipilih</Badge>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2 pr-2">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Memuat tier...
                  </span>
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchTiers}
                    className="mt-2"
                  >
                    Coba lagi
                  </Button>
                </div>
              )}

              {!loading &&
                !error &&
                tiers.map((tier) => (
                  <TierItem
                    key={tier.id}
                    tier={tier}
                    isSelected={localSelectedSet.has(tier.id)}
                    onToggle={handleToggleTier}
                  />
                ))}

              {!loading && !error && tiers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconBadge size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Tidak ada tier ditemukan</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={localSelectedIds.length === 0}
          >
            {localSelectedIds.length === 0
              ? 'Pilih Tier'
              : `Konfirmasi ${localSelectedIds.length} Tier`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
