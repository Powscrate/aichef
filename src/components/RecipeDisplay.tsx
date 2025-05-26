// src/components/RecipeDisplay.tsx
"use client";

import type { Recipe } from "@/lib/types";
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ListChecks, CookingPot, AlertCircle, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeDisplayProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
}

export function RecipeDisplay({ recipes, isLoading, error }: RecipeDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full rounded-md" /> {/* Skeleton for image */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 shadow">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0 && !isLoading) { // Ensure not to show this during initial load if recipes will appear
    return (
      <div className="mt-8 text-center text-muted-foreground py-10">
        <UtensilsCrossed className="mx-auto h-12 w-12 mb-4" />
        <p>Aucune recette à afficher. Essayez d'entrer des ingrédients et cliquez sur "Obtenir des recettes".</p>
      </div>
    );
  }
  
  if (recipes.length === 0) { // Handles case where AI returns empty but no error (covered by toast on page.tsx)
    return null; 
  }


  return (
    <Accordion type="single" collapsible className="w-full space-y-4 mt-8">
      {recipes.map((recipe, index) => (
        <AccordionItem value={`recipe-${index}`} key={index} className="border bg-card rounded-lg shadow-sm">
          <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline text-[hsl(var(--accent))]">
            <div className="flex items-center gap-3">
              <CookingPot className="h-6 w-6" />
              <span>{recipe.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="space-y-6">
              {recipe.imageUrl ? (
                <div className="mb-4 overflow-hidden rounded-md shadow">
                  <Image 
                    src={recipe.imageUrl} 
                    alt={`Image de ${recipe.name}`} 
                    width={400} 
                    height={250} 
                    className="rounded-md object-cover w-full aspect-[16/10]"
                    data-ai-hint={recipe.name.toLowerCase().split(' ').slice(0,2).join(' ')}
                  />
                </div>
              ) : (
                <div className="mb-4 flex flex-col items-center justify-center h-40 bg-muted/50 rounded-md border border-dashed">
                  <ImageOff className="h-10 w-10 text-muted-foreground mb-2"/>
                  <p className="text-sm text-muted-foreground">Aperçu non disponible</p>
                </div>
              )}
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center gap-2 text-foreground">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Ingrédients
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center gap-2 text-foreground">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Instructions
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {recipe.instructions}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
