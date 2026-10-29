'use client';

import React, { useState, useEffect } from 'react';
import { useLocation, resolvePostalCode } from '@/context/LocationContext';
import { MapPin, X, Check, Truck, Store, MessageCircle } from 'lucide-react';
import { BENFLEX_CONTACT } from '@/types';

export default function LocationModal() {
  const { location, updateByPostalCode, isModalOpen, setModalOpen } = useLocation();
  const [inputCp, setInputCp] = useState(location.postalCode);

  useEffect(() => {
    setInputCp(location.postalCode);
  }, [location.postalCode, isModalOpen]);

  if (!isModalOpen) return null;

  const previewLoc = resolvePostalCode(inputCp || location.postalCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCp.trim()) {
      updateByPostalCode(inputCp);
      setModalOpen(false);
    }
  };

  const selectQuickLocation = (cp: string) => {
    setInputCp(cp);
    updateByPostalCode(cp);
    setModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={() => setModalOpen(false)}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setModalOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-sage)',
            }}
          >
            <MapPin size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ¿A dónde enviamos tu compra?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Ingresá tu Código Postal para ver la modalidad de envío en tu zona
            </p>
          </div>
        </div>

        {/* Estado dinámico según si el CP es de San Juan o fuera de San Juan */}
        {previewLoc.isSanJuan ? (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1rem 0 1.25rem 0',
            }}
          >
            <Truck size={20} style={{ color: '#059669', flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: '#065f46' }}>
              <span style={{ fontWeight: 700 }}>¡Zona San Juan ({previewLoc.city})!</span> Contás con{' '}
              <strong>¡Flete 100% Bonificado sin cargo!</strong>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1rem 0 1.25rem 0',
            }}
          >
            <MessageCircle size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: '#0c4a6e' }}>
              <span style={{ fontWeight: 700 }}>Envío fuera de San Juan ({previewLoc.city}):</span> Los envíos bonificados aplican dentro de San Juan. Para tu localidad, <strong>cotizamos el flete a medida</strong> según transporte.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="Ingresá tu Código Postal (ej: 5425)"
            value={inputCp}
            onChange={(e) => setInputCp(e.target.value)}
            maxLength={8}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: 'var(--brand-navy)',
              color: '#ffffff',
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Guardar
          </button>
        </form>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Zonas frecuentes:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => selectQuickLocation('5425')}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                backgroundColor: location.postalCode === '5425' ? '#ecfdf5' : '#f8fafc',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>⭐ Villa Krause (Gratis)</span>
              {location.postalCode === '5425' && <Check size={14} color="#059669" />}
            </button>

            <button
              type="button"
              onClick={() => selectQuickLocation('5400')}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                backgroundColor: location.postalCode === '5400' ? '#ecfdf5' : '#f8fafc',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>San Juan Cap. (Gratis)</span>
              {location.postalCode === '5400' && <Check size={14} color="#059669" />}
            </button>

            <button
              type="button"
              onClick={() => selectQuickLocation('5500')}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: location.postalCode === '5500' ? 'var(--bg-sage-light)' : '#f8fafc',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Mendoza (A cotizar)</span>
              {location.postalCode === '5500' && <Check size={14} color="var(--brand-sage)" />}
            </button>

            <button
              type="button"
              onClick={() => selectQuickLocation('1000')}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: location.postalCode === '1000' ? 'var(--bg-sage-light)' : '#f8fafc',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>CABA / Bs As (A cotizar)</span>
              {location.postalCode === '1000' && <Check size={14} color="var(--brand-sage)" />}
            </button>
          </div>
        </div>

        {/* Retiro en Showroom */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Store size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
          <div>
            <strong>Retiro Gratis en Showroom:</strong> {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}.
          </div>
        </div>
      </div>
    </div>
  );
}
