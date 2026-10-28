'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/ProductCard';
import SleepQuiz from '@/components/SleepQuiz';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Store,
  MessageCircle,
  ArrowRight,
  SlidersHorizontal,
  Bed,
  CheckCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { ProductCategory, ProductTechnology, BENFLEX_CONTACT } from '@/types';

export default function HomePage() {
  const { products } = useProducts();

  // Filtros activos
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');
  const [selectedMeasure, setSelectedMeasure] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedTechnology !== 'all' && p.technology !== selectedTechnology) {
        return false;
      }
      if (selectedMeasure !== 'all') {
        const hasMeasure =
          p.measure.includes(selectedMeasure) ||
          p.variations.some((v) => v.measure?.includes(selectedMeasure) || v.name.includes(selectedMeasure));
        if (!hasMeasure) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedTechnology, selectedMeasure]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* 1. HERO BANNER (@benflex_fabrica Style) */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 0 5rem 0',
          backgroundColor: '#ffffff',
          backgroundImage:
            'radial-gradient(circle at 12% 20%, rgba(224, 242, 254, 0.65) 0%, rgba(250, 250, 249, 0.8) 55%), radial-gradient(circle at 88% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 45%)',
          borderBottom: '1px solid #e4e4e7',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <Store size={14} color="#38bdf8" />
                  <span>Fábrica Directa & Showroom en Villa Krause, San Juan</span>
                </div>

                <a
                  href="https://www.instagram.com/benflex_fabrica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: '#ffffff',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  <span>📸 @benflex_fabrica</span>
                </a>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'var(--brand-navy)',
                  marginBottom: '1.25rem',
                }}
              >
                El arte del buen descanso,{' '}
                <span style={{ color: 'var(--brand-sage)' }}>nacido para cuidar tu salud.</span>
              </h1>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '540px',
                }}
              >
                Colchones de alta densidad ortopédica (35 kg/m³) y resortes pocket con cero transferencia de movimiento. Comprá online con <strong>flete 100% bonificado</strong> y <strong>15% OFF por transferencia bancaria</strong>.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link
                  href="#catalogo"
                  style={{
                    backgroundColor: 'var(--brand-sage)',
                    color: '#ffffff',
                    padding: '0.95rem 1.8rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(45, 90, 63, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Ver Ofertas de la Semana</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#quiz-descanso"
                  style={{
                    backgroundColor: '#ffffff',
                    color: 'var(--brand-navy)',
                    padding: '0.95rem 1.6rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: '1px solid #d1d5db',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={16} color="var(--brand-sage)" />
                  <span>Test: Colchón Ideal (3 preguntas)</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--brand-sage)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Garantía 5 Años
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={20} color="var(--brand-sage)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Flete 100% Bonificado
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Store size={20} color="var(--brand-sage)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Retiro en Villa Krause
                  </span>
                </div>
              </div>
            </div>

            {/* Right Ambiented Photo / Showcase */}
            <div style={{ position: 'relative' }}>
              <div
                className="glass-card"
                style={{
                  padding: '0.75rem',
                  borderRadius: '24px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80"
                  alt="Dormitorio Benflex Confort y Descanso"
                  style={{
                    width: '100%',
                    height: '380px',
                    objectFit: 'cover',
                    borderRadius: '18px',
                  }}
                />
              </div>

              {/* Floating Promotion Card */}
              <div
                className="glass-card animate-fade-in"
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-sage-light)',
                    color: 'var(--brand-sage)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-sage)', textTransform: 'uppercase' }}>
                    Beneficio Directo
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    15% OFF Transferencia Bancaria
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUIZ INTERACTIVO */}
      <SleepQuiz />

      {/* 3. CATÁLOGO CON FILTROS DINÁMICOS */}
      <section id="catalogo" style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--brand-sage)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Colección 2026
            </span>
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--brand-navy)',
                letterSpacing: '-0.02em',
                margin: '0.35rem 0 0.5rem 0',
              }}
            >
              Especialistas en cada rincón de tu confort
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Compará precios de lista vs. precio con descuento por transferencia bancaria.
            </p>
          </div>

          {/* Categorías Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
            }}
          >
            {[
              { id: 'all', label: 'Todos los Productos' },
              { id: 'colchones-sommiers', label: 'Colchones & Sommiers' },
              { id: 'sillones-sofas', label: 'Sillones & Sofás Cama' },
              { id: 'almohadas-confort', label: 'Almohadas & Confort' },
              { id: 'combos-benflex', label: 'Combos Benflex (Regalo)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.6rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  border: selectedCategory === cat.id ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === cat.id ? 'var(--brand-navy)' : '#f8fafc',
                  color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Subfiltros por Medida y Tecnología */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              padding: '0.85rem 1.25rem',
              backgroundColor: '#faf9f5',
              borderRadius: '12px',
              border: '1px solid #e8e1d5',
              marginBottom: '2.5rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <SlidersHorizontal size={16} />
              <span style={{ fontWeight: 600 }}>Filtros específicos:</span>
            </div>

            {/* Medida */}
            <select
              value={selectedMeasure}
              onChange={(e) => setSelectedMeasure(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="all">Todas las medidas</option>
              <option value="1 Plaza">1 Plaza (80x190)</option>
              <option value="1½ Plaza">1½ Plaza (90x190)</option>
              <option value="2 Plazas">2 Plazas (140x190)</option>
              <option value="Queen">Queen (160x200)</option>
              <option value="King">King (200x200)</option>
              <option value="2 Cuerpos">2 Cuerpos</option>
              <option value="3 Cuerpos">3 Cuerpos</option>
            </select>

            {/* Tecnología */}
            <select
              value={selectedTechnology}
              onChange={(e) => setSelectedTechnology(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="all">Todas las tecnologías</option>
              <option value="alta_densidad">Espuma Alta Densidad (35 kg/m³)</option>
              <option value="resortes_pocket">Resortes Pocket Ensacados</option>
              <option value="anti_desgarro">Pana / Lino Anti-Desgarro & Anti-Manchas</option>
              <option value="viscoelastica">Viscoelástica (Memory Foam)</option>
              <option value="espuma_inteligente">Espuma Inteligente Cervical</option>
              <option value="fibra_siliconada">Fibra Siliconada / Algodón 400 Hilos</option>
            </select>

            {(selectedCategory !== 'all' || selectedTechnology !== 'all' || selectedMeasure !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTechnology('all');
                  setSelectedMeasure('all');
                }}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--brand-sage)',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Grilla de Productos */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No encontramos productos con estos filtros.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTechnology('all');
                  setSelectedMeasure('all');
                }}
                style={{
                  marginTop: '1rem',
                  backgroundColor: 'var(--brand-navy)',
                  color: '#ffffff',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SHOWROOM & LOCAL FÍSICO EN SAN JUAN */}
      <section
        style={{
          padding: '4.5rem 0',
          backgroundColor: '#faf9f5',
          borderTop: '1px solid #e8e1d5',
        }}
      >
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: '3rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'var(--bg-sage-light)',
                    color: 'var(--brand-sage)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  <MapPin size={15} />
                  <span>Villa Krause, San Juan</span>
                </div>

                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--brand-navy)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '1rem',
                  }}
                >
                  Vení a probar tu próximo descanso en nuestro Showroom
                </h3>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Nada reemplaza sentir en vivo la firmeza de la espuma de 35 kg/m³ o la ingravidez de los resortes Pocket. Nuestros asesores posturales te esperan en Villa Krause para guiarte en tu elección.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <MapPin size={18} color="var(--brand-sage)" />
                    <span><strong>Dirección:</strong> {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <Clock size={18} color="var(--brand-sage)" />
                    <span><strong>Horarios:</strong> {BENFLEX_CONTACT.schedule}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                    <CheckCircle size={18} />
                    <span>Comprá online y retirá en el día sin costo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
                      'Hola Benflex! Quisiera consultar disponibilidad y horarios para visitar el showroom en Villa Krause.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Consultar por WhatsApp</span>
                  </a>

                  <Link
                    href="/contacto"
                    style={{
                      backgroundColor: '#ffffff',
                      color: 'var(--brand-navy)',
                      border: '1px solid #d1d5db',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Store size={18} color="var(--brand-sage)" />
                    <span>Ver Mapa y Horarios del Showroom</span>
                  </Link>
                </div>
              </div>

              {/* Imagen Showroom */}
              <div>
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                  alt="Showroom Benflex en San Juan"
                  style={{
                    width: '100%',
                    height: '340px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
