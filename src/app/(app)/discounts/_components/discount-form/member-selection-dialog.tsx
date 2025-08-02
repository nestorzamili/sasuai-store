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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconSearch, IconUsers, IconLoader2, IconX } from '@tabler/icons-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getMembers } from '../../action';
import type { MemberForSelection } from '@/lib/services/discount/types';

interface MemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelectionSave: (selectedIds: string[]) => void;
}

// Memoized MemberItem component for better performance
const MemberItem = memo(
  ({
    member,
    isSelected,
    onToggle,
  }: {
    member: MemberForSelection;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => onToggle(member.id)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(member.id)}
      />
      <Avatar className="w-10 h-10">
        <AvatarFallback>
          {member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate text-sm">{member.name}</span>
          {member.tier && (
            <Badge variant="outline" className="text-xs">
              {member.tier.name}
            </Badge>
          )}
          {member.cardId && (
            <Badge variant="secondary" className="text-xs">
              {member.cardId}
            </Badge>
          )}
          {isSelected && (
            <Badge variant="default" className="text-xs">
              Dipilih
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {member.phone ? (
            <span>{member.phone}</span>
          ) : (
            <span className="italic">Tidak ada nomor telepon</span>
          )}
        </div>
      </div>
    </div>
  ),
);

MemberItem.displayName = 'MemberItem';

// Memoized SelectedMemberItem component
const SelectedMemberItem = memo(
  ({
    member,
    onRemove,
  }: {
    member: MemberForSelection;
    onRemove: (id: string) => void;
  }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="text-xs">
          {member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate text-sm">{member.name}</span>
          {member.tier && (
            <Badge variant="outline" className="text-xs">
              {member.tier.name}
            </Badge>
          )}
          {member.cardId && (
            <Badge variant="secondary" className="text-xs">
              {member.cardId}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {member.phone ? (
            <span>{member.phone}</span>
          ) : (
            <span className="italic">Tidak ada nomor telepon</span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(member.id)}
        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <IconX size={16} />
      </Button>
    </div>
  ),
);

SelectedMemberItem.displayName = 'SelectedMemberItem';

export default function MemberSelectionDialog({
  open,
  onOpenChange,
  selectedIds,
  onSelectionSave,
}: MemberSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<MemberForSelection[]>([]);
  const [allMembers, setAllMembers] = useState<MemberForSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Local selection state that's separate from the form
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // Initialize local selection when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds([...selectedIds]);
    }
  }, [open, selectedIds]);

  useEffect(() => {
    if (!open) {
      setMembers([]);
      setSearchQuery('');
      setError(null);
    } else {
      if (selectedIds.length > 0 && allMembers.length === 0) {
        const initialFetch = async () => {
          try {
            const result = await getMembers('');
            if (result.success && result.data) {
              setAllMembers(result.data);
            }
          } catch {
            // Silent fail
          }
        };
        initialFetch();
      }
    }
  }, [open, selectedIds.length, allMembers.length]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMembers(debouncedSearch);
      if (result.success && result.data) {
        setMembers(result.data);

        setAllMembers((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMembers =
            result.data?.filter((m) => !existingIds.has(m.id)) || [];
          return [...prev, ...newMembers];
        });
      } else {
        setError(result.error || 'Failed to load members');
      }
    } catch {
      if (open) {
        setError('Failed to load members');
      }
    } finally {
      if (open) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, open]);

  useEffect(() => {
    if (!open) return;
    fetchMembers();
  }, [open, fetchMembers]);

  useEffect(() => {
    if (!open || selectedIds.length === 0) return;

    const missingMembers = selectedIds.filter(
      (id) => !allMembers.find((member) => member.id === id),
    );

    if (missingMembers.length > 0) {
      const fetchSelectedMembers = async () => {
        try {
          const result = await getMembers('');
          if (result.success && result.data) {
            setAllMembers((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newMembers =
                result.data?.filter((m) => !existingIds.has(m.id)) || [];
              return [...prev, ...newMembers];
            });
          }
        } catch {
          // Silent fail
        }
      };

      fetchSelectedMembers();
    }
  }, [open, selectedIds]);

  const filteredMembers = members;

  const localSelectedSet = useMemo(
    () => new Set(localSelectedIds),
    [localSelectedIds],
  );

  const handleToggleMember = useCallback(
    (memberId: string) => {
      const newSelection = localSelectedSet.has(memberId)
        ? localSelectedIds.filter((id) => id !== memberId)
        : [...localSelectedIds, memberId];

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

  const selectedMembers = useMemo(() => {
    const selectedFromAll = allMembers.filter((member) =>
      localSelectedSet.has(member.id),
    );

    const missingSelectedIds = localSelectedIds.filter(
      (id) => !allMembers.find((member) => member.id === id),
    );

    const placeholderMembers = missingSelectedIds.map((id) => ({
      id,
      name: `Memuat member...`,
      tier: null,
      cardId: null,
      phone: null,
    }));

    return [...selectedFromAll, ...placeholderMembers];
  }, [allMembers, localSelectedSet, localSelectedIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUsers size={20} />
            Pilih Member
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col space-y-4 min-h-0">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Cari member berdasarkan nama, nomor telepon, atau Card ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-2 min-h-[400px]">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">
                      Memuat member...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8 text-destructive">
                    <p>{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchMembers}
                      className="mt-2"
                    >
                      Coba lagi
                    </Button>
                  </div>
                )}

                {!loading &&
                  !error &&
                  filteredMembers.map((member) => (
                    <MemberItem
                      key={member.id}
                      member={member}
                      isSelected={localSelectedSet.has(member.id)}
                      onToggle={handleToggleMember}
                    />
                  ))}

                {!loading && !error && filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconUsers size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Tidak ada member ditemukan</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-l pl-6 flex flex-col space-y-4 min-h-0">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-medium">Member Dipilih</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {localSelectedIds.length} member
                </Badge>
                {localSelectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalSelectedIds([])}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Hapus Semua
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-2 min-h-[400px]">
                {selectedMembers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <IconUsers size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Belum ada member yang dipilih</p>
                    <p className="text-xs mt-1">
                      Pilih member dari daftar sebelah kiri
                    </p>
                  </div>
                ) : (
                  selectedMembers.map((member) => (
                    <SelectedMemberItem
                      key={member.id}
                      member={member}
                      onRemove={handleToggleMember}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
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
              ? 'Pilih Member'
              : `Konfirmasi ${localSelectedIds.length} Member`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
