"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Delete, CheckCircle2 } from "lucide-react";

interface ModalAnularProps {
  isOpen: boolean;
  onClose: () => void;
  ultimoTicket: { nroTicket: number; ventaId: string; total: number } | null;
  onConfirmarAnulacion: (ventaId: string, pinAdmin: string) => Promise<boolean>;
}

export function ModalAnular({
  isOpen,
  onClose,
  ultimoTicket,
  onConfirmarAnulacion,
}: ModalAnularProps) {
  const [pinAdmin, setPinAdmin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !ultimoTicket) return null;

  const handleKeyPress = (num: string) => {
    if (pinAdmin.length < 4) {
      setPinAdmin((prev) => prev + num);
      setErrorMessage("");
    }
  };

  const handleDeletePin = () => {
    setPinAdmin((prev) => prev.slice(0, -1));
  };

  const handleAnular = async () => {
    if (pinAdmin.length !== 4) {
      setErrorMessage("Ingresa el PIN de Administrador (4 dígitos)");
      return;
    }

    setIsSubmitting(true);
    const ok = await onConfirmarAnulacion(ultimoTicket.ventaId, pinAdmin);
    setIsSubmitting(false);

    if (ok) {
      setPinAdmin("");
      onClose();
    } else {
      setErrorMessage("PIN de Administrador incorrecto.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-black uppercase tracking-wider">
              Anular Venta #{ultimoTicket.nroTicket}
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
        <div className="p-5 space-y-4">
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-center">
            <p className="text-xs text-rose-300">
              ¿Estás seguro de anular el ticket #{ultimoTicket.nroTicket} por{" "}
              <strong className="text-white">Bs. {ultimoTicket.total.toFixed(2)}</strong>?
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Esta acción revertirá los saldos de caja y notificará al bot de seguridad.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                PIN de Administrador:
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pinAdmin.length > idx
                        ? "bg-rose-400 border-rose-400 scale-110 shadow-sm shadow-rose-400/50"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado Numérico */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mt-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-black text-lg py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-black text-lg py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
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

        {/* Pie */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            disabled={isSubmitting || pinAdmin.length !== 4}
            onClick={handleAnular}
            className="flex-2 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? "Anulando..." : "Confirmar Anulación"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
