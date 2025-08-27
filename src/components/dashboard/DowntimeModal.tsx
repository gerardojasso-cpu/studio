"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { AlertTriangle } from 'lucide-react';

export type DowntimeReason = 
  // Mantenimiento
  'Problema Mecánico' | 
  'Problema Eléctrico' | 
  'Mantenimiento Preventivo' | 
  'Falla de Neumática/Hidráulica' |
  // Calidad
  'Falla en la Etiqueta' |
  'Ajuste de Calidad' |
  'Inspección' |
  // Suministros
  'Falta de Rollo de Producción' |
  'Falta de Rollo de Sacrificio' |
  'Problema con el Material' |
  // Operación
  'Limpieza' |
  'Descanso de Operador' |
  'Ajuste de la Máquina' |
  'Fin de Turno' | 
  'Hora de Comida';

interface DowntimeModalProps {
  isOpen: boolean;
  onRegister: (reason: DowntimeReason) => void;
  downtimeReasons: DowntimeReason[];
}

export function DowntimeModal({ isOpen, onRegister }: DowntimeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DowntimeReason | null>(null);

  const handleRegisterClick = () => {
    if (selectedReason) {
      onRegister(selectedReason);
      setSelectedReason(null);
    }
  };

  const maintenanceReasons: DowntimeReason[] = ['Problema Mecánico', 'Problema Eléctrico', 'Mantenimiento Preventivo', 'Falla de Neumática/Hidráulica'];
  const qualityReasons: DowntimeReason[] = ['Falla en la Etiqueta', 'Ajuste de Calidad', 'Inspección'];
  const supplyReasons: DowntimeReason[] = ['Falta de Rollo de Producción', 'Falta de Rollo de Sacrificio', 'Problema con el Material'];
  const operationReasons: DowntimeReason[] = ['Limpieza', 'Descanso de Operador', 'Ajuste de la Máquina', 'Fin de Turno', 'Hora de Comida'];


  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-2xl bg-card border-border text-card-foreground p-8" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center flex-col text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <DialogTitle className="text-4xl font-bold">Registrar Motivo de Paro</DialogTitle>
            <DialogDescription className="mt-4 text-xl text-muted-foreground">
              Seleccione la causa del paro para notificar al equipo correspondiente. La máquina no podrá reiniciarse hasta que se registre el motivo.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-8">
          <Select onValueChange={(value: DowntimeReason) => setSelectedReason(value)}>
            <SelectTrigger className="w-full h-16 text-2xl bg-input border-border focus:ring-ring">
              <SelectValue placeholder="Seleccionar un motivo..." />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-lg">Mantenimiento</SelectLabel>
                  {maintenanceReasons.map(reason => <SelectItem key={reason} value={reason} className="text-2xl py-3">{reason}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-lg">Calidad</SelectLabel>
                  {qualityReasons.map(reason => <SelectItem key={reason} value={reason} className="text-2xl py-3">{reason}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-lg">Suministros</SelectLabel>
                  {supplyReasons.map(reason => <SelectItem key={reason} value={reason} className="text-2xl py-3">{reason}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-lg">Operación</SelectLabel>
                  {operationReasons.map(reason => <SelectItem key={reason} value={reason} className="text-2xl py-3">{reason}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleRegisterClick}
            disabled={!selectedReason}
            className="w-full h-16 text-2xl font-bold"
          >
            Registrar Paro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    