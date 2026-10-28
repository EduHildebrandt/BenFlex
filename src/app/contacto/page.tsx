'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Store,
  MessageCircle,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Send,
  Sparkles,
} from 'lucide-react';
import { BENFLEX_CONTACT, BENFLEX_BANK_INFO } from '@/types';

export default function ContactoShowroomPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'Consulta sobre Colchones & Medidas',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;
    setSent(true);
  };

  const whatsappDirectUrl = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
    `¡Hola BenFlex! Mi nombre es ${formData.name || 'Cliente'}. Me contacto desde la web por: ${formData.subject}. ${formData.message}`
  )}`;

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '2.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Hero de Contacto y Showroom */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-sage-light)',
              color: 'var(--brand-sage)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
              border: '1px solid rgba(45, 90, 63, 0.2)',
            }}
          >
            <Store size={15} />
            <span>Atención Presencial y Digital en San Juan</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            Nuestro Showroom en Villa Krause
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Te esperamos en <strong>{BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}</strong> para que pruebes en persona cada nivel de firmeza, telas anti-desgarro y tecnología de descanso.
          </p>
        </div>

        {/* Bloque Destacado: Retiro Gratis en Sucursal */}
        <div
          className="glass-card"
          style={{
            padding: '1.75rem 2rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '20px',
            marginBottom: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
                Opción Disponible: Retiro gratis en sucursal (Villa Krause, San Juan)
              </div>
              <p style={{ fontSize: '0.88rem', color: '#047857', marginTop: '0.2rem' }}>
                Comprá online aprovechando el <strong>15% OFF por transferencia</strong> y retirá tu pedido sin costo en nuestro showroom con estacionamiento exclusivo y asistencia de carga.
              </p>
            </div>
          </div>

          <Link
            href="/#catalogo"
            style={{
              backgroundColor: '#065f46',
              color: '#ffffff',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            Elegir Productos para Retirar
          </Link>
        </div>

        {/* Grilla Principal: Datos + Mapa Integrado y Formulario */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Columna 1: Información del Local + Mapa Integrado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                Puntos de Contacto y Horarios
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-sage-light)',
                      color: 'var(--brand-sage)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Ubicación del Showroom Oficial
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province} (CP {BENFLEX_CONTACT.postalCode})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand-sage)', fontWeight: 600, marginTop: '4px' }}>
                      Acceso directo por Conector Sur a 5 min del centro de San Juan
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-sage-light)',
                      color: 'var(--brand-sage)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Horarios de Atención
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {BENFLEX_CONTACT.schedule}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Asesoramiento personalizado sin turno previo
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(37, 211, 102, 0.15)',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      WhatsApp Directo Showroom
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {BENFLEX_CONTACT.phoneDisplay}
                    </div>
                    <a
                      href={`https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
                        '¡Hola BenFlex! Quisiera hacer una consulta a un asesor del Showroom de Villa Krause.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#15803d',
                        marginTop: '4px',
                      }}
                    >
                      <span>Iniciar conversación ahora</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Mapa Integrado de Villa Krause, San Juan */}
              <div style={{ marginTop: '1.75rem' }}>
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    height: '280px',
                    position: 'relative',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  <iframe
                    title="Mapa Showroom BenFlex Villa Krause San Juan"
                    src="https://www.google.com/maps?q=Casta%C3%B1o+Oeste+y+Conector+Sur,+Villa+Krause,+San+Juan,+Argentina&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📍 Castaño Oeste y Conector Sur, Villa Krause
                  </span>
                  <a
                    href={BENFLEX_CONTACT.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--brand-sage)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Cómo llegar en Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Formulario de Asesoramiento Postural y Presupuestos */}
          <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Escribinos o pedí asesoramiento
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              ¿Tenés dudas sobre qué densidad elegir, medidas especiales o telas anti-desgarro? Completá tus datos y un especialista de nuestro local en San Juan te responderá al instante.
            </p>

            {sent ? (
              <div
                className="animate-fade-in"
                style={{
                  padding: '2rem 1.5rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
                  ¡Consulta registrada con éxito!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#15803d', marginBottom: '1.25rem' }}>
                  Si querés recibir respuesta inmediata en tu celular, podés enviarnos este mismo mensaje directo a nuestro WhatsApp de Villa Krause:
                </p>
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '0.9rem 1.6rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={20} />
                  <span>Continuar en WhatsApp Ahora</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Tu Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Giménez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 264 512-3456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Motivo de tu consulta
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.92rem',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    <option value="Consulta sobre Colchones & Medidas">Consulta sobre Colchones & Medidas</option>
                    <option value="Sillones y Telas Anti-Desgarro">Sillones y Telas Anti-Desgarro</option>
                    <option value="Retiro Gratis en Showroom Villa Krause">Retiro Gratis en Showroom Villa Krause</option>
                    <option value="Pago por Transferencia 15% OFF">Pago por Transferencia 15% OFF</option>
                    <option value="Ventas Mayoristas / Hotelería San Juan">Ventas Mayoristas / Hotelería San Juan</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Tu Mensaje *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contanos qué medida o producto estás buscando..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.92rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--brand-sage)',
                    color: '#ffffff',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 6px 20px rgba(45, 90, 63, 0.3)',
                  }}
                >
                  <Send size={18} />
                  <span>Enviar Consulta al Showroom</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
