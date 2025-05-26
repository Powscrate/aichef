// src/components/RecipeDisplay.tsx
"use client";

import type { Recipe } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ListChecks, CookingPot, AlertCircle } from "lucide-react";
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
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
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
      <div className="mt-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10">
        <UtensilsCrossed className="mx-auto h-12 w-12 mb-4" />
        <p>No recipes to display. Try entering some ingredients and click "Get Recipes".</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4 mt-8">
      {recipes.map((recipe, index) => (
        <AccordionItem value={`recipe-${index}`} key={index} className="border bg-card rounded-lg shadow-sm">
          <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline text-[hsl(var(--accent))]">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-6 w-6" />
              <span>{recipe.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center gap-2 text-foreground">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Ingredients
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center gap-2 text-foreground">
                  <CookingPot className="h-5 w-5 text-primary" />
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
