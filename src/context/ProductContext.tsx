'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, ProductCategory } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';

interface ProductContextType {
  products: Product[];
  orders: Order[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory) => Product[];
  placeOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<Product[]>(BENFLEX_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('benflex_orders_v2');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading stored orders:', e);
    }
  }, []);

  const placeOrder = (order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('benflex_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving order:', e);
      }
      return updated;
    });
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id || p.slug === id);
  };

  const getProductsByCategory = (cat: ProductCategory) => {
    return products.filter((p) => p.category === cat);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        orders,
        getProductById,
        getProductsByCategory,
        placeOrder,
        getOrderById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
