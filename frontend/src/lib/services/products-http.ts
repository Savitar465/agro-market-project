import type { Product, ProductStatus } from "@/data/products";
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
  status?: ProductStatus;
  sellerId?: string;
};

type UpdateProductDto = Partial<CreateProductDto>;

type ProductPayload = Omit<Product, "id"> & { id?: string };

type ApiProduct = Partial<Product> & {
  id?: string;
  status?: ProductStatus;
  sellerId?: string;
  distanceKm?: number;
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
  const resolvedSellerId = sellerId || product.seller?.id;
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
    status: product.status,
    // Only forward a real seller id; the backend derives the seller from the
    // authenticated user when this is omitted.
    sellerId:
      resolvedSellerId && resolvedSellerId !== "default"
        ? resolvedSellerId
        : undefined,
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
    status: product.status,
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
    price: Number(raw.price) || 0,
    unit: raw.unit,
    image: raw.image || "",
    images: raw.images,
    description: raw.description || "",
    category: raw.category || "Pantry",
    stock: raw.stock !== undefined ? Number(raw.stock) : undefined,
    rating: raw.rating !== undefined ? Number(raw.rating) : undefined,
    status: raw.status,
    distanceKm:
      raw.distanceKm !== undefined && raw.distanceKm !== null
        ? Number(raw.distanceKm)
        : undefined,
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

export type SearchProductsParams = {
  name?: string;
  category?: string;
  lat?: number;
  lng?: number;
  /** Only products whose seller is within this radius (km). Requires lat/lng. */
  maxDistanceKm?: number;
  sortBy?: "name" | "price" | "rating" | "createDateTime" | "distance";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

/**
 * Server-side product search. When lat/lng are provided the backend computes
 * each product's distanceKm and supports sortBy=distance / maxDistanceKm.
 */
export async function searchProducts(
  params: SearchProductsParams,
): Promise<Product[]> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const response = await apiRequest<PaginatedProductsResponse>(
    `${PRODUCTS_PATH}/search?${query.toString()}`,
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

/** The authenticated seller's own inventory (includes suspended products). */
export async function getMyProducts(): Promise<Product[]> {
  const response = await apiRequest<ApiProduct[]>(`${PRODUCTS_PATH}/mine`, {
    method: "GET",
  });
  return (response || []).map(normalizeProduct);
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
  const response = await apiRequest<ApiProduct>(`${PRODUCTS_PATH}/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });

  return normalizeProduct(response);
}

export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<Product> {
  const response = await apiRequest<ApiProduct>(
    `${PRODUCTS_PATH}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return normalizeProduct(response);
}

export function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`${PRODUCTS_PATH}/${id}`, { method: "DELETE" });
}
