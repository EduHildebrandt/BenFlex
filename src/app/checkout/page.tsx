'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useProducts } from '@/context/ProductContext';
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Building,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  PaymentMethod,
  DeliveryMethod,
  Order,
  BENFLEX_BANK_INFO,
  BENFLEX_CONTACT,
} from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    shippingOriginal,
    shippingFinal,
    clearCart,
  } = useCart();
  const { location, updateByPostalCode } = useLocation();
  const { placeOrder } = useProducts();

  // Estados del Formulario One-Step
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDni, setCustomerDni] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [postalCode, setPostalCode] = useState(location.postalCode);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(location.city);
  const [province, setProvince] = useState(location.province);
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [installments, setInstallments] = useState<number>(3);

  // Estados de UI
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recálculos en tiempo real según método de pago
  const isTransfer = paymentMethod === 'transferencia';
  const transferDiscount = isTransfer ? Math.round(subtotal * 0.15) : 0;
  const finalTotal = subtotal - transferDiscount;

  // Cuotas para tarjeta de crédito
  const installmentAmount = Math.round(subtotal / installments);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value;
    setPostalCode(cp);
    if (cp.length >= 4) {
      updateByPostalCode(cp);
      setCity(location.city);
      setProvince(location.province);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.name = 'Ingresá tu nombre y apellido completo';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errs.email = 'Ingresá un email válido';
    if (!customerPhone.trim() || customerPhone.length < 8) errs.phone = 'Ingresá tu WhatsApp o teléfono';
    if (deliveryMethod === 'delivery') {
      if (!address.trim()) errs.address = 'Ingresá tu calle y número';
      if (!postalCode.trim()) errs.postalCode = 'Ingresá tu código postal';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    const orderId = `BF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      postalCode: deliveryMethod === 'delivery' ? postalCode : BENFLEX_CONTACT.postalCode,
      address: deliveryMethod === 'delivery' ? address : `Showroom Benflex - ${BENFLEX_CONTACT.address}`,
      city: deliveryMethod === 'delivery' ? city : BENFLEX_CONTACT.city,
      province: deliveryMethod === 'delivery' ? province : BENFLEX_CONTACT.province,
      notes,
      paymentMethod,
      items: cartItems,
      subtotal,
      shippingOriginal,
      shippingDiscount: shippingOriginal,
      shippingFinal: 0,
      transferDiscount,
      total: finalTotal,
      installments: paymentMethod === 'credito' ? installments : undefined,
      status: paymentMethod === 'transferencia' ? 'PENDIENTE_COMPROBANTE' : 'APROBADO',
    };

    placeOrder(newOrder);
    clearCart();

    setTimeout(() => {
      router.push(`/order-confirmation?id=${orderId}`);
    }, 600);
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Tu carrito está vacío
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
            No tienes productos para finalizar la compra.
          </p>
          <Link
            href="/"
            style={{
              backgroundColor: 'var(--brand-sage)',
              color: '#ffffff',
              padding: '0.85rem 1.6rem',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '2.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container">
        {/* Header de Checkout Seguro */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '1.25rem',
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
                marginBottom: '0.5rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Volver a la tienda</span>
            </Link>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}>
              Finalizar Compra Segura
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.5rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: 'var(--brand-sage)',
              fontWeight: 700,
            }}
          >
            <Lock size={15} />
            <span>Encriptación SSL 256-Bit</span>
          </div>
        </div>

        {/* CONTENEDOR 2 COLUMNAS */}
        <form onSubmit={handleSubmitOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            {/* COLUMNA 1: FORMULARIO ONE-STEP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Paso 1: Datos de Contacto */}
              <div
                className="glass-card"
                style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
              >
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                  1. Tus Datos de Contacto
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Marcelo Castro"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: errors.name ? '1px solid red' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.name && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.name}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 264 543-9821"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: errors.phone ? '1px solid red' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.phone && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.phone}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      placeholder="marcelo@ejemplo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: errors.email ? '1px solid red' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.email}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      DNI / CUIT (para factura y garantía)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 34.567.890"
                      value={customerDni}
                      onChange={(e) => setCustomerDni(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Paso 2: Método de Entrega */}
              <div
                className="glass-card"
                style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
              >
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                  2. Método de Entrega
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: deliveryMethod === 'delivery' ? '2px solid var(--brand-sage)' : '1px solid #d1d5db',
                      backgroundColor: deliveryMethod === 'delivery' ? 'var(--bg-sage-light)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Truck size={18} color="var(--brand-sage)" />
                        <span>Envío a Domicilio</span>
                      </div>
                      <span className="badge-pill badge-bonificado" style={{ fontSize: '0.72rem' }}>
                        100% Bonificado
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Entrega directa en tu domicilio. Flete bonificado a todo el país.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('showroom')}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: deliveryMethod === 'showroom' ? '2px solid var(--brand-sage)' : '1px solid #d1d5db',
                      backgroundColor: deliveryMethod === 'showroom' ? 'var(--bg-sage-light)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Store size={18} color="var(--brand-navy)" />
                        <span>Retiro en Showroom</span>
                      </div>
                      <span className="badge-pill badge-bonificado" style={{ fontSize: '0.72rem' }}>
                        ¡Gratis!
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Retirás sin costo en Castaño Oeste y Conector Sur, Villa Krause, San Juan.
                    </div>
                  </button>
                </div>

                {deliveryMethod === 'delivery' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 5425"
                        value={postalCode}
                        onChange={handlePostalCodeChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: errors.postalCode ? '1px solid red' : '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      {errors.postalCode && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.postalCode}</span>}
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Dirección, Calle y Altura *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Av. Libertador 1420, Depto 4B"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: errors.address ? '1px solid red' : '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      {errors.address && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.address}</span>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Localidad
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Provincia
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Sucursal de Retiro:</strong> Showroom Benflex en {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}.
                    <br />
                    <strong>Horario:</strong> {BENFLEX_CONTACT.schedule}.
                  </div>
                )}
              </div>

              {/* Paso 3: Medio de Pago */}
              <div
                className="glass-card"
                style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
              >
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                  3. Forma de Pago
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {/* Opción 1: Transferencia Bancaria (Destacada) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'transferencia' ? '2px solid var(--brand-sage)' : '1px solid #d1d5db',
                      backgroundColor: paymentMethod === 'transferencia' ? 'var(--bg-sage-light)' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={paymentMethod === 'transferencia'}
                      onChange={() => setPaymentMethod('transferencia')}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.98rem', color: 'var(--brand-navy)' }}>
                          <Building size={18} color="var(--brand-sage)" />
                          <span>Transferencia Bancaria o Depósito</span>
                        </div>
                        <span className="badge-pill badge-discount" style={{ fontSize: '0.75rem' }}>
                          15% OFF Exclusivo
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Ahorrás ${Math.round(subtotal * 0.15).toLocaleString('es-AR')}. Coordinación inmediata por WhatsApp con comprobante.
                      </div>
                    </div>
                  </label>

                  {/* Opción 2: Tarjeta de Crédito con Cuotas */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'credito' ? '2px solid var(--brand-navy)' : '1px solid #d1d5db',
                      backgroundColor: paymentMethod === 'credito' ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credito"
                      checked={paymentMethod === 'credito'}
                      onChange={() => setPaymentMethod('credito')}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <CreditCard size={18} color="var(--brand-navy)" />
                        <span>Tarjeta de Crédito (Hasta 12 cuotas)</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Visa, Mastercard, Cabal o American Express al precio de lista.
                      </div>
                    </div>
                  </label>

                  {/* Opción 3: Tarjeta de Débito */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'debito' ? '2px solid var(--brand-navy)' : '1px solid #d1d5db',
                      backgroundColor: paymentMethod === 'debito' ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debito"
                      checked={paymentMethod === 'debito'}
                      onChange={() => setPaymentMethod('debito')}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <CreditCard size={18} color="var(--brand-sage)" />
                        <span>Tarjeta de Débito (1 pago sin recargo)</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Visa Débito, Maestro o Cabal Débito con acreditación en el acto.
                      </div>
                    </div>
                  </label>

                  {/* Opción 4: Mercado Pago */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1.15rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'mercadopago' ? '2px solid #009ee3' : '1px solid #d1d5db',
                      backgroundColor: paymentMethod === 'mercadopago' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mercadopago"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={() => setPaymentMethod('mercadopago')}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <span style={{ color: '#009ee3', fontWeight: 900 }}>MP</span>
                        <span>Mercado Pago (Dinero en cuenta / Tarjetas)</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Pagá desde tu app de Mercado Pago con Compra Protegida.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Despliegue de Datos Bancarios si seleccionó Transferencia */}
                {isTransfer && (
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '14px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'var(--brand-navy)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <Sparkles size={16} color="var(--brand-sage)" />
                      <span>Datos Bancarios Oficiales de Benflex:</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>Banco:</strong> {BENFLEX_BANK_INFO.bankName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>Titular:</strong> {BENFLEX_BANK_INFO.holder}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>CUIT:</strong> {BENFLEX_BANK_INFO.cuit}</span>
                      </div>

                      {/* Alias con botón Copiar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#ffffff',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ALIAS:</div>
                          <div style={{ fontWeight: 800, color: 'var(--brand-sage)', fontSize: '0.95rem' }}>
                            {BENFLEX_BANK_INFO.alias}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(BENFLEX_BANK_INFO.alias, 'alias')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: 'var(--bg-sage-light)',
                            color: 'var(--brand-sage)',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          {copiedField === 'alias' ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedField === 'alias' ? 'Copiado!' : 'Copiar Alias'}</span>
                        </button>
                      </div>

                      {/* CBU con botón Copiar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#ffffff',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CBU:</div>
                          <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.85rem' }}>
                            {BENFLEX_BANK_INFO.cbu}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(BENFLEX_BANK_INFO.cbu, 'cbu')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#f1f5f9',
                            color: 'var(--brand-navy)',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          {copiedField === 'cbu' ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedField === 'cbu' ? 'Copiado!' : 'Copiar CBU'}</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                      ✓ Al confirmar el pedido, serás dirigido a la pantalla para adjuntar o enviar tu comprobante directamente por WhatsApp.
                    </div>
                  </div>
                )}

                {/* Calculador de Cuotas e Inputs de Tarjeta si seleccionó Crédito o Débito */}
                {(paymentMethod === 'credito' || paymentMethod === 'debito') && (
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '14px',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {paymentMethod === 'credito' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          Elegí tu plan de cuotas:
                        </label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.9rem',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <option value={1}>1 pago de ${subtotal.toLocaleString('es-AR')}</option>
                          <option value={3}>3 cuotas fijas de ${Math.round(subtotal / 3).toLocaleString('es-AR')}</option>
                          <option value={6}>6 cuotas fijas de ${Math.round(subtotal / 6).toLocaleString('es-AR')}</option>
                          <option value={12}>12 cuotas fijas de ${Math.round(subtotal / 12).toLocaleString('es-AR')}</option>
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                          Número de Tarjeta ({paymentMethod === 'credito' ? 'Crédito' : 'Débito'})
                        </label>
                        <input
                          type="text"
                          placeholder="4509 •••• •••• ••••"
                          maxLength={19}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                          Vencimiento (MM/AA)
                        </label>
                        <input
                          type="text"
                          placeholder="08/29"
                          maxLength={5}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                          Código de Seguridad (CVV)
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Mercado Pago */}
                {paymentMethod === 'mercadopago' && (
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: '1.15rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '14px',
                      border: '1px solid #bae6fd',
                      fontSize: '0.85rem',
                      color: '#0369a1',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Checkout Pro de Mercado Pago:</strong> Al confirmar tu pedido, se generará tu orden segura para abonar con dinero en cuenta, tarjetas asociadas o código QR desde la app de Mercado Pago.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 2: RESUMEN DE LA ORDEN Y DESGLOSE FINANCIERO */}
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                position: 'sticky',
                top: '90px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                Resumen del Pedido ({cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'})
              </h2>

              {/* Lista compacta de items */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '0.35rem',
                  marginBottom: '1.5rem',
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.variationName} • Cant: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      ${item.subtotal.toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desglose de Precios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>

                {/* Flete bonificado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flete a {city} (10%)</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: '6px', fontWeight: 400 }}>
                      ${shippingOriginal.toLocaleString('es-AR')}
                    </span>
                    ¡GRATIS!
                  </span>
                </div>

                {/* Descuento por Transferencia */}
                {isTransfer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--cta-green)', fontWeight: 700 }}>
                    <span>Descuento Transferencia (-15%)</span>
                    <span>-${transferDiscount.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div
                  style={{
                    borderTop: '2px solid #f1f5f9',
                    paddingTop: '0.85rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      Total a Pagar
                    </div>
                    {paymentMethod === 'credito' && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {installments} cuotas de ${installmentAmount.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                    ${finalTotal.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>

              {/* Botón de Confirmación de Pedido */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--brand-sage)',
                  color: '#ffffff',
                  padding: '1.15rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  boxShadow: '0 8px 25px rgba(45, 90, 63, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  transition: 'background-color 0.2s',
                }}
              >
                <span>{isSubmitting ? 'Procesando tu pedido...' : 'Confirmar Pedido'}</span>
                <ArrowRight size={18} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.85rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <ShieldCheck size={15} color="var(--brand-sage)" />
                <span>Garantía de fábrica y atención personalizada Benflex</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
