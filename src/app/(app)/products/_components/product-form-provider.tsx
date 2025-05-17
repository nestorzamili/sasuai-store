'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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
import { ProductWithRelations, ProductImageWithUrl } from '@/lib/types/product';
import { Category, Brand, Unit } from '@/lib/types/base-types';

// Form schema for product
const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  skuCode: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof formSchema>;

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

  // Initialize the form
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || '',
      brandId: initialData?.brand?.id || null,
      description: initialData?.description || '',
      unitId: initialData?.unitId || '',
      price: initialData?.sellPrice || 0,
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
      toast({
        title: 'Error',
        description: 'Failed to fetch form options',
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
        price: initialData.sellPrice || 0,
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
        title: 'Warning',
        description: 'Some images may not have been saved properly',
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
            title: 'Product updated',
            description: 'Product has been updated successfully',
          });

          methods.reset();
          onSuccess?.();
          onOpenChange?.(false);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Something went wrong',
            variant: 'destructive',
          });
        }
      } else {
        // Creating new product
        const result = await createProduct(values);

        if (result.success && result.data) {
          // If we have temporary images, save them to the new product
          const newProductId = result.data.id;
          await saveTempImagesToProduct(newProductId);

          toast({
            title: 'Product created',
            description: 'New product has been created',
          });

          methods.reset();
          setTempImages([]);
          onSuccess?.();
          onOpenChange?.(false);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Something went wrong',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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
