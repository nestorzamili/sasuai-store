import { Brand } from '@prisma/client';

export interface BrandWithCount extends Brand {
  _count?: {
    products: number;
  };
}

export interface BrandWhereInput {
  id?: string;
  name?: string | { contains: string };
}
