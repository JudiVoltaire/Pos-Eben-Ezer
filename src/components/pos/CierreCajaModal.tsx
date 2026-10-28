"use client";

import React, { useState } from "react";
import { X, Lock, Check, ShieldCheck } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-[#14171D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#161920] border border-[#262B36] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.75} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
              {reporteZ ? "REPORTE Z — CIERRE OFICIAL DE TURNO" : "ARQUEO CIEGO DE CAJA"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7D8597] hover:text-[#E5E9F0] p-1 rounded hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-[#14171D]">
          {!reporteZ ? (
            /* PASO 1: CONTEO CIEGO */
            <div className="space-y-3">
              <div className="bg-[#1E222B] border border-[#2D3340] rounded-lg p-3 text-xs text-[#E5E9F0]">
                <div className="font-semibold text-xs text-[#F59E0B] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.75} />
                  <span>Procedimiento de Auditoría Ciega</span>
                </div>
                <p className="text-[#7D8597] text-[11px] leading-relaxed">
                  El sistema oculta el saldo esperado para garantizar máxima integridad. Cuenta los
                  billetes físicos del cajón e ingresa el monto total exacto.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1.5">
                  EFECTIVO FÍSICO CONTADO EN CAJÓN (BS.)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={montoContadoStr}
                  onChange={(e) => setMontoContadoStr(e.target.value)}
                  className="w-full h-11 bg-[#12151A] border border-[#2D3340] text-[#34D399] text-xl font-bold font-mono rounded-lg px-4 text-center focus:outline-none focus:border-[#3B4252] tabular-nums"
                />
              </div>

              <button
                disabled={isClosing || !montoContadoStr}
                onClick={handleCerrar}
                className="w-full h-11 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-75 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#0B0F14]" strokeWidth={2} />
                <span>{isClosing ? "Verificando..." : "Confirmar Conteo y Emitir Reporte Z"}</span>
              </button>
            </div>
          ) : (
            /* PASO 2: TICKET MAESTRO DEL DÍA (REPORTE Z) */
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#1E222B] border border-[#2D3340] text-[#E5E9F0] rounded-lg p-3.5 shadow-sm">
                <div className="text-center pb-2 mb-2 border-b border-dashed border-[#262B36]">
                  <h4 className="font-bold text-xs text-[#E5E9F0]">EBEN EZER POS</h4>
                  <p className="text-[10px] text-[#7D8597] tracking-wider uppercase">REPORTE Z — CIERRE DIARIO</p>
                  <p className="text-[10px] text-[#646E82] mt-0.5 tabular-nums">
                    Cierre: {new Date(reporteZ.fechaCierre).toLocaleString()}
                  </p>
                </div>

                {/* Cuadre de Efectivo */}
                <div className="space-y-1 pb-2 mb-2 border-b border-dashed border-[#262B36] tabular-nums text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#7D8597]">Fondo Inicial:</span>
                    <span className="font-semibold text-[#E5E9F0]">Bs. {reporteZ.fondoInicialEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7D8597]">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span className="font-semibold text-[#E5E9F0]">Bs. {reporteZ.saldoEfectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-[#E5E9F0] pt-0.5">
                    <span>Efectivo Físico Contado:</span>
                    <span className="text-[#34D399]">Bs. {reporteZ.efectivoContadoCiego.toFixed(2)}</span>
                  </div>

                  <div
                    className={`flex justify-between font-bold text-[11px] p-1.5 rounded mt-1.5 ${
                      Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "bg-[#1A2421] text-[#34D399] border border-[#10B981]/30"
                        : reporteZ.diferenciaEfectivo > 0
                        ? "bg-[#15232D] text-[#38BDF8] border border-[#0284C7]/30"
                        : "bg-[rgba(244,63,94,0.12)] text-[#FB7185] border border-[rgba(244,63,94,0.3)]"
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
                <div className="space-y-1 pb-2 mb-2 border-b border-dashed border-[#262B36] tabular-nums text-[11px]">
                  <div className="flex justify-between text-[#38BDF8]">
                    <span>Acumulado QR / Banco:</span>
                    <span className="font-semibold">Bs. {reporteZ.saldoQrAcumulado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#E5E9F0] pt-1 border-t border-[#262B36]">
                    <span>TOTAL FACTURADO TURNO:</span>
                    <span>Bs. {reporteZ.totalRecaudadoGeneral.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-[#646E82]">
                    {reporteZ.totalVentasRealizadas} transacciones registradas
                  </div>
                </div>

                {/* Métricas de Inteligencia: Platos vs Extras */}
                <div className="space-y-0.5 pb-2 mb-2 border-b border-dashed border-[#262B36] text-[11px] tabular-nums">
                  <div className="text-[#7D8597]">Desglose Comercial:</div>
                  <div className="flex justify-between text-[#7D8597]">
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
                    <div className="font-semibold text-[#7D8597] mb-1 text-[10px] uppercase tracking-wider">
                      TOP 5 PRODUCTOS:
                    </div>
                    <div className="space-y-0.5 text-[11px] tabular-nums">
                      {reporteZ.top5Productos.map((p, i) => (
                        <div key={i} className="flex justify-between text-[#7D8597]">
                          <span>
                            {i + 1}. {p.nombre} (x{p.cantidad})
                          </span>
                          <span className="font-medium text-[#E5E9F0]">Bs. {p.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Siguiente Turno */}
              <div className="bg-[#1E222B] p-3 rounded-lg border border-[#2D3340] space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block">
                  APERTURA DE NUEVO TURNO (FONDO BS.):
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={nuevoFondoStr}
                    onChange={(e) => setNuevoFondoStr(e.target.value)}
                    className="w-24 h-9 bg-[#12151A] border border-[#2D3340] text-[#E5E9F0] font-bold font-mono text-xs px-2.5 rounded text-center tabular-nums focus:outline-none focus:border-[#3B4252]"
                  />
                  <button
                    onClick={handleNuevoTurno}
                    className="flex-1 h-9 bg-[#10B981] hover:bg-[#059669] text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded transition-all duration-75 cursor-pointer"
                  >
                    Iniciar Nuevo Turno
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
