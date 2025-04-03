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

interface UnitComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitCombobox({ value, onChange }: UnitComboboxProps) {
  const { units, setOpenUnitCreate } = useProductForm();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected unit
  const selectedUnit = units.find((unit) => unit.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedUnit
            ? `${selectedUnit.name} (${selectedUnit.symbol})`
            : 'Select unit...'}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search units..."
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-4 text-center text-sm">
                <p className="text-muted-foreground">No unit found</p>
                <Button
                  variant="link"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setOpen(false);
                    setOpenUnitCreate(true);
                  }}
                >
                  <IconPlus className="mr-1 h-3 w-3" />
                  Create new unit
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {units.map((unit) => (
                <CommandItem
                  key={unit.id}
                  value={unit.name}
                  onSelect={() => {
                    onChange(unit.id);
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === unit.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {unit.name} ({unit.symbol})
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setOpenUnitCreate(true);
                }}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Create new unit
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
