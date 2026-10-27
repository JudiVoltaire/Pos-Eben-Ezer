"use client";

import React from "react";
import { ArrowDownCircle, Receipt, Camera, LockKeyhole, Store, Banknote, QrCode } from "lucide-react";

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
    <header className="h-16 px-5 bg-[#1C1F26] border-b border-[#2E3440] flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* 1. Identidad de Marca y Cajera */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#21252D] border border-[#2E3440] flex items-center justify-center font-bold text-[#FBBF24]">
          <Store className="w-5 h-5 text-[#FBBF24]" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight leading-none text-[#E5E9F0]">
            POS EBEN EZER
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-1">
            Caja: <span className="text-[#E5E9F0] font-semibold">{cajeraNombre}</span>
          </p>
        </div>
      </div>

      {/* 2. Indicadores Centrales de los "Dos Bolsillos Digitales" */}
      <div className="flex items-center gap-3">
        {/* Bolsillo 1: Caja Física (Efectivo en Cajón) - Verde Salvia */}
        <div className="h-11 px-4 rounded-xl bg-[rgba(16,185,129,0.14)] border border-[rgba(16,185,129,0.35)] flex items-center gap-3 transition-colors">
          <Banknote className="w-5 h-5 text-[#34D399] shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] leading-none">
              CAJA FÍSICA (CAJÓN)
            </span>
            <span className="text-lg font-bold font-mono tabular-nums text-[#34D399] leading-tight mt-0.5">
              Bs. {saldoEfectivo.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bolsillo 2: Caja Digital (QR / Banco) - Azul Acero */}
        <div className="h-11 px-4 rounded-xl bg-[rgba(56,189,248,0.14)] border border-[rgba(56,189,248,0.35)] flex items-center gap-3 transition-colors">
          <QrCode className="w-5 h-5 text-[#38BDF8] shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] leading-none">
              CAJA DIGITAL (QR / BANCO)
            </span>
            <span className="text-lg font-bold font-mono tabular-nums text-[#38BDF8] leading-tight mt-0.5">
              Bs. {saldoQr.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Botones de Acción Derecha */}
      <div className="flex items-center gap-2">
        {/* Botón Salida / Retiro (Terracota Suave) */}
        <button
          onClick={onOpenSalida}
          className="h-10 px-3.5 rounded-lg bg-[rgba(244,63,94,0.14)] border border-[rgba(244,63,94,0.35)] text-sm font-medium text-[#FB7185] hover:bg-[rgba(244,63,94,0.22)] active:scale-[0.98] transition-all duration-75 flex items-center gap-2 cursor-pointer"
        >
          <ArrowDownCircle className="w-4 h-4 text-[#FB7185]" />
          <span>Salida / Retiro</span>
        </button>

        {/* Botón Cinta Testigo */}
        <button
          onClick={onOpenCintaTestigo}
          className="h-10 px-3.5 rounded-lg bg-[#21252D] border border-[#2E3440] text-sm font-medium text-[#E5E9F0] hover:bg-[#2A303C] active:scale-[0.98] transition-all duration-75 flex items-center gap-2 cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-[#94A3B8]" />
          <span>Cinta Testigo</span>
        </button>

        {/* Botón Rendición Foto con Badge */}
        <button
          onClick={onOpenPendientes}
          className={`h-10 px-3.5 rounded-lg border text-sm font-medium active:scale-[0.98] transition-all duration-75 flex items-center gap-2 cursor-pointer ${
            pendientesCount > 0
              ? "bg-[rgba(244,63,94,0.14)] border-[rgba(244,63,94,0.35)] text-[#FB7185] hover:bg-[rgba(244,63,94,0.22)]"
              : "bg-[#21252D] border-[#2E3440] text-[#E5E9F0] hover:bg-[#2A303C]"
          }`}
        >
          <Camera className={`w-4 h-4 ${pendientesCount > 0 ? "text-[#FB7185]" : "text-[#94A3B8]"}`} />
          <span>Rendición Foto</span>
          {pendientesCount > 0 && (
            <span className="h-5 px-1.5 rounded-md bg-[rgba(244,63,94,0.25)] border border-[rgba(244,63,94,0.45)] text-[#FB7185] text-xs font-mono tabular-nums font-bold flex items-center justify-center">
              {pendientesCount}
            </span>
          )}
        </button>

        {/* Botón Cierre Ciego */}
        <button
          onClick={onOpenCierreCiego}
          className="h-10 px-3.5 rounded-lg bg-[#21252D] border border-[#2E3440] text-sm font-medium text-[#E5E9F0] hover:bg-[#2A303C] active:scale-[0.98] transition-all duration-75 flex items-center gap-2 cursor-pointer"
        >
          <LockKeyhole className="w-4 h-4 text-[#94A3B8]" />
          <span>Cierre Ciego</span>
        </button>
      </div>
    </header>
  );
}
