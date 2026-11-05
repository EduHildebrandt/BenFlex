# Squad Tasks: Benflex E-Commerce Confort y Descanso

## Estado Actual de la Squad
| Tarea | Asignado | Estado | Notas |
|---|---|---|---|
| 1. Configuración de Modelos y Catálogo Benflex | Fullstack Senior | Completado | Medidas, tecnologías, 4 categorías |
| 2. Contexto de Ubicación y Lógica de Flete | Frontend Lead | Completado | CP en header, PDP, checkout (-10% bonificado) |
| 3. Layout Global (Header, Footer Showroom, WhatsApp) | UI/UX Designer | Completado | Avisos, buscador predictivo, mapa SJ, botón flotante |
| 4. Home Page & Quiz Interactivo 3 Preguntas | Frontend Lead | Completado | Hero, Quiz, Destacados, Badges de confianza |
| 5. Ficha de Producto (PDP) con WhatsApp y Cuotas | Frontend Lead | Completado | Variaciones, cuotas, flete gratis, WhatsApp encode |
| 6. Cart Drawer & Checkout One-Step | Fullstack Senior | Completado | Cross-selling, transferencia 15% OFF, CBU/Alias |
| 7. Pantalla de Confirmación con WhatsApp Encode | Fullstack Senior | Completado | Botón comprobante y coordinación por WhatsApp |
| 8. Verificación y Auditoría de Compilación | QA / Senior Lead | Completado | Zero TS errors + 13/13 aserciones pasadas |
| 9. Diagnóstico y Remediación de Carga de Productos (ATM) | Tech Lead / Fullstack | Completado | Fallback híbrido local, compresión canvas y banner error inline |
| 10. Acceso Dual Panel (Dueño y Desarrollador) | Security Engineer | Completado | Claves en .env.local y selector rápido en pantalla de bloqueo |
| 11. Cuadro Analítico de Ventas Web | Frontend Lead | Completado | 5 KPIs comerciales, métricas de pagos/logística y exportación CSV |
| 12. Despliegue VPS Ubuntu (DonWeb) `www.benflex.online` | DevOps / SRE Lead | Completado | App online en https://www.benflex.online con systemd + Nginx + Certbot SSL |
| 13. Remediación Crash Post-Login en `/admin` (Rules of Hooks) | Frontend Lead | Completado | Declaración de `useMemo` antes de returns de sesión y despliegue en VPS |
| 14. Login `/admin` sin claves expuestas, Ventas por Mes, Categorías Dinámicas y Main Minimalista | Fullstack / UI Lead | Completado | Ventas agrupadas por mes, alta de categorías, ocultamiento de categorías vacías y Quiz post-catálogo |
| 15. ABM Completo (Altas, Bajas y Modificaciones) de Productos y Categorías | Fullstack Senior | Completado | Endpoint `/api/categories`, pestaña Categorías ABM con cascada en productos, edición inline y modal completo de Productos |
| 16. Adecuación a Legislaciones Argentinas (ARCA QR 960/D, Titular Gabriel Perez Zapata, Arrepentimiento en Carrito, Garantía Legal, Términos y Privacidad Ley 25.326) | Compliance / Fullstack | Completado | Formulario 960/D interactivo, datos del titular, modal/página de arrepentimiento y pedidos, letra mínima legal en footer |
| 21. Soporte Multi-Imagen en Productos (Galería en PDP y Selector Múltiple en Admin) | Fullstack & UI | Completado | Modelo images[], migración DB JSONB, uploader múltiple en admin con compresión y visor de galería en PDP |
| 20. Actualización Global de Contacto y Asesor WhatsApp (+54 9 264 443-6961) | Fullstack & UI | Completado | Número actualizado en types/index.ts, botón flotante Asesor, footer, PDP, checkout y modales |\n| 19. Script de Instalación y Migración Automática a PostgreSQL Nativo en VPS DonWeb | DevOps & Fullstack | Completado | Script deploy/setup-postgres.sh, soporte SSL local en db.ts y migración automática de datos existentes |\n| 18. Rediseño Estético y Simétrico del Footer (4 Columnas Glassmorphism) | UI/UX & Frontend | Completado | Unificación de Showroom en tarjeta interactiva, eliminación de saltos huérfanos y limpieza visual |\n| 17. Footer Legal Desplegable (ARCA QR 960/D, Titular, Leyes de Comercio Electrónico) | UI/UX & Frontend | Completado | Barra compacta con trigger "Ver detalle y QR", Botón de Arrepentimiento visible y contenido desplegable hacia abajo |

---

## Log de Decisiones
- **Localización**: Showroom físico ubicado en Castaño Oeste y Conector Sur, Villa Krause, San Juan. Retiro en sucursal gratuito.
- **Flete Bonificado**: Flete del 10% simulado y 100% bonificado en todas las vistas con visual tachada.
- **Transferencia Bancaria**: 15% OFF en tiempo real con datos bancarios listos para copiar (Alias: BENFLEX.DESCANSO.SJ).
- **Flujo de WhatsApp**: Botón flotante persistente de atención al cliente + botón de consulta técnica en PDP + botón principal en la confirmación de orden con mensaje codificado URL encode.
- **Footer Legal**: Bloque inferior compactado en acordeón desplegable hacia abajo para mantener la página limpia sin perder la conformidad legal obligatoria (Res. 424/2020 SCI, Ley 24.240, Ley 25.326 y AFIP/ARCA).
