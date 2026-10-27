"use client";

import React, { useState } from "react";
import { X, Receipt, Download, Filter, ArrowDownCircle } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-[#16181D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-14 px-5 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#FBBF24]" />
            <h3 className="text-sm font-bold text-[#E5E9F0] uppercase tracking-wider">
              Cinta Testigo Digital (Auditoría Forense)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportarCSV}
              className="h-9 px-3 rounded-lg bg-[#21252D] border border-[#2E3440] hover:bg-[#2A303C] hover:border-[#3B4252] text-[#E5E9F0] font-semibold text-xs transition-all duration-75 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#E5E9F0] p-1.5 rounded-lg hover:bg-[#21252D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="px-5 py-2.5 bg-[#16181D] border-b border-[#2E3440] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs text-[#94A3B8] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filtro:
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
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all duration-75 cursor-pointer border ${
                filtro === f.id
                  ? "bg-[#21252D] border-[#FBBF24] text-[#FBBF24]"
                  : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Registros Térmicos */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#16181D]">
          {eventosFiltrados.length === 0 ? (
            <div className="py-16 text-center text-[#94A3B8]">
              <Receipt className="w-10 h-10 mx-auto text-[#2E3440] mb-2" />
              <p className="text-xs font-semibold text-[#E5E9F0]">
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
                    className="bg-[#21252D] border border-[#2E3440] rounded-lg p-4 font-mono text-xs text-[#E5E9F0] shadow-lg"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-[#2E3440]">
                      <span className="font-bold text-xs text-[#FBBF24]">
                        POS EBEN EZER — TICKET #{v.nroTicket}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          v.metodoPago === "EFECTIVO"
                            ? "bg-[rgba(16,185,129,0.14)] text-[#34D399] border border-[rgba(16,185,129,0.35)]"
                            : v.metodoPago === "QR"
                            ? "bg-[rgba(56,189,248,0.14)] text-[#38BDF8] border border-[rgba(56,189,248,0.35)]"
                            : "bg-[rgba(245,158,11,0.12)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)]"
                        }`}
                      >
                        [{v.metodoPago}]
                      </span>
                    </div>

                    <div className="text-[11px] text-[#94A3B8] mb-2 flex justify-between tabular-nums">
                      <span>Hora: {v.fechaHora ? new Date(v.fechaHora).toLocaleTimeString() : ""}</span>
                      <span>Cajera: {v.cajeraNombre || "Laura"}</span>
                    </div>

                    <div className="space-y-1.5 my-2">
                      {snap?.items?.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-[#E5E9F0]">{it.nombre}</span>
                            {it.extrasFijos?.map((ef: any, j: number) => (
                              <div key={j} className="text-[10px] text-[#34D399] pl-2">
                                + {ef.nombre} (+Bs. {ef.precio.toFixed(2)})
                              </div>
                            ))}
                            {it.extrasLibres?.map((el: any, k: number) => (
                              <div key={k} className="text-[10px] text-[#FBBF24] pl-2">
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

                    <div className="border-t border-dashed border-[#2E3440] pt-2 mt-2 flex justify-between font-bold text-xs text-[#FBBF24] tabular-nums">
                      <span>TOTAL COBRADO:</span>
                      <span className="text-sm font-extrabold">Bs. {v.totalFinal.toFixed(2)}</span>
                    </div>

                    {v.metodoPago === "EFECTIVO" && (
                      <div className="text-[10px] text-[#94A3B8] flex justify-between mt-1 tabular-nums pt-1 border-t border-[#2E3440]/50">
                        <span>Recibido: Bs. {v.efectivoRecibido?.toFixed(2)}</span>
                        <span className="text-[#34D399] font-semibold">
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
                    className="bg-[#21252D] border border-[rgba(244,63,94,0.3)] rounded-lg p-3.5 text-xs text-[#E5E9F0] flex items-start justify-between gap-3 font-mono shadow-lg"
                  >
                    <div className="flex items-start gap-2.5">
                      <ArrowDownCircle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#FB7185] text-xs flex items-center gap-2">
                          <span>{m.tipo === "INGRESO_CAMBIO" ? "INGRESO" : "SALIDA"}: {m.motivo}</span>
                          <span className="bg-[rgba(244,63,94,0.14)] text-[#FB7185] border border-[rgba(244,63,94,0.35)] px-1.5 py-0.2 rounded text-[10px]">
                            [SALIDA FIRMADA PIN]
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] mt-1 tabular-nums">
                          Bolsillo: {m.bolsillo} • Receptor: {m.receptorNombre || "Personal"} •{" "}
                          {m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString() : ""}
                        </div>
                        {m.notaOpcional && (
                          <div className="text-[11px] text-[#94A3B8] italic mt-0.5">
                            "{m.notaOpcional}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#FB7185] font-mono tabular-nums">
                        - Bs. {m.monto.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                        {m.estadoRendicion}
                      </span>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Pie */}
        <div className="h-14 px-5 bg-[#16181D] border-t border-[#2E3440] flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="h-10 px-4 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-semibold text-xs rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer"
          >
            Cerrar Cinta
          </button>
        </div>
      </div>
    </div>
  );
}
