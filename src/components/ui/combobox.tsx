'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
import { IconCheck, IconSelector, IconLoader2 } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/common/debounce-effect';

export type ComboBoxOption<T = unknown> = {
  value: string;
  label: string;
  data?: T; // Generic data field for custom data
};

interface ComboBoxProps<T = unknown> {
  options: ComboBoxOption<T>[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  initialDisplayCount?: number;
  loadingState?: boolean;
  customSearchFunction?: (query: string) => Promise<void>;
  customSelectedRenderer?: () => React.ReactNode;
  customEmptyComponent?: React.ReactNode;
}

export function ComboBox<T = unknown>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
  emptyMessage = 'No items found.',
  initialDisplayCount = 10,
  loadingState = false,
  customSearchFunction,
  customSelectedRenderer,
  customEmptyComponent,
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredOptions, setFilteredOptions] = React.useState<
    ComboBoxOption<T>[]
  >([]);
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = React.useMemo(() => options, [options]);

  // Filter options function - only used if customSearchFunction isn't provided
  const filterOptions = React.useCallback(
    (query: string) => {
      if (!query.trim()) {
        return initialDisplayCount > 0 &&
          memoizedOptions.length > initialDisplayCount
          ? memoizedOptions.slice(0, initialDisplayCount)
          : memoizedOptions;
      }

      const lowerQuery = query.toLowerCase().trim();
      return memoizedOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(lowerQuery) ||
          option.value.toLowerCase().includes(lowerQuery),
      );
    },
    [memoizedOptions, initialDisplayCount],
  );

  // Handle search with either custom or default function
  const handleSearchChange = React.useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (customSearchFunction) {
        // Using custom search function (usually server-side search)
        if (query.length >= 2) {
          customSearchFunction(query);
        }
      } else {
        // Using client-side filtering
        const debouncedFilter = debounce(() => {
          setFilteredOptions(filterOptions(query));
        }, 150);

        debouncedFilter();
      }
    },
    [customSearchFunction, filterOptions],
  );

  // Reset filtered options when component mounts or options change
  React.useEffect(() => {
    if (!customSearchFunction) {
      setFilteredOptions(filterOptions(''));
    } else {
      setFilteredOptions(options);
    }
  }, [options, open, filterOptions, customSearchFunction]);

  // Set up virtualization for large lists
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: React.useCallback(() => 36, []),
    overscan: 5,
  });

  // Find currently selected option
  const selectedOption = React.useMemo(
    () => memoizedOptions.find((option) => option.value === value),
    [memoizedOptions, value],
  );

  // Handle selection
  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setOpen(false);
      setSearchQuery('');

      if (!customSearchFunction) {
        setFilteredOptions(filterOptions(''));
      }
    },
    [onChange, filterOptions, customSearchFunction],
  );

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {customSelectedRenderer
            ? customSelectedRenderer()
            : selectedOption
              ? selectedOption.label
              : placeholder}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            onValueChange={handleSearchChange}
            value={searchQuery}
            className="border-none focus:ring-0"
          />
          <CommandList
            className="max-h-64 overflow-auto"
            ref={parentRef}
            onWheel={(e) => e.stopPropagation()}
          >
            {loadingState && (
              <div className="flex items-center justify-center py-6">
                <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            )}

            {!loadingState && filteredOptions.length === 0 ? (
              <CommandEmpty>
                {customEmptyComponent || emptyMessage}
              </CommandEmpty>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                  display: loadingState ? 'none' : 'block',
                }}
              >
                <CommandGroup>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const option = filteredOptions[virtualRow.index];
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <IconCheck
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === option.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
