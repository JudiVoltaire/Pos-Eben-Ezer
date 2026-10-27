import "dotenv/config";
import { db, client } from "./index";
import { usuarios, categorias, productos, toppingsFijos, turnosCaja } from "./schema";

export async function seed() {
  console.log("🌱 Iniciando Seed de datos para POS Eben Ezer...");

  // 1. Crear tablas si no existen (vía Drizzle o DDL directo)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'CAJERA',
      pin_4_digitos TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      color_semantica TEXT NOT NULL DEFAULT 'orange',
      icono TEXT NOT NULL DEFAULT 'Utensils',
      orden INTEGER NOT NULL DEFAULT 0
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY,
      categoria_id TEXT NOT NULL REFERENCES categorias(id),
      codigo_corto TEXT NOT NULL,
      nombre TEXT NOT NULL,
      precio_base REAL NOT NULL,
      es_favorito_flash INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS toppings_fijos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS turnos_caja (
      id TEXT PRIMARY KEY,
      fecha_apertura TEXT DEFAULT CURRENT_TIMESTAMP,
      fecha_cierre TEXT,
      cajera_id TEXT NOT NULL REFERENCES usuarios(id),
      fondo_inicial_efectivo REAL NOT NULL DEFAULT 0,
      saldo_efectivo_esperado REAL NOT NULL DEFAULT 0,
      saldo_qr_acumulado REAL NOT NULL DEFAULT 0,
      efectivo_contado_ciego REAL,
      diferencia_efectivo REAL,
      estado TEXT NOT NULL DEFAULT 'ABIERTO'
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      turno_id TEXT NOT NULL REFERENCES turnos_caja(id),
      nro_ticket INTEGER NOT NULL,
      fecha_hora TEXT DEFAULT CURRENT_TIMESTAMP,
      cajera_id TEXT NOT NULL REFERENCES usuarios(id),
      metodo_pago TEXT NOT NULL,
      monto_efectivo REAL NOT NULL DEFAULT 0,
      monto_qr REAL NOT NULL DEFAULT 0,
      efectivo_recibido REAL NOT NULL DEFAULT 0,
      vuelto_entregado REAL NOT NULL DEFAULT 0,
      subtotal_base REAL NOT NULL DEFAULT 0,
      total_extras REAL NOT NULL DEFAULT 0,
      total_final REAL NOT NULL,
      snapshot_ticket_json TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS movimientos_caja (
      id TEXT PRIMARY KEY,
      turno_id TEXT NOT NULL REFERENCES turnos_caja(id),
      fecha_hora TEXT DEFAULT CURRENT_TIMESTAMP,
      tipo TEXT NOT NULL,
      bolsillo TEXT NOT NULL,
      monto REAL NOT NULL,
      motivo TEXT NOT NULL,
      nota_opcional TEXT,
      registrado_por_id TEXT NOT NULL REFERENCES usuarios(id),
      receptor_id TEXT REFERENCES usuarios(id),
      comprobante_foto_base64_o_url TEXT,
      estado_rendicion TEXT NOT NULL DEFAULT 'NO_APLICA'
    );
  `);

  console.log("✅ Tablas verificadas/creadas.");

  // 2. Limpiar registros anteriores de prueba
  await client.execute("DELETE FROM movimientos_caja;");
  await client.execute("DELETE FROM ventas;");
  await client.execute("DELETE FROM turnos_caja;");
  await client.execute("DELETE FROM toppings_fijos;");
  await client.execute("DELETE FROM productos;");
  await client.execute("DELETE FROM categorias;");
  await client.execute("DELETE FROM usuarios;");

  // 3. Insertar Usuarios
  const uAdmin = { id: "u-admin", nombre: "Dueña (Admin)", rol: "ADMIN" as const, pin4Digitos: "9999", activo: true };
  const uCajera = { id: "u-cajera", nombre: "Laura (Cajera)", rol: "CAJERA" as const, pin4Digitos: "1111", activo: true };
  const uLogistica = { id: "u-logistica", nombre: "María (Logística)", rol: "LOGISTICA" as const, pin4Digitos: "2222", activo: true };

  await db.insert(usuarios).values([uAdmin, uCajera, uLogistica]);
  console.log("👥 Usuarios insertados: Laura (1111), María (2222), Dueña (9999).");

  // 4. Insertar Categorías
  const catComida = { id: "cat-1", nombre: "Comidas & Platos", colorSemantica: "orange", icono: "Utensils", orden: 1 };
  const catBebidas = { id: "cat-2", nombre: "Café & Bebidas", colorSemantica: "blue", icono: "Coffee", orden: 2 };
  const catPanaderia = { id: "cat-3", nombre: "Panadería & Postres", colorSemantica: "yellow", icono: "Cake", orden: 3 };
  const catExtras = { id: "cat-4", nombre: "Guarniciones & Extras", colorSemantica: "green", icono: "PlusCircle", orden: 4 };

  await db.insert(categorias).values([catComida, catBebidas, catPanaderia, catExtras]);
  console.log("🏷️ Categorías insertadas (Naranja, Azul, Amarillo, Verde).");

  // 5. Insertar 12 Productos (6 Favoritos Flash)
  const prods = [
    // Comidas
    { id: "p-1", categoriaId: "cat-1", codigoCorto: "#01", nombre: "Silpancho Cochabambino", precioBase: 30, esFavoritoFlash: true, activo: true },
    { id: "p-2", categoriaId: "cat-1", codigoCorto: "#02", nombre: "Pique Macho Especial", precioBase: 45, esFavoritoFlash: true, activo: true },
    { id: "p-3", categoriaId: "cat-1", codigoCorto: "#03", nombre: "Milanesa de Pollo", precioBase: 25, esFavoritoFlash: true, activo: true },
    { id: "p-4", categoriaId: "cat-1", codigoCorto: "#04", nombre: "Sopa de Maní Tradicional", precioBase: 18, esFavoritoFlash: false, activo: true },

    // Café & Bebidas
    { id: "p-5", categoriaId: "cat-2", codigoCorto: "#05", nombre: "Café Tinto Andino", precioBase: 10, esFavoritoFlash: true, activo: true },
    { id: "p-6", categoriaId: "cat-2", codigoCorto: "#06", nombre: "Capuchino Especial", precioBase: 15, esFavoritoFlash: true, activo: true },
    { id: "p-7", categoriaId: "cat-2", codigoCorto: "#07", nombre: "Jugo Natural de Fruta", precioBase: 12, esFavoritoFlash: false, activo: true },
    { id: "p-8", categoriaId: "cat-2", codigoCorto: "#08", nombre: "Mocochinchi Casero", precioBase: 8, esFavoritoFlash: true, activo: true },

    // Panadería & Postres
    { id: "p-9", categoriaId: "cat-3", codigoCorto: "#09", nombre: "Cuñapé Horneado", precioBase: 5, esFavoritoFlash: false, activo: true },
    { id: "p-10", categoriaId: "cat-3", codigoCorto: "#10", nombre: "Empanada de Queso", precioBase: 7, esFavoritoFlash: false, activo: true },
    { id: "p-11", categoriaId: "cat-3", codigoCorto: "#11", nombre: "Porción Torta Tres Leches", precioBase: 15, esFavoritoFlash: false, activo: true },

    // Guarniciones & Extras
    { id: "p-12", categoriaId: "cat-4", codigoCorto: "#12", nombre: "Porción de Papas Fritas", precioBase: 12, esFavoritoFlash: false, activo: true },
  ];

  await db.insert(productos).values(prods);
  console.log("🍔 12 Productos insertados (6 Favoritos Flash destacados).");

  // 6. Insertar Toppings Fijos (Nivel 1)
  const toppings = [
    { id: "top-1", nombre: "Extra Queso", precio: 6, activo: true },
    { id: "top-2", nombre: "Extra Huevo", precio: 5, activo: true },
    { id: "top-3", nombre: "Porción Llajwa Extra", precio: 3, activo: true },
    { id: "top-4", nombre: "Extra Arroz", precio: 5, activo: true },
    { id: "top-5", nombre: "Doble Proteína", precio: 12, activo: true },
  ];

  await db.insert(toppingsFijos).values(toppings);
  console.log("🧀 5 Toppings fijos insertados.");

  // 7. Crear Turno Inicial Abierto para Laura
  await db.insert(turnosCaja).values({
    id: "turno-activo-1",
    cajeraId: "u-cajera",
    fondoInicialEfectivo: 200, // Bs. 200 de cambio inicial
    saldoEfectivoEsperado: 200,
    saldoQrAcumulado: 0,
    estado: "ABIERTO",
  });
  console.log("💰 Turno inicial abierto para Laura con fondo de Bs. 200.");

  console.log("🎉 SEED COMPLETADO CON ÉXITO.");
}

// Ejecutar si se invoca directamente
if (require.main === module || process.argv[1]?.includes("seed")) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error en seed:", err);
      process.exit(1);
    });
}
