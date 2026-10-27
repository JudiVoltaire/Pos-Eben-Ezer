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
    <div className="w-full lg:w-[430px] bg-[#1C1F26] border-l border-[#2E3440] flex flex-col h-full shadow-2xl select-none shrink-0">
      {/* 1. ENCABEZADO DEL TICKET */}
      <div className="h-12 px-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34D399]" />
          <h2 className="text-xs font-bold text-[#E5E9F0] uppercase tracking-wider">
            Ticket Activo
          </h2>
          <span className="text-xs font-mono font-medium text-[#94A3B8] bg-[#21252D] px-2 py-0.5 rounded-md tabular-nums border border-[#2E3440]">
            {items.length} platos
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onLimpiarTicket}
            className="text-xs text-[#FB7185] hover:text-[#FB7185] font-medium hover:bg-[rgba(244,63,94,0.12)] px-2.5 py-1 rounded-lg transition-all duration-75 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* 2. LISTA DE PLATOS EN EL TICKET */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#1C1F26]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#94A3B8]">
            <div className="w-14 h-14 rounded-2xl bg-[#21252D] border border-[#2E3440] flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <p className="text-sm font-semibold text-[#E5E9F0]">Ticket en espera</p>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-[220px]">
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
                className={`p-3 rounded-lg border transition-all duration-75 cursor-pointer ${
                  isSelected
                    ? "bg-[#262B35] border-l-[3px] border-l-[#FBBF24] border-t-[#2E3440] border-r-[#2E3440] border-b-[#2E3440] shadow-sm"
                    : "bg-[#21252D] border-[#2E3440] hover:bg-[#2A303C]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-[#E5E9F0] leading-snug">
                      {it.nombre}
                    </div>
                    <div className="text-xs font-mono text-[#94A3B8] tabular-nums mt-0.5">
                      Base: Bs. {it.precioBase.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm font-mono tabular-nums text-[#FBBF24]">
                      Bs. {it.totalItem.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(idx);
                      }}
                      className="text-[#94A3B8] hover:text-[#FB7185] p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desglose de extras indentados */}
                {(it.extrasFijos.length > 0 || it.extrasLibres.length > 0) && (
                  <div className="mt-2 pt-2 border-t border-[#2E3440] space-y-1 pl-3 border-l border-[#2E3440] text-xs text-[#94A3B8]">
                    {it.extrasFijos.map((ef, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-[#94A3B8]">
                        <span>+ {ef.nombre}</span>
                        <span className="font-mono tabular-nums font-semibold text-[#34D399]">
                          +Bs. {ef.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {it.extrasLibres.map((el, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-[#94A3B8]">
                        <span>+ {el.nota || "Extra de Cocina"}</span>
                        <span className="font-mono tabular-nums font-semibold text-[#FBBF24]">
                          +Bs. {el.monto.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. ZONA DE COBRO ANCLADA ABAJO */}
      <div className="p-4 bg-[#16181D]/95 border-t border-[#2E3440] space-y-3 shrink-0">
        {/* Cabecera de Total */}
        <div className="flex items-baseline justify-between bg-[#21252D] border border-[#2E3440] px-4 py-2.5 rounded-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              TOTAL A COBRAR
            </span>
            <span className="text-[11px] font-mono text-[#94A3B8] tabular-nums">
              Base: Bs. {subtotalBase.toFixed(2)} | Extras: Bs. {totalExtras.toFixed(2)}
            </span>
          </div>
          <span className="text-3xl font-extrabold font-mono tabular-nums text-[#E5E9F0]">
            Bs. {totalFinal.toFixed(2)}
          </span>
        </div>

        {/* Selector de Método de Pago */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMetodoPago("EFECTIVO")}
            className={`h-12 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-75 cursor-pointer ${
              metodoPago === "EFECTIVO"
                ? "bg-[rgba(16,185,129,0.14)] border border-[rgba(16,185,129,0.35)] text-[#34D399] shadow-sm"
                : "bg-[#21252D] border border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
            }`}
          >
            <Banknote className="w-4 h-4 text-[#34D399]" />
            <span>EFECTIVO</span>
          </button>

          <button
            onClick={() => setMetodoPago("QR")}
            className={`h-12 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-75 cursor-pointer ${
              metodoPago === "QR"
                ? "bg-[rgba(56,189,248,0.14)] border border-[rgba(56,189,248,0.35)] text-[#38BDF8] shadow-sm"
                : "bg-[#21252D] border border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
            }`}
          >
            <QrCode className="w-4 h-4 text-[#38BDF8]" />
            <span>QR BANCO</span>
          </button>

          <button
            onClick={() => setMetodoPago("MIXTO")}
            className={`h-12 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-75 cursor-pointer ${
              metodoPago === "MIXTO"
                ? "bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.35)] text-[#FBBF24] shadow-sm"
                : "bg-[#21252D] border border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
            }`}
          >
            <Scale className="w-4 h-4 text-[#FBBF24]" />
            <span>PAGO MIXTO</span>
          </button>
        </div>

        {/* Asistente de Efectivo: Botonera de Billetes Rápidos y Caja de Vuelto */}
        {metodoPago === "EFECTIVO" && (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-1.5">
              {billetesSugeridos.map((monto, idx) => (
                <button
                  key={idx}
                  onClick={() => setEfectivoRecibidoStr(monto.toString())}
                  className={`h-11 rounded-lg text-xs font-mono tabular-nums font-bold transition-all duration-75 cursor-pointer border ${
                    efectivoRecibido === monto
                      ? "bg-[rgba(16,185,129,0.25)] border-[rgba(16,185,129,0.5)] text-[#34D399]"
                      : "bg-[#21252D] border-[#2E3440] text-[#E5E9F0] hover:border-[#34D399]/50 hover:bg-[#2A303C] active:scale-[0.98]"
                  }`}
                >
                  {monto === totalFinal ? "Exacto" : `Bs. ${monto}`}
                </button>
              ))}
            </div>

            {/* Caja de Alto Contraste para el Vuelto */}
            <div className="p-3 rounded-xl bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.35)] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                  VUELTO A ENTREGAR:
                </div>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-[#34D399]">
                  Bs. {vuelto.toFixed(2)}
                </div>
              </div>
              <input
                type="number"
                placeholder="Otro monto..."
                value={efectivoRecibidoStr}
                onChange={(e) => setEfectivoRecibidoStr(e.target.value)}
                className="w-28 bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] placeholder-[#94A3B8] text-xs rounded-lg px-2.5 py-2 text-right font-mono font-bold focus:outline-none focus:border-[#34D399]/60 tabular-nums"
              />
            </div>
          </div>
        )}

        {metodoPago === "QR" && (
          <div className="p-3 rounded-xl bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.3)] flex items-center gap-3">
            <div className="w-12 h-12 bg-[#21252D] border border-[#2E3440] rounded-lg flex items-center justify-center p-2 shrink-0">
              <QrCode className="w-full h-full text-[#38BDF8]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Cobro por QR Bancario
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-[#E5E9F0] mt-0.5">
                Bs. {totalFinal.toFixed(2)}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Cliente escanea y confirmas recepción en pantalla.
              </p>
            </div>
          </div>
        )}

        {metodoPago === "MIXTO" && (
          <div className="space-y-2 bg-[#21252D] p-3 rounded-xl border border-[#2E3440]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#FBBF24]">Monto en QR:</span>
              <input
                type="number"
                placeholder="Bs."
                value={montoQrMixtoStr}
                onChange={(e) => setMontoQrMixtoStr(e.target.value)}
                className="w-28 bg-[#16181D] border border-[#2E3440] text-[#FBBF24] font-mono tabular-nums text-xs rounded-lg px-2.5 py-1.5 text-right font-bold focus:outline-none focus:border-[#FBBF24]/60"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#E5E9F0] font-medium pt-1 border-t border-[#2E3440]">
              <span className="text-[#94A3B8]">Restante en Efectivo:</span>
              <span className="font-mono tabular-nums font-bold text-[#34D399]">
                Bs. {saldoEfectivoRequerido.toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[rgba(16,185,129,0.14)] border border-[rgba(16,185,129,0.3)] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#94A3B8]">Vuelto:</span>
              <span className="text-lg font-bold font-mono tabular-nums text-[#34D399]">
                Bs. {vuelto.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Botón Principal de Confirmación */}
        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleConfirmarCobro}
          className={`w-full h-14 rounded-xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer active:scale-[0.99] shadow-lg ${
            ventaExitosaTick
              ? "bg-[#34D399] text-[#16181D]"
              : items.length === 0 || isProcessing
              ? "bg-[#21252D] text-[#94A3B8] cursor-not-allowed border border-[#2E3440]"
              : "bg-[#10B981] hover:bg-[#059669] text-[#16181D]"
          }`}
        >
          {ventaExitosaTick ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#16181D]" />
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

        {/* Salvaguarda de Anulación Rápida */}
        {ultimoTicketGenerado && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#94A3B8] font-mono tabular-nums">
              Último: #{ultimoTicketGenerado.nroTicket} (Bs. {ultimoTicketGenerado.total.toFixed(2)})
            </span>
            <button
              onClick={onOpenAnularUltimo}
              className="text-[#FB7185] hover:text-[#FB7185] bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.25)] hover:bg-[rgba(244,63,94,0.2)] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
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
