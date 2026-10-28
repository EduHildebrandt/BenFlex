'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import {
  Store,
  Package,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  TrendingUp,
  Truck,
  Building,
} from 'lucide-react';
import { BENFLEX_CONTACT, BENFLEX_BANK_INFO } from '@/types';

export default function BenflexAdminPage() {
  const { products, orders } = useProducts();
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '2.5rem 0 5rem 0', minHeight: '100%' }}>
      <div className="container">
        {/* Header Admin */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Volver a la Tienda</span>
            </Link>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Panel de Gestión • Benflex San Juan
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Showroom Central: {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                backgroundColor: activeTab === 'orders' ? 'var(--brand-navy)' : '#ffffff',
                color: activeTab === 'orders' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
              }}
            >
              Pedidos Recibidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                backgroundColor: activeTab === 'catalog' ? 'var(--brand-navy)' : '#ffffff',
                color: activeTab === 'catalog' ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid #d1d5db',
              }}
            >
              Catálogo y Stock ({products.length})
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.35rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--brand-sage)', marginBottom: '0.35rem' }}>
              <ShoppingBag size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Pedidos Totales</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{orders.length}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.35rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#059669', marginBottom: '0.35rem' }}>
              <TrendingUp size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Facturación Registrada</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
              ${totalRevenue.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.35rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
              <Building size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Alias Transferencias</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              {BENFLEX_BANK_INFO.alias}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>15% OFF Activo</div>
          </div>
        </div>

        {/* TAB 1: PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Bandeja de Pedidos Online
            </h2>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Aún no se han registrado pedidos en esta sesión. Podés simular una compra desde el catálogo para verla reflejada aquí en tiempo real.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-navy)' }}>
                          #{order.id}
                        </span>
                        <span className="badge-pill badge-sage">{order.paymentMethod.toUpperCase()}</span>
                        <span className="badge-pill badge-bonificado">
                          {order.deliveryMethod === 'showroom' ? 'Retiro Showroom' : `Envío a ${order.city}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Cliente: {order.customerName} • Tel: {order.customerPhone}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {order.items.map((i) => `${i.quantity}x ${i.product.name} (${i.variationName})`).join(' | ')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                        ${order.total.toLocaleString('es-AR')}
                      </div>
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#15803d',
                          marginTop: '0.35rem',
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>Contactar por WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATÁLOGO */}
        {activeTab === 'catalog' && (
          <div className="glass-card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Catálogo Activo Benflex
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {products.map((p) => {
                const transferPrice = Math.round(p.basePrice * 0.85);
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Stock: {p.stock} u. • {p.variations.length} medidas
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-sage)', marginTop: '2px' }}>
                        ${transferPrice.toLocaleString('es-AR')} (15% OFF)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
