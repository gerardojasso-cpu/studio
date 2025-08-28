"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  PlayCircle, 
  PowerOff,
  BarChart,
  History,
  Zap,
  Clock,
  TrendingUp,
  Square,
  Wrench,
  Package,
  Timer,
  Archive,
  BadgePercent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DowntimeModal, type DowntimeReason, type Category as DowntimeCategory } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "./KpiCard";
import { DowntimeChart } from "./DowntimeChart";
import { cn } from "@/lib/utils";

type MachineState = 'INACTIVE' | 'LOGGED_IN' | 'RUNNING' | 'STOPPED' | 'AWAITING_SUPPORT' | 'REPAIR_IN_PROGRESS' | 'PENDING_OPERATOR_CONFIRMATION';

const stateConfig = {
  INACTIVE: {
    statusText: "Inactiva",
    statusColor: "bg-status-gray",
    statusIcon: PowerOff,
    mainText: "Pase su tarjeta para iniciar sesión",
    isPulsing: false,
    nextState: 'LOGGED_IN',
  },
  LOGGED_IN: {
    statusText: "Máquina Lista",
    statusColor: "bg-status-green",
    statusIcon: PlayCircle,
    mainText: "Sistema preparado para iniciar producción",
    isPulsing: true,
    nextState: 'RUNNING',
  },
  RUNNING: {
    statusText: "Funcionando",
    statusColor: "bg-status-green",
    statusIcon: Zap,
    mainText: "Producción Activa",
    isPulsing: false,
    nextState: 'STOPPED',
  },
  STOPPED: {
    statusText: "Parada",
    statusColor: "bg-primary",
    statusIcon: AlertTriangle,
    mainText: "Registro de Paro Requerido",
    isPulsing: true,
    nextState: 'AWAITING_SUPPORT',
  },
  AWAITING_SUPPORT: {
    statusText: "Esperando Soporte",
    statusColor: "bg-status-orange",
    statusIcon: Clock,
    mainText: "Esperando respuesta del equipo de soporte.",
    isPulsing: true,
    nextState: 'REPAIR_IN_PROGRESS',
  },
  REPAIR_IN_PROGRESS: {
    statusText: "Reparación en Curso",
    statusColor: "bg-status-yellow",
    statusIcon: Wrench,
    mainText: "Técnico trabajando en la máquina.",
    isPulsing: false,
    nextState: 'PENDING_OPERATOR_CONFIRMATION',
  },
  PENDING_OPERATOR_CONFIRMATION: {
    statusText: "Solucionado, Pendiente de Operador",
    statusColor: "bg-status-orange",
    statusIcon: CheckCircle2,
    mainText: "Técnico ha finalizado. Confirme para reiniciar.",
    isPulsing: true,
    nextState: 'LOGGED_IN',
  },
};

const initialDowntimeData = [
    { reason: "Mantenimiento", time: 3 },
    { reason: "Falta Material", time: 1.5 },
];

const operationReasons: DowntimeReason[] = ['Limpieza', 'Descanso de Operador', 'Ajuste de la Máquina', 'Fin de Turno', 'Hora de Comida'];

export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [kpis, setKpis] = useState({ 
    processedRolls: 25, 
    efficiency: 92, 
    sacrificeLabelsUsed: 12, 
    badLabelsPercentage: 2 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downtimeData, setDowntimeData] = useState(initialDowntimeData);
  const [downtimeStartTime, setDowntimeStartTime] = useState<number | null>(null);
  const [awaitingDepartment, setAwaitingDepartment] = useState<DowntimeCategory | null>(null);

  const { toast } = useToast();
  
  let currentConfig = stateConfig[state];

  // Dynamic mainText for AWAITING_SUPPORT state
  if (state === 'AWAITING_SUPPORT' && awaitingDepartment) {
    currentConfig = {
      ...currentConfig,
      statusText: `Esperando a ${awaitingDepartment}`,
      mainText: `Notificación enviada a ${awaitingDepartment}.`
    };
  }

  const totalDowntime = downtimeData.reduce((acc, curr) => acc + curr.time, 0);

  useEffect(() => {
    let simulationInterval: NodeJS.Timeout | undefined;

    if (state === 'RUNNING') {
      simulationInterval = setInterval(() => {
        setKpis(prevKpis => ({
          processedRolls: prevKpis.processedRolls + 1,
          efficiency: parseFloat((92 + Math.random() * 2 - 1).toFixed(1)),
          sacrificeLabelsUsed: prevKpis.sacrificeLabelsUsed + (Math.random() > 0.9 ? 1 : 0),
          badLabelsPercentage: parseFloat(Math.max(0, (prevKpis.badLabelsPercentage + (Math.random() * 0.2 - 0.1))).toFixed(1)),
        }));
      }, 3000); // Update every 3 seconds
    }

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [state]);


  const handleStateAction = () => {
    if (state === 'INACTIVE') {
      setState('LOGGED_IN');
      toast({ title: "Inicio de sesión exitoso", description: "Operador: Juan Pérez" });
    } else if (state === 'LOGGED_IN') {
      setState('RUNNING');
      setDowntimeStartTime(null);
      toast({ title: "Producción Iniciada", description: "La máquina ha comenzado a funcionar." });
    } else if (state === 'RUNNING') {
      setState('STOPPED');
      setDowntimeStartTime(Date.now());
      setTimeout(() => setIsModalOpen(true), 500);
    } else if (state === 'AWAITING_SUPPORT') {
        setState('REPAIR_IN_PROGRESS');
        toast({ title: "Técnico ha llegado", description: "Reparación en curso." });
    } else if (state === 'REPAIR_IN_PROGRESS') {
        setState('PENDING_OPERATOR_CONFIRMATION');
        toast({ title: "Reparación Finalizada", description: "Pendiente de confirmación del operador." });
    } else if (state === 'PENDING_OPERATOR_CONFIRMATION') {
        setState('LOGGED_IN');
        setDowntimeStartTime(null);
        toast({ title: "Fin de Paro Confirmado", description: "La máquina está lista para reiniciar producción." });
    }
  };

  const handleRegisterDowntime = (reason: DowntimeReason, category: DowntimeCategory) => {
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
      return;
    }
    
    if (category === 'Operación') {
        setDowntimeStartTime(null);
        toast({ title: `Paro por "${reason}" registrado.`, description: "La máquina está en pausa. Confirme para reiniciar." });
        setState('PENDING_OPERATOR_CONFIRMATION');
        return;
    }
    
    setAwaitingDepartment(category);
    setState('AWAITING_SUPPORT');
    toast({ title: "Paro Registrado", description: `Motivo: ${reason}. Se ha notificado a ${category}.` });
  };
    
  const handleLogout = () => {
    setState('INACTIVE');
    setDowntimeStartTime(null);
    setIsModalOpen(false);
    toast({ title: "Sesión Cerrada" });
  };

  return (
    <>
      <DowntimeModal
        isOpen={isModalOpen}
        onRegister={handleRegisterDowntime}
        onClose={() => setIsModalOpen(false)}
      />
      
      <header className="flex h-20 items-center justify-between bg-[#1f2937] px-6 text-white">
        <div>
          <h1 className="text-xl font-bold">Dashboard de Producción Avery Dennison</h1>
          <p className="text-sm text-gray-300">Línea de Etiquetas - Estación 01</p>
        </div>
        <div className="flex items-center gap-4">
          {state !== 'INACTIVE' && (
            <>
            <div className="text-right">
              <p className="font-semibold">Operador: Juan Pérez</p>
              <p className="text-xs text-gray-300">Turno 1 - 06:00 AM</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-gray-700">
                <PowerOff className="h-5 w-5" />
            </Button>
            </>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1">
            <Card className="mb-6 flex flex-col items-center justify-center text-center h-52 cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleStateAction}>
                <div className={cn(
                    "flex h-32 w-32 items-center justify-center rounded-full mb-4 transition-colors", 
                    currentConfig.statusColor,
                    currentConfig.isPulsing && 'soft-pulse'
                  )}>
                    <currentConfig.statusIcon className="h-24 w-24 text-white" />
                </div>
                <p className="font-semibold text-lg">{currentConfig.mainText}</p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-5 w-5" />
                  Control de Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-bold text-lg">{currentConfig.statusText}</p>
                  <p className="text-sm text-muted-foreground">{currentConfig.mainText}</p>
                </div>

                {state === 'LOGGED_IN' && (
                  <Button onClick={handleStateAction} className="w-full font-bold bg-status-green hover:bg-status-green/90">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Iniciar Producción
                  </Button>
                )}
                {state === 'RUNNING' && (
                  <Button onClick={handleStateAction} className="w-full font-bold bg-primary hover:bg-primary/90">
                    <Square className="mr-2 h-5 w-5" />
                    Detener Producción
                  </Button>
                )}
                {state === 'PENDING_OPERATOR_CONFIRMATION' && (
                  <Button onClick={handleStateAction} className="w-full font-bold bg-status-green hover:bg-status-green/90">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Fin de Paro
                  </Button>
                )}
                
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
          <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-6">
            <KpiCard
              title="Producción del Turno"
              value={kpis.processedRolls.toLocaleString()}
              description="Total de rollos procesados"
              progress={kpis.processedRolls / 100 * 100}
              icon={Package}
            />
            <KpiCard
              title="Eficiencia (Rendimiento)"
              value={`${kpis.efficiency}%`}
              description="Rendimiento general del turno"
              progress={kpis.efficiency}
              icon={TrendingUp}
            />
            <KpiCard
              title="Tiempo de Paro Total"
              value={`${totalDowntime} min`}
              description="Tiempo acumulado de paros"
              progress={(totalDowntime / 480) * 100} // Assuming 8-hour shift
              icon={Timer}
            />
            <KpiCard
              title="Etiquetas de Sacrificio"
              value={kpis.sacrificeLabelsUsed.toLocaleString()}
              description="Etiquetas usadas para corrección"
              progress={kpis.sacrificeLabelsUsed / 100 * 100}
              icon={Archive}
            />
            <div className="col-span-2">
              <KpiCard
                title="Porcentaje de Etiquetas Malas"
                value={`${kpis.badLabelsPercentage}%`}
                description="Etiquetas defectuosas detectadas"
                progress={kpis.badLabelsPercentage}
                icon={BadgePercent}
              />
            </div>
          </div>


          {/* Columna Derecha */}
          <div className="lg:col-span-1 space-y-6">
             <DowntimeChart data={downtimeData} />
          </div>
        </div>
      </main>
      
      <footer className="flex items-center justify-end gap-4 p-4 bg-white border-t">
        <Button variant="outline" className="font-bold">
            <BarChart className="mr-2 h-5 w-5" />
            Análisis de Paros
        </Button>
        <Button className="font-bold bg-gray-700 hover:bg-gray-800 text-white">
            <History className="mr-2 h-5 w-5" />
            Historial y Tendencias
        </Button>
      </footer>
    </>
  );
}
