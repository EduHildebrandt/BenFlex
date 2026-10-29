import type { Metadata } from 'next';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LocationModal from '@/components/LocationModal';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export const metadata: Metadata = {
  title: 'BenFlex | Confort, Salud Postural y Descanso Premium en San Juan',
  description:
    'Especialistas en descanso y salud postural: colchones de alta densidad, resortes pocket, sommiers reforzados, sillones y almohadas inteligentes. Showroom en Villa Krause, San Juan. Envíos bonificados en San Juan (resto del país a cotizar) y 15% OFF por transferencia.',
  keywords:
    'colchones san juan, sommiers villa krause, benflex descanso, colchon alta densidad, colchon resortes pocket, sillones sofacama san juan, almohadas viscoelasticas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LocationProvider>
          <ProductProvider>
            <CartProvider>
              <Header />
              <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <LocationModal />
              <WhatsAppFloatingButton />
            </CartProvider>
          </ProductProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
