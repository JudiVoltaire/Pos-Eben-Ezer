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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-[#1C1F26] border border-[#2E3440] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-4 bg-[#16181D] border-b border-[#2E3440] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-black text-[#E5E9F0] uppercase tracking-wider">
              Rendiciones Fotográficas (Cero Papel)
            </h3>
            <span className="bg-rose-950/60 text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-500/30 tabular-nums">
              {pendientes.length} pendientes
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E5E9F0] p-1 rounded-lg transition cursor-pointer"
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
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/80 mb-2" />
              <p className="text-xs font-bold text-[#E5E9F0]">
                ¡Cero gastos pendientes!
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Todas las compras de insumos del turno ya tienen comprobante fotográfico.
              </p>
            </div>
          ) : (
            pendientes.map((mov) => {
              const isSelected = selectedId === mov.id;
              return (
                <div
                  key={mov.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-[#21252D] border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                      : "bg-[#16181D]/80 border-[#2E3440] hover:border-[#3E4556]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-[#E5E9F0]">
                        {mov.motivo}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 tabular-nums">
                        Bolsillo: <span className="font-semibold text-slate-300">{mov.bolsillo}</span> •{" "}
                        {mov.fechaHora ? new Date(mov.fechaHora).toLocaleTimeString() : ""}
                      </div>
                      {mov.notaOpcional && (
                        <p className="text-[11px] text-amber-300/80 italic mt-0.5">
                          "{mov.notaOpcional}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-rose-300 tabular-nums">
                        Bs. {mov.monto.toFixed(2)}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedId(mov.id);
                          setPreview(null);
                          fileInputRef.current?.click();
                        }}
                        className="mt-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Foto</span>
                      </button>
                    </div>
                  </div>

                  {/* Previsualización */}
                  {isSelected && preview && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#2E3440] flex flex-col items-center">
                      <div className="w-full max-h-44 rounded-xl overflow-hidden border border-[#2E3440] mb-2 bg-black">
                        <img
                          src={preview}
                          alt="Recibo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setPreview(null)}
                          className="flex-1 py-1.5 bg-[#21252D] text-[#E5E9F0] text-xs font-bold rounded-lg"
                        >
                          Repetir
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={handleConfirmar}
                          className="flex-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-lg transition"
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
        <div className="p-3 bg-[#16181D] border-t border-[#2E3440] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-[#21252D] hover:bg-[#2A303C] text-[#E5E9F0] font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
