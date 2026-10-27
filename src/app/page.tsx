import React, { Suspense } from "react";
import { connection } from "next/server";
import { getTurnoActivo } from "@/actions/turno-actions";
import { PosLayout } from "@/components/pos/pos-layout";

async function PosContainer() {
  await connection();
  const data = await getTurnoActivo();

  if (!data.success || !data.turno) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#16181D] text-[#E5E9F0] p-4 select-none">
        <div className="bg-[#1C1F26] border border-[#2E3440] p-8 rounded-3xl max-w-md text-center shadow-2xl">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-black text-amber-400 mb-2">
            Iniciando POS Eben Ezer
          </h2>
          <p className="text-xs text-[#94A3B8] mb-4">
            {data.error || "Preparando conexión con la base de datos o turno inicial."}
          </p>
          <a
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
          >
            Reintentar Conexión
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
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#16181D] text-[#E5E9F0] select-none">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3 animate-pulse">
            <span className="text-2xl">🏪</span>
          </div>
          <div className="text-sm font-black text-amber-400 tracking-wider">
            POS EBEN EZER
          </div>
          <div className="text-xs text-[#94A3B8] mt-1 font-medium">
            Cargando sistema de caja flash...
          </div>
        </div>
      }
    >
      <PosContainer />
    </Suspense>
  );
}
