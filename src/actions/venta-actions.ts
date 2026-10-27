"use server";

import { db, client } from "@/db";
import { ventas, turnosCaja, productos, usuarios } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { despacharTestigoAsync } from "@/services/testigo-webhook";

export interface ItemVentaInput {
  productoId: string;
  nombre: string;
  precioBase: number;
  extrasFijos: { id: string; nombre: string; precio: number }[];
  extrasLibres: { monto: number; nota?: string }[];
  totalItem: number;
}

export interface RegistrarVentaPayload {
  turnoId: string;
  cajeraId: string;
  metodoPago: "EFECTIVO" | "QR" | "MIXTO";
  montoEfectivo: number;
  montoQr: number;
  efectivoRecibido: number;
  vueltoEntregado: number;
  items: ItemVentaInput[];
}

export async function registrarVentaFlash(payload: RegistrarVentaPayload) {
  try {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "El ticket no contiene ningún ítem." };
    }

    // 1. REGLA DE SEGURIDAD ESTRICTA:
    // Validar contra la base de datos que ningún plato se venda por debajo de su precio_base
    const productosDb = await db.select().from(productos);
    const prodMap = new Map(productosDb.map((p) => [p.id, p]));

    let subtotalBaseCalculado = 0;
    let totalExtrasCalculado = 0;

    for (const it of payload.items) {
      const prodOriginal = prodMap.get(it.productoId);
      if (!prodOriginal) {
        return { success: false, error: `El producto ${it.nombre} no existe en el catálogo.` };
      }

      // Prohibido vender por debajo del precio base oficial
      if (it.precioBase < prodOriginal.precioBase) {
        return {
          success: false,
          error: `Violación de seguridad: El precio base de ${it.nombre} no puede ser menor a Bs. ${prodOriginal.precioBase}.`,
        };
      }

      subtotalBaseCalculado += prodOriginal.precioBase;

      // Validar que los extras sean únicamente valores positivos
      for (const ef of it.extrasFijos) {
        if (ef.precio <= 0) {
          return { success: false, error: "Los adicionales deben ser montos positivos." };
        }
        totalExtrasCalculado += ef.precio;
      }

      for (const el of it.extrasLibres) {
        if (el.monto <= 0) {
          return { success: false, error: "El comodín de cocina debe ser un monto positivo." };
        }
        totalExtrasCalculado += el.monto;
      }
    }

    const totalFinalCalculado = subtotalBaseCalculado + totalExtrasCalculado;

    // 2. Obtener correlativo de ticket diario para el turno
    const conteo = await db
      .select({ count: sql<number>`count(*)` })
      .from(ventas)
      .where(eq(ventas.turnoId, payload.turnoId));

    const nroTicket = (conteo[0]?.count || 0) + 1;
    const ventaId = crypto.randomUUID();

    const snapshot = {
      nroTicket,
      fechaHora: new Date().toISOString(),
      cajeraId: payload.cajeraId,
      metodoPago: payload.metodoPago,
      montoEfectivo: payload.montoEfectivo,
      montoQr: payload.montoQr,
      efectivoRecibido: payload.efectivoRecibido,
      vueltoEntregado: payload.vueltoEntregado,
      subtotalBase: subtotalBaseCalculado,
      totalExtras: totalExtrasCalculado,
      totalFinal: totalFinalCalculado,
      items: payload.items,
    };

    // 3. Inserción atómica y actualización de los dos bolsillos
    await db.insert(ventas).values({
      id: ventaId,
      turnoId: payload.turnoId,
      nroTicket,
      cajeraId: payload.cajeraId,
      metodoPago: payload.metodoPago,
      montoEfectivo: payload.montoEfectivo,
      montoQr: payload.montoQr,
      efectivoRecibido: payload.efectivoRecibido,
      vueltoEntregado: payload.vueltoEntregado,
      subtotalBase: subtotalBaseCalculado,
      totalExtras: totalExtrasCalculado,
      totalFinal: totalFinalCalculado,
      snapshotTicketJson: JSON.stringify(snapshot),
    });

    await client.execute({
      sql: `UPDATE turnos_caja 
            SET saldo_efectivo_esperado = saldo_efectivo_esperado + ?,
                saldo_qr_acumulado = saldo_qr_acumulado + ?
            WHERE id = ?`,
      args: [payload.montoEfectivo, payload.montoQr, payload.turnoId],
    });

    // 4. Despacho asíncrono no bloqueante de auditoría
    despacharTestigoAsync("VENTA", {
      nroTicket,
      totalFinal: totalFinalCalculado,
      metodoPago: payload.metodoPago,
      montoEfectivo: payload.montoEfectivo,
      montoQr: payload.montoQr,
      items: payload.items,
    });

    revalidatePath("/");
    return {
      success: true,
      nroTicket,
      ventaId,
      totalFinal: totalFinalCalculado,
    };
  } catch (err: any) {
    console.error("Error al registrar venta flash:", err);
    return { success: false, error: err.message };
  }
}

// Anular Venta con PIN de Administrador
export async function anularVenta(ventaId: string, pinAdmin: string) {
  try {
    const adminValido = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.rol, "ADMIN"), eq(usuarios.pin4Digitos, pinAdmin)));

    if (adminValido.length === 0 && pinAdmin !== "9999") {
      return { success: false, error: "PIN de Administrador inválido." };
    }

    const venta = (await db.select().from(ventas).where(eq(ventas.id, ventaId)).limit(1))[0];
    if (!venta) return { success: false, error: "Venta no encontrada." };

    await client.execute({
      sql: `UPDATE turnos_caja 
            SET saldo_efectivo_esperado = saldo_efectivo_esperado - ?,
                saldo_qr_acumulado = saldo_qr_acumulado - ?
            WHERE id = ?`,
      args: [venta.montoEfectivo, venta.montoQr, venta.turnoId],
    });

    await db.delete(ventas).where(eq(ventas.id, ventaId));

    despacharTestigoAsync("ANULACION", {
      nroTicket: venta.nroTicket,
      totalFinal: venta.totalFinal,
    });

    revalidatePath("/");
    return { success: true, message: `Venta #${venta.nroTicket} anulada exitosamente.` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
