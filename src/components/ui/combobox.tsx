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
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/common/debounce-effect';

export type ComboBoxOption = {
  value: string;
  label: string;
};

interface ComboBoxProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  initialDisplayCount?: number;
}

export function ComboBox({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
  emptyMessage = 'No items found.',
  initialDisplayCount = 10, // Jumlah item yang ditampilkan di awal
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredOptions, setFilteredOptions] = React.useState<
    ComboBoxOption[]
  >([]);
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Memoize options untuk mencegah re-render yang tidak perlu
  const memoizedOptions = React.useMemo(() => options, [options]);

  // Fungsi untuk memfilter opsi
  const filterOptions = React.useCallback(
    (query: string) => {
      if (!query.trim()) {
        // Tampilkan data awal ketika tidak ada query
        return initialDisplayCount > 0 &&
          memoizedOptions.length > initialDisplayCount
          ? memoizedOptions.slice(0, initialDisplayCount)
          : memoizedOptions;
      }

      // Filter berdasarkan query
      const lowerQuery = query.toLowerCase().trim();
      return memoizedOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(lowerQuery) ||
          option.value.toLowerCase().includes(lowerQuery),
      );
    },
    [memoizedOptions, initialDisplayCount],
  );

  // Buat debounced search dengan useCallback
  const debouncedSearch = React.useCallback(
    debounce((query: string) => {
      setFilteredOptions(filterOptions(query));
    }, 150),
    [filterOptions],
  );

  // Reset filtered options saat komponen mount, options berubah atau dropdown dibuka
  React.useEffect(() => {
    // Tampilkan data awal (terbatas) saat tidak ada pencarian
    setFilteredOptions(filterOptions(''));
  }, [memoizedOptions, open, filterOptions]);

  // Handle search input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Set up virtualization untuk daftar yang besar
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: React.useCallback(() => 36, []), // approximate height of each item
    overscan: 5, // Mengurangi overscan untuk performa lebih baik
  });

  // Find currently selected option - menggunakan useMemo untuk mencegah kalkulasi ulang
  const selectedOption = React.useMemo(
    () => memoizedOptions.find((option) => option.value === value),
    [memoizedOptions, value],
  );

  // Fungsi untuk menangani pemilihan item
  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setOpen(false);
      // Reset search query setelah pemilihan
      setSearchQuery('');
      // Reset filter kembali ke tampilan awal
      setFilteredOptions(filterOptions(''));
    },
    [onChange, filterOptions],
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
          {selectedOption ? selectedOption.label : placeholder}
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
            {filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
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
