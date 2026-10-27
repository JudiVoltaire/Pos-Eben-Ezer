"use client";

import React, { useState } from "react";
import { Utensils, Coffee, Cake, PlusCircle, Star, Plus, Flame } from "lucide-react";
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
        return <Coffee className="w-4 h-4 shrink-0" />;
      case "Cake":
        return <Cake className="w-4 h-4 shrink-0" />;
      case "PlusCircle":
        return <PlusCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Utensils className="w-4 h-4 shrink-0" />;
    }
  };

  const getCategoryAccent = (color: string) => {
    switch (color) {
      case "blue":
        return {
          activeBorder: "border-b-[#38BDF8] text-[#38BDF8]",
          badgeBg: "bg-[rgba(56,189,248,0.14)] text-[#38BDF8] border-[rgba(56,189,248,0.3)]",
        };
      case "yellow":
        return {
          activeBorder: "border-b-[#FBBF24] text-[#FBBF24]",
          badgeBg: "bg-[rgba(245,158,11,0.14)] text-[#FBBF24] border-[rgba(245,158,11,0.3)]",
        };
      case "green":
        return {
          activeBorder: "border-b-[#34D399] text-[#34D399]",
          badgeBg: "bg-[rgba(16,185,129,0.14)] text-[#34D399] border-[rgba(16,185,129,0.3)]",
        };
      default:
        return {
          activeBorder: "border-b-[#FB7185] text-[#FB7185]",
          badgeBg: "bg-[rgba(244,63,94,0.14)] text-[#FB7185] border-[rgba(244,63,94,0.3)]",
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#16181D] select-none border-r border-[#2E3440]">
      {/* 1. SECCIÓN SUPERIOR: ⭐ TOP VENTAS FLASH */}
      <div className="p-3 bg-[#1C1F26] border-b border-[#2E3440] shrink-0">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
          <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
          <span>⭐ TOP VENTAS FLASH (1 TOQUE DIRECTO)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {favoritos.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProducto(prod)}
              className="min-h-[80px] p-3 rounded-xl bg-[#21252D] border border-[rgba(245,158,11,0.35)] hover:border-[#FBBF24] active:scale-[0.98] transition-all duration-75 flex flex-col justify-between items-start cursor-pointer text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-medium text-[#94A3B8]">
                  {prod.codigoCorto}
                </span>
                <Flame className="w-3.5 h-3.5 text-[#FBBF24] opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-semibold text-base text-[#E5E9F0] leading-tight line-clamp-1 my-1">
                {prod.nombre}
              </div>
              <div className="w-full text-right text-lg font-bold font-mono tabular-nums text-[#FBBF24]">
                Bs. {prod.precioBase.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. PESTAÑAS DE CATEGORÍAS */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-[#2E3440] bg-[#16181D] no-scrollbar shrink-0">
        {categorias.map((cat) => {
          const isActiva = cat.id === categoriaActiva;
          const accent = getCategoryAccent(cat.colorSemantica);
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`min-h-[46px] px-5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-all duration-75 whitespace-nowrap cursor-pointer border ${
                isActiva
                  ? `bg-[#21252D] border-[#2E3440] border-b-2 ${accent.activeBorder} shadow-sm`
                  : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
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
            const accent = getCategoryAccent(cat?.colorSemantica || "orange");
            return (
              <button
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className="min-h-[82px] p-3 rounded-xl bg-[#21252D] border border-[#2E3440] hover:bg-[#2A303C] hover:border-[#3B4252] active:scale-[0.98] transition-all duration-75 flex flex-col justify-between items-start cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded border ${accent.badgeBg}`}>
                    {prod.codigoCorto}
                  </span>
                  <span className="text-[#94A3B8] group-hover:text-[#E5E9F0] transition-colors">
                    {getCategoryIcon(cat?.icono || "")}
                  </span>
                </div>

                <div className="font-semibold text-sm text-[#E5E9F0] leading-snug line-clamp-2 my-1.5">
                  {prod.nombre}
                </div>

                <div className="w-full flex items-center justify-between pt-1.5 border-t border-[#2E3440]/80">
                  <span className="text-base font-bold font-mono tabular-nums text-[#E5E9F0]">
                    Bs. {prod.precioBase.toFixed(2)}
                  </span>
                  <div className="w-5 h-5 rounded bg-[#2A303C] group-hover:bg-[#34D399] group-hover:text-[#16181D] text-[#94A3B8] flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FRANJA INFERIOR ANCLADA DE TOPPINGS Y COMODÍN */}
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
