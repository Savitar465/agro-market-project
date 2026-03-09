import type { Product } from "@/data/products";
import { sellers as seedSellers } from "@/data/sellers";
import { apiRequest } from "@/lib/services/http-client";

const PRODUCTS_PATH = "/products";

type CreateProductDto = {
  name: string;
  price: number;
  unit?: string;
  image: string;
  images?: string[];
  description: string;
  category: string;
  stock?: number;
  rating?: number;
  sellerId?: string;
};

type UpdateProductDto = Partial<CreateProductDto>;

type ProductPayload = Omit<Product, "id"> & { id?: string };

type ApiProduct = Partial<Product> & {
  id?: string;
  sellerId?: string;
  seller?: {
    id?: string;
    name?: string;
    location?: string;
    coords?: { lat: number; lng: number };
  };
};

type PaginatedProductsResponse = {
  data?: ApiProduct[];
};

function toCreateDto(
  product: ProductPayload,
  sellerId?: string,
): CreateProductDto {
  return {
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.image,
    images: product.images,
    description: product.description,
    category: product.category,
    stock: product.stock,
    rating: product.rating,
    sellerId: sellerId || product.seller?.id,
  };
}

function toUpdateDto(product: ProductPayload): UpdateProductDto {
  return {
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.image,
    images: product.images,
    description: product.description,
    category: product.category,
    stock: product.stock,
    rating: product.rating,
    sellerId: product.seller?.id,
  };
}

function normalizeProduct(raw: ApiProduct): Product {
  const sellerId = raw.seller?.id || raw.sellerId;
  const sellerFromSeed = sellerId
    ? seedSellers.find((item) => item.id === sellerId)
    : undefined;

  return {
    id: String(raw.id || ""),
    name: raw.name || "",
    price: raw.price || 0,
    unit: raw.unit,
    image: raw.image || "",
    images: raw.images,
    description: raw.description || "",
    category: raw.category || "Pantry",
    stock: raw.stock,
    rating: raw.rating,
    seller: sellerId
      ? {
          id: sellerId,
          name: raw.seller?.name || sellerFromSeed?.name || "Unknown seller",
          location: raw.seller?.location || sellerFromSeed?.location,
          coords: raw.seller?.coords || sellerFromSeed?.coords,
        }
      : undefined,
  };
}

function normalizeListResponse(
  response: ApiProduct[] | PaginatedProductsResponse,
): Product[] {
  if (Array.isArray(response)) {
    return response.map(normalizeProduct);
  }

  return (response.data || []).map(normalizeProduct);
}

export async function getProducts(): Promise<Product[]> {
  const response = await apiRequest<ApiProduct[] | PaginatedProductsResponse>(
    PRODUCTS_PATH,
    { method: "GET" },
  );
  return normalizeListResponse(response);
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiRequest<ApiProduct>(`${PRODUCTS_PATH}/${id}`, {
    method: "GET",
  });
  return normalizeProduct(response);
}

export async function createProduct(
  product: ProductPayload,
  sellerId?: string,
): Promise<Product> {
  const response = await apiRequest<ApiProduct>(PRODUCTS_PATH, {
    method: "POST",
    body: JSON.stringify(toCreateDto(product, sellerId)),
  });

  return normalizeProduct(response);
}

export async function updateProduct(
  id: string,
  product: ProductPayload,
): Promise<Product> {
  const response = await apiRequest<ApiProduct>(`${PRODUCTS_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toUpdateDto(product)),
  });

  return normalizeProduct(response);
}

export async function updateProductStock(
  id: string,
  stock: number,
): Promise<Product> {
  const response = await apiRequest<ApiProduct>(`${PRODUCTS_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });

  return normalizeProduct(response);
}

export function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`${PRODUCTS_PATH}/${id}`, { method: "DELETE" });
}
