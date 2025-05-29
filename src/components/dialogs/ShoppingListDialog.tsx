
// src/components/dialogs/ShoppingListDialog.tsx
"use client";

import React from "react";
import type { GenerateShoppingListOutput } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShoppingCart, ClipboardCopy } from "lucide-react";

interface ShoppingListDialogProps {
  shoppingListOutput: GenerateShoppingListOutput | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingListDialog({ shoppingListOutput, isLoading, error, isOpen, onClose }: ShoppingListDialogProps) {
  const { toast } = useToast();

  const copyShoppingListToClipboard = () => {
    if (!shoppingListOutput || shoppingListOutput.shoppingList.length === 0) return;

    let textToCopy = `Liste de Courses pour : ${shoppingListOutput.recipeName}\n\n`;
    shoppingListOutput.shoppingList.forEach(category => {
      textToCopy += `--- ${category.categoryName} ---\n`;
      category.items.forEach(item => {
        textToCopy += `- ${item}\n`;
      });
      textToCopy += "\n";
    });

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => {
        toast({ title: "Copié !", description: "La liste de courses a été copiée." });
      })
      .catch(err => {
        toast({ title: "Erreur", description: "Impossible de copier la liste.", variant: "destructive" });
        console.error("Erreur de copie de la liste de courses:", err);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Liste de Courses
          </DialogTitle>
          {shoppingListOutput && <DialogDescription>Pour la recette : <span className="font-semibold text-foreground">{shoppingListOutput.recipeName}</span></DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4">
          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <React.Fragment key={i}>
                  <Skeleton className="h-5 w-1/3 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </React.Fragment>
              ))}
            </div>
          )}
          {error && !isLoading && (
            <div className="p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" /> <p>{error}</p>
            </div>
          )}
          {shoppingListOutput && !isLoading && !error && (
            <div className="space-y-3">
              {shoppingListOutput.shoppingList.map((category, catIdx) => (
                <div key={catIdx}>
                  <h4 className="font-semibold text-md text-primary mb-1">{category.categoryName}</h4>
                  <ul className="list-disc list-inside pl-4 space-y-0.5 text-sm text-muted-foreground">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {/*shoppingListOutput.notes && (
                <div className="mt-4 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">Note de l'IA : {shoppingListOutput.notes}</p>
                </div>
              )*/}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
          {shoppingListOutput && !isLoading && !error && (
            <Button variant="outline" onClick={copyShoppingListToClipboard} className="mr-auto">
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copier la Liste
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
