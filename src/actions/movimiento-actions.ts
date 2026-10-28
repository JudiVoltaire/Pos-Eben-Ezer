"use server";

import { db, client } from "@/db";
import { movimientosCaja, turnosCaja, usuarios, ventas } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { despacharTestigoAsync } from "@/services/testigo-webhook";

export interface RegistrarSalidaInput {
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

export async function registrarSalidaDinero(input: RegistrarSalidaInput) {
  try {
    if (input.monto <= 0) {
      return { success: false, error: "El monto debe ser mayor a 0 Bs." };
    }

    let receptorNombre = "Personal";

    // Validar PIN de 4 dígitos del receptor
    if (input.receptorId && input.pinReceptor) {
      const receptor = (
        await db.select().from(usuarios).where(eq(usuarios.id, input.receptorId)).limit(1)
      )[0];

      if (!receptor || receptor.pin4Digitos !== input.pinReceptor) {
        return { success: false, error: "El PIN ingresado no coincide con el receptor seleccionado." };
      }
      receptorNombre = receptor.nombre;
    }

    const estadoRendicion =
      input.tipo === "GASTO_INSUMOS" ? "PENDIENTE_COMPROBANTE" : "NO_APLICA";

    const movimientoId = crypto.randomUUID();

    await db.insert(movimientosCaja).values({
      id: movimientoId,
      turnoId: input.turnoId,
      tipo: input.tipo,
      bolsillo: input.bolsillo,
      monto: input.monto,
      motivo: input.motivo,
      notaOpcional: input.notaOpcional || null,
      registradoPorId: input.registradoPorId,
      receptorId: input.receptorId || null,
      estadoRendicion,
    });

    // Actualización estricta por bolsillo
    if (input.tipo === "INGRESO_CAMBIO") {
      if (input.bolsillo === "EFECTIVO_CAJON") {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_efectivo_esperado = saldo_efectivo_esperado + ? WHERE id = ?`,
          args: [input.monto, input.turnoId],
        });
      } else {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_qr_acumulado = saldo_qr_acumulado + ? WHERE id = ?`,
          args: [input.monto, input.turnoId],
        });
      }
    } else {
      // Salidas / Retiros a bóveda / Compra insumos
      if (input.bolsillo === "EFECTIVO_CAJON") {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_efectivo_esperado = saldo_efectivo_esperado - ? WHERE id = ?`,
          args: [input.monto, input.turnoId],
        });
      } else {
        await client.execute({
          sql: `UPDATE turnos_caja SET saldo_qr_acumulado = saldo_qr_acumulado - ? WHERE id = ?`,
          args: [input.monto, input.turnoId],
        });
      }
    }

    despacharTestigoAsync("SALIDA", {
      monto: input.monto,
      bolsillo: input.bolsillo,
      tipo: input.tipo,
      motivo: input.motivo,
      receptorNombre,
      notaOpcional: input.notaOpcional,
    });

    revalidatePath("/");
    return { success: true, movimientoId };
  } catch (err: any) {
    console.error("Error al registrar salida de dinero:", err);
    return { success: false, error: err.message };
  }
}

// Cargar Foto Comprobante de Rendición
export async function adjuntarComprobanteFoto(movimientoId: string, fotoBase64: string) {
  try {
    await db
      .update(movimientosCaja)
      .set({
        comprobanteFotoUrl: fotoBase64,
        estadoRendicion: "RESPALDADO",
      })
      .where(eq(movimientosCaja.id, movimientoId));

    revalidatePath("/");
    return { success: true, message: "Foto del recibo guardada correctamente." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Obtener Cinta Testigo Intercalada Cronológicamente
export async function getCintaTestigoTurno(turnoId: string) {
  try {
    const [allVentas, allMovimientos, allUsers] = await Promise.all([
      db.select().from(ventas).where(eq(ventas.turnoId, turnoId)).orderBy(desc(ventas.fechaHora)),
      db.select().from(movimientosCaja).where(eq(movimientosCaja.turnoId, turnoId)).orderBy(desc(movimientosCaja.fechaHora)),
      db.select().from(usuarios),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.id, u.nombre]));

    const eventos = [
      ...allVentas.map((v) => ({
        tipoEvento: "VENTA" as const,
        data: {
          ...v,
          cajeraNombre: userMap.get(v.cajeraId) || "Cajera",
        },
        timestamp: v.fechaHora,
      })),
      ...allMovimientos.map((m) => ({
        tipoEvento: "MOVIMIENTO" as const,
        data: {
          ...m,
          registradoPorNombre: userMap.get(m.registradoPorId) || "Cajera",
          receptorNombre: m.receptorId ? userMap.get(m.receptorId) : undefined,
        },
        timestamp: m.fechaHora,
      })),
    ].sort((a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime());

    return { success: true, eventos };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
