# POS Eben Ezer 🏪

Sistema de Punto de Venta (POS) de Alta Velocidad, Tesorería Digital (Cero Papel) y Cinta Testigo Forense para Gastronomía en Bolivia (moneda: Bolivianos `Bs.`).

## 🚀 Características Principales

1. **Los Dos Bolsillos Digitales:**
   - **💵 Caja Física (En Cajón):** Fondo inicial + Cobros en Efectivo - Salidas en Efectivo.
   - **📱 Caja Digital (QR / Banco):** Cobros vía QR/Banco - Pagos a proveedores por QR.
2. **Catálogo de Ventas Flash (60/40 Split):**
   - ⭐ **Top Ventas Flash (80/20):** Los platos más vendidos en botones grandes táctiles.
   - **Categorías con Código de Color:** Comidas (Naranja), Bebidas (Azul), Panadería (Amarillo), Extras (Verde).
   - **Toque Directo:** Al tocar cualquier producto se agrega instantáneamente al ticket sin ventanas emergentes molestas.
   - **Franja de Extras de 2 Niveles:**
     - Nivel 1: Toppings fijos (+Queso, +Huevo, etc.)
     - Nivel 2: Comodín de cocina (+Bs. 2, +Bs. 5, +Bs. 10 y notas libres).
3. **Cobro Ultrarrápido en 3 Segundos:**
   - Selector directo: Efectivo, QR y Mixto.
   - Asistente de Billetes Rápidos: calcula y resalta en verde gigante el **Vuelto a Entregar**.
   - Visor QR bancario y confirmación inmediata.
4. **Tesorería Sin Papel & Logística (Caso María):**
   - Retiros y gastos con firma digital mediante PIN secreto de 4 dígitos.
   - Respaldo fotográfico directo desde la cámara del dispositivo móvil o laptop.
5. **Cinta Testigo Forense & Inteligencia de Negocio:**
   - Snapshots inmutables de cada venta.
   - Visualización con diseño de ticket térmico real.
   - Exportación a CSV/Excel.
   - Arqueo Ciego de fin de turno y emisión del Reporte Z oficial.

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Base de Datos & ORM:** Turso (LibSQL) + Drizzle ORM
- **Estilos:** Tailwind CSS v4
- **Iconos:** Lucide React
- **Hosting:** Vercel
