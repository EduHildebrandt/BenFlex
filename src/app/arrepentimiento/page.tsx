'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BENFLEX_LEGAL, BENFLEX_CONTACT } from '@/types';
import {
  Undo2,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
  Clock,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export default function ArrepentimientoPage() {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(10);
  const [canRevoke, setCanRevoke] = useState<boolean>(true);
  const [revocationSuccess, setRevocationSuccess] = useState<{
    revocationCode: string;
    orderId: string;
    total: number;
    customerName: string;
  } | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearchedOrder(null);
    setRevocationSuccess(null);

    if (!orderId.trim()) {
      setErrorMsg('Por favor ingresá tu número de pedido (ej: BF-XXXX).');
      return;
    }
    if (!contact.trim()) {
      setErrorMsg('Por favor ingresá el email o teléfono registrado en tu compra.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup',
          orderId: orderId.trim(),
          contact: contact.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No pudimos encontrar el pedido con los datos provistos.');
        return;
      }
      setSearchedOrder(data.order);
      setDaysRemaining(data.daysRemaining ?? 10);
      setCanRevoke(Boolean(data.canRevoke));
    } catch {
      setErrorMsg('Error de red al consultar tu pedido. Por favor intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!searchedOrder) return;
    const confirmed = window.confirm(
      `¿Confirmás la revocación y arrepentimiento de la compra #${searchedOrder.id}?\n\nDe acuerdo a la Ley 24.240, se anulará la orden y coordinaremos la devolución total de tus $${searchedOrder.total.toLocaleString(
        'es-AR'
      )} sin costo de retiro.`
    );
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke',
          orderId: searchedOrder.id,
          contact: contact.trim(),
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No se pudo registrar la revocación.');
        return;
      }
      setRevocationSuccess({
        revocationCode: data.revocationCode,
        orderId: data.order.id,
        total: data.order.total,
        customerName: data.order.customerName,
      });
      setSearchedOrder(null);
    } catch {
      setErrorMsg('Error de conexión al procesar la revocación.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrderId('');
    setContact('');
    setReason('');
    setErrorMsg('');
    setSearchedOrder(null);
    setRevocationSuccess(null);
  };

  return (
    <div style={{ backgroundColor: '#fafaf9', minHeight: '85vh', padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </Link>

        <div
          className="glass-card animate-fade-in"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            padding: '2.5rem 2rem',
            boxShadow: '0 20px 45px rgba(17, 24, 39, 0.08)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '0.65rem',
              }}
            >
              <Undo2 size={15} />
              <span>RESOLUCIÓN 424/2020 • SECRETARÍA DE COMERCIO</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              Botón de Arrepentimiento
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.6 }}>
              En compras online, el consumidor tiene derecho a revocar la aceptación durante el plazo de <strong>10 días corridos</strong> contados a partir de la entrega del bien o de la celebración del contrato (Art. 34, Ley 24.240). El trámite no tiene ningún costo y los gastos de retiro son a cargo de BenFlex.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {revocationSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#166534', marginBottom: '0.5rem' }}>
                ¡Revocación Registrada Exitosamente!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Hola <strong>{revocationSuccess.customerName}</strong>, tu solicitud de arrepentimiento para el pedido #{revocationSuccess.orderId} fue procesada conforme al régimen legal vigente.
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #0284c7',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Código Oficial de Identificación del Trámite (Res. 424/2020):
                </span>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: '#0369a1',
                    letterSpacing: '0.05em',
                    marginTop: '0.35rem',
                  }}
                >
                  {revocationSuccess.revocationCode}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Total a reintegrar: <strong>${revocationSuccess.total.toLocaleString('es-AR')}</strong> (sin cargo de devolución)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <a
                  href={`https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
                    `¡Hola BenFlex! Acabo de registrar el Derecho de Arrepentimiento para mi compra #${revocationSuccess.orderId} con código de trámite ${revocationSuccess.revocationCode}. Quisiera coordinar el reintegro y retiro del producto.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '0.95rem 1.4rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Notificar por WhatsApp con mi Código</span>
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Consultar otro pedido
                </button>
              </div>
            </div>
          ) : searchedOrder ? (
            <div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>NÚMERO DE PEDIDO:</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
                      #{searchedOrder.id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: searchedOrder.status === 'CANCELADO' ? '#fee2e2' : '#e0f2fe',
                        color: searchedOrder.status === 'CANCELADO' ? '#991b1b' : '#0369a1',
                      }}
                    >
                      {searchedOrder.status}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                      Fecha: {new Date(searchedOrder.date).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                    PRODUCTOS COMPRADOS:
                  </span>
                  {searchedOrder.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.82rem',
                        color: '#1e293b',
                        padding: '0.35rem 0',
                        borderBottom: '1px dashed #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        <strong>{item.quantity}x</strong> {item.name} ({item.variationName})
                      </span>
                      <span style={{ fontWeight: 700 }}>${item.subtotal.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Total de la compra:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-sage)' }}>
                    ${searchedOrder.total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: canRevoke ? '#fef3c7' : '#f1f5f9',
                  border: canRevoke ? '1px solid #fde68a' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: canRevoke ? '#92400e' : '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  <Clock size={16} />
                  <span>
                    {canRevoke
                      ? `Plazo legal de arrepentimiento activo (${daysRemaining} días restantes)`
                      : 'Plazo legal o estado finalizado'}
                  </span>
                </div>
                <span>
                  {canRevoke
                    ? 'Podés solicitar la revocación total sin costo. Te devolveremos el 100% del dinero y coordinaremos el retiro sin cargo.'
                    : `Este pedido ya se encuentra ${searchedOrder.status.toLowerCase()}. Para consultas de garantía oficial de fábrica, contactanos.`}
                </span>
              </div>

              {canRevoke ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#475569' }}>
                      Motivo o Comentario (Opcional - La ley no exige motivo):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Prefiero otra medida, no era lo que esperaba..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmRevoke}
                    disabled={loading}
                    style={{
                      backgroundColor: '#e11d48',
                      color: '#ffffff',
                      padding: '0.95rem 1.4rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Procesando revocación...' : 'Confirmar Arrepentimiento de Compra'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchedOrder(null)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      padding: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    ← Volver a buscar otro pedido
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchedOrder(null)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Volver
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e293b' }}>
                  Número de Pedido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BF-8F2A o BF-DEMO-01"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                  Lo encontrás en tu comprobante de compra o en el mensaje de WhatsApp.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e293b' }}>
                  Email o Teléfono Registrado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: tuemail@gmail.com o 2645439821"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--brand-navy)',
                  color: '#ffffff',
                  padding: '0.95rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Search size={16} />
                <span>{loading ? 'Consultando pedido...' : 'Consultar Pedido y Gestionar Arrepentimiento'}</span>
              </button>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.76rem',
                  color: '#64748b',
                  lineHeight: 1.5,
                  marginTop: '0.5rem',
                }}
              >
                <strong>Titular del establecimiento:</strong> {BENFLEX_LEGAL.ownerName} (CUIT {BENFLEX_LEGAL.cuit}) • {BENFLEX_LEGAL.address}, {BENFLEX_LEGAL.city}, {BENFLEX_LEGAL.province}.
                <br />
                <strong>Defensa del Consumidor:</strong> Dirección Nacional de Defensa del Consumidor (Ley 24.240).
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
