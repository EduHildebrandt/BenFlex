'use client';

import React from 'react';
import { BENFLEX_LEGAL, BENFLEX_CONTACT, BENFLEX_BANK_INFO } from '@/types';
import { X, ShieldCheck, Scale, FileText, ExternalLink } from 'lucide-react';

export type LegalModalType = 'terminos' | 'privacidad' | 'garantia' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {type === 'terminos' && <FileText size={20} color="var(--brand-sage)" />}
            {type === 'privacidad' && <ShieldCheck size={20} color="#059669" />}
            {type === 'garantia' && <Scale size={20} color="#0284c7" />}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              {type === 'terminos' && 'Términos y Condiciones de Uso y Compra'}
              {type === 'privacidad' && 'Política de Privacidad y Protección de Datos Personales'}
              {type === 'garantia' && 'Garantía Legal, Plazos de Entrega y Trato Digno'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.35rem',
              color: '#64748b',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Cerrar modal legal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            fontSize: '0.86rem',
            lineHeight: 1.7,
            color: '#334155',
          }}
        >
          {/* IDENTIFICACIÓN DEL TITULAR */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
            }}
          >
            <strong>Identificación del Responsable Legal:</strong>
            <br />
            <strong>Titular:</strong> {BENFLEX_LEGAL.ownerName} • <strong>CUIT:</strong> {BENFLEX_LEGAL.cuit}
            <br />
            <strong>Domicilio Comercial / Showroom:</strong> {BENFLEX_LEGAL.address}, {BENFLEX_LEGAL.city}, {BENFLEX_LEGAL.province} (CP {BENFLEX_LEGAL.postalCode}), {BENFLEX_LEGAL.country}.
            <br />
            <strong>Contacto:</strong> {BENFLEX_CONTACT.phoneDisplay} • {BENFLEX_CONTACT.email}
          </div>

          {/* CASO 1: TÉRMINOS Y CONDICIONES */}
          {type === 'terminos' && (
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                1. Ámbito de Aplicación y Aceptación
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                Los presentes Términos y Condiciones regulan la navegación, compra y utilización del sitio web oficial de <strong>BenFlex</strong>, de titularidad de <strong>{BENFLEX_LEGAL.ownerName}</strong> (CUIT {BENFLEX_LEGAL.cuit}). Toda persona que realice una compra o interactúe en el sitio acepta de manera plena y sin reservas estos términos de conformidad con el Código Civil y Comercial de la Nación y la Ley 24.240 de Defensa del Consumidor.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                2. Derecho de Arrepentimiento (Resolución 424/2020 SCI & Art. 34 Ley 24.240)
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                En las contrataciones a distancia o realizadas por medios electrónicos, el consumidor tiene derecho irrenunciable a revocar la aceptación durante el plazo de <strong>DIEZ (10) días corridos</strong> contados a partir de la fecha en que se entregue el producto o se celebre el contrato, lo último que ocurra, <strong>sin costo alguno ni necesidad de expresar causa</strong>. Los gastos de devolución corren íntegramente por cuenta del vendedor. A tales efectos, el usuario dispone del link y <strong>Botón de Arrepentimiento</strong> disponible en el carrito de compras y al pie del sitio web, mediante el cual el sistema emite de manera inmediata el código oficial de identificación de atención del trámite.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                3. Precios, Promociones y Medios de Pago
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                Todos los precios están expresados en pesos argentinos e incluyen los impuestos de ley. Las compras abonadas mediante transferencia bancaria cuentan con un <strong>15% de descuento directo</strong>. Asimismo, se ofrecen planes de pago en cuotas fijas mediante tarjeta de crédito y billeteras virtuales autorizadas. La confirmación de la compra y reserva de stock quedan sujetas a la verificación del pago.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                4. Política de Envíos, Entregas y Retiro en Sucursal
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                - <strong>Retiro sin cargo en Showroom:</strong> Disponible de forma inmediata en Castaño Oeste y Conector Sur, Villa Krause, San Juan.<br />
                - <strong>Envíos dentro de la Provincia de San Juan (CP 5400 al 5499):</strong> 100% bonificados por BenFlex.<br />
                - <strong>Envíos al resto de la República Argentina:</strong> Los costos y transportes se cotizan previamente con el cliente y se coordinan para garantizar la entrega segura y trazabilidad del producto.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                5. Garantía Legal y Garantía de Fábrica
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                Todos nuestros productos nuevos gozan de la garantía legal mínima de seis (6) meses (Art. 11 Ley 24.240). Adicionalmente, BenFlex otorga una garantía extendida escrita de fábrica de <strong>tres (3) a cinco (5) años</strong> (según modelo) por defectos de confección, estructura de resortes o densidad de espumas ortopédicas.
              </p>
            </div>
          )}

          {/* CASO 2: POLÍTICA DE PRIVACIDAD */}
          {type === 'privacidad' && (
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                1. Cumplimiento de la Ley 25.326 de Protección de los Datos Personales
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                En cumplimiento de la <strong>Ley Nacional N° 25.326</strong> (Habeas Data) y sus normas complementarias, <strong>Gabriel Perez Zapata</strong> (BenFlex) informa a los usuarios que los datos personales recolectados a través de este sitio web (nombre, correo electrónico, teléfono, DNI y domicilio de entrega) son tratados de forma confidencial y utilizados exclusivamente para procesar pedidos, coordinar fletes y brindar atención personalizada.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                2. No Almacenamiento de Datos de Tarjetas (PCI-DSS)
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                BenFlex no almacena en ningún caso números completos de tarjetas de crédito o débito, códigos de seguridad (CVV) ni credenciales bancarias. Las transacciones de pago con tarjeta son procesadas a través de pasarelas de pago seguras y certificadas, cumpliendo los más rigurosos estándares de seguridad de la industria.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                3. Derechos de Acceso, Rectificación y Supresión
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. Para solicitar la actualización, rectificación o supresión de sus datos, el titular puede contactarse a <strong>{BENFLEX_CONTACT.email}</strong>.
              </p>

              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontSize: '0.78rem',
                  color: '#15803d',
                }}
              >
                <strong>Órgano de Control:</strong> La <strong>AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA</strong>, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
              </div>
            </div>
          )}

          {/* CASO 3: GARANTÍA Y TRATO DIGNO */}
          {type === 'garantia' && (
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                1. Garantía Legal Obligatoria y Garantía Escrita de Fábrica
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                De conformidad con el <strong>Artículo 11 de la Ley 24.240</strong>, todos los productos nuevos comercializados tienen un plazo de garantía legal de <strong>seis (6) meses</strong> ante cualquier defecto de funcionamiento. Adicionalmente, BenFlex otorga una garantía de fábrica por escrito de <strong>tres (3) a cinco (5) años</strong> que ampara la estructura interna, resortes ensacados y la densidad de las espumas contra deformaciones anómalas bajo condiciones de uso normal.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                2. Trato Digno y Equitativo (Art. 8 bis Ley 24.240)
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                BenFlex garantiza a todos sus clientes condiciones de atención y trato digno, equitativo y no discriminatorio, absteniéndose de conductas que coloquen a los consumidores en situaciones vergonzantes, vejatorias o intimidatorias, conforme a lo establecido en el Artículo 8 bis de la Ley de Defensa del Consumidor y el Artículo 42 de la Constitución Nacional.
              </p>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                3. Información Clara, Veraz y Detallada (Art. 4 Ley 24.240)
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                Toda la información provista en este sitio respecto a medidas, soporte de peso, firmeza, materiales y costos de entrega se encuentra redactada en idioma castellano y de forma veraz, eficaz y suficiente para que el consumidor pueda tomar una decisión de compra plenamente informada.
              </p>

              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontSize: '0.78rem',
                  color: '#1e40af',
                }}
              >
                <strong>Defensa del Consumidor:</strong> Ante cualquier duda o reclamo, los consumidores pueden consultar el portal oficial de la Dirección Nacional de Defensa del Consumidor: <a href={BENFLEX_LEGAL.consumerProtectionUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'underline' }}>argentina.gob.ar/defensadelconsumidor</a> o la Dirección de Defensa del Consumidor del Gobierno de San Juan.
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.6rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
