"use client";

import React, { useState } from "react";
import {
  X,
  Banknote,
  QrCode,
  ShoppingCart,
  Flame,
  Building2,
  PlusCircle,
  CheckCircle2,
  Delete,
} from "lucide-react";
import { RegistrarMovimientoInput } from "@/server/actions";

interface Usuario {
  id: string;
  nombre: string;
  rol: "ADMIN" | "CAJERA" | "LOGISTICA";
  pin4Digitos: string;
}

interface ModalSalidaProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: string;
  cajeraId: string;
  usuarios: Usuario[];
  onConfirmarMovimiento: (data: RegistrarMovimientoInput) => Promise<boolean>;
}

export function ModalSalida({
  isOpen,
  onClose,
  turnoId,
  cajeraId,
  usuarios,
  onConfirmarMovimiento,
}: ModalSalidaProps) {
  const [bolsillo, setBolsillo] = useState<"EFECTIVO_CAJON" | "QR_BANCO">("EFECTIVO_CAJON");
  const [tipo, setTipo] = useState<"GASTO_INSUMOS" | "RETIRO_BOVEDA" | "INGRESO_CAMBIO">("GASTO_INSUMOS");
  const [montoStr, setMontoStr] = useState("");
  const [motivo, setMotivo] = useState("Compra de Verduras / Mercado");
  const [notaOpcional, setNotaOpcional] = useState("");
  const [receptorId, setReceptorId] = useState<string>(
    usuarios.find((u) => u.rol === "LOGISTICA")?.id || usuarios[0]?.id || ""
  );
  const [pinReceptor, setPinReceptor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Botones rápidos de motivo común
  const motivosSugeridos = [
    { label: "🛒 Insumos / Mercado", tipo: "GASTO_INSUMOS" as const, mot: "Compra de Insumos / Mercado" },
    { label: "🔥 Gas / Garrafa", tipo: "GASTO_INSUMOS" as const, mot: "Compra Garrafa de Gas" },
    { label: "🏦 Retiro a Bóveda", tipo: "RETIRO_BOVEDA" as const, mot: "Retiro de Seguridad a Bóveda" },
    { label: "➕ Ingreso de Cambio", tipo: "INGRESO_CAMBIO" as const, mot: "Ingreso de Monedas / Cambio" },
  ];

  const handleKeyPress = (num: string) => {
    if (pinReceptor.length < 4) {
      setPinReceptor((prev) => prev + num);
      setErrorMessage("");
    }
  };

  const handleDeletePin = () => {
    setPinReceptor((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    const monto = parseFloat(montoStr) || 0;
    if (monto <= 0) {
      setErrorMessage("Ingresa un monto válido en Bs.");
      return;
    }
    if (pinReceptor.length !== 4) {
      setErrorMessage("El receptor debe ingresar su PIN de 4 dígitos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const ok = await onConfirmarMovimiento({
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
      // Limpiar y cerrar
      setMontoStr("");
      setPinReceptor("");
      setNotaOpcional("");
      onClose();
    } else {
      setErrorMessage("PIN incorrecto o error al procesar el retiro.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <h3 className="text-base font-black text-amber-400 uppercase tracking-wider">
              Salida / Retiro de Dinero (Cero Papel)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* 1. ¿De dónde sale el dinero? (Bolsillo obligatorio) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5">
              1. ¿De dónde sale el dinero? (Selector de Bolsillo)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBolsillo("EFECTIVO_CAJON")}
                className={`py-3 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  bolsillo === "EFECTIVO_CAJON"
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>💵 Del Cajón (Efectivo)</span>
              </button>

              <button
                type="button"
                onClick={() => setBolsillo("QR_BANCO")}
                className={`py-3 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  bolsillo === "QR_BANCO"
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>📱 Por QR / Transferencia</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {bolsillo === "EFECTIVO_CAJON"
                ? "Descuenta directamente de los billetes físicos del cajón."
                : "Descuenta del saldo digital bancario; no afecta los billetes del cajón."}
            </p>
          </div>

          {/* 2. Tipo de Salida (Chips de 1 toque) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5">
              2. Motivo Rápido
            </label>
            <div className="grid grid-cols-2 gap-2">
              {motivosSugeridos.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTipo(m.tipo);
                    setMotivo(m.mot);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                    motivo === m.mot
                      ? "bg-amber-500 border-amber-400 text-slate-950 font-black"
                      : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Monto y Nota Opcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
                Monto a Retirar (Bs.)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={montoStr}
                onChange={(e) => setMontoStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-2xl font-black rounded-2xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
                ¿Quién recibe el dinero?
              </label>
              <select
                value={receptorId}
                onChange={(e) => setReceptorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm font-bold rounded-2xl px-3 py-3 focus:outline-none focus:border-amber-400"
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
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
              Nota / Detalle Opcional
            </label>
            <input
              type="text"
              placeholder="ej. Verduras para almuerzo, Gas garrafa 1..."
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 4. Firma Digital por PIN de 4 Dígitos */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                Firma Digital con PIN (4 dígitos)
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pinReceptor.length > idx
                        ? "bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50"
                        : "border-slate-700 bg-slate-900"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado Numérico Táctil */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-black text-lg py-2.5 rounded-xl border border-slate-700 transition cursor-pointer shadow-sm"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-black text-lg py-2.5 rounded-xl border border-slate-700 transition cursor-pointer shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeletePin}
                className="bg-slate-800 hover:bg-rose-900 active:scale-95 text-rose-400 font-bold py-2.5 rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-rose-400 text-center mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Pie: Confirmación */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting || pinReceptor.length !== 4 || !montoStr}
            onClick={handleSubmit}
            className="flex-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-sm uppercase rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? "Firmando..." : "Firmar y Registrar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
