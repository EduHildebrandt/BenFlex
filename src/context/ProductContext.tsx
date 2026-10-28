'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, ProductCategory } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';

interface ProductContextType {
  products: Product[];
  orders: Order[];
  dbConnected: boolean;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory) => Product[];
  placeOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(BENFLEX_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // Sincronizar productos y pedidos desde Supabase PostgreSQL (/api/products y /api/orders)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('benflex_orders_v2');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading stored orders:', e);
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          if (data.source === 'supabase_postgres') {
            setDbConnected(true);
          }
        }
      })
      .catch((err) => console.warn('Could not sync products from API:', err));

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setDbConnected(true);
          try {
            localStorage.setItem('benflex_orders_v2', JSON.stringify(data.orders));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch((err) => console.warn('Could not sync orders from API:', err));
  }, []);

  const placeOrder = (order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('benflex_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving order locally:', e);
      }
      return updated;
    });

    // Persistir en Supabase PostgreSQL
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch((err) => console.error('Error persisting order to Supabase:', err));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem('benflex_orders_v2', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    }).catch((err) => console.error('Error updating order status in Supabase:', err));
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
        dbConnected,
        getProductById,
        getProductsByCategory,
        placeOrder,
        updateOrderStatus,
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
