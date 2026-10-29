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

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Contraer barra automáticamente al iniciar la navegación (scroll)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => (y > 24 ? true : y < 8 ? false : prev));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar buscador o menú con clic afuera o tecla Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.technologyLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  return (
    <>
      {/* Micro-barra superior NO fija: desaparece naturalmente al empezar a hacer scroll */}
      <div className="bf-topbar">
        <div className="container bf-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac', fontWeight: 600 }}>
            <Sparkles size={12} />
            <span>15% OFF Transferencia • Flete Bonificado en San Juan</span>
          </div>

          <div className="bf-desktop-only" style={{ alignItems: 'center', gap: '0.85rem', opacity: 0.9 }}>
            <Link href="/contacto" style={{ textDecoration: 'underline' }}>
              Showroom Villa Krause, San Juan (Retiro gratis)
            </Link>
            <span style={{ opacity: 0.35 }}>|</span>
            <a
              href="https://www.instagram.com/benflex_fabrica/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#f472b6', fontWeight: 700 }}
            >
              @benflex_fabrica
            </a>
          </div>
        </div>
      </div>

      {/* Barra Principal Minimalista (1 sola fila, se contrae al hacer scroll) */}
      <header ref={headerRef} className={`bf-header${isScrolled ? ' is-scrolled' : ''}`}>
        <div className="container bf-header-inner">
          {/* Izquierda: Menú Mobile + Marca BenFlex */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <button
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setSearchOpen(false);
              }}
              className="bf-mobile-only bf-icon-btn"
              style={{ padding: '0.35rem' }}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}
            >
              <div className="bf-logo-avatar">
                <img
                  src="/logo.png"
                  alt="BenFlex"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="bf-logo-wordmark">BenFlex</span>
                <span className="bf-logo-sub">Fábrica &amp; Showroom</span>
              </div>
            </Link>
          </div>

          {/* Centro (Solo Desktop): Navegación limpia en una sola línea */}
          <nav className="bf-desktop-nav" aria-label="Categorías principales">
            <Link href="/#catalogo" className="bf-nav-link">
              Colchones &amp; Sommiers
            </Link>
            <Link href="/#catalogo" className="bf-nav-link">
              Sillones
            </Link>
            <Link href="/#catalogo" className="bf-nav-link">
              Almohadas
            </Link>
            <Link href="/#catalogo" className="bf-nav-link bf-nav-link-accent">
              <Sparkles size={13} />
              <span>Combos</span>
            </Link>
            <Link href="/#quiz-descanso" className="bf-nav-link">
              Quiz Ideal
            </Link>
            <Link href="/contacto" className="bf-nav-link">
              Showroom
            </Link>
          </nav>

          {/* Derecha: Acciones Minimalistas (Lupa, Código Postal, Carrito) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {/* Botón Buscador Desplegable */}
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setMobileMenuOpen(false);
              }}
              className="bf-icon-btn"
              title="Buscar productos"
              aria-label="Buscar productos"
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
              <span className="bf-collapsible-label">Buscar</span>
            </button>

            {/* Selector Compacto de Código Postal */}
            <button
              onClick={() => setModalOpen(true)}
              className="bf-icon-btn bf-icon-btn-pill"
              title={
                location.isSanJuan
                  ? `Envío 100% bonificado en ${location.city}, San Juan (CP ${location.postalCode})`
                  : `Envío a ${location.city} (CP ${location.postalCode}) • Flete a cotizar`
              }
            >
              <MapPin size={14} color={location.isSanJuan ? '#059669' : 'var(--brand-sage)'} />
              <span className="bf-collapsible-label">{location.city} ·</span>
              <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                {location.postalCode}
              </span>
            </button>

            {/* Botón Carrito Compacto */}
            <button
              onClick={() => setCartOpen(true)}
              className="bf-cart-btn"
              aria-label="Ver carrito"
            >
              <ShoppingBag size={15} />
              <span className="bf-collapsible-label">Carrito</span>
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--cta-green)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador Predictivo Desplegable (Solo aparece cuando el usuario toca la lupa) */}
        {searchOpen && (
          <div
            className="animate-fade-in"
            style={{
              borderTop: '1px solid #f1f5f9',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              padding: '0.65rem 0',
              boxShadow: '0 12px 28px rgba(17, 24, 39, 0.08)',
            }}
          >
            <div className="container" style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f4f4f5',
                  borderRadius: '9999px',
                  padding: '0.45rem 0.9rem',
                  gap: '0.5rem',
                  border: '1px solid #e4e4e7',
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar colchones, sommiers, sofás, almohadas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    style={{ color: 'var(--text-muted)', display: 'flex' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {searchQuery.trim().length > 0 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    padding: '0.35rem',
                  }}
                >
                  {searchResults.length === 0 ? (
                    <div
                      style={{
                        padding: '0.85rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.84rem',
                      }}
                    >
                      Sin resultados para &quot;{searchQuery}&quot;.
                    </div>
                  ) : (
                    searchResults.map((product) => {
                      const transferPrice = Math.round(
                        product.basePrice *
                          (1 - (product.transferDiscountPercent || 15) / 100)
                      );
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '8px',
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                              {product.categoryLabel} • {product.measure}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--brand-sage)' }}>
                              ${transferPrice.toLocaleString('es-AR')}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: '#059669', fontWeight: 600 }}>
                              15% OFF
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menú Mobile Compacto */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in bf-mobile-only"
            style={{
              flexDirection: 'column',
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderTop: '1px solid #e4e4e7',
              padding: '0.75rem 1.15rem 1rem 1.15rem',
              gap: '0.25rem',
              boxShadow: '0 14px 28px rgba(17, 24, 39, 0.1)',
            }}
          >
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid #f4f4f5' }}
            >
              Colchones &amp; Sommiers
            </Link>
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid #f4f4f5' }}
            >
              Sillones &amp; Sofás Cama
            </Link>
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid #f4f4f5' }}
            >
              Almohadas &amp; Ropa de Cama
            </Link>
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-sage)', padding: '0.5rem 0', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sparkles size={15} />
              <span>Combos BenFlex (Con Regalo)</span>
            </Link>
            <Link
              href="/#quiz-descanso"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid #f4f4f5' }}
            >
              🎯 Test: Colchón Ideal en 3 pasos
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Store size={15} color="var(--brand-sage)" />
              <span>Showroom Villa Krause, San Juan</span>
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
