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

            {/* Columna 3: Categorías y Navegación Rápida (solo categorías con productos) */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                Categorías de Descanso
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                {populatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link href="/#catalogo" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                      {cat.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/#quiz-descanso" style={{ transition: 'color 0.2s', display: 'inline-block' }}>
                    Descubrí tu colchón ideal (3 pasos)
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
                  <strong>Titular:</strong> {BENFLEX_LEGAL.ownerName}
                  <br />
                  <strong>CUIT:</strong> {BENFLEX_LEGAL.cuit}
                  <br />
                  {BENFLEX_LEGAL.addressDisplay}
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
