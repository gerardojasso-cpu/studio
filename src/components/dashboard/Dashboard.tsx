"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, Hourglass, Wrench } from "lucide-react";

import { StatusWidget } from "./StatusWidget";
import { KpiCard } from "./KpiCard";
import { DowntimeChart, type DowntimeData } from "./DowntimeChart";
import { DowntimeModal, type DowntimeReason } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";

type MachineState = 'INACTIVE' | 'RUNNING' | 'STOPPED' | 'AWAITING_SUPPORT' | 'REPAIR_IN_PROGRESS' | 'PENDING_OPERATOR';

const stateConfig = {
  INACTIVE: {
    status: "Pase su tarjeta para iniciar sesión",
    subtext: "Modo Invitado",
    color: "bg-status-gray",
    Icon: CreditCard,
    isPulsing: false,
  },
  RUNNING: {
    status: "Funcionando",
    subtext: "Operador: John Doe",
    color: "bg-status-green",
    Icon: CheckCircle2,
    isPulsing: false,
  },
  STOPPED: {
    status: "Máquina Parada",
    subtext: "Registrando motivo de paro...",
    color: "bg-status-red",
    Icon: AlertTriangle,
    isPulsing: true,
  },
  AWAITING_SUPPORT: {
    status: "Esperando a Mantenimiento",
    subtext: "Tiempo de respuesta en curso",
    color: "bg-status-orange",
    Icon: Hourglass,
    isPulsing: true,
  },
  REPAIR_IN_PROGRESS: {
    status: "Reparación en Curso",
    subtext: "Técnico: Jane Smith",
    color: "bg-status-yellow",
    Icon: Wrench,
    isPulsing: false,
  },
  PENDING_OPERATOR: {
    status: "Solucionado, Pendiente de Operador",
    subtext: "Esperando confirmación para reiniciar",
    color: "bg-status-orange",
    Icon: Hourglass,
    isPulsing: true,
  },
};

const initialDowntimeData: DowntimeData[] = [
  { reason: "Mecánico", time: 0 },
  { reason: "Eléctrico", time: 0 },
  { reason: "Material", time: 0 },
  { reason: "Calidad", time: 0 },
  { reason: "Ajuste", time: 0 },
];

export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [kpis, setKpis] = useState({ finishedRolls: 0, downtime: 0, rollsPerHour: 0, utilization: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>(initialDowntimeData);
  const [downtimeStartTime, setDowntimeStartTime] = useState<number | null>(null);
  const [lastDowntimeReason, setLastDowntimeReason] = useState<DowntimeReason | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    let kpiInterval: NodeJS.Timeout | null = null;
    if (state === 'RUNNING') {
      kpiInterval = setInterval(() => {
        setKpis(prev => ({
          ...prev,
          finishedRolls: prev.finishedRolls + 1,
          rollsPerHour: 55 + Math.floor(Math.random() * 10), // Simulate fluctuation
          utilization: 98,
        }));
      }, 3000);
    } else {
      if (state !== 'INACTIVE') {
        setKpis(prev => ({ ...prev, rollsPerHour: 0, utilization: 0 }));
      }
    }

    return () => {
      if (kpiInterval) clearInterval(kpiInterval);
    };
  }, [state]);

  const handleStateTransition = useCallback(() => {
    switch (state) {
      case 'INACTIVE':
        setState('RUNNING');
        toast({ title: "Inicio de sesión exitoso", description: "Operador: John Doe" });
        break;
      case 'RUNNING':
        setState('STOPPED');
        setDowntimeStartTime(Date.now());
        setTimeout(() => setIsModalOpen(true), 300);
        break;
      case 'STOPPED':
        // This state transitions via modal action
        break;
      case 'AWAITING_SUPPORT':
        setState('REPAIR_IN_PROGRESS');
        toast({ title: "Soporte en sitio", description: "Técnico: Jane Smith" });
        break;
      case 'REPAIR_IN_PROGRESS':
        setState('PENDING_OPERATOR');
        toast({ title: "Reparación completada", description: "Esperando confirmación del operador." });
        break;
      case 'PENDING_OPERATOR':
        if (downtimeStartTime && lastDowntimeReason) {
          const duration = Math.round((Date.now() - downtimeStartTime) / 1000 / 60); // in minutes
          setKpis(prev => ({ ...prev, downtime: prev.downtime + duration }));
          setDowntimeData(prevData =>
            prevData.map(item =>
              item.reason === lastDowntimeReason ? { ...item, time: item.time + duration } : item
            )
          );
          setDowntimeStartTime(null);
          setLastDowntimeReason(null);
        }
        setState('RUNNING');
        toast({ title: "Máquina Reiniciada", description: "La producción ha sido reanudada." });
        break;
    }
  }, [state, downtimeStartTime, lastDowntimeReason, toast]);

  const handleRegisterDowntime = (reason: DowntimeReason) => {
    setLastDowntimeReason(reason);
    setState('AWAITING_SUPPORT');
    setIsModalOpen(false);
    toast({ title: "Paro Registrado", description: `Motivo: ${reason}. Soporte notificado.` });
  };

  const currentConfig = stateConfig[state];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <DowntimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegisterDowntime}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <StatusWidget
            status={currentConfig.status}
            subtext={currentConfig.subtext}
            color={currentConfig.color}
            Icon={currentConfig.Icon}
            isPulsing={currentConfig.isPulsing}
            onClick={handleStateTransition}
          />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
          <KpiCard title="Rollos Terminados" value={kpis.finishedRolls.toString()} />
          <KpiCard title="Tiempo de Paro" value={kpis.downtime.toString()} unit="min" />
          <KpiCard title="Rollos por Hora" value={kpis.rollsPerHour.toString()} />
          <KpiCard title="Utilización" value={kpis.utilization.toString()} unit="%" />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <DowntimeChart data={downtimeData} />
      </div>
    </div>
  );
}
