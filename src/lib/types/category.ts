import { Category } from '@prisma/client';

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
