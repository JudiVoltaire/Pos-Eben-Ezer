"use client";

import React from "react";
import { ArrowDownCircle, Receipt, Camera, LockKeyhole, Store } from "lucide-react";

interface TopBarProps {
  saldoEfectivo: number;
  saldoQr: number;
  pendientesCount: number;
  cajeraNombre: string;
  onOpenSalida: () => void;
  onOpenCintaTestigo: () => void;
  onOpenPendientes: () => void;
  onOpenCierreCiego: () => void;
}

export function TopBar({
  saldoEfectivo,
  saldoQr,
  pendientesCount,
  cajeraNombre,
  onOpenSalida,
  onOpenCintaTestigo,
  onOpenPendientes,
  onOpenCierreCiego,
}: TopBarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none">
      {/* Identidad de Marca y Cajera */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-xl text-slate-950">
          <Store className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight leading-none text-amber-400">
            POS EBEN EZER
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Caja: <span className="text-slate-200 font-semibold">{cajeraNombre}</span>
          </p>
        </div>
      </div>

      {/* Los Dos Bolsillos Digitales */}
      <div className="flex items-center gap-3">
        {/* Bolsillo 1: Caja Física (Efectivo) */}
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-sm">
          <span className="text-2xl">💵</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 leading-none">
              Caja Física (Cajón)
            </div>
            <div className="text-xl font-black text-emerald-300 tracking-tight leading-tight">
              Bs. {saldoEfectivo.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bolsillo 2: Caja Digital (QR / Banco) */}
        <div className="bg-blue-950/80 border border-blue-500/40 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-sm">
          <span className="text-2xl">📱</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400 leading-none">
              Caja Digital (QR / Banco)
            </div>
            <div className="text-xl font-black text-blue-300 tracking-tight leading-tight">
              Bs. {saldoQr.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas de Barra Superior */}
      <div className="flex items-center gap-2">
        {/* Salida / Retiro de Dinero */}
        <button
          onClick={onOpenSalida}
          className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Retiro / Gasto</span>
        </button>

        {/* Cinta Testigo / Historial */}
        <button
          onClick={onOpenCintaTestigo}
          className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-slate-400" />
          <span>Cinta Testigo</span>
        </button>

        {/* Pendientes de Rendición (Badge con contador) */}
        <button
          onClick={onOpenPendientes}
          className={`relative font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border cursor-pointer ${
            pendientesCount > 0
              ? "bg-rose-950/80 hover:bg-rose-900 border-rose-500/50 text-rose-200 animate-pulse"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
          }`}
        >
          <Camera className="w-4 h-4 text-rose-400" />
          <span>Rendiciones</span>
          {pendientesCount > 0 && (
            <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {pendientesCount}
            </span>
          )}
        </button>

        {/* Cierre de Caja Ciego */}
        <button
          onClick={onOpenCierreCiego}
          className="bg-purple-900/60 hover:bg-purple-800 active:scale-95 text-purple-200 border border-purple-500/40 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <LockKeyhole className="w-4 h-4 text-purple-400" />
          <span>Cierre Ciego</span>
        </button>
      </div>
    </header>
  );
}
