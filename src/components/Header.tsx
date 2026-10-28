'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useProducts } from '@/context/ProductContext';
import {
  ShoppingBag,
  MapPin,
  Search,
  X,
  Sparkles,
  Menu,
  Store,
} from 'lucide-react';

export default function Header() {
  const { cartCount, setCartOpen } = useCart();
  const { location, setModalOpen } = useLocation();
  const { products } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.technologyLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* 1. Top Announcement Bar */}
      <div
        style={{
          backgroundColor: 'var(--brand-navy)',
          color: '#ffffff',
          fontSize: '0.78rem',
          padding: '0.45rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <span
              style={{
                backgroundColor: 'var(--brand-sage)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.03em',
              }}
            >
              SHOWROOM SAN JUAN
            </span>
            <Link
              href="/contacto"
              style={{ opacity: 0.92, whiteSpace: 'nowrap', textOverflow: 'ellipsis', textDecoration: 'underline' }}
            >
              Castaño Oeste y Conector Sur, Villa Krause • Retiro gratis
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#86efac' }}>
              <Sparkles size={13} />
              <span>15% OFF pagando con Transferencia</span>
            </div>
            <span style={{ color: '#475569' }}>|</span>
            <a
              href="https://www.instagram.com/benflex_fabrica/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#f472b6',
                fontWeight: 700,
              }}
            >
              <span>IG @benflex_fabrica</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className="glass"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderBottom: '1px solid #e4e4e7',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Logo Oficial B'enFlex & Mobile Menu Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.35rem',
                color: 'var(--text-primary)',
              }}
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  padding: '2px',
                }}
              >
                <img
                  src="/logo.png"
                  alt="B'enFlex Fábrica"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    letterSpacing: '-0.03em',
                    color: '#111827',
                    lineHeight: 1,
                    borderBottom: '3px solid #111827',
                    paddingBottom: '1px',
                  }}
                >
                  B&apos;enFlex
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--brand-sage)',
                    textTransform: 'uppercase',
                    marginTop: '3px',
                  }}
                >
                  Fábrica & Showroom
                </span>
              </div>
            </Link>
          </div>

          {/* Postal Code Location Selector */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s',
            }}
            title="Cambiar código postal o localidad"
          >
            <MapPin size={16} color="var(--brand-sage)" />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Enviar a</div>
              <div style={{ fontWeight: 700 }}>
                {location.city} ({location.postalCode})
              </div>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                marginLeft: '0.25rem',
              }}
            >
              Flete $0
            </span>
          </button>

          {/* Predictive Search Bar (Always accessible) */}
          <div
            ref={searchRef}
            style={{
              flex: '1 1 260px',
              maxWidth: '440px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '9999px',
                padding: '0.45rem 1rem',
                gap: '0.5rem',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar colchones, sommiers, sofás, sábanas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  backgroundColor: 'transparent',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ color: 'var(--text-muted)', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Predictive Results Dropdown */}
            {isSearching && searchQuery.trim().length > 0 && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '112%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
                  borderRadius: '16px',
                  padding: '0.75rem',
                  zIndex: 200,
                  maxHeight: '380px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No encontramos productos que coincidan con &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {searchResults.length} Resultados encontrados
                    </div>
                    {searchResults.map((product) => {
                      const transferPrice = Math.round(product.basePrice * 0.85);
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setIsSearching(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '10px',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {product.categoryLabel} • {product.measure}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                              ${transferPrice.toLocaleString('es-AR')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              15% OFF Transf.
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons: Showroom Link + Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Link
              href="/contacto"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--brand-navy)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Store size={16} color="var(--brand-sage)" />
              <span>Showroom</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'var(--brand-navy)',
                color: '#ffffff',
                padding: '0.6rem 1.15rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              aria-label="Ver carrito"
            >
              <div style={{ position: 'relative', display: 'flex' }}>
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-9px',
                      backgroundColor: 'var(--cta-green)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      border: '2px solid #ffffff',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Carrito</span>
            </button>
          </div>
        </div>

        {/* 3. Category Bar */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.75rem',
              padding: '0.5rem 0',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <Link
              href="/#catalogo"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                padding: '0.3rem 0.4rem',
              }}
            >
              Colchones & Sommiers
            </Link>
            <Link
              href="/#catalogo"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                padding: '0.3rem 0.4rem',
              }}
            >
              Sillones & Sofás Cama
            </Link>
            <Link
              href="/#catalogo"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                padding: '0.3rem 0.4rem',
              }}
            >
              Almohadas & Ropa de Cama
            </Link>
            <Link
              href="/#catalogo"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--brand-sage)',
                padding: '0.3rem 0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={14} />
              Combos Benflex (Regalo)
            </Link>
            <Link
              href="/#quiz-descanso"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                padding: '0.3rem 0.4rem',
              }}
            >
              🎯 Quiz Colchón Ideal
            </Link>
            <Link
              href="/contacto"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                padding: '0.3rem 0.4rem',
              }}
            >
              📍 Showroom Villa Krause
            </Link>
          </div>
        </div>

        {/* 4. Mobile Expandable Menu */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              padding: '1rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 700, fontSize: '0.95rem', padding: '0.4rem 0' }}
            >
              Inicio y Ofertas
            </Link>
            <Link
              href="/#quiz-descanso"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--brand-sage)', padding: '0.4rem 0' }}
            >
              🎯 Test: Descubrí tu Colchón Ideal en 3 preguntas
            </Link>
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.92rem', padding: '0.4rem 0' }}
            >
              Catálogo Completo (Colchones, Sillones y Almohadas)
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.92rem', padding: '0.4rem 0' }}
            >
              📍 Nuestro Showroom en Villa Krause, San Juan
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.4rem 0' }}
            >
              Panel de Gestión Benflex
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
