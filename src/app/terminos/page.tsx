import React from 'react';
import Link from 'next/link';
import { BENFLEX_LEGAL, BENFLEX_CONTACT } from '@/types';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones de Uso y Compra • BenFlex San Juan',
  description: 'Términos y condiciones legales de uso y compra online de BenFlex (Gabriel Perez Zapata).',
};

export default function TerminosPage() {
  return (
    <div style={{ backgroundColor: '#fafaf9', minHeight: '85vh', padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </Link>

        <div
          className="glass-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            padding: '2.5rem',
            boxShadow: '0 20px 45px rgba(17, 24, 39, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <FileText size={28} color="var(--brand-sage)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              Términos y Condiciones de Uso y Compra
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.75rem' }}>
            Última actualización: Noviembre 2026 • República Argentina
          </p>

          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              fontSize: '0.84rem',
              lineHeight: 1.6,
            }}
          >
            <strong>Responsable Legal de la Tienda Online:</strong>
            <br />
            <strong>Titular:</strong> {BENFLEX_LEGAL.ownerName}
            <br />
            <strong>CUIT:</strong> {BENFLEX_LEGAL.cuit}
            <br />
            <strong>Domicilio Comercial / Showroom:</strong> {BENFLEX_LEGAL.address}, {BENFLEX_LEGAL.city}, {BENFLEX_LEGAL.province} (CP {BENFLEX_LEGAL.postalCode}), {BENFLEX_LEGAL.country}.
            <br />
            <strong>Contacto:</strong> {BENFLEX_CONTACT.phoneDisplay} • {BENFLEX_CONTACT.email}
          </div>

          <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#334155', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                1. Ámbito de Aplicación
              </h2>
              <p>
                Los presentes Términos y Condiciones regulan la oferta, compra y entrega de los productos comercializados a través de la tienda web oficial de BenFlex (www.benflex.online). La utilización de este sitio web y la concreción de órdenes de compra implican la aceptación plena e incondicional de los presentes términos por parte del usuario o consumidor, en el marco de la Ley de Defensa del Consumidor (Ley N° 24.240), el Código Civil y Comercial de la Nación y la normativa reglamentaria aplicable en la República Argentina.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                2. Derecho de Arrepentimiento (Resolución 424/2020 Secretaría de Comercio & Art. 34 Ley 24.240)
              </h2>
              <p>
                El consumidor tiene derecho a revocar la aceptación durante el plazo de <strong>DIEZ (10) días corridos</strong> contados a partir de la fecha en que se entregue el bien o se celebre el contrato, lo último que ocurra, <strong>sin responsabilidad alguna y sin necesidad de expresar causa</strong>. Los gastos de devolución corren por cuenta del vendedor. A tal fin, BenFlex pone a disposición el link y <strong>Botón de Arrepentimiento</strong> en el carrito de compras y al pie del sitio, el cual genera de forma inmediata el código identificatorio del trámite.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                3. Régimen de Garantía Legal y Garantía Escrita de Fábrica
              </h2>
              <p>
                De conformidad con el Artículo 11 de la Ley 24.240, todos los productos nuevos gozan de una garantía legal obligatoria de <strong>seis (6) meses</strong>. Adicionalmente, BenFlex otorga una <strong>garantía extendida escrita de fábrica de 3 a 5 años</strong> (según modelo) que ampara la estructura interna de resortes y la densidad de espumas ortopédicas contra vicios o defectos de fabricación bajo uso doméstico normal.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                4. Precios, Bonificaciones y Medios de Pago
              </h2>
              <p>
                Los precios publicados están consignados en moneda de curso legal (pesos argentinos) e incluyen los tributos aplicables. Para pagos mediante transferencia bancaria se aplica una bonificación directa del 15% OFF sobre el precio de lista. En pagos con tarjeta de crédito se informará el Costo Financiero Total (CFT) y número de cuotas según la entidad emisora.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                5. Modalidades de Entrega y Fletes
              </h2>
              <p>
                - <strong>Retiro sin cargo en Showroom:</strong> Castaño Oeste y Conector Sur, Villa Krause, San Juan.<br />
                - <strong>Envíos dentro de la Provincia de San Juan (CP 5400 al 5499):</strong> 100% bonificados por BenFlex.<br />
                - <strong>Envíos interprovinciales:</strong> Se cotizan y acuerdan con empresas de transporte expreso con seguro de carga.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                6. Jurisdicción y Defensa del Consumidor
              </h2>
              <p>
                Ante cualquier divergencia no resuelta, las partes podrán acudir a las instancias administrativas de la Dirección de Defensa del Consumidor de la Provincia de San Juan o a nivel nacional (argentina.gob.ar/defensadelconsumidor).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
