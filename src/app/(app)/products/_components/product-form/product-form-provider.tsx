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
} from '../../action';
import { ProductWithRelations, ProductImageWithUrl } from '@/lib/types/product';
import { Category, Brand, Unit } from '@prisma/client';
import { getProductImages } from '@/app/(app)/products/images/action';

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

interface ProductFormContextProps {
  isEditing: boolean;
  loading: boolean;
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  images: ProductImageWithUrl[];
  setImages: (images: ProductImageWithUrl[]) => void;
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
      brandId: initialData?.brandId || null,
      description: initialData?.description || '',
      unitId: initialData?.unitId || '',
      price: initialData?.price || 0,
      skuCode: initialData?.skuCode || '',
      barcode: initialData?.barcode || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  // Fetch form options (categories, brands, units)
  useEffect(() => {
    async function fetchOptions() {
      try {
        const result = await getProductFormOptions();
        if (result.success && result.data) {
          setCategories(result.data.categories || []);
          setBrands(result.data.brands || []);
          // Handle potential missing units property safely
          if (result.data.units) {
            setUnits(result.data.units);
          } else {
            // Provide some default units if none are returned from the API
            setUnits([
              { id: 'pcs', name: 'Piece', symbol: 'pcs' },
              { id: 'kg', name: 'Kilogram', symbol: 'kg' },
              { id: 'l', name: 'Liter', symbol: 'L' },
            ] as Unit[]);
          }
        }
      } catch (error) {
        toast({
          title: 'Error fetching form options',
          description: 'Failed to load categories, brands, or units',
          variant: 'destructive',
        });
      }
    }
    fetchOptions();
  }, []);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      methods.reset({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        brandId: initialData.brandId || null,
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
      setImages([]);
    }
  };

  // Get primary image URL
  const primaryImageUrl =
    images.find((img) => img.isPrimary)?.fullUrl || images[0]?.fullUrl || null;

  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateProduct(initialData.id, values)
          : await createProduct(values);

      if (result.success) {
        toast({
          title: isEditing ? 'Product updated' : 'Product created',
          description: isEditing
            ? 'Product has been updated successfully'
            : 'New product has been created',
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
    setImages,
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
  };

  return (
    <ProductFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}
