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
import { AlertTriangle, Wrench, Package, Search, User, ArrowLeft } from 'lucide-react';

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

export type Category = 'Mantenimiento' | 'Calidad' | 'Suministros' | 'Operación';

interface DowntimeModalProps {
  isOpen: boolean;
  onRegister: (reason: DowntimeReason, category: Category) => void;
  onClose: () => void;
}

const reasonCategories: Record<Category, DowntimeReason[]> = {
  'Mantenimiento': ['Problema Mecánico', 'Problema Eléctrico', 'Mantenimiento Preventivo', 'Falla de Neumática/Hidráulica'],
  'Calidad': ['Falla en la Etiqueta', 'Ajuste de Calidad', 'Inspección'],
  'Suministros': ['Falta de Rollo de Producción', 'Falta de Rollo de Sacrificio', 'Problema con el Material'],
  'Operación': ['Limpieza', 'Descanso de Operador', 'Ajuste de la Máquina', 'Fin de Turno', 'Hora de Comida'],
};

const categoryIcons: Record<Category, React.ElementType> = {
    'Mantenimiento': Wrench,
    'Suministros': Package,
    'Calidad': Search,
    'Operación': User,
}

export function DowntimeModal({ isOpen, onRegister, onClose }: DowntimeModalProps) {
  const [selectionStep, setSelectionStep] = useState<'category' | 'reason'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectionStep('reason');
  };

  const handleReasonSelect = (reason: DowntimeReason) => {
    if (selectedCategory) {
      onRegister(reason, selectedCategory);
      resetModal();
    }
  };
  
  const resetModal = () => {
    setSelectionStep('category');
    setSelectedCategory(null);
  };

  const handleBack = () => {
    setSelectionStep('category');
    setSelectedCategory(null);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Do not close if a reason is not selected.
      // The modal should only be closed programatically after a reason is registered
      // or by an explicit cancel action if we add one.
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border text-card-foreground p-8" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center flex-col text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <DialogTitle className="text-4xl font-bold">Registrar Motivo de Paro</DialogTitle>
             <DialogDescription className="mt-4 text-xl text-muted-foreground">
              {selectionStep === 'category'
                ? 'Seleccione el departamento responsable para notificar al equipo correcto.'
                : `Seleccione la causa específica para: ${selectedCategory}`}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="py-8 min-h-[250px]">
          {selectionStep === 'category' && (
            <div className="grid grid-cols-2 gap-6">
              {(Object.keys(reasonCategories) as Category[]).map(category => {
                const Icon = categoryIcons[category];
                return (
                  <Button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="h-32 text-2xl font-bold flex flex-col gap-2"
                    variant="outline"
                  >
                    <Icon className="h-10 w-10" />
                    {category}
                  </Button>
                )
              })}
            </div>
          )}

          {selectionStep === 'reason' && selectedCategory && (
            <div className="grid grid-cols-2 gap-4">
              {reasonCategories[selectedCategory].map(reason => (
                <Button
                  key={reason}
                  onClick={() => handleReasonSelect(reason)}
                  className="h-20 text-xl"
                  variant="outline"
                >
                  {reason}
                </Button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          {selectionStep === 'reason' && (
            <Button
              type="button"
              onClick={handleBack}
              className="absolute top-8 left-8 h-12 text-lg"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Atrás
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
