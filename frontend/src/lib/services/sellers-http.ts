import type { Coordinates } from "@/data/products";
import type { Seller } from "@/data/sellers";
import { apiRequest } from "@/lib/services/http-client";

const SELLERS_PATH = "/sellers";

export type SellerProfile = {
  id: string;
  name: string;
  location?: string;
  userId?: string;
  coords?: Coordinates;
};

type ApiSeller = {
  id?: string;
  name?: string;
  location?: string;
  userId?: string;
  coords?: Coordinates;
};

export type SellerPayload = {
  name: string;
  location?: string;
  coords?: Coordinates;
};

function normalizeSeller(raw: ApiSeller): SellerProfile {
  return {
    id: String(raw.id || ""),
    name: raw.name || "",
    location: raw.location,
    userId: raw.userId,
    coords: raw.coords,
  };
}

/** Map a backend seller into the shape the store/UI expects. */
export function toStoreSeller(seller: SellerProfile): Seller {
  return {
    id: seller.id,
    name: seller.name,
    location: seller.location,
    coords: seller.coords,
    productIds: [],
  };
}

export async function getSellers(): Promise<SellerProfile[]> {
  const response = await apiRequest<ApiSeller[]>(SELLERS_PATH, {
    method: "GET",
  });
  return (response || []).map(normalizeSeller);
}

/** Returns the seller profile owned by the user, or null if none exists yet. */
export async function getSellerByUserId(
  userId: string,
): Promise<SellerProfile | null> {
  const response = await apiRequest<ApiSeller | null>(
    `${SELLERS_PATH}/by-user/${userId}`,
    { method: "GET" },
  );
  return response ? normalizeSeller(response) : null;
}

export async function createSeller(
  payload: SellerPayload,
): Promise<SellerProfile> {
  const response = await apiRequest<ApiSeller>(SELLERS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeSeller(response);
}

export async function updateSeller(
  id: string,
  payload: SellerPayload,
): Promise<SellerProfile> {
  const response = await apiRequest<ApiSeller>(`${SELLERS_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeSeller(response);
}
