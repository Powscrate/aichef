
// src/components/dialogs/SubstitutionDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import type { Recipe, SuggestIngredientSubstitutionInput, SuggestedSubstitute } from "@/lib/types";
import { getIngredientSubstitutionAction } from "@/app/actions";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, ChefHat, Replace } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SubstitutionDialogProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubstitutionDialog({ recipe, isOpen, onClose }: SubstitutionDialogProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [constraints, setConstraints] = useState<string>("");
  const [isLoadingSubstitutions, setIsLoadingSubstitutions] = useState(false);
  const [substitutionSuggestions, setSubstitutionSuggestions] = useState<SuggestedSubstitute[]>([]);
  const [substitutionError, setSubstitutionError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && recipe) {
      setSelectedIngredient(recipe.ingredients[0] || "");
      setConstraints("");
      setSubstitutionSuggestions([]);
      setSubstitutionError(null);
    }
  }, [isOpen, recipe]);

  const handleFetchSubstitutions = async () => {
    if (!recipe) return;
    if (!selectedIngredient) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un ingrédient.", variant: "destructive" });
      return;
    }
    setIsLoadingSubstitutions(true);
    setSubstitutionSuggestions([]);
    setSubstitutionError(null);

    const input: SuggestIngredientSubstitutionInput = {
      originalRecipeName: recipe.name,
      ingredientToSubstitute: selectedIngredient,
      originalIngredientsList: recipe.ingredients,
      originalInstructions: recipe.instructions,
      substitutionConstraints: constraints.trim() !== "" ? constraints : undefined,
    };

    const result = await getIngredientSubstitutionAction(input);
    setIsLoadingSubstitutions(false);

    if (result.error) {
      setSubstitutionError(result.error);
      toast({ title: "Erreur de Substitution", description: result.error, variant: "destructive" });
    } else if (result.data && result.data.substitutions.length > 0) {
      setSubstitutionSuggestions(result.data.substitutions);
      toast({ title: "Substitutions Trouvées!", description: `L'IA a trouvé ${result.data.substitutions.length} idée(s) pour remplacer ${selectedIngredient}.` });
    } else {
      setSubstitutionError("L'IA n'a pas pu suggérer de substitutions pour cet ingrédient avec ces contraintes.");
      toast({ title: "Aucune Substitution Trouvée", description: "L'IA n'a pas pu suggérer de substitutions pour cet ingrédient avec ces contraintes.", variant: "default" });
    }
  };
  
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Replace className="h-6 w-6 text-primary" />
            Conseiller en Substitution d'Ingrédients
          </DialogTitle>
          <DialogDescription>
            Pour la recette : <span className="font-semibold text-foreground">{recipe.name}</span>.
            Choisissez un ingrédient à remplacer et spécifiez des contraintes si besoin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="ingredient-select">Ingrédient à remplacer</Label>
            <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
              <SelectTrigger id="ingredient-select" className="w-full mt-1">
                <SelectValue placeholder="Sélectionnez un ingrédient" />
              </SelectTrigger>
              <SelectContent>
                {recipe.ingredients.map((ing, idx) => (
                  <SelectItem key={idx} value={ing}>{ing}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="substitution-constraints">Contraintes (optionnel)</Label>
            <Input
              id="substitution-constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="ex: végétarien, sans gluten, moins épicé"
              className="mt-1"
            />
          </div>
          <Button onClick={handleFetchSubstitutions} disabled={isLoadingSubstitutions || !selectedIngredient} className="w-full">
            {isLoadingSubstitutions ? (
              <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche de substitutions...</>
            ) : (
              <> <ChefHat className="mr-2 h-4 w-4" /> Obtenir des suggestions </>
            )}
          </Button>
        </div>

        {isLoadingSubstitutions && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        )}

        {substitutionError && !isLoadingSubstitutions && (
          <div className="mt-4 p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>{substitutionError}</p>
          </div>
        )}

        {substitutionSuggestions.length > 0 && !isLoadingSubstitutions && (
          <ScrollArea className="mt-4 max-h-60">
            <div className="space-y-3 pr-2">
              <h4 className="text-md font-semibold text-foreground">Suggestions de l'IA :</h4>
              {substitutionSuggestions.map((sub, idx) => (
                <Card key={idx} className="bg-muted/50 p-3">
                  <p className="font-semibold text-primary">{sub.substitute}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub.notes}</p>
                  {sub.confidence && <p className="text-xs text-accent mt-1">Confiance : {sub.confidence}</p>}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
