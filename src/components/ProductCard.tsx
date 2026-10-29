'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { Star, Truck, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { location } = useLocation();
  const transferPrice = Math.round(product.basePrice * 0.85);
  const installment12 = Math.round(product.basePrice / 12);

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        position: 'relative',
      }}
    >
      {/* Top Badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {product.badge && (
          <span
            className="badge-pill badge-navy"
            style={{ fontSize: '0.72rem', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
          >
            {product.badge}
          </span>
        )}
        {location.isSanJuan ? (
          <span
            className="badge-pill badge-bonificado"
            style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <Truck size={12} />
            Envío Gratis en San Juan
          </span>
        ) : (
          <span
            className="badge-pill badge-sage"
            style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <Truck size={12} />
            Envío a cotizar
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${product.id}`}
        style={{
          display: 'block',
          position: 'relative',
          paddingTop: '65%',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>

      {/* Card Content */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Technology & Category Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--brand-sage)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {product.categoryLabel}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {product.technologyLabel}
          </span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--brand-navy)',
              lineHeight: 1.35,
              marginBottom: '0.4rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Short Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', color: '#f59e0b' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {product.rating}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ({product.reviewsCount} opiniones)
          </span>
        </div>

        {/* Features bullet list */}
        <ul
          style={{
            listStyle: 'none',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
          }}
        >
          {product.features.slice(0, 2).map((feat, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'var(--brand-sage)', fontWeight: 800 }}>✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Price Box */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid #f1f5f9',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
            Precio de lista: ${product.basePrice.toLocaleString('es-AR')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
              ${transferPrice.toLocaleString('es-AR')}
            </span>
            <span className="badge-pill badge-discount" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
              15% OFF Transf.
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            o 12 cuotas de <strong>${installment12.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
          <button
            onClick={() => addToCart(product)}
            style={{
              backgroundColor: 'var(--brand-sage)',
              color: '#ffffff',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'background-color 0.2s',
            }}
          >
            Agregar al Carrito
          </button>
          <Link
            href={`/product/${product.id}`}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: 'var(--brand-navy)',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Ver medidas y características"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
