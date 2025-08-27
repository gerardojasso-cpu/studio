"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  PlayCircle, 
  User, 
  Power, 
  Wrench,
  BarChart,
  History,
  Zap,
  PowerOff,
  Clock,
  TrendingUp,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DowntimeModal, type DowntimeReason } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "./KpiCard";
import { DowntimeChart } from "./DowntimeChart";

type MachineState = 'INACTIVE' | 'LOGGED_IN' | 'RUNNING' | 'STOPPED' | 'AWAITING_CONFIRMATION';

const stateConfig = {
  INACTIVE: {
    statusText: "Sistema Inactivo",
    statusColor: "bg-status-gray",
    buttonText: "Iniciar Sesión",
    Icon: PowerOff,
    action: 'login'
  },
  LOGGED_IN: {
    statusText: "Máquina Lista",
    statusColor: "bg-status-blue",
    buttonText: "Iniciar Producción",
    Icon: PlayCircle,
    action: 'start_production'
  },
  RUNNING: {
    statusText: "Producción Activa",
    statusColor: "bg-status-green",
    buttonText: "Detener Producción",
    Icon: Square,
    action: 'stop_production'
  },
  STOPPED: {
    statusText: "Máquina Parada",
    statusColor: "bg-destructive",
    buttonText: "Registrar Paro",
    Icon: AlertTriangle,
    action: 'open_modal'
  },
  AWAITING_CONFIRMATION: {
    statusText: "Paro Registrado",
    statusColor: "bg-status-orange",
    buttonText: "Confirmar Fin de Paro",
    Icon: CheckCircle2,
    action: 'end_downtime'
  },
};

const initialDowntimeData = [
    { reason: "Mantenimiento", time: 3 },
    { reason: "Falta Material", time: 1.5 },
];

export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [kpis, setKpis] = useState({ finishedLabels: 0, labelsPerHour: 0, efficiency: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downtimeData, setDowntimeData] = useState(initialDowntimeData);
  const [downtimeStartTime, setDowntimeStartTime] = useState<number | null>(null);

  const { toast } = useToast();
  
  const currentConfig = stateConfig[state];

  const handleStateAction = () => {
    switch (currentConfig.action) {
      case 'login':
        setState('LOGGED_IN');
        toast({ title: "Inicio de sesión exitoso", description: "Operador: Juan Pérez" });
        break;
      case 'start_production':
        setState('RUNNING');
        setDowntimeStartTime(null);
        toast({ title: "Producción Iniciada", description: "La máquina ha comenzado a funcionar." });
        break;
      case 'stop_production':
        setState('STOPPED');
        setDowntimeStartTime(Date.now());
        setTimeout(() => setIsModalOpen(true), 500);
        break;
      case 'end_downtime':
        setState('LOGGED_IN');
        setDowntimeStartTime(null);
        toast({ title: "Fin de Paro Confirmado", description: "La máquina está lista para reiniciar producción." });
        break;
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
        return [...prevData, { reason, time: duration }];
      });
    }
    
    setIsModalOpen(false);

    if (reason === 'Fin de Turno') {
      setState('INACTIVE');
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
    toast({ title: "Sesión Cerrada" });
  };
  
  const downtimeReasons: DowntimeReason[] = ['Falta de Material', 'Mantenimiento', 'Mecánico', 'Eléctrico', 'Calidad', 'Ajuste', 'Fin de Turno', 'Hora de Comida'];

  return (
    <>
      <DowntimeModal
        isOpen={isModalOpen}
        onRegister={handleRegisterDowntime}
        downtimeReasons={downtimeReasons}
      />
      
      <header className="flex h-20 items-center justify-between bg-[#1f2937] px-6 text-white">
        <div>
          <h1 className="text-xl font-bold">Dashboard de Producción</h1>
          <p className="text-sm text-gray-300">Línea de Etiquetas - Estación 01</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">Operador: Juan Pérez</p>
            <p className="text-xs text-gray-300">Turno 1 - 06:00 AM</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-gray-700">
            <PowerOff className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1">
            <Card className="mb-6 flex flex-col items-center justify-center text-center h-52">
                <div className={`flex h-24 w-24 items-center justify-center rounded-full ${currentConfig.statusColor} mb-4`}>
                    <Zap className="h-12 w-12 text-white" />
                </div>
                <p className="font-semibold text-lg">SISTEMA PREPARADO</p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Power className="h-5 w-5" />
                  Control de Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-bold text-lg">{currentConfig.statusText}</p>
                  <p className="text-sm text-muted-foreground">Sistema preparado para iniciar producción</p>
                </div>
                <Button 
                  onClick={handleStateAction}
                  className={`w-full font-bold ${currentConfig.action === 'start_production' ? 'bg-status-green hover:bg-status-green/90' : ''}`}
                >
                  <currentConfig.Icon className="mr-2 h-5 w-5" />
                  {currentConfig.buttonText}
                </Button>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Seguridad:</span>
                  <span className="flex items-center gap-1 font-semibold text-status-green">
                    <CheckCircle2 className="h-4 w-4" /> Sistemas OK
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KpiCard 
                  title="Etiquetas Producidas"
                  value={kpis.finishedLabels.toLocaleString()}
                  description="Total del turno actual"
                  progress={12}
                  icon={Zap}
                />
                <KpiCard 
                  title="Etiquetas por Hora"
                  value={kpis.labelsPerHour.toLocaleString()}
                  description="Velocidad actual"
                  progress={8}
                  icon={Clock}
                />
             </div>
             <KpiCard 
                title="Eficiencia"
                value={`${kpis.efficiency}%`}
                description="Rendimiento general"
                progress={3}
                icon={TrendingUp}
              />
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                  <CardTitle>Estado de Máquina</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for Donut Chart */}
                  <div className="h-40 w-full bg-gray-200 rounded-md flex items-center justify-center">
                    <p>Donut Chart</p>
                  </div>
                </CardContent>
             </Card>
             <DowntimeChart data={downtimeData} />
          </div>
        </div>
      </main>
      
      <footer className="flex items-center justify-end gap-4 p-6 bg-white border-t">
        <Button variant="destructive" className="font-bold">
            <BarChart className="mr-2 h-5 w-5" />
            Análisis de Paros
        </Button>
        <Button className="font-bold bg-status-blue hover:bg-status-blue/90">
            <History className="mr-2 h-5 w-5" />
            Historial y Tendencias
        </Button>
      </footer>
    </>
  );
}
