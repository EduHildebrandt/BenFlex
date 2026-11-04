'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import {
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  Truck,
  CreditCard,
  MessageCircle,
  Store,
  ExternalLink,
  Undo2,
  FileText,
  Lock,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BENFLEX_CONTACT, BENFLEX_BANK_INFO, BENFLEX_LEGAL } from '@/types';
import DataFiscalQR from './DataFiscalQR';
import ArrepentimientoModal from './ArrepentimientoModal';
import LegalModal, { LegalModalType } from './LegalModals';

export default function Footer() {
  const { products } = useProducts();
  const [isArrepentimientoOpen, setIsArrepentimientoOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [isLegalExpanded, setIsLegalExpanded] = useState(false);
  const populatedCategories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    products.forEach((p) => {
      if (!p.category) return;
      const existing = map.get(p.category);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.category, {
          id: p.category,
          label: p.categoryLabel || p.category,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [products]);

  const whatsappUrl = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
    'Hola BenFlex, quisiera hacer una consulta sobre el showroom en San Juan y opciones de envío o retiro.'
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
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Envío Gratis en San Juan</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Bonificado en todo San Juan • Resto del país a cotizar
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

      {/* 2. Main Footer Body: 4-Column Balanced & Elegant Grid */}
      <style>{`
        .footer-grid-container {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr 1.35fr 1.15fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 1080px) {
          .footer-grid-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.25rem;
          }
        }
        @media (max-width: 640px) {
          .footer-grid-container {
            grid-template-columns: 1fr;
            gap: 2.25rem;
          }
        }
      `}</style>

      <div style={{ padding: '3.5rem 0 3rem 0' }}>
        <div className="container">
          <div className="footer-grid-container">

            {/* Columna 1: Marca BenFlex & Filosofía de Descanso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '2px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="BenFlex Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.1 }}>
                    BenFlex
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Fábrica de Descanso • San Juan
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                Especialistas en descanso ergonómico, salud postural y confort de alta gama. Colchones, sommiers, sofás cama y almohadas inteligentes diseñadas para transformar tus noches.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '10px',
                  fontSize: '0.76rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>Garantía Oficial de Fábrica hasta 5 años</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontWeight: 600 }}>
                  <Truck size={16} />
                  <span>Envíos bonificados en Gran San Juan</span>
                </div>
              </div>
            </div>

            {/* Columna 2: Categorías de Descanso */}
            <div>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                Categorías
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.88rem',
                  color: '#94a3b8',
                  padding: 0,
                  margin: 0,
                }}
              >
                {populatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href="/#catalogo"
                      style={{
                        transition: 'color 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                    >
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>›</span>
                      <span>{cat.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/#quiz-descanso"
                    style={{
                      transition: 'color 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#7dd3fc')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#38bdf8')}
                  >
                    <span style={{ fontSize: '0.8rem' }}>★</span>
                    <span>Colchón Ideal (Test)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Showroom & Retiro en San Juan (Tarjeta Unificada Elegante) */}
            <div>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                <MapPin size={17} color="#4ade80" />
                <span>Showroom & Retiro</span>
              </h4>

              <div
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Visual del Mapa */}
                <div
                  style={{
                    height: '115px',
                    position: 'relative',
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
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.35) 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.65rem',
                      left: '0.85rem',
                      right: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      Villa Krause, San Juan
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Fábrica Oficial
                    </span>
                  </div>
                </div>

                {/* Info Showroom */}
                <div
                  style={{
                    padding: '0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                  }}
                >
                  <div>
                    <strong style={{ color: '#ffffff' }}>Dirección:</strong> {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.76rem' }}>
                    <Clock size={13} color="#94a3b8" />
                    <span>{BENFLEX_CONTACT.schedule}</span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      color: '#86efac',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      width: 'fit-content',
                    }}
                  >
                    ✓ Opción Retiro Gratis en el Día
                  </div>

                  <a
                    href={BENFLEX_CONTACT.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: '0.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '7px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Columna 4: Atención & Contacto Directo */}
            <div>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                <MessageCircle size={17} color="#25D366" />
                <span>Atención y Contacto</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Botón WhatsApp Asesor Directo */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    backgroundColor: 'rgba(37, 211, 102, 0.12)',
                    border: '1px solid rgba(37, 211, 102, 0.35)',
                    color: '#ffffff',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '9px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Asesor Comercial
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      {BENFLEX_CONTACT.phoneDisplay}
                    </span>
                  </div>
                </a>

                {/* Instagram Oficial */}
                <a
                  href="https://www.instagram.com/benflex_fabrica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem' }}>📸</span>
                    <span>@benflex_fabrica</span>
                  </span>
                  <ExternalLink size={12} color="#94a3b8" />
                </a>

                {/* Email de Soporte */}
                <a
                  href={`mailto:${BENFLEX_CONTACT.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#cbd5e1',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    padding: '0.2rem 0',
                  }}
                >
                  <Mail size={15} color="#94a3b8" />
                  <span>{BENFLEX_CONTACT.email}</span>
                </a>

                <div
                  style={{
                    fontSize: '0.73rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '0.5rem',
                    marginTop: '0.2rem',
                  }}
                >
                  Atención online y asesoramiento postural:
                  <br />
                  <strong style={{ color: '#94a3b8' }}>Lunes a Sábado de 09:00 a 21:00 hs</strong>
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

      {/* 4. Bloque Legal Desplegable (Legislación de Comercio Electrónico Argentina) */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#050811',
          transition: 'all 0.25s ease',
        }}
      >
        <div className="container">
          {/* Barra disparadora del desplegable */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.85rem 0',
            }}
          >
            <button
              type="button"
              onClick={() => setIsLegalExpanded((prev) => !prev)}
              aria-expanded={isLegalExpanded}
              aria-controls="footer-legal-dropdown"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontSize: '0.78rem',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                }}
              >
                <Scale size={14} />
              </span>
              <span>Información Legal, Data Fiscal (ARCA / AFIP) y Defensa del Consumidor</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLegalExpanded ? 'Ocultar' : 'Ver detalle y QR'}
                {isLegalExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </span>
            </button>

            {/* Acceso directo permanente a Botón de Arrepentimiento obligatorio (Res. 424/2020 SCI) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setIsArrepentimientoOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Ejercer el Derecho de Arrepentimiento o consultar pedido previo"
              >
                <Undo2 size={13} />
                <span>Botón de Arrepentimiento</span>
              </button>
            </div>
          </div>

          {/* Contenido Desplegable hacia abajo */}
          {isLegalExpanded && (
            <div
              id="footer-legal-dropdown"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1.5rem 0 2rem',
                fontSize: '0.72rem',
                color: '#64748b',
                lineHeight: '1.55',
                animation: 'fadeIn 0.2s ease-in-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '1.75rem',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                {/* Formulario 960/D Data Fiscal ARCA / AFIP interactivo */}
                <div style={{ flexShrink: 0 }}>
                  <DataFiscalQR />
                </div>

                {/* Texto Legal Normativo */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                    <strong style={{ color: '#cbd5e1' }}>Titular del Sitio:</strong> {BENFLEX_LEGAL.ownerName} &nbsp;|&nbsp;{' '}
                    <strong style={{ color: '#cbd5e1' }}>CUIT:</strong> {BENFLEX_LEGAL.cuit} &nbsp;|&nbsp;{' '}
                    <strong style={{ color: '#cbd5e1' }}>Domicilio Comercial:</strong> {BENFLEX_LEGAL.addressDisplay}.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Derecho de Arrepentimiento (Ley 24.240 y Res. 424/2020 SCI):</strong> En las contrataciones a distancia y compras online, el consumidor tiene derecho a revocar la aceptación dentro del plazo de 10 (diez) días corridos computados a partir de la recepción del producto, sin costo alguno ni expresión de causa. Los gastos de devolución corren por cuenta del vendedor.
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Garantía Legal y de Fábrica (Ley 24.240, art. 11):</strong> Todos los productos nuevos cuentan con una garantía legal mínima de seis (6) meses. BenFlex otorga además garantía extendida escrita directa de fábrica de hasta 3 y 5 años según línea de producto.
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Trato Digno e Información Clara (Ley 24.240, arts. 4 y 8 bis):</strong> Proveemos información veraz, transparente y detallada en idioma nacional sobre características de productos, costos de envío y plazos de entrega, con trato digno y no discriminatorio.
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Protección de Datos Personales (Ley 25.326):</strong> Los datos recabados son tratados conforme a la Ley de Protección de los Datos Personales. El titular tiene derecho al acceso, rectificación y supresión de sus datos personales.
                    </div>
                  </div>

                  {/* Barra de Acciones y Enlaces Legales */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      flexWrap: 'wrap',
                      marginTop: '0.5rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('terminos')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Términos y Condiciones
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('privacidad')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Política de Privacidad
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('garantia')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Garantía BenFlex
                    </button>

                    <a
                      href={BENFLEX_LEGAL.consumidorGovUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#60a5fa',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Defensa del Consumidor</span>
                      <ExternalLink size={10} />
                    </a>

                    <a
                      href={BENFLEX_LEGAL.defensaConsumidorSanJuanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#60a5fa',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Defensa del Consumidor San Juan</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales Legales y de Arrepentimiento */}
      <ArrepentimientoModal
        isOpen={isArrepentimientoOpen}
        onClose={() => setIsArrepentimientoOpen(false)}
      />
      <LegalModal
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </footer>
  );
}
