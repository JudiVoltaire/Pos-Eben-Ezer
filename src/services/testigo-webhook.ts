// Servicio de Auditoría Externa Asíncrono (Telegram / Webhook)
export async function despacharTestigoAsync(tipo: "VENTA" | "SALIDA" | "ANULACION" | "CIERRE_Z", data: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Si no está configurado Telegram, no bloquea nada
    return;
  }

  let mensaje = "";
  const ahora = new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });

  if (tipo === "VENTA") {
    mensaje = `[VENTA #${data.nroTicket}] [${ahora}]\n` +
      `*Total:* Bs. ${data.totalFinal?.toFixed(2)}\n` +
      `*Método:* ${data.metodoPago} (Efectivo: Bs. ${data.montoEfectivo?.toFixed(2)} | QR: Bs. ${data.montoQr?.toFixed(2)})\n` +
      `*Ítems:* ${(data.items || []).map((i: any) => i.nombre).join(", ")}`;
  } else if (tipo === "SALIDA") {
    mensaje = `[SALIDA DE CAJA] [${ahora}]\n` +
      `*Monto:* Bs. ${data.monto?.toFixed(2)} (${data.bolsillo})\n` +
      `*Motivo:* ${data.motivo} (${data.tipo})\n` +
      `*Receptor:* ${data.receptorNombre || "Personal"} (Firmado con PIN)\n` +
      (data.notaOpcional ? `*Nota:* "${data.notaOpcional}"` : "");
  } else if (tipo === "ANULACION") {
    mensaje = `[VENTA ANULADA #${data.nroTicket}] [${ahora}]\n` +
      `*Monto Revertido:* Bs. ${data.totalFinal?.toFixed(2)}\n` +
      `*Autorizado por:* Administrador (PIN verificado)`;
  } else if (tipo === "CIERRE_Z") {
    mensaje = `[REPORTE Z - CIERRE DE TURNO] [${ahora}]\n` +
      `*Esperado en Cajón:* Bs. ${data.saldoEfectivoEsperado?.toFixed(2)}\n` +
      `*Contado Físico:* Bs. ${data.efectivoContadoCiego?.toFixed(2)}\n` +
      `*Diferencia:* Bs. ${data.diferenciaEfectivo?.toFixed(2)}\n` +
      `*Total QR Acumulado:* Bs. ${data.saldoQrAcumulado?.toFixed(2)}\n` +
      `*Total Ventas:* ${data.totalVentasRealizadas}`;
  }

  try {
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: "Markdown",
      }),
    }).catch(() => {});
  } catch (err) {
    // Falla silenciosa para no interrumpir el flujo transaccional
  }
}
