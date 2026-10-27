"use client";

import React, { useState } from "react";
import { X, Delete, ShieldAlert } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-[#16181D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="h-14 px-5 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-[#FB7185]">
            <ShieldAlert className="w-5 h-5 text-[#FB7185]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5E9F0]">
              Anular Venta #{ultimoTicket.nroTicket}
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
        <div className="p-5 space-y-4">
          <div className="bg-[rgba(244,63,94,0.14)] border border-[rgba(244,63,94,0.35)] rounded-xl p-3.5 text-center">
            <p className="text-xs text-[#E5E9F0]">
              ¿Estás seguro de anular el ticket #{ultimoTicket.nroTicket} por{" "}
              <strong className="text-[#FB7185] font-bold font-mono tabular-nums">
                Bs. {ultimoTicket.total.toFixed(2)}
              </strong>
              ?
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Esta acción revertirá los saldos de los bolsillos y despachará alerta forense inmediata.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-[#FBBF24] tracking-wider">
                PIN de Administrador (Dueña):
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-75 ${
                      pinAdmin.length > idx
                        ? "bg-[#FB7185] border-[#FB7185] scale-110 shadow-sm"
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
                  className="h-14 bg-[#21252D] hover:bg-[#2A303C] active:scale-[0.98] text-[#E5E9F0] text-xl font-bold font-mono rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer tabular-nums"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDeletePin}
                className="h-14 bg-[#21252D] hover:bg-[rgba(244,63,94,0.15)] text-[#FB7185] active:scale-[0.98] flex items-center justify-center rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="h-14 bg-[#21252D] hover:bg-[#2A303C] active:scale-[0.98] text-[#E5E9F0] text-xl font-bold font-mono rounded-xl border border-[#2E3440] transition-all duration-75 cursor-pointer tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleAnular}
                disabled={pinAdmin.length !== 4 || isSubmitting}
                className="h-14 bg-[#FB7185] hover:bg-[#F43F5E] disabled:opacity-40 text-[#16181D] font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-75 cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? "..." : "Anular"}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-[#FB7185] font-semibold text-center mt-2.5">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
