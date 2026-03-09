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

export type CartItem = { id: string; qty: number };

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
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  checkout: () => void;
  userCoords: Coordinates | null;
  setUserCoords: (coords: Coordinates | null) => void;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<Seller[]>(seedSellers);
  const [cart, setCart] = useState<CartItem[]>([]);
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

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

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
    setCart((prev) => prev.filter((item) => item.id !== productId));
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
    (id: string, qty: number = 1) => {
      const product = products.find((item) => item.id === id);

      if (product?.stock !== undefined && product.stock < qty) {
        alert(`Only ${product.stock} items left in stock`);
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.id === id);

        if (existing) {
          return prev.map((item) =>
            item.id === id ? { ...item, qty: item.qty + qty } : item,
          );
        }

        return [...prev, { id, qty }];
      });
    },
    [products],
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const checkout = useCallback(() => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id);

        if (cartItem) {
          return { ...product, stock: (product.stock ?? 0) - cartItem.qty };
        }

        return product;
      }),
    );

    clearCart();
  }, [cart, clearCart]);

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
      addToCart,
      removeFromCart,
      setQty,
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
      addToCart,
      removeFromCart,
      setQty,
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
