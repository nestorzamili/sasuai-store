import prisma from '@/lib/prisma';
interface SyncProductRequest {
  lastModified?: Date;
}
interface SyncProductResponse {
  status: string;
  message: string;
  data?: {
    unSyncedProductsTotal: number;
    products: ProductData[];
  };
}
interface ProductData {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  price: number;
  stock: number;
  lastModified: Date;
}
export class SyncProductService {
  static async syncProducts({
    lastModified,
  }: SyncProductRequest = {}): Promise<SyncProductResponse> {
    try {
      console.log('Starting product synchronization...');
      const products = await prisma.product.findMany({
        include: {
          category: true,
          brand: true,
        },
        orderBy: {
          updatedAt: 'asc',
        },
        where: {
          updatedAt: {
            gte: lastModified || new Date(0), // Default to epoch if no lastModified provided
          },
        },
      });
      const mappedProducts: ProductData[] = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.category?.name,
        brandId: product.brandId,
        brandName: product.brand?.name,
        price: product.price,
        stock: product.stock,
        lastModified: product.updatedAt,
      }));
      return {
        status: 'success',
        message: 'Products synced successfully',
        data: {
          unSyncedProductsTotal: mappedProducts.length,
          products: mappedProducts,
        },
      };
    } catch (error) {
      console.error('Error syncing products:', error);
      throw new Error('Failed to sync products');
    }
  }
}
