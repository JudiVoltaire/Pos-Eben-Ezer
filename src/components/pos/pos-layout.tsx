"use client";

import React, { useState } from "react";
import { TopBar } from "./top-bar";
import { CatalogPanel } from "./catalog-panel";
import { TicketPanel } from "./ticket-panel";
import { ModalSalida } from "./modal-salida";
import { ModalPendientes } from "./modal-pendientes";
import { ModalCintaTestigo } from "./modal-cinta-testigo";
import { ModalCierreCiego } from "./modal-cierre-ciego";
import { ModalAnular } from "./modal-anular";
import {
  registrarVenta,
  registrarMovimientoCaja,
  subirComprobanteGasto,
  cerrarTurnoCajaCiego,
  abrirNuevoTurno,
  anularUltimaVenta,
  getCintaTestigo,
  ItemVentaPayload,
  RegistrarMovimientoInput,
} from "@/server/actions";

interface PosLayoutProps {
  initialData: {
    turno: any;
    categorias: any[];
    productos: any[];
    toppingsFijos: any[];
    usuarios: any[];
    pendientesRendir: any[];
    ultimasVentas: any[];
  };
}

export function PosLayout({ initialData }: PosLayoutProps) {
  // Estado de Turno y Bolsillos
  const [turno, setTurno] = useState(initialData.turno);
  const [pendientes, setPendientes] = useState(initialData.pendientesRendir);

  // Estado del Ticket Activo
  const [ticketItems, setTicketItems] = useState<ItemVentaPayload[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Último ticket generado para anulación rápida
  const [ultimoTicket, setUltimoTicket] = useState<{
    nroTicket: number;
    ventaId: string;
    total: number;
  } | null>(
    initialData.ultimasVentas?.[0]
      ? {
          nroTicket: initialData.ultimasVentas[0].nroTicket,
          ventaId: initialData.ultimasVentas[0].id,
          total: initialData.ultimasVentas[0].totalFinal,
        }
      : null
  );

  // Estados de Modales
  const [isSalidaOpen, setIsSalidaOpen] = useState(false);
  const [isPendientesOpen, setIsPendientesOpen] = useState(false);
  const [isCintaTestigoOpen, setIsCintaTestigoOpen] = useState(false);
  const [isCierreCiegoOpen, setIsCierreCiegoOpen] = useState(false);
  const [isAnularOpen, setIsAnularOpen] = useState(false);

  // Eventos de Cinta Testigo
  const [eventosCinta, setEventosCinta] = useState<any[]>([]);

  // 1. Agregar Producto al Ticket (Regla de Oro: Toque Directo Instantáneo)
  const handleSelectProducto = (prod: any) => {
    const nuevoItem: ItemVentaPayload = {
      productoId: prod.id,
      nombre: prod.nombre,
      precioBase: prod.precioBase,
      extrasFijos: [],
      extrasLibres: [],
      totalItem: prod.precioBase,
    };

    setTicketItems((prev) => {
      const next = [...prev, nuevoItem];
      setSelectedIndex(next.length - 1); // Seleccionar inmediatamente para inyectar extras
      return next;
    });
  };

  // 2. Inyectar Topping Fijo (Nivel 1)
  const handleAddToppingFijo = (top: any) => {
    if (ticketItems.length === 0) return;
    const targetIdx = selectedIndex !== null ? selectedIndex : ticketItems.length - 1;

    setTicketItems((prev) => {
      const updated = [...prev];
      const it = { ...updated[targetIdx] };

      it.extrasFijos = [...it.extrasFijos, { id: top.id, nombre: top.nombre, precio: top.precio }];
      it.totalItem += top.precio;

      updated[targetIdx] = it;
      return updated;
    });
  };

  // 3. Inyectar Extra Libre de Cocina (Nivel 2)
  const handleAddExtraLibre = (monto: number, nota?: string) => {
    if (ticketItems.length === 0 || monto <= 0) return;
    const targetIdx = selectedIndex !== null ? selectedIndex : ticketItems.length - 1;

    setTicketItems((prev) => {
      const updated = [...prev];
      const it = { ...updated[targetIdx] };

      it.extrasLibres = [...it.extrasLibres, { monto, nota }];
      it.totalItem += monto;

      updated[targetIdx] = it;
      return updated;
    });
  };

  // 4. Quitar Ítem
  const handleRemoveItem = (idx: number) => {
    setTicketItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) {
        setSelectedIndex(null);
      } else if (selectedIndex === idx) {
        setSelectedIndex(next.length - 1);
      }
      return next;
    });
  };

  // 5. Vaciar Ticket
  const handleLimpiarTicket = () => {
    setTicketItems([]);
    setSelectedIndex(null);
  };

  // 6. Procesar Venta (Cobro en 3 segundos)
  const handleProcesarVenta = async (datosPago: {
    metodoPago: "EFECTIVO" | "QR" | "MIXTO";
    montoEfectivo: number;
    montoQr: number;
    efectivoRecibido: number;
    vueltoEntregado: number;
  }) => {
    if (ticketItems.length === 0 || !turno) return;
    setIsProcessingSale(true);

    const subtotalBase = ticketItems.reduce((acc, it) => acc + it.precioBase, 0);
    const totalExtras = ticketItems.reduce(
      (acc, it) =>
        acc +
        it.extrasFijos.reduce((s, e) => s + e.precio, 0) +
        it.extrasLibres.reduce((s, e) => s + e.monto, 0),
      0
    );
    const totalFinal = subtotalBase + totalExtras;

    const res = await registrarVenta({
      turnoId: turno.id,
      cajeraId: turno.cajeraId,
      metodoPago: datosPago.metodoPago,
      montoEfectivo: datosPago.montoEfectivo,
      montoQr: datosPago.montoQr,
      efectivoRecibido: datosPago.efectivoRecibido,
      vueltoEntregado: datosPago.vueltoEntregado,
      items: ticketItems,
      subtotalBase,
      totalExtras,
      totalFinal,
    });

    setIsProcessingSale(false);

    if (res.success && res.nroTicket && res.ventaId) {
      // Actualizar bolsillos optimísticamente
      setTurno((prev: any) => ({
        ...prev,
        saldoEfectivoEsperado: prev.saldoEfectivoEsperado + datosPago.montoEfectivo,
        saldoQrAcumulado: prev.saldoQrAcumulado + datosPago.montoQr,
      }));

      setUltimoTicket({
        nroTicket: res.nroTicket,
        ventaId: res.ventaId,
        total: totalFinal,
      });

      // Limpiar ticket
      setTicketItems([]);
      setSelectedIndex(null);
    }
  };

  // 7. Salida / Retiro de Dinero (Caso María)
  const handleConfirmarMovimiento = async (data: RegistrarMovimientoInput) => {
    const res = await registrarMovimientoCaja(data);
    if (res.success) {
      // Actualizar saldos locales
      setTurno((prev: any) => {
        let ef = prev.saldoEfectivoEsperado;
        let qr = prev.saldoQrAcumulado;

        if (data.tipo === "INGRESO_CAMBIO") {
          if (data.bolsillo === "EFECTIVO_CAJON") ef += data.monto;
          else qr += data.monto;
        } else {
          if (data.bolsillo === "EFECTIVO_CAJON") ef -= data.monto;
          else qr -= data.monto;
        }

        return { ...prev, saldoEfectivoEsperado: ef, saldoQrAcumulado: qr };
      });

      if (data.tipo === "GASTO_INSUMOS") {
        setPendientes((prev: any[]) => [
          ...prev,
          {
            id: res.movimientoId,
            tipo: data.tipo,
            bolsillo: data.bolsillo,
            monto: data.monto,
            motivo: data.motivo,
            notaOpcional: data.notaOpcional,
            estadoRendicion: "PENDIENTE_COMPROBANTE",
            fechaHora: new Date().toISOString(),
          },
        ]);
      }
      return true;
    }
    return false;
  };

  // 8. Respaldar Foto de Rendición
  const handleSubirFoto = async (movimientoId: string, base64Url: string) => {
    const res = await subirComprobanteGasto(movimientoId, base64Url);
    if (res.success) {
      setPendientes((prev: any[]) => prev.filter((p) => p.id !== movimientoId));
      return true;
    }
    return false;
  };

  // 9. Cierre Ciego de Turno
  const handleEjecutarCierre = async (montoContado: number) => {
    if (!turno) return null;
    const res = await cerrarTurnoCajaCiego(turno.id, montoContado);
    if (res.success && res.reporteZ) {
      return res.reporteZ;
    }
    return null;
  };

  const handleIniciarNuevoTurno = async (fondoInicial: number) => {
    if (!turno) return;
    const res = await abrirNuevoTurno(turno.cajeraId, fondoInicial);
    if (res.success && res.nuevoTurnoId) {
      setTurno({
        id: res.nuevoTurnoId,
        cajeraId: turno.cajeraId,
        fondoInicialEfectivo: fondoInicial,
        saldoEfectivoEsperado: fondoInicial,
        saldoQrAcumulado: 0,
        estado: "ABIERTO",
      });
      setPendientes([]);
      setTicketItems([]);
      setUltimoTicket(null);
    }
  };

  // 10. Anular Última Venta
  const handleConfirmarAnulacion = async (ventaId: string, pinAdmin: string) => {
    const res = await anularUltimaVenta(ventaId, pinAdmin);
    if (res.success) {
      if (ultimoTicket) {
        setTurno((prev: any) => ({
          ...prev,
          saldoEfectivoEsperado: Math.max(0, prev.saldoEfectivoEsperado - ultimoTicket.total),
        }));
      }
      setUltimoTicket(null);
      return true;
    }
    return false;
  };

  // 11. Cargar Cinta Testigo
  const handleOpenCintaTestigo = async () => {
    setIsCintaTestigoOpen(true);
    if (turno) {
      const res = await getCintaTestigo(turno.id);
      if (res.success && res.eventos) {
        setEventosCinta(res.eventos);
      }
    }
  };

  const itemSeleccionado =
    selectedIndex !== null && ticketItems[selectedIndex]
      ? ticketItems[selectedIndex]
      : ticketItems[ticketItems.length - 1];

  const cajeraNombre =
    initialData.usuarios.find((u) => u.id === turno?.cajeraId)?.nombre || "Laura (Cajera)";

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* 1. BARRA SUPERIOR DE ESTADO ("LOS DOS BOLSILLOS DIGITALES") */}
      <TopBar
        saldoEfectivo={turno?.saldoEfectivoEsperado || 0}
        saldoQr={turno?.saldoQrAcumulado || 0}
        pendientesCount={pendientes.length}
        cajeraNombre={cajeraNombre}
        onOpenSalida={() => setIsSalidaOpen(true)}
        onOpenCintaTestigo={handleOpenCintaTestigo}
        onOpenPendientes={() => setIsPendientesOpen(true)}
        onOpenCierreCiego={() => setIsCierreCiegoOpen(true)}
      />

      {/* 2. LAYOUT PRINCIPAL 60 / 40 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Panel Izquierdo (60%): Catálogo Flash y Franja de Extras */}
        <CatalogPanel
          categorias={initialData.categorias}
          productos={initialData.productos}
          toppingsFijos={initialData.toppingsFijos}
          hasItemSelected={ticketItems.length > 0}
          selectedItemNombre={itemSeleccionado?.nombre}
          onSelectProducto={handleSelectProducto}
          onAddToppingFijo={handleAddToppingFijo}
          onAddExtraLibre={handleAddExtraLibre}
        />

        {/* Panel Derecho (40%): Ticket Activo y Cobro en 3 Segundos */}
        <TicketPanel
          items={ticketItems}
          selectedIndex={selectedIndex}
          onSelectItem={(idx) => setSelectedIndex(idx)}
          onRemoveItem={handleRemoveItem}
          onLimpiarTicket={handleLimpiarTicket}
          onProcesarVenta={handleProcesarVenta}
          isProcessing={isProcessingSale}
          ultimoTicketGenerado={ultimoTicket}
          onOpenAnularUltimo={() => setIsAnularOpen(true)}
        />
      </div>

      {/* 3. MODALES DE SISTEMA */}
      <ModalSalida
        isOpen={isSalidaOpen}
        onClose={() => setIsSalidaOpen(false)}
        turnoId={turno?.id || ""}
        cajeraId={turno?.cajeraId || ""}
        usuarios={initialData.usuarios}
        onConfirmarMovimiento={handleConfirmarMovimiento}
      />

      <ModalPendientes
        isOpen={isPendientesOpen}
        onClose={() => setIsPendientesOpen(false)}
        pendientes={pendientes}
        onSubirFoto={handleSubirFoto}
      />

      <ModalCintaTestigo
        isOpen={isCintaTestigoOpen}
        onClose={() => setIsCintaTestigoOpen(false)}
        eventos={eventosCinta}
      />

      <ModalCierreCiego
        isOpen={isCierreCiegoOpen}
        onClose={() => setIsCierreCiegoOpen(false)}
        turnoId={turno?.id || ""}
        onEjecutarCierre={handleEjecutarCierre}
        onIniciarNuevoTurno={handleIniciarNuevoTurno}
      />

      <ModalAnular
        isOpen={isAnularOpen}
        onClose={() => setIsAnularOpen(false)}
        ultimoTicket={ultimoTicket}
        onConfirmarAnulacion={handleConfirmarAnulacion}
      />
    </div>
  );
}
