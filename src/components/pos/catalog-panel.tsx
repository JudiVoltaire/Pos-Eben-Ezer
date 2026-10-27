"use client";

import React, { useState } from "react";
import {
  Utensils,
  Coffee,
  Cake,
  PlusCircle,
  Star,
  Plus,
  Flame,
} from "lucide-react";

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

interface CatalogPanelProps {
  categorias: Categoria[];
  productos: Producto[];
  toppingsFijos: ToppingFijo[];
  hasItemSelected: boolean;
  selectedItemNombre?: string;
  onSelectProducto: (prod: Producto) => void;
  onAddToppingFijo: (top: ToppingFijo) => void;
  onAddExtraLibre: (monto: number, nota?: string) => void;
}

export function CatalogPanel({
  categorias,
  productos,
  toppingsFijos,
  hasItemSelected,
  selectedItemNombre,
  onSelectProducto,
  onAddToppingFijo,
  onAddExtraLibre,
}: CatalogPanelProps) {
  // Categoría activa (por defecto la primera o todas)
  const [categoriaActiva, setCategoriaActiva] = useState<string>(
    categorias[0]?.id || ""
  );

  // Estado para el extra libre comodín
  const [notaExtraLibre, setNotaExtraLibre] = useState("");
  const [montoPersonalizado, setMontoPersonalizado] = useState("");

  const favoritos = productos.filter((p) => p.esFavoritoFlash);
  const productosFiltrados = productos.filter(
    (p) => p.categoriaId === categoriaActiva
  );

  const getCategoryIcon = (icono: string) => {
    switch (icono) {
      case "Coffee":
        return <Coffee className="w-5 h-5" />;
      case "Cake":
        return <Cake className="w-5 h-5" />;
      case "PlusCircle":
        return <PlusCircle className="w-5 h-5" />;
      default:
        return <Utensils className="w-5 h-5" />;
    }
  };

  const getCategoryTheme = (color: string) => {
    switch (color) {
      case "blue":
        return {
          activeTab: "bg-blue-600 text-white shadow-blue-500/20",
          cardBorder: "border-blue-500/30 hover:border-blue-400 bg-slate-800/90 hover:bg-slate-800",
          badge: "bg-blue-900/60 text-blue-300 border-blue-700/50",
          iconColor: "text-blue-400",
        };
      case "yellow":
        return {
          activeTab: "bg-amber-500 text-slate-950 font-black shadow-amber-500/20",
          cardBorder: "border-amber-500/30 hover:border-amber-400 bg-slate-800/90 hover:bg-slate-800",
          badge: "bg-amber-900/60 text-amber-300 border-amber-700/50",
          iconColor: "text-amber-400",
        };
      case "green":
        return {
          activeTab: "bg-emerald-600 text-white shadow-emerald-500/20",
          cardBorder: "border-emerald-500/30 hover:border-emerald-400 bg-slate-800/90 hover:bg-slate-800",
          badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
          iconColor: "text-emerald-400",
        };
      default: // orange / red
        return {
          activeTab: "bg-orange-600 text-white shadow-orange-500/20",
          cardBorder: "border-orange-500/30 hover:border-orange-400 bg-slate-800/90 hover:bg-slate-800",
          badge: "bg-orange-900/60 text-orange-300 border-orange-700/50",
          iconColor: "text-orange-400",
        };
    }
  };

  const handleAgregarExtraLibre = (monto: number) => {
    if (monto <= 0) return;
    onAddExtraLibre(monto, notaExtraLibre.trim() || undefined);
    setNotaExtraLibre("");
    setMontoPersonalizado("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 select-none">
      {/* 1. SECCIÓN FIJA SUPERIOR: TOP VENTAS FLASH (80/20) */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>⭐ TOP VENTAS FLASH (1 TOQUE DIRECTO)</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {favoritos.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProducto(prod)}
              className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 active:scale-95 text-slate-100 p-2.5 rounded-xl border border-amber-500/30 hover:border-amber-400 flex flex-col justify-between items-start transition-all shadow-sm cursor-pointer group text-left min-h-[70px]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-amber-400 group-hover:text-slate-950">
                  {prod.codigoCorto}
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950" />
              </div>
              <div className="font-bold text-xs leading-snug line-clamp-1 mt-1">
                {prod.nombre}
              </div>
              <div className="text-sm font-black text-amber-300 group-hover:text-slate-950 mt-1">
                Bs. {prod.precioBase.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. PESTAÑAS DE CATEGORÍA POR CÓDIGO DE COLOR */}
      <div className="px-3 pt-2.5 pb-2 flex gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900/50 no-scrollbar">
        {categorias.map((cat) => {
          const isActiva = cat.id === categoriaActiva;
          const theme = getCategoryTheme(cat.colorSemantica);
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActiva
                  ? `${theme.activeTab} shadow-md scale-102`
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
            const theme = getCategoryTheme(cat?.colorSemantica || "orange");
            return (
              <button
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className={`relative p-3 rounded-2xl border ${theme.cardBorder} flex flex-col justify-between items-start transition-all shadow-sm active:scale-96 cursor-pointer text-left min-h-[95px] group`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${theme.badge}`}
                  >
                    {prod.codigoCorto}
                  </span>
                  <span className={`${theme.iconColor} group-hover:scale-110 transition`}>
                    {getCategoryIcon(cat?.icono || "")}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100 leading-snug line-clamp-2 mt-2">
                  {prod.nombre}
                </div>

                <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-700/40">
                  <span className="text-base font-black text-amber-400">
                    Bs. {prod.precioBase.toFixed(2)}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FRANJA INFERIOR FIJA DE TOPPINGS Y EXTRAS (2 NIVELES) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>INYECCIÓN DE EXTRAS</span>
            {hasItemSelected && selectedItemNombre && (
              <span className="text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Añadiendo a: {selectedItemNombre}
              </span>
            )}
          </span>
          <span className="text-[11px] text-slate-400">
            Regla: Solo suma hacia arriba
          </span>
        </div>

        {/* Nivel 1: Toppings Fijos */}
        <div className="flex flex-wrap gap-1.5">
          {toppingsFijos.map((top) => (
            <button
              key={top.id}
              disabled={!hasItemSelected}
              onClick={() => onAddToppingFijo(top)}
              className="bg-emerald-950/70 hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>+ {top.nombre}</span>
              <span className="text-emerald-400 font-black">
                Bs. {top.precio.toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        {/* Nivel 2: Comodín de Cocina ("Extra Libre Impredecible") */}
        <div className="pt-1.5 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Comodín Cocina:
          </div>

          <div className="flex items-center gap-1.5">
            {[2, 5, 10].map((monto) => (
              <button
                key={monto}
                disabled={!hasItemSelected}
                onClick={() => handleAgregarExtraLibre(monto)}
                className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 disabled:opacity-40 border border-slate-700 text-amber-300 active:scale-95 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer disabled:cursor-not-allowed"
              >
                + Bs. {monto}
              </button>
            ))}
          </div>

          {/* Campo de nota opcional y monto personalizado */}
          <div className="flex-1 flex items-center gap-1.5 min-w-[200px]">
            <input
              type="text"
              placeholder="Nota extra: ej. Palta, Ahogado..."
              value={notaExtraLibre}
              onChange={(e) => setNotaExtraLibre(e.target.value)}
              disabled={!hasItemSelected}
              className="bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-lg px-2.5 py-1 flex-1 focus:outline-none focus:border-amber-400 disabled:opacity-40"
            />
            <input
              type="number"
              placeholder="Bs."
              value={montoPersonalizado}
              onChange={(e) => setMontoPersonalizado(e.target.value)}
              disabled={!hasItemSelected}
              className="w-16 bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:border-amber-400 disabled:opacity-40"
            />
            <button
              disabled={!hasItemSelected || !montoPersonalizado}
              onClick={() => handleAgregarExtraLibre(parseFloat(montoPersonalizado) || 0)}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
            >
              Sumar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
