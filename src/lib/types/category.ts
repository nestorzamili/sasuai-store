import { Category } from '@/lib/types/base-types';

export interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

export interface CategoryWhereInput {
  id?: string;
  name?: string | { contains: string };
  description?: string | { contains: string };
}
