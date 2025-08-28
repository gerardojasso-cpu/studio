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
  BadgePercent,
  Settings,
  User,
  Dot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DowntimeModal, type DowntimeReason, type Category as DowntimeCategory } from "./DowntimeModal";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "./KpiCard";
import { DowntimeChart } from "./DowntimeChart";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

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
    statusIcon: Settings,
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
    { name: "Mantenimiento", time: 3 },
    { name: "Falta Material", time: 1.5 },
];

const productionData = [
    { hour: "06:00", production: 450 },
    { hour: "07:00", production: 520 },
    { hour: "08:00", production: 510 },
    { hour: "09:00", production: 550 },
    { hour: "10:00", production: 200 },
    { hour: "11:00", production: 580 },
]

export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [kpis, setKpis] = useState({ 
    processedRolls: 9, 
    efficiency: 85.8,
    labelsPerHour: 520,
    badLabelsPercentage: 3 
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
  } else if (state === 'RUNNING') {
     currentConfig = {
      ...currentConfig,
      mainText: `PRODUCCIÓN ACTIVA`,
    };
  }

  const totalDowntime = downtimeData.reduce((acc, curr) => acc + curr.time, 0);

  useEffect(() => {
    let simulationInterval: NodeJS.Timeout | undefined;

    if (state === 'RUNNING') {
      simulationInterval = setInterval(() => {
        setKpis(prevKpis => ({
          ...prevKpis,
          processedRolls: prevKpis.processedRolls + 1,
          efficiency: parseFloat((85 + Math.random() * 2 - 1).toFixed(1)),
          labelsPerHour: 520 + Math.floor(Math.random() * 20 - 10),
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
        const existingReasonIndex = prevData.findIndex(item => item.name === reason);
        if (existingReasonIndex > -1) {
          const newData = [...prevData];
          newData[existingReasonIndex] = { ...newData[existingReasonIndex], time: newData[existingReasonIndex].time + duration };
          return newData;
        }
        return [...prevData, { name: reason, time: duration }];
      });
    }
    
    setIsModalOpen(false);

    if (reason === 'Fin de Turno') {
      setState('INACTIVE');
      toast({ title: "Fin de turno registrado", description: "Sesión cerrada." });
      return;
    }
    
    if (category === 'Operación') {
        toast({ title: `Paro por "${reason}" registrado.`, description: "La máquina está en pausa. Presione 'Iniciar Producción' para continuar." });
        setState('LOGGED_IN');
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
      
      <header className="flex h-20 items-center justify-between bg-[#111827] px-6 text-white">
        <div>
          <h1 className="text-xl font-bold">Dashboard de Producción</h1>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            Línea de Etiquetas - Estación 01
            <span className="flex items-center gap-1 text-status-green">
              <Dot size={24} className="-ml-1" /> Sistema Conectado
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {state !== 'INACTIVE' && (
            <>
            <div className="text-right flex items-center gap-3">
              <User className="h-5 w-5"/>
              <div>
                <p className="font-semibold">Operador: Juan Pérez</p>
                <p className="text-xs text-gray-400">Turno 1 - 06:00 AM</p>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-300"/>
            </>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 space-y-6">
             <div className="flex flex-col items-center justify-center text-center h-52 cursor-pointer" onClick={handleStateAction}>
                <div className={cn(
                    "flex flex-col h-48 w-48 items-center justify-center rounded-full mb-4 transition-colors", 
                    currentConfig.statusColor,
                    currentConfig.isPulsing && 'soft-pulse'
                  )}>
                    <currentConfig.statusIcon className="h-20 w-20 text-white" />
                    <p className="font-bold text-2xl text-white mt-2">{currentConfig.statusText}</p>
                </div>
                <p className="font-semibold text-lg tracking-widest uppercase">{currentConfig.mainText}</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                  <PlayCircle className="h-5 w-5" />
                  Control de Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-status-green/10 text-status-green p-4 rounded-lg">
                  <p className="font-bold text-lg">Máquina En Funcionamiento</p>
                  <p className="text-sm">Producción activa en curso</p>
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
                    Detener Máquina
                  </Button>
                )}
                {state === 'PENDING_OPERATOR_CONFIRMATION' && (
                  <Button onClick={handleStateAction} className="w-full font-bold bg-status-green hover:bg-status-green/90">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Fin de Paro
                  </Button>
                )}
                
                <div className="flex justify-between text-sm pt-4">
                  <span className="font-semibold">Seguridad:</span>
                  <span className="flex items-center gap-1 font-semibold text-status-green">
                    <CheckCircle2 className="h-4 w-4" /> Sistemas OK
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-1 space-y-6">
            <KpiCard
              title="Etiquetas Producidas"
              value={kpis.processedRolls.toLocaleString()}
              description="Total del turno actual"
              progress={kpis.processedRolls / 100 * 100}
              icon={Package}
              change="+12%"
            />
            <KpiCard
              title="Etiquetas por Hora"
              value={kpis.labelsPerHour.toLocaleString()}
              description="Velocidad actual"
              progress={kpis.labelsPerHour / 1000 * 100}
              icon={Clock}
              change="+8%"
            />
            <KpiCard
              title="Eficiencia"
              value={`${kpis.efficiency}%`}
              description="Rendimiento general"
              progress={kpis.efficiency}
              icon={TrendingUp}
              change="+3%"
            />
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Producción por Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="min-h-[150px] w-full">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={productionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="hour" className="text-xs"/>
                      <YAxis className="text-xs" domain={[0, 600]}/>
                      <Line type="monotone" dataKey="production" stroke="hsl(var(--status-green))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--status-green))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>


          {/* Columna Derecha */}
          <div className="lg:col-span-1 space-y-6">
             <DowntimeChart data={downtimeData} />
          </div>
        </div>
      </main>
      
      <footer className="flex items-center justify-end gap-4 p-4 bg-background border-t">
        <Button variant="destructive" className="font-bold">
            <BarChart className="mr-2 h-5 w-5" />
            Análisis de Paros
        </Button>
        <Button className="font-bold bg-status-blue hover:bg-status-blue/90 text-white">
            <History className="mr-2 h-5 w-5" />
            Historial y Tendencias
        </Button>
      </footer>
    </>
  );
}
