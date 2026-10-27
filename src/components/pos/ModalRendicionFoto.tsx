"use client";

import React, { useState, useRef } from "react";
import { X, Camera, CheckCircle2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-[#16181D]/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="h-14 px-5 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#FB7185]" />
            <h3 className="text-sm font-bold text-[#E5E9F0] uppercase tracking-wider">
              Rendiciones Fotográficas (Cero Papel)
            </h3>
            <span className="bg-[rgba(244,63,94,0.14)] text-[#FB7185] text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-[rgba(244,63,94,0.35)] tabular-nums">
              {pendientes.length} pendientes
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1.5 rounded-lg hover:bg-[#21252D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
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
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-[#1C1F26]">
          {pendientes.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#34D399] mb-2" />
              <p className="text-xs font-semibold text-[#E5E9F0]">
                ¡Cero gastos pendientes!
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Todas las compras de insumos del turno ya tienen comprobante fotográfico.
              </p>
            </div>
          ) : (
            pendientes.map((mov) => {
              const isSelected = selectedId === mov.id;
              return (
                <div
                  key={mov.id}
                  className={`p-3.5 rounded-xl border transition-all duration-75 ${
                    isSelected
                      ? "bg-[#21252D] border-[#FBBF24] shadow-md"
                      : "bg-[#21252D] border-[#2E3440] hover:bg-[#2A303C]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-[#E5E9F0]">
                        {mov.motivo}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-1 tabular-nums">
                        Bolsillo: <span className="font-medium text-[#E5E9F0]">{mov.bolsillo}</span> •{" "}
                        {mov.fechaHora ? new Date(mov.fechaHora).toLocaleTimeString() : ""}
                      </div>
                      {mov.notaOpcional && (
                        <p className="text-[11px] text-[#FBBF24] italic mt-0.5">
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
                        className="mt-1.5 h-8 px-2.5 rounded-lg bg-[#21252D] hover:bg-[#2A303C] border border-[#2E3440] hover:border-[#FBBF24]/50 text-[#E5E9F0] text-xs font-medium transition-all duration-75 cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>Foto</span>
                      </button>
                    </div>
                  </div>

                  {/* Previsualización */}
                  {isSelected && preview && (
                    <div className="mt-3 pt-3 border-t border-[#2E3440] flex flex-col items-center">
                      <div className="w-full max-h-44 rounded-xl overflow-hidden border border-[#2E3440] mb-2.5 bg-[#16181D]">
                        <img
                          src={preview}
                          alt="Recibo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setPreview(null)}
                          className="flex-1 h-9 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] text-xs font-medium rounded-lg border border-[#2E3440] transition-colors"
                        >
                          Repetir
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={handleConfirmar}
                          className="flex-2 h-9 bg-[#34D399] hover:bg-[#10B981] text-[#16181D] text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                        >
                          {isSaving ? "Guardando..." : "Confirmar Respaldo"}
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
        <div className="h-14 px-5 bg-[#16181D] border-t border-[#2E3440] flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-medium text-xs rounded-xl border border-[#2E3440] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
