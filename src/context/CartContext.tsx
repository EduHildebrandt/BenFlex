'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variationName?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shippingOriginal: number; // 10% del subtotal
  shippingDiscount: number; // -100% del envio
  shippingFinal: number; // $0 siempre bonificado
  transferDiscount: number; // 15% del subtotal
  totalList: number; // Subtotal de lista
  totalTransfer: number; // Subtotal con 15% OFF
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  crossSellItems: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('benflex_cart_v2');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error cargando carrito local:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('benflex_cart_v2', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Error guardando carrito local:', e);
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product: Product, variationName?: string, quantity: number = 1) => {
    const selectedVarName = variationName || (product.variations[0]?.name ?? 'Estándar');
    const matchedVar = product.variations.find((v) => v.name === selectedVarName);
    const unitPrice = product.basePrice + (matchedVar ? matchedVar.priceModifier : 0);
    const itemId = `${product.id}__${selectedVarName}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product,
          variationName: selectedVarName,
          quantity,
          unitPrice,
          subtotal: unitPrice * quantity,
        },
      ];
    });

    setCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cartItems]);

  // Flete ficticio del 10% bonificado al 100%
  const shippingOriginal = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.round(subtotal * 0.1);
  }, [subtotal]);

  const shippingDiscount = shippingOriginal;
  const shippingFinal = 0; // Bonificado

  // Descuento exclusivo del 15% por transferencia
  const transferDiscount = useMemo(() => {
    return Math.round(subtotal * 0.15);
  }, [subtotal]);

  const totalList = subtotal;
  const totalTransfer = Math.max(0, subtotal - transferDiscount);

  // Productos para venta cruzada (almohadas, protectores) que no estén ya en el carrito
  const crossSellItems = useMemo(() => {
    const inCartIds = new Set(cartItems.map((item) => item.productId));
    return BENFLEX_PRODUCTS.filter(
      (p) =>
        (p.category === 'almohadas-confort' || p.id === 'cubrecolchon-impermeable-bambu') &&
        !inCartIds.has(p.id)
    ).slice(0, 3);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingOriginal,
        shippingDiscount,
        shippingFinal,
        transferDiscount,
        totalList,
        totalTransfer,
        isCartOpen,
        setCartOpen,
        crossSellItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
