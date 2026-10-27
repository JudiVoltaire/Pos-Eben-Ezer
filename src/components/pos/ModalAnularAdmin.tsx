"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Delete, ShieldAlert } from "lucide-react";

interface ModalAnularAdminProps {
  isOpen: boolean;
  onClose: () => void;
  ultimoTicket: { nroTicket: number; ventaId: string; total: number } | null;
  onConfirmarAnulacion: (ventaId: string, pinAdmin: string) => Promise<boolean>;
}

export function ModalAnularAdmin({
  isOpen,
  onClose,
  ultimoTicket,
  onConfirmarAnulacion,
}: ModalAnularAdminProps) {
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
      setErrorMessage("PIN de Administrador incorrecto (ej. Dueña 9999).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="p-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#E5E9F0]">
              Anular Venta #{ultimoTicket.nroTicket}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1 rounded-lg hover:bg-[#21252D] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-center">
            <p className="text-xs text-rose-200">
              ¿Estás seguro de anular el ticket #{ultimoTicket.nroTicket} por{" "}
              <strong className="text-white font-black tabular-nums">
                Bs. {ultimoTicket.total.toFixed(2)}
              </strong>
              ?
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Esta acción revertirá los saldos de los bolsillos y despachará alerta forense inmediata.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                PIN de Administrador (Dueña):
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pinAdmin.length > idx
                        ? "bg-rose-400 border-rose-400 scale-110 shadow-sm shadow-rose-400/50"
                        : "border-[#2E3440] bg-[#16181D]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado numérico táctil */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKeyPress(n)}
                  className="h-12 bg-[#21252D] hover:bg-[#2E3440] active:scale-95 text-[#E5E9F0] text-lg font-black rounded-xl border border-[#2E3440] transition cursor-pointer tabular-nums"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDeletePin}
                className="h-12 bg-[#21252D] hover:bg-rose-950/40 text-rose-400 active:scale-95 flex items-center justify-center rounded-xl border border-[#2E3440] transition cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="h-12 bg-[#21252D] hover:bg-[#2E3440] active:scale-95 text-[#E5E9F0] text-lg font-black rounded-xl border border-[#2E3440] transition cursor-pointer tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleAnular}
                disabled={pinAdmin.length !== 4 || isSubmitting}
                className="h-12 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? "..." : "Anular"}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-bold text-center mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
