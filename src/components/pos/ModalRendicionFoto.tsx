"use client";

import React, { useState, useRef } from "react";
import { X, Camera, Check } from "lucide-react";

interface MovimientoPendiente {
  id: string;
  fechaHora: string | null;
  tipo: string;
  bolsillo: string;
  monto: number;
  motivo: string;
  notaOpcional?: string | null;
  estadoRendicion: string;
}

interface ModalRendicionFotoProps {
  isOpen: boolean;
  onClose: () => void;
  pendientes: MovimientoPendiente[];
  onGuardarFoto: (movimientoId: string, base64: string) => Promise<boolean>;
}

export function ModalRendicionFoto({
  isOpen,
  onClose,
  pendientes,
  onGuardarFoto,
}: ModalRendicionFotoProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmar = async () => {
    if (!selectedId || !preview) return;
    setIsSaving(true);
    const ok = await onGuardarFoto(selectedId, preview);
    setIsSaving(false);
    if (ok) {
      setSelectedId(null);
      setPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#161920] border border-[#262B36] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="h-12 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#FB7185]" strokeWidth={1.75} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
              FOTOS DE RECIBOS Y COMPROBANTES
            </h3>
            <span className="bg-[rgba(244,63,94,0.12)] text-[#FB7185] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-[rgba(244,63,94,0.3)] tabular-nums">
              {pendientes.length} por respaldar
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#7D8597] hover:text-[#E5E9F0] p-1 rounded hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input invisible para cámara/archivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        {/* Lista de gastos */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 bg-[#14171D]">
          {pendientes.length === 0 ? (
            <div className="py-12 text-center text-[#646E82]">
              <Check className="w-8 h-8 mx-auto text-[#10B981] mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-[#E5E9F0]">
                No hay salidas pendientes de comprobante
              </p>
              <p className="text-[11px] text-[#7D8597] mt-0.5">
                Todas las salidas de dinero cuentan con foto de recibo adjunta.
              </p>
            </div>
          ) : (
            pendientes.map((mov) => {
              const isSelected = selectedId === mov.id;
              return (
                <div
                  key={mov.id}
                  className={`p-3 rounded-lg border transition-all duration-75 ${
                    isSelected
                      ? "bg-[#232834] border-[#F59E0B]"
                      : "bg-[#1E222B] border-[#2D3340] hover:bg-[#252A35]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-xs text-[#E5E9F0]">
                        {mov.motivo}
                      </div>
                      <div className="text-[11px] text-[#7D8597] mt-0.5 tabular-nums">
                        Origen:{" "}
                        <span className="font-medium text-[#C5CBD6]">
                          {mov.bolsillo === "EFECTIVO_CAJON" ? "Efectivo en Cajón" : "Banco / QR"}
                        </span>{" "}
                        · {mov.fechaHora ? new Date(mov.fechaHora).toLocaleTimeString() : ""}
                      </div>
                      {mov.notaOpcional && (
                        <p className="text-[11px] text-[#7D8597] italic mt-0.5">
                          "{mov.notaOpcional}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-[#FB7185] tabular-nums">
                        Bs. {mov.monto.toFixed(2)}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedId(mov.id);
                          setPreview(null);
                          fileInputRef.current?.click();
                        }}
                        className="mt-1 h-7 px-2.5 rounded bg-[#1E222B] hover:bg-[#252A35] border border-[#2D3340] text-[#E5E9F0] text-xs font-medium transition-all duration-75 cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3 h-3 text-[#F59E0B]" strokeWidth={1.75} />
                        <span>Subir Foto</span>
                      </button>
                    </div>
                  </div>

                  {/* Previsualización */}
                  {isSelected && preview && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#262B36] flex flex-col items-center">
                      <div className="w-full max-h-40 rounded-lg overflow-hidden border border-[#262B36] mb-2 bg-[#12151A]">
                        <img
                          src={preview}
                          alt="Recibo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setPreview(null)}
                          className="flex-1 h-8 bg-[#1E222B] hover:bg-[#252A35] text-[#C5CBD6] text-xs font-medium rounded border border-[#2D3340] transition-colors"
                        >
                          Cambiar Foto
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={handleConfirmar}
                          className="flex-2 h-8 bg-[#10B981] hover:bg-[#059669] text-[#0B0F14] text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{isSaving ? "Guardando..." : "Guardar Foto"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="h-12 px-4 bg-[#14171D] border-t border-[#262B36] flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="h-8 px-3.5 bg-[#1E222B] hover:bg-[#252A35] text-[#C5CBD6] hover:text-[#E5E9F0] font-medium text-xs rounded-lg border border-[#2D3340] transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
