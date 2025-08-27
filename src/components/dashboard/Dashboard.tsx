"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, PlayCircle, LogOut } from "lucide-react";
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
    textColor: "text-white",
    Icon: CreditCard,
    isPulsing: false,
  },
  RUNNING: {
    status: "Funcionando",
    subtext: "Operador: Juan Pérez",
    color: "bg-status-green",
    textColor: "text-white",
    Icon: CheckCircle2,
    isPulsing: false,
  },
  STOPPED: {
    status: "Parada",
    subtext: "Esperando registro de motivo...",
    color: "bg-destructive",
    textColor: "text-white",
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
    { reason: "Fin de Turno", time: 0 },
    { reason: "Hora de Comida", time: 0 },
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
      setTimeout(() => setIsModalOpen(true), 500);
    }
  };
  
  const handleRegisterDowntime = (reason: DowntimeReason) => {
    if (downtimeStartTime) {
      const duration = Math.round((Date.now() - downtimeStartTime) / 1000 / 60); // in minutes
      
      setDowntimeData(prevData => {
        const existingReasonIndex = prevData.findIndex(item => item.reason === reason);
        if (existingReasonIndex > -1) {
          const newData = [...prevData];
          newData[existingReasonIndex] = { ...newData[existingReasonIndex], time: newData[existingReasonIndex].time + duration };
          return newData;
        }
        // This fallback is simplified for the prototype
        return [...prevData, { reason, time: duration }];
      });
      setKpis(prev => ({ ...prev, downtime: prev.downtime + duration }));
    }
    
    if (reason === 'Fin de Turno') {
      handleLogout();
      toast({ title: "Fin de turno registrado", description: "Sesión cerrada." });
    } else if (reason === 'Hora de Comida') {
      setIsModalOpen(false);
      setDowntimeStartTime(null);
      setState('INACTIVE'); // Or a new state e.g., 'ON_BREAK'
      toast({ title: "Paro por comida registrado.", description: "La máquina está en pausa." });
    } else {
      setIsModalOpen(false);
      toast({ title: "Paro Registrado", description: `Motivo: ${reason}.` });
    }
  };
  
  const handleRestartProduction = () => {
    setState('RUNNING');
    setIsModalOpen(false);
    setDowntimeStartTime(null);
    toast({ title: "Producción Reiniciada", description: "La máquina ha vuelto a funcionar." });
  };
  
  const handleLogout = () => {
    setState('INACTIVE');
    setDowntimeStartTime(null);
    setIsModalOpen(false); // Close modal on logout
    toast({ title: "Sesión Cerrada", description: "Vuelva a pasar su tarjeta para iniciar." });
  };
  
  const downtimeReasons: DowntimeReason[] = ['Falta de Material', 'Mantenimiento', 'Eléctrico', 'Calidad', 'Ajuste', 'Fin de Turno', 'Hora de Comida'];

  const currentConfig = stateConfig[state];

  return (
    <div className="w-full h-full mx-auto flex flex-col items-center justify-center space-y-4 md:space-y-6 bg-background">
      <DowntimeModal
        isOpen={isModalOpen}
        onRegister={handleRegisterDowntime}
        downtimeReasons={downtimeReasons}
      />
      
      <header className="w-full max-w-7xl flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold text-foreground">Avery Production Pulse</h1>
        {state !== 'INACTIVE' && (
          <div className="flex items-center gap-4">
            <span className="text-xl font-medium text-muted-foreground">{currentConfig.subtext}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </header>
      
      <div className="w-full flex-grow flex items-center justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          <div className="md:col-span-1 flex items-center justify-center">
            <StatusWidget
              status={currentConfig.status}
              subtext={state === 'INACTIVE' ? currentConfig.subtext : ''}
              color={currentConfig.color}
              textColor={currentConfig.textColor}
              Icon={currentConfig.Icon}
              isPulsing={currentConfig.isPulsing}
              onClick={handleWidgetClick}
            />
          </div>
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <KpiCard title="Etiquetas Producidas" value={kpis.finishedLabels.toLocaleString()} />
              <KpiCard title="Etiquetas por Minuto" value={kpis.labelsPerMinute.toLocaleString()} />
            </div>
            <DowntimeChart data={downtimeData} />
          </div>
        </div>
      </div>
      
      {state === 'STOPPED' && (
         <div className="w-full max-w-7xl p-4">
            <Button 
                onClick={handleRestartProduction}
                className="w-full h-24 text-4xl font-bold bg-status-green hover:bg-status-green/90 text-white shadow-lg"
            >
                <PlayCircle className="mr-4 h-12 w-12" />
                Reiniciar Producción
            </Button>
         </div>
      )}
    </div>
  );
}
