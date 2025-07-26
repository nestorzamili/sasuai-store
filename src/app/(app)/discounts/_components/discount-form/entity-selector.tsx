'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default placeholder and noSelectionText with translations
  const defaultPlaceholder = placeholder || t('searchProducts');
  const defaultNoSelectionText = noSelectionText || t('noItemsSelected');

  // Memoize selected item lookup for performance
  const selectedItemsMap = useMemo(() => {
    return new Set(selectedIds);
  }, [selectedIds]);

  // Default columns if none provided
  const tableColumns = useMemo(
    () => columns || [{ header: t('productName'), accessor: 'name' }],
    [columns, t],
  );

  // Perform search function
  const performSearch = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      try {
        const response = await fetchItems(searchTerm);
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
    },
    [fetchItems],
  );

  // Handle search input with debouncing
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearch(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch],
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch selected items when selectedIds change
  useEffect(() => {
    const fetchSelectedItems = async () => {
      if (selectedIds.length === 0) {
        setSelectedItems([]);
        return;
      }

      // Skip fetch if we already have all selected items
      const currentItemIds = selectedItems.map((item) => item.id);
      const hasAllItems =
        selectedIds.every((id) => currentItemIds.includes(id)) &&
        currentItemIds.every((id) => selectedIds.includes(id));

      if (hasAllItems && selectedItems.length === selectedIds.length) {
        return;
      }

      try {
        // Try to find all selected items using individual fetch
        const fetchPromises = selectedIds.map(async (id) => {
          // Use fetchItemById if available, otherwise use fetchItems with ID
          if (fetchItemById) {
            const response = await fetchItemById(id);
            return response.success && response.data && response.data.length > 0
              ? response.data[0]
              : null;
          } else {
            // Fallback: search for the specific ID
            const response = await fetchItems(id);
            if (response.success && response.data) {
              return response.data.find((item) => item.id === id) || null;
            }
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const validItems = results.filter((item) => item !== null) as T[];
        setSelectedItems(validItems);
      } catch (error) {
        console.error('Error fetching selected items:', error);
        setSelectedItems([]);
      }
    };

    fetchSelectedItems();
  }, [selectedIds, fetchItems, fetchItemById]);

  // Toggle item selection
  const toggleItem = useCallback(
    (item: T) => {
      const isSelected = selectedItemsMap.has(item.id);
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
    },
    [selectedIds, selectedItems, selectedItemsMap, onChange],
  );

  // Remove a selected item
  const removeItem = useCallback(
    (id: string) => {
      const newSelectedIds = selectedIds.filter(
        (selectedId) => selectedId !== id,
      );
      const newSelectedItems = selectedItems.filter((i) => i.id !== id);
      setSelectedItems(newSelectedItems);
      onChange(newSelectedIds);
    },
    [selectedIds, selectedItems, onChange],
  );

  // Clear all selected items
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    onChange([]);
  }, [onChange]);

  // When popover opens, focus the search input and reset search
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      // Reset search when popover opens to ensure clean state
      setSearch('');
      setItems([]);
    }
  }, [open]);

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
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {defaultPlaceholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={defaultPlaceholder}
                value={search}
                onValueChange={handleSearchInputChange}
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
                      value={item.name}
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
                          checked={selectedItemsMap.has(item.id)}
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
            onClick={clearSelection}
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
