import { apiRequest } from "@/lib/services/http-client";

const CART_PATH = "/cart";

export type CartItemResponse = {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    stock?: number;
  };
};

export type CartResponse = {
  id: string;
  userId: string;
  status: string;
  items: CartItemResponse[];
  total?: number;
};

export type AddCartItemDto = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemDto = {
  quantity: number;
};

export async function getOpenCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>(CART_PATH, { method: "GET" });
}

export async function addCartItem(dto: AddCartItemDto): Promise<CartResponse> {
  return apiRequest<CartResponse>(`${CART_PATH}/items`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateCartItem(
  itemId: string,
  dto: UpdateCartItemDto,
): Promise<CartResponse> {
  return apiRequest<CartResponse>(`${CART_PATH}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function removeCartItem(itemId: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`${CART_PATH}/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>(`${CART_PATH}/items`, {
    method: "DELETE",
  });
}

export async function checkoutCart(): Promise<{
  message: string;
  orderId?: string;
}> {
  return apiRequest<{ message: string; orderId?: string }>(
    `${CART_PATH}/checkout`,
    {
      method: "POST",
    },
  );
}
