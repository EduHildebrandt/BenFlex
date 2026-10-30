'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useProducts } from '@/context/ProductContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    variationName?: string,
    quantity?: number,
    fabric?: string
  ) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isShippingBonificado: boolean; // true dentro de San Juan, false resto del país (a cotizar)
  shippingOriginal: number; // 10% estimado dentro de San Juan
  shippingDiscount: number; // -100% dentro de San Juan
  shippingFinal: number; // $0 en San Juan (resto del país se cotiza aparte)
  transferDiscount: number; // Descuento dinámico por transferencia exacto al peso
  totalList: number; // Subtotal de lista
  totalTransfer: number; // Subtotal con descuento por transferencia
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  crossSellItems: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { location } = useLocation();
  const { products } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('benflex_cart_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Error cargando carrito local:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sincronizar metadatos y precios del carrito con el catálogo vivo de Supabase
  useEffect(() => {
    if (!isLoaded || products.length === 0) return;
    setCartItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const live = products.find((p) => p.id === item.productId);
        if (!live) return item;
        const matchedVar = live.variations.find((v) => v.name === item.variationName);
        const liveUnitPrice = live.basePrice + (matchedVar ? matchedVar.priceModifier : 0);
        if (
          liveUnitPrice !== item.unitPrice ||
          live.stock !== item.product.stock ||
          live.transferDiscountPercent !== item.product.transferDiscountPercent ||
          live.name !== item.product.name
        ) {
          changed = true;
          return {
            ...item,
            product: live,
            unitPrice: liveUnitPrice,
            subtotal: liveUnitPrice * item.quantity,
          };
        }
        return item;
      });
      return changed ? next : prev;
    });
  }, [products, isLoaded]);

  // Guardar en localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('benflex_cart_v2', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Error guardando carrito local:', e);
    }
  }, [cartItems, isLoaded]);

  const addToCart = (
    product: Product,
    variationName?: string,
    quantity: number = 1,
    fabric?: string
  ): boolean => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    if (liveProduct.stock <= 0 || quantity <= 0) {
      return false;
    }

    const selectedVarName = variationName || (liveProduct.variations[0]?.name ?? 'Estándar');
    const matchedVar = liveProduct.variations.find((v) => v.name === selectedVarName);
    const unitPrice = liveProduct.basePrice + (matchedVar ? matchedVar.priceModifier : 0);
    const selectedFabric =
      fabric || (liveProduct.fabrics && liveProduct.fabrics.length > 0 ? liveProduct.fabrics[0] : undefined);
    const itemId = `${liveProduct.id}__${selectedVarName}${selectedFabric ? `__${selectedFabric}` : ''}`;

    setCartItems((prev) => {
      const currentProductQty = prev
        .filter((i) => i.productId === liveProduct.id)
        .reduce((acc, i) => acc + i.quantity, 0);

      const remainingStock = Math.max(0, liveProduct.stock - currentProductQty);
      if (remainingStock <= 0) {
        return prev;
      }

      const qtyToAdd = Math.min(quantity, remainingStock);
      const existing = prev.find((item) => item.id === itemId);

      if (existing) {
        const nextQty = existing.quantity + qtyToAdd;
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                product: liveProduct,
                quantity: nextQty,
                unitPrice,
                subtotal: nextQty * unitPrice,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: itemId,
          productId: liveProduct.id,
          product: liveProduct,
          variationName: selectedVarName,
          fabric: selectedFabric,
          quantity: qtyToAdd,
          unitPrice,
          subtotal: unitPrice * qtyToAdd,
        },
      ];
    });

    setCartOpen(true);
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target) return prev;

      const liveProduct = products.find((p) => p.id === target.productId) || target.product;
      const otherLinesQty = prev
        .filter((i) => i.productId === target.productId && i.id !== itemId)
        .reduce((acc, i) => acc + i.quantity, 0);

      const maxForThisLine = Math.max(1, liveProduct.stock - otherLinesQty);
      const cappedQty = Math.min(quantity, maxForThisLine);

      return prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              product: liveProduct,
              quantity: cappedQty,
              subtotal: cappedQty * item.unitPrice,
            }
          : item
      );
    });
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

  // Descuento dinámico por transferencia calculado por unidad para evitar diferencias de redondeo ($0 discrepancia)
  const transferDiscount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const pct = item.product.transferDiscountPercent ?? 15;
      const unitTransferPrice = Math.round(item.unitPrice * (1 - pct / 100));
      return acc + (item.unitPrice - unitTransferPrice) * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalList = subtotal;
  const totalTransfer = Math.max(0, subtotal - transferDiscount);

  // Productos para venta cruzada sincronizados con el catálogo vivo de Supabase y stock disponible
  const crossSellItems = useMemo(() => {
    const inCartIds = new Set(cartItems.map((item) => item.productId));
    return products
      .filter(
        (p) =>
          p.stock > 0 &&
          (p.category === 'almohadas-confort' || p.id === 'cubrecolchon-impermeable-bambu') &&
          !inCartIds.has(p.id)
      )
      .slice(0, 3);
  }, [cartItems, products]);

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
