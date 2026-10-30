'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isSanJuanPostalCode } from '@/context/LocationContext';
import {
  CheckCircle,
  MessageCircle,
  Building,
  Copy,
  Check,
  Truck,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Package,
} from 'lucide-react';
import { BENFLEX_BANK_INFO, BENFLEX_CONTACT, Order } from '@/types';

const PAYMENT_LABELS: Record<Order['paymentMethod'], string> = {
  transferencia: 'Transferencia Bancaria',
  credito: 'Tarjeta de Crédito',
  debito: 'Tarjeta de Débito',
  mercadopago: 'Mercado Pago',
};

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = (searchParams.get('id') || '').trim();
  const token = (searchParams.get('token') || '').trim();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setErrorMsg('No se especificó un código de pedido válido.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : '';
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}${query}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok || !data.success || !data.order) {
            setErrorMsg(
              data.error ||
                'Por motivos de privacidad, este comprobante solo puede visualizarse desde el enlace seguro generado al finalizar tu compra.'
            );
          } else {
            setOrder(data.order as Order);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('No se pudo cargar el detalle del pedido. Si ya confirmaste tu compra, escribinos por WhatsApp.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 1rem', textAlign: 'center', backgroundColor: '#faf9f5' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Verificando tu reserva #{orderId}...
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Aguardá un instante mientras cargamos tu comprobante seguro.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    const supportWa = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
      `¡Hola BenFlex! Quiero consultar el estado de mi pedido ${orderId ? `#${orderId}` : 'reciente'}.`
    )}`;
    return (
      <div style={{ padding: '4.5rem 1rem', backgroundColor: '#faf9f5', minHeight: '75vh' }}>
        <div className="container" style={{ maxWidth: '560px' }}>
          <div
            className="glass-card"
            style={{
              padding: '2.25rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: '22px',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={42} color="#0284c7" style={{ margin: '0 auto 1rem auto' }} />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.65rem' }}>
              Comprobante Protegido
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {errorMsg}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <a
                href={supportWa}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} />
                <span>Consultar mi pedido por WhatsApp</span>
              </a>
              <Link
                href="/"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}
              >
                ← Volver a la tienda BenFlex
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTransfer = order.paymentMethod === 'transferencia';
  const isFreeShippingOrder =
    order.deliveryMethod === 'showroom' || isSanJuanPostalCode(order.postalCode);
  const destination =
    order.deliveryMethod === 'showroom'
      ? 'Retiro en Showroom Villa Krause'
      : `${order.address}, ${order.city} (CP ${order.postalCode})`;

  const paymentSummaryLabel =
    order.paymentMethod === 'credito' && order.installments
      ? `${PAYMENT_LABELS[order.paymentMethod]} (${order.installments} ${
          order.installments === 1 ? 'pago' : 'cuotas'
        })`
      : PAYMENT_LABELS[order.paymentMethod];

  // Mensaje dinámico según medio de pago y zona geográfica (San Juan bonificado vs resto del país a cotizar)
  const whatsappText = isTransfer
    ? isFreeShippingOrder
      ? `¡Hola BenFlex! Acabo de realizar el pedido #${order.id} por un total de $${order.total.toLocaleString('es-AR')} mediante Transferencia Bancaria. Adjunto mi comprobante para coordinar la entrega en ${destination}.`
      : `¡Hola BenFlex! Acabo de realizar el pedido #${order.id} por $${order.total.toLocaleString('es-AR')} (productos) mediante Transferencia Bancaria. Adjunto mi comprobante y solicito cotizar el envío a ${destination}.`
    : isFreeShippingOrder
    ? `¡Hola BenFlex! Acabo de registrar el pedido #${order.id} por $${order.total.toLocaleString('es-AR')} eligiendo ${paymentSummaryLabel}. Solicito el link de pago oficial seguro para abonar y coordinar la entrega en ${destination}.`
    : `¡Hola BenFlex! Acabo de registrar el pedido #${order.id} por $${order.total.toLocaleString('es-AR')} (productos) eligiendo ${paymentSummaryLabel}. Solicito el link de pago oficial seguro y la cotización de envío a ${destination}.`;

  const whatsappHref = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '3.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Banner Principal de Reserva Registrada */}
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '2.5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle size={38} />
          </div>

          <span
            style={{
              backgroundColor: isTransfer ? '#ecfdf5' : '#e0f2fe',
              color: isTransfer ? '#047857' : '#0369a1',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            PEDIDO #{order.id} • {isTransfer ? 'PENDIENTE DE COMPROBANTE' : 'RESERVA PENDIENTE DE PAGO'}
          </span>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.35rem)',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              margin: '1rem 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            ¡Gracias por elegir BenFlex, {order.customerName.split(' ')[0]}!
          </h1>

          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.75rem auto' }}>
            Ya descontamos y reservamos tus productos en nuestro centro logístico de Villa Krause, San Juan.
          </p>

          {/* CTA Principal adaptado al Medio de Pago elegido */}
          <div
            style={{
              backgroundColor: isTransfer ? '#f0fdf4' : '#f0f9ff',
              border: isTransfer ? '2px dashed #86efac' : '2px dashed #7dd3fc',
              borderRadius: '18px',
              padding: '1.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: isTransfer ? '#166534' : '#0c4a6e',
                marginBottom: '0.5rem',
              }}
            >
              {isTransfer
                ? 'Paso final: Envío de Comprobante de Transferencia'
                : `Paso final: Recibir Link de Pago Oficial (${paymentSummaryLabel})`}
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                color: isTransfer ? '#15803d' : '#0369a1',
                marginBottom: '1.25rem',
                lineHeight: 1.45,
              }}
            >
              {isTransfer
                ? 'Hacé clic en el botón debajo para abrir WhatsApp con tu número de pedido ya cargado y adjuntar el comprobante bancario:'
                : 'Por seguridad PCI-DSS no procesamos tarjetas en formularios abiertos. Hacé clic debajo para recibir tu link de cobro oficial encriptado por WhatsApp:'}
            </p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '1.1rem 2rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1.02rem',
                boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
                textDecoration: 'none',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <MessageCircle size={22} />
              <span>
                {isTransfer
                  ? 'Enviar comprobante y coordinar por WhatsApp'
                  : 'Solicitar link de pago seguro por WhatsApp'}
              </span>
            </a>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Un asesor oficial de nuestro showroom en Villa Krause verificará tu acreditación y coordinará el despacho.
          </div>
        </div>

        {/* Grilla Inferior: Datos de Pago / Productos + Detalles de Entrega */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {isTransfer ? (
            /* Tarjeta de Datos Bancarios para Transferencia */
            <div
              className="glass-card"
              style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building size={20} color="var(--brand-sage)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Datos de la Cuenta Bancaria
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Monto final a transferir:</strong> ${order.total.toLocaleString('es-AR')}</div>
                <div><strong>Banco:</strong> {BENFLEX_BANK_INFO.bankName}</div>
                <div><strong>Titular:</strong> {BENFLEX_BANK_INFO.holder}</div>
                <div><strong>CUIT:</strong> {BENFLEX_BANK_INFO.cuit}</div>

                {/* Alias */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ALIAS:</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-sage)', fontSize: '0.92rem' }}>
                      {BENFLEX_BANK_INFO.alias}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(BENFLEX_BANK_INFO.alias, 'alias')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: 'var(--bg-sage-light)',
                      color: 'var(--brand-sage)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {copiedField === 'alias' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === 'alias' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* CBU */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CBU:</div>
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
                      gap: '0.3rem',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: '#f1f5f9',
                      color: 'var(--brand-navy)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {copiedField === 'cbu' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === 'cbu' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tarjeta de Resumen de Reserva y Medio de Pago (Tarjetas / Mercado Pago) */
            <div
              className="glass-card"
              style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CreditCard size={20} color="var(--brand-sage)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Detalle de Pago y Productos
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>Medio seleccionado:</strong> {paymentSummaryLabel}
                </div>
                <div>
                  <strong>Total reservado:</strong>{' '}
                  <span style={{ color: 'var(--brand-navy)', fontWeight: 800, fontSize: '1rem' }}>
                    ${order.total.toLocaleString('es-AR')}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', marginTop: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.4rem' }}>
                    <Package size={15} />
                    <span>Productos reservados:</span>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      • {item.quantity}x {item.product.name} ({item.variationName}
                      {item.fabric ? ` / ${item.fabric}` : ''})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta de Detalles de Entrega */}
          <div
            className="glass-card"
            style={{ padding: '1.75rem', backgroundColor: '#ffffff', borderRadius: '18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Truck size={20} color="#059669" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Detalles de Entrega & Showroom
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong>Destino de entrega:</strong> {destination}
              </div>
              {isFreeShippingOrder ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 700 }}>
                  <span>Costo de flete: 100% Bonificado en San Juan ($0)</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700 }}>
                  <span>Costo de flete: A cotizar por WhatsApp según localidad</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', marginTop: '0.35rem' }}>
                <strong>Showroom Oficial:</strong> {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}.
              </div>
              <div>
                <strong>Horario de atención:</strong> {BENFLEX_CONTACT.schedule}.
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  color: 'var(--brand-navy)',
                  fontWeight: 700,
                }}
              >
                <span>Volver a la tienda BenFlex</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Cargando confirmación...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
