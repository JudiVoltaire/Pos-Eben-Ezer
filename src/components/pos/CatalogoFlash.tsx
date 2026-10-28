"use client";

import React, { useState } from "react";
import { Utensils, Coffee, Cake, PlusCircle, Zap } from "lucide-react";
import { BarraExtras } from "./BarraExtras";

interface Producto {
  id: string;
  categoriaId: string;
  codigoCorto: string;
  nombre: string;
  precioBase: number;
  esFavoritoFlash: boolean;
  activo: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  colorSemantica: string;
  icono: string;
  orden: number;
}

interface ToppingFijo {
  id: string;
  nombre: string;
  precio: number;
  activo: boolean;
}

interface CatalogoFlashProps {
  categorias: Categoria[];
  productos: Producto[];
  toppingsFijos: ToppingFijo[];
  hasItemSelected: boolean;
  selectedItemNombre?: string;
  onSelectProducto: (prod: Producto) => void;
  onAddToppingFijo: (top: ToppingFijo) => void;
  onAddExtraLibre: (monto: number, nota?: string) => void;
}

export function CatalogoFlash({
  categorias,
  productos,
  toppingsFijos,
  hasItemSelected,
  selectedItemNombre,
  onSelectProducto,
  onAddToppingFijo,
  onAddExtraLibre,
}: CatalogoFlashProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string>(categorias[0]?.id || "");

  const favoritos = productos.filter((p) => p.esFavoritoFlash);
  const productosFiltrados = productos.filter((p) => p.categoriaId === categoriaActiva);

  const getCategoryIcon = (icono: string) => {
    switch (icono) {
      case "Coffee":
        return <Coffee className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />;
      case "Cake":
        return <Cake className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />;
      case "PlusCircle":
        return <PlusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />;
      default:
        return <Utensils className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />;
    }
  };

  const getCategoryBorderColor = (color: string) => {
    switch (color) {
      case "blue":
        return "border-l-[#0284C7]";
      case "yellow":
        return "border-l-[#D97706]";
      case "green":
        return "border-l-[#10B981]";
      default:
        return "border-l-[#EA580C]";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#14171D] select-none border-r border-[#262B36]">
      {/* 1. SECCIÓN SUPERIOR: PLATOS MÁS VENDIDOS */}
      <div className="p-3 bg-[#161920] border-b border-[#262B36] shrink-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7D8597]">
            MÁS VENDIDOS (ACCESO DIRECTO)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {favoritos.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProducto(prod)}
              className="h-[84px] p-2.5 rounded-lg bg-[#1E222B] border border-[#2D3340] border-l-[3px] border-l-[#F59E0B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] hover:bg-[#252A35] hover:border-[#3B4252] hover:border-l-[#F59E0B] active:translate-y-[1px] active:bg-[#191C24] transition-all duration-75 flex flex-col justify-between items-start text-left cursor-pointer"
            >
              <div className="flex items-start justify-between w-full gap-1">
                <span className="text-[13px] font-medium text-[#E5E9F0] leading-snug line-clamp-2">
                  {prod.nombre}
                </span>
                <span className="text-[10px] font-mono text-[#646E82] shrink-0">
                  {prod.codigoCorto}
                </span>
              </div>
              <div className="w-full text-right text-sm font-bold font-mono tabular-nums text-[#E5E9F0]">
                <span className="text-[11px] font-normal text-[#8A94A6] mr-1">Bs.</span>
                {prod.precioBase.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. PESTAÑAS DE CATEGORÍAS */}
      <div className="px-3.5 py-2 flex items-center gap-2 overflow-x-auto border-b border-[#262B36] bg-[#14171D] no-scrollbar shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7D8597] mr-1 shrink-0">
          MENÚ:
        </span>
        {categorias.map((cat) => {
          const isActiva = cat.id === categoriaActiva;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all duration-75 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActiva
                  ? "bg-[#252A35] border-[#3B4252] text-[#E5E9F0] shadow-sm font-semibold"
                  : "bg-[#1E222B] border-[#2D3340] text-[#7D8597] hover:text-[#E5E9F0] hover:bg-[#252A35] hover:border-[#3B4252]"
              }`}
            >
              {getCategoryIcon(cat.icono)}
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GRILLA GENERAL DE PRODUCTOS */}
      <div className="flex-1 p-3.5 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {productosFiltrados.map((prod) => {
            const cat = categorias.find((c) => c.id === prod.categoriaId);
            const borderAccent = getCategoryBorderColor(cat?.colorSemantica || "orange");
            return (
              <button
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className={`h-[84px] p-2.5 rounded-lg bg-[#1E222B] border border-[#2D3340] border-l-[3px] ${borderAccent} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.25)] hover:bg-[#252A35] hover:border-[#3B4252] active:translate-y-[1px] active:bg-[#191C24] transition-all duration-75 flex flex-col justify-between items-start text-left cursor-pointer`}
              >
                <div className="flex items-start justify-between w-full gap-1">
                  <span className="text-[13px] font-medium text-[#E5E9F0] leading-snug line-clamp-2">
                    {prod.nombre}
                  </span>
                  <span className="text-[10px] font-mono text-[#646E82] shrink-0">
                    {prod.codigoCorto}
                  </span>
                </div>

                <div className="w-full flex items-center justify-between pt-1 border-t border-[#262B36]">
                  <span className="text-[10px] text-[#646E82] uppercase tracking-wider">
                    {cat?.nombre || "Plato"}
                  </span>
                  <div className="text-sm font-bold font-mono tabular-nums text-[#E5E9F0]">
                    <span className="text-[11px] font-normal text-[#8A94A6] mr-1">Bs.</span>
                    {prod.precioBase.toFixed(2)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BANDEJA DE ADICIONALES DE PRECISIÓN */}
      <BarraExtras
        toppingsFijos={toppingsFijos}
        hasItemSelected={hasItemSelected}
        selectedItemNombre={selectedItemNombre}
        onAddToppingFijo={onAddToppingFijo}
        onAddExtraLibre={onAddExtraLibre}
      />
    </div>
  );
}
