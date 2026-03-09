"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Coordinates, Product } from "@/data/products";
import { type Seller, sellers as seedSellers } from "@/data/sellers";
import {
  createProduct as createProductRequest,
  deleteProduct as deleteProductRequest,
  getProducts as getProductsRequest,
  updateProduct as updateProductRequest,
  updateProductStock as updateProductStockRequest,
} from "@/lib/services/products-http";
import {
  addCartItem as addCartItemRequest,
  checkoutCart as checkoutCartRequest,
  clearCart as clearCartRequest,
  getOpenCart as getOpenCartRequest,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
  type CartItemResponse,
} from "@/lib/services/cart-http";
import { useAuth } from "@/lib/auth/auth-context";

export type CartItem = {
  itemId: string;
  productId: string;
  quantity: number;
  product?: Product;
};

type ProductPayload = Omit<Product, "id"> & { id?: string };

export type StoreState = {
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (p: ProductPayload, sellerId: string) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
  sellers: Seller[];
  addSeller: (name: string) => void;
  cart: CartItem[];
  cartLoading: boolean;
  cartError: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQty: (itemId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<void>;
  userCoords: Coordinates | null;
  setUserCoords: (coords: Coordinates | null) => void;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<Seller[]>(seedSellers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {
      const fetchedProducts = await getProductsRequest();
      setProducts(fetchedProducts);
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Unable to load products",
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const cartResponse = await getOpenCartRequest();
      const normalizedCart: CartItem[] = cartResponse.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          itemId: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: product || item.product,
        };
      });
      setCart(normalizedCart);
    } catch (error) {
      setCartError(
        error instanceof Error ? error.message : "Unable to load cart",
      );
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, products]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, refreshCart]);

  const addProduct = useCallback(
    async (product: ProductPayload, sellerId: string) => {
      const seller = sellers.find((item) => item.id === sellerId);

      const payload: ProductPayload = {
        ...product,
        seller:
          product.seller ??
          (seller
            ? {
                id: seller.id,
                name: seller.name,
                location: seller.location,
                coords: seller.coords,
              }
            : undefined),
      };

      const createdProduct = await createProductRequest(payload, sellerId);

      setProducts((prev) => [createdProduct, ...prev]);
      setSellers((prev) =>
        prev.map((item) =>
          item.id === sellerId
            ? { ...item, productIds: [...item.productIds, createdProduct.id] }
            : item,
        ),
      );
    },
    [sellers],
  );

  const updateProduct = useCallback(async (product: Product) => {
    const updatedProduct = await updateProductRequest(product.id, product);
    setProducts((prev) =>
      prev.map((item) =>
        item.id === updatedProduct.id ? updatedProduct : item,
      ),
    );
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    await deleteProductRequest(productId);
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateStock = useCallback(
    async (productId: string, newStock: number) => {
      const updatedProduct = await updateProductStockRequest(
        productId,
        newStock,
      );
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? updatedProduct : item)),
      );
    },
    [],
  );

  const addSeller = useCallback((name: string) => {
    const newSeller: Seller = { id: `${Date.now()}`, name, productIds: [] };
    setSellers((prev) => [newSeller, ...prev]);
  }, []);

  const addToCart = useCallback(
    async (productId: string, qty: number = 1) => {
      if (!isAuthenticated) {
        alert("Please login to add items to cart");
        return;
      }

      const product = products.find((item) => item.id === productId);

      if (product?.stock !== undefined && product.stock < qty) {
        alert(`Only ${product.stock} items left in stock`);
        return;
      }

      try {
        await addCartItemRequest({ productId, quantity: qty });
        await refreshCart();
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Unable to add item to cart",
        );
      }
    },
    [isAuthenticated, products, refreshCart],
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        return;
      }

      try {
        await removeCartItemRequest(itemId);
        await refreshCart();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to remove item from cart",
        );
      }
    },
    [isAuthenticated, refreshCart],
  );

  const updateCartQty = useCallback(
    async (itemId: string, qty: number) => {
      if (!isAuthenticated) {
        return;
      }

      try {
        await updateCartItemRequest(itemId, { quantity: qty });
        await refreshCart();
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Unable to update cart item",
        );
      }
    },
    [isAuthenticated, refreshCart],
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await clearCartRequest();
      setCart([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to clear cart");
    }
  }, [isAuthenticated]);

  const checkout = useCallback(async () => {
    if (!isAuthenticated) {
      alert("Please login to checkout");
      return;
    }

    try {
      await checkoutCartRequest();
      setCart([]);
      await refreshProducts();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to complete checkout",
      );
    }
  }, [isAuthenticated, refreshProducts]);

  const value = useMemo<StoreState>(
    () => ({
      products,
      productsLoading,
      productsError,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      sellers,
      addSeller,
      cart,
      cartLoading,
      cartError,
      refreshCart,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      checkout,
      userCoords,
      setUserCoords,
    }),
    [
      products,
      productsLoading,
      productsError,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      sellers,
      addSeller,
      cart,
      cartLoading,
      cartError,
      refreshCart,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      checkout,
      userCoords,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return ctx;
};
