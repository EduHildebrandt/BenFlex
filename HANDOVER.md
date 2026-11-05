# 🚀 BenFlex E-Commerce — Documento de Traspaso (Handover)

Este documento resume la totalidad del contexto técnico, de negocio, arquitectura, despliegue en servidor VPS y estado de avance del proyecto **BenFlex** para continuar el desarrollo en otra máquina o sesión sin fricciones.

---

## 📌 1. Ficha del Proyecto y Repositorio

* **Proyecto:** BenFlex — Confort y Descanso (Fábrica y Showroom de Colchones, Sommiers, Sillones y Almohadas).
* **Repositorio GitHub:** `https://github.com/EduHildebrandt/BenFlex.git`
* **Rama Principal:** `main`
* **Dominio en Producción:** `https://www.benflex.online` (con alias `blenflex.online`)
* **Stack Tecnológico:**
  * **Framework:** Next.js 16.2.7 (App Router con Turbopack)
  * **Librería UI:** React 19.2.4
  * **Estilos:** Tailwind CSS v4 + Vanilla CSS Modules / Inlines
  * **Iconografía:** Lucide React (`^1.16.0`)
  * **Persistencia:** Arquitectura Híbrida:
    * **Cloud:** PostgreSQL / Supabase (`pg` Pooler IPv4 con RLS en `public.benflex_*`).
    * **Local Fallback Resiliente:** `src/data/local_storage.json` con lectura/escritura sincronizada en `src/lib/localStore.ts` (garantiza funcionamiento sin base de datos externa).

---

## 🏢 2. Reglas de Negocio y Datos Comerciales

* **Titular Legal del Sitio:**
  * **Nombre:** Gabriel Perez Zapata
  * **CUIT:** `20-28773718-2` (número: `20287737182`)
  * **Domicilio Showroom:** Castaño Oeste y Conector Sur, Villa Krause, CP 5425, San Juan, Argentina.
* **Política Logística (Flete y Retiro):**
  * **San Juan (CP 5400–5499):** Envío 100% bonificado en toda la provincia.
  * **Showroom:** Retiro gratuito en sucursal Villa Krause.
  * **Resto del País:** Flete a cotizar (indicado en checkout y fichas).
* **Política Financiera y Medios de Pago:**
  * **Transferencia Bancaria:** **15% OFF** calculado en tiempo real.
    * **Banco:** Banco Santander Argentina
    * **Titular Cuenta:** BenFlex Confort y Descanso S.R.L.
    * **CUIT:** 30-71842918-6
    * **CBU:** `0720194820000001239845`
    * **Alias:** `BENFLEX.DESCANSO.SJ`
  * **Tarjetas:** Hasta 12 cuotas fijas / pasarela Mercado Pago.
* **Canales de Atención:**
  * **WhatsApp:** `+54 9 264 443-6961` (`5492644436961`) con prellenado automático de consultas y pedidos.
  * **Email:** `contacto@benflex.com.ar`
  * **Instagram:** `@benflex_fabrica`

---

## 🖥️ 3. Servidor VPS DonWeb (Producción)

* **Proveedor:** DonWeb Cloud Server
* **IP Pública:** `179.43.120.63`
* **Hostname:** `vps-6592055-x.dattaweb.com`
* **Puerto SSH:** `5846` *(Atención: en Donweb no es el 22)*
* **Usuario:** `root`
* **Sistema Operativo:** Ubuntu 26.04 LTS
* **Ruta de la App en VPS:** `/opt/benflex`
* **Gestor de Procesos:** Systemd (`benflex.service`)
* **Reverse Proxy:** Nginx (`/etc/nginx/sites-available/blenflex.conf`) con `client_max_body_size 15M;`
* **Certificado SSL:** Let's Encrypt Certbot activo para `benflex.online` y `www.benflex.online`.
* **Firewall:** Administrado desde el panel web de DonWeb (puertos 80, 443 y 5846 abiertos). **NO instalar ufw ni iptables** en el servidor para evitar bloqueos.
* **Regla de Logs:** No tocar `/var/log/auth.log` ni interpretar intentos de login como alertas de seguridad (ruido normal de Internet).

### Comandos Clave en el VPS:
```bash
# Conexión SSH desde la terminal local:
ssh -p 5846 root@179.43.120.63

# Actualización rápida del código y reinicio del servicio:
bash /opt/benflex/deploy/update-vps.sh

# Ver estado del servicio de producción:
systemctl status benflex --no-pager

# Reiniciar servicio manualmente:
systemctl restart benflex.service

# Ver logs en vivo de Next.js:
journalctl -u benflex -f
```

---

## ⚖️ 4. Adecuación a Legislaciones Argentinas (Completado)

1. **Código QR — Formulario 960/D (ARCA / AFIP):**
   * Exhibición del formulario oficial de Data Fiscal en el pie de página con QR interactivo que apunta a:
     `https://serviciosweb.afip.gob.ar/clavefiscal/qr/mobilePublico.aspx?cuit=20287737182`.
   * Incluye modal interactivo con validación de datos del titular (**Gabriel Perez Zapata**).
   * Componente: `src/components/DataFiscalQR.tsx`.
2. **Derecho de Arrepentimiento (Res. 424/2020 SCI & Ley 24.240 art. 34):**
   * Plazo legal de 10 días corridos para revocar compras a distancia sin costo ni causa (gastos de devolución a cargo del vendedor).
   * **Ubicación Principal:** Integrado en el **Carrito de Compras** (`src/components/CartDrawer.tsx`), con botón para que el usuario consulte sus pedidos o ejerza el arrepentimiento.
   * Emisión automática de código identificatorio del trámite: `REV-BF-XXXX-XXXX`, cancelación del pedido, restitución inmediata de stock y link a WhatsApp.
   * Componente: `src/components/ArrepentimientoModal.tsx` y página `/arrepentimiento`.
3. **Garantía Legal & Trato Digno:**
   * Garantía legal obligatoria de 6 meses (Ley 24.240 art. 11) + garantía escrita de 3 a 5 años de fábrica BenFlex.
4. **Términos y Condiciones + Política de Privacidad (Ley 25.326):**
   * Redacción exhaustiva y modales interactivos en `src/components/LegalModals.tsx`, páginas `/terminos` y `/privacidad`.
   * Bloque legal ubicado al final de la página (`src/components/Footer.tsx`) en **letra mínima legible** (`0.72rem`), cumpliendo con la normativa sin contaminar el diseño.

---

## 🛠️ 5. Módulos y Funcionalidades Principales

* **Panel de Administración (`/admin`):**
  * Acceso Dual con contraseña privada y Cookie `HttpOnly` firmada por HMAC-SHA256:
    * **Dueño:** Clave configurada en `ADMIN_OWNER_KEY` (por defecto `dueno-benflex-2026`).
    * **Desarrollador:** Clave configurada en `ADMIN_DEV_KEY` (por defecto `dev-benflex-2026`).
  * Sin contraseñas visibles en la pantalla de login.
  * **Cuadro Analítico de Ventas Web:** Métricas mensuales, tarjetas interactivas de ventas agrupadas por mes, filtros y exportación a CSV con UTF-8 BOM.
  * **ABM Completo de Productos y Categorías:**
    * Pestaña dedicada para Altas, Bajas y Modificaciones de Categorías con actualización en cascada.
    * Modal completo de edición de productos con compresión automática de fotos en Canvas (< 300KB) y edición rápida inline en tabla.
    * Ocultamiento automático de categorías sin productos en el frontend.
* **Home Page y Catálogo (`/`):**
  * Estética minimalista con Hero de impacto visual.
  * Enlace en el encabezado a *"Descubrí tu colchón ideal en 3 pasos"*.
  * Quiz de descanso posicionado **después** del catálogo de productos.
* **Checkout y Confirmación:**
  * Carrito lateral deslizable (`CartDrawer`) con cálculo de flete dinámico por Código Postal, cross-selling y botón de arrepentimiento.
  * Checkout en un solo paso (`/checkout`) sin captura directa de números de tarjeta (cumplimiento PCI-DSS SAQ-A).
  * Pantalla de confirmación (`/order-confirmation`) con token criptográfico anti-IDOR y botón directo a WhatsApp.

---

## 💻 6. Guía Rápida para Configurar en Otra PC

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/EduHildebrandt/BenFlex.git
cd BenFlex
```

### Paso 2: Instalar Dependencias
Asegurate de contar con Node.js 20+ o 22+:
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Crear el archivo `.env.local` en la raíz del proyecto:
```env
# Configuración Supabase (Opcional si se usa almacenamiento híbrido local)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
DATABASE_URL=postgresql://postgres.xxx:pass@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Seguridad Administrativa
ADMIN_SESSION_SECRET=benflex-super-secret-key-production-change-32-chars-min
ADMIN_OWNER_KEY=dueno-benflex-2026
ADMIN_DEV_KEY=dev-benflex-2026

# Mercado Pago Checkout Pro (API REST Oficial Preferences & Webhooks)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://www.benflex.online
```

### Paso 4: Ejecutar en Desarrollo o Compilar
```bash
# Servidor de desarrollo:
npm run dev

# Compilar versión productiva local:
npm run build
npm run start
```

---

## 📝 7. Reglas de Trabajo Permanentes (DevOps & Git)

1. **Commit obligatorio tras cada cambio:** Ejecutar siempre `git commit` descriptivo y `git push origin main` ante cualquier ajuste solicitado.
2. **Actualizar el VPS DonWeb:** Tras subir los commits a GitHub, ingresar al VPS y ejecutar `bash /opt/benflex/deploy/update-vps.sh`.
3. **No tocar Firewall en el VPS:** Los puertos se gestionan exclusivamente desde la interfaz web de Donweb.
4. **Preservar Base de Datos Local:** El archivo `src/data/local_storage.json` se respalda automáticamente en cada deploy; nunca borrarlo directamente.
5. **Automejora continua:** Tras cualquier corrección o lección aprendida, actualizar `tasks/lessons.md`, `PLAN.md` y `tasks/todo.md`.
