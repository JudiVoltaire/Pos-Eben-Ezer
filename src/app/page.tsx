import React, { Suspense } from "react";
import { connection } from "next/server";
import { getTurnoActivo } from "@/actions/turno-actions";
import { PosLayout } from "@/components/pos/pos-layout";
import { AlertTriangle, Store } from "lucide-react";

async function PosContainer() {
  await connection();
  const data = await getTurnoActivo();

  if (!data.success || !data.turno) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#14171D] text-[#E5E9F0] p-4 select-none">
        <div className="bg-[#161920] border border-[#262B36] p-8 rounded-lg max-w-sm text-center shadow-2xl">
          <AlertTriangle className="w-8 h-8 text-[#F59E0B] mx-auto mb-3" strokeWidth={1.75} />
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#E5E9F0] mb-2">
            INICIANDO POS EBEN EZER
          </h2>
          <p className="text-xs text-[#7D8597] mb-4 leading-relaxed">
            {data.error || "Conectando con la base de datos de caja..."}
          </p>
          <a
            href="/"
            className="inline-block bg-[#10B981] hover:bg-[#059669] text-[#0B0F14] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#14171D] text-[#E5E9F0] select-none">
          <div className="w-12 h-12 rounded-lg bg-[#1E222B] border border-[#2D3340] flex items-center justify-center mb-3 shadow-md animate-pulse">
            <Store className="w-5 h-5 text-[#F59E0B]" strokeWidth={1.75} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#E5E9F0]">
            EBEN EZER POS
          </div>
          <div className="text-[11px] text-[#7D8597] mt-1 font-mono">
            Cargando sistema de caja...
          </div>
        </div>
      }
    >
      <PosContainer />
    </Suspense>
  );
}
