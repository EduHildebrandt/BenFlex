'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, Order, OrderStatus, CreateOrderPayload } from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'colchones-sommiers',
    label: 'Colchones & Sommiers',
    description: 'Colchones ortopédicos de alta densidad y resortes pocket',
  },
  {
    id: 'sillones-sofas',
    label: 'Sillones & Sofás Cama',
    description: 'Sillones y esquineros con telas anti-desgarro',
  },
  {
    id: 'almohadas-confort',
    label: 'Almohadas & Confort',
    description: 'Almohadas viscoelásticas y cervicales',
  },
  {
    id: 'combos-benflex',
    label: 'Combos BenFlex',
    description: 'Conjuntos completos de descanso con regalo',
  },
];

interface ProductContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  isLoading: boolean;
  dbConnected: boolean;
  dataSource: 'supabase' | 'local' | 'fallback';
  refreshProducts: () => Promise<void>;
  fetchAdminOrders: () => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  saveProduct: (product: Product) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveCategory: (category: Category) => Promise<{ success: boolean; category?: Category; error?: string }>;
  deleteCategory: (
    id: string,
    deleteProducts?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | 'fallback'>('local');

  const refreshProducts = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData.products)) {
          setProducts(pData.products);
        }
        setDbConnected(pData.source === 'supabase');
        setDataSource(pData.source || 'local');
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData.categories)) {
          setCategories(cData.categories);
        }
      }
    } catch (e) {
      console.warn('No se pudo conectar al catálogo remoto, usando catálogo base:', e);
      setDataSource('fallback');
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
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
      });
      setCategories((prev) => {
        if (!saved.category) return prev;
        const exists = prev.some((c) => c.id === saved.category);
        return exists
          ? prev
          : [...prev, { id: saved.category, label: saved.categoryLabel || saved.category }];
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

  const saveCategory = async (
    category: Category
  ): Promise<{ success: boolean; category?: Category; error?: string }> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(category),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo guardar la categoría.' };
      }

      const saved: Category = data.category;
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === saved.id);
        return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
      });
      // Actualizar en cascada el categoryLabel de los productos en memoria
      setProducts((prev) =>
        prev.map((p) => (p.category === saved.id ? { ...p, categoryLabel: saved.label } : p))
      );
      return { success: true, category: saved };
    } catch {
      return { success: false, error: 'Error de conexión al guardar la categoría.' };
    }
  };

  const deleteCategory = async (
    id: string,
    deleteProducts: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(
        `/api/categories?id=${encodeURIComponent(id)}&deleteProducts=${deleteProducts ? 'true' : 'false'}`,
        {
          method: 'DELETE',
          credentials: 'same-origin',
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo eliminar la categoría.' };
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (deleteProducts) {
        setProducts((prev) => prev.filter((p) => p.category !== id));
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión al eliminar la categoría.' };
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
        await refreshProducts();
        return {
          success: false,
          error: data.error || 'No se pudo confirmar el pedido. Verificá los datos e intentá nuevamente.',
        };
      }

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
        categories,
        orders,
        isLoading,
        dbConnected,
        dataSource,
        refreshProducts,
        fetchAdminOrders,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
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
