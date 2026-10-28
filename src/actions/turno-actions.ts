"use server";

import { db, client } from "@/db";
import { turnosCaja, usuarios, categorias, productos, toppingsFijos, ventas, movimientosCaja } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { despacharTestigoAsync } from "@/services/testigo-webhook";

// 1. Obtener Turno Activo y Estado Completo de Caja
export async function getTurnoActivo() {
  try {
    const turnos = await db
      .select()
      .from(turnosCaja)
      .where(eq(turnosCaja.estado, "ABIERTO"))
      .orderBy(desc(turnosCaja.fechaApertura))
      .limit(1);

    let turno = turnos[0] || null;

    // Si no hay turno abierto, inicializar uno con fondo de Bs. 200 para Laura
    if (!turno) {
      const allUsers = await db.select().from(usuarios);
      const cajera = allUsers.find((u) => u.rol === "CAJERA") || allUsers[0];

      const nuevoId = crypto.randomUUID();
      await db.insert(turnosCaja).values({
        id: nuevoId,
        cajeraId: cajera?.id || "u-cajera",
        fondoInicialEfectivo: 200,
        saldoEfectivoEsperado: 200,
        saldoQrAcumulado: 0,
        estado: "ABIERTO",
      });

      turno = (
        await db.select().from(turnosCaja).where(eq(turnosCaja.id, nuevoId)).limit(1)
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
            eq(movimientosCaja.turnoId, turno.id),
            eq(movimientosCaja.estadoRendicion, "PENDIENTE_COMPROBANTE")
          )
        ),
      db
        .select()
        .from(ventas)
        .where(eq(ventas.turnoId, turno.id))
        .orderBy(desc(ventas.fechaHora))
        .limit(10),
    ]);

    return {
      success: true,
      turno,
      categorias: cats,
      productos: prods,
      toppingsFijos: toppings,
      usuarios: users,
      pendientesRendir,
      ultimasVentas,
    };
  } catch (err: any) {
    console.error("Error al obtener turno activo:", err);
    return { success: false, error: err.message };
  }
}

// 2. Apertura de Nuevo Turno con Fondo Inicial
export async function abrirTurno(cajeraId: string, fondoInicialEfectivo: number) {
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
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. Arqueo Ciego y Reporte Z de Fin de Turno
export async function cerrarTurnoCaja(turnoId: string, efectivoContadoCiego: number) {
  try {
    const turno = (await db.select().from(turnosCaja).where(eq(turnosCaja.id, turnoId)).limit(1))[0];
    if (!turno) return { success: false, error: "No se encontró el turno de caja." };

    const diferencia = efectivoContadoCiego - turno.saldoEfectivoEsperado;

    await db
      .update(turnosCaja)
      .set({
        efectivoContadoCiego,
        diferenciaEfectivo: diferencia,
        fechaCierre: new Date().toISOString(),
        estado: "CERRADO",
      })
      .where(eq(turnosCaja.id, turnoId));

    const [allVentas, allMovimientos] = await Promise.all([
      db.select().from(ventas).where(eq(ventas.turnoId, turnoId)),
      db.select().from(movimientosCaja).where(eq(movimientosCaja.turnoId, turnoId)),
    ]);

    let totalPlatosBase = 0;
    let totalExtras = 0;
    const conteo: Record<string, { nombre: string; cantidad: number; total: number }> = {};

    for (const v of allVentas) {
      totalPlatosBase += v.subtotalBase;
      totalExtras += v.totalExtras;

      try {
        const snap = JSON.parse(v.snapshotTicketJson);
        for (const it of snap.items || []) {
          if (!conteo[it.nombre]) {
            conteo[it.nombre] = { nombre: it.nombre, cantidad: 0, total: 0 };
          }
          conteo[it.nombre].cantidad += 1;
          conteo[it.nombre].total += it.totalItem;
        }
      } catch (e) {}
    }

    const top5 = Object.values(conteo)
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
      top5Productos: top5,
      movimientos: allMovimientos,
    };

    despacharTestigoAsync("CIERRE_Z", reporteZ);

    revalidatePath("/");
    return { success: true, reporteZ };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
