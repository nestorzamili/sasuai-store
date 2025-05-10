'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Loader2 } from 'lucide-react';
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

interface Entity {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntitySelectorProps<T extends Entity> {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  fetchItems: (search: string) => Promise<{ success: boolean; data?: T[] }>;
  renderItemDetails?: (item: T) => React.ReactNode;
  placeholder?: string;
  noSelectionText?: string;
  columns?: {
    header: string;
    accessor: string | ((item: any) => React.ReactNode);
    className?: string;
  }[];
}

export default function EntitySelector<T extends Entity>({
  selectedIds,
  onChange,
  fetchItems,
  renderItemDetails,
  placeholder = 'Search items...',
  noSelectionText = 'No items selected',
  columns,
}: EntitySelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default columns if none provided
  const defaultColumns = [{ header: 'Name', accessor: 'name' }];

  const tableColumns = columns || defaultColumns;

  // Helper function to fetch missing items by ID
  const fetchMissingItems = async (missingIds: string[]): Promise<T[]> => {
    if (missingIds.length === 0) return [];

    const fetchPromises = missingIds.map(async (id) => {
      const singleItemResponse = await fetchItems(id);
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

  // Load items on initial render
  useEffect(() => {
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

            if (selectedItemsFromResponse.length === selectedIds.length) {
              setSelectedItems(selectedItemsFromResponse);
            } else {
              // Some items weren't in the initial load, fetch them individually
              const missingIds = selectedIds.filter(
                (id) => !selectedItemsFromResponse.some((i) => i.id === id),
              );

              const missingItems = await fetchMissingItems(missingIds);
              setSelectedItems([...selectedItemsFromResponse, ...missingItems]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchInitialItems();
  }, []);

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

  // Function to handle barcode search on Enter key
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      e.preventDefault();
      setLoading(true);

      try {
        const response = await fetchItems(search);
        if (response.success && response.data && response.data.length > 0) {
          setItems(response.data);

          // Auto-select the first item for barcode searches (assuming barcode is unique)
          if (response.data.length === 1) {
            const item = response.data[0];
            if (!selectedIds.includes(item.id)) {
              const newSelectedIds = [...selectedIds, item.id];
              const newSelectedItems = [...selectedItems, item];
              setSelectedItems(newSelectedItems);
              onChange(newSelectedIds);

              // Clear search and close popover after auto-selecting
              setSearch('');
              setOpen(false);
            }
          }
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error('Error with barcode search:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start flex-1"
              disabled={loading && initialLoad}
            >
              {loading && initialLoad ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-96" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={search}
                onValueChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
              />
              {loading && (
                <div className="py-6 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading...
                  </p>
                </div>
              )}
              {!loading && (
                <CommandList>
                  {items.length === 0 ? (
                    <CommandEmpty>No items found</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => {
                            toggleItem(item);
                            setOpen(false);
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
                  )}
                </CommandList>
              )}
            </Command>
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
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        {selectedItems.length} item(s) selected
      </div>

      {/* Display selected items in a table */}
      <SelectedItemsTable
        items={selectedItems}
        columns={tableColumns}
        onRemove={removeItem}
        emptyMessage={noSelectionText}
      />
    </div>
  );
}
