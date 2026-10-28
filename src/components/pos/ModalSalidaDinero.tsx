"use client";

import React, { useState } from "react";
import { X, Banknote, QrCode, Check, Delete, ArrowUpRight } from "lucide-react";
import { RegistrarSalidaInput } from "@/actions/movimiento-actions";

interface Usuario {
  id: string;
  nombre: string;
  rol: "ADMIN" | "CAJERA" | "LOGISTICA";
  pin4Digitos: string;
}

interface ModalSalidaDineroProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: string;
  cajeraId: string;
  usuarios: Usuario[];
  onConfirmarSalida: (data: RegistrarSalidaInput) => Promise<boolean>;
}

export function ModalSalidaDinero({
  isOpen,
  onClose,
  turnoId,
  cajeraId,
  usuarios,
  onConfirmarSalida,
}: ModalSalidaDineroProps) {
  const [bolsillo, setBolsillo] = useState<"EFECTIVO_CAJON" | "QR_BANCO">("EFECTIVO_CAJON");
  const [tipo, setTipo] = useState<"GASTO_INSUMOS" | "RETIRO_BOVEDA" | "INGRESO_CAMBIO">("GASTO_INSUMOS");
  const [montoStr, setMontoStr] = useState("");
  const [motivo, setMotivo] = useState("Compra de Insumos / Mercado");
  const [notaOpcional, setNotaOpcional] = useState("");
  const [receptorId, setReceptorId] = useState<string>(
    usuarios.find((u) => u.rol === "LOGISTICA")?.id || usuarios[0]?.id || ""
  );
  const [pinReceptor, setPinReceptor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const motivos = [
    { label: "Compra Insumos / Logística", tipo: "GASTO_INSUMOS" as const, mot: "Compra de Insumos / Mercado" },
    { label: "Gas / Servicios Urgentes", tipo: "GASTO_INSUMOS" as const, mot: "Compra Garrafa Gas / Servicios" },
    { label: "Retiro a Bóveda / Seguridad", tipo: "RETIRO_BOVEDA" as const, mot: "Retiro de Seguridad a Bóveda" },
    { label: "Ingreso Extra de Cambio", tipo: "INGRESO_CAMBIO" as const, mot: "Ingreso de Monedas / Cambio" },
  ];

  const handleKey = (n: string) => {
    if (pinReceptor.length < 4) {
      setPinReceptor((prev) => prev + n);
      setErrorMessage("");
    }
  };

  const handleBackspace = () => {
    setPinReceptor((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    const monto = parseFloat(montoStr) || 0;
    if (monto <= 0) {
      setErrorMessage("Ingresa un monto válido en Bolivianos.");
      return;
    }
    if (pinReceptor.length !== 4) {
      setErrorMessage("El receptor debe validar su PIN de 4 dígitos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const ok = await onConfirmarSalida({
      turnoId,
      registradoPorId: cajeraId,
      tipo,
      bolsillo,
      monto,
      motivo,
      notaOpcional: notaOpcional.trim() || undefined,
      receptorId,
      pinReceptor,
    });

    setIsSubmitting(false);

    if (ok) {
      setMontoStr("");
      setPinReceptor("");
      setNotaOpcional("");
      onClose();
    } else {
      setErrorMessage("PIN incorrecto para el receptor seleccionado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#161920] border border-[#262B36] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-[#FB7185]" strokeWidth={1.75} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
              REGISTRO DE SALIDA DE DINERO
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7D8597] hover:text-[#E5E9F0] p-1 rounded hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Paso 1: Selector Obligatorio de Bolsillo */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1.5">
              1. ORIGEN DEL DINERO
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBolsillo("EFECTIVO_CAJON")}
                className={`h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer ${
                  bolsillo === "EFECTIVO_CAJON"
                    ? "bg-[#1A2421] border-[#10B981]/50 text-[#34D399]"
                    : "bg-[#1E222B] border-[#2D3340] text-[#7D8597] hover:text-[#E5E9F0]"
                }`}
              >
                <Banknote className="w-4 h-4 text-[#34D399]" strokeWidth={1.75} />
                <span>Caja Física (Cajón)</span>
              </button>

              <button
                type="button"
                onClick={() => setBolsillo("QR_BANCO")}
                className={`h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer ${
                  bolsillo === "QR_BANCO"
                    ? "bg-[#15232D] border-[#0284C7]/50 text-[#38BDF8]"
                    : "bg-[#1E222B] border-[#2D3340] text-[#7D8597] hover:text-[#E5E9F0]"
                }`}
              >
                <QrCode className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.75} />
                <span>Transferencia / QR</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Motivo */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1.5">
              2. CONCEPTO DE LA OPERACIÓN
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {motivos.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTipo(m.tipo);
                    setMotivo(m.mot);
                  }}
                  className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all duration-75 text-left cursor-pointer flex items-center ${
                    motivo === m.mot
                      ? "bg-[#252B37] border-[#363E4F] text-[#E5E9F0] font-semibold"
                      : "bg-[#1E222B] border-[#2D3340] text-[#7D8597] hover:text-[#E5E9F0]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto y Receptor */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1">
                MONTO EN BS.
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={montoStr}
                onChange={(e) => setMontoStr(e.target.value)}
                className="w-full h-10 bg-[#12151A] border border-[#2D3340] text-[#E5E9F0] text-lg font-bold font-mono rounded-lg px-3 text-center focus:outline-none focus:border-[#3B4252] tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1">
                RECEPTOR RESPONSABLE
              </label>
              <select
                value={receptorId}
                onChange={(e) => setReceptorId(e.target.value)}
                className="w-full h-10 bg-[#12151A] border border-[#2D3340] text-[#E5E9F0] text-xs font-medium rounded-lg px-2.5 focus:outline-none focus:border-[#3B4252]"
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] block mb-1">
              OBSERVACIÓN / DETALLE (OPCIONAL)
            </label>
            <input
              type="text"
              placeholder="ej. Verduras para almuerzo, Gas de reposición..."
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              className="w-full h-8 bg-[#12151A] border border-[#2D3340] text-[#E5E9F0] placeholder-[#646E82] text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#3B4252]"
            />
          </div>

          {/* Paso 3: Firma Digital con PIN */}
          <div className="bg-[#12151A] p-3 rounded-lg border border-[#262B36]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597]">
                VALIDACIÓN CON PIN (4 DÍGITOS)
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full border transition-all duration-75 ${
                      pinReceptor.length > idx
                        ? "bg-[#FB7185] border-[#FB7185]"
                        : "border-[#2D3340] bg-[#1E222B]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado Táctil */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKey(n.toString())}
                  className="h-10 bg-[#1E222B] hover:bg-[#252A35] active:translate-y-[1px] text-[#E5E9F0] font-bold text-base font-mono rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer tabular-nums"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKey("0")}
                className="h-10 bg-[#1E222B] hover:bg-[#252A35] active:translate-y-[1px] text-[#E5E9F0] font-bold text-base font-mono rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-10 bg-[#1E222B] hover:bg-[rgba(244,63,94,0.15)] text-[#FB7185] font-bold rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-medium text-[#FB7185] text-center mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Pie de Confirmación */}
        <div className="p-3 bg-[#14171D] border-t border-[#262B36] flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 bg-[#1E222B] hover:bg-[#252A35] text-[#7D8597] hover:text-[#E5E9F0] font-medium text-xs rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || pinReceptor.length !== 4 || !montoStr}
            onClick={handleSubmit}
            className="flex-2 h-10 bg-[#FB7185] hover:bg-[#F43F5E] disabled:opacity-40 text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-75 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-[#0B0F14]" strokeWidth={2} />
            <span>{isSubmitting ? "Registrando..." : "Confirmar Salida"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
