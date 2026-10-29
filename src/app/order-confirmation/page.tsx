'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { isSanJuanPostalCode } from '@/context/LocationContext';
import {
  CheckCircle,
  MessageCircle,
  Building,
  Copy,
  Check,
  Truck,
  Store,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { BENFLEX_BANK_INFO, BENFLEX_CONTACT } from '@/types';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'BF-829104';
  const { getOrderById } = useProducts();

  const order = getOrderById(orderId);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const total = order ? order.total : 493000;
  const isFreeShippingOrder =
    !order || order.deliveryMethod === 'showroom' || isSanJuanPostalCode(order.postalCode);
  const destination = order
    ? order.deliveryMethod === 'showroom'
      ? 'Retiro en Showroom Villa Krause'
      : `${order.address}, ${order.city} (CP ${order.postalCode})`
    : 'San Juan';

  // Mensaje URL encode preconfigurado solicitado (diferenciando entrega bonificada en San Juan vs cotización fuera de San Juan)
  const whatsappMessage = encodeURIComponent(
    isFreeShippingOrder
      ? `¡Hola BenFlex! Acabo de realizar el pedido #${orderId} por un total de $${total.toLocaleString('es-AR')}. Adjunto mi comprobante de transferencia para coordinar la entrega en ${destination}.`
      : `¡Hola BenFlex! Acabo de realizar el pedido #${orderId} por $${total.toLocaleString('es-AR')} (productos). Adjunto mi comprobante de transferencia y solicito cotizar el envío a ${destination}.`
  );

  const whatsappHref = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${whatsappMessage}`;

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '3.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Banner de Éxito */}
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
              backgroundColor: '#ecfdf5',
              color: '#047857',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            PEDIDO #{orderId} REGISTRADO CON ÉXITO
          </span>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              margin: '1rem 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            ¡Gracias por confiar en BenFlex!
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.75rem auto' }}>
            Ya reservamos tus productos de descanso en nuestro centro logístico de San Juan.
          </p>

          {/* BOTÓN PRINCIPAL DESTACADO DE WHATSAPP CON COMPROBANTE */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '2px dashed #86efac',
              borderRadius: '18px',
              padding: '1.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
              Paso final: Envío de Comprobante de Transferencia
            </div>
            <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Hacé clic en el siguiente botón para abrir WhatsApp con los datos de tu pedido ya cargados y adjuntar tu comprobante de transferencia:
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
                fontSize: '1.05rem',
                boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
                textDecoration: 'none',
                width: '100%',
                maxWidth: '480px',
                transition: 'transform 0.15s ease',
              }}
            >
              <MessageCircle size={22} />
              <span>Enviar comprobante y coordinar envío por WhatsApp</span>
            </a>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Un asesor de nuestro showroom en Villa Krause verificará la acreditación y te confirmará la fecha de entrega.
          </div>
        </div>

        {/* Datos Bancarios y Resumen */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Tarjeta de Datos Bancarios */}
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
