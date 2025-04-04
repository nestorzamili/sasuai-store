'use client';

import { useState } from 'react';
import { useProductForm } from './product-form-provider';
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
import { IconCheck, IconPlus, IconSelector } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function BrandCombobox({ value, onChange }: BrandComboboxProps) {
  const { brands, setOpenBrandCreate } = useProductForm();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected brand
  const selectedBrand = brands.find((brand) => brand.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedBrand
            ? selectedBrand.name
            : value === 'none'
            ? 'None'
            : 'Select brand...'}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search brands..."
            onValueChange={setSearchQuery}
          />
          <CommandList
            className="max-h-[200px] overflow-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>
              <div className="py-4 text-center text-sm">
                <p className="text-muted-foreground">No brand found</p>
                <Button
                  variant="link"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setOpen(false);
                    setOpenBrandCreate(true);
                  }}
                >
                  <IconPlus className="mr-1 h-3 w-3" />
                  {searchQuery.trim()
                    ? `Create "${searchQuery}"`
                    : 'Create New Brand'}
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange('none');
                  setOpen(false);
                }}
              >
                <IconCheck
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === 'none' ? 'opacity-100' : 'opacity-0',
                  )}
                />
                None
              </CommandItem>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.id}
                  value={brand.name}
                  onSelect={() => {
                    onChange(brand.id);
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === brand.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {brand.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setOpenBrandCreate(true);
                }}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Create new brand
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
