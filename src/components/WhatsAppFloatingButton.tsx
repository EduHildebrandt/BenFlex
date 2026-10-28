'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { BENFLEX_CONTACT } from '@/types';

export default function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMsg = encodeURIComponent(
    '¡Hola Benflex! Estoy viendo su tienda online y quisiera asesoramiento sobre colchones, medidas y opciones de descanso en su showroom de San Juan.'
  );

  const whatsappHref = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${defaultMsg}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Tooltip interactivo de atención humana */}
      {showTooltip && (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '0.75rem 1rem',
            maxWidth: '240px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderRadius: '14px',
            position: 'relative',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              color: 'var(--text-light)',
              padding: '2px',
            }}
            aria-label="Cerrar sugerencia"
          >
            <X size={14} />
          </button>
          <div style={{ fontWeight: 700, color: 'var(--brand-sage)', marginBottom: '2px' }}>
            ¿Dudas con tu colchón o medidas?
          </div>
          <div>Atención personalizada con un asesor de Benflex San Juan.</div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#25D366',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
          fontWeight: 700,
          fontSize: '0.92rem',
          transition: 'all 0.25s ease',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <MessageCircle size={22} fill="#ffffff" color="#25D366" />
        <span style={{ whiteSpace: 'nowrap' }}>Asesor Benflex</span>
      </a>
    </div>
  );
}
