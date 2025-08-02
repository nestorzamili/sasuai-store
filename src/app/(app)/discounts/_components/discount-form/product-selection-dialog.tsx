'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  IconSearch,
  IconPackage,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getProductsForSelection } from '../../action';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  category?: { name: string };
  brand?: { name: string };
}

interface ProductSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelectionSave: (selectedIds: string[]) => void;
}

// Memoized ProductItem component for better performance
const ProductItem = memo(
  ({
    product,
    isSelected,
    onToggle,
    selectedText,
  }: {
    product: Product;
    isSelected: boolean;
    onToggle: (id: string) => void;
    selectedText: string;
  }) => (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => onToggle(product.id)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(product.id)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate text-sm">{product.name}</span>
          {product.barcode && (
            <Badge variant="outline" className="text-xs">
              {product.barcode}
            </Badge>
          )}
          {isSelected && (
            <Badge variant="default" className="text-xs">
              {selectedText}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.category && <span>{product.category.name}</span>}
          {product.brand && product.category && <span>•</span>}
          {product.brand && <span>{product.brand.name}</span>}
        </div>
      </div>
    </div>
  ),
);

ProductItem.displayName = 'ProductItem';

// Memoized SelectedProductItem component
const SelectedProductItem = memo(
  ({
    product,
    onRemove,
  }: {
    product: Product;
    onRemove: (id: string) => void;
  }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate text-sm">{product.name}</span>
          {product.barcode && (
            <Badge variant="outline" className="text-xs">
              {product.barcode}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.category && <span>{product.category.name}</span>}
          {product.brand && product.category && <span>•</span>}
          {product.brand && <span>{product.brand.name}</span>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(product.id)}
        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <IconX size={16} />
      </Button>
    </div>
  ),
);

SelectedProductItem.displayName = 'SelectedProductItem';

export default function ProductSelectionDialog({
  open,
  onOpenChange,
  selectedIds,
  onSelectionSave,
}: ProductSelectionDialogProps) {
  const t = useTranslations('discount.selectionDialog');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
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
      setProducts([]);
      setSearchQuery('');
      setError(null);
    } else {
      if (selectedIds.length > 0 && allProducts.length === 0) {
        const initialFetch = async () => {
          try {
            const result = await getProductsForSelection('');
            if (result.success && result.data) {
              setAllProducts(result.data);
            }
          } catch {
            // Silent fail
          }
        };
        initialFetch();
      }
    }
  }, [open, selectedIds.length, allProducts.length]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductsForSelection(debouncedSearch);
      if (result.success && result.data) {
        setProducts(result.data);

        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts =
            result.data?.filter((p) => !existingIds.has(p.id)) || [];
          return [...prev, ...newProducts];
        });
      } else {
        setError(result.error || 'Failed to load products');
      }
    } catch {
      if (open) {
        setError('Failed to load products');
      }
    } finally {
      if (open) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, open]);

  useEffect(() => {
    if (!open) return;
    fetchProducts();
  }, [open, fetchProducts]);

  useEffect(() => {
    if (!open || selectedIds.length === 0) return;

    const missingProducts = selectedIds.filter(
      (id) => !allProducts.find((product) => product.id === id),
    );

    if (missingProducts.length > 0) {
      const fetchSelectedProducts = async () => {
        try {
          const result = await getProductsForSelection('');
          if (result.success && result.data) {
            setAllProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newProducts =
                result.data?.filter((p) => !existingIds.has(p.id)) || [];
              return [...prev, ...newProducts];
            });
          }
        } catch {
          // Silent fail
        }
      };

      fetchSelectedProducts();
    }
  }, [open, selectedIds]);

  const filteredProducts = products;

  const localSelectedSet = useMemo(
    () => new Set(localSelectedIds),
    [localSelectedIds],
  );

  const handleToggleProduct = useCallback(
    (productId: string) => {
      const newSelection = localSelectedSet.has(productId)
        ? localSelectedIds.filter((id) => id !== productId)
        : [...localSelectedIds, productId];

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

  const selectedProducts = useMemo(() => {
    const selectedFromAll = allProducts.filter((product) =>
      localSelectedSet.has(product.id),
    );

    const missingSelectedIds = localSelectedIds.filter(
      (id) => !allProducts.find((product) => product.id === id),
    );

    const placeholderProducts = missingSelectedIds.map((id) => ({
      id,
      name: t('loading'),
      category: undefined,
      brand: undefined,
      barcode: undefined,
    }));

    return [...selectedFromAll, ...placeholderProducts];
  }, [allProducts, localSelectedSet, localSelectedIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackage size={20} />
            {t('selectProducts')}
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
                placeholder={t('searchProducts')}
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
                      {t('loading')}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8 text-destructive">
                    <p>{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchProducts}
                      className="mt-2"
                    >
                      {t('tryAgain')}
                    </Button>
                  </div>
                )}

                {!loading &&
                  !error &&
                  filteredProducts.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      isSelected={localSelectedSet.has(product.id)}
                      onToggle={handleToggleProduct}
                      selectedText={t('selected')}
                    />
                  ))}

                {!loading && !error && filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconPackage
                      size={48}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>{t('noItemsFound')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-l pl-6 flex flex-col space-y-4 min-h-0">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-medium">{t('selectedProducts')}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {localSelectedIds.length} {t('products')}
                </Badge>
                {localSelectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalSelectedIds([])}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    {t('removeAll')}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-2 min-h-[400px]">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <IconPackage
                      size={48}
                      className="mx-auto mb-2 opacity-30"
                    />
                    <p className="text-sm">{t('noProductsSelected')}</p>
                    <p className="text-xs mt-1">{t('selectFromList')}</p>
                  </div>
                ) : (
                  selectedProducts.map((product) => (
                    <SelectedProductItem
                      key={product.id}
                      product={product}
                      onRemove={handleToggleProduct}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={localSelectedIds.length === 0}
          >
            {localSelectedIds.length === 0
              ? t('selectProducts')
              : t('confirmProducts', { count: localSelectedIds.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
