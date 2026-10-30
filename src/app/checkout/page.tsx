'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLocation, isSanJuanPostalCode } from '@/context/LocationContext';
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
  AlertCircle,
} from 'lucide-react';
import {
  PaymentMethod,
  DeliveryMethod,
  CreateOrderPayload,
  BENFLEX_BANK_INFO,
  BENFLEX_CONTACT,
} from '@/types';

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `bf-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    transferDiscount: cartTransferDiscount,
    clearCart,
  } = useCart();
  const { location, updateByPostalCode } = useLocation();
  const { submitOrder } = useProducts();

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

  // Clave de idempotencia estable para evitar pedidos/descuentos de stock duplicados ante doble clic
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey());

  // Estados de UI
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Si cambia la composición del carrito o el medio de pago/entrega tras un error, rotamos la clave de idempotencia
  const cartFingerprint = cartItems.map((i) => `${i.id}:${i.quantity}`).join('|');
  useEffect(() => {
    if (!isSubmitting && !orderCompleted) {
      setIdempotencyKey(generateIdempotencyKey());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartFingerprint, paymentMethod, deliveryMethod]);

  // Recálculos en tiempo real según método de pago y provincia de destino
  const isDestinationSanJuan = deliveryMethod === 'showroom' || isSanJuanPostalCode(postalCode);
  const estimatedSanJuanShipping = Math.round(subtotal * 0.1);
  const isTransfer = paymentMethod === 'transferencia';
  const transferDiscount = isTransfer ? cartTransferDiscount : 0;
  const finalTotal = Math.max(0, subtotal - transferDiscount);

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
    if (cp.replace(/\D/g, '').length >= 4) {
      const resolved = updateByPostalCode(cp);
      setCity(resolved.city);
      setProvince(resolved.province);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.name = 'Ingresá tu nombre y apellido completo';
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errs.email = 'Ingresá un email válido';
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      errs.phone = 'Ingresá tu WhatsApp o teléfono (mínimo 8 dígitos)';
    }
    if (deliveryMethod === 'delivery') {
      if (!address.trim() || address.trim().length < 3) {
        errs.address = 'Ingresá tu calle y número';
      }
      if (!postalCode.trim()) {
        errs.postalCode = 'Ingresá tu código postal';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || orderCompleted) return;
    setSubmitError(null);

    if (!validateForm()) return;
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    const payload: CreateOrderPayload = {
      idempotencyKey,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerDni: customerDni.trim() || undefined,
      deliveryMethod,
      postalCode: deliveryMethod === 'delivery' ? postalCode.trim() : BENFLEX_CONTACT.postalCode,
      address:
        deliveryMethod === 'delivery'
          ? address.trim()
          : `Showroom BenFlex - ${BENFLEX_CONTACT.address}`,
      city: deliveryMethod === 'delivery' ? city.trim() : BENFLEX_CONTACT.city,
      province: deliveryMethod === 'delivery' ? province.trim() : BENFLEX_CONTACT.province,
      notes: notes.trim() || undefined,
      paymentMethod,
      installments: paymentMethod === 'credito' ? installments : undefined,
      items: cartItems.map((item) => ({
        productId: item.productId,
        variationName: item.variationName,
        fabric: item.fabric,
        quantity: item.quantity,
      })),
    };

    const result = await submitOrder(payload);

    if (!result.success || !result.order) {
      setSubmitError(
        result.error || 'No se pudo procesar el pedido. Verificá los datos e intentá nuevamente.'
      );
      setIsSubmitting(false);
      return;
    }

    setOrderCompleted(true);
    clearCart();
    const tokenParam = result.accessToken
      ? `&token=${encodeURIComponent(result.accessToken)}`
      : '';
    router.push(`/order-confirmation?id=${encodeURIComponent(result.order.id)}${tokenParam}`);
  };

  if (orderCompleted) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', backgroundColor: '#faf9f5' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            ¡Pedido confirmado!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            Generando tu comprobante seguro de reserva...
          </p>
        </div>
      </div>
    );
  }

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
            flexWrap: 'wrap',
            gap: '1rem',
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
            <span>Transacción Protegida SSL</span>
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
                        border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.name && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.name}</span>}
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
                        border: errors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.phone && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.phone}</span>}
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
                        border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.email && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.email}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      DNI / CUIT (para factura y garantía escrita)
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
                      {isSanJuanPostalCode(postalCode) ? (
                        <span className="badge-pill badge-bonificado" style={{ fontSize: '0.72rem' }}>
                          Bonificado (San Juan)
                        </span>
                      ) : (
                        <span className="badge-pill badge-sage" style={{ fontSize: '0.72rem' }}>
                          Flete a cotizar
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {isSanJuanPostalCode(postalCode)
                        ? 'Entrega directa sin cargo en todo San Juan.'
                        : 'Bonificado en San Juan. Para otras provincias cotizamos el expreso al confirmar.'}
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
                          border: errors.postalCode ? '1px solid #dc2626' : '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      {errors.postalCode && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.postalCode}</span>}
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
                          border: errors.address ? '1px solid #dc2626' : '1px solid #d1d5db',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      {errors.address && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.address}</span>}
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

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Indicaciones adicionales de entrega (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Portón blanco, horario de tarde..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
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
                    <strong>Sucursal de Retiro:</strong> Showroom BenFlex en {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}.
                    <br />
                    <strong>Horario:</strong> {BENFLEX_CONTACT.schedule}.
                  </div>
                )}
              </div>

              {/* Paso 3: Medio de Pago (Cumplimiento PCI-DSS SAQ-A: sin captura de PAN/CVV en el sitio) */}
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
                        {cartTransferDiscount > 0 && (
                          <span className="badge-pill badge-discount" style={{ fontSize: '0.75rem' }}>
                            Descuento Directo Aplicado
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Ahorrás ${cartTransferDiscount.toLocaleString('es-AR')}. Coordinación inmediata por WhatsApp con comprobante.
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
                        Visa, Mastercard, Cabal o American Express mediante link de pago seguro oficial.
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
                        Visa Débito, Maestro o Cabal Débito mediante link de pago encriptado.
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
                      <span>Datos Bancarios Oficiales de BenFlex:</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                      <div><strong>Banco:</strong> {BENFLEX_BANK_INFO.bankName}</div>
                      <div><strong>Titular:</strong> {BENFLEX_BANK_INFO.holder}</div>
                      <div><strong>CUIT:</strong> {BENFLEX_BANK_INFO.cuit}</div>

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
                      ✓ Al confirmar el pedido, reservaremos tu stock y pasarás a la pantalla para enviar el comprobante por WhatsApp.
                    </div>
                  </div>
                )}

                {/* Plan de Cuotas y Aviso PCI-DSS SAQ-A (Cero ingreso de PAN/CVV en formulario propio) */}
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
                          Elegí tu plan de cuotas a solicitar:
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

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.9rem 1rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      <Lock size={18} color="var(--brand-sage)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: 'var(--brand-navy)' }}>Seguridad Financiera (PCI-DSS):</strong>{' '}
                        Por tu protección, BenFlex <strong>nunca solicita ni almacena números de tarjeta ni códigos CVV</strong> en esta web. Al confirmar tu pedido se reservará el stock y te enviaremos el link de pago oficial encriptado (Posnet Web / Mercado Pago) para completar el abono.
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
                    <strong>Pago Seguro con Mercado Pago:</strong> Al confirmar tu pedido se reservará tu mercadería en fábrica y recibirás el link oficial de Checkout Pro para abonar desde tu app de Mercado Pago con Compra Protegida.
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
                        {item.variationName}
                        {item.fabric ? ` • ${item.fabric}` : ''} • Cant: {item.quantity}
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

                {/* Flete: Bonificado en San Juan o Showroom vs A cotizar resto del país */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {deliveryMethod === 'showroom'
                      ? 'Retiro en Showroom Villa Krause'
                      : `Envío a ${city || 'destino'}`}
                  </span>
                  {deliveryMethod === 'showroom' ? (
                    <span style={{ color: '#059669', fontWeight: 700 }}>¡GRATIS!</span>
                  ) : isDestinationSanJuan ? (
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: '6px', fontWeight: 400 }}>
                        ${estimatedSanJuanShipping.toLocaleString('es-AR')}
                      </span>
                      ¡GRATIS!
                    </span>
                  ) : (
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>A cotizar</span>
                  )}
                </div>

                {/* Descuento por Transferencia */}
                {isTransfer && transferDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--cta-green)', fontWeight: 700 }}>
                    <span>Descuento Transferencia</span>
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
                        {installments} {installments === 1 ? 'pago' : 'cuotas'} de ${installmentAmount.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                      ${finalTotal.toLocaleString('es-AR')}
                    </div>
                    {!isDestinationSanJuan && (
                      <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                        + envío a cotizar por WhatsApp
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensaje de error de validación / concurrencia de stock */}
              {submitError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    color: '#b91c1c',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{submitError}</span>
                </div>
              )}

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
                <span>{isSubmitting ? 'Verificando stock y registrando...' : 'Confirmar Pedido'}</span>
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
                <span>Garantía de fábrica y atención personalizada BenFlex</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
