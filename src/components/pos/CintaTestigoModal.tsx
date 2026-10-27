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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-[#E5E9F0] uppercase tracking-wider">
              Cinta Testigo Digital (Auditoría Forense)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportarCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#E5E9F0] p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="px-4 py-2 bg-[#16181D] border-b border-[#2E3440] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[#94A3B8] font-bold flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filtrar:
          </span>

          {[
            { id: "TODO" as const, label: "Todo el Turno" },
            { id: "EFECTIVO" as const, label: "💵 Solo Efectivo" },
            { id: "QR" as const, label: "📱 Solo QR" },
            { id: "SALIDAS" as const, label: "💸 Solo Retiros" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtro === f.id
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-[#21252D] text-[#94A3B8] hover:text-[#E5E9F0]"
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
              <p className="text-xs font-bold text-[#E5E9F0]">
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
                    className="bg-[#21252D] border border-dashed border-[#3E4556] rounded-2xl p-4 font-mono text-xs text-[#E5E9F0] shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-dashed border-[#3E4556] pb-2 mb-2">
                      <div className="font-bold text-xs text-amber-300">
                        POS EBEN EZER — TICKET #{v.nroTicket}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          v.metodoPago === "EFECTIVO"
                            ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                            : v.metodoPago === "QR"
                            ? "bg-sky-950/70 text-sky-300 border border-sky-500/30"
                            : "bg-purple-950/70 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {v.metodoPago}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#94A3B8] mb-2 flex justify-between tabular-nums">
                      <span>Hora: {v.fechaHora ? new Date(v.fechaHora).toLocaleTimeString() : ""}</span>
                      <span>Cajera: {v.cajeraNombre || "Laura"}</span>
                    </div>

                    <div className="space-y-1 my-2">
                      {snap?.items?.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <span className="font-bold text-[#E5E9F0]">{it.nombre}</span>
                            {it.extrasFijos?.map((ef: any, j: number) => (
                              <div key={j} className="text-[10px] text-emerald-400 pl-2">
                                + {ef.nombre} (+Bs. {ef.precio.toFixed(2)})
                              </div>
                            ))}
                            {it.extrasLibres?.map((el: any, k: number) => (
                              <div key={k} className="text-[10px] text-amber-300 pl-2">
                                + {el.nota || "Extra Cocina"} (+Bs. {el.monto.toFixed(2)})
                              </div>
                            ))}
                          </div>
                          <span className="font-bold tabular-nums">Bs. {it.totalItem.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-[#3E4556] pt-2 mt-2 flex justify-between font-black text-xs text-amber-300 tabular-nums">
                      <span>TOTAL COBRADO:</span>
                      <span className="text-sm">Bs. {v.totalFinal.toFixed(2)}</span>
                    </div>

                    {v.metodoPago === "EFECTIVO" && (
                      <div className="text-[10px] text-[#94A3B8] flex justify-between mt-1 tabular-nums">
                        <span>Recibido: Bs. {v.efectivoRecibido?.toFixed(2)}</span>
                        <span>Vuelto: Bs. {v.vueltoEntregado?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              } else {
                const m = ev.data;
                return (
                  <div
                    key={`m-${m.id || idx}`}
                    className="bg-amber-950/25 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 flex items-start justify-between gap-3 font-mono"
                  >
                    <div className="flex items-start gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-black text-amber-300 text-xs">
                          {m.tipo === "INGRESO_CAMBIO" ? "INGRESO" : "SALIDA"}: {m.motivo}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] mt-0.5 tabular-nums">
                          Bolsillo: {m.bolsillo} • Receptor: {m.receptorNombre || "Personal"} •{" "}
                          {m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString() : ""}
                        </div>
                        {m.notaOpcional && (
                          <div className="text-[11px] text-amber-400/80 italic mt-0.5">
                            "{m.notaOpcional}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-rose-300 tabular-nums">
                        - Bs. {m.monto.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-bold text-[#94A3B8] block mt-0.5">
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
        <div className="p-3 bg-[#16181D] border-t border-[#2E3440] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar Cinta
          </button>
        </div>
      </div>
    </div>
  );
}
