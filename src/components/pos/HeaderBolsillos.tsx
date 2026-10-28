"use client";

import React from "react";
import { ArrowUpRight, Receipt, Camera, Lock } from "lucide-react";

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
    <header className="h-14 px-4 bg-[#14171D] border-b border-[#262B36] flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* 1. Identidad Izquierda */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] shrink-0" />
        <span className="text-sm font-semibold tracking-tight text-[#E5E9F0]">
          POS Eben Ezer
        </span>
        <div className="h-4 w-[1px] bg-[#262B36]" />
        <span className="text-xs text-[#7D8597] font-medium">
          Cajera: <span className="text-[#C5CBD6] font-semibold">{cajeraNombre}</span>
        </span>
      </div>

      {/* 2. Módulos Centrales de Tesorería (Dos Bolsillos Claros) */}
      <div className="bg-[#1A1D24] border border-[#262B36] rounded-lg px-3.5 py-1.5 flex items-center gap-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
        {/* Celda 1: Efectivo en Cajón */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8597]">
            EFECTIVO EN CAJÓN
          </span>
          <div className="text-sm font-bold font-mono tabular-nums text-[#E5E9F0] ml-1">
            <span className="text-xs font-normal text-[#34D399] mr-1">Bs.</span>
            {saldoEfectivo.toFixed(2)}
          </div>
        </div>

        {/* Separador vertical */}
        <div className="h-5 w-[1px] bg-[#262B36]" />

        {/* Celda 2: Dinero en QR / Banco */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8597]">
            BANCO / QR
          </span>
          <div className="text-sm font-bold font-mono tabular-nums text-[#E5E9F0] ml-1">
            <span className="text-xs font-normal text-[#38BDF8] mr-1">Bs.</span>
            {saldoQr.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 3. Barra de Herramientas Derecha */}
      <div className="flex items-center gap-2">
        {/* Botón Salida de Dinero */}
        <button
          onClick={onOpenSalida}
          className="h-9 px-3 rounded-lg bg-[#1E222B] border border-[#2D3340] text-xs font-medium text-[#C5CBD6] hover:text-[#E5E9F0] hover:border-[#3B4252] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-[#FB7185]" strokeWidth={1.75} />
          <span>Salida de Dinero</span>
        </button>

        {/* Botón Historial de Caja */}
        <button
          onClick={onOpenCintaTestigo}
          className="h-9 px-3 rounded-lg bg-[#1E222B] border border-[#2D3340] text-xs font-medium text-[#C5CBD6] hover:text-[#E5E9F0] hover:border-[#3B4252] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-[#7D8597]" strokeWidth={1.75} />
          <span>Historial de Caja</span>
        </button>

        {/* Botón Fotos de Recibos */}
        <button
          onClick={onOpenPendientes}
          className="h-9 px-3 rounded-lg bg-[#1E222B] border border-[#2D3340] text-xs font-medium text-[#C5CBD6] hover:text-[#E5E9F0] hover:border-[#3B4252] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Camera className={`w-4 h-4 ${pendientesCount > 0 ? "text-[#FB7185]" : "text-[#7D8597]"}`} strokeWidth={1.75} />
          <span>Fotos Recibos</span>
          {pendientesCount > 0 && (
            <span className="h-4 px-1.5 rounded-full bg-[rgba(244,63,94,0.18)] border border-[rgba(244,63,94,0.35)] text-[#FB7185] text-[10px] font-mono tabular-nums font-semibold flex items-center justify-center">
              {pendientesCount}
            </span>
          )}
        </button>

        {/* Botón Cierre de Turno */}
        <button
          onClick={onOpenCierreCiego}
          className="h-9 px-3 rounded-lg bg-[#1E222B] border border-[#2D3340] text-xs font-medium text-[#C5CBD6] hover:text-[#E5E9F0] hover:border-[#3B4252] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4 text-[#7D8597]" strokeWidth={1.75} />
          <span>Cierre de Turno</span>
        </button>
      </div>
    </header>
  );
}
