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

export type DowntimeReason = 'Falta de Material' | 'Mantenimiento' | 'Eléctrico' | 'Calidad' | 'Ajuste';
const downtimeReasons: DowntimeReason[] = ['Falta de Material', 'Mantenimiento', 'Eléctrico', 'Calidad', 'Ajuste'];

interface DowntimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (reason: DowntimeReason) => void;
}

export function DowntimeModal({ isOpen, onClose, onRegister }: DowntimeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DowntimeReason | null>(null);

  const handleRegisterClick = () => {
    if (selectedReason) {
      onRegister(selectedReason);
      setSelectedReason(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground">
        <DialogHeader>
          <div className="flex items-center justify-center flex-col text-center">
            <div className="bg-destructive/10 p-3 rounded-full mb-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-bold">Registrar Motivo de Paro</DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              Seleccione la causa del paro para notificar al equipo correspondiente.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={(value: DowntimeReason) => setSelectedReason(value)}>
            <SelectTrigger className="w-full h-12 text-lg bg-input border-border focus:ring-ring">
              <SelectValue placeholder="Seleccionar un motivo..." />
            </SelectTrigger>
            <SelectContent>
              {downtimeReasons.map(reason => (
                <SelectItem key={reason} value={reason} className="text-lg">
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
            className="w-full h-12 text-lg font-bold"
            variant="destructive"
          >
            Registrar Paro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
