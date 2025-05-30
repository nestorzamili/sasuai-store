'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  createProduct,
  getProductFormOptions,
  updateProduct,
  getProductImages,
  addProductImage,
} from '../action';
import {
  ProductWithRelations,
  ProductImageWithUrl,
  Category,
  Brand,
  Unit,
} from '@/lib/types/product';

// Define the type directly without creating an unused schema
export type ProductFormValues = {
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  price: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive: boolean;
};

// Simplified temporary image type
interface TempImage {
  id: string;
  imageUrl: string;
  fullUrl: string;
  isPrimary: boolean;
}

interface ProductFormContextProps {
  isEditing: boolean;
  loading: boolean;
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  images: ProductImageWithUrl[];
  tempImages: TempImage[];
  setImages: (images: ProductImageWithUrl[]) => void;
  addTempImage: (imageUrl: string) => void;
  removeTempImage: (id: string) => void;
  setTempPrimaryImage: (id: string) => void;
  primaryImageUrl: string | null;
  submitForm: () => void;
  cancelForm: () => void;
  openCategoryCreate: boolean;
  setOpenCategoryCreate: (open: boolean) => void;
  openBrandCreate: boolean;
  setOpenBrandCreate: (open: boolean) => void;
  openUnitCreate: boolean;
  setOpenUnitCreate: (open: boolean) => void;
  productId: string | undefined;
  fetchProductImages: (productId: string) => Promise<void>;
  fetchOptions: () => Promise<void>;
}

export const ProductFormContext = createContext<ProductFormContextProps | null>(
  null,
);

export const useProductForm = () => {
  const context = useContext(ProductFormContext);
  if (!context) {
    throw new Error('useProductForm must be used within a ProductFormProvider');
  }
  return context;
};

interface ProductFormProviderProps {
  children: ReactNode;
  initialData?: ProductWithRelations;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormProvider({
  children,
  initialData,
  onOpenChange,
  onSuccess,
}: ProductFormProviderProps) {
  const t = useTranslations('product.formProvider');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [images, setImages] = useState<ProductImageWithUrl[]>([]);
  const [tempImages, setTempImages] = useState<TempImage[]>([]);

  // Dialog state for creating new entities
  const [openCategoryCreate, setOpenCategoryCreate] = useState(false);
  const [openBrandCreate, setOpenBrandCreate] = useState(false);
  const [openUnitCreate, setOpenUnitCreate] = useState(false);

  const { toast } = useToast();
  const isEditing = Boolean(initialData?.id);
  const productId = initialData?.id;

  // Form schema with translations - created inside component to use translations
  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    categoryId: z.string().min(1, t('validation.categoryRequired')),
    brandId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    unitId: z.string().min(1, t('validation.unitRequired')),
    price: z.coerce.number().min(0, t('validation.pricePositive')),
    skuCode: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
  });

  // Initialize the form
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || '',
      brandId: initialData?.brand?.id || null,
      description: initialData?.description || '',
      unitId: initialData?.unitId || '',
      price: initialData?.price || 0,
      skuCode: initialData?.skuCode || '',
      barcode: initialData?.barcode || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  // Consolidated function to fetch all options (categories, brands, units)
  const fetchOptions = async () => {
    try {
      const result = await getProductFormOptions();
      if (result.success && result.data) {
        setCategories(result.data.categories || []);
        setBrands(result.data.brands || []);
        setUnits(result.data.units || []);
      }
    } catch (error) {
      console.error('Failed to fetch form options:', error);
      toast({
        title: tCommon('error'),
        description: t('error.failedToFetchOptions'),
        variant: 'destructive',
      });
    }
  };

  // Fetch options on initialization
  useEffect(() => {
    fetchOptions();
  }, []);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      methods.reset({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        brandId: initialData.brand?.id || null,
        description: initialData.description || '',
        unitId: initialData.unitId || '',
        price: initialData.price || 0,
        skuCode: initialData.skuCode || '',
        barcode: initialData.barcode || '',
        isActive: initialData.isActive ?? true,
      });

      // If editing, fetch product images
      if (initialData.id) {
        fetchProductImages(initialData.id);
      }
    } else {
      methods.reset({
        name: '',
        categoryId: '',
        brandId: null,
        description: '',
        unitId: '',
        price: 0,
        skuCode: '',
        barcode: '',
        isActive: true,
      });
      setImages([]);
    }
  }, [methods, initialData]);

  // Function to fetch product images
  const fetchProductImages = async (productId: string) => {
    try {
      const response = await getProductImages(productId);
      if (response.success && response.data) {
        setImages(response.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Failed to fetch product images:', error);
      setImages([]);
    }
  };

  // Management of temporary images
  const addTempImage = (imageUrl: string) => {
    const newImage: TempImage = {
      id: `temp-${Date.now()}`,
      imageUrl,
      fullUrl: imageUrl,
      isPrimary: tempImages.length === 0, // First image is primary by default
    };

    setTempImages((prev) => {
      if (newImage.isPrimary) {
        return [...prev.map((img) => ({ ...img, isPrimary: false })), newImage];
      }
      return [...prev, newImage];
    });
  };

  const removeTempImage = (id: string) => {
    setTempImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // If we removed the primary image and have other images, set the first one as primary
      if (prev.find((img) => img.id === id)?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setTempPrimaryImage = (id: string) => {
    setTempImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id })),
    );
  };

  // Simplified function to save temporary images to a product
  const saveTempImagesToProduct = async (productId: string) => {
    if (tempImages.length === 0) return;

    try {
      // Sort images so primary is processed first
      const sortedImages = [...tempImages].sort((a, b) =>
        a.isPrimary ? -1 : b.isPrimary ? 1 : 0,
      );

      // Use Promise.all for parallel processing
      await Promise.all(
        sortedImages.map((image) =>
          addProductImage({
            productId,
            imageUrl: image.imageUrl,
            isPrimary: image.isPrimary,
          }),
        ),
      );

      setTempImages([]);
    } catch (error) {
      console.error('Failed to save temporary images:', error);
      toast({
        title: tCommon('warning'),
        description: t('error.imagesSaveWarning'),
        variant: 'destructive',
      });
    }
  };

  // Get primary image URL
  const primaryImageUrl =
    images.find((img) => img.isPrimary)?.fullUrl ||
    images[0]?.fullUrl ||
    tempImages.find((img) => img.isPrimary)?.fullUrl ||
    tempImages[0]?.fullUrl ||
    null;

  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);

      if (isEditing && initialData) {
        // Updating existing product
        const result = await updateProduct(initialData.id, values);

        if (result.success) {
          toast({
            title: t('success.productUpdated'),
            description: t('success.productUpdatedMessage'),
          });

          methods.reset();
          onSuccess?.();
          onOpenChange?.(false);
        } else {
          toast({
            title: tCommon('error'),
            description: result.error || t('error.somethingWrong'),
            variant: 'destructive',
          });
        }
      } else {
        // Creating new product
        const result = await createProduct(
          values as Required<ProductFormValues>,
        );

        if (result.success && result.data) {
          // If we have temporary images, save them to the new product
          const newProductId = result.data.id;
          await saveTempImagesToProduct(newProductId);

          toast({
            title: t('success.productCreated'),
            description: t('success.productCreatedMessage'),
          });

          methods.reset();
          setTempImages([]);
          onSuccess?.();
          onOpenChange?.(false);
        } else {
          toast({
            title: tCommon('error'),
            description: result.error || t('error.somethingWrong'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting product form:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form submission
  const submitForm = () => {
    methods.handleSubmit(onSubmit)();
  };

  // Function to handle form cancellation
  const cancelForm = () => {
    methods.reset();
    onOpenChange?.(false);
  };

  // Context value
  const contextValue: ProductFormContextProps = {
    isEditing,
    loading,
    categories,
    brands,
    units,
    images,
    tempImages,
    setImages,
    addTempImage,
    removeTempImage,
    setTempPrimaryImage,
    primaryImageUrl,
    submitForm,
    cancelForm,
    openCategoryCreate,
    setOpenCategoryCreate,
    openBrandCreate,
    setOpenBrandCreate,
    openUnitCreate,
    setOpenUnitCreate,
    productId,
    fetchProductImages,
    fetchOptions,
  };

  return (
    <ProductFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}
