'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, Bed, Shield, HeartHandshake } from 'lucide-react';
import { Product } from '@/types';

export default function SleepQuiz() {
  const { products } = useProducts();
  const { addToCart } = useCart();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    position: '',
    priority: '',
    size: '',
  });

  const handleSelectOption = (key: 'position' | 'priority' | 'size', value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4); // Mostrar resultado
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ position: '', priority: '', size: '' });
  };

  // Lógica de recomendación de producto
  const recommendedProduct: Product = (() => {
    if (answers.priority === 'combo') {
      return (
        products.find((p) => p.id === 'combo-imperial-completo-regalo') ||
        products[0]
      );
    }
    if (answers.priority === 'pareja' || answers.position === 'lado') {
      return (
        products.find((p) => p.id === 'colchon-nuage-resortes-pocket') ||
        products[1]
      );
    }
    return (
      products.find((p) => p.id === 'colchon-imperial-alta-densidad') ||
      products[0]
    );
  })();

  const transferPrice = Math.round(recommendedProduct.basePrice * 0.85);

  return (
    <section
      id="quiz-descanso"
      style={{
        padding: '4.5rem 0',
        backgroundColor: '#f7f4ed',
        borderTop: '1px solid #e8e1d5',
        borderBottom: '1px solid #e8e1d5',
        position: 'relative',
      }}
    >
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-sage-light)',
              color: 'var(--brand-sage)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              border: '1px solid rgba(45, 90, 63, 0.2)',
            }}
          >
            <Sparkles size={15} />
            <span>Asesor Ergonómico Inteligente</span>
          </div>
          <h2
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              letterSpacing: '-0.02em',
              marginBottom: '0.65rem',
            }}
          >
            Descubrí tu colchón ideal en 3 preguntas
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Elegir la firmeza y estructura adecuada previene contracturas y multiplica tu energía cada mañana.
          </p>

          {/* Progress Dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              marginTop: '1.5rem',
            }}
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  height: '8px',
                  width: step === s ? '36px' : '14px',
                  borderRadius: '9999px',
                  backgroundColor: step >= s ? 'var(--brand-sage)' : '#cbd5e1',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* CONTENEDOR DEL QUIZ */}
        <div
          className="glass-card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* PASO 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-sage)', textTransform: 'uppercase' }}>
                Paso 1 de 3
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.35rem 0 1.5rem 0' }}>
                ¿En qué posición dormís principalmente?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectOption('position', 'lado')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-sage)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛌</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    De lado
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Necesito un colchón que adapte hombros y caderas sin generar presión articular.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('position', 'espalda')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-sage)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧘</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Boca arriba o boca abajo
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Busco soporte firme en la zona lumbar para mantener la columna alineada.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('position', 'mixta')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-sage)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Cambio frecuentemente
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Prefiero un balance ideal entre firmeza y suavidad con acolchado adaptable.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-sage)', textTransform: 'uppercase' }}>
                Paso 2 de 3
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.35rem 0 1.5rem 0' }}>
                ¿Cuál es tu prioridad principal de descanso?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectOption('priority', 'pareja')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👫</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Cero transferencia de movimiento
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Duermo en pareja y no quiero sentir cuando el otro se mueve o se levanta.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('priority', 'ortopedico')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💪</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Firmeza ortopédica (Salud Postural)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Alta densidad (35 kg/m³) que soporte el peso corporal sin deformarse jamás.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('priority', 'combo')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎁</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Combo Todo Incluido con Regalo
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Quiero renovar colchón + sommier y llevarme las almohadas viscoelásticas gratis.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-sage)', textTransform: 'uppercase' }}>
                Paso 3 de 3
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0.35rem 0 1.5rem 0' }}>
                ¿Qué medida de cama estás buscando?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {['1 Plaza / 1½ Plaza', '2 Plazas (140x190)', 'Queen Size (160x200)', 'King Size (200x200)'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSelectOption('size', size)}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: '#fafafa',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: 'var(--brand-navy)',
                    }}
                  >
                    <Bed size={24} style={{ margin: '0 auto 0.5rem auto', color: 'var(--brand-sage)' }} />
                    <div>{size}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTADO (STEP 4) */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--cta-green)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                }}
              >
                <CheckCircle2 size={20} />
                <span>Recomendación Personalizada BenFlex</span>
              </div>
              <h3
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: 'var(--brand-navy)',
                  marginBottom: '1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Tu colchón perfecto es el {recommendedProduct.name}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem',
                }}
              >
                <img
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                    <span className="badge-pill badge-sage">
                      Tecnología: {recommendedProduct.technologyLabel}
                    </span>
                    <span className="badge-pill badge-bonificado">
                      Flete 100% Bonificado
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {recommendedProduct.description.slice(0, 160)}...
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      Precio de Lista: ${recommendedProduct.basePrice.toLocaleString('es-AR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-sage)' }}>
                        ${transferPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="badge-pill badge-discount">15% OFF Transferencia</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      o hasta 12 cuotas fijas con tarjeta de crédito
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => addToCart(recommendedProduct)}
                      style={{
                        backgroundColor: 'var(--brand-sage)',
                        color: '#ffffff',
                        padding: '0.75rem 1.4rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        boxShadow: '0 4px 12px rgba(45, 90, 63, 0.3)',
                      }}
                    >
                      Agregar al Carrito
                    </button>
                    <Link
                      href={`/product/${recommendedProduct.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        color: 'var(--brand-navy)',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>Ver Detalles y Medidas</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={resetQuiz}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Volver a responder el test</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
