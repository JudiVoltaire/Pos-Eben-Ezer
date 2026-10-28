"use client";

import React, { useState } from "react";
import { Trash2, Check, QrCode, RotateCcw, Banknote, Scale, Receipt } from "lucide-react";
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
    <div className="w-full lg:w-[410px] bg-[#161920] border-l border-[#262B36] flex flex-col h-full select-none shrink-0">
      {/* 1. ENCABEZADO DEL TICKET */}
      <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7D8597]">
            TICKET ACTIVO
          </span>
          <span className="text-[11px] font-mono font-medium text-[#C5CBD6] bg-[#1E222B] px-2 py-0.5 rounded border border-[#2D3340] tabular-nums">
            {items.length} ítems
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onLimpiarTicket}
            className="text-[11px] text-[#7D8597] hover:text-[#FB7185] font-medium hover:bg-[rgba(244,63,94,0.1)] px-2 py-1 rounded transition-all duration-75 cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* 2. LISTA DE ÍTEMS DEL TICKET (TABLA LIMPIA) */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#262B36] bg-[#161920]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#646E82]">
            <Receipt className="w-8 h-8 text-[#323946] stroke-[1.5] mb-2.5" />
            <p className="text-xs text-[#646E82]">Orden lista para ingreso rápido</p>
          </div>
        ) : (
          items.map((it, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => onSelectItem(idx)}
                className={`py-2.5 px-3.5 transition-all duration-75 cursor-pointer ${
                  isSelected
                    ? "bg-[#232834] border-l-2 border-l-[#F59E0B]"
                    : "hover:bg-[#1C2029]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-xs text-[#E5E9F0] leading-snug">
                      {it.nombre}
                    </div>
                    <div className="text-[11px] font-mono text-[#7D8597] tabular-nums mt-0.5">
                      Base: Bs. {it.precioBase.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs font-mono tabular-nums text-[#E5E9F0]">
                      Bs. {it.totalItem.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(idx);
                      }}
                      className="text-[#646E82] hover:text-[#FB7185] p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                {/* Desglose de extras */}
                {(it.extrasFijos.length > 0 || it.extrasLibres.length > 0) && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#262B36] space-y-0.5 pl-2.5 border-l border-[#2D3340] text-[11px] text-[#7D8597]">
                    {it.extrasFijos.map((ef, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]">
                        <span>+ {ef.nombre}</span>
                        <span className="font-mono tabular-nums text-[#34D399]">
                          +Bs. {ef.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {it.extrasLibres.map((el, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]">
                        <span>+ {el.nota || "Extra de Cocina"}</span>
                        <span className="font-mono tabular-nums text-[#F59E0B]">
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

      {/* 3. CONSOLA DE LIQUIDACIÓN Y COBRO */}
      <div className="bg-[#14171D] border-t border-[#262B36] p-4 space-y-3 shrink-0">
        {/* Cabecera de Total */}
        <div className="flex items-baseline justify-between bg-[#1A1D24] border border-[#262B36] px-3.5 py-2.5 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block">
              TOTAL A LIQUIDAR
            </span>
            <span className="text-[10px] font-mono text-[#646E82] tabular-nums">
              Base: {subtotalBase.toFixed(2)} | Extras: {totalExtras.toFixed(2)}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#E5E9F0]">
            <span className="text-sm font-normal text-[#8A94A6] mr-1">Bs.</span>
            {totalFinal.toFixed(2)}
          </div>
        </div>

        {/* Selector de Pago en Pestañas Segmentadas */}
        <div className="bg-[#1A1D24] p-1 rounded-lg border border-[#262B36] grid grid-cols-3 gap-1">
          <button
            onClick={() => setMetodoPago("EFECTIVO")}
            className={`h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all duration-75 cursor-pointer ${
              metodoPago === "EFECTIVO"
                ? "bg-[#252B37] text-[#E5E9F0] border border-[#363E4F] shadow-sm"
                : "text-[#7D8597] hover:text-[#E5E9F0]"
            }`}
          >
            <Banknote className="w-3.5 h-3.5 mr-1.5 text-[#34D399]" strokeWidth={1.75} />
            <span>EFECTIVO</span>
          </button>

          <button
            onClick={() => setMetodoPago("QR")}
            className={`h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all duration-75 cursor-pointer ${
              metodoPago === "QR"
                ? "bg-[#252B37] text-[#E5E9F0] border border-[#363E4F] shadow-sm"
                : "text-[#7D8597] hover:text-[#E5E9F0]"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" strokeWidth={1.75} />
            <span>QR BANCO</span>
          </button>

          <button
            onClick={() => setMetodoPago("MIXTO")}
            className={`h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all duration-75 cursor-pointer ${
              metodoPago === "MIXTO"
                ? "bg-[#252B37] text-[#E5E9F0] border border-[#363E4F] shadow-sm"
                : "text-[#7D8597] hover:text-[#E5E9F0]"
            }`}
          >
            <Scale className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" strokeWidth={1.75} />
            <span>MIXTO</span>
          </button>
        </div>

        {/* Modo Efectivo: Billetes Rápidos y Display de Vuelto */}
        {metodoPago === "EFECTIVO" && (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-1.5">
              {billetesSugeridos.map((monto, idx) => (
                <button
                  key={idx}
                  onClick={() => setEfectivoRecibidoStr(monto.toString())}
                  className={`h-9 rounded-md font-mono text-xs font-semibold transition-all duration-75 cursor-pointer border ${
                    efectivoRecibido === monto
                      ? "bg-[rgba(16,185,129,0.18)] border-[#10B981] text-[#34D399]"
                      : "bg-[#1E222B] border-[#2D3340] text-[#C5CBD6] hover:border-[#10B981]/50 hover:bg-[#252A35]"
                  }`}
                >
                  {monto === totalFinal ? "Exacto" : `Bs. ${monto}`}
                </button>
              ))}
            </div>

            {/* Display de Vuelto / Cambio a Entregar */}
            <div className="h-11 px-3 rounded-lg bg-[#1A2421] border border-[#10B981]/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#34D399] block">
                  CAMBIO A ENTREGAR
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-[#34D399]">
                  Bs. {vuelto.toFixed(2)}
                </span>
              </div>
              <input
                type="number"
                placeholder="Otro monto..."
                value={efectivoRecibidoStr}
                onChange={(e) => setEfectivoRecibidoStr(e.target.value)}
                className="w-28 h-8 bg-[#14171D] border border-[#2D3340] text-[#E5E9F0] placeholder-[#646E82] text-xs rounded px-2 text-right font-mono font-semibold focus:outline-none focus:border-[#10B981]/60 tabular-nums"
              />
            </div>
          </div>
        )}

        {/* Modo QR */}
        {metodoPago === "QR" && (
          <div className="h-12 px-3 rounded-lg bg-[#15232D] border border-[#0284C7]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-[#38BDF8]" strokeWidth={1.75} />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8] block">
                  COBRO POR QR BANCARIO
                </span>
                <span className="text-xs text-[#7D8597]">Confirmar recepción en cuenta</span>
              </div>
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-[#38BDF8]">
              Bs. {totalFinal.toFixed(2)}
            </div>
          </div>
        )}

        {/* Modo Mixto */}
        {metodoPago === "MIXTO" && (
          <div className="space-y-1.5 bg-[#1A1D24] p-2.5 rounded-lg border border-[#262B36] text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#7D8597]">Monto QR:</span>
              <input
                type="number"
                placeholder="Bs."
                value={montoQrMixtoStr}
                onChange={(e) => setMontoQrMixtoStr(e.target.value)}
                className="w-24 h-7 bg-[#14171D] border border-[#2D3340] text-[#38BDF8] font-mono tabular-nums text-xs rounded px-2 text-right font-semibold focus:outline-none focus:border-[#38BDF8]/60"
              />
            </div>
            <div className="flex items-center justify-between text-[#7D8597] pt-1 border-t border-[#262B36]">
              <span>Restante Efectivo:</span>
              <span className="font-mono tabular-nums font-semibold text-[#E5E9F0]">
                Bs. {saldoEfectivoRequerido.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#34D399]">
              <span>Vuelto:</span>
              <span className="font-mono tabular-nums font-bold">
                Bs. {vuelto.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Botón Maestro de Cobro */}
        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleConfirmarCobro}
          className={`w-full h-12 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:translate-y-[1px] cursor-pointer ${
            ventaExitosaTick
              ? "bg-[#34D399] text-[#0B0F14]"
              : items.length === 0 || isProcessing
              ? "bg-[#1E222B] text-[#646E82] cursor-not-allowed border border-[#262B36]"
              : "bg-[#10B981] hover:bg-[#059669] text-[#0B0F14]"
          }`}
        >
          {ventaExitosaTick ? (
            <>
              <Check className="w-4 h-4 text-[#0B0F14]" strokeWidth={2.5} />
              <span>TRANSACCIÓN COMPLETADA</span>
            </>
          ) : isProcessing ? (
            <span>PROCESANDO VENTA...</span>
          ) : (
            <>
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>COBRAR BS. {totalFinal.toFixed(2)}</span>
            </>
          )}
        </button>

        {/* Salvaguarda de Anulación Rápida */}
        {ultimoTicketGenerado && (
          <div className="flex items-center justify-between pt-0.5 text-xs">
            <span className="text-[#646E82] font-mono tabular-nums text-[11px]">
              Último: #{ultimoTicketGenerado.nroTicket} (Bs. {ultimoTicketGenerado.total.toFixed(2)})
            </span>
            <button
              onClick={onOpenAnularUltimo}
              className="text-[#7D8597] hover:text-[#FB7185] flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FB7185]" strokeWidth={1.75} />
              <span>Anular con PIN Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
