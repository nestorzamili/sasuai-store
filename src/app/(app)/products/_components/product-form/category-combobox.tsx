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

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const { categories, setOpenCategoryCreate } = useProductForm();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected category
  const selectedCategory = categories.find((category) => category.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedCategory
            ? selectedCategory.name
            : 'Select category...'}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search categories..."
            onValueChange={setSearchQuery}
          />
          <CommandList
            className="max-h-[200px] overflow-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>
              <div className="py-4 text-center text-sm">
                <p className="text-muted-foreground">No category found</p>
                <Button
                  variant="link"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setOpen(false);
                    setOpenCategoryCreate(true);
                  }}
                >
                  <IconPlus className="mr-1 h-3 w-3" />
                  {searchQuery.trim()
                    ? `Create "${searchQuery}"`
                    : 'Create New Category'}
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setOpenCategoryCreate(true);
                }}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Create new category
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
