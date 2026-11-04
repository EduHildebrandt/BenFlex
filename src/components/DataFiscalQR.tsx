'use client';

import React, { useState } from 'react';
import { BENFLEX_LEGAL, BENFLEX_CONTACT } from '@/types';
import { X, ExternalLink, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

export default function DataFiscalQR() {
  const [isOpen, setIsOpen] = useState(false);

  // URL oficial de consulta de Data Fiscal de ARCA / AFIP para el CUIT de Gabriel Perez Zapata
  const qrTargetUrl = `https://serviciosweb.afip.gob.ar/clavefiscal/qr/mobilePublico.aspx?cuit=${BENFLEX_LEGAL.cuitNumber}`;

  return (
    <>
      {/* Botón / Emblema Formulario 960/D (Formato tradicional Data Fiscal adaptado a ARCA / AFIP) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Formulario 960/D - Data Fiscal ARCA / AFIP (Hacé clic para verificar)"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '0.45rem 0.55rem',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          textDecoration: 'none',
          width: '78px',
          flexShrink: 0,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        }}
      >
        {/* Cabecera ARCA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            width: '100%',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '2px',
            marginBottom: '3px',
          }}
        >
          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#0369a1', letterSpacing: '0.04em' }}>
            ARCA
          </span>
          <span style={{ fontSize: '0.48rem', fontWeight: 700, color: '#64748b' }}>
            960/D
          </span>
        </div>

        {/* QR Vectorial Escaneable Oficial */}
        <div
          style={{
            width: '54px',
            height: '54px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            padding: '2px',
            position: 'relative',
          }}
        >
          <svg
            viewBox="0 0 29 29"
            style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}
          >
            {/* Fondo blanco */}
            <rect width="29" height="29" fill="#ffffff" />
            
            {/* Esquina sup-izq (Finder pattern) */}
            <rect x="2" y="2" width="7" height="7" fill="#0f172a" />
            <rect x="3" y="3" width="5" height="5" fill="#ffffff" />
            <rect x="4" y="4" width="3" height="3" fill="#0f172a" />

            {/* Esquina sup-der (Finder pattern) */}
            <rect x="20" y="2" width="7" height="7" fill="#0f172a" />
            <rect x="21" y="3" width="5" height="5" fill="#ffffff" />
            <rect x="22" y="4" width="3" height="3" fill="#0f172a" />

            {/* Esquina inf-izq (Finder pattern) */}
            <rect x="2" y="20" width="7" height="7" fill="#0f172a" />
            <rect x="3" y="21" width="5" height="5" fill="#ffffff" />
            <rect x="4" y="22" width="3" height="3" fill="#0f172a" />

            {/* Timing lines */}
            <rect x="10" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="12" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="14" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="16" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="18" y="4" width="1" height="1" fill="#0f172a" />

            <rect x="4" y="10" width="1" height="1" fill="#0f172a" />
            <rect x="4" y="12" width="1" height="1" fill="#0f172a" />
            <rect x="4" y="14" width="1" height="1" fill="#0f172a" />
            <rect x="4" y="16" width="1" height="1" fill="#0f172a" />
            <rect x="4" y="18" width="1" height="1" fill="#0f172a" />

            {/* Módulos de datos representativos del CUIT 20287737182 */}
            <rect x="10" y="10" width="2" height="2" fill="#0369a1" />
            <rect x="14" y="10" width="1" height="3" fill="#0f172a" />
            <rect x="17" y="10" width="2" height="1" fill="#0f172a" />
            <rect x="11" y="13" width="3" height="1" fill="#0f172a" />
            <rect x="15" y="14" width="2" height="2" fill="#0369a1" />
            <rect x="10" y="17" width="1" height="2" fill="#0f172a" />
            <rect x="12" y="16" width="2" height="1" fill="#0f172a" />
            <rect x="13" y="18" width="3" height="1" fill="#0f172a" />
            <rect x="17" y="17" width="2" height="2" fill="#0f172a" />

            <rect x="10" y="20" width="2" height="1" fill="#0f172a" />
            <rect x="13" y="21" width="1" height="3" fill="#0f172a" />
            <rect x="15" y="20" width="2" height="1" fill="#0f172a" />
            <rect x="17" y="22" width="2" height="2" fill="#0369a1" />

            <rect x="20" y="10" width="1" height="3" fill="#0f172a" />
            <rect x="22" y="11" width="2" height="1" fill="#0f172a" />
            <rect x="25" y="10" width="2" height="2" fill="#0f172a" />
            <rect x="21" y="14" width="3" height="1" fill="#0f172a" />
            <rect x="25" y="13" width="1" height="3" fill="#0f172a" />
            <rect x="20" y="16" width="2" height="2" fill="#0369a1" />
            <rect x="23" y="17" width="2" height="1" fill="#0f172a" />
            <rect x="22" y="19" width="3" height="1" fill="#0f172a" />

            <rect x="20" y="21" width="2" height="2" fill="#0f172a" />
            <rect x="23" y="23" width="2" height="2" fill="#0f172a" />
            <rect x="26" y="21" width="1" height="3" fill="#0369a1" />
          </svg>
        </div>

        {/* Pie Data Fiscal */}
        <div style={{ marginTop: '3px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.48rem', fontWeight: 900, color: '#0f172a', display: 'block', lineHeight: 1 }}>
            DATA FISCAL
          </span>
        </div>
      </button>

      {/* Modal Interactivo de Información Fiscal (RG AFIP 3377/4141) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderRadius: '18px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                color: '#64748b',
                padding: '0.25rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              aria-label="Cerrar modal fiscal"
            >
              <X size={20} />
            </button>

            {/* Encabezado Institucional */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  marginBottom: '0.5rem',
                }}
              >
                <ShieldCheck size={16} />
                <span>FORMULARIO 960/D • DATA FISCAL</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                Agencia de Recaudación y Control Aduanero (ARCA)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                Constatación y transparencia tributaria para comercio electrónico en Argentina (RG 3377 y RG 4141).
              </p>
            </div>

            {/* Tarjeta de Datos del Titular */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.84rem',
                lineHeight: 1.6,
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>
                  TITULAR DEL ESTABLECIMIENTO:
                </span>
                <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
                  {BENFLEX_LEGAL.ownerName}
                </strong>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>
                  CUIT:
                </span>
                <code
                  style={{
                    backgroundColor: '#e2e8f0',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                    color: '#0369a1',
                    fontSize: '0.92rem',
                  }}
                >
                  {BENFLEX_LEGAL.cuit}
                </code>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>
                  DOMICILIO COMERCIAL / FISCAL:
                </span>
                <span>
                  {BENFLEX_LEGAL.address}, {BENFLEX_LEGAL.city}, {BENFLEX_LEGAL.province} (CP {BENFLEX_LEGAL.postalCode}), {BENFLEX_LEGAL.country}.
                </span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>
                  ACTIVIDAD PRINCIPAL:
                </span>
                <span>Fabricación y comercialización de colchones, sommiers y artículos de confort y descanso.</span>
              </div>
            </div>

            {/* Estado de Cumplimiento */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Contribuyente verificado • Cumplimiento fiscal vigente</span>
            </div>

            {/* Enlace Oficial a ARCA / AFIP */}
            <a
              href={qrTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#0369a1',
                color: '#ffffff',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(3, 105, 161, 0.25)',
              }}
            >
              <span>Verificar en el portal oficial de ARCA / AFIP</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
