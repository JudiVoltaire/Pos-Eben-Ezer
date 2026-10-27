"use client";

import React, { useState } from "react";
import { X, LockKeyhole, CheckCircle2, ShieldCheck } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-[#16181D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-14 px-5 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <LockKeyhole className="w-5 h-5 text-[#FBBF24]" />
            <h3 className="text-sm font-bold text-[#E5E9F0] uppercase tracking-wider">
              {reporteZ ? "Reporte Z — Cierre Oficial de Turno" : "Arqueo Ciego de Caja"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1.5 rounded-lg hover:bg-[#21252D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#1C1F26]">
          {!reporteZ ? (
            /* PASO 1: CONTEO CIEGO */
            <div className="space-y-4">
              <div className="bg-[#21252D] border border-[#2E3440] rounded-xl p-4 text-xs text-[#E5E9F0]">
                <div className="font-semibold text-xs text-[#FBBF24] flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
                  <span>Conteo a Ciegas (Cero Sesgo)</span>
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
                  El sistema oculta el saldo esperado para garantizar máxima honestidad. Cuenta los
                  billetes físicos del cajón e ingresa el monto total exacto.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
                  Efectivo Físico Contado en Cajón (Bs.)
                </label>
                <input
                  type="number"
                  placeholder="Bs. 0.00"
                  value={montoContadoStr}
                  onChange={(e) => setMontoContadoStr(e.target.value)}
                  className="w-full h-14 bg-[#16181D] border border-[#2E3440] text-[#34D399] text-2xl font-bold font-mono rounded-xl px-4 text-center focus:outline-none focus:border-[#34D399]/60 tabular-nums transition-colors"
                />
              </div>

              <button
                disabled={isClosing || !montoContadoStr}
                onClick={handleCerrar}
                className="w-full h-12 bg-[#34D399] hover:bg-[#10B981] disabled:opacity-40 text-[#16181D] font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-75 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isClosing ? "Calculando..." : "Confirmar Conteo y Emitir Reporte Z"}</span>
              </button>
            </div>
          ) : (
            /* PASO 2: TICKET MAESTRO DEL DÍA (REPORTE Z) */
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#21252D] border border-[#2E3440] text-[#E5E9F0] rounded-lg p-4 font-mono text-xs shadow-lg">
                <div className="text-center pb-2.5 mb-2.5 border-b border-dashed border-[#2E3440]">
                  <h4 className="font-bold text-sm text-[#FBBF24]">POS EBEN EZER</h4>
                  <p className="text-[11px] text-[#94A3B8] tracking-wider">TICKET MAESTRO DEL DÍA (REPORTE Z)</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 tabular-nums">
                    Cierre: {new Date(reporteZ.fechaCierre).toLocaleString()}
                  </p>
                </div>

                {/* Cuadre de Efectivo */}
                <div className="space-y-1.5 pb-2.5 mb-2.5 border-b border-dashed border-[#2E3440] tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Fondo Inicial:</span>
                    <span className="font-semibold text-[#E5E9F0]">Bs. {reporteZ.fondoInicialEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span className="font-semibold text-[#E5E9F0]">Bs. {reporteZ.saldoEfectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#E5E9F0] pt-1">
                    <span>Efectivo Físico Contado:</span>
                    <span className="text-[#34D399]">Bs. {reporteZ.efectivoContadoCiego.toFixed(2)}</span>
                  </div>

                  <div
                    className={`flex justify-between font-bold text-xs p-2 rounded-lg mt-1.5 ${
                      Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "bg-[rgba(16,185,129,0.14)] text-[#34D399] border border-[rgba(16,185,129,0.35)]"
                        : reporteZ.diferenciaEfectivo > 0
                        ? "bg-[rgba(56,189,248,0.14)] text-[#38BDF8] border border-[rgba(56,189,248,0.35)]"
                        : "bg-[rgba(244,63,94,0.14)] text-[#FB7185] border border-[rgba(244,63,94,0.35)]"
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
                <div className="space-y-1 pb-2.5 mb-2.5 border-b border-dashed border-[#2E3440] tabular-nums">
                  <div className="flex justify-between font-semibold text-[#38BDF8]">
                    <span>Acumulado QR / Banco:</span>
                    <span>Bs. {reporteZ.saldoQrAcumulado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#FBBF24] pt-1 border-t border-[#2E3440]">
                    <span>VENTAS TOTALES DEL TURNO:</span>
                    <span>Bs. {reporteZ.totalRecaudadoGeneral.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">
                    {reporteZ.totalVentasRealizadas} tickets emitidos
                  </div>
                </div>

                {/* Métricas de Inteligencia: Platos vs Extras */}
                <div className="space-y-1 pb-2.5 mb-2.5 border-b border-dashed border-[#2E3440] text-[11px] tabular-nums">
                  <div className="font-semibold text-[#E5E9F0]">Métricas de Facturación:</div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Platos Base:</span>
                    <span>Bs. {reporteZ.totalPlatosBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#34D399]">
                    <span>Toppings y Extras:</span>
                    <span>+Bs. {reporteZ.totalExtras.toFixed(2)}</span>
                  </div>
                </div>

                {/* Top 5 Productos */}
                {reporteZ.top5Productos.length > 0 && (
                  <div>
                    <div className="font-bold text-[#FBBF24] mb-1.5 text-[11px]">
                      ⭐ Top 5 Más Vendidos:
                    </div>
                    <div className="space-y-1 text-[11px] tabular-nums">
                      {reporteZ.top5Productos.map((p, i) => (
                        <div key={i} className="flex justify-between text-[#94A3B8]">
                          <span>
                            {i + 1}. {p.nombre} (x{p.cantidad})
                          </span>
                          <span className="font-semibold text-[#E5E9F0]">Bs. {p.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Siguiente Turno */}
              <div className="bg-[#21252D] p-3.5 rounded-xl border border-[#2E3440] space-y-2">
                <span className="text-xs font-medium text-[#94A3B8] block">
                  Aperturar Siguiente Turno (Fondo Inicial en Bs.):
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={nuevoFondoStr}
                    onChange={(e) => setNuevoFondoStr(e.target.value)}
                    className="w-28 h-10 bg-[#16181D] border border-[#2E3440] text-[#FBBF24] font-bold font-mono text-sm px-3 rounded-lg text-center tabular-nums focus:outline-none focus:border-[#FBBF24]/60"
                  />
                  <button
                    onClick={handleNuevoTurno}
                    className="flex-1 h-10 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#16181D] font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-75 cursor-pointer"
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
