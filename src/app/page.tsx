import React, { Suspense } from "react";
import { getEstadoCaja } from "@/server/actions";
import { PosLayout } from "@/components/pos/pos-layout";

async function PosContainer() {
  const data = await getEstadoCaja();

  if (!data.success || !data.turno) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 select-none">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md text-center shadow-2xl">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-black text-amber-400 mb-2">
            Iniciando POS Eben Ezer
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Preparando conexión con la base de datos o turno inicial.
          </p>
          <a
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Recargar Sistema
          </a>
        </div>
      </div>
    );
  }

  return (
    <PosLayout
      initialData={{
        turno: data.turno,
        categorias: data.categorias || [],
        productos: data.productos || [],
        toppingsFijos: data.toppingsFijos || [],
        usuarios: data.usuarios || [],
        pendientesRendir: data.pendientesRendir || [],
        ultimasVentas: data.ultimasVentas || [],
      }}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 select-none">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3 animate-pulse">
            <span className="text-2xl">🏪</span>
          </div>
          <div className="text-sm font-black text-amber-400">
            POS EBEN EZER
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Cargando sistema de caja flash...
          </div>
        </div>
      }
    >
      <PosContainer />
    </Suspense>
  );
}
