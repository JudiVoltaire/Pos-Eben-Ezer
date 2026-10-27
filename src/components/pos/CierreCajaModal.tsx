"use client";

import React, { useState } from "react";
import { X, LockKeyhole, CheckCircle2 } from "lucide-react";

interface ReporteZ {
  turnoId: string;
  fechaApertura: string | null;
  fechaCierre: string;
  fondoInicialEfectivo: number;
  saldoEfectivoEsperado: number;
  efectivoContadoCiego: number;
  diferenciaEfectivo: number;
  saldoQrAcumulado: number;
  totalVentasRealizadas: number;
  totalPlatosBase: number;
  totalExtras: number;
  totalRecaudadoGeneral: number;
  top5Productos: { nombre: string; cantidad: number; total: number }[];
  movimientos: any[];
}

interface CierreCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: string;
  onEjecutarCierre: (montoContado: number) => Promise<ReporteZ | null>;
  onIniciarNuevoTurno: (fondoInicial: number) => Promise<void>;
}

export function CierreCajaModal({
  isOpen,
  onClose,
  turnoId,
  onEjecutarCierre,
  onIniciarNuevoTurno,
}: CierreCajaModalProps) {
  const [montoContadoStr, setMontoContadoStr] = useState("");
  const [reporteZ, setReporteZ] = useState<ReporteZ | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [nuevoFondoStr, setNuevoFondoStr] = useState("200");

  if (!isOpen) return null;

  const handleCerrar = async () => {
    const contado = parseFloat(montoContadoStr);
    if (isNaN(contado) || contado < 0) return;

    setIsClosing(true);
    const resultado = await onEjecutarCierre(contado);
    setIsClosing(false);

    if (resultado) {
      setReporteZ(resultado);
    }
  };

  const handleNuevoTurno = async () => {
    const f = parseFloat(nuevoFondoStr) || 200;
    await onIniciarNuevoTurno(f);
    setReporteZ(null);
    setMontoContadoStr("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-[#E5E9F0] uppercase tracking-wider">
              {reporteZ ? "Reporte Z — Cierre Oficial de Turno" : "Arqueo Ciego de Caja"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-[#1C1F26]">
          {!reporteZ ? (
            /* PASO 1: CONTEO CIEGO */
            <div className="space-y-4">
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3.5 text-xs text-purple-200">
                <div className="font-bold text-xs text-purple-300 flex items-center gap-1.5 mb-1">
                  <LockKeyhole className="w-4 h-4 text-purple-400" />
                  <span>Conteo a Ciegas (Cero Sesgo)</span>
                </div>
                <p>
                  El sistema oculta el saldo esperado para garantizar máxima honestidad. Cuenta los
                  billetes físicos del cajón e ingresa el monto total exacto.
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-2">
                  Efectivo Físico Contado en Cajón (Bs.)
                </label>
                <input
                  type="number"
                  placeholder="Bs. 0.00"
                  value={montoContadoStr}
                  onChange={(e) => setMontoContadoStr(e.target.value)}
                  className="w-full bg-[#16181D] border border-[#2E3440] text-amber-300 text-3xl font-black rounded-2xl px-4 py-3 text-center focus:outline-none focus:border-purple-400 tabular-nums"
                />
              </div>

              <button
                disabled={isClosing || !montoContadoStr}
                onClick={handleCerrar}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isClosing ? "Calculando..." : "Confirmar Conteo y Emitir Reporte Z"}</span>
              </button>
            </div>
          ) : (
            /* PASO 2: TICKET MAESTRO DEL DÍA (REPORTE Z) */
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#21252D] border border-dashed border-[#3E4556] text-[#E5E9F0] rounded-2xl p-4 shadow-sm">
                <div className="text-center border-b border-dashed border-[#3E4556] pb-2.5 mb-2.5">
                  <h4 className="font-black text-sm text-amber-300">POS EBEN EZER</h4>
                  <p className="text-[11px] text-[#94A3B8]">TICKET MAESTRO DEL DÍA (REPORTE Z)</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 tabular-nums">
                    Cierre: {new Date(reporteZ.fechaCierre).toLocaleString()}
                  </p>
                </div>

                {/* Cuadre de Efectivo */}
                <div className="space-y-1.5 border-b border-dashed border-[#3E4556] pb-2.5 mb-2.5 tabular-nums">
                  <div className="flex justify-between">
                    <span>Fondo Inicial:</span>
                    <span className="font-bold">Bs. {reporteZ.fondoInicialEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span>Bs. {reporteZ.saldoEfectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#E5E9F0]">
                    <span>Efectivo Físico Contado:</span>
                    <span>Bs. {reporteZ.efectivoContadoCiego.toFixed(2)}</span>
                  </div>

                  <div
                    className={`flex justify-between font-black text-xs p-1.5 rounded-lg mt-1 ${
                      Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/40"
                        : reporteZ.diferenciaEfectivo > 0
                        ? "bg-sky-950/70 text-sky-300 border border-sky-500/40"
                        : "bg-rose-950/70 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    <span>
                      Diferencia (
                      {Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "Cuadre Exacto"
                        : reporteZ.diferenciaEfectivo > 0
                        ? "Sobrante"
                        : "Faltante"}
                      ):
                    </span>
                    <span>
                      {reporteZ.diferenciaEfectivo > 0 ? "+" : ""}Bs.{" "}
                      {reporteZ.diferenciaEfectivo.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Resumen Digital QR */}
                <div className="space-y-1 border-b border-dashed border-[#3E4556] pb-2.5 mb-2.5 tabular-nums">
                  <div className="flex justify-between font-bold text-sky-300">
                    <span>Acumulado QR / Banco:</span>
                    <span>Bs. {reporteZ.saldoQrAcumulado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-amber-300 pt-1 border-t border-[#3E4556]">
                    <span>VENTAS TOTALES DEL TURNO:</span>
                    <span>Bs. {reporteZ.totalRecaudadoGeneral.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">
                    {reporteZ.totalVentasRealizadas} tickets emitidos
                  </div>
                </div>

                {/* Métricas de Inteligencia: Platos vs Extras */}
                <div className="space-y-1 border-b border-dashed border-[#3E4556] pb-2.5 mb-2.5 text-[11px] tabular-nums">
                  <div className="font-bold text-[#E5E9F0]">Métricas de Facturación:</div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Platos Base:</span>
                    <span>Bs. {reporteZ.totalPlatosBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Toppings y Extras:</span>
                    <span>+Bs. {reporteZ.totalExtras.toFixed(2)}</span>
                  </div>
                </div>

                {/* Top 5 Productos */}
                {reporteZ.top5Productos.length > 0 && (
                  <div>
                    <div className="font-bold text-amber-300 mb-1 text-[11px]">
                      ⭐ Top 5 Más Vendidos:
                    </div>
                    <div className="space-y-0.5 text-[11px] tabular-nums">
                      {reporteZ.top5Productos.map((p, i) => (
                        <div key={i} className="flex justify-between text-[#94A3B8]">
                          <span>
                            {i + 1}. {p.nombre} (x{p.cantidad})
                          </span>
                          <span className="font-bold text-[#E5E9F0]">Bs. {p.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Siguiente Turno */}
              <div className="bg-[#16181D] p-3 rounded-2xl border border-[#2E3440] space-y-2">
                <span className="text-[11px] font-bold text-[#94A3B8] block">
                  Aperturar Siguiente Turno (Fondo Inicial en Bs.):
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={nuevoFondoStr}
                    onChange={(e) => setNuevoFondoStr(e.target.value)}
                    className="w-28 bg-[#21252D] border border-[#2E3440] text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl text-center tabular-nums"
                  />
                  <button
                    onClick={handleNuevoTurno}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Iniciar Turno
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
