"use client";

import React, { useState } from "react";
import { X, Receipt, Download, Filter, ArrowUpRight } from "lucide-react";

interface EventoCinta {
  tipoEvento: "VENTA" | "MOVIMIENTO";
  data: any;
  timestamp: string | null;
}

interface CintaTestigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventos: EventoCinta[];
}

export function CintaTestigoModal({
  isOpen,
  onClose,
  eventos,
}: CintaTestigoModalProps) {
  const [filtro, setFiltro] = useState<"TODO" | "EFECTIVO" | "QR" | "SALIDAS">("TODO");

  if (!isOpen) return null;

  const eventosFiltrados = eventos.filter((ev) => {
    if (filtro === "TODO") return true;
    if (filtro === "EFECTIVO") {
      return (
        (ev.tipoEvento === "VENTA" && ev.data.metodoPago === "EFECTIVO") ||
        (ev.tipoEvento === "MOVIMIENTO" && ev.data.bolsillo === "EFECTIVO_CAJON")
      );
    }
    if (filtro === "QR") {
      return (
        (ev.tipoEvento === "VENTA" && ev.data.metodoPago === "QR") ||
        (ev.tipoEvento === "MOVIMIENTO" && ev.data.bolsillo === "QR_BANCO")
      );
    }
    if (filtro === "SALIDAS") {
      return ev.tipoEvento === "MOVIMIENTO";
    }
    return true;
  });

  const handleExportarCSV = () => {
    const headers = "Tipo,NumeroTicket,FechaHora,TotalBs,MetodoPago,DetallePlatosYExtras\n";
    const rows = eventos.map((ev) => {
      if (ev.tipoEvento === "VENTA") {
        const v = ev.data;
        let snap: any = null;
        try {
          snap = JSON.parse(v.snapshotTicketJson);
        } catch (e) {}
        const itemsTxt = (snap?.items || []).map((i: any) => `${i.nombre} (Bs. ${i.totalItem})`).join(" + ");
        return `VENTA,#${v.nroTicket},"${v.fechaHora}",${v.totalFinal},${v.metodoPago},"${itemsTxt}"`;
      } else {
        const m = ev.data;
        return `SALIDA,"${m.tipo}","${m.fechaHora}",${m.monto},${m.bolsillo},"${m.motivo} (Receptor: ${m.receptorNombre || 'Logística'})"`;
      }
    });

    const csvData = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const uri = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", `cinta_testigo_eben_ezer_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#161920] border border-[#262B36] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.75} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
              HISTORIAL DE CAJA Y VENTAS (CINTA TESTIGO)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportarCSV}
              className="h-8 px-2.5 rounded-md bg-[#1E222B] border border-[#2D3340] hover:bg-[#252A35] text-[#E5E9F0] font-medium text-xs transition-all duration-75 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#34D399]" strokeWidth={1.75} />
              <span>Descargar Reporte (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#7D8597] hover:text-[#E5E9F0] p-1 rounded hover:bg-[#1E222B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="px-4 py-2 bg-[#14171D] border-b border-[#262B36] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" strokeWidth={1.75} />
            FILTRO:
          </span>

          {[
            { id: "TODO" as const, label: "Todo el Turno" },
            { id: "EFECTIVO" as const, label: "Solo Efectivo" },
            { id: "QR" as const, label: "Solo QR" },
            { id: "SALIDAS" as const, label: "Solo Salidas" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`h-7 px-2.5 rounded text-xs font-medium transition-all duration-75 cursor-pointer border ${
                filtro === f.id
                  ? "bg-[#252B37] border-[#363E4F] text-[#E5E9F0] shadow-sm font-semibold"
                  : "bg-[#1E222B] border-[#2D3340] text-[#7D8597] hover:text-[#E5E9F0]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Registros Térmicos */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#14171D]">
          {eventosFiltrados.length === 0 ? (
            <div className="py-16 text-center text-[#646E82]">
              <Receipt className="w-8 h-8 mx-auto text-[#262B36] mb-2" strokeWidth={1.5} />
              <p className="text-xs font-medium text-[#7D8597]">
                Sin registros para este filtro
              </p>
            </div>
          ) : (
            eventosFiltrados.map((ev, idx) => {
              if (ev.tipoEvento === "VENTA") {
                const v = ev.data;
                let snap: any = null;
                try {
                  snap = JSON.parse(v.snapshotTicketJson);
                } catch (e) {}

                return (
                  <div
                    key={`v-${v.id || idx}`}
                    className="bg-[#1E222B] border border-[#2D3340] rounded-lg p-3.5 font-mono text-xs text-[#E5E9F0] shadow-[0_1px_2px_0_rgba(0,0,0,0.25)]"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-[#262B36]">
                      <span className="font-bold text-xs text-[#E5E9F0]">
                        POS EBEN EZER — TICKET #{v.nroTicket}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          v.metodoPago === "EFECTIVO"
                            ? "bg-[#1A2421] text-[#34D399] border border-[#10B981]/30"
                            : v.metodoPago === "QR"
                            ? "bg-[#15232D] text-[#38BDF8] border border-[#0284C7]/30"
                            : "bg-[#252B37] text-[#F59E0B] border border-[#363E4F]"
                        }`}
                      >
                        {v.metodoPago === "EFECTIVO" ? "[EFECTIVO]" : v.metodoPago === "QR" ? "[BANCO / QR]" : "[MIXTO]"}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#7D8597] mb-2 flex justify-between tabular-nums">
                      <span>Hora: {v.fechaHora ? new Date(v.fechaHora).toLocaleTimeString() : ""}</span>
                      <span>Cajero/a: {v.cajeraNombre || "Caja"}</span>
                    </div>

                    <div className="space-y-1 my-2">
                      {snap?.items?.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-[#E5E9F0]">{it.nombre}</span>
                            {it.extrasFijos?.map((ef: any, j: number) => (
                              <div key={j} className="text-[10px] text-[#34D399] pl-2">
                                + {ef.nombre} (+Bs. {ef.precio.toFixed(2)})
                              </div>
                            ))}
                            {it.extrasLibres?.map((el: any, k: number) => (
                              <div key={k} className="text-[10px] text-[#F59E0B] pl-2">
                                + {el.nota || "Extra Cocina"} (+Bs. {el.monto.toFixed(2)})
                              </div>
                            ))}
                          </div>
                          <span className="font-bold tabular-nums text-[#E5E9F0]">
                            Bs. {it.totalItem.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-[#262B36] pt-2 mt-2 flex justify-between font-bold text-xs tabular-nums text-[#E5E9F0]">
                      <span className="text-[#7D8597]">TOTAL COBRADO:</span>
                      <span className="text-sm font-bold">Bs. {v.totalFinal.toFixed(2)}</span>
                    </div>

                    {v.metodoPago === "EFECTIVO" && (
                      <div className="text-[10px] text-[#7D8597] flex justify-between mt-1 tabular-nums pt-1 border-t border-[#262B36]/60">
                        <span>Entregó: Bs. {v.efectivoRecibido?.toFixed(2)}</span>
                        <span className="text-[#34D399]">
                          Vuelto: Bs. {v.vueltoEntregado?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              } else {
                const m = ev.data;
                return (
                  <div
                    key={`m-${m.id || idx}`}
                    className="bg-[#1E222B] border border-[#2D3340] border-l-[3px] border-l-[#FB7185] rounded-lg p-3 font-mono text-xs text-[#E5E9F0] shadow-[0_1px_2px_0_rgba(0,0,0,0.25)] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <ArrowUpRight className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" strokeWidth={1.75} />
                      <div>
                        <div className="font-semibold text-[#E5E9F0] text-xs flex items-center gap-2">
                          <span>{m.tipo === "INGRESO_CAMBIO" ? "INGRESO" : "SALIDA"}: {m.motivo}</span>
                          <span className="bg-[rgba(244,63,94,0.12)] text-[#FB7185] border border-[rgba(244,63,94,0.25)] px-1.5 py-0.2 rounded text-[10px]">
                            [AUTORIZADO CON PIN]
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7D8597] mt-1 tabular-nums">
                          Origen: {m.bolsillo === "EFECTIVO_CAJON" ? "Efectivo en Cajón" : "Banco / QR"} · Recibió: {m.receptorNombre || "Personal"} ·{" "}
                          {m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString() : ""}
                        </div>
                        {m.notaOpcional && (
                          <div className="text-[11px] text-[#7D8597] italic mt-0.5">
                            "{m.notaOpcional}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-[#FB7185] tabular-nums">
                        - Bs. {m.monto.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-[#646E82] block mt-0.5">
                        {m.estadoRendicion === "PENDIENTE_COMPROBANTE"
                          ? "Falta Foto Recibo"
                          : m.estadoRendicion === "RESPALDADO"
                          ? "Foto Adjunta"
                          : "Sin comprobante"}
                      </span>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Pie */}
        <div className="h-12 px-4 bg-[#14171D] border-t border-[#262B36] flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="h-8 px-3.5 bg-[#1E222B] hover:bg-[#252A35] text-[#C5CBD6] hover:text-[#E5E9F0] font-medium text-xs rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
}
