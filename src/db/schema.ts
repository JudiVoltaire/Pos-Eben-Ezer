import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Usuarios
export const usuarios = sqliteTable("usuarios", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre: text("nombre").notNull(),
  rol: text("rol", { enum: ["ADMIN", "CAJERA", "LOGISTICA"] }).notNull().default("CAJERA"),
  pin4Digitos: text("pin_4_digitos").notNull(), // Para firmas rápidas en pantalla (ej. "1111")
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 2. Categorías
export const categorias = sqliteTable("categorias", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre: text("nombre").notNull(),
  colorSemantica: text("color_semantica").notNull().default("orange"), // naranja/rojo, azul, verde, amarillo
  icono: text("icono").notNull().default("Utensils"),
  orden: integer("orden").notNull().default(0),
});

// 3. Productos
export const productos = sqliteTable("productos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoriaId: text("categoria_id").notNull().references(() => categorias.id),
  codigoCorto: text("codigo_corto").notNull(), // ej. "#12"
  nombre: text("nombre").notNull(),
  precioBase: real("precio_base").notNull(), // Real, inmutable hacia abajo en caja
  esFavoritoFlash: integer("es_favorito_flash", { mode: "boolean" }).notNull().default(false), // Top 80/20
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
});

// 4. Toppings Fijos
export const toppingsFijos = sqliteTable("toppings_fijos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre: text("nombre").notNull(), // ej. "Extra Queso", "Extra Huevo"
  precio: real("precio").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
});

// 5. Turnos de Caja
export const turnosCaja = sqliteTable("turnos_caja", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fechaApertura: text("fecha_apertura").default(sql`CURRENT_TIMESTAMP`),
  fechaCierre: text("fecha_cierre"),
  cajeraId: text("cajera_id").notNull().references(() => usuarios.id),
  fondoInicialEfectivo: real("fondo_inicial_efectivo").notNull().default(0),
  saldoEfectivoEsperado: real("saldo_efectivo_esperado").notNull().default(0),
  saldoQrAcumulado: real("saldo_qr_acumulado").notNull().default(0),
  efectivoContadoCiego: real("efectivo_contado_ciego"),
  diferenciaEfectivo: real("diferencia_efectivo"),
  estado: text("estado", { enum: ["ABIERTO", "CERRADO"] }).notNull().default("ABIERTO"),
});

// 6. Ventas
export const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  turnoId: text("turno_id").notNull().references(() => turnosCaja.id),
  nroTicket: integer("nro_ticket").notNull(), // Correlativo diario
  fechaHora: text("fecha_hora").default(sql`CURRENT_TIMESTAMP`),
  cajeraId: text("cajera_id").notNull().references(() => usuarios.id),
  metodoPago: text("metodo_pago", { enum: ["EFECTIVO", "QR", "MIXTO"] }).notNull(),
  montoEfectivo: real("monto_efectivo").notNull().default(0),
  montoQr: real("monto_qr").notNull().default(0),
  efectivoRecibido: real("efectivo_recibido").notNull().default(0),
  vueltoEntregado: real("vuelto_entregado").notNull().default(0),
  subtotalBase: real("subtotal_base").notNull().default(0),
  totalExtras: real("total_extras").notNull().default(0),
  totalFinal: real("total_final").notNull(),
  snapshotTicketJson: text("snapshot_ticket_json").notNull(), // Fotografía inmutable de la venta
});

// 7. Movimientos de Caja (Salidas, Gastos, Retiros)
export const movimientosCaja = sqliteTable("movimientos_caja", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  turnoId: text("turno_id").notNull().references(() => turnosCaja.id),
  fechaHora: text("fecha_hora").default(sql`CURRENT_TIMESTAMP`),
  tipo: text("tipo", { enum: ["GASTO_INSUMOS", "RETIRO_BOVEDA", "INGRESO_CAMBIO"] }).notNull(),
  bolsillo: text("bolsillo", { enum: ["EFECTIVO_CAJON", "QR_BANCO"] }).notNull(),
  monto: real("monto").notNull(),
  motivo: text("motivo").notNull(),
  notaOpcional: text("nota_opcional"),
  registradoPorId: text("registrado_por_id").notNull().references(() => usuarios.id),
  receptorId: text("receptor_id").references(() => usuarios.id), // ej. María de Logística
  comprobanteFotoUrl: text("comprobante_foto_base64_o_url"),
  estadoRendicion: text("estado_rendicion", { enum: ["PENDIENTE_COMPROBANTE", "RESPALDADO", "NO_APLICA"] }).notNull().default("NO_APLICA"),
});
