'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';
import { useLocation } from '@/context/LocationContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variationName?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isShippingBonificado: boolean; // true dentro de San Juan, false resto del país (a cotizar)
  shippingOriginal: number; // 10% estimado dentro de San Juan
  shippingDiscount: number; // -100% dentro de San Juan
  shippingFinal: number; // $0 en San Juan (resto del país se cotiza aparte)
  transferDiscount: number; // 15% del subtotal
  totalList: number; // Subtotal de lista
  totalTransfer: number; // Subtotal con 15% OFF
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  crossSellItems: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { location } = useLocation();
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

  const isShippingBonificado = location.isSanJuan;

  // Flete estimado del 10% bonificado al 100% dentro de San Juan; resto del país a cotizar
  const shippingOriginal = useMemo(() => {
    if (subtotal === 0 || !isShippingBonificado) return 0;
    return Math.round(subtotal * 0.1);
  }, [subtotal, isShippingBonificado]);

  const shippingDiscount = isShippingBonificado ? shippingOriginal : 0;
  const shippingFinal = 0;

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
        isShippingBonificado,
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
