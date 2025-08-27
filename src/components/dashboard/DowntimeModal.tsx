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
} from "@/components/ui/select";
import { AlertTriangle } from 'lucide-react';

export type DowntimeReason = 'Falta de Material' | 'Mantenimiento' | 'Mecánico' | 'Eléctrico' | 'Calidad' | 'Ajuste' | 'Fin de Turno' | 'Hora de Comida';

interface DowntimeModalProps {
  isOpen: boolean;
  onRegister: (reason: DowntimeReason) => void;
  downtimeReasons: DowntimeReason[];
}

export function DowntimeModal({ isOpen, onRegister, downtimeReasons }: DowntimeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DowntimeReason | null>(null);

  const handleRegisterClick = () => {
    if (selectedReason) {
      onRegister(selectedReason);
      setSelectedReason(null);
    }
  };

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
              Seleccione la causa del paro para notificar al equipo correspondiente.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-8">
          <Select onValueChange={(value: DowntimeReason) => setSelectedReason(value)}>
            <SelectTrigger className="w-full h-16 text-2xl bg-input border-border focus:ring-ring">
              <SelectValue placeholder="Seleccionar un motivo..." />
            </SelectTrigger>
            <SelectContent>
              {downtimeReasons.map(reason => (
                <SelectItem key={reason} value={reason} className="text-2xl py-3">
                  {reason}
                </SelectItem>
              ))}
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

    