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
        return <Coffee className="w-4 h-4" />;
      case "Cake":
        return <Cake className="w-4 h-4" />;
      case "PlusCircle":
        return <PlusCircle className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const getCategoryColorTheme = (color: string) => {
    switch (color) {
      case "blue":
        return {
          activeTab: "bg-sky-900/60 border-sky-500/40 text-sky-200",
          cardBorder: "border-[#2E3440] hover:border-sky-500/40 bg-[#21252D]",
          badge: "bg-sky-950/60 text-sky-300 border-sky-800/40",
          accentText: "text-sky-300",
        };
      case "yellow":
        return {
          activeTab: "bg-amber-900/60 border-amber-500/40 text-amber-200",
          cardBorder: "border-[#2E3440] hover:border-amber-500/40 bg-[#21252D]",
          badge: "bg-amber-950/60 text-amber-300 border-amber-800/40",
          accentText: "text-amber-300",
        };
      case "green":
        return {
          activeTab: "bg-emerald-900/60 border-emerald-500/40 text-emerald-200",
          cardBorder: "border-[#2E3440] hover:border-emerald-500/40 bg-[#21252D]",
          badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
          accentText: "text-emerald-300",
        };
      default:
        return {
          activeTab: "bg-orange-950/60 border-orange-500/40 text-orange-200",
          cardBorder: "border-[#2E3440] hover:border-orange-500/40 bg-[#21252D]",
          badge: "bg-orange-950/60 text-orange-300 border-orange-800/40",
          accentText: "text-orange-300",
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#16181D] select-none border-r border-[#2E3440]">
      {/* 1. SECCIÓN FIJA SUPERIOR: ⭐ FAVORITOS FLASH (TOP 80/20) */}
      <div className="p-3 bg-[#1C1F26] border-b border-[#2E3440]">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>⭐ TOP VENTAS FLASH (1 TOQUE DIRECTO)</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {favoritos.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProducto(prod)}
              className="bg-[#21252D] hover:bg-[#2A303C] hover:border-amber-500/50 active:scale-95 text-[#E5E9F0] p-2 rounded-xl border border-amber-500/25 flex flex-col justify-between items-start transition cursor-pointer text-left min-h-[68px]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-amber-400/90">
                  {prod.codigoCorto}
                </span>
                <Flame className="w-3 h-3 text-amber-500" />
              </div>
              <div className="font-bold text-xs text-[#E5E9F0] leading-snug line-clamp-1 mt-1">
                {prod.nombre}
              </div>
              <div className="text-xs font-black text-amber-300 tabular-nums mt-0.5">
                Bs. {prod.precioBase.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. PESTAÑAS DE CATEGORÍA POR CÓDIGO DE COLOR SOBRIO */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto border-b border-[#2E3440] bg-[#16181D] no-scrollbar">
        {categorias.map((cat) => {
          const isActiva = cat.id === categoriaActiva;
          const theme = getCategoryColorTheme(cat.colorSemantica);
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                isActiva
                  ? `${theme.activeTab} shadow-sm`
                  : "bg-[#21252D] border-[#2E3440] text-[#94A3B8] hover:text-[#E5E9F0] hover:bg-[#2A303C]"
              }`}
            >
              {getCategoryIcon(cat.icono)}
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GRILLA DE PRODUCTOS DE LA CATEGORÍA */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {productosFiltrados.map((prod) => {
            const cat = categorias.find((c) => c.id === prod.categoriaId);
            const theme = getCategoryColorTheme(cat?.colorSemantica || "orange");
            return (
              <button
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className={`relative p-3 rounded-2xl border ${theme.cardBorder} flex flex-col justify-between items-start transition-all shadow-sm active:scale-96 cursor-pointer text-left min-h-[92px] group`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${theme.badge}`}
                  >
                    {prod.codigoCorto}
                  </span>
                  <span className="text-[#94A3B8] group-hover:scale-110 transition">
                    {getCategoryIcon(cat?.icono || "")}
                  </span>
                </div>

                <div className="font-bold text-xs text-[#E5E9F0] leading-snug line-clamp-2 mt-1.5">
                  {prod.nombre}
                </div>

                <div className="w-full flex items-center justify-between mt-2 pt-1.5 border-t border-[#2E3440]">
                  <span className="text-sm font-black text-amber-300 tabular-nums">
                    Bs. {prod.precioBase.toFixed(2)}
                  </span>
                  <div className="w-5 h-5 rounded-md bg-[#2A303C] group-hover:bg-amber-500 group-hover:text-slate-950 text-[#E5E9F0] flex items-center justify-center transition">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FRANJA INFERIOR FIJA DE TOPPINGS Y EXTRAS */}
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
