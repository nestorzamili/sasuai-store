'use client';

import { useState } from 'react';
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

export interface Entity {
  id: string;
  name: string;
  symbol?: string;
}

interface EntityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  entities: Entity[];
  placeholder: string;
  emptyPlaceholder: string;
  searchPlaceholder: string;
  createEntityText: string;
  onCreateEntity: () => void;
  allowNone?: boolean;
  displayWithSymbol?: boolean;
}

export function EntityCombobox({
  value,
  onChange,
  entities,
  placeholder,
  emptyPlaceholder,
  searchPlaceholder,
  createEntityText,
  onCreateEntity,
  allowNone = false,
  displayWithSymbol = false,
}: EntityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected entity
  const selectedEntity = entities.find((entity) => entity.id === value);

  const getDisplayText = (entity: Entity) => {
    if (displayWithSymbol && entity.symbol) {
      return `${entity.name} (${entity.symbol})`;
    }
    return entity.name;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedEntity
            ? getDisplayText(selectedEntity)
            : value === '' && allowNone
            ? 'None'
            : placeholder}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={setSearchQuery}
          />
          <CommandList
            className="max-h-[200px] overflow-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>
              <div className="py-4 text-center text-sm">
                <p className="text-muted-foreground">{emptyPlaceholder}</p>
                <Button
                  variant="link"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setOpen(false);
                    onCreateEntity();
                  }}
                >
                  <IconPlus className="mr-1 h-3 w-3" />
                  {searchQuery.trim()
                    ? `Create "${searchQuery}"`
                    : createEntityText}
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === '' ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  None
                </CommandItem>
              )}
              {entities.map((entity) => (
                <CommandItem
                  key={entity.id}
                  value={entity.name}
                  onSelect={() => {
                    onChange(entity.id);
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === entity.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {getDisplayText(entity)}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  onCreateEntity();
                }}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                {createEntityText}
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
