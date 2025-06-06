'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Loader2, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import SelectedItemsTable from './selected-items-table';
import { Entity, EntitySelectorProps } from '@/lib/types/discount';

export default function EntitySelector<T extends Entity>({
  selectedIds,
  onChange,
  fetchItems,
  fetchItemById,
  renderItemDetails,
  placeholder,
  noSelectionText,
  columns,
}: EntitySelectorProps<T>) {
  const t = useTranslations('discount.form');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetchedSelectedIds, setFetchedSelectedIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initialLoadRef = useRef(true);

  // Default placeholder and noSelectionText with translations
  const defaultPlaceholder = placeholder || t('searchProducts');
  const defaultNoSelectionText = noSelectionText || t('noItemsSelected');

  // Default columns if none provided
  const tableColumns = useMemo(
    () => columns || [{ header: t('productName'), accessor: 'name' }],
    [columns, t],
  );

  // Helper function to fetch missing items by ID
  const fetchMissingItems = async (missingIds: string[]): Promise<T[]> => {
    if (missingIds.length === 0) return [];

    const fetchPromises = missingIds.map(async (id) => {
      // Use fetchItemById if available, otherwise fall back to fetchItems
      const fetchFn = fetchItemById || fetchItems;
      const singleItemResponse = await fetchFn(id);
      if (
        singleItemResponse.success &&
        singleItemResponse.data &&
        singleItemResponse.data.length > 0
      ) {
        return singleItemResponse.data;
      }
      return [];
    });

    const results = await Promise.all(fetchPromises);
    return results.flat();
  };

  // Compare selected IDs to see if they've changed
  const selectedIdsChanged = useMemo(() => {
    if (selectedIds.length !== fetchedSelectedIds.length) return true;
    return selectedIds.some((id) => !fetchedSelectedIds.includes(id));
  }, [selectedIds, fetchedSelectedIds]);

  // Load items on initial render or when selected IDs change significantly
  useEffect(() => {
    if (!initialLoadRef.current && !selectedIdsChanged) {
      return; // Skip if not initial load and selected IDs haven't changed
    }

    const fetchInitialItems = async () => {
      setLoading(true);
      try {
        const response = await fetchItems('');
        if (response.success && response.data) {
          setItems(response.data);

          // If we have selected IDs, fetch their details
          if (selectedIds.length > 0) {
            const selectedItemsFromResponse = response.data.filter((item) =>
              selectedIds.includes(item.id),
            );

            // Only fetch missing items if necessary
            if (selectedItemsFromResponse.length !== selectedIds.length) {
              const foundIds = selectedItemsFromResponse.map((item) => item.id);
              const missingIds = selectedIds.filter(
                (id) => !foundIds.includes(id),
              );

              if (missingIds.length > 0) {
                const missingItems = await fetchMissingItems(missingIds);
                setSelectedItems([
                  ...selectedItemsFromResponse,
                  ...missingItems,
                ]);
              } else {
                setSelectedItems(selectedItemsFromResponse);
              }
            } else {
              setSelectedItems(selectedItemsFromResponse);
            }
          } else {
            setSelectedItems([]);
          }

          // Store fetched IDs to avoid unnecessary refetches
          setFetchedSelectedIds(selectedIds);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        initialLoadRef.current = false;
      }
    };

    fetchInitialItems();
  }, [fetchItems, selectedIds, selectedIdsChanged]);

  // Handle search input change
  const handleSearchChange = async (value: string) => {
    setSearch(value);
    setLoading(true);

    try {
      const response = await fetchItems(value);
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle item selection
  const toggleItem = (item: T) => {
    const isSelected = selectedIds.includes(item.id);
    let newSelectedIds: string[];
    let newSelectedItems: T[];

    if (isSelected) {
      newSelectedIds = selectedIds.filter((id) => id !== item.id);
      newSelectedItems = selectedItems.filter((i) => i.id !== item.id);
    } else {
      newSelectedIds = [...selectedIds, item.id];
      newSelectedItems = [...selectedItems, item];
    }

    setSelectedItems(newSelectedItems);
    onChange(newSelectedIds);
  };

  // Remove a selected item
  const removeItem = (id: string) => {
    const newSelectedIds = selectedIds.filter(
      (selectedId) => selectedId !== id,
    );
    const newSelectedItems = selectedItems.filter((i) => i.id !== id);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedIds);
  };

  // When popover opens, focus the search input
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // If search value changes, do the search
  useEffect(() => {
    if (search !== '') {
      const timer = setTimeout(() => {
        handleSearchChange(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between min-h-10"
              disabled={loading && initialLoad}
            >
              {loading && initialLoad ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {defaultPlaceholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder={defaultPlaceholder}
                value={search}
                onValueChange={handleSearchChange}
                ref={searchInputRef}
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? t('loading') : t('noItemsFound')}
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        toggleItem(item);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          {renderItemDetails && (
                            <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                              {renderItemDetails(item)}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => toggleItem(item)}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {t('done')} ({selectedIds.length} {t('selected')})
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {selectedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedItems([]);
              onChange([]);
            }}
            title={t('clearSelection')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        {selectedItems.length} {t('itemsSelected')}
      </div>

      <SelectedItemsTable
        items={selectedItems}
        columns={tableColumns}
        onRemove={removeItem}
        emptyMessage={defaultNoSelectionText}
      />
    </div>
  );
}
