"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, PlayCircle, LogOut, Square, Power, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusWidget } from "./StatusWidget";
import { KpiCard } from "./KpiCard";
import { DowntimeChart, type DowntimeData } from "./DowntimeChart";
import { DowntimeModal, type DowntimeReason } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";

type MachineState = 'INACTIVE' | 'LOGGED_IN' | 'RUNNING' | 'STOPPED' | 'AWAITING_CONFIRMATION';

const stateConfig = {
  INACTIVE: {
    status: "Inactiva",
    subtext: "Pase su tarjeta para iniciar sesión",
    color: "bg-status-gray",
    textColor: "text-white",
    Icon: CreditCard,
    isPulsing: false,
  },
  LOGGED_IN: {
    status: "Lista para Iniciar",
    subtext: "Operador: Juan Pérez",
    color: "bg-status-yellow",
    textColor: "text-foreground",
    Icon: Power,
    isPulsing: true,
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
  AWAITING_CONFIRMATION: {
    status: "Parada",
    subtext: "Esperando confirmación de fin de paro.",
    color: "bg-destructive",
    textColor: "text-white",
    Icon: Wrench,
    isPulsing: false,
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

  const handleLogin = () => {
    setState('LOGGED_IN');
    toast({ title: "Inicio de sesión exitoso", description: "Operador: Juan Pérez" });
  };
  
  const handleStartProduction = () => {
    setState('RUNNING');
    setDowntimeStartTime(null);
    toast({ title: "Producción Iniciada", description: "La máquina ha comenzado a funcionar." });
  };
  
  const handleStopProduction = () => {
    setState('STOPPED');
    setDowntimeStartTime(Date.now());
    setTimeout(() => setIsModalOpen(true), 500);
  }
  
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
        return [...prevData, { reason, time: duration }];
      });
      setKpis(prev => ({ ...prev, downtime: prev.downtime + duration }));
    }
    
    setIsModalOpen(false);

    if (reason === 'Fin de Turno') {
      handleLogout();
      toast({ title: "Fin de turno registrado", description: "Sesión cerrada." });
    } else if (reason === 'Hora de Comida') {
      setState('LOGGED_IN'); 
      setDowntimeStartTime(null);
      toast({ title: "Paro por comida registrado.", description: "La máquina está en pausa. Reinicie cuando termine." });
    } else {
      setState('AWAITING_CONFIRMATION');
      toast({ title: "Paro Registrado", description: `Motivo: ${reason}. Confirme cuando el problema esté resuelto.` });
    }
  };
    
  const handleLogout = () => {
    setState('INACTIVE');
    setDowntimeStartTime(null);
    setIsModalOpen(false);
    toast({ title: "Sesión Cerrada", description: "Vuelva a pasar su tarjeta para iniciar." });
  };

  const handleEndDowntimeConfirmation = () => {
    setState('LOGGED_IN');
    setDowntimeStartTime(null);
    toast({ title: "Fin de Paro Confirmado", description: "La máquina está lista para reiniciar producción." });
  };
  
  const downtimeReasons: DowntimeReason[] = ['Falta de Material', 'Mantenimiento', 'Mecánico', 'Eléctrico', 'Calidad', 'Ajuste', 'Fin de Turno', 'Hora de Comida'];

  const currentConfig = stateConfig[state];

  return (
    <div className="w-full h-full mx-auto flex flex-col items-center justify-center space-y-4 md:space-y-6 bg-background p-4 md:p-6">
      <DowntimeModal
        isOpen={isModalOpen}
        onRegister={handleRegisterDowntime}
        downtimeReasons={downtimeReasons}
      />
      
      <header className="w-full max-w-7xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Avery Production Pulse</h1>
        {state !== 'INACTIVE' && (
          <div className="flex items-center gap-4">
            <span className="text-xl font-medium text-muted-foreground">{currentConfig.subtext}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 bg-card text-card-foreground">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </header>
      
      <main className="w-full flex-grow grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-7xl">
        <div className="md:col-span-1 flex items-center justify-center">
          <StatusWidget
            status={currentConfig.status}
            subtext={state === 'INACTIVE' ? currentConfig.subtext : ''}
            color={currentConfig.color}
            textColor={currentConfig.textColor}
            Icon={currentConfig.Icon}
            isPulsing={currentConfig.isPulsing}
            onClick={state === 'INACTIVE' ? handleLogin : () => {}}
          />
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <KpiCard title="Etiquetas Producidas" value={kpis.finishedLabels.toLocaleString()} />
            <KpiCard title="Etiquetas por Minuto" value={kpis.labelsPerMinute.toLocaleString()} />
          </div>
          <DowntimeChart data={downtimeData} />
        </div>
      </main>
      
      <footer className="w-full max-w-7xl h-24">
         {state === 'LOGGED_IN' && (
            <Button 
                onClick={handleStartProduction}
                className="w-full h-full text-4xl font-bold bg-status-green hover:bg-status-green/90 text-white shadow-lg"
            >
                <PlayCircle className="mr-4 h-12 w-12" />
                Iniciar Producción
            </Button>
         )}
         {state === 'RUNNING' && (
            <Button 
                onClick={handleStopProduction}
                variant="destructive"
                className="w-full h-full text-4xl font-bold shadow-lg"
            >
                <Square className="mr-4 h-12 w-12" />
                Detener Producción
            </Button>
         )}
         {state === 'AWAITING_CONFIRMATION' && (
            <Button
              onClick={handleEndDowntimeConfirmation}
              className="w-full h-full text-4xl font-bold bg-status-yellow hover:bg-status-yellow/90 text-foreground shadow-lg"
            >
              <CheckCircle2 className="mr-4 h-12 w-12" />
              Confirmar Fin de Paro
            </Button>
         )}
      </footer>
    </div>
  );
}

    