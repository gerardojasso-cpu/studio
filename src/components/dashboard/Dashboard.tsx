"use client";

import { useState, useEffect } from "react";
import mqtt, { MqttClient } from "mqtt";
import { 
  CheckCircle2, 
  AlertTriangle, 
  PlayCircle, 
  PowerOff,
  BarChart,
  History,
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

interface Operator {
  name: string;
  shift: string;
  department: string;
}

const stateConfig = {
  INACTIVE: {
    statusText: "Inactiva",
    statusColor: "bg-status-gray",
    statusIcon: PowerOff,
    mainText: "Dashboard de Producción - Pase su tarjeta para iniciar sesión",
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
    mainText: "Técnico trabajando en la máquina. Pase su tarjeta para finalizar.",
    isPulsing: false,
    nextState: 'PENDING_OPERATOR_CONFIRMATION',
  },
  PENDING_OPERATOR_CONFIRMATION: {
    statusText: "Solucionado, Pendiente de Operador",
    statusColor: "bg-status-blue",
    statusIcon: CheckCircle2,
    mainText: "Técnico ha finalizado. Pase su tarjeta para confirmar",
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

// Usamos un broker MQTT público para la demostración.
// En un entorno real, deberías usar tu propio broker.
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const LOGIN_TOPIC = 'avery/station1/login';
const STATUS_TOPIC = 'avery/station1/status';
const INTERLOCK_TOPIC = 'avery/station1/interlock';
const MACHINE_STATE_TOPIC = 'avery/station1/machine_state';
const FAULT_REPORT_TOPIC = 'avery/station1/fault_report';


export function Dashboard() {
  const [state, setState] = useState<MachineState>('INACTIVE');
  const [operator, setOperator] = useState<Operator | null>(null);
  const [kpis, setKpis] = useState({
    processedRolls: 9,
    efficiency: 85.8,
    totalDowntime: 4.5,
    scrapLabels: 12,
    badLabelsPercentage: 3,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downtimeData, setDowntimeData] = useState(initialDowntimeData);
  const [downtimeStartTime, setDowntimeStartTime] = useState<number | null>(null);
  const [awaitingDepartment, setAwaitingDepartment] = useState<DowntimeCategory | null>(null);
  const [client, setClient] = useState<MqttClient | null>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER_URL);
    setClient(mqttClient);

    mqttClient.on('connect', () => {
      console.log('Conectado al broker MQTT');
      mqttClient.subscribe([LOGIN_TOPIC, MACHINE_STATE_TOPIC], (err) => {
        if (!err) {
          console.log(`Suscrito exitosamente a ${LOGIN_TOPIC} y ${MACHINE_STATE_TOPIC}`);
        } else {
          console.error('Error en la suscripción:', err);
        }
      });
    });

    mqttClient.on('error', (err) => {
      console.error('Error de conexión MQTT:', err);
      mqttClient.end();
    });

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  useEffect(() => {
    if (!client) return;

    const handleMessage = (topic: string, message: Buffer) => {
        console.log(`Mensaje recibido en ${topic}:`, message.toString());
        if (topic === LOGIN_TOPIC) {
          try {
            const data = JSON.parse(message.toString());
            if (data && data.name && data.shift && data.department) {
               if (state === 'INACTIVE') {
                 handleInitialLogin(data);
               } else if (state === 'PENDING_OPERATOR_CONFIRMATION') {
                 handleConfirmationLogin(data);
               } else if (state === 'AWAITING_SUPPORT' && data.department === awaitingDepartment) {
                 setState('REPAIR_IN_PROGRESS');
                 toast({ title: "Técnico ha llegado", description: `Técnico: ${data.name} de ${data.department}.` });
              } else if (state === 'REPAIR_IN_PROGRESS' && data.department === 'Mantenimiento') {
                  setState('PENDING_OPERATOR_CONFIRMATION');
                  toast({ title: "Reparación Finalizada", description: `Pendiente de confirmación del operador. Técnico: ${data.name}` });
              }
            } else {
               console.warn("Mensaje de login recibido con formato incorrecto.");
            }
          } catch (error) {
            console.error("Error al parsear el mensaje JSON:", error);
          }
        } else if (topic === MACHINE_STATE_TOPIC) {
            try {
                const data = JSON.parse(message.toString());
                if(data.status === 'running' && (state === 'LOGGED_IN' || state === 'STOPPED')) {
                    setState('RUNNING');
                    setDowntimeStartTime(null);
                    toast({ title: "Producción Iniciada", description: "La máquina ha comenzado a funcionar." });
                } else if (data.status === 'stopped' && state === 'RUNNING') {
                    setState('STOPPED');
                    setDowntimeStartTime(Date.now());
                    setTimeout(() => setIsModalOpen(true), 500);
                }
            } catch(error) {
                console.error("Error al parsear el mensaje de estado de la máquina:", error);
            }
        }
    };
    
    client.on('message', handleMessage);

    return () => {
        client.off('message', handleMessage);
    };

  }, [client, state, awaitingDepartment]);


  useEffect(() => {
    if (client && client.connected) {
      const message = {
        state: state,
        statusText: stateConfig[state].statusText,
        timestamp: new Date().toISOString(),
      };
      client.publish(STATUS_TOPIC, JSON.stringify(message), (err) => {
        if (err) {
          console.error('Error al publicar estado:', err);
        } else {
          console.log(`Estado '${state}' publicado en ${STATUS_TOPIC}`);
        }
      });

      const interlockValue = (state === 'LOGGED_IN' || state === 'REPAIR_IN_PROGRESS') ? '1' : '0';
      client.publish(INTERLOCK_TOPIC, interlockValue, (err) => {
        if (err) {
          console.error('Error al publicar interlock:', err);
        } else {
          console.log(`Interlock '${interlockValue}' publicado en ${INTERLOCK_TOPIC}`);
        }
      });
    }
  }, [state, client]);


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

  useEffect(() => {
    let simulationInterval: NodeJS.Timeout | undefined;

    if (state === 'RUNNING') {
      simulationInterval = setInterval(() => {
        setKpis(prevKpis => ({
          ...prevKpis,
          processedRolls: prevKpis.processedRolls + 1,
          efficiency: parseFloat((85 + Math.random() * 2 - 1).toFixed(1)),
          scrapLabels: prevKpis.scrapLabels + (Math.random() > 0.8 ? 1 : 0),
          badLabelsPercentage: parseFloat(Math.max(0, (prevKpis.badLabelsPercentage + (Math.random() * 0.2 - 0.1))).toFixed(1)),
        }));
      }, 3000); // Update every 3 seconds
    } else {
       if (downtimeStartTime) {
         // This can be improved to update every second
         setKpis(prevKpis => ({...prevKpis, totalDowntime: prevKpis.totalDowntime + 0.05})); // Add 3s every 3s
       }
    }

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [state, downtimeStartTime]);

  const handleInitialLogin = (userData: Operator) => {
    setOperator(userData);
    toast({ title: "Inicio de sesión exitoso", description: `${userData.department}: ${userData.name}` });
    if (userData.department === 'Mantenimiento') {
      setState('REPAIR_IN_PROGRESS');
    } else { // Assume "Produccion" or other operator roles
      setState('LOGGED_IN');
    }
  };

  const handleConfirmationLogin = (operatorData: Operator) => {
      if (state === 'PENDING_OPERATOR_CONFIRMATION') {
        if (operatorData.department !== 'Mantenimiento') {
            setState('LOGGED_IN');
            setDowntimeStartTime(null);
            toast({ title: "Fin de Paro Confirmado", description: "La máquina está lista para reiniciar producción." });
        } else {
            toast({ 
                title: "Confirmación Inválida", 
                description: "Se requiere la confirmación de un operador, no del técnico.",
                variant: "destructive"
            });
        }
    }
  };

  const handleRegisterDowntime = (reason: DowntimeReason, category: DowntimeCategory) => {
    if (downtimeStartTime) {
      const duration = (Date.now() - downtimeStartTime) / 1000 / 60; // in minutes
      
      setKpis(prevKpis => ({...prevKpis, totalDowntime: prevKpis.totalDowntime + duration}));

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

    if (category === 'Operación') {
        setState('LOGGED_IN');
        setDowntimeStartTime(null);
        toast({ title: "Paro de Operador Registrado", description: `Motivo: ${reason}. La máquina sigue lista.` });
    } else {
        if (client && client.connected) {
            const message = {
                reported_to: category,
                timestamp: new Date().toISOString()
            };
            client.publish(FAULT_REPORT_TOPIC, JSON.stringify(message), (err) => {
                if (err) {
                    console.error('Error al publicar el reporte de falla:', err);
                    toast({ title: "Error de Notificación", description: `No se pudo notificar a ${category}.`, variant: "destructive" });
                } else {
                    console.log(`Reporte de falla para '${category}' publicado en ${FAULT_REPORT_TOPIC}`);
                    toast({ title: "Paro Registrado y Notificado", description: `Motivo: ${reason}. Se ha notificado a ${category}.` });
                }
            });
        }
        setAwaitingDepartment(category);
        setState('AWAITING_SUPPORT');
    }
  };
    
  const handleLogout = () => {
    setState('INACTIVE');
    setOperator(null);
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
          {state !== 'INACTIVE' && operator && (
            <>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="font-semibold">{operator.department}: {operator.name}</p>
                <p className="text-xs text-gray-400">Turno {operator.shift}</p>
              </div>
            </div>
            </>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex flex-col flex-grow items-center justify-center text-center p-4">
                <div className="w-full max-w-sm aspect-square flex items-center justify-center">
                    <div className={cn(
                        "flex flex-col h-full w-full items-center justify-center rounded-full transition-colors", 
                        currentConfig.statusColor,
                        currentConfig.isPulsing && 'soft-pulse'
                    )}>
                        <currentConfig.statusIcon className="h-[45%] w-[45%] text-white" />
                        <p className="font-bold text-4xl text-white mt-2 text-center">{currentConfig.statusText}</p>
                    </div>
                </div>
                <p className="font-semibold text-lg tracking-widest uppercase mt-4 text-center">{currentConfig.mainText}</p>
            </div>
            
            { state !== 'INACTIVE' &&
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-card-foreground/80">
                  <PlayCircle className="h-5 w-5" />
                  Control de Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted text-foreground p-4 rounded-lg">
                  <p className="font-bold text-lg">
                    {state === 'RUNNING' ? 'Máquina En Funcionamiento' : 'Máquina Detenida'}
                  </p>
                  <p className="text-sm text-card-foreground/80">
                    {state === 'RUNNING' ? 'Producción activa en curso' : 'Esperando acción del operador o de la máquina'}
                  </p>
                </div>
                
                <div className="flex justify-between text-sm pt-4">
                  <span className="font-semibold">Seguridad:</span>
                  <span className="flex items-center gap-1 font-semibold text-status-green">
                    <CheckCircle2 className="h-4 w-4" /> Sistemas OK
                  </span>
                </div>
              </CardContent>
            </Card>
            }
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-1 space-y-6">
            <KpiCard
              title="Producción del Turno"
              value={kpis.processedRolls.toLocaleString()}
              description="Total de rollos procesados"
              icon={Package}
              change="+12%"
              changeType="positive"
            />
            <KpiCard
              title="Eficiencia (Rendimiento General)"
              value={`${kpis.efficiency}%`}
              description="Producción vs. tiempo total"
              icon={TrendingUp}
              change="+3%"
              changeType="positive"
            />
            <KpiCard
              title="Tiempo de Paro Total"
              value={`${kpis.totalDowntime.toFixed(1)} min`}
              description="Tiempo acumulado detenido"
              icon={Timer}
              change="+8%"
              changeType="negative"
            />
             <KpiCard
              title="Etiquetas de Sacrificio Usadas"
              value={kpis.scrapLabels.toLocaleString()}
              description="Correcciones de calidad aplicadas"
              icon={Archive}
              change="+2"
              changeType="neutral"
            />
            <KpiCard
              title="Porcentaje de Etiquetas Malas"
              value={`${kpis.badLabelsPercentage}%`}
              description="Detectadas por el sistema"
              icon={BadgePercent}
              change="-0.1%"
              changeType="positive"
            />
          </div>


          {/* Columna Derecha */}
          <div className="lg:col-span-1 space-y-6">
             <DowntimeChart data={downtimeData} />
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
        </div>
      </main>
      
      { state !== 'INACTIVE' &&
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
      }
    </>
  );
}

    

    

    

    