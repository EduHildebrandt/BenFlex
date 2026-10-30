'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Order, OrderStatus, CreateOrderPayload } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';

interface ProductContextType {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  dbConnected: boolean;
  refreshProducts: () => Promise<void>;
  fetchAdminOrders: () => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  saveProduct: (product: Product) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  submitOrder: (
    payload: CreateOrderPayload
  ) => Promise<{ success: boolean; order?: Order; accessToken?: string; error?: string }>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<{ success: boolean; order?: Order; error?: string }>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(BENFLEX_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      const pRes = await fetch('/api/products', { cache: 'no-store' });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData.products) && pData.products.length > 0) {
          setProducts(pData.products);
        }
        setDbConnected(pData.source === 'supabase');
      }
    } catch (e) {
      console.warn('No se pudo conectar al catálogo remoto, usando catálogo base:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // En el montaje público SOLO cargamos el catálogo activo (nunca datos PII de pedidos)
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Carga exclusiva para el panel administrativo autenticado (/admin)
  const fetchAdminOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'No autorizado' };
      }
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      return { success: true, orders: data.orders || [] };
    } catch {
      return { success: false, error: 'Error de red al consultar pedidos.' };
    }
  }, []);

  const saveProduct = async (
    product: Product
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo guardar el producto.' };
      }

      const saved: Product = data.product;
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
      });
      return { success: true, product: saved };
    } catch {
      return { success: false, error: 'Error de conexión al guardar el producto.' };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo eliminar el producto.' };
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión al eliminar el producto.' };
    }
  };

  const submitOrder = async (
    payload: CreateOrderPayload
  ): Promise<{ success: boolean; order?: Order; accessToken?: string; error?: string }> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Refrescamos productos por si hubo cambio de stock concurrente
        await refreshProducts();
        return {
          success: false,
          error: data.error || 'No se pudo confirmar el pedido. Verificá los datos e intentá nuevamente.',
        };
      }

      // Refrescamos el catálogo para reflejar de inmediato el nuevo stock descontado
      await refreshProducts();
      return {
        success: true,
        order: data.order as Order,
        accessToken: data.accessToken as string,
      };
    } catch {
      return {
        success: false,
        error: 'Error de conexión con el servidor. Tu carrito sigue intacto, intentá nuevamente.',
      };
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo actualizar el estado.' };
      }

      const updated: Order = data.order;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      // Si se canceló o reactivó un pedido, el stock en Supabase cambió; refrescamos productos
      await refreshProducts();
      return { success: true, order: updated };
    } catch {
      return { success: false, error: 'Error de red al actualizar el estado del pedido.' };
    }
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  return (
    <ProductContext.Provider
      value={{
        products,
        orders,
        isLoading,
        dbConnected,
        refreshProducts,
        fetchAdminOrders,
        saveProduct,
        deleteProduct,
        submitOrder,
        updateOrderStatus,
        getProductById,
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
