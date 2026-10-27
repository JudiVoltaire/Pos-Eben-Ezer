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
    <div className="p-3 bg-[#1C1F26] border-t border-[#2E3440] flex flex-col gap-2 select-none">
      {/* Indicador contextual del ítem activo */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-[#E5E9F0] tracking-wide">
            ADICIONALES Y EXTRAS
          </span>
          {hasItemSelected && selectedItemNombre && (
            <span className="text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[11px]">
              Aplicando a: {selectedItemNombre}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#94A3B8]">
          Regla: Suma hacia arriba inmutable
        </span>
      </div>

      {/* Fila 1: Toppings Fijos de 1 Toque */}
      <div className="flex flex-wrap gap-1.5">
        {toppingsFijos.map((top) => (
          <button
            key={top.id}
            disabled={!hasItemSelected}
            onClick={() => onAddToppingFijo(top)}
            className="bg-emerald-950/40 hover:bg-emerald-900/60 disabled:opacity-40 border border-emerald-500/30 text-emerald-300 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>+ {top.nombre}</span>
            <span className="font-black tabular-nums text-emerald-400">
              Bs. {top.precio.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Fila 2: Comodín de Cocina ("Extra Impredecible Fuera de Carta") */}
      <div className="pt-1.5 border-t border-[#2E3440] flex flex-wrap items-center gap-2">
        <div className="text-[11px] font-bold text-amber-400/90 flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comodín Cocina:</span>
        </div>

        {/* Botones de suma rápida de un toque */}
        <div className="flex items-center gap-1.5">
          {[2, 5, 10].map((monto) => (
            <button
              key={monto}
              disabled={!hasItemSelected}
              onClick={() => handleSumar(monto)}
              className="bg-[#21252D] hover:bg-amber-500 hover:text-slate-950 disabled:opacity-40 border border-[#2E3440] text-amber-300 active:scale-95 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer disabled:cursor-not-allowed tabular-nums"
            >
              +Bs. {monto}
            </button>
          ))}
        </div>

        {/* Campo de nota corta opcional y monto manual */}
        <div className="flex-1 flex items-center gap-1.5 min-w-[210px]">
          <input
            type="text"
            placeholder="Nota: ej. Extra Palta / Ahogado..."
            value={notaLibre}
            onChange={(e) => setNotaLibre(e.target.value)}
            disabled={!hasItemSelected}
            className="bg-[#16181D] border border-[#2E3440] text-[#E5E9F0] placeholder-[#94A3B8]/60 text-xs rounded-lg px-2.5 py-1 flex-1 focus:outline-none focus:border-amber-400 disabled:opacity-40"
          />
          <input
            type="number"
            placeholder="Bs."
            value={montoCustom}
            onChange={(e) => setMontoCustom(e.target.value)}
            disabled={!hasItemSelected}
            className="w-16 bg-[#16181D] border border-[#2E3440] text-amber-300 text-xs rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:border-amber-400 disabled:opacity-40 tabular-nums"
          />
          <button
            disabled={!hasItemSelected || !montoCustom}
            onClick={() => handleSumar(parseFloat(montoCustom) || 0)}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sumar
          </button>
        </div>
      </div>
    </div>
  );
}
