'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/ProductCard';
import SleepQuiz from '@/components/SleepQuiz';
import {
  ArrowRight,
  SlidersHorizontal,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { BENFLEX_CONTACT } from '@/types';

export default function HomePage() {
  const { products } = useProducts();

  // Filtros activos
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');
  const [selectedMeasure, setSelectedMeasure] = useState<string>('all');

  // Solo mostrar categorías que tengan al menos 1 producto cargado
  const populatedCategories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    products.forEach((p) => {
      if (!p.category) return;
      const existing = map.get(p.category);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.category, {
          id: p.category,
          label: p.categoryLabel || p.category,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [products]);

  // Si la categoría seleccionada se queda sin productos, volver a "all"
  useEffect(() => {
    if (
      selectedCategory !== 'all' &&
      !populatedCategories.some((c) => c.id === selectedCategory)
    ) {
      setSelectedCategory('all');
    }
  }, [populatedCategories, selectedCategory]);

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
          p.variations.some(
            (v) => v.measure?.includes(selectedMeasure) || v.name.includes(selectedMeasure)
          );
        if (!hasMeasure) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedTechnology, selectedMeasure]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff' }}>
      {/* 1. CABECERA MINIMALISTA */}
      <section
        style={{
          padding: '4.25rem 0 3.25rem 0',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div className="container" style={{ maxWidth: '880px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '1rem',
            }}
          >
            BenFlex • Fábrica &amp; Showroom en San Juan
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: '1.1rem',
            }}
          >
            Descanso pensado para tu postura.
          </h1>

          <p
            style={{
              fontSize: '1.02rem',
              color: '#64748b',
              lineHeight: 1.65,
              maxWidth: '580px',
              margin: '0 auto 2rem auto',
            }}
          >
            Colchones de alta densidad, resortes pocket y equipamiento de confort. Envío sin cargo en San Juan y 15% de descuento por transferencia.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="#catalogo"
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '0.85rem 1.65rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'opacity 0.2s',
              }}
            >
              <span>Ver productos</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="#quiz-descanso"
              style={{
                backgroundColor: 'transparent',
                color: '#0f172a',
                padding: '0.85rem 1.4rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'border-color 0.2s',
              }}
            >
              <span>Descubrir el colchón ideal en 3 pasos</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO DE PRODUCTOS (SOLO CATEGORÍAS CON PRODUCTOS CARGADOS) */}
      <section id="catalogo" style={{ padding: '3.25rem 0 4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          {/* Barra Minimalista de Categorías + Filtros */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.25rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {/* Píldoras de Categorías Dinámicas (Oculta categorías vacías) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  border: selectedCategory === 'all' ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === 'all' ? '#0f172a' : '#ffffff',
                  color: selectedCategory === 'all' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                Todos ({products.length})
              </button>

              {populatedCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    border: selectedCategory === cat.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: selectedCategory === cat.id ? '#0f172a' : '#ffffff',
                    color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Subfiltros Discretos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <SlidersHorizontal size={15} color="#94a3b8" />

              <select
                value={selectedMeasure}
                onChange={(e) => setSelectedMeasure(e.target.value)}
                aria-label="Filtrar por medida"
                style={{
                  padding: '0.42rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#334155',
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

              <select
                value={selectedTechnology}
                onChange={(e) => setSelectedTechnology(e.target.value)}
                aria-label="Filtrar por tecnología"
                style={{
                  padding: '0.42rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="all">Todas las tecnologías</option>
                <option value="alta_densidad">Alta Densidad (35 kg/m³)</option>
                <option value="resortes_pocket">Resortes Pocket</option>
                <option value="anti_desgarro">Anti-Desgarro / Lino</option>
                <option value="viscoelastica">Viscoelástica</option>
                <option value="espuma_inteligente">Espuma Inteligente</option>
                <option value="fibra_siliconada">Fibra / 400 Hilos</option>
              </select>

              {(selectedCategory !== 'all' ||
                selectedTechnology !== 'all' ||
                selectedMeasure !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTechnology('all');
                    setSelectedMeasure('all');
                  }}
                  style={{
                    fontSize: '0.78rem',
                    color: '#0f172a',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Grilla de Productos */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                No se encontraron productos con estos filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTechnology('all');
                  setSelectedMeasure('all');
                }}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
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

      {/* 3. TEST EN 3 PASOS: DESCUBRIR EL COLCHÓN IDEAL (DESPUÉS DE LA VISTA DE PRODUCTOS) */}
      <SleepQuiz />

      {/* 4. SHOWROOM MINIMALISTA EN VILLA KRAUSE */}
      <section
        style={{
          padding: '4.5rem 0',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div className="container" style={{ maxWidth: '920px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              padding: '2.5rem',
              borderRadius: '20px',
              backgroundColor: '#fafafa',
              border: '1px solid #e4e4e7',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                  marginBottom: '0.6rem',
                }}
              >
                Showroom Oficial
              </span>

              <h3
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '0.85rem',
                }}
              >
                Probá tu próximo descanso en San Juan
              </h3>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}
              >
                Visitá nuestro salón de exposición para conocer de cerca cada densidad y terminación con asesoramiento personalizado.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.86rem',
                  color: '#334155',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="#0f172a" />
                  <span>
                    {BENFLEX_CONTACT.address}, {BENFLEX_CONTACT.city}, {BENFLEX_CONTACT.province}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#0f172a" />
                  <span>{BENFLEX_CONTACT.schedule}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${BENFLEX_CONTACT.whatsappRaw}?text=${encodeURIComponent(
                    'Hola BenFlex! Quisiera consultar por el showroom en Villa Krause.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '0.7rem 1.25rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Consultar por WhatsApp</span>
                </a>

                <Link
                  href="/contacto"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #d1d5db',
                    padding: '0.7rem 1.25rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>Ubicación y horarios</span>
                </Link>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1000&q=80"
                alt="Showroom BenFlex en San Juan"
                style={{
                  width: '100%',
                  height: '280px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
