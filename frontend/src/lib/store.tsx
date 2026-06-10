"use client";

import type React from "react";
import {createContext, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import type {Coordinates, Product, ProductStatus} from "@/data/products";
import type {Seller} from "@/data/sellers";
import {
    createProduct as createProductRequest,
    deleteProduct as deleteProductRequest,
    getMyProducts as getMyProductsRequest,
    getProducts as getProductsRequest,
    setProductStatus as setProductStatusRequest,
    updateProduct as updateProductRequest,
    updateProductStock as updateProductStockRequest,
} from "@/lib/services/products-http";
import {
    addCartItem as addCartItemRequest,
    clearCart as clearCartRequest,
    getOpenCart as getOpenCartRequest,
    removeCartItem as removeCartItemRequest,
    updateCartItem as updateCartItemRequest,
} from "@/lib/services/cart-http";
import {getSellers as getSellersRequest, toStoreSeller,} from "@/lib/services/sellers-http";
import {useAuth} from "@/lib/auth/auth-context";

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
    addProduct: (p: ProductPayload, sellerId?: string) => Promise<void>;
    updateProduct: (p: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    updateStock: (productId: string, newStock: number) => Promise<void>;
    setProductStatus: (productId: string, status: ProductStatus) => Promise<void>;
    inventory: Product[];
    inventoryLoading: boolean;
    inventoryError: string | null;
    refreshInventory: () => Promise<void>;
    sellers: Seller[];
    refreshSellers: () => Promise<void>;
    addSeller: (name: string) => void;
    cart: CartItem[];
    cartTotal: number;
    cartLoading: boolean;
    cartError: string | null;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string, qty?: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateCartQty: (itemId: string, qty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    userCoords: Coordinates | null;
    setUserCoords: (coords: Coordinates | null) => void;
    locationLoading: boolean;
    locationError: string | null;
    requestUserLocation: () => Promise<Coordinates | null>;
};

const USER_COORDS_STORAGE_KEY = "agro:user-coords";

function readStoredCoords(): Coordinates | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(USER_COORDS_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Coordinates;
        if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
            return parsed;
        }
    } catch {
        // Corrupt storage entry: ignore and fall through.
    }
    return null;
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Permiso de ubicación denegado. Activalo en tu navegador para ver productos cercanos.";
        case error.POSITION_UNAVAILABLE:
            return "No se pudo determinar tu ubicación.";
        case error.TIMEOUT:
            return "La solicitud de ubicación tardó demasiado. Intentá de nuevo.";
        default:
            return "No se pudo obtener tu ubicación.";
    }
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({
                                  children,
                              }: Readonly<{ children: React.ReactNode }>) {
    const {isAuthenticated} = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(true);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [inventory, setInventory] = useState<Product[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState<boolean>(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartTotal, setCartTotal] = useState<number>(0);
    const [cartLoading, setCartLoading] = useState<boolean>(false);
    const [cartError, setCartError] = useState<string | null>(null);
    const [userCoords, setUserCoordsState] = useState<Coordinates | null>(null);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Restore the last known location so distances render immediately without
    // re-prompting for the geolocation permission on every visit.
    useEffect(() => {
        const stored = readStoredCoords();
        if (stored) setUserCoordsState(stored);
    }, []);

    const setUserCoords = useCallback((coords: Coordinates | null) => {
        setUserCoordsState(coords);
        try {
            if (coords) {
                window.localStorage.setItem(
                    USER_COORDS_STORAGE_KEY,
                    JSON.stringify(coords),
                );
            } else {
                window.localStorage.removeItem(USER_COORDS_STORAGE_KEY);
            }
        } catch {
            // Storage unavailable (private mode/quota): location still works in-memory.
        }
    }, []);

    const requestUserLocation =
        useCallback(async (): Promise<Coordinates | null> => {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
                setLocationError("Tu navegador no soporta geolocalización.");
                return null;
            }

            setLocationLoading(true);
            setLocationError(null);

            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setUserCoords(coords);
                        setLocationLoading(false);
                        resolve(coords);
                    },
                    (error) => {
                        setLocationError(geolocationErrorMessage(error));
                        setLocationLoading(false);
                        resolve(null);
                    },
                    {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000},
                );
            });
        }, [setUserCoords]);

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

    const refreshSellers = useCallback(async () => {
        try {
            const fetched = await getSellersRequest();
            setSellers(fetched.map(toStoreSeller));
        } catch {
            // Non-fatal: the seller directory is supplementary to the catalog.
            setSellers([]);
        }
    }, []);

    const refreshInventory = useCallback(async () => {
        if (!isAuthenticated) {
            setInventory([]);
            return;
        }

        setInventoryLoading(true);
        setInventoryError(null);

        try {
            const mine = await getMyProductsRequest();
            setInventory(mine);
        } catch (error) {
            setInventoryError(
                error instanceof Error ? error.message : "Unable to load inventory",
            );
            setInventory([]);
        } finally {
            setInventoryLoading(false);
        }
    }, [isAuthenticated]);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart([]);
            setCartTotal(0);
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
                    product: product ?? (item.product as Product | undefined),
                };
            });
            setCart(normalizedCart);
            // Trust the backend's authoritative total over a local recomputation.
            setCartTotal(Number(cartResponse.total ?? 0));
        } catch (error) {
            setCartError(
                error instanceof Error ? error.message : "Unable to load cart",
            );
            setCart([]);
            setCartTotal(0);
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, products]);

    useEffect(() => {
        void refreshProducts();
    }, [refreshProducts]);

    useEffect(() => {
        void refreshSellers();
    }, [refreshSellers]);

    useEffect(() => {
        if (isAuthenticated) {
            void refreshCart();
        } else {
            setCart([]);
            setCartTotal(0);
        }
    }, [isAuthenticated, refreshCart]);

    const addProduct = useCallback(
        async (product: ProductPayload, sellerId?: string) => {
            // The backend derives the seller from the authenticated user, so a
            // sellerId is optional here (admins may still target one explicitly).
            const createdProduct = await createProductRequest(product, sellerId);

            setInventory((prev) => [createdProduct, ...prev]);
            if (createdProduct.status !== "SUSPENDED") {
                setProducts((prev) => [createdProduct, ...prev]);
            }
        },
        [],
    );

    const updateProduct = useCallback(async (product: Product) => {
        const updatedProduct = await updateProductRequest(product.id, product);
        setInventory((prev) =>
            prev.map((item) =>
                item.id === updatedProduct.id ? updatedProduct : item,
            ),
        );
        setProducts((prev) =>
            prev.map((item) =>
                item.id === updatedProduct.id ? updatedProduct : item,
            ),
        );
    }, []);

    const deleteProduct = useCallback(async (productId: string) => {
        await deleteProductRequest(productId);
        setInventory((prev) => prev.filter((item) => item.id !== productId));
        setProducts((prev) => prev.filter((item) => item.id !== productId));
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    }, []);

    const updateStock = useCallback(
        async (productId: string, newStock: number) => {
            const updatedProduct = await updateProductStockRequest(
                productId,
                newStock,
            );
            setInventory((prev) =>
                prev.map((item) => (item.id === productId ? updatedProduct : item)),
            );
            setProducts((prev) =>
                prev.map((item) => (item.id === productId ? updatedProduct : item)),
            );
        },
        [],
    );

    const setProductStatus = useCallback(
        async (productId: string, status: ProductStatus) => {
            const updatedProduct = await setProductStatusRequest(productId, status);
            setInventory((prev) =>
                prev.map((item) => (item.id === productId ? updatedProduct : item)),
            );
            // Suspended products disappear from the public catalog; published ones
            // (re)appear on next refresh.
            setProducts((prev) => {
                const withoutItem = prev.filter((item) => item.id !== productId);
                return status === "PUBLISHED"
                    ? [updatedProduct, ...withoutItem]
                    : withoutItem;
            });
        },
        [],
    );

    const addSeller = useCallback((name: string) => {
        const newSeller: Seller = {id: `${Date.now()}`, name, productIds: []};
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
                await addCartItemRequest({productId, quantity: qty});
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
                await updateCartItemRequest(itemId, {quantity: qty});
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
            setCartTotal(0);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Unable to clear cart");
        }
    }, [isAuthenticated]);

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
            setProductStatus,
            inventory,
            inventoryLoading,
            inventoryError,
            refreshInventory,
            sellers,
            refreshSellers,
            addSeller,
            cart,
            cartTotal,
            cartLoading,
            cartError,
            refreshCart,
            addToCart,
            removeFromCart,
            updateCartQty,
            clearCart,
            userCoords,
            setUserCoords,
            locationLoading,
            locationError,
            requestUserLocation,
        }),
        [products, refreshProducts, addProduct, updateProduct, deleteProduct, updateStock, setProductStatus, inventory, refreshInventory, sellers, refreshSellers, addSeller, cart, refreshCart, addToCart, removeFromCart, updateCartQty, clearCart, userCoords, setUserCoords, locationLoading, locationError, requestUserLocation],
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
