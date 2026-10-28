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
    <div
      className={`bg-[#161920] border-t border-[#262B36] p-3 space-y-2 select-none shrink-0 transition-opacity duration-75 ${
        !hasItemSelected ? "opacity-40 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Indicador contextual de ítem activo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7D8597]">
            {selectedItemNombre ? (
              <>
                AGREGANDO EXTRA A:{" "}
                <span className="text-[#34D399] normal-case font-bold">{selectedItemNombre}</span>
              </>
            ) : (
              "SELECCIONA UN PRODUCTO PARA AÑADIR EXTRAS"
            )}
          </span>
        </div>
        <span className="text-[10px] text-[#7D8597] font-mono font-medium">
          SOLO SUMAS AL PLATO
        </span>
      </div>

      {/* Fila 1: Toppings Fijos */}
      <div className="flex flex-wrap gap-1.5">
        {toppingsFijos.map((top) => (
          <button
            key={top.id}
            onClick={() => onAddToppingFijo(top)}
            className="h-8 px-2.5 rounded-md bg-[#1E222B] border border-[#2D3340] text-xs font-medium text-[#E5E9F0] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-[#10B981]/50 hover:bg-[#252A35] active:translate-y-[1px] transition-all duration-75 flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ {top.nombre}</span>
            <span className="font-mono text-[11px] font-semibold text-[#34D399] tabular-nums">
              +Bs. {top.precio.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Fila 2: Comodín de Cocina (Segmented Control Group) */}
      <div className="pt-1.5 border-t border-[#262B36] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={1.75} />
          <span>EXTRA LIBRE (COCINA):</span>
        </div>

        {/* Grupo de sumas rápidas */}
        <div className="flex items-center gap-1 bg-[#12151A] p-0.5 rounded-md border border-[#262B36]">
          {[2, 5, 10].map((monto) => (
            <button
              key={monto}
              onClick={() => handleSumar(monto)}
              className="h-7 px-2.5 rounded text-xs font-mono font-semibold text-[#E5E9F0] hover:bg-[#252A35] hover:text-[#F59E0B] active:translate-y-[1px] transition-all duration-75 cursor-pointer tabular-nums"
            >
              +Bs. {monto}
            </button>
          ))}
        </div>

        {/* Campo de nota corta opcional y monto personalizado */}
        <div className="flex-1 flex items-center gap-1.5 min-w-[220px]">
          <input
            type="text"
            placeholder="Nota rápida: ej. Extra presa, salsa..."
            value={notaLibre}
            onChange={(e) => setNotaLibre(e.target.value)}
            className="h-8 bg-[#12151A] border border-[#2D3340] rounded-md px-2.5 text-xs text-[#E5E9F0] placeholder-[#646E82] flex-1 focus:outline-none focus:border-[#3B4252] transition-colors"
          />
          <input
            type="number"
            placeholder="Bs."
            value={montoCustom}
            onChange={(e) => setMontoCustom(e.target.value)}
            className="h-8 w-16 bg-[#12151A] border border-[#2D3340] text-[#F59E0B] font-mono tabular-nums text-xs font-semibold rounded-md px-2 text-center focus:outline-none focus:border-[#3B4252] transition-colors"
          />
          <button
            disabled={!montoCustom}
            onClick={() => handleSumar(parseFloat(montoCustom) || 0)}
            className="h-8 px-3 rounded-md bg-[#1E222B] border border-[#2D3340] hover:border-[#F59E0B]/60 text-xs font-semibold text-[#F59E0B] hover:bg-[#252A35] active:translate-y-[1px] transition-all duration-75 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Sumar
          </button>
        </div>
      </div>
    </div>
  );
}
