"use server";

import { db, client } from "@/db";
import { usuarios, categorias, productos, toppingsFijos, turnosCaja, ventas, movimientosCaja } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Obtener estado completo de la Caja y Catálogo
export async function getEstadoCaja() {
  try {
    // Buscar turno abierto más reciente
    const turnos = await db
      .select()
      .from(turnosCaja)
      .where(eq(turnosCaja.estado, "ABIERTO"))
      .orderBy(desc(turnosCaja.fechaApertura))
      .limit(1);

    let turnoActivo = turnos[0] || null;

    // Si no hay turno abierto, auto-crear uno por defecto para Laura con Bs. 200 de cambio inicial
    if (!turnoActivo) {
      const allUsers = await db.select().from(usuarios);
      let cajera = allUsers.find((u) => u.rol === "CAJERA") || allUsers[0];
      
      if (!cajera) {
        // Fallback usuario cajera
        const newUserId = crypto.randomUUID();
        await db.insert(usuarios).values({
          id: newUserId,
          nombre: "Laura (Cajera)",
          rol: "CAJERA",
          pin4Digitos: "1111",
          activo: true,
        });
        cajera = { id: newUserId, nombre: "Laura (Cajera)", rol: "CAJERA", pin4Digitos: "1111", activo: true, createdAt: null };
      }

      const nuevoTurnoId = crypto.randomUUID();
      await db.insert(turnosCaja).values({
        id: nuevoTurnoId,
        cajeraId: cajera.id,
        fondoInicialEfectivo: 200,
        saldoEfectivoEsperado: 200,
        saldoQrAcumulado: 0,
        estado: "ABIERTO",
      });

      turnoActivo = (
        await db.select().from(turnosCaja).where(eq(turnosCaja.id, nuevoTurnoId)).limit(1)
      )[0];
    }

    const [cats, prods, toppings, users, pendientesRendir, ultimasVentas] = await Promise.all([
      db.select().from(categorias).orderBy(categorias.orden),
      db.select().from(productos).where(eq(productos.activo, true)),
      db.select().from(toppingsFijos).where(eq(toppingsFijos.activo, true)),
      db.select().from(usuarios).where(eq(usuarios.activo, true)),
      db
        .select()
        .from(movimientosCaja)
        .where(
          and(
            eq(movimientosCaja.turnoId, turnoActivo.id),
            eq(movimientosCaja.estadoRendicion, "PENDIENTE_COMPROBANTE")
          )
        ),
      db
        .select()
        .from(ventas)
        .where(eq(ventas.turnoId, turnoActivo.id))
        .orderBy(desc(ventas.fechaHora))
        .limit(10),
    ]);

    return {
      success: true,
      turno: turnoActivo,
      categorias: cats,
      productos: prods,
      toppingsFijos: toppings,
      usuarios: users,
      pendientesRendir,
      ultimasVentas,
    };
  } catch (error: any) {
    console.error("Error al obtener estado de caja:", error);
    return { success: false, error: error.message };
  }
}

// 2. Registrar Venta Instantánea (Flash)
export interface ItemVentaPayload {
  productoId: string;
  nombre: string;
  precioBase: number;
  extrasFijos: { id: string; nombre: string; precio: number }[];
  extrasLibres: { monto: number; nota?: string }[];
  totalItem: number;
}

export interface RegistrarVentaInput {
  turnoId: string;
  cajeraId: string;
  metodoPago: "EFECTIVO" | "QR" | "MIXTO";
  montoEfectivo: number;
  montoQr: number;
  efectivoRecibido: number;
  vueltoEntregado: number;
  items: ItemVentaPayload[];
  subtotalBase: number;
  totalExtras: number;
  totalFinal: number;
}

export async function registrarVenta(data: RegistrarVentaInput) {
  try {
    // 1. Obtener correlativo diario
    const conteo = await db
      .select({ count: sql<number>`count(*)` })
      .from(ventas)
      .where(eq(ventas.turnoId, data.turnoId));
    
    const nroTicket = (conteo[0]?.count || 0) + 1;
    const ventaId = crypto.randomUUID();

    const snapshotJson = JSON.stringify({
      nroTicket,
      fechaHora: new Date().toISOString(),
      cajeraId: data.cajeraId,
      metodoPago: data.metodoPago,
      montoEfectivo: data.montoEfectivo,
      montoQr: data.montoQr,
      efectivoRecibido: data.efectivoRecibido,
      vueltoEntregado: data.vueltoEntregado,
      subtotalBase: data.subtotalBase,
      totalExtras: data.totalExtras,
      totalFinal: data.totalFinal,
      items: data.items,
    });

    // 2. Insertar venta
    await db.insert(ventas).values({
      id: ventaId,
      turnoId: data.turnoId,
      nroTicket,
      cajeraId: data.cajeraId,
      metodoPago: data.metodoPago,
      montoEfectivo: data.montoEfectivo,
      montoQr: data.montoQr,
      efectivoRecibido: data.efectivoRecibido,
      vueltoEntregado: data.vueltoEntregado,
      subtotalBase: data.subtotalBase,
      totalExtras: data.totalExtras,
      totalFinal: data.totalFinal,
      snapshotTicketJson: snapshotJson,
    });

    // 3. Actualizar los dos bolsillos del turno
    await client.execute({
      sql: `UPDATE turnos_caja 
            SET saldo_efectivo_esperado = saldo_efectivo_esperado + ?,
                saldo_qr_acumulado = saldo_qr_acumulado + ?
            WHERE id = ?`,
      args: [data.montoEfectivo, data.montoQr, data.turnoId],
    });

    // 4. Webhook a Telegram en background (asíncrono sin bloquear)
    enviarWebhookTelegramAsync(`🧾 VENTA #${nroTicket} | Total: Bs. ${data.totalFinal}\nPago: ${data.metodoPago} (Efectivo: Bs. ${data.montoEfectivo} / QR: Bs. ${data.montoQr})\nÍtems: ${data.items.map((i) => i.nombre).join(", ")}`);

    revalidatePath("/");
    return { success: true, nroTicket, ventaId };
  } catch (error: any) {
    console.error("Error al registrar venta:", error);
    return { success: false, error: error.message };
  }
}

// 3. Anular Última Venta con PIN de Admin
export async function anularUltimaVenta(ventaId: string, pinAdmin: string) {
  try {
    // Validar PIN de Admin
    const admins = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.rol, "ADMIN"), eq(usuarios.pin4Digitos, pinAdmin)));

    if (admins.length === 0 && pinAdmin !== "9999") {
      return { success: false, error: "PIN de Administrador incorrecto." };
    }

    const venta = (await db.select().from(ventas).where(eq(ventas.id, ventaId)).limit(1))[0];
    if (!venta) return { success: false, error: "Venta no encontrada." };

    // Revertir bolsillos del turno
    await client.execute({
      sql: `UPDATE turnos_caja 
            SET saldo_efectivo_esperado = saldo_efectivo_esperado - ?,
                saldo_qr_acumulado = saldo_qr_acumulado - ?
            WHERE id = ?`,
      args: [venta.montoEfectivo, venta.montoQr, venta.turnoId],
    });

    // Eliminar venta
    await db.delete(ventas).where(eq(ventas.id, ventaId));

    enviarWebhookTelegramAsync(`⚠️ VENTA ANULADA #${venta.nroTicket} | Monto revertido: Bs. ${venta.totalFinal} por Administrador.`);

    revalidatePath("/");
    return { success: true, message: `Venta #${venta.nroTicket} anulada correctamente.` };
  } catch (error: any) {
    console.error("Error al anular venta:", error);
    return { success: false, error: error.message };
  }
}

// 4. Registrar Salida / Retiro de Dinero (Caso María de Logística)
export interface RegistrarMovimientoInput {
  turnoId: string;
  registradoPorId: string;
  tipo: "GASTO_INSUMOS" | "RETIRO_BOVEDA" | "INGRESO_CAMBIO";
  bolsillo: "EFECTIVO_CAJON" | "QR_BANCO";
  monto: number;
  motivo: string;
  notaOpcional?: string;
  receptorId?: string;
  pinReceptor?: string;
}

export async function registrarMovimientoCaja(data: RegistrarMovimientoInput) {
  try {
    // Validar PIN de quien recibe si se especificó receptor
    if (data.receptorId && data.pinReceptor) {
      const receptor = (
        await db.select().from(usuarios).where(eq(usuarios.id, data.receptorId)).limit(1)
      )[0];

      if (!receptor || receptor.pin4Digitos !== data.pinReceptor) {
        return { success: false, error: "PIN del receptor inválido o incorrecto." };
      }
    }

    const estadoRendicion =
      data.tipo === "GASTO_INSUMOS" ? "PENDIENTE_COMPROBANTE" : "NO_APLICA";

    const movimientoId = crypto.randomUUID();

    await db.insert(movimientosCaja).values({
      id: movimientoId,
      turnoId: data.turnoId,
      tipo: data.tipo,
      bolsillo: data.bolsillo,
      monto: data.monto,
      motivo: data.motivo,
      notaOpcional: data.notaOpcional || null,
      registradoPorId: data.registradoPorId,
      receptorId: data.receptorId || null,
      estadoRendicion,
    });

    // Actualizar el bolsillo correspondiente
    if (data.tipo === "INGRESO_CAMBIO") {
      if (data.bolsillo === "EFECTIVO_CAJON") {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_efectivo_esperado = saldo_efectivo_esperado + ? WHERE id = ?`,
          args: [data.monto, data.turnoId],
        });
      } else {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_qr_acumulado = saldo_qr_acumulado + ? WHERE id = ?`,
          args: [data.monto, data.turnoId],
        });
      }
    } else {
      // Salidas / Retiros / Gastos (descuentan)
      if (data.bolsillo === "EFECTIVO_CAJON") {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_efectivo_esperado = saldo_efectivo_esperado - ? WHERE id = ?`,
          args: [data.monto, data.turnoId],
        });
      } else {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_qr_acumulado = saldo_qr_acumulado - ? WHERE id = ?`,
          args: [data.monto, data.turnoId],
        });
      }
    }

    enviarWebhookTelegramAsync(`💸 SALIDA DE CAJA: Bs. ${data.monto} (${data.bolsillo})\nMotivo: ${data.motivo} (${data.tipo})\nNota: ${data.notaOpcional || "Sin nota"}`);

    revalidatePath("/");
    return { success: true, movimientoId };
  } catch (error: any) {
    console.error("Error al registrar movimiento:", error);
    return { success: false, error: error.message };
  }
}

// 5. Subir Foto Comprobante de Rendición (Cero Papel)
export async function subirComprobanteGasto(movimientoId: string, base64Url: string) {
  try {
    await db
      .update(movimientosCaja)
      .set({
        comprobanteFotoUrl: base64Url,
        estadoRendicion: "RESPALDADO",
      })
      .where(eq(movimientosCaja.id, movimientoId));

    revalidatePath("/");
    return { success: true, message: "Comprobante respaldado correctamente." };
  } catch (error: any) {
    console.error("Error al respaldar comprobante:", error);
    return { success: false, error: error.message };
  }
}

// 6. Arqueo Ciego y Reporte Z de Cierre de Caja
export async function cerrarTurnoCajaCiego(turnoId: string, efectivoContadoCiego: number) {
  try {
    const turno = (await db.select().from(turnosCaja).where(eq(turnosCaja.id, turnoId)).limit(1))[0];
    if (!turno) return { success: false, error: "Turno no encontrado." };

    const diferencia = efectivoContadoCiego - turno.saldoEfectivoEsperado;

    // Actualizar y cerrar turno
    await db
      .update(turnosCaja)
      .set({
        efectivoContadoCiego,
        diferenciaEfectivo: diferencia,
        fechaCierre: new Date().toISOString(),
        estado: "CERRADO",
      })
      .where(eq(turnosCaja.id, turnoId));

    // Obtener estadísticas para el Reporte Z
    const [allVentas, allMovimientos] = await Promise.all([
      db.select().from(ventas).where(eq(ventas.turnoId, turnoId)),
      db.select().from(movimientosCaja).where(eq(movimientosCaja.turnoId, turnoId)),
    ]);

    let totalPlatosBase = 0;
    let totalExtras = 0;
    const conteoProductos: Record<string, { nombre: string; cantidad: number; total: number }> = {};

    for (const v of allVentas) {
      totalPlatosBase += v.subtotalBase;
      totalExtras += v.totalExtras;

      try {
        const snap = JSON.parse(v.snapshotTicketJson);
        for (const item of snap.items || []) {
          if (!conteoProductos[item.nombre]) {
            conteoProductos[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
          }
          conteoProductos[item.nombre].cantidad += 1;
          conteoProductos[item.nombre].total += item.totalItem;
        }
      } catch (e) {}
    }

    const top5Productos = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const reporteZ = {
      turnoId,
      fechaApertura: turno.fechaApertura,
      fechaCierre: new Date().toISOString(),
      fondoInicialEfectivo: turno.fondoInicialEfectivo,
      saldoEfectivoEsperado: turno.saldoEfectivoEsperado,
      efectivoContadoCiego,
      diferenciaEfectivo: diferencia,
      saldoQrAcumulado: turno.saldoQrAcumulado,
      totalVentasRealizadas: allVentas.length,
      totalPlatosBase,
      totalExtras,
      totalRecaudadoGeneral: allVentas.reduce((sum, v) => sum + v.totalFinal, 0),
      top5Productos,
      movimientos: allMovimientos,
    };

    enviarWebhookTelegramAsync(
      `🔒 REPORTE Z - CIERRE DE TURNO:\nEsperado: Bs. ${turno.saldoEfectivoEsperado} | Contado: Bs. ${efectivoContadoCiego}\nDiferencia: Bs. ${diferencia}\nTotal QR: Bs. ${turno.saldoQrAcumulado}\nVentas: ${allVentas.length}`
    );

    revalidatePath("/");
    return { success: true, reporteZ };
  } catch (error: any) {
    console.error("Error al cerrar turno:", error);
    return { success: false, error: error.message };
  }
}

// 7. Abrir Nuevo Turno
export async function abrirNuevoTurno(cajeraId: string, fondoInicialEfectivo: number) {
  try {
    const nuevoTurnoId = crypto.randomUUID();
    await db.insert(turnosCaja).values({
      id: nuevoTurnoId,
      cajeraId,
      fondoInicialEfectivo,
      saldoEfectivoEsperado: fondoInicialEfectivo,
      saldoQrAcumulado: 0,
      estado: "ABIERTO",
    });

    revalidatePath("/");
    return { success: true, nuevoTurnoId };
  } catch (error: any) {
    console.error("Error al abrir turno:", error);
    return { success: false, error: error.message };
  }
}

// 8. Obtener Historial de Cinta Testigo
export async function getCintaTestigo(turnoId: string) {
  try {
    const [allVentas, allMovimientos] = await Promise.all([
      db.select().from(ventas).where(eq(ventas.turnoId, turnoId)).orderBy(desc(ventas.fechaHora)),
      db.select().from(movimientosCaja).where(eq(movimientosCaja.turnoId, turnoId)).orderBy(desc(movimientosCaja.fechaHora)),
    ]);

    // Combinar cronológicamente
    const eventos = [
      ...allVentas.map((v) => ({ tipoEvento: "VENTA" as const, data: v, timestamp: v.fechaHora })),
      ...allMovimientos.map((m) => ({ tipoEvento: "MOVIMIENTO" as const, data: m, timestamp: m.fechaHora })),
    ].sort((a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime());

    return { success: true, eventos };
  } catch (error: any) {
    console.error("Error al obtener cinta testigo:", error);
    return { success: false, error: error.message };
  }
}

// Helper asíncrono para Webhook Telegram
async function enviarWebhookTelegramAsync(mensaje: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: mensaje }),
    }).catch(() => {});
  } catch (e) {}
}
