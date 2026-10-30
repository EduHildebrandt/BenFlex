'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    isShippingBonificado,
    shippingOriginal,
    transferDiscount,
    totalTransfer,
    crossSellItems,
    addToCart,
  } = useCart();
  const { location, setModalOpen } = useLocation();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar al apretar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setCartOpen(false)}
    >
      <div
        ref={drawerRef}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Drawer */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#faf9f5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={20} color="var(--brand-sage)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Tu Carrito BenFlex
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{
              padding: '0.4rem',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Estado de Envío según Ubicación (San Juan vs Resto del País) */}
        {isShippingBonificado ? (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: '#065f46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck size={18} color="#059669" style={{ flexShrink: 0 }} />
              <div>
                <strong>¡Envío Bonificado en San Juan!</strong> ({location.city})
                {shippingOriginal > 0 && (
                  <>
                    {' '}• Ahorrás{' '}
                    <span style={{ textDecoration: 'line-through' }}>
                      ${shippingOriginal.toLocaleString('es-AR')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setModalOpen(true);
              }}
              style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857', textDecoration: 'underline', flexShrink: 0 }}
            >
              CP {location.postalCode}
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#f0f9ff',
              borderBottom: '1px solid #bae6fd',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: '#0c4a6e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} color="#0284c7" style={{ flexShrink: 0 }} />
              <div>
                <strong>Envío a {location.city}:</strong> Flete a cotizar (Bonificado en San Juan)
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setModalOpen(true);
              }}
              style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7', textDecoration: 'underline', flexShrink: 0 }}
            >
              CP {location.postalCode}
            </button>
          </div>
        )}

        {/* Lista de Productos o Carrito Vacío */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem 1rem',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Tu carrito está vacío
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '280px' }}>
                Descubrí nuestros colchones y sets con envío bonificado en San Juan y descuento exclusivo por transferencia.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  backgroundColor: 'var(--brand-navy)',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => {
                const discountPct = item.product.transferDiscountPercent ?? 15;
                const itemTransferPrice = Math.round(item.unitPrice * (1 - discountPct / 100));
                const totalProductQtyInCart = cartItems
                  .filter((i) => i.productId === item.productId)
                  .reduce((acc, i) => acc + i.quantity, 0);
                const reachedMaxStock = totalProductQtyInCart >= item.product.stock;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                          marginBottom: '0.2rem',
                        }}
                      >
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: item.fabric ? '0.15rem' : '0.5rem' }}>
                        Medida / Opción: <strong>{item.variationName}</strong>
                      </div>
                      {item.fabric && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-sage)', fontWeight: 600, marginBottom: '0.5rem' }}>
                          Tela: {item.fabric}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                        }}
                      >
                        {/* Selector de cantidad con tope de stock real */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            aria-label="Restar uno"
                          >
                            <Minus size={13} />
                          </button>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              minWidth: '24px',
                              textAlign: 'center',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => !reachedMaxStock && updateQuantity(item.id, item.quantity + 1)}
                            disabled={reachedMaxStock}
                            title={reachedMaxStock ? `Máximo disponible en stock (${item.product.stock})` : 'Sumar uno'}
                            style={{
                              padding: '0.3rem 0.5rem',
                              color: reachedMaxStock ? '#cbd5e1' : 'var(--text-secondary)',
                              cursor: reachedMaxStock ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            aria-label="Sumar uno"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Precios */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--brand-sage)' }}>
                            ${(itemTransferPrice * item.quantity).toLocaleString('es-AR')}
                          </div>
                          {discountPct > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ${item.subtotal.toLocaleString('es-AR')} (Lista)
                            </div>
                          )}
                        </div>

                        {/* Eliminar */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            padding: '0.35rem',
                            color: '#9ca3af',
                            borderRadius: '4px',
                            marginLeft: '0.25rem',
                          }}
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Cross-Selling: Sugerencias de Venta Cruzada */}
              {crossSellItems.length > 0 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#faf9f5',
                    borderRadius: '12px',
                    border: '1px solid #e8e1d5',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: 'var(--brand-navy)',
                      marginBottom: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sparkles size={14} color="var(--brand-sage)" />
                    Completá tu descanso con descuento:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {crossSellItems.map((cross) => {
                      const crossPct = cross.transferDiscountPercent ?? 15;
                      const crossPrice = Math.round(cross.basePrice * (1 - crossPct / 100));
                      return (
                        <div
                          key={cross.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.65rem',
                            backgroundColor: '#ffffff',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <img
                            src={cross.image}
                            alt={cross.name}
                            style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {cross.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--brand-sage)', fontWeight: 700 }}>
                              ${crossPrice.toLocaleString('es-AR')}{' '}
                              {crossPct > 0 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                  ({crossPct}% OFF)
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(cross)}
                            style={{
                              backgroundColor: 'var(--bg-sage-light)',
                              color: 'var(--brand-sage)',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Agregar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer del Drawer con Desglose Financiero y CTA */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#faf9f5',
            }}
          >
            {/* Desglose de Precios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal de lista</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>

              {/* Flete: Bonificado en San Juan vs A cotizar resto del país */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Envío a {location.city} ({location.postalCode})
                </span>
                {isShippingBonificado ? (
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: '6px', fontWeight: 400 }}>
                      ${shippingOriginal.toLocaleString('es-AR')}
                    </span>
                    ¡GRATIS!
                  </span>
                ) : (
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>
                    A cotizar
                  </span>
                )}
              </div>

              {/* Descuento por Transferencia */}
              {transferDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--cta-green)', fontWeight: 700 }}>
                  <span>Descuento Transferencia</span>
                  <span>-${transferDiscount.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px dashed #d1d5db',
                  paddingTop: '0.65rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Total con Transferencia
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    o ${subtotal.toLocaleString('es-AR')} en cuotas con tarjeta
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                    ${totalTransfer.toLocaleString('es-AR')}
                  </div>
                  {!isShippingBonificado && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      + flete a cotizar
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Button hacia Checkout */}
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backgroundColor: 'var(--brand-sage)',
                color: '#ffffff',
                padding: '0.95rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.3)',
                transition: 'background-color 0.2s',
              }}
            >
              <span>Continuar al Checkout</span>
              <ArrowRight size={18} />
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                marginTop: '0.65rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} color="var(--brand-sage)" />
              <span>
                {isShippingBonificado
                  ? 'Envío Bonificado en San Juan • Retiro Gratis en Showroom'
                  : 'Retiro Gratis en San Juan • Envíos al país a cotizar'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
