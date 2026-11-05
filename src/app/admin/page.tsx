'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  BarChart3,
  Download,
  DollarSign,
  AlertTriangle,
  Truck,
  CreditCard,
  Calendar,
  Filter,
  FolderPlus,
  Edit3,
  Layers,
  Star,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BENFLEX_BANK_INFO,
  Category,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductTechnology,
  ProductVariation,
  CustomerInquiry,
} from '@/types';

const CATEGORY_MAP: Record<string, string> = {
  'colchones-sommiers': 'Colchones & Sommiers',
  'sillones-sofas': 'Sillones & Sofás Cama',
  'almohadas-confort': 'Almohadas & Confort',
  'combos-benflex': 'Combos BenFlex',
};

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function getOrderMonthInfo(dateStr: string): { monthKey: string; monthLabel: string } {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return { monthKey: '0000-00', monthLabel: 'Sin Fecha' };
  }
  const year = d.getFullYear();
  const monthIdx = d.getMonth();
  const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTH_NAMES_ES[monthIdx]} ${year}`;
  return { monthKey, monthLabel };
}

function slugifyCategory(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
    categories,
    orders,
    dbConnected,
    dataSource,
    fetchAdminOrders,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
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
  const [activeTab, setActiveTab] = useState<'catalog' | 'categories' | 'sales' | 'orders' | 'inquiries'>('catalog');
  const [searchFilter, setSearchFilter] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filtros del Cuadro de Ventas
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>('ALL');
  const [salesMonthFilter, setSalesMonthFilter] = useState<string>('ALL');
  const [salesSearch, setSalesSearch] = useState<string>('');

  // Categorías personalizadas y ABM de Categorías
  const [customCategories, setCustomCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ id: '', label: '', description: '' });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');

  // Modal de Crear / Editar Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del formulario de producto
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    shortDescription: '',
    category: 'colchones-sommiers' as ProductCategory,
    categoryLabel: 'Colchones & Sommiers',
    technology: 'alta_densidad' as ProductTechnology,
    measure: '2 Plazas (140x190)',
    firmness: 'Firme' as 'Suave' | 'Media' | 'Firme' | 'Extra Firme',
    basePrice: 380000,
    transferDiscountPercent: 15,
    image: '',
    images: [] as string[],
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
    setModalError('');
    setIsCreatingCategory(false);
    setNewCategoryInput('');
    const defaultCat =
      (catalogCategoryFilter !== 'ALL'
        ? availableCategories.find((c) => c.id === catalogCategoryFilter)
        : undefined) ||
      availableCategories[0] || { id: 'colchones-sommiers', label: 'Colchones & Sommiers' };
    setForm({
      id: '',
      name: '',
      description: '',
      shortDescription: '',
      category: defaultCat.id,
      categoryLabel: defaultCat.label,
      technology: 'alta_densidad',
      measure: '2 Plazas (140x190)',
      firmness: 'Firme',
      basePrice: 350000,
      transferDiscountPercent: 15,
      image:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
      ],
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
    setModalError('');
    setIsCreatingCategory(false);
    setNewCategoryInput('');
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription,
      category: p.category,
      categoryLabel: p.categoryLabel || CATEGORY_MAP[p.category] || p.category,
      technology: p.technology,
      measure: p.measure,
      firmness: p.firmness || 'Firme',
      basePrice: p.basePrice,
      transferDiscountPercent: p.transferDiscountPercent ?? 15,
      image: p.image,
      images: Array.isArray(p.images) && p.images.length > 0 ? [...p.images] : (p.image ? [p.image] : []),
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

  // Comprimir archivo de imagen a Canvas Base64 JPEG < 200KB
  const compressSingleImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = typeof ev.target?.result === 'string' ? ev.target.result : '';
        if (!raw) return resolve('');
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 850;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.75));
              return;
            }
            resolve(raw);
          } catch {
            resolve(raw);
          }
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Subir una o varias fotos desde archivo local (compresión múltiple)
  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setModalError('');
    setIsCompressingImages(true);

    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const result = await compressSingleImage(file);
        if (result) compressedList.push(result);
      }

      setForm((prev) => {
        const currentImages = Array.isArray(prev.images) && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
        const combined = [...currentImages, ...compressedList].slice(0, 8);
        return {
          ...prev,
          images: combined,
          image: combined[0] || '',
        };
      });
      showToast(`📸 ${compressedList.length} imagen(es) procesada(s) con éxito`);
    } catch {
      setModalError('Error al procesar las imágenes seleccionadas.');
    } finally {
      setIsCompressingImages(false);
      // Reset input para permitir subir la misma foto nuevamente si se desea
      e.target.value = '';
    }
  };

  // Agregar imagen por URL
  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
      setModalError('La URL debe comenzar con https:// o http://');
      return;
    }
    setForm((prev) => {
      const currentImages = Array.isArray(prev.images) && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
      if (currentImages.includes(url)) return prev;
      const combined = [...currentImages, url].slice(0, 8);
      return {
        ...prev,
        images: combined,
        image: combined[0] || '',
      };
    });
    setNewImageUrl('');
  };

  // Establecer foto como portada principal (índice 0)
  const handleSetCoverImage = (indexToCover: number) => {
    setForm((prev) => {
      const list = [...(prev.images || [])];
      if (indexToCover <= 0 || indexToCover >= list.length) return prev;
      const target = list[indexToCover];
      list.splice(indexToCover, 1);
      list.unshift(target);
      return {
        ...prev,
        images: list,
        image: list[0] || '',
      };
    });
  };

  // Eliminar una foto de la galería
  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => {
      const list = (prev.images || []).filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        images: list,
        image: list[0] || '',
      };
    });
  };

  // Guardar producto (Crear o Actualizar en Catálogo / Supabase)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!form.name.trim()) {
      setModalError('Por favor ingresá el nombre del producto.');
      return;
    }
    if (!form.image.trim()) {
      setModalError('Por favor subí una foto o ingresá una URL para la imagen del producto.');
      return;
    }
    if (Number(form.basePrice) <= 0) {
      setModalError('El precio base debe ser un importe numérico mayor a 0.');
      return;
    }

    let finalCategory = form.category;
    let finalCategoryLabel =
      form.categoryLabel.trim() ||
      availableCategories.find((c) => c.id === form.category)?.label ||
      CATEGORY_MAP[form.category] ||
      form.category;

    if (isCreatingCategory) {
      const cleanNewName = newCategoryInput.trim();
      const newSlug = slugifyCategory(cleanNewName);
      if (!cleanNewName || newSlug.length < 2) {
        setModalError('Por favor ingresá un nombre válido para la nueva categoría.');
        return;
      }
      finalCategory = newSlug;
      finalCategoryLabel = cleanNewName;
      setCustomCategories((prev) =>
        prev.some((c) => c.id === newSlug) ? prev : [...prev, { id: newSlug, label: cleanNewName }]
      );
      await saveCategory({ id: newSlug, label: cleanNewName });
    }

    setIsSaving(true);
    const rawSlug =
      form.id.trim() ||
      form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);

    const generatedSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

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
      category: finalCategory,
      categoryLabel: finalCategoryLabel,
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
      image: (form.images && form.images.length > 0) ? form.images[0] : form.image.trim(),
      images: (form.images && form.images.length > 0) ? form.images : (form.image.trim() ? [form.image.trim()] : []),
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
      setModalError(res.error || 'Error al guardar el producto. Verificá los campos ingresados.');
      showToast(`❌ ${res.error || 'Error al guardar el producto'}`);
      return;
    }

    setIsModalOpen(false);
    showToast(`✅ Producto "${productToSave.name}" guardado exitosamente`);
  };

  // Exportar cuadro analítico de ventas a CSV (Compatible con Excel / Google Sheets)
  const handleExportSalesCsv = () => {
    if (orders.length === 0) {
      showToast('⚠️ No hay ventas registradas para exportar');
      return;
    }

    const headers = [
      'ID Pedido',
      'Mes',
      'Fecha',
      'Cliente',
      'Email',
      'Telefono',
      'DNI',
      'Medio de Pago',
      'Metodo de Entrega',
      'CP',
      'Ciudad',
      'Provincia',
      'Direccion',
      'Productos Comprados',
      'Subtotal ($)',
      'Descuento Transferencia ($)',
      'Flete Original ($)',
      'Flete Bonificado ($)',
      'Total Final ($)',
      'Estado',
    ];

    const rows = orders.map((o) => {
      const { monthLabel } = getOrderMonthInfo(o.date);
      const itemsDetail = o.items
        .map(
          (i) =>
            `${i.quantity}x ${i.product.name} (${i.variationName}${
              i.fabric ? ` - ${i.fabric}` : ''
            })`
        )
        .join('; ');

      return [
        `"${o.id}"`,
        `"${monthLabel}"`,
        `"${new Date(o.date).toLocaleDateString('es-AR')} ${new Date(o.date).toLocaleTimeString('es-AR')}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
        `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
        `"${(o.customerDni || '').replace(/"/g, '""')}"`,
        `"${o.paymentMethod.toUpperCase()}"`,
        `"${o.deliveryMethod === 'showroom' ? 'Retiro Showroom Villa Krause' : 'Envio a Domicilio'}"`,
        `"${o.postalCode || ''}"`,
        `"${(o.city || '').replace(/"/g, '""')}"`,
        `"${(o.province || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        o.subtotal,
        o.transferDiscount || 0,
        o.shippingOriginal || 0,
        o.shippingDiscount || 0,
        o.total,
        `"${o.status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ventas-benflex-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📊 Cuadro de ventas exportado exitosamente a CSV');
  };

  // Ajuste rápido de precio, descuento, categoría o stock desde la tarjeta
  const handleQuickPriceUpdate = async (product: Product, newPrice: number) => {
    if (!Number.isFinite(newPrice) || newPrice <= 0 || newPrice === product.basePrice) return;
    const res = await saveProduct({ ...product, basePrice: Math.round(newPrice) });
    if (res.success) {
      showToast(`💰 Precio de "${product.name}" actualizado a $${Math.round(newPrice).toLocaleString('es-AR')}`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo actualizar el precio'}`);
    }
  };

  const handleQuickDiscountUpdate = async (product: Product, newDiscount: number) => {
    if (
      !Number.isFinite(newDiscount) ||
      newDiscount < 0 ||
      newDiscount > 60 ||
      Math.round(newDiscount) === (product.transferDiscountPercent ?? 15)
    ) {
      return;
    }
    const cleanDiscount = Math.round(newDiscount);
    const res = await saveProduct({ ...product, transferDiscountPercent: cleanDiscount });
    if (res.success) {
      showToast(`🏷️ Descuento de "${product.name}" actualizado a ${cleanDiscount}% OFF`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo actualizar el descuento'}`);
    }
  };

  const handleQuickCategoryUpdate = async (product: Product, newCatId: string) => {
    if (!newCatId || newCatId === product.category) return;
    const foundCat = availableCategories.find((c) => c.id === newCatId);
    const newLabel = foundCat?.label || CATEGORY_MAP[newCatId] || newCatId;
    const res = await saveProduct({
      ...product,
      category: newCatId,
      categoryLabel: newLabel,
    });
    if (res.success) {
      showToast(`📂 Categoría de "${product.name}" cambiada a "${newLabel}"`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo cambiar la categoría'}`);
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
      `¿Estás seguro de dar de baja / eliminar "${product.name}" del catálogo?`
    );
    if (!confirmed) return;
    const res = await deleteProduct(product.id);
    if (res.success) {
      showToast(`🗑️ Producto "${product.name}" dado de baja del catálogo`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo eliminar el producto'}`);
    }
  };

  // =========================================================================
  // ABM DE CATEGORÍAS (ALTA, BAJA Y MODIFICACIÓN)
  // =========================================================================
  const handleStartEditCategory = (cat: { id: string; label: string; description?: string }) => {
    setEditingCategory({ id: cat.id, label: cat.label, description: cat.description });
    setCatForm({
      id: cat.id,
      label: cat.label,
      description: cat.description || '',
    });
    setCatError('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCatForm({ id: '', label: '', description: '' });
    setCatError('');
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');

    const cleanLabel = catForm.label.trim();
    const cleanId = editingCategory
      ? editingCategory.id
      : slugifyCategory(catForm.id.trim() || cleanLabel);

    if (cleanLabel.length < 2 || cleanId.length < 2) {
      setCatError('Por favor ingresá un nombre válido (mínimo 2 caracteres) para la categoría.');
      return;
    }

    setCatSaving(true);
    const res = await saveCategory({
      id: cleanId,
      label: cleanLabel,
      description: catForm.description.trim() || undefined,
    });
    setCatSaving(false);

    if (!res.success) {
      setCatError(res.error || 'No se pudo guardar la categoría.');
      showToast(`❌ ${res.error || 'Error al guardar la categoría'}`);
      return;
    }

    showToast(
      editingCategory
        ? `✅ Categoría "${cleanLabel}" modificada exitosamente`
        : `✅ Categoría "${cleanLabel}" dada de alta exitosamente`
    );
    setEditingCategory(null);
    setCatForm({ id: '', label: '', description: '' });
  };

  const handleDeleteCategory = async (cat: { id: string; label: string; count: number }) => {
    if (cat.count > 0) {
      const confirmWithProducts = window.confirm(
        `La categoría "${cat.label}" tiene ${cat.count} producto(s) asociado(s).\n\n¿Querés dar de baja la categoría Y TAMBIÉN dar de baja sus ${cat.count} producto(s)?\n(Si preferís conservar los productos, presioná Cancelar y cambiales la categoría primero).`
      );
      if (!confirmWithProducts) return;
      const res = await deleteCategory(cat.id, true);
      if (res.success) {
        if (catalogCategoryFilter === cat.id) setCatalogCategoryFilter('ALL');
        showToast(`🗑️ Categoría "${cat.label}" y sus productos dados de baja`);
      } else {
        showToast(`❌ ${res.error || 'No se pudo eliminar la categoría'}`);
      }
      return;
    }

    const confirmed = window.confirm(`¿Estás seguro de dar de baja la categoría "${cat.label}"?`);
    if (!confirmed) return;
    const res = await deleteCategory(cat.id, false);
    if (res.success) {
      if (catalogCategoryFilter === cat.id) setCatalogCategoryFilter('ALL');
      showToast(`🗑️ Categoría "${cat.label}" eliminada`);
    } else {
      showToast(`❌ ${res.error || 'No se pudo eliminar la categoría'}`);
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

  const activeOrdersCount = orders.filter((o) => o.status !== 'CANCELADO').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELADO')
    .reduce((acc, o) => acc + o.total, 0);

  const filteredCatalog = products.filter((p) => {
    if (catalogCategoryFilter !== 'ALL' && p.category !== catalogCategoryFilter) {
      return false;
    }
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Métricas avanzadas para el Cuadro de Ventas (Hooks declarados siempre antes de cualquier early return)
  const salesMetrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'CANCELADO');
    const approvedOrders = orders.filter(
      (o) => o.status === 'APROBADO' || o.status === 'ENTREGADO'
    );

    const totalGrossRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const totalCollected = approvedOrders.reduce((acc, o) => acc + o.total, 0);
    const totalUnitsSold = validOrders.reduce(
      (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );
    const averageTicket =
      validOrders.length > 0 ? Math.round(totalGrossRevenue / validOrders.length) : 0;
    const totalTransferDiscounts = validOrders.reduce(
      (acc, o) => acc + (o.transferDiscount || 0),
      0
    );
    const totalShippingDiscounts = validOrders.reduce(
      (acc, o) => acc + (o.shippingDiscount || 0),
      0
    );

    // Desglose por Medio de Pago
    const byPayment: Record<string, { count: number; total: number }> = {
      transferencia: { count: 0, total: 0 },
      credito: { count: 0, total: 0 },
      debito: { count: 0, total: 0 },
      mercadopago: { count: 0, total: 0 },
    };
    validOrders.forEach((o) => {
      const pm = o.paymentMethod || 'transferencia';
      if (!byPayment[pm]) byPayment[pm] = { count: 0, total: 0 };
      byPayment[pm].count += 1;
      byPayment[pm].total += o.total;
    });

    // Desglose por Método de Entrega
    const showroomOrders = validOrders.filter((o) => o.deliveryMethod === 'showroom');
    const deliveryOrders = validOrders.filter((o) => o.deliveryMethod === 'delivery');

    return {
      validOrdersCount: validOrders.length,
      approvedOrdersCount: approvedOrders.length,
      totalGrossRevenue,
      totalCollected,
      totalUnitsSold,
      averageTicket,
      totalTransferDiscounts,
      totalShippingDiscounts,
      byPayment,
      showroomCount: showroomOrders.length,
      deliveryCount: deliveryOrders.length,
    };
  }, [orders]);

  // Categorías disponibles con conteo de productos (Sincronizadas con ABM de Categorías)
  const availableCategories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; description?: string; count: number }>();

    categories.forEach((c) => {
      map.set(c.id, { id: c.id, label: c.label, description: c.description, count: 0 });
    });

    customCategories.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, { id: c.id, label: c.label, count: 0 });
      }
    });

    products.forEach((p) => {
      if (!p.category) return;
      const existing = map.get(p.category);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.category, {
          id: p.category,
          label: p.categoryLabel || CATEGORY_MAP[p.category] || p.category,
          count: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [categories, products, customCategories]);

  // Agrupación de ventas por mes (Resumen mensual global)
  const salesByMonth = useMemo(() => {
    const groups = new Map<
      string,
      {
        monthKey: string;
        monthLabel: string;
        ordersCount: number;
        validCount: number;
        approvedCount: number;
        grossRevenue: number;
        collectedRevenue: number;
        unitsSold: number;
      }
    >();

    orders.forEach((o) => {
      const { monthKey, monthLabel } = getOrderMonthInfo(o.date);
      if (!groups.has(monthKey)) {
        groups.set(monthKey, {
          monthKey,
          monthLabel,
          ordersCount: 0,
          validCount: 0,
          approvedCount: 0,
          grossRevenue: 0,
          collectedRevenue: 0,
          unitsSold: 0,
        });
      }
      const g = groups.get(monthKey)!;
      g.ordersCount += 1;
      if (o.status !== 'CANCELADO') {
        g.validCount += 1;
        g.grossRevenue += o.total;
        g.unitsSold += o.items.reduce((sum, item) => sum + item.quantity, 0);
      }
      if (o.status === 'APROBADO' || o.status === 'ENTREGADO') {
        g.approvedCount += 1;
        g.collectedRevenue += o.total;
      }
    });

    return Array.from(groups.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [orders]);

  // Órdenes filtradas para el Cuadro de Ventas
  const filteredSalesOrders = useMemo(() => {
    return orders.filter((o) => {
      if (salesStatusFilter !== 'ALL' && o.status !== salesStatusFilter) {
        return false;
      }
      if (salesMonthFilter !== 'ALL') {
        const { monthKey } = getOrderMonthInfo(o.date);
        if (monthKey !== salesMonthFilter) {
          return false;
        }
      }
      if (salesSearch.trim()) {
        const query = salesSearch.toLowerCase();
        const matchesClient = o.customerName.toLowerCase().includes(query);
        const matchesEmail = o.customerEmail.toLowerCase().includes(query);
        const matchesPhone = o.customerPhone.toLowerCase().includes(query);
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesDni = (o.customerDni || '').toLowerCase().includes(query);
        const matchesProduct = o.items.some((i) =>
          i.product.name.toLowerCase().includes(query)
        );
        if (
          !matchesClient &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesId &&
          !matchesDni &&
          !matchesProduct
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, salesStatusFilter, salesMonthFilter, salesSearch]);

  // Transacciones filtradas agrupadas por mes para la tabla analítica
  const groupedFilteredSalesByMonth = useMemo(() => {
    const groups = new Map<
      string,
      {
        monthKey: string;
        monthLabel: string;
        orders: Order[];
        monthTotal: number;
        monthUnits: number;
      }
    >();

    filteredSalesOrders.forEach((o) => {
      const { monthKey, monthLabel } = getOrderMonthInfo(o.date);
      if (!groups.has(monthKey)) {
        groups.set(monthKey, {
          monthKey,
          monthLabel,
          orders: [],
          monthTotal: 0,
          monthUnits: 0,
        });
      }
      const g = groups.get(monthKey)!;
      g.orders.push(o);
      if (o.status !== 'CANCELADO') {
        g.monthTotal += o.total;
        g.monthUnits += o.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    });

    return Array.from(groups.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredSalesOrders]);

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
                {authRole === 'owner' ? '👑 Modo: Dueño / Fábrica' : '🛠️ Modo: Desarrollador Total'}
              </span>
              <span
                className="badge-pill"
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: dataSource === 'supabase' ? '#dcfce7' : '#ffedd5',
                  color: dataSource === 'supabase' ? '#15803d' : '#c2410c',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={13} />
                {dataSource === 'supabase'
                  ? 'Supabase PostgreSQL Activo'
                  : 'Almacenamiento Local Híbrido'}
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
              <span>Alta de Producto</span>
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
              Productos ABM ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                backgroundColor: activeTab === 'categories' ? '#111827' : '#ffffff',
                color: activeTab === 'categories' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Layers size={16} />
              <span>Categorías ABM ({availableCategories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                backgroundColor: activeTab === 'sales' ? '#111827' : '#ffffff',
                color: activeTab === 'sales' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <BarChart3 size={16} />
              <span>Cuadro de Ventas ({salesMetrics.validOrdersCount})</span>
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
              Consultas ({inquiries.length})
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', marginBottom: '0.25rem' }}>
              <Layers size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Categorías Registradas</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>
              {availableCategories.length}{' '}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                ({availableCategories.filter((c) => c.count > 0).length} activas en tienda)
              </span>
            </div>
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
        </div>

        {/* ================================================================= */}
        {/* TAB 1: ABM DE PRODUCTOS (ALTAS, BAJAS Y MODIFICACIONES)           */}
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
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                  ABM de Productos (Altas, Bajas y Modificaciones)
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Creá nuevos productos, modificá categoría/precio/descuento/stock directamente en la fila o abrí el editor completo para fotos, medidas y telas.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <FolderPlus size={15} />
                  <span>Gestionar Categorías</span>
                </button>

                {/* Buscador interno */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '0.5rem 0.85rem',
                    minWidth: '250px',
                  }}
                >
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Buscar producto o categoría..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Filtro rápido por Categoría dentro de Productos */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={() => setCatalogCategoryFilter('ALL')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: catalogCategoryFilter === 'ALL' ? '#111827' : '#f8fafc',
                  color: catalogCategoryFilter === 'ALL' ? '#ffffff' : '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                Todas ({products.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatalogCategoryFilter(cat.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: catalogCategoryFilter === cat.id ? '#111827' : '#f8fafc',
                    color: catalogCategoryFilter === cat.id ? '#ffffff' : '#475569',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {filteredCatalog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '1rem' }}>No hay productos en esta vista.</p>
                <button
                  type="button"
                  onClick={openNewProductModal}
                  style={{
                    backgroundColor: 'var(--brand-sage)',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  + Dar de Alta Producto
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredCatalog.map((p) => {
                  const discountPct = p.transferDiscountPercent ?? 15;
                  const transferPrice = Math.round(p.basePrice * (1 - discountPct / 100));
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '88px 1.4fr 1.3fr auto',
                        gap: '1.15rem',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          <select
                            aria-label="Cambiar categoría del producto"
                            value={p.category}
                            onChange={(e) => handleQuickCategoryUpdate(p, e.target.value)}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              border: '1px solid #bae6fd',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              cursor: 'pointer',
                            }}
                          >
                            {availableCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

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
                              Sin Stock
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {p.technologyLabel} • {p.measure} • {p.variations.length} variante(s)
                        </div>
                      </div>

                      {/* Modificación rápida de Precio de Lista, % Descuento y Stock */}
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            PRECIO LISTA ($)
                          </label>
                          <input
                            key={`price-${p.id}-${p.basePrice}`}
                            type="number"
                            defaultValue={p.basePrice}
                            onBlur={(e) => handleQuickPriceUpdate(p, Number(e.target.value))}
                            style={{
                              width: '115px',
                              padding: '0.42rem 0.55rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 800,
                              fontSize: '0.86rem',
                              backgroundColor: '#ffffff',
                            }}
                          />
                          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                            Transf: ${transferPrice.toLocaleString('es-AR')}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            % OFF TRANSF.
                          </label>
                          <input
                            key={`disc-${p.id}-${discountPct}`}
                            type="number"
                            min={0}
                            max={60}
                            defaultValue={discountPct}
                            onBlur={(e) => handleQuickDiscountUpdate(p, Number(e.target.value))}
                            style={{
                              width: '68px',
                              padding: '0.42rem 0.55rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                              backgroundColor: '#ffffff',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            STOCK
                          </label>
                          <input
                            key={`stock-${p.id}-${p.stock}`}
                            type="number"
                            min={0}
                            defaultValue={p.stock}
                            onBlur={(e) => handleQuickStockUpdate(p, Number(e.target.value))}
                            style={{
                              width: '68px',
                              padding: '0.42rem 0.55rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                              backgroundColor: '#ffffff',
                            }}
                          />
                        </div>
                      </div>

                      {/* Acciones ABM: Modificar Completo / Dar de Baja */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          style={{
                            backgroundColor: '#111827',
                            color: '#ffffff',
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Modificar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer',
                          }}
                          title="Dar de baja este producto"
                        >
                          <Trash2 size={15} />
                          <span>Baja</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1B: ABM DE CATEGORÍAS (ALTAS, BAJAS Y MODIFICACIONES)         */}
        {/* ================================================================= */}
        {activeTab === 'categories' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                ABM de Categorías (Altas, Bajas y Modificaciones)
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Creá nuevas categorías, renombrá las existentes (se actualizan todos sus productos automáticamente) o dalas de baja. Recordá que en la tienda pública solo se muestran las categorías que tienen al menos 1 producto cargado.
              </p>
            </div>

            {/* Formulario de Alta / Modificación de Categoría */}
            <form
              onSubmit={handleSaveCategorySubmit}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: editingCategory ? '#f0f9ff' : '#f8fafc',
                border: editingCategory ? '2px solid #0284c7' : '1px solid #e2e8f0',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingCategory
                    ? `✏️ Modificando Categoría: ${editingCategory.label} (ID: ${editingCategory.id})`
                    : '➕ Dar de Alta Nueva Categoría'}
                </span>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEditCategory}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {catError && (
                <div
                  style={{
                    padding: '0.65rem 0.9rem',
                    marginBottom: '0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  {catError}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.85rem',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Nombre Visible de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Respaldos & Sommiers"
                    value={catForm.label}
                    onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Descripción Corta (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Respaldos tapizados en lino y pana"
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={catSaving}
                    style={{
                      padding: '0.72rem 1.35rem',
                      borderRadius: '10px',
                      backgroundColor: editingCategory ? '#0284c7' : '#111827',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      cursor: catSaving ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {catSaving
                      ? 'Guardando...'
                      : editingCategory
                      ? 'Guardar Modificación'
                      : '+ Dar de Alta Categoría'}
                  </button>
                </div>
              </div>
            </form>

            {/* Listado de Categorías con Acciones de Modificación y Baja */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {availableCategories.map((cat) => {
                const isVisibleInStore = cat.count > 0;
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #e4e4e7',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#111827' }}>
                          {cat.label}
                        </span>
                        <code
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          {cat.id}
                        </code>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.18rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: isVisibleInStore ? '#dcfce7' : '#f1f5f9',
                            color: isVisibleInStore ? '#15803d' : '#64748b',
                          }}
                        >
                          {isVisibleInStore
                            ? `Visible en Tienda (${cat.count} prod.)`
                            : 'Oculta en Tienda (0 productos)'}
                        </span>
                      </div>
                      {cat.description && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {cat.description}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogCategoryFilter(cat.id);
                          setActiveTab('catalog');
                        }}
                        style={{
                          padding: '0.48rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Ver productos ({cat.count})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditCategory(cat)}
                        style={{
                          padding: '0.48rem 0.85rem',
                          borderRadius: '8px',
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Modificar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        style={{
                          padding: '0.48rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Dar de Baja</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CUADRO ANALÍTICO DE VENTAS WEB (SOLICITADO POR DUEÑO Y DEV)*/}
        {/* ================================================================= */}
        {activeTab === 'sales' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
            {/* Header Cuadro de Ventas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.75rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <BarChart3 size={24} color="var(--brand-sage)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Cuadro Analítico de Ventas Web • BenFlex
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Visualización consolidada de ingresos, medios de pago, modalidades de entrega y pedidos.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportSalesCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                }}
              >
                <Download size={16} />
                <span>Exportar Ventas a CSV (Excel)</span>
              </button>
            </div>

            {/* KPIs Comerciales */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', marginBottom: '0.25rem' }}>
                  <DollarSign size={16} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Ventas Cobradas (Aprobadas)
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#166534' }}>
                  ${salesMetrics.totalCollected.toLocaleString('es-AR')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.2rem' }}>
                  {salesMetrics.approvedOrdersCount} pedidos aprobados o entregados
                </div>
              </div>

              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-sage)', marginBottom: '0.25rem' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Facturación Registrada
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                  ${salesMetrics.totalGrossRevenue.toLocaleString('es-AR')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {salesMetrics.validOrdersCount} pedidos activos totales
                </div>
              </div>

              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', marginBottom: '0.25rem' }}>
                  <ShoppingBag size={16} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Ticket Promedio
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>
                  ${salesMetrics.averageTicket.toLocaleString('es-AR')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Por cada orden generada
                </div>
              </div>

              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', marginBottom: '0.25rem' }}>
                  <Package size={16} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Unidades Vendidas
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6d28d9' }}>
                  {salesMetrics.totalUnitsSold}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Colchones, sommiers, sillones y almohadas
                </div>
              </div>

              <div
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', marginBottom: '0.25rem' }}>
                  <Building size={16} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Descuentos Otorgados
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e' }}>
                  ${(salesMetrics.totalTransferDiscounts + salesMetrics.totalShippingDiscounts).toLocaleString('es-AR')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.2rem' }}>
                  15% Transferencia + Flete Bonificado SJ
                </div>
              </div>
            </div>

            {/* Widgets de Distribución Comercial */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              {/* Desglose por Medio de Pago */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: '#fafaf9',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                  <CreditCard size={18} color="var(--brand-navy)" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                    Ventas por Medio de Pago
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#059669' }}>Transferencia (15% OFF)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{salesMetrics.byPayment.transferencia.count} pedidos realizados</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#059669' }}>
                      ${salesMetrics.byPayment.transferencia.total.toLocaleString('es-AR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0284c7' }}>Tarjeta de Crédito (Cuotas)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{salesMetrics.byPayment.credito.count} pedidos realizados</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0284c7' }}>
                      ${salesMetrics.byPayment.credito.total.toLocaleString('es-AR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4b5563' }}>Débito / MercadoPago</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{salesMetrics.byPayment.debito.count + salesMetrics.byPayment.mercadopago.count} pedidos realizados</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#111827' }}>
                      ${(salesMetrics.byPayment.debito.total + salesMetrics.byPayment.mercadopago.total).toLocaleString('es-AR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desglose por Método de Entrega */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: '#fafaf9',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                  <Truck size={18} color="var(--brand-navy)" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                    Ventas por Modalidad de Entrega
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-navy)' }}>Retiro en Showroom Villa Krause</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Castaño Oeste y Conector Sur, San Juan</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--brand-navy)' }}>
                      {salesMetrics.showroomCount} pedidos
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#059669' }}>Envío a Domicilio</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bonificado en San Juan (Resto a cotizar)</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#059669' }}>
                      {salesMetrics.deliveryCount} pedidos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Ventas Agrupadas por Mes */}
            <div
              style={{
                padding: '1.35rem',
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--brand-sage)" />
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827' }}>
                    Ventas Agrupadas por Mes
                  </h3>
                </div>
                {salesMonthFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSalesMonthFilter('ALL')}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--brand-sage)',
                      backgroundColor: '#e0f2fe',
                      padding: '0.28rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Ver todos los meses
                  </button>
                )}
              </div>

              {salesByMonth.length === 0 ? (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                  Aún no hay ventas registradas por mes.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  {salesByMonth.map((m) => {
                    const isSelected = salesMonthFilter === m.monthKey;
                    return (
                      <button
                        key={m.monthKey}
                        type="button"
                        onClick={() =>
                          setSalesMonthFilter(isSelected ? 'ALL' : m.monthKey)
                        }
                        style={{
                          textAlign: 'left',
                          padding: '1rem 1.1rem',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff',
                          border: isSelected ? '2px solid var(--brand-sage)' : '1px solid #e2e8f0',
                          boxShadow: isSelected
                            ? '0 6px 16px rgba(2, 132, 199, 0.14)'
                            : '0 2px 6px rgba(15, 23, 42, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>
                            {m.monthLabel}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                            }}
                          >
                            {m.validCount} {m.validCount === 1 ? 'venta' : 'ventas'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                          ${m.grossRevenue.toLocaleString('es-AR')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.72rem',
                            color: '#64748b',
                            marginTop: '0.35rem',
                          }}
                        >
                          <span>Cobrado: ${m.collectedRevenue.toLocaleString('es-AR')}</span>
                          <span>{m.unitsSold} unid.</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filtros de la Tabla de Ventas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Mes:
                </span>
                <select
                  value={salesMonthFilter}
                  onChange={(e) => setSalesMonthFilter(e.target.value)}
                  style={{
                    padding: '0.38rem 0.7rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <option value="ALL">Todos los meses</option>
                  {salesByMonth.map((m) => (
                    <option key={m.monthKey} value={m.monthKey}>
                      {m.monthLabel} ({m.validCount})
                    </option>
                  ))}
                </select>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                  Estado:
                </span>
                {(['ALL', 'APROBADO', 'EN_PREPARACION', 'ENTREGADO', 'PENDIENTE_COMPROBANTE', 'CANCELADO'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSalesStatusFilter(st)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: salesStatusFilter === st ? '#111827' : '#ffffff',
                        color: salesStatusFilter === st ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                      }}
                    >
                      {st === 'ALL' ? 'TODOS' : st}
                    </button>
                  )
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.45rem 0.75rem',
                  backgroundColor: '#ffffff',
                  minWidth: '240px',
                }}
              >
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, orden, producto..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Tabla Analítica de Transacciones Agrupadas por Mes */}
            {groupedFilteredSalesByMonth.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No se encontraron ventas registradas con los filtros aplicados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {groupedFilteredSalesByMonth.map((group) => (
                  <div
                    key={group.monthKey}
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Cabecera del Mes */}
                    <div
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '0.75rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#38bdf8" />
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {group.monthLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#cbd5e1',
                            fontWeight: 600,
                          }}
                        >
                          ({group.orders.length} {group.orders.length === 1 ? 'pedido' : 'pedidos'} • {group.monthUnits} unid.)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8' }}>
                        Total Mes: ${group.monthTotal.toLocaleString('es-AR')}
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#334155', fontWeight: 800 }}>
                            <th style={{ padding: '0.8rem 1rem' }}>ID & Fecha</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Cliente</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Productos</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Pago & Entrega</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Total ($)</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Estado</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.orders.map((o) => {
                            const isCancelled = o.status === 'CANCELADO';
                            return (
                              <tr
                                key={o.id}
                                style={{
                                  borderBottom: '1px solid #f1f5f9',
                                  backgroundColor: isCancelled ? '#fef2f2' : '#ffffff',
                                }}
                              >
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>#{o.id}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                    {new Date(o.date).toLocaleDateString('es-AR')} {new Date(o.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ fontWeight: 700, color: '#111827' }}>{o.customerName}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Tel: {o.customerPhone}</div>
                                  {o.customerDni && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DNI: {o.customerDni}</div>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                                  {o.items.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.3 }}>
                                      <strong>{item.quantity}x</strong> {item.product.name}
                                      <span style={{ color: '#64748b' }}> ({item.variationName}{item.fabric ? ` - ${item.fabric}` : ''})</span>
                                    </div>
                                  ))}
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: o.paymentMethod === 'transferencia' ? '#059669' : '#0284c7' }}>
                                    {o.paymentMethod.toUpperCase()} {o.installments ? `(${o.installments}c)` : ''}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                    {o.deliveryMethod === 'showroom' ? 'Retiro Showroom' : `Envío: ${o.city}, ${o.province}`}
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                  <div
                                    style={{
                                      fontWeight: 900,
                                      fontSize: '0.95rem',
                                      color: isCancelled ? '#9ca3af' : '#111827',
                                      textDecoration: isCancelled ? 'line-through' : 'none',
                                    }}
                                  >
                                    ${o.total.toLocaleString('es-AR')}
                                  </div>
                                  {o.transferDiscount > 0 && (
                                    <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                                      -${o.transferDiscount.toLocaleString('es-AR')} OFF
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <select
                                    value={o.status}
                                    onChange={(e) => handleOrderStatusChange(o, e.target.value as OrderStatus)}
                                    style={{
                                      padding: '0.28rem 0.55rem',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
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
                                </td>

                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                  <a
                                    href={`https://wa.me/${o.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                      `¡Hola ${o.customerName}! Te escribimos de BenFlex San Juan por tu compra #${o.id}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      backgroundColor: '#25D366',
                                      color: '#ffffff',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '8px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                    title="Contactar al cliente por WhatsApp"
                                  >
                                    <MessageCircle size={13} />
                                    <span>WhatsApp</span>
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: BANDEJA DE PEDIDOS ONLINE (HISTORIAL DETALLADO)            */}
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
                {editingProduct ? `Editar: ${editingProduct.name}` : 'Cargar Nuevo Producto BenFlex (ATM)'}
              </h2>

              {modalError && (
                <div
                  style={{
                    padding: '0.9rem 1.1rem',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <AlertTriangle size={20} />
                  <span>{modalError}</span>
                </div>
              )}

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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.3rem',
                      }}
                    >
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Categoría *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCategory((prev) => !prev);
                          setNewCategoryInput('');
                        }}
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: 'var(--brand-sage)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {isCreatingCategory ? 'Elegir existente' : '+ Agregar otra categoría'}
                      </button>
                    </div>

                    {!isCreatingCategory ? (
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__NEW__') {
                            setIsCreatingCategory(true);
                            setNewCategoryInput('');
                            return;
                          }
                          const found = availableCategories.find((c) => c.id === val);
                          setForm({
                            ...form,
                            category: val as ProductCategory,
                            categoryLabel: found?.label || CATEGORY_MAP[val] || val,
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                        <option value="__NEW__">+ Crear nueva categoría...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <input
                          type="text"
                          placeholder="Ej: Respaldos & Cabeceros"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '0.72rem 0.75rem',
                            borderRadius: '10px',
                            border: '2px solid var(--brand-sage)',
                            fontSize: '0.88rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const cleanName = newCategoryInput.trim();
                            const slug = slugifyCategory(cleanName);
                            if (!cleanName || slug.length < 2) return;
                            setCustomCategories((prev) =>
                              prev.some((c) => c.id === slug)
                                ? prev
                                : [...prev, { id: slug, label: cleanName }]
                            );
                            await saveCategory({ id: slug, label: cleanName });
                            setForm({
                              ...form,
                              category: slug,
                              categoryLabel: cleanName,
                            });
                            setIsCreatingCategory(false);
                            setNewCategoryInput('');
                          }}
                          style={{
                            padding: '0 0.85rem',
                            borderRadius: '10px',
                            backgroundColor: '#111827',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}
                        >
                          Usar
                        </button>
                      </div>
                    )}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Medida Principal
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 2 Plazas (140x190)"
                      value={form.measure}
                      onChange={(e) => setForm({ ...form, measure: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.72rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Nivel de Firmeza
                    </label>
                    <select
                      value={form.firmness}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          firmness: e.target.value as 'Suave' | 'Media' | 'Firme' | 'Extra Firme',
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Suave">Suave</option>
                      <option value="Media">Media</option>
                      <option value="Firme">Firme</option>
                      <option value="Extra Firme">Extra Firme</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Soporte de Peso
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Hasta 130 kg por lado"
                      value={form.weightSupport}
                      onChange={(e) => setForm({ ...form, weightSupport: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.72rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.88rem',
                      }}
                    />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ImageIcon size={16} />
                      <span>Galería de Fotos del Producto (Subí varias imágenes o URLs)</span>
                    </label>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      {(form.images || []).length} de 8 fotos
                    </span>
                  </div>

                  {/* Barra de Subida de Fotos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          padding: '0.5rem 0.95rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: isCompressingImages ? 'wait' : 'pointer',
                          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                        }}
                      >
                        <Upload size={14} />
                        <span>{isCompressingImages ? 'Optimizando fotos...' : 'Subir fotos desde dispositivo'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleFileUpload}
                          disabled={isCompressingImages}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <div style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '0.45rem' }}>
                        <input
                          type="text"
                          placeholder="O pegá un link HTTPS de foto..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            padding: '0.5rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          + Agregar URL
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Tip: La primera foto será la <strong>portada principal</strong> en la tienda. Podés cambiar el orden haciendo clic en <em>"Hacer Portada"</em>.
                    </div>
                  </div>

                  {/* Cuadrícula de Fotos Cargadas */}
                  {(form.images && form.images.length > 0) ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {form.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            border: idx === 0 ? '2.5px solid #0284c7' : '1px solid #cbd5e1',
                            boxShadow: idx === 0 ? '0 3px 12px rgba(2, 132, 199, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div style={{ height: '85px', position: 'relative' }}>
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {idx === 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                  backgroundColor: '#0284c7',
                                  color: '#ffffff',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Star size={10} fill="#ffffff" />
                                <span>PORTADA</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Eliminar foto"
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              style={{
                                padding: '0.3rem 0',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#f1f5f9',
                                color: '#0369a1',
                                border: 'none',
                                borderTop: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                            >
                              Hacer Portada
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #cbd5e1',
                        color: '#64748b',
                        fontSize: '0.8rem',
                      }}
                    >
                      Sin fotos cargadas. Hacé clic en <strong>"Subir fotos desde dispositivo"</strong> para seleccionar una o más imágenes.
                    </div>
                  )}
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
                      Descripción Corta (Resumen en tarjeta de catálogo)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Soporte ortopédico de 35 kg/m³ con tejido respirable"
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

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
                      opacity: isSaving ? 0.7 : 1,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSaving
                      ? 'Guardando en Catálogo...'
                      : editingProduct
                      ? 'Actualizar Producto (ATM)'
                      : 'Guardar y Publicar Producto (ATM)'}
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
