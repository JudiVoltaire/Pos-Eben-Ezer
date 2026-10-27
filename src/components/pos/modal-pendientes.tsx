"use client";

import React, { useState, useRef } from "react";
import { X, Camera, CheckCircle2, AlertCircle, FileText, Upload } from "lucide-react";

interface MovimientoPendiente {
  id: string;
  fechaHora: string | null;
  tipo: string;
  bolsillo: string;
  monto: number;
  motivo: string;
  notaOpcional?: string | null;
  estadoRendicion: string;
  comprobanteFotoUrl?: string | null;
}

interface ModalPendientesProps {
  isOpen: boolean;
  onClose: () => void;
  pendientes: MovimientoPendiente[];
  onSubirFoto: (movimientoId: string, base64Url: string) => Promise<boolean>;
}

export function ModalPendientes({
  isOpen,
  onClose,
  pendientes,
  onSubirFoto,
}: ModalPendientesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGuardarFoto = async () => {
    if (!selectedId || !previewImage) return;
    setIsUploading(true);
    const ok = await onSubirFoto(selectedId, previewImage);
    setIsUploading(false);
    if (ok) {
      setSelectedId(null);
      setPreviewImage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              Rendiciones de Gastos Sin Papel
            </h3>
            <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
              {pendientes.length} pendientes
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input invisible para captura de cámara */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {pendientes.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                ¡Todas las salidas están respaldadas!
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                No hay compras de insumos pendientes de comprobante o fotografía en este turno.
              </p>
            </div>
          ) : (
            pendientes.map((mov) => {
              const isSelected = selectedId === mov.id;
              return (
                <div
                  key={mov.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400/50"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {mov.motivo}
                        </span>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-500/30">
                          Pendiente Foto
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Bolsillo: <span className="font-semibold text-slate-300">{mov.bolsillo}</span> •{" "}
                        {mov.fechaHora ? new Date(mov.fechaHora).toLocaleTimeString() : ""}
                      </div>
                      {mov.notaOpcional && (
                        <p className="text-xs text-amber-300/80 italic mt-1">
                          "{mov.notaOpcional}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-rose-400">
                        Bs. {mov.monto.toFixed(2)}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedId(mov.id);
                          setPreviewImage(null);
                          fileInputRef.current?.click();
                        }}
                        className="mt-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Tomar Foto</span>
                      </button>
                    </div>
                  </div>

                  {/* Previsualización de la foto capturada */}
                  {isSelected && previewImage && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col items-center">
                      <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-600 mb-2">
                        <img
                          src={previewImage}
                          alt="Recibo"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setPreviewImage(null)}
                          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition"
                        >
                          Repetir Foto
                        </button>
                        <button
                          disabled={isUploading}
                          onClick={handleGuardarFoto}
                          className="flex-2 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isUploading ? "Guardando..." : "Confirmar y Respaldar"}</span>
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
