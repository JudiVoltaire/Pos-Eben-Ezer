"use client";

import React, { useState } from "react";
import { X, Banknote, QrCode, CheckCircle2, Delete, ArrowDownCircle } from "lucide-react";
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
    { label: "🛒 Compra Insumos / Logística", tipo: "GASTO_INSUMOS" as const, mot: "Compra de Insumos / Mercado" },
    { label: "🔥 Gas / Servicios Urgentes", tipo: "GASTO_INSUMOS" as const, mot: "Compra Garrafa Gas / Servicios" },
    { label: "🏦 Retiro a Bóveda / Sobre", tipo: "RETIRO_BOVEDA" as const, mot: "Retiro de Seguridad a Bóveda" },
    { label: "➕ Ingreso de Cambio", tipo: "INGRESO_CAMBIO" as const, mot: "Ingreso de Monedas / Cambio" },
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
    <div className="fixed inset-0 z-50 bg-[#16181D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="h-14 px-5 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ArrowDownCircle className="w-5 h-5 text-[#FB7185]" />
            <h3 className="text-sm font-bold text-[#E5E9F0] uppercase tracking-wider">
              Salida / Retiro de Dinero (Caso María)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1.5 rounded-lg hover:bg-[#21252D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Paso 1: Selector Obligatorio de Bolsillo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
              1. ¿De dónde sale el dinero? (Selector de Bolsillo)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBolsillo("EFECTIVO_CAJON")}
                className={`h-12 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer ${
                  bolsillo === "EFECTIVO_CAJON"
                    ? "bg-[rgba(16,185,129,0.14)] border-[rgba(16,185,129,0.35)] text-[#34D399] shadow-sm"
                    : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
                }`}
              >
                <Banknote className="w-4 h-4 text-[#34D399]" />
                <span>Efectivo del Cajón</span>
              </button>

              <button
                type="button"
                onClick={() => setBolsillo("QR_BANCO")}
                className={`h-12 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-75 cursor-pointer ${
                  bolsillo === "QR_BANCO"
                    ? "bg-[rgba(56,189,248,0.14)] border-[rgba(56,189,248,0.35)] text-[#38BDF8] shadow-sm"
                    : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
                }`}
              >
                <QrCode className="w-4 h-4 text-[#38BDF8]" />
                <span>Transferencia QR / Banco</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Motivo Rápido */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
              2. Motivo de la Salida
            </label>
            <div className="grid grid-cols-2 gap-2">
              {motivos.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTipo(m.tipo);
                    setMotivo(m.mot);
                  }}
                  className={`h-11 px-3 rounded-xl border text-xs font-medium transition-all duration-75 text-left cursor-pointer flex items-center ${
                    motivo === m.mot
                      ? "bg-[rgba(244,63,94,0.14)] border-[rgba(244,63,94,0.35)] text-[#FB7185] font-semibold"
                      : "bg-[#21252D] border-[#2E3440] text-[#E5E9F0] hover:bg-[#2A303C]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto y Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
                Monto en Bs.
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={montoStr}
                onChange={(e) => setMontoStr(e.target.value)}
                className="w-full h-12 bg-[#16181D] border border-[#2E3440] text-[#FB7185] text-xl font-bold font-mono rounded-xl px-3 text-center focus:outline-none focus:border-[#FB7185]/60 tabular-nums transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
                ¿Quién recibe el dinero?
              </label>
              <select
                value={receptorId}
                onChange={(e) => setReceptorId(e.target.value)}
                className="w-full h-12 bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] text-xs font-semibold rounded-xl px-3 focus:outline-none focus:border-[#FB7185]/60 transition-colors"
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
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Nota Opcional
            </label>
            <input
              type="text"
              placeholder="ej. Verduras para almuerzo, Garrafa 1..."
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              className="w-full h-10 bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] placeholder-[#94A3B8] text-xs rounded-xl px-3 focus:outline-none focus:border-[#FB7185]/60 transition-colors"
            />
          </div>

          {/* Paso 3: Firma Digital con PIN */}
          <div className="bg-[#16181D] p-4 rounded-xl border border-[#2E3440]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-[#FB7185] tracking-wider">
                Firma Digital (PIN 4 Dígitos del Receptor)
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-75 ${
                      pinReceptor.length > idx
                        ? "bg-[#FB7185] border-[#FB7185] scale-110 shadow-sm"
                        : "border-[#2E3440] bg-[#21252D]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado Táctil */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKey(n.toString())}
                  className="h-14 bg-[#21252D] hover:bg-[#2A303C] active:scale-[0.98] text-[#E5E9F0] font-bold text-xl font-mono rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer tabular-nums"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKey("0")}
                className="h-14 bg-[#21252D] hover:bg-[#2A303C] active:scale-[0.98] text-[#E5E9F0] font-bold text-xl font-mono rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 bg-[#21252D] hover:bg-[rgba(244,63,94,0.15)] text-[#FB7185] font-bold rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-[#FB7185] text-center mt-2.5">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Pie de Confirmación */}
        <div className="p-4 bg-[#16181D] border-t border-[#2E3440] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-medium text-xs rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || pinReceptor.length !== 4 || !montoStr}
            onClick={handleSubmit}
            className="flex-2 h-12 bg-[#FB7185] hover:bg-[#F43F5E] disabled:opacity-40 text-[#16181D] font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-75 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#16181D]" />
            <span>{isSubmitting ? "Firmando..." : "Firmar y Registrar Salida"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
