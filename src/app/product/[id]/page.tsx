'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import ProductCard from '@/components/ProductCard';
import {
  Star,
  Truck,
  ShieldCheck,
  Store,
  MessageCircle,
  MapPin,
  CheckCircle,
  CreditCard,
  Sparkles,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { BENFLEX_CONTACT } from '@/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { products, getProductById } = useProducts();
  const { addToCart } = useCart();
  const { location, setModalOpen } = useLocation();

  const product = useMemo(() => {
    return getProductById(id) || products.find((p) => p.id === id);
  }, [id, products, getProductById]);

  // Selección de Variación (Medida)
  const [selectedVariationName, setSelectedVariationName] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Inicializar variación por defecto
  useMemo(() => {
    if (product && product.variations.length > 0 && !selectedVariationName) {
      setSelectedVariationName(product.variations[0].name);
    }
    if (product && product.fabrics && product.fabrics.length > 0 && !selectedFabric) {
      setSelectedFabric(product.fabrics[0]);
    }
  }, [product, selectedVariationName, selectedFabric]);

  if (!product) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Producto no encontrado
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
            El producto que buscas ya no está disponible o el enlace es incorrecto.
          </p>
          <Link
            href="/"
            style={{
              backgroundColor: 'var(--brand-navy)',
              color: '#ffffff',
              padding: '0.85rem 1.6rem',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Cálculo del precio según la variación seleccionada
  const activeVariation = product.variations.find((v) => v.name === selectedVariationName);
  const currentPrice = product.basePrice + (activeVariation ? activeVariation.priceModifier : 0);
  const transferPrice = Math.round(currentPrice * 0.85);
  const transferSavings = currentPrice - transferPrice;
  const shippingMockCost = Math.round(currentPrice * 0.1);

  // Cuotas
  const cuota3 = Math.round(currentPrice / 3);
  const cuota6 = Math.round(currentPrice / 6);
  const cuota12 = Math.round(currentPrice / 12);

  const handleAddToCart = () => {
    addToCart(product, selectedVariationName, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // WhatsApp preconfigurado para dudas de medidas o telas
  const whatsappInquiryMsg = encodeURIComponent(
    `¡Hola BenFlex! Estoy viendo en la tienda el "${product.name}" (Medida: ${selectedVariationName}${
      selectedFabric ? ` / Tela: ${selectedFabric}` : ''
    }). Quisiera consultar detalles de stock, telas y tiempos de entrega para ${location.city}.`
  );
  const whatsappHref = `https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${whatsappInquiryMsg}`;

  // Productos relacionados
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div style={{ backgroundColor: '#faf9f5', padding: '2rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb de regreso */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la tienda</span>
          </Link>
        </div>

        {/* CONTENEDOR PRINCIPAL PDP */}
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
            }}
          >
            {/* COLUMNA IZQUIERDA: FOTO AMBIENTADA & BADGES */}
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  aspectRatio: '4/3',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {product.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                    }}
                  >
                    <span className="badge-pill badge-navy" style={{ fontSize: '0.8rem' }}>
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Badges de Garantía y Showroom */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem',
                    backgroundColor: '#faf9f5',
                    borderRadius: '12px',
                    border: '1px solid #e8e1d5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <ShieldCheck size={24} color="var(--brand-sage)" />
                  <div style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
                    <strong>{product.warranty || 'Garantía Oficial'}</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Directa de fábrica</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.85rem',
                    backgroundColor: '#faf9f5',
                    borderRadius: '12px',
                    border: '1px solid #e8e1d5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <Store size={24} color="var(--brand-navy)" />
                  <div style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
                    <strong>Showroom San Juan</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Retiro en Villa Krause</div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: CONFIGURACIÓN, PRECIOS, ENVÍO & CTAS */}
            <div>
              {/* Categoría y Tecnología */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge-pill badge-sage">{product.categoryLabel}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {product.technologyLabel}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--brand-navy)',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.75rem',
                }}
              >
                {product.name}
              </h1>

              {/* Reviews y Calificación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{product.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  • {product.reviewsCount} opiniones verificadas
                </span>
              </div>

              {/* CAJA DE PRECIOS CON DESCUENTO TRANSFERENCIA */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#faf9f5',
                  borderRadius: '16px',
                  border: '1px solid #e8e1d5',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  Precio de Lista: ${currentPrice.toLocaleString('es-AR')}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.25rem 0' }}>
                  <span
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 900,
                      color: 'var(--brand-sage)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    ${transferPrice.toLocaleString('es-AR')}
                  </span>
                  <span className="badge-pill badge-discount" style={{ fontSize: '0.85rem' }}>
                    15% OFF Transferencia
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, marginBottom: '0.75rem' }}>
                  ¡Ahorrás ${transferSavings.toLocaleString('es-AR')} pagando con Transferencia Bancaria!
                </div>

                {/* Calculador de Cuotas */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <CreditCard size={18} color="var(--brand-navy)" />
                  <div>
                    o en hasta <strong>12 cuotas fijas de ${cuota12.toLocaleString('es-AR')}</strong>{' '}
                    (3 de ${cuota3.toLocaleString('es-AR')} / 6 de ${cuota6.toLocaleString('es-AR')})
                  </div>
                </div>
              </div>

              {/* SELECTOR DE MEDIDAS / VARIACIONES */}
              {product.variations.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Seleccioná la medida:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {product.variations.map((v) => {
                      const isSelected = v.name === selectedVariationName;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setSelectedVariationName(v.name)}
                          style={{
                            padding: '0.65rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: isSelected ? '2px solid var(--brand-sage)' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? 'var(--bg-sage-light)' : '#ffffff',
                            color: isSelected ? 'var(--brand-sage)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELECTOR DE TELAS (si aplica a sillones o sofás cama) */}
              {product.fabrics && product.fabrics.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Tela & Tapizado Pet-Friendly:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {product.fabrics.map((fabric) => {
                      const isSelected = fabric === selectedFabric;
                      return (
                        <button
                          key={fabric}
                          type="button"
                          onClick={() => setSelectedFabric(fabric)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            border: isSelected ? '2px solid var(--brand-sage)' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? 'var(--bg-sage-light)' : '#ffffff',
                            color: isSelected ? 'var(--brand-sage)' : 'var(--text-secondary)',
                          }}
                        >
                          {fabric}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELECTOR DE ENVÍO Y GEOLOCALIZACIÓN VISIBLE */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  marginBottom: '1.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Truck size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46' }}>
                        Envío a {location.city} ({location.postalCode})
                      </div>
                      <button
                        onClick={() => setModalOpen(true)}
                        style={{
                          fontSize: '0.78rem',
                          color: '#047857',
                          fontWeight: 700,
                          textDecoration: 'underline',
                        }}
                      >
                        Cambiar CP
                      </button>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '0.3rem' }}>
                      Costo de flete:{' '}
                      <span style={{ textDecoration: 'line-through', opacity: 0.8 }}>
                        ${shippingMockCost.toLocaleString('es-AR')}
                      </span>{' '}
                      → <strong>¡GRATIS / 100% Bonificado a tu zona!</strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.4rem' }}>
                      ✓ Opción de <strong>Retiro gratis en sucursal</strong> (Castaño Oeste y Conector Sur, Villa Krause, San Juan).
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN: AGREGAR AL CARRITO + WHATSAPP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: 'var(--brand-sage)',
                    color: '#ffffff',
                    padding: '1.1rem 2rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    boxShadow: '0 8px 25px rgba(45, 90, 63, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <Sparkles size={18} />
                  <span>{addedAnimation ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}</span>
                </button>

                {/* Botón WhatsApp Ficha */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #25D366',
                    color: '#128C7E',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={18} color="#25D366" />
                  <span>Consultar medidas o telas por WhatsApp</span>
                </a>
              </div>

              {/* ESPECIFICACIONES TÉCNICAS */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                  Detalles y Ficha de Descanso:
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {product.weightSupport && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} color="var(--brand-sage)" />
                      <span><strong>Soporte de peso:</strong> {product.weightSupport}</span>
                    </li>
                  )}
                  {product.firmness && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} color="var(--brand-sage)" />
                      <span><strong>Nivel de firmeza:</strong> {product.firmness}</span>
                    </li>
                  )}
                  {product.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} color="var(--brand-sage)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--brand-navy)',
                marginBottom: '1.5rem',
              }}
            >
              Completá tu juego de descanso
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
