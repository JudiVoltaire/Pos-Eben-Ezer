"use client";

import React, { useState } from "react";
import {
  X,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Sparkles,
} from "lucide-react";

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

interface ModalCierreCiegoProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: string;
  onEjecutarCierre: (montoContado: number) => Promise<ReporteZ | null>;
  onIniciarNuevoTurno: (fondoInicial: number) => Promise<void>;
}

export function ModalCierreCiego({
  isOpen,
  onClose,
  turnoId,
  onEjecutarCierre,
  onIniciarNuevoTurno,
}: ModalCierreCiegoProps) {
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              {reporteZ ? "Reporte Z — Cierre Oficial de Turno" : "Arqueo Ciego de Caja"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!reporteZ ? (
            /* PASO 1: CONTEO CIEGO */
            <div className="space-y-4">
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 text-xs text-purple-200">
                <div className="font-bold text-sm text-purple-300 flex items-center gap-1.5 mb-1">
                  <LockKeyhole className="w-4 h-4 text-purple-400" />
                  <span>Protocolo de Seguridad: Conteo a Ciegas</span>
                </div>
                <p>
                  El sistema no muestra el monto esperado para evitar sesgos. Cuenta físicamente
                  todos los billetes y monedas del cajón e ingresa el total exacto.
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
                  Efectivo Físico Contado en Cajón (Bs.)
                </label>
                <input
                  type="number"
                  placeholder="Bs. 0.00"
                  value={montoContadoStr}
                  onChange={(e) => setMontoContadoStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-3xl font-black rounded-2xl px-4 py-3 text-center focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Botón de Confirmación Ciega */}
              <button
                disabled={isClosing || !montoContadoStr}
                onClick={handleCerrar}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-sm uppercase rounded-2xl transition cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isClosing ? "Calculando Arqueo..." : "Confirmar Conteo y Revelar Cierre"}</span>
              </button>
            </div>
          ) : (
            /* PASO 2: TICKET MAESTRO DEL DÍA (REPORTE Z) */
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-white text-slate-950 rounded-2xl p-5 shadow-xl border border-dashed border-slate-400">
                <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                  <h4 className="font-black text-base">POS EBEN EZER</h4>
                  <p className="text-[11px] text-slate-600">REPORTE Z — CIERRE OFICIAL</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Cierre: {new Date(reporteZ.fechaCierre).toLocaleString()}
                  </p>
                </div>

                {/* Balance de Bolsillos */}
                <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3 mb-3">
                  <div className="flex justify-between">
                    <span>Fondo Inicial Efectivo:</span>
                    <span className="font-bold">Bs. {reporteZ.fondoInicialEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span>Bs. {reporteZ.saldoEfectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span>Efectivo Físico Contado:</span>
                    <span>Bs. {reporteZ.efectivoContadoCiego.toFixed(2)}</span>
                  </div>

                  {/* Diferencia con alerta visual */}
                  <div
                    className={`flex justify-between font-black text-sm p-1.5 rounded-lg mt-1 ${
                      Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "bg-emerald-100 text-emerald-800"
                        : reporteZ.diferenciaEfectivo > 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    <span>
                      Diferencia (
                      {Math.abs(reporteZ.diferenciaEfectivo) < 0.01
                        ? "Exacto"
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

                {/* Caja Digital Bancaria */}
                <div className="space-y-1 border-b border-dashed border-slate-400 pb-3 mb-3">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span>Acumulado QR / Banco:</span>
                    <span>Bs. {reporteZ.saldoQrAcumulado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>VENTAS TOTALES DEL TURNO:</span>
                    <span>Bs. {reporteZ.totalRecaudadoGeneral.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {reporteZ.totalVentasRealizadas} transacciones registradas
                  </div>
                </div>

                {/* Desglose de Inteligencia: Platos vs Extras */}
                <div className="space-y-1 border-b border-dashed border-slate-400 pb-3 mb-3 text-[11px]">
                  <div className="font-bold text-slate-800">Desglose de Ventas:</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platos Base:</span>
                    <span>Bs. {reporteZ.totalPlatosBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Toppings y Extras:</span>
                    <span>+Bs. {reporteZ.totalExtras.toFixed(2)}</span>
                  </div>
                </div>

                {/* Top 5 Productos */}
                {reporteZ.top5Productos.length > 0 && (
                  <div>
                    <div className="font-bold text-slate-800 mb-1">⭐ Top 5 Más Vendidos:</div>
                    <div className="space-y-1 text-[11px]">
                      {reporteZ.top5Productos.map((prod, i) => (
                        <div key={i} className="flex justify-between text-slate-600">
                          <span>
                            {i + 1}. {prod.nombre} (x{prod.cantidad})
                          </span>
                          <span className="font-bold">Bs. {prod.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Iniciar Siguiente Turno */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Aperturar Siguiente Turno con Fondo Inicial (Bs.):
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={nuevoFondoStr}
                    onChange={(e) => setNuevoFondoStr(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-700 text-amber-400 font-black text-base px-3 py-2 rounded-xl text-center"
                  />
                  <button
                    onClick={handleNuevoTurno}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Abrir Siguiente Turno
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
