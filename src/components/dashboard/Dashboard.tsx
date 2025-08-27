"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusWidget } from "./StatusWidget";
import { KpiCard } from "./KpiCard";
import { DowntimeChart, type DowntimeData } from "./DowntimeChart";
import { DowntimeModal, type DowntimeReason } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";

type MachineState = 'INACTIVE' | 'RUNNING' | 'STOPPED';

const stateConfig = {
  INACTIVE: {
    status: "Inactiva",
    subtext: "Sin Operador - Pase su tarjeta para iniciar sesión",
    color: "bg-status-gray",
    Icon: CreditCard,
    isPulsing: false,
  },
  RUNNING: {
    status: "Funcionando",
    subtext: "Operador: Juan Pérez",
    color: "bg-status-green",
    Icon: CheckCircle2,
    isPulsing: false,
  },
  STOPPED: {
    status: "Parada",
    subtext: "Esperando registro de motivo...",
    color: "bg-destructive",
    Icon: AlertTriangle,
    isPulsing: true,
  },
};

const initialDowntimeData: DowntimeData[] = [
  { reason: "Mecánico", time: 15 },
  { reason: "Eléctrico", time: 5 },
  { reason: "Material", time: 30 },
  { reason: "Calidad", time: 8 },
  { reason: "Ajuste", time: 12 },
];

export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [kpis, setKpis] = useState({ finishedLabels: 12530, labelsPerMinute: 850, downtime: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>(initialDowntimeData);
  const [downtimeStartTime, setDowntimeStartTime] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    let kpiInterval: NodeJS.Timeout | null = null;
    if (state === 'RUNNING') {
      kpiInterval = setInterval(() => {
        setKpis(prev => ({
          ...prev,
          finishedLabels: prev.finishedLabels + Math.floor(Math.random() * 10) + 1,
          labelsPerMinute: 845 + Math.floor(Math.random() * 10), // Simulate fluctuation
        }));
      }, 1000);
    }

    return () => {
      if (kpiInterval) clearInterval(kpiInterval);
    };
  }, [state]);
  
  const handleWidgetClick = () => {
    if (state === 'INACTIVE') {
      setState('RUNNING');
      toast({ title: "Inicio de sesión exitoso", description: "Operador: Juan Pérez" });
    } else if (state === 'RUNNING') {
      setState('STOPPED');
      setDowntimeStartTime(Date.now());
      setTimeout(() => setIsModalOpen(true), 500); // Open modal after a short delay
    }
  };
  
  const handleRegisterDowntime = (reason: DowntimeReason) => {
    if (downtimeStartTime) {
      const duration = Math.round((Date.now() - downtimeStartTime) / 1000 / 60); // in minutes
      const newDowntime = {
        reason,
        time: duration
      };
      
      setDowntimeData(prevData => {
        const existingReason = prevData.find(item => item.reason === reason);
        if (existingReason) {
          return prevData.map(item =>
            item.reason === reason ? { ...item, time: item.time + duration } : item
          );
        } else {
          // For simplicity in this prototype, we'll just update one, you could add new ones
          return prevData;
        }
      });
      setKpis(prev => ({ ...prev, downtime: prev.downtime + duration }));
    }
    setIsModalOpen(false);
    toast({ title: "Paro Registrado", description: `Motivo: ${reason}.` });
  };
  
  const handleRestartProduction = () => {
    setState('RUNNING');
    setIsModalOpen(false);
    setDowntimeStartTime(null);
    toast({ title: "Producción Reiniciada", description: "La máquina ha vuelto a funcionar." });
  };


  const currentConfig = stateConfig[state];

  return (
    <div className="w-full h-full mx-auto flex flex-col items-center justify-center space-y-6">
      <DowntimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        onRegister={handleRegisterDowntime}
      />
      
      <div className="w-full flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          <div className="md:col-span-1 flex items-center justify-center">
            <StatusWidget
              status={currentConfig.status}
              subtext={currentConfig.subtext}
              color={currentConfig.color}
              Icon={currentConfig.Icon}
              isPulsing={currentConfig.isPulsing}
              onClick={handleWidgetClick}
            />
          </div>
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <KpiCard title="Etiquetas Producidas" value={kpis.finishedLabels.toLocaleString()} />
              <KpiCard title="Etiquetas por Minuto" value={kpis.labelsPerMinute.toLocaleString()} />
            </div>
            <DowntimeChart data={downtimeData} />
          </div>
        </div>
      </div>
      
      {state === 'STOPPED' && (
         <div className="w-full max-w-7xl pb-4">
            <Button 
                onClick={handleRestartProduction}
                className="w-full h-20 text-3xl font-bold bg-status-green hover:bg-status-green/90 text-white"
            >
                <PlayCircle className="mr-4 h-10 w-10" />
                Reiniciar Producción
            </Button>
         </div>
      )}
    </div>
  );
}
