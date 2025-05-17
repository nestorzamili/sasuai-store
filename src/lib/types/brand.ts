import { Brand } from '@/lib/types/base-types';

export interface BrandWithCount extends Brand {
  _count?: {
    products: number;
  };
}

export interface BrandWhereInput {
  id?: string;
  name?: string | { contains: string };
}
