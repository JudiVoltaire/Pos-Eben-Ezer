"use client";

import React, { useState } from "react";
import {
  Trash2,
  CheckCircle2,
  QrCode,
  RotateCcw,
  Banknote,
  Scale,
  Sparkles,
} from "lucide-react";
import { ItemVentaPayload } from "@/server/actions";

interface TicketPanelProps {
  items: ItemVentaPayload[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onLimpiarTicket: () => void;
  onProcesarVenta: (datosPago: {
    metodoPago: "EFECTIVO" | "QR" | "MIXTO";
    montoEfectivo: number;
    montoQr: number;
    efectivoRecibido: number;
    vueltoEntregado: number;
  }) => Promise<void>;
  isProcessing: boolean;
  ultimoTicketGenerado?: {
    nroTicket: number;
    ventaId: string;
    total: number;
  } | null;
  onOpenAnularUltimo: () => void;
}

export function TicketPanel({
  items,
  selectedIndex,
  onSelectItem,
  onRemoveItem,
  onLimpiarTicket,
  onProcesarVenta,
  isProcessing,
  ultimoTicketGenerado,
  onOpenAnularUltimo,
}: TicketPanelProps) {
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "QR" | "MIXTO">(
    "EFECTIVO"
  );
  const [efectivoRecibidoStr, setEfectivoRecibidoStr] = useState<string>("");
  const [montoQrMixtoStr, setMontoQrMixtoStr] = useState<string>("");
  const [ventaExitosaTick, setVentaExitosaTick] = useState(false);

  // Totales
  const subtotalBase = items.reduce((acc, item) => acc + item.precioBase, 0);
  const totalExtras = items.reduce(
    (acc, item) =>
      acc +
      item.extrasFijos.reduce((sum, e) => sum + e.precio, 0) +
      item.extrasLibres.reduce((sum, e) => sum + e.monto, 0),
    0
  );
  const totalFinal = subtotalBase + totalExtras;

  // Asistente de billetes rápidos automáticos
  const efectivoRecibido = parseFloat(efectivoRecibidoStr) || 0;
  const vuelto = Math.max(0, efectivoRecibido - (metodoPago === "MIXTO" ? (totalFinal - (parseFloat(montoQrMixtoStr) || 0)) : totalFinal));

  // Generador inteligente de botones de billetes rápidos
  const generarBilletesRapidos = (total: number) => {
    if (total <= 0) return [];
    const billetesEstandar = [10, 20, 50, 100, 200];
    const opciones: number[] = [total]; // Monto exacto siempre primero

    // Redondeo hacia arriba al múltiplo de 5 o 10 más cercano
    const prox5 = Math.ceil(total / 5) * 5;
    if (prox5 > total && !opciones.includes(prox5)) opciones.push(prox5);

    const prox10 = Math.ceil(total / 10) * 10;
    if (prox10 > total && !opciones.includes(prox10)) opciones.push(prox10);

    for (const b of billetesEstandar) {
      if (b > total && !opciones.includes(b)) {
        opciones.push(b);
      }
    }

    return opciones.slice(0, 5);
  };

  const billetesSugeridos = generarBilletesRapidos(
    metodoPago === "MIXTO"
      ? Math.max(0, totalFinal - (parseFloat(montoQrMixtoStr) || 0))
      : totalFinal
  );

  const handleConfirmarCobro = async () => {
    if (items.length === 0 || isProcessing) return;

    let montoEfectivo = 0;
    let montoQr = 0;
    let rec = 0;
    let vuel = 0;

    if (metodoPago === "EFECTIVO") {
      montoEfectivo = totalFinal;
      rec = efectivoRecibido >= totalFinal ? efectivoRecibido : totalFinal;
      vuel = rec - totalFinal;
    } else if (metodoPago === "QR") {
      montoQr = totalFinal;
      rec = 0;
      vuel = 0;
    } else {
      // MIXTO
      const qrPart = Math.min(totalFinal, parseFloat(montoQrMixtoStr) || 0);
      montoQr = qrPart;
      montoEfectivo = totalFinal - qrPart;
      rec = efectivoRecibido >= montoEfectivo ? efectivoRecibido : montoEfectivo;
      vuel = rec - montoEfectivo;
    }

    await onProcesarVenta({
      metodoPago,
      montoEfectivo,
      montoQr,
      efectivoRecibido: rec,
      vueltoEntregado: vuel,
    });

    setVentaExitosaTick(true);
    setTimeout(() => setVentaExitosaTick(false), 2500);

    // Reset de montos de cobro
    setEfectivoRecibidoStr("");
    setMontoQrMixtoStr("");
  };

  return (
    <div className="w-full lg:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl select-none">
      {/* 1. ENCABEZADO DEL TICKET */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
            Ticket de Venta Activo
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {items.length} ítems
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onLimpiarTicket}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:bg-rose-950/60 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* 2. LISTA DE ÍTEMS DEL PEDIDO */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-900/60">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              Ticket vacío
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Toca cualquier plato del catálogo para agregarlo instantáneamente.
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => onSelectItem(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/50"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-100 leading-snug">
                      {item.nombre}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">
                      Base: Bs. {item.precioBase.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-amber-300">
                      Bs. {item.totalItem.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(idx);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extras indentados */}
                {(item.extrasFijos.length > 0 || item.extrasLibres.length > 0) && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 space-y-1 pl-2 border-l-2 border-emerald-500/40">
                    {item.extrasFijos.map((ef, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-emerald-300"
                      >
                        <span>+ {ef.nombre}</span>
                        <span className="font-bold">+ Bs. {ef.precio.toFixed(2)}</span>
                      </div>
                    ))}
                    {item.extrasLibres.map((el, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-amber-300"
                      >
                        <span>+ {el.nota || "Extra de Cocina"}</span>
                        <span className="font-bold">+ Bs. {el.monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. TOTAL GIGANTE Y DESGLOSE */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Subtotal Base: Bs. {subtotalBase.toFixed(2)}</span>
          <span>Extras: +Bs. {totalExtras.toFixed(2)}</span>
        </div>
        <div className="flex items-baseline justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            TOTAL A COBRAR:
          </span>
          <span className="text-3xl font-black text-amber-400 tracking-tight">
            Bs. {totalFinal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4. SELECTOR DE MÉTODO DE PAGO */}
      <div className="px-3.5 pb-2 bg-slate-950 flex gap-2">
        <button
          onClick={() => setMetodoPago("EFECTIVO")}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "EFECTIVO"
              ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>💵 EFECTIVO</span>
        </button>

        <button
          onClick={() => setMetodoPago("QR")}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "QR"
              ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>📱 QR BANCO</span>
        </button>

        <button
          onClick={() => setMetodoPago("MIXTO")}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "MIXTO"
              ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ MIXTO</span>
        </button>
      </div>

      {/* 5. ASISTENTES DE PAGO (EFECTIVO / QR / MIXTO) */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-col gap-2.5">
        {metodoPago === "EFECTIVO" && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
              <span>Billetes Rápidos (Efectivo Recibido):</span>
              {efectivoRecibido > 0 && (
                <span className="text-amber-400 font-black">
                  Recibido: Bs. {efectivoRecibido.toFixed(2)}
                </span>
              )}
            </div>

            {/* Chips de Billetes Rápidos */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {billetesSugeridos.map((monto, idx) => (
                <button
                  key={idx}
                  onClick={() => setEfectivoRecibidoStr(monto.toString())}
                  className={`py-1.5 px-1 rounded-xl text-xs font-black transition cursor-pointer text-center border ${
                    efectivoRecibido === monto
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                >
                  {monto === totalFinal ? "Exacto" : `Bs. ${monto}`}
                </button>
              ))}
            </div>

            {/* Vuelto Gigante en Verde de Alto Contraste */}
            <div className="bg-emerald-950 border-2 border-emerald-500/60 rounded-2xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  VUELTO A ENTREGAR:
                </div>
                <div className="text-2xl font-black text-emerald-300">
                  Bs. {vuelto.toFixed(2)}
                </div>
              </div>
              <input
                type="number"
                placeholder="Otro monto..."
                value={efectivoRecibidoStr}
                onChange={(e) => setEfectivoRecibidoStr(e.target.value)}
                className="w-28 bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-2.5 py-1.5 text-right font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        )}

        {metodoPago === "QR" && (
          <div className="bg-blue-950/60 border border-blue-500/40 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner">
              {/* Código QR Simulado Limpio */}
              <QrCode className="w-full h-full text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-blue-300">
                Cobro por QR Bancario
              </div>
              <div className="text-xl font-black text-blue-200 mt-0.5">
                Bs. {totalFinal.toFixed(2)}
              </div>
              <p className="text-[11px] text-blue-400 mt-0.5">
                Pide al cliente escanear el QR y presiona confirmar.
              </p>
            </div>
          </div>
        )}

        {metodoPago === "MIXTO" && (
          <div className="space-y-2 bg-slate-950 p-2.5 rounded-2xl border border-purple-500/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-300">Parte QR:</span>
              <input
                type="number"
                placeholder="Bs. QR"
                value={montoQrMixtoStr}
                onChange={(e) => setMontoQrMixtoStr(e.target.value)}
                className="w-28 bg-slate-900 border border-purple-500/50 text-purple-200 text-xs rounded-lg px-2.5 py-1 text-right font-black"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Restante Efectivo:</span>
              <span>
                Bs.{" "}
                {Math.max(
                  0,
                  totalFinal - (parseFloat(montoQrMixtoStr) || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-2 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Vuelto:</span>
              <span className="text-lg font-black text-emerald-300">
                Bs. {vuelto.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* 6. BOTÓN GIGANTE DE CONFIRMAR COBRO EN 3 SEGUNDOS */}
        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleConfirmarCobro}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-98 ${
            ventaExitosaTick
              ? "bg-emerald-500 text-slate-950 animate-bounce"
              : items.length === 0 || isProcessing
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30"
          }`}
        >
          {ventaExitosaTick ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-slate-950" />
              <span>¡VENTA REGISTRADA CON ÉXITO!</span>
            </>
          ) : isProcessing ? (
            <span>PROCESANDO VENTA...</span>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              <span>CONFIRMAR COBRO (Bs. {totalFinal.toFixed(2)})</span>
            </>
          )}
        </button>

        {/* 7. SALVAGUARDAS: ANULAR ÚLTIMO TICKET */}
        {ultimoTicketGenerado && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400">
              Último ticket: #{ultimoTicketGenerado.nroTicket} (Bs.{" "}
              {ultimoTicketGenerado.total.toFixed(2)})
            </span>
            <button
              onClick={onOpenAnularUltimo}
              className="text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Anular con PIN Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
