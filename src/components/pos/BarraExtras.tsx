"use client";

import React, { useState } from "react";
import { PlusCircle, Sparkles } from "lucide-react";

interface ToppingFijo {
  id: string;
  nombre: string;
  precio: number;
  activo: boolean;
}

interface BarraExtrasProps {
  toppingsFijos: ToppingFijo[];
  hasItemSelected: boolean;
  selectedItemNombre?: string;
  onAddToppingFijo: (top: ToppingFijo) => void;
  onAddExtraLibre: (monto: number, nota?: string) => void;
}

export function BarraExtras({
  toppingsFijos,
  hasItemSelected,
  selectedItemNombre,
  onAddToppingFijo,
  onAddExtraLibre,
}: BarraExtrasProps) {
  const [notaLibre, setNotaLibre] = useState("");
  const [montoCustom, setMontoCustom] = useState("");

  const handleSumar = (monto: number) => {
    if (monto <= 0) return;
    const notaFinal = notaLibre.trim() || "Extra de Cocina";
    onAddExtraLibre(monto, notaFinal);
    setNotaLibre("");
    setMontoCustom("");
  };

  return (
    <div className="bg-[#1C1F26] border-t border-[#2E3440] p-3 space-y-2.5 select-none shrink-0">
      {/* Indicador contextual de ítem activo */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-[#34D399]" />
          <span className="font-bold text-[#E5E9F0] tracking-wide">
            ADICIONALES Y EXTRAS
          </span>
          {hasItemSelected && selectedItemNombre && (
            <span className="text-[#34D399] font-medium bg-[rgba(16,185,129,0.14)] px-2 py-0.5 rounded-md border border-[rgba(16,185,129,0.3)] text-[11px]">
              Aplicando a: {selectedItemNombre}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#94A3B8]">
          Regla: Suma hacia arriba inmutable
        </span>
      </div>

      {/* Fila 1: Toppings Fijos de 1 Toque */}
      <div className="flex flex-wrap gap-2">
        {toppingsFijos.map((top) => (
          <button
            key={top.id}
            disabled={!hasItemSelected}
            onClick={() => onAddToppingFijo(top)}
            className="h-10 px-3.5 rounded-lg bg-[#21252D] border border-[#2E3440] text-sm text-[#E5E9F0] hover:border-[#34D399]/50 hover:bg-[#2A303C] active:scale-[0.97] transition-all duration-75 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>+ {top.nombre}</span>
            <span className="font-bold font-mono tabular-nums text-[#34D399]">
              Bs. {top.precio.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Fila 2: Comodín de Cocina (Extra Libre Impredecible) */}
      <div className="pt-2 border-t border-[#2E3440] flex flex-wrap items-center gap-2">
        <div className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5 uppercase tracking-wider shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comodín Cocina:</span>
        </div>

        {/* Botones sumatorios rápidos de un toque */}
        <div className="flex items-center gap-1.5">
          {[2, 5, 10].map((monto) => (
            <button
              key={monto}
              disabled={!hasItemSelected}
              onClick={() => handleSumar(monto)}
              className="h-10 px-3 rounded-lg bg-[#21252D] border border-[#2E3440] hover:border-[#FBBF24]/50 hover:bg-[#2A303C] active:scale-[0.97] text-sm font-bold font-mono tabular-nums text-[#FBBF24] transition-all duration-75 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +Bs. {monto}
            </button>
          ))}
        </div>

        {/* Campo de nota corta opcional y monto personalizado */}
        <div className="flex-1 flex items-center gap-2 min-w-[240px]">
          <input
            type="text"
            placeholder="Nota opcional: ej. Extra Palta / Ahogado..."
            value={notaLibre}
            onChange={(e) => setNotaLibre(e.target.value)}
            disabled={!hasItemSelected}
            className="bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] placeholder-[#94A3B8] text-sm rounded-lg px-3 h-10 flex-1 focus:outline-none focus:border-[#FBBF24]/60 transition-colors disabled:opacity-40"
          />
          <input
            type="number"
            placeholder="Bs."
            value={montoCustom}
            onChange={(e) => setMontoCustom(e.target.value)}
            disabled={!hasItemSelected}
            className="w-20 bg-[#16181D] border border-[#2E3440] text-[#FBBF24] font-mono tabular-nums font-bold text-sm rounded-lg px-2.5 h-10 text-center focus:outline-none focus:border-[#FBBF24]/60 transition-colors disabled:opacity-40"
          />
          <button
            disabled={!hasItemSelected || !montoCustom}
            onClick={() => handleSumar(parseFloat(montoCustom) || 0)}
            className="h-10 px-4 rounded-lg bg-[#21252D] border border-[#2E3440] hover:border-[#FBBF24] text-sm font-bold text-[#FBBF24] hover:bg-[#2A303C] active:scale-[0.97] transition-all duration-75 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sumar
          </button>
        </div>
      </div>
    </div>
  );
}
