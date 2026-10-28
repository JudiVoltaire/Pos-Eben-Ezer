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
      setErrorMessage("Ingresa los 4 dígitos del PIN de Administrador.");
      return;
    }

    setIsSubmitting(true);
    const ok = await onConfirmarAnulacion(ultimoTicket.ventaId, pinAdmin);
    setIsSubmitting(false);

    if (ok) {
      setPinAdmin("");
      onClose();
    } else {
      setErrorMessage("El PIN de Administrador es incorrecto.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#161920] border border-[#262B36] rounded-lg w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FB7185]" strokeWidth={1.75} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
              ANULAR VENTA · TICKET #{ultimoTicket.nroTicket}
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
        <div className="p-4 space-y-3.5">
          <div className="bg-[#1E222B] border border-[#2D3340] border-l-[3px] border-l-[#FB7185] rounded-lg p-3 text-center">
            <p className="text-xs text-[#E5E9F0]">
              ¿Deseas anular la venta del ticket #{ultimoTicket.nroTicket} por{" "}
              <strong className="text-[#FB7185] font-bold font-mono tabular-nums">
                Bs. {ultimoTicket.total.toFixed(2)}
              </strong>
              ?
            </p>
            <p className="text-[10px] text-[#7D8597] mt-1 font-medium">
              Esta acción cancelará la venta, restará el dinero de la caja y registrará la anulación.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7D8597]">
                PIN DE 4 DÍGITOS DEL ADMINISTRADOR:
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full border transition-all duration-75 ${
                      pinAdmin.length > idx
                        ? "bg-[#FB7185] border-[#FB7185]"
                        : "border-[#2D3340] bg-[#1E222B]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Teclado numérico táctil */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKeyPress(n)}
                  className="h-10 bg-[#1E222B] hover:bg-[#252A35] active:translate-y-[1px] text-[#E5E9F0] text-lg font-bold font-mono rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer tabular-nums"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDeletePin}
                className="h-10 bg-[#1E222B] hover:bg-[rgba(244,63,94,0.15)] text-[#FB7185] flex items-center justify-center rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer"
              >
                <Delete className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="h-10 bg-[#1E222B] hover:bg-[#252A35] active:translate-y-[1px] text-[#E5E9F0] text-lg font-bold font-mono rounded-lg border border-[#2D3340] transition-all duration-75 cursor-pointer tabular-nums"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleAnular}
                disabled={pinAdmin.length !== 4 || isSubmitting}
                className="h-10 bg-[#FB7185] hover:bg-[#F43F5E] disabled:opacity-40 text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-75 cursor-pointer flex items-center justify-center px-2"
              >
                {isSubmitting ? "..." : "Confirmar Anulación"}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-medium text-[#FB7185] text-center mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
