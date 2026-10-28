'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  CreditCard,
  MessageCircle,
  Store,
  ExternalLink,
} from 'lucide-react';
import { BENFLEX_CONTACT, BENFLEX_BANK_INFO } from '@/types';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
    'Hola BenFlex, quisiera hacer una consulta sobre el showroom en San Juan y opciones de retiro.'
  )}`;

  return (
    <footer
      id="showroom"
      style={{
        backgroundColor: '#0a101d',
        color: '#f8fafc',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto',
      }}
    >
      {/* 1. Value Props Strip */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0f172a',
          padding: '2rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(45, 90, 63, 0.25)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Flete 100% Bonificado</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Ahorrás el 10% de flete en todos tus pedidos
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CreditCard size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>15% OFF Transferencia</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  O hasta 12 cuotas fijas con todas las tarjetas
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  color: '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Garantía Oficial 5 Años</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Directa de fábrica y servicio posventa BenFlex
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(37, 211, 102, 0.2)',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Store size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Showroom en San Juan</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Retiro gratis en Villa Krause en el día
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body with Showroom Details & Map */}
      <div style={{ padding: '3.5rem 0 2.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {/* Columna 1: Identidad y Showroom Principal */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '2px',
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="BenFlex Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  BenFlex
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Especialistas en descanso ergonómico, salud postural y confort de alta gama. Colchones, sommiers, sofás cama y almohadas inteligentes diseñadas para transformar tus noches.
              </p>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#86efac',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Store size={18} />
                  <span>Nuestro Showroom Oficial</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>Dirección:</strong> {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}.
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="#94a3b8" />
                  <span>{BENFLEX_CONTACT.schedule}</span>
                </div>
                <div
                  style={{
                    marginTop: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(45, 90, 63, 0.3)',
                    color: '#86efac',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ Opción de Retiro Gratis en Sucursal
                </div>
              </div>
            </div>

            {/* Columna 2: Mapa y Ubicación Interactiva */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#4ade80" />
                Ubicación en Villa Krause
              </h4>
              <div
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#1e293b',
                  height: '190px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 100%)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    Showroom Central BenFlex
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.65rem' }}>
                    Castaño Oeste y Conector Sur • Fácil estacionamiento
                  </div>
                  <a
                    href={BENFLEX_CONTACT.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Columna 3: Categorías y Navegación Rápida */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                Categorías de Descanso
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                <li>
                  <Link href="/#colchones-sommiers" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Colchones & Sommiers Ortopédicos
                  </Link>
                </li>
                <li>
                  <Link href="/#colchones-sommiers" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Resortes Pocket Ensacados Parejas
                  </Link>
                </li>
                <li>
                  <Link href="/#sillones-sofas" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Sillones & Sofás Cama Anti-Desgarro
                  </Link>
                </li>
                <li>
                  <Link href="/#almohadas-confort" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Almohadas Viscoelásticas y Cervicales
                  </Link>
                </li>
                <li>
                  <Link href="/#combos-benflex" style={{ transition: 'color 0.2s', display: 'inline-block', color: '#86efac' }}>
                    Combos BenFlex con Almohadas de Regalo
                  </Link>
                </li>
                <li>
                  <Link href="/#quiz-descanso" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Quiz: Test del Colchón Ideal (3 pasos)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto Directo & Datos Fiscales */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                Atención y Contacto
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#25D366',
                    fontWeight: 600,
                  }}
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp: {BENFLEX_CONTACT.phoneDisplay}</span>
                </a>
                <a
                  href="https://www.instagram.com/benflex_fabrica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: '#ffffff',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    width: 'fit-content',
                  }}
                >
                  <span>📸 Seguinos en @benflex_fabrica</span>
                  <ExternalLink size={13} />
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} />
                  <span>{BENFLEX_CONTACT.email}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, marginTop: '0.5rem' }}>
                  <strong>Razón Social:</strong> {BENFLEX_BANK_INFO.holder}
                  <br />
                  <strong>CUIT:</strong> {BENFLEX_BANK_INFO.cuit}
                  <br />
                  San Juan, República Argentina.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar: Copyright & Payment Badges */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#070b14',
          padding: '1.25rem 0',
          fontSize: '0.78rem',
          color: '#64748b',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div
            onDoubleClick={() => {
              window.location.href = '/admin';
            }}
            style={{ userSelect: 'none' }}
          >
            © {new Date().getFullYear()} BenFlex - Confort y Descanso. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Medios Aceptados:
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#93c5fd', fontWeight: 600 }}>
              Mercado Pago
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#86efac', fontWeight: 600 }}>
              Transferencia 15% OFF
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#e2e8f0' }}>
              Tarjetas Crédito / Débito
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
