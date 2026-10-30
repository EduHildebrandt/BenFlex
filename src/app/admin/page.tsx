'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import {
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  Building,
  Lock,
  Plus,
  Trash2,
  X,
  Search,
  Package,
  MailQuestion,
} from 'lucide-react';
import {
  BENFLEX_BANK_INFO,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductTechnology,
  ProductVariation,
  CustomerInquiry,
} from '@/types';

const CATEGORY_MAP: Record<ProductCategory, string> = {
  'colchones-sommiers': 'Colchones & Sommiers',
  'sillones-sofas': 'Sillones & Sofás Cama',
  'almohadas-confort': 'Almohadas & Confort',
  'combos-benflex': 'Combos BenFlex',
};

const TECH_MAP: Record<ProductTechnology, string> = {
  alta_densidad: 'Espuma Alta Densidad (35 kg/m³)',
  resortes_pocket: 'Resortes Pocket Ensacados',
  anti_desgarro: 'Pana / Lino Anti-Desgarro Pet-Friendly',
  viscoelastica: 'Viscoelástica (Memory Foam)',
  espuma_inteligente: 'Espuma Inteligente Cervical',
  fibra_siliconada: 'Fibra Siliconada / Algodón 400 Hilos',
};

export default function BenFlexAdminPage() {
  const {
    products,
    orders,
    dbConnected,
    fetchAdminOrders,
    saveProduct,
    deleteProduct,
    updateOrderStatus,
  } = useProducts();

  // Autenticación privada validada en servidor (Cookie HttpOnly + HMAC-SHA256)
  const [authRole, setAuthRole] = useState<'owner' | 'developer' | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Consultas desde /contacto
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);

  // Pestañas del panel
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'inquiries'>('catalog');
  const [searchFilter, setSearchFilter] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal de Crear / Editar Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del formulario de producto
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    shortDescription: '',
    category: 'colchones-sommiers' as ProductCategory,
    technology: 'alta_densidad' as ProductTechnology,
    measure: '2 Plazas (140x190)',
    firmness: 'Firme' as 'Suave' | 'Media' | 'Firme' | 'Extra Firme',
    basePrice: 380000,
    transferDiscountPercent: 15,
    image: '',
    badge: 'Destacado BenFlex',
    stock: 15,
    weightSupport: 'Hasta 130 kg por lado',
    warranty: '5 años de garantía escrita de fábrica',
    featuresText:
      'Espuma certificada de alta densidad\nTejido hipoalergénico y respirable\nGarantía directa de fábrica en San Juan',
    fabricsText: '',
    variations: [
      { name: '1½ Plaza (90x190)', priceModifier: -60000, measure: '1½ Plaza (90x190)' },
      { name: '2 Plazas (140x190)', priceModifier: 0, measure: '2 Plazas (140x190)' },
      { name: 'Queen (160x200)', priceModifier: 110000, measure: 'Queen (160x200)' },
      { name: 'King (200x200)', priceModifier: 195000, measure: 'King (200x200)' },
    ] as ProductVariation[],
  });

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3800);
  };

  const loadAdminPrivateData = useCallback(async () => {
    await fetchAdminOrders();
    try {
      const res = await fetch('/api/inquiries', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      }
    } catch {
      // Silencioso
    }
  }, [fetchAdminOrders]);

  // Verificar cookie HttpOnly activa al montar /admin
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const data = await res.json();
        if (!cancelled && data.authenticated && (data.role === 'owner' || data.role === 'developer')) {
          setAuthRole(data.role);
        }
      } catch {
        // Sin sesión activa
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar pedidos y consultas apenas se autentique la sesión
  useEffect(() => {
    if (authRole) {
      loadAdminPrivateData();
    }
  }, [authRole, loadAdminPrivateData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isLoggingIn) return;

    setIsLoggingIn(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(
          data.error || 'Clave incorrecta. Acceso exclusivo para el dueño o desarrollador.'
        );
        return;
      }
      setAuthRole(data.role);
      setPasswordInput('');
    } catch {
      setAuthError('Error de conexión al validar credenciales con el servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch {
      // Ignorar error de red en cierre
    }
    setAuthRole(null);
    setPasswordInput('');
  };

  // Abrir modal para Nuevo Producto
  const openNewProductModal = () => {
    setEditingProduct(null);
    setForm({
      id: '',
      name: '',
      description: '',
      shortDescription: '',
      category: 'colchones-sommiers',
      technology: 'alta_densidad',
      measure: '2 Plazas (140x190)',
      firmness: 'Firme',
      basePrice: 350000,
      transferDiscountPercent: 15,
      image:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
      badge: 'Nuevo Ingreso',
      stock: 10,
      weightSupport: 'Hasta 130 kg por lado',
      warranty: '5 años de garantía oficial',
      featuresText:
        'Fabricación propia en San Juan\nMateriales hipoalergénicos de alta durabilidad\nGarantía escrita de fábrica',
      fabricsText: '',
      variations: [
        { name: '2 Plazas (140x190)', priceModifier: 0, measure: '2 Plazas (140x190)' },
        { name: 'Queen (160x200)', priceModifier: 95000, measure: 'Queen (160x200)' },
      ],
    });
    setIsModalOpen(true);
  };

  // Abrir modal para Editar Producto Existente
  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription,
      category: p.category,
      technology: p.technology,
      measure: p.measure,
      firmness: p.firmness || 'Firme',
      basePrice: p.basePrice,
      transferDiscountPercent: p.transferDiscountPercent ?? 15,
      image: p.image,
      badge: p.badge || '',
      stock: p.stock,
      weightSupport: p.weightSupport || '',
      warranty: p.warranty || '5 años de garantía',
      featuresText: (p.features || []).join('\n'),
      fabricsText: (p.fabrics || []).join('\n'),
      variations:
        p.variations.length > 0
          ? [...p.variations]
          : [{ name: 'Estándar', priceModifier: 0 }],
    });
    setIsModalOpen(true);
  };

  // Subir foto desde archivo local (compresión inteligente en Canvas a Base64 JPEG ligero)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1000;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setForm((prev) => ({ ...prev, image: compressedDataUrl }));
        }
      };
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar producto (Crear o Actualizar en Supabase)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.image.trim()) return;

    setIsSaving(true);
    const generatedSlug =
      form.id.trim() ||
      form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);

    const parsedFabrics = form.fabricsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : generatedSlug,
      slug: editingProduct ? editingProduct.slug : generatedSlug,
      name: form.name.trim(),
      description: form.description.trim() || form.name.trim(),
      shortDescription:
        form.shortDescription.trim() ||
        (form.description.trim()
          ? form.description.trim().slice(0, 100) + '...'
          : form.name.trim()),
      category: form.category,
      categoryLabel: CATEGORY_MAP[form.category],
      technology: form.technology,
      technologyLabel: TECH_MAP[form.technology],
      measure: form.measure,
      firmness: form.firmness,
      basePrice: Number(form.basePrice) || 0,
      transferDiscountPercent: Number(form.transferDiscountPercent ?? 15),
      variations: form.variations.filter((v) => v.name.trim() !== ''),
      features: form.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      fabrics: parsedFabrics.length > 0 ? parsedFabrics : undefined,
      image: form.image.trim(),
      badge: form.badge.trim() || undefined,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      weightSupport: form.weightSupport.trim() || undefined,
      warranty: form.warranty.trim() || undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 25,
    };

    const res = await saveProduct(productToSave);
    setIsSaving(false);

    if (!res.success) {
      showToast(`❌ ${res.error || 'Error al guardar el producto'}`);
      return;
    }

    setIsModalOpen(false);
    showToast(`✅ Producto "${productToSave.name}" guardado en Supabase PostgreSQL`);
  };

  // Ajuste rápido de precio o stock desde la tarjeta
  const handleQuickPriceUpdate = async (product: Product, newPrice: number) => {
    if (!Number.isFinite(newPrice) || newPrice <= 0 || newPrice === product.basePrice) return;
    const res = await saveProduct({ ...product, basePrice: Math.round(newPrice) });
    if (res.success) {
      showToast(`💰 Precio de "${product.name}" actualizado a $${Math.round(newPrice).toLocaleString('es-AR')}`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo actualizar el precio'}`);
    }
  };

  const handleQuickStockUpdate = async (product: Product, newStock: number) => {
    if (!Number.isFinite(newStock) || newStock < 0 || Math.floor(newStock) === product.stock) return;
    const cleanStock = Math.floor(newStock);
    const res = await saveProduct({ ...product, stock: cleanStock });
    if (res.success) {
      showToast(`📦 Stock de "${product.name}" actualizado a ${cleanStock} unidades`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo actualizar el stock'}`);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `¿Estás seguro de ocultar/eliminar "${product.name}" del catálogo público?`
    );
    if (!confirmed) return;
    const res = await deleteProduct(product.id);
    if (res.success) {
      showToast(`🗑️ Producto "${product.name}" ocultado del catálogo`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo eliminar el producto'}`);
    }
  };

  const handleOrderStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    if (nextStatus === order.status) return;
    const res = await updateOrderStatus(order.id, nextStatus);
    if (res.success) {
      if (nextStatus === 'CANCELADO') {
        showToast(`↩️ Pedido #${order.id} cancelado y stock restaurado en catálogo`);
      } else {
        showToast(`✅ Estado del pedido #${order.id} actualizado a ${nextStatus}`);
      }
    } else {
      showToast(`❌ ${res.error || 'No se pudo actualizar el estado del pedido'}`);
    }
  };

  // Variaciones helper
  const addVariationRow = () => {
    setForm((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        { name: 'Nueva Medida', priceModifier: 0, measure: '2 Plazas (140x190)' },
      ],
    }));
  };

  const updateVariationRow = (
    idx: number,
    field: keyof ProductVariation,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariationRow = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== idx),
    }));
  };

  if (checkingSession) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', backgroundColor: '#fafaf9', minHeight: '80vh' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Verificando sesión de seguridad...
        </p>
      </div>
    );
  }

  // =========================================================================
  // PANTALLA DE BLOQUEO PRIVADO (AUTENTICACIÓN SERVER-SIDE HTTPONLY)
  // =========================================================================
  if (!authRole) {
    return (
      <div
        style={{
          minHeight: '82vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: '#fafaf9',
        }}
      >
        <div
          className="glass-card animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '430px',
            padding: '2.5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            textAlign: 'center',
            boxShadow: '0 20px 45px rgba(17, 24, 39, 0.1)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <Lock size={28} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem' }}>
            Acceso Privado BenFlex
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Panel interno exclusivo para el <strong>Dueño</strong> y el <strong>Desarrollador</strong>.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Ingresá tu clave de acceso..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: authError ? '2px solid #e11d48' : '1px solid #d1d5db',
                fontSize: '0.95rem',
                outline: 'none',
                textAlign: 'center',
              }}
            />
            {authError && (
              <div style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                backgroundColor: '#111827',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                opacity: isLoggingIn ? 0.7 : 1,
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoggingIn ? 'Validando acceso...' : 'Ingresar al Panel de Control'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <Link
              href="/"
              style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}
            >
              ← Volver a la tienda pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status !== 'CANCELADO').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELADO')
    .reduce((acc, o) => acc + o.total, 0);

  const filteredCatalog = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // =========================================================================
  // VISTA PRINCIPAL DEL PANEL DE CONTROL (DUEÑO Y DESARROLLADOR)
  // =========================================================================
  return (
    <div style={{ backgroundColor: '#fafaf9', padding: '2.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container">
        {/* Notificación flotante */}
        {feedbackMsg && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              top: '90px',
              right: '24px',
              zIndex: 9999,
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '0.9rem 1.4rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            {feedbackMsg}
          </div>
        )}

        {/* Header Admin */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Ver Tienda en Vivo</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Panel de Control • BenFlex
              </h1>
              <span className="badge-pill badge-navy" style={{ fontSize: '0.72rem' }}>
                Modo: {authRole === 'owner' ? 'Dueño / Administración' : 'Desarrollador Full-Access'}
              </span>
              <span className="badge-pill badge-bonificado" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={13} />
                {dbConnected ? 'Supabase PostgreSQL + RLS Activo' : 'Sincronizado'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={openNewProductModal}
              style={{
                padding: '0.7rem 1.3rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                backgroundColor: 'var(--brand-sage)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Plus size={18} />
              <span>Cargar Nuevo Producto</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                backgroundColor: activeTab === 'catalog' ? '#111827' : '#ffffff',
                color: activeTab === 'catalog' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
              }}
            >
              Productos y Precios ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                backgroundColor: activeTab === 'orders' ? '#111827' : '#ffffff',
                color: activeTab === 'orders' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
              }}
            >
              Pedidos ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                backgroundColor: activeTab === 'inquiries' ? '#111827' : '#ffffff',
                color: activeTab === 'inquiries' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
              }}
            >
              Consultas Web ({inquiries.length})
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.82rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-sage)', marginBottom: '0.25rem' }}>
              <Package size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Productos en Catálogo</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>{products.length}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.25rem' }}>
              <ShoppingBag size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Pedidos Activos</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>{activeOrdersCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.25rem' }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Ventas Netas</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
              ${totalRevenue.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', marginBottom: '0.25rem' }}>
              <Building size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Alias Activo</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{BENFLEX_BANK_INFO.alias}</div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: GESTIÓN DE PRODUCTOS, PRECIOS Y FOTOS                      */}
        {/* ================================================================= */}
        {activeTab === 'catalog' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                  Catálogo de Productos, Precios y Fotos
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Modificá el precio de lista o stock directamente, o hacé clic en <strong>Editar Producto / Foto</strong> para cambiar imágenes, telas y medidas.
                </p>
              </div>

              {/* Buscador interno */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  padding: '0.5rem 0.85rem',
                  minWidth: '260px',
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre o categoría..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCatalog.map((p) => {
                const discountPct = p.transferDiscountPercent ?? 15;
                const transferPrice = Math.round(p.basePrice * (1 - discountPct / 100));
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '88px 1.5fr 1fr auto',
                      gap: '1.25rem',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: '14px',
                      border: '1px solid #e4e4e7',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: '88px',
                        height: '72px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0',
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span className="badge-pill badge-sage" style={{ fontSize: '0.68rem' }}>
                          {p.categoryLabel}
                        </span>
                        {p.badge && (
                          <span className="badge-pill badge-navy" style={{ fontSize: '0.68rem' }}>
                            {p.badge}
                          </span>
                        )}
                        {p.stock <= 0 && (
                          <span
                            className="badge-pill"
                            style={{ fontSize: '0.68rem', backgroundColor: '#fee2e2', color: '#b91c1c' }}
                          >
                            Agotado
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {p.technologyLabel} • {p.variations.length} medidas configuradas
                      </div>
                    </div>

                    {/* Edición rápida de Precio de Lista y Stock */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          PRECIO LISTA ($)
                        </label>
                        <input
                          key={`price-${p.id}-${p.basePrice}`}
                          type="number"
                          defaultValue={p.basePrice}
                          onBlur={(e) => handleQuickPriceUpdate(p, Number(e.target.value))}
                          style={{
                            width: '125px',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                          Transf ({discountPct}% OFF): ${transferPrice.toLocaleString('es-AR')}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          STOCK
                        </label>
                        <input
                          key={`stock-${p.id}-${p.stock}`}
                          type="number"
                          defaultValue={p.stock}
                          onBlur={(e) => handleQuickStockUpdate(p, Number(e.target.value))}
                          style={{
                            width: '74px',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                    </div>

                    {/* Acciones: Editar Completo / Eliminar */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => openEditProductModal(p)}
                        style={{
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        Editar Producto / Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          padding: '0.55rem 0.7rem',
                          borderRadius: '8px',
                        }}
                        title="Ocultar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BANDEJA DE PEDIDOS ONLINE                                  */}
        {/* ================================================================= */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Bandeja de Pedidos Online (Persistidos en Supabase PostgreSQL)
            </h2>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Aún no se han registrado pedidos en la tabla <code>benflex_orders</code>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => {
                  const isCancelled = order.status === 'CANCELADO';
                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '14px',
                        border: isCancelled ? '1px solid #fecaca' : '1px solid #e2e8f0',
                        backgroundColor: isCancelled ? '#fef2f2' : '#f8fafc',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-navy)' }}>
                            #{order.id}
                          </span>
                          <span className="badge-pill badge-sage">
                            {order.paymentMethod.toUpperCase()}
                            {order.installments ? ` (${order.installments}c)` : ''}
                          </span>
                          <span className="badge-pill badge-bonificado">
                            {order.deliveryMethod === 'showroom'
                              ? 'Retiro Showroom'
                              : `Envío a ${order.city}, ${order.province} (CP ${order.postalCode})`}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order, e.target.value as OrderStatus)
                            }
                            style={{
                              padding: '0.28rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: '#ffffff',
                              color: isCancelled ? '#b91c1c' : '#111827',
                            }}
                          >
                            <option value="PENDIENTE_COMPROBANTE">PENDIENTE COMPROBANTE</option>
                            <option value="PENDIENTE_PAGO">PENDIENTE DE PAGO</option>
                            <option value="APROBADO">APROBADO</option>
                            <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="CANCELADO">CANCELADO (Devuelve Stock)</option>
                          </select>
                        </div>

                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Cliente: {order.customerName} • Tel: {order.customerPhone} • Email: {order.customerEmail}
                          {order.customerDni ? ` • DNI/CUIT: ${order.customerDni}` : ''}
                        </div>

                        {order.address && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            Dirección: {order.address}
                            {order.notes ? ` (${order.notes})` : ''}
                          </div>
                        )}

                        <div style={{ fontSize: '0.8rem', color: 'var(--brand-navy)', fontWeight: 600, marginTop: '0.3rem' }}>
                          {order.items
                            .map(
                              (i) =>
                                `${i.quantity}x ${i.product.name} (${i.variationName}${
                                  i.fabric ? ` / ${i.fabric}` : ''
                                })`
                            )
                            .join(' | ')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: isCancelled ? '#9ca3af' : 'var(--brand-sage)',
                            textDecoration: isCancelled ? 'line-through' : 'none',
                          }}
                        >
                          ${order.total.toLocaleString('es-AR')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(order.date).toLocaleString('es-AR')}
                        </div>
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#15803d',
                            marginTop: '0.35rem',
                          }}
                        >
                          <MessageCircle size={14} />
                          <span>Contactar por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: CONSULTAS WEB (/contacto -> benflex_inquiries)             */}
        {/* ================================================================= */}
        {activeTab === 'inquiries' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <MailQuestion size={22} color="var(--brand-sage)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Consultas Recibidas desde Showroom / Contacto
              </h2>
            </div>

            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Aún no hay consultas registradas en <code>benflex_inquiries</code>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{inq.name}</span>
                        <span className="badge-pill badge-sage">{inq.subject}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(inq.createdAt).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Tel / WhatsApp: <strong>{inq.phone}</strong>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {inq.message}
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `¡Hola ${inq.name}! Te escribimos del Showroom BenFlex en Villa Krause por tu consulta web sobre "${inq.subject}".`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        padding: '0.6rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>Responder por WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL COMPLETO DE CARGA Y EDICIÓN DE PRODUCTO, PRECIOS Y FOTOS    */}
        {/* ================================================================= */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                padding: '2rem',
                borderRadius: '20px',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  padding: '0.4rem',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={22} />
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>
                {editingProduct ? `Editar: ${editingProduct.name}` : 'Cargar Nuevo Producto BenFlex'}
              </h2>

              <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Nombre y Categoría */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Colchón BenFlex Ortopédico 35kg"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Categoría *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="colchones-sommiers">Colchones & Sommiers</option>
                      <option value="sillones-sofas">Sillones & Sofás Cama</option>
                      <option value="almohadas-confort">Almohadas & Confort / Ropa de Cama</option>
                      <option value="combos-benflex">Combos BenFlex (Con Regalo)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Tecnología / Material *
                    </label>
                    <select
                      value={form.technology}
                      onChange={(e) => setForm({ ...form, technology: e.target.value as ProductTechnology })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="alta_densidad">Espuma Alta Densidad (35 kg/m³)</option>
                      <option value="resortes_pocket">Resortes Pocket Ensacados</option>
                      <option value="anti_desgarro">Pana / Lino Anti-Desgarro Pet-Friendly</option>
                      <option value="viscoelastica">Viscoelástica (Memory Foam)</option>
                      <option value="espuma_inteligente">Espuma Inteligente Cervical</option>
                      <option value="fibra_siliconada">Fibra Siliconada / Algodón 400 Hilos</option>
                    </select>
                  </div>
                </div>

                {/* Precios, Descuento Transferencia y Stock */}
                <div
                  style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Precio Base de Lista ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      % OFF Transferencia (0 a 60)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={form.transferDiscountPercent}
                      onChange={(e) =>
                        setForm({ ...form, transferDiscountPercent: Number(e.target.value) })
                      }
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      PRECIO FINAL TRANSFERENCIA:
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669' }}>
                      $
                      {Math.round(
                        form.basePrice * (1 - (form.transferDiscountPercent ?? 15) / 100)
                      ).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* FOTO DEL PRODUCTO (Subir archivo desde PC/Celular o pegar URL HTTPS) */}
                <div
                  style={{
                    padding: '1.15rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '14px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.5rem' }}>
                    📸 Foto del Producto (Subí una imagen desde tu dispositivo o pegá un link HTTPS)
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', alignItems: 'center' }}>
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Vista previa"
                        style={{
                          width: '110px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '110px',
                          height: '90px',
                          borderRadius: '10px',
                          backgroundColor: '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: '#0369a1',
                        }}
                      >
                        Sin Foto
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        placeholder="O pegá la URL segura de la foto (https://...)"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Variaciones de Medidas y Precios */}
                <div
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>
                      Medidas / Variantes y Diferencia de Precio
                    </label>
                    <button
                      type="button"
                      onClick={addVariationRow}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--brand-sage)',
                        backgroundColor: '#e0f2fe',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                      }}
                    >
                      + Agregar Medida
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.variations.map((v, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Ej: Queen (160x200)"
                          value={v.name}
                          onChange={(e) => updateVariationRow(idx, 'name', e.target.value)}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.85rem',
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Dif. precio (ej: 90000 o 0)"
                          value={v.priceModifier}
                          onChange={(e) => updateVariationRow(idx, 'priceModifier', Number(e.target.value))}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeVariationRow(idx)}
                          style={{ color: '#b91c1c', padding: '0.4rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descripción, Características y Telas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Descripción Completa
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Beneficios / Características (1 por línea)
                    </label>
                    <textarea
                      rows={3}
                      value={form.featuresText}
                      onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Telas Opcionales (1 por línea, para sillones/respaldos)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Pana Anti-Desgarro Gris&#10;Lino Rústico Beige"
                      value={form.fabricsText}
                      onChange={(e) => setForm({ ...form, fabricsText: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Badge Destacado
                    </label>
                    <input
                      type="text"
                      placeholder="Badge (ej: Más Vendido en San Juan)"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Garantía Escrita
                    </label>
                    <input
                      type="text"
                      placeholder="Garantía (ej: 5 años de garantía)"
                      value={form.warranty}
                      onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                {/* Botón Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '0.85rem 1.4rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      backgroundColor: 'var(--brand-sage)',
                      color: '#ffffff',
                      padding: '0.85rem 1.8rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                    }}
                  >
                    {isSaving ? 'Guardando en Supabase...' : 'Guardar Producto en Supabase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
