"use client";

import React, { useState } from "react";
import {
  X,
  Receipt,
  Download,
  Filter,
  Banknote,
  QrCode,
  ArrowDownCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface EventoCinta {
  tipoEvento: "VENTA" | "MOVIMIENTO";
  data: any;
  timestamp: string | null;
}

interface ModalCintaTestigoProps {
  isOpen: boolean;
  onClose: () => void;
  eventos: EventoCinta[];
}

export function ModalCintaTestigo({
  isOpen,
  onClose,
  eventos,
}: ModalCintaTestigoProps) {
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

  const exportarCSV = () => {
    const encabezados = "Tipo,ID/Ticket,FechaHora,MontoTotal,MetodoPago/Bolsillo,Detalle\n";
    const filas = eventos.map((ev) => {
      if (ev.tipoEvento === "VENTA") {
        return `Venta,#${ev.data.nroTicket},"${ev.timestamp}",${ev.data.totalFinal},${ev.data.metodoPago},"Venta normal"`;
      } else {
        return `Retiro,"${ev.data.tipo}","${ev.timestamp}",${ev.data.monto},${ev.data.bolsillo},"${ev.data.motivo}"`;
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + encabezados + filas.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cinta_testigo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              Cinta Testigo Digital (Auditoría Forense)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportarCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </span>

          {[
            { id: "TODO" as const, label: "Todo el Turno" },
            { id: "EFECTIVO" as const, label: "💵 Solo Efectivo" },
            { id: "QR" as const, label: "📱 Solo QR" },
            { id: "SALIDAS" as const, label: "💸 Salidas / Gastos" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtro === f.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Registros Térmicos Intercalados */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-950/60">
          {eventosFiltrados.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Receipt className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-400">
                No hay movimientos con este filtro.
              </p>
            </div>
          ) : (
            eventosFiltrados.map((ev, idx) => {
              if (ev.tipoEvento === "VENTA") {
                const v = ev.data;
                let snapshot: any = null;
                try {
                  snapshot = JSON.parse(v.snapshotTicketJson);
                } catch (e) {}

                return (
                  <div
                    key={`v-${v.id || idx}`}
                    className="bg-white text-slate-950 rounded-2xl p-4 shadow-md font-mono text-xs border border-dashed border-slate-300 relative overflow-hidden"
                  >
                    {/* Borde superior estilo ticket térmico */}
                    <div className="flex items-center justify-between border-b border-dashed border-slate-400 pb-2 mb-2">
                      <div className="font-bold text-sm">
                        POS EBEN EZER — TICKET #{v.nroTicket}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                          v.metodoPago === "EFECTIVO"
                            ? "bg-emerald-100 text-emerald-800"
                            : v.metodoPago === "QR"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {v.metodoPago}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mb-2 flex justify-between">
                      <span>
                        Fecha: {v.fechaHora ? new Date(v.fechaHora).toLocaleTimeString() : ""}
                      </span>
                      <span>Sello: {v.id.slice(0, 8)}</span>
                    </div>

                    {/* Detalle de Ítems */}
                    <div className="space-y-1 my-2">
                      {snapshot?.items?.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <span className="font-bold">{it.nombre}</span>
                            {it.extrasFijos?.map((ef: any, j: number) => (
                              <div key={j} className="text-[10px] text-slate-500 pl-2">
                                + {ef.nombre} (+Bs. {ef.precio.toFixed(2)})
                              </div>
                            ))}
                            {it.extrasLibres?.map((el: any, k: number) => (
                              <div key={k} className="text-[10px] text-slate-500 pl-2">
                                + {el.nota || "Extra Cocina"} (+Bs. {el.monto.toFixed(2)})
                              </div>
                            ))}
                          </div>
                          <span className="font-bold">Bs. {it.totalItem.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total del Ticket */}
                    <div className="border-t border-dashed border-slate-400 pt-2 mt-2 flex justify-between items-baseline font-black text-sm">
                      <span>TOTAL COBRADO:</span>
                      <span className="text-base">Bs. {v.totalFinal.toFixed(2)}</span>
                    </div>

                    {v.metodoPago === "EFECTIVO" && (
                      <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                        <span>Recibido: Bs. {v.efectivoRecibido?.toFixed(2)}</span>
                        <span>Vuelto: Bs. {v.vueltoEntregado?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              } else {
                // MOVIMIENTO / SALIDA
                const m = ev.data;
                return (
                  <div
                    key={`m-${m.id || idx}`}
                    className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-xs text-amber-200 flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <ArrowDownCircle className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-black text-amber-300 text-sm">
                          {m.tipo === "INGRESO_CAMBIO" ? "INGRESO" : "SALIDA"}: {m.motivo}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Bolsillo: <span className="font-bold text-slate-300">{m.bolsillo}</span> •{" "}
                          {m.fechaHora ? new Date(m.fechaHora).toLocaleTimeString() : ""}
                        </div>
                        {m.notaOpcional && (
                          <div className="text-[11px] text-amber-400/90 italic mt-1">
                            "{m.notaOpcional}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-rose-400">
                        - Bs. {m.monto.toFixed(2)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block border ${
                          m.estadoRendicion === "RESPALDADO"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : m.estadoRendicion === "PENDIENTE_COMPROBANTE"
                            ? "bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar Cinta Testigo
          </button>
        </div>
      </div>
    </div>
  );
}
