"use client";

import React, { useState } from "react";
import { X, Banknote, QrCode, CheckCircle2, Delete } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="p-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
              Salida / Retiro de Dinero (Caso María)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Paso 1: Selector Obligatorio de Bolsillo */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-1.5">
              1. ¿De dónde sale el dinero? (Selector de Bolsillo)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBolsillo("EFECTIVO_CAJON")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  bolsillo === "EFECTIVO_CAJON"
                    ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm"
                    : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:bg-[#2A303C]"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>💵 Efectivo del Cajón</span>
              </button>

              <button
                type="button"
                onClick={() => setBolsillo("QR_BANCO")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  bolsillo === "QR_BANCO"
                    ? "bg-sky-950/70 border-sky-500/50 text-sky-300 shadow-sm"
                    : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:bg-[#2A303C]"
                }`}
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>📱 Transferencia QR / Banco</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Motivo Rápido */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-1.5">
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
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                    motivo === m.mot
                      ? "bg-amber-950/60 border-amber-500/50 text-amber-300 font-black"
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
              <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-1">
                Monto en Bolivianos (Bs.)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={montoStr}
                onChange={(e) => setMontoStr(e.target.value)}
                className="w-full bg-[#16181D] border border-[#2E3440] text-amber-300 text-2xl font-black rounded-xl px-3 py-2 text-center focus:outline-none focus:border-amber-400 tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-1">
                ¿Quién recibe el dinero?
              </label>
              <select
                value={receptorId}
                onChange={(e) => setReceptorId(e.target.value)}
                className="w-full bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] text-xs font-bold rounded-xl px-3 py-3 focus:outline-none focus:border-amber-400"
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
            <label className="text-xs font-black uppercase tracking-wider text-[#E5E9F0] block mb-1">
              Nota Opcional
            </label>
            <input
              type="text"
              placeholder="ej. Verduras para almuerzo, Garrafa 1..."
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              className="w-full bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Paso 3: Firma Digital con PIN */}
          <div className="bg-[#16181D] p-3.5 rounded-2xl border border-[#2E3440]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                Firma Digital (PIN 4 Dígitos del Receptor)
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      pinReceptor.length > idx
                        ? "bg-amber-400 border-amber-400 scale-110 shadow-sm"
                        : "border-[#2E3440] bg-[#21252D]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado Táctil */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKey(n.toString())}
                  className="bg-[#21252D] hover:bg-[#2A303C] active:scale-95 text-[#E5E9F0] font-black text-base py-2 rounded-xl border border-[#2E3440] transition cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKey("0")}
                className="bg-[#21252D] hover:bg-[#2A303C] active:scale-95 text-[#E5E9F0] font-black text-base py-2 rounded-xl border border-[#2E3440] transition cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="bg-[#21252D] hover:bg-rose-950 text-rose-400 font-bold py-2 rounded-xl border border-[#2E3440] transition cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-rose-400 text-center mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Pie de Confirmación */}
        <div className="p-4 bg-[#16181D] border-t border-[#2E3440] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || pinReceptor.length !== 4 || !montoStr}
            onClick={handleSubmit}
            className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? "Firmando..." : "Firmar y Registrar Salida"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
