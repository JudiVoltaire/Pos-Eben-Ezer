"use client";

import React, { useState } from "react";
import { Trash2, CheckCircle2, QrCode, RotateCcw, Banknote, Scale, ShoppingBag } from "lucide-react";
import { ItemVentaInput } from "@/actions/venta-actions";

interface TicketCobroPanelProps {
  items: ItemVentaInput[];
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

export function TicketCobroPanel({
  items,
  selectedIndex,
  onSelectItem,
  onRemoveItem,
  onLimpiarTicket,
  onProcesarVenta,
  isProcessing,
  ultimoTicketGenerado,
  onOpenAnularUltimo,
}: TicketCobroPanelProps) {
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "QR" | "MIXTO">("EFECTIVO");
  const [efectivoRecibidoStr, setEfectivoRecibidoStr] = useState<string>("");
  const [montoQrMixtoStr, setMontoQrMixtoStr] = useState<string>("");
  const [ventaExitosaTick, setVentaExitosaTick] = useState(false);

  // Cálculos de totales con desglose
  const subtotalBase = items.reduce((acc, it) => acc + it.precioBase, 0);
  const totalExtras = items.reduce(
    (acc, it) =>
      acc +
      it.extrasFijos.reduce((s, e) => s + e.precio, 0) +
      it.extrasLibres.reduce((s, e) => s + e.monto, 0),
    0
  );
  const totalFinal = subtotalBase + totalExtras;

  // Asistente de vuelto y billetes
  const efectivoRecibido = parseFloat(efectivoRecibidoStr) || 0;
  const saldoEfectivoRequerido =
    metodoPago === "MIXTO"
      ? Math.max(0, totalFinal - (parseFloat(montoQrMixtoStr) || 0))
      : totalFinal;

  const vuelto = Math.max(0, efectivoRecibido - saldoEfectivoRequerido);

  const generarBilletesSugeridos = (total: number) => {
    if (total <= 0) return [];
    const cortesBolivia = [10, 20, 50, 100, 200];
    const lista: number[] = [total]; // Exacto

    const prox5 = Math.ceil(total / 5) * 5;
    if (prox5 > total && !lista.includes(prox5)) lista.push(prox5);

    for (const b of cortesBolivia) {
      if (b > total && !lista.includes(b)) {
        lista.push(b);
      }
    }
    return lista.slice(0, 5);
  };

  const billetesSugeridos = generarBilletesSugeridos(saldoEfectivoRequerido);

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
      const qrMonto = Math.min(totalFinal, parseFloat(montoQrMixtoStr) || 0);
      montoQr = qrMonto;
      montoEfectivo = totalFinal - qrMonto;
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
    setTimeout(() => setVentaExitosaTick(false), 2200);

    setEfectivoRecibidoStr("");
    setMontoQrMixtoStr("");
  };

  return (
    <div className="w-full lg:w-[420px] bg-[#1C1F26] border-l border-[#2E3440] flex flex-col h-full shadow-2xl select-none">
      {/* 1. ENCABEZADO DEL TICKET */}
      <div className="p-3 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-black text-[#E5E9F0] uppercase tracking-wider">
            Ticket Activo
          </h2>
          <span className="text-[11px] font-bold text-[#94A3B8] bg-[#21252D] px-2 py-0.5 rounded-md tabular-nums">
            {items.length} platos
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onLimpiarTicket}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* 2. LISTA DE PLATOS EN EL TICKET */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#1C1F26]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#94A3B8]">
            <div className="w-14 h-14 rounded-2xl bg-[#21252D] border border-[#2E3440] flex items-center justify-center mb-2.5">
              <ShoppingBag className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <p className="text-xs font-bold text-[#E5E9F0]">Ticket en espera</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Toca un producto del catálogo para agregarlo con 1 toque.
            </p>
          </div>
        ) : (
          items.map((it, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => onSelectItem(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#21252D] border-amber-500/50 shadow-sm ring-1 ring-amber-500/30"
                    : "bg-[#16181D]/80 border-[#2E3440] hover:border-[#3E4556]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-[#E5E9F0] leading-snug">
                      {it.nombre}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] tabular-nums mt-0.5">
                      Base: Bs. {it.precioBase.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-amber-300 tabular-nums">
                      Bs. {it.totalItem.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(idx);
                      }}
                      className="text-[#94A3B8] hover:text-rose-400 p-1 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desglose de extras indentados */}
                {(it.extrasFijos.length > 0 || it.extrasLibres.length > 0) && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#2E3440] space-y-0.5 pl-2 border-l-2 border-emerald-500/30">
                    {it.extrasFijos.map((ef, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-emerald-300">
                        <span>+ {ef.nombre}</span>
                        <span className="font-bold tabular-nums">+Bs. {ef.precio.toFixed(2)}</span>
                      </div>
                    ))}
                    {it.extrasLibres.map((el, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-amber-300">
                        <span>+ {el.nota || "Extra de Cocina"}</span>
                        <span className="font-bold tabular-nums">+Bs. {el.monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. TOTAL A COBRAR GIGANTE */}
      <div className="p-3.5 bg-[#16181D] border-t border-[#2E3440]">
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-1 tabular-nums">
          <span>Base: Bs. {subtotalBase.toFixed(2)}</span>
          <span>Extras: +Bs. {totalExtras.toFixed(2)}</span>
        </div>
        <div className="flex items-baseline justify-between bg-[#21252D] border border-[#2E3440] px-4 py-2 rounded-xl">
          <span className="text-xs font-black uppercase tracking-wider text-[#E5E9F0]">
            TOTAL A COBRAR:
          </span>
          <span className="text-2xl font-black text-amber-300 tabular-nums">
            Bs. {totalFinal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4. SELECTOR DE MÉTODO DE PAGO */}
      <div className="px-3.5 pb-2 bg-[#16181D] flex gap-2">
        <button
          onClick={() => setMetodoPago("EFECTIVO")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "EFECTIVO"
              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm"
              : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:bg-[#2A303C]"
          }`}
        >
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span>💵 EFECTIVO</span>
        </button>

        <button
          onClick={() => setMetodoPago("QR")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "QR"
              ? "bg-sky-950/70 border-sky-500/50 text-sky-300 shadow-sm"
              : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:bg-[#2A303C]"
          }`}
        >
          <QrCode className="w-4 h-4 text-sky-400" />
          <span>📱 QR BANCO</span>
        </button>

        <button
          onClick={() => setMetodoPago("MIXTO")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border ${
            metodoPago === "MIXTO"
              ? "bg-purple-950/70 border-purple-500/50 text-purple-300 shadow-sm"
              : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:bg-[#2A303C]"
          }`}
        >
          <Scale className="w-4 h-4 text-purple-400" />
          <span>⚖️ MIXTO</span>
        </button>
      </div>

      {/* 5. ASISTENTES DE PAGO CON VERDE SALVIA MATE */}
      <div className="p-3.5 bg-[#1C1F26] border-t border-[#2E3440] flex flex-col gap-2.5">
        {metodoPago === "EFECTIVO" && (
          <div>
            <div className="flex items-center justify-between text-xs text-[#E5E9F0] font-bold mb-1.5">
              <span>Billetes Rápidos:</span>
              {efectivoRecibido > 0 && (
                <span className="text-amber-300 tabular-nums">
                  Recibido: Bs. {efectivoRecibido.toFixed(2)}
                </span>
              )}
            </div>

            {/* Billetes sugeridos de 1 toque */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {billetesSugeridos.map((monto, idx) => (
                <button
                  key={idx}
                  onClick={() => setEfectivoRecibidoStr(monto.toString())}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center border tabular-nums ${
                    efectivoRecibido === monto
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-sm"
                      : "bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] border-[#2E3440]"
                  }`}
                >
                  {monto === totalFinal ? "Exacto" : `Bs. ${monto}`}
                </button>
              ))}
            </div>

            {/* Vuelto Gigante en Verde Salvia Mate */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider">
                  VUELTO A ENTREGAR:
                </div>
                <div className="text-xl font-black text-emerald-300 tabular-nums">
                  Bs. {vuelto.toFixed(2)}
                </div>
              </div>
              <input
                type="number"
                placeholder="Otro monto..."
                value={efectivoRecibidoStr}
                onChange={(e) => setEfectivoRecibidoStr(e.target.value)}
                className="w-28 bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] placeholder-[#94A3B8]/60 text-xs rounded-lg px-2.5 py-1.5 text-right font-bold focus:outline-none focus:border-emerald-400 tabular-nums"
              />
            </div>
          </div>
        )}

        {metodoPago === "QR" && (
          <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1">
              <QrCode className="w-full h-full text-slate-950" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-sky-300">
                Cobro por QR Bancario
              </div>
              <div className="text-lg font-black text-sky-200 tabular-nums mt-0.5">
                Bs. {totalFinal.toFixed(2)}
              </div>
              <p className="text-[10px] text-sky-400/80 mt-0.5">
                Cliente escanea y confirmas recepción en pantalla.
              </p>
            </div>
          </div>
        )}

        {metodoPago === "MIXTO" && (
          <div className="space-y-1.5 bg-[#16181D] p-2.5 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-300">Monto QR:</span>
              <input
                type="number"
                placeholder="Bs."
                value={montoQrMixtoStr}
                onChange={(e) => setMontoQrMixtoStr(e.target.value)}
                className="w-24 bg-[#21252D] border border-purple-500/40 text-purple-200 text-xs rounded-lg px-2 py-1 text-right font-bold tabular-nums"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold tabular-nums">
              <span>Restante Efectivo:</span>
              <span>Bs. {saldoEfectivoRequerido.toFixed(2)}</span>
            </div>
            <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400">Vuelto:</span>
              <span className="text-base font-black text-emerald-300 tabular-nums">
                Bs. {vuelto.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* 6. BOTÓN DE COBRO EN 3 SEGUNDOS */}
        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleConfirmarCobro}
          className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
            ventaExitosaTick
              ? "bg-emerald-500 text-slate-950"
              : items.length === 0 || isProcessing
              ? "bg-[#21252D] text-[#94A3B8]/50 cursor-not-allowed border border-[#2E3440]"
              : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-600/20"
          }`}
        >
          {ventaExitosaTick ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>¡VENTA COBRADA CON ÉXITO!</span>
            </>
          ) : isProcessing ? (
            <span>GUARDANDO VENTA...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>COBRAR BS. {totalFinal.toFixed(2)}</span>
            </>
          )}
        </button>

        {/* 7. SALVAGUARDA DE ANULACIÓN */}
        {ultimoTicketGenerado && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#94A3B8] tabular-nums">
              Último: #{ultimoTicketGenerado.nroTicket} (Bs. {ultimoTicketGenerado.total.toFixed(2)})
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
