import React from 'react';
import Link from 'next/link';
import { BENFLEX_LEGAL, BENFLEX_CONTACT } from '@/types';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad y Protección de Datos Personales • BenFlex San Juan',
  description: 'Tratamiento de datos personales en cumplimiento con la Ley 25.326 en BenFlex (Gabriel Perez Zapata).',
};

export default function PrivacidadPage() {
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
            <ShieldCheck size={28} color="#059669" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              Política de Privacidad y Protección de Datos Personales
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.75rem' }}>
            En estricto cumplimiento con la Ley Nacional N° 25.326 • República Argentina
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
            <strong>Responsable del Tratamiento del Banco de Datos:</strong>
            <br />
            <strong>Titular:</strong> {BENFLEX_LEGAL.ownerName} • <strong>CUIT:</strong> {BENFLEX_LEGAL.cuit}
            <br />
            <strong>Domicilio Legal:</strong> {BENFLEX_LEGAL.address}, {BENFLEX_LEGAL.city}, {BENFLEX_LEGAL.province} (CP {BENFLEX_LEGAL.postalCode}).
            <br />
            <strong>Canal de Atención de Habeas Data:</strong> {BENFLEX_CONTACT.email}
          </div>

          <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#334155', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                1. Finalidad de la Recolección de Datos
              </h2>
              <p>
                Los datos personales facilitados voluntariamente por los usuarios en el sitio web (nombre, correo electrónico, teléfono, DNI y domicilio) son recolectados con la única finalidad de procesar los pedidos, emitir la documentación contable y coordinar el envío o retiro de los productos adquiridos.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                2. Seguridad y Estándares PCI-DSS
              </h2>
              <p>
                BenFlex no almacena ni tiene acceso directo a los números de tarjetas de crédito o débito, códigos de seguridad (CVV/CVC) ni datos sensibles bancarios. Todos los pagos en línea son canalizados mediante pasarelas autorizadas que cumplen con los estándares internacionales de seguridad PCI-DSS.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                3. Derechos del Titular de los Datos (Acceso, Rectificación y Supresión)
              </h2>
              <p>
                El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. Asimismo, podrá solicitar en cualquier momento la rectificación, actualización o supresión de sus datos personales enviando un correo a <strong>{BENFLEX_CONTACT.email}</strong>.
              </p>
            </section>

            <section
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1.15rem',
                fontSize: '0.84rem',
                color: '#15803d',
              }}
            >
              <strong>Información al Titular de los Datos (Disposición DNPDP 10/2008):</strong>
              <p style={{ marginTop: '0.35rem' }}>
                La <strong>AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA</strong>, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
