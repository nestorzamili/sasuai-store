"use server";

import { revalidatePath } from "next/cache";
import { ProductData, ProductType } from "./product-data";

// State management types
export type ProductState = {
  message: string;
  success: boolean;
  data?: ProductType | ProductType[] | null;
};

// Get all products
export async function getAllProducts(): Promise<ProductState> {
  try {
    // When you have an API, replace this with API call
    const products = ProductData;

    return {
      message: "Products fetched successfully",
      success: true,
      data: products,
    };
  } catch (error) {
    return {
      message: `Failed to fetch products: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
      data: null,
    };
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<ProductState> {
  try {
    // When you have an API, replace this with API call
    const product = ProductData.find((product) => product.id === id);

    if (!product) {
      return {
        message: "Product not found",
        success: false,
        data: null,
      };
    }

    return {
      message: "Product fetched successfully",
      success: true,
      data: product,
    };
  } catch (error) {
    return {
      message: `Failed to fetch product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
      data: null,
    };
  }
}

// Create new product
export async function createProduct(
  product: Omit<ProductType, "id">
): Promise<ProductState> {
  try {
    // Generate a unique ID (in a real app, this might be done on the backend)
    const newId = `prod${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`;
    const newProduct: ProductType = {
      ...product,
      id: newId,
    };

    // When you have an API, replace this with API call
    // For now, we're just simulating a successful creation

    revalidatePath("/products");

    return {
      message: "Product created successfully",
      success: true,
      data: newProduct,
    };
  } catch (error) {
    return {
      message: `Failed to create product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

// Update existing product
export async function updateProduct(
  id: string,
  updates: Partial<ProductType>
): Promise<ProductState> {
  try {
    // When you have an API, replace this with API call
    const existingProductIndex = ProductData.findIndex(
      (product) => product.id === id
    );

    if (existingProductIndex === -1) {
      return {
        message: "Product not found",
        success: false,
        data: null,
      };
    }

    // In a real implementation, this would update the database
    const updatedProduct = {
      ...ProductData[existingProductIndex],
      ...updates,
    };

    revalidatePath("/products");

    return {
      message: "Product updated successfully",
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    return {
      message: `Failed to update product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<ProductState> {
  try {
    // When you have an API, replace this with API call
    const productExists = ProductData.some((product) => product.id === id);

    if (!productExists) {
      return {
        message: "Product not found",
        success: false,
        data: null,
      };
    }

    // In a real implementation, this would delete from the database

    revalidatePath("/products");

    return {
      message: "Product deleted successfully",
      success: true,
    };
  } catch (error) {
    return {
      message: `Failed to delete product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

// Get products by category
export async function getProductsByCategory(
  category: string
): Promise<ProductState> {
  try {
    // When you have an API, replace this with API call
    const products = ProductData.filter(
      (product) => product.category === category
    );

    return {
      message: "Products fetched successfully",
      success: true,
      data: products,
    };
  } catch (error) {
    return {
      message: `Failed to fetch products by category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
      data: null,
    };
  }
}

// Update product stock
export async function updateProductStock(
  id: string,
  stockChange: number
): Promise<ProductState> {
  try {
    const product = ProductData.find((p) => p.id === id);

    if (!product) {
      return {
        message: "Product not found",
        success: false,
        data: null,
      };
    }

    const newStock = product.stock + stockChange;
    if (newStock < 0) {
      return {
        message: "Insufficient stock",
        success: false,
        data: product,
      };
    }

    // Update status based on new stock level
    let status: "in-stock" | "low-stock" | "out-of-stock" = "in-stock";
    if (newStock === 0) {
      status = "out-of-stock";
    } else if (newStock <= 30) {
      status = "low-stock";
    }

    const updatedProduct = {
      ...product,
      stock: newStock,
      status,
    };

    // When you have an API, replace this with API call

    revalidatePath("/products");

    return {
      message: "Product stock updated successfully",
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    return {
      message: `Failed to update product stock: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}
