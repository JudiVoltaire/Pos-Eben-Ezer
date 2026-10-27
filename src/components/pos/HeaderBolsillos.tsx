"use client";

import React from "react";
import { ArrowDownCircle, Receipt, Camera, LockKeyhole, Store } from "lucide-react";

interface HeaderBolsillosProps {
  saldoEfectivo: number;
  saldoQr: number;
  pendientesCount: number;
  cajeraNombre: string;
  onOpenSalida: () => void;
  onOpenCintaTestigo: () => void;
  onOpenPendientes: () => void;
  onOpenCierreCiego: () => void;
}

export function HeaderBolsillos({
  saldoEfectivo,
  saldoQr,
  pendientesCount,
  cajeraNombre,
  onOpenSalida,
  onOpenCintaTestigo,
  onOpenPendientes,
  onOpenCierreCiego,
}: HeaderBolsillosProps) {
  return (
    <header className="bg-[#1C1F26] border-b border-[#2E3440] text-[#E5E9F0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none">
      {/* Identidad de Marca y Cajera */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400">
          <Store className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight leading-none text-amber-400/90">
            POS EBEN EZER
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Caja: <span className="text-[#E5E9F0] font-semibold">{cajeraNombre}</span>
          </p>
        </div>
      </div>

      {/* Los Dos Bolsillos Digitales con Paleta Anti-Fatiga */}
      <div className="flex items-center gap-3">
        {/* Bolsillo 1: Caja Física (Efectivo en Cajón) */}
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl px-4 py-1.5 flex items-center gap-2.5 shadow-sm">
          <span className="text-xl">💵</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/90 leading-none">
              Caja Física (En Cajón)
            </div>
            <div className="text-lg font-black text-emerald-300 tracking-tight tabular-nums leading-tight mt-0.5">
              Bs. {saldoEfectivo.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bolsillo 2: Caja Digital (QR / Banco) */}
        <div className="bg-sky-950/50 border border-sky-500/30 rounded-xl px-4 py-1.5 flex items-center gap-2.5 shadow-sm">
          <span className="text-xl">📱</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400/90 leading-none">
              Caja Digital (QR / Banco)
            </div>
            <div className="text-lg font-black text-sky-300 tracking-tight tabular-nums leading-tight mt-0.5">
              Bs. {saldoQr.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción Rápida */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSalida}
          className="bg-amber-600/80 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <ArrowDownCircle className="w-4 h-4 text-slate-950" />
          <span>Retiro / Gasto</span>
        </button>

        <button
          onClick={onOpenCintaTestigo}
          className="bg-[#21252D] hover:bg-[#2E3440] active:scale-95 text-[#E5E9F0] border border-[#2E3440] font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-[#94A3B8]" />
          <span>Cinta Testigo</span>
        </button>

        <button
          onClick={onOpenPendientes}
          className={`relative font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border cursor-pointer ${
            pendientesCount > 0
              ? "bg-rose-950/60 hover:bg-rose-900 border-rose-500/40 text-rose-200 animate-pulse"
              : "bg-[#21252D] hover:bg-[#2E3440] border-[#2E3440] text-[#94A3B8]"
          }`}
        >
          <Camera className="w-4 h-4 text-rose-400" />
          <span>Rendición Foto</span>
          {pendientesCount > 0 && (
            <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full ml-1 tabular-nums">
              {pendientesCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenCierreCiego}
          className="bg-purple-950/60 hover:bg-purple-900 active:scale-95 text-purple-200 border border-purple-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <LockKeyhole className="w-4 h-4 text-purple-400" />
          <span>Cierre Ciego</span>
        </button>
      </div>
    </header>
  );
}
