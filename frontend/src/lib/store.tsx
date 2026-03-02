'use client'

import React, {createContext, useContext, useMemo, useState} from 'react'
import {products as seedProducts, type Product, type Coordinates} from '@/data/products'
import {sellers as seedSellers, type Seller} from '@/data/sellers'

export type CartItem = { id: string; qty: number };

export type StoreState = {
  products: Product[];
  addProduct: (p: Product, sellerId: string) => void; // for /sell prototype
  updateProduct: (p: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, newStock: number) => void;
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

const StoreContext = createContext<StoreState | undefined>(undefined)

export function StoreProvider({children}: {children: React.ReactNode}) {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [sellers, setSellers] = useState<Seller[]>(seedSellers)
  const [cart, setCart] = useState<CartItem[]>([])
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null)

  const addProduct = (p: Product, sellerId: string) => {
    const newProduct = {...p, id: p.id || `${Date.now()}`};
    setProducts(prev => [newProduct, ...prev])
    setSellers(prev => prev.map(s => s.id === sellerId ? {...s, productIds: [...s.productIds, newProduct.id]} : s))
  }

  const updateProduct = (p: Product) => {
    setProducts(prev => prev.map(oldP => oldP.id === p.id ? p : oldP))
  }

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? {...p, stock: newStock} : p))
  }

  const addSeller = (name: string) => {
    const newSeller = {id: `${Date.now()}`, name, productIds: []};
    setSellers(prev => [newSeller, ...prev])
  }

  const addToCart = (id: string, qty: number = 1) => {
    const product = products.find(p => p.id === id)
    if (product && product.stock !== undefined && product.stock < qty) {
      alert(`Only ${product.stock} items left in stock`)
      return
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id ? {...i, qty: i.qty + qty} : i)
      }
      return [...prev, {id, qty}]
    })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const setQty = (id: string, qty: number) => setCart(prev => prev.map(i => i.id === id ? {...i, qty} : i))

  const clearCart = () => setCart([])

  const checkout = () => {
    setProducts(prevProducts => prevProducts.map(p => {
      const cartItem = cart.find(item => item.id === p.id)
      if (cartItem) {
        return {...p, stock: (p.stock ?? 0) - cartItem.qty}
      }
      return p
    }))
    clearCart()
  }

  const value = useMemo<StoreState>(() => ({products, addProduct, updateProduct, deleteProduct, updateStock, sellers, addSeller, cart, addToCart, removeFromCart, setQty, clearCart, checkout, userCoords, setUserCoords}), [products, sellers, cart, userCoords])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
