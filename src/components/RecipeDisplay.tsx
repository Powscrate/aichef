// src/components/RecipeDisplay.tsx
"use client";

import type { Recipe, NutritionalInfo } from "@/lib/types";
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card components are not used here anymore, but kept for potential future use.
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ListChecks, CookingPot, AlertCircle, ImageOff, Heart, Flame, Beef, Wheat, Droplet, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";

interface RecipeDisplayProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
}

const NutritionItem: React.FC<{ icon: React.ElementType; label: string; value?: string }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-2 text-primary" />
      <span>{label}: {value}</span>
    </div>
  );
};

export function RecipeDisplay({ recipes, isLoading, error }: RecipeDisplayProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { toast } = useToast();

  const isFavorited = (recipeName: string) => {
    return favorites.some(fav => fav.name === recipeName);
  };

  const handleFavoriteToggle = (recipe: Recipe) => {
    if (isFavorited(recipe.name)) {
      removeFavorite(recipe.name);
      toast({
        title: "Retirée des favoris",
        description: `"${recipe.name}" a été retirée de vos favoris.`,
      });
    } else {
      addFavorite(recipe);
      toast({
        title: "Ajoutée aux favoris!",
        description: `"${recipe.name}" a été ajoutée à vos favoris.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border border-border">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full rounded-md" /> {/* Skeleton for image */}
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 shadow">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0 && !isLoading) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10">
        <UtensilsCrossed className="mx-auto h-12 w-12 mb-4" />
        <p>Aucune recette à afficher. Essayez d'entrer des ingrédients et cliquez sur "Obtenir des recettes".</p>
      </div>
    );
  }
  
  if (recipes.length === 0) {
    return null; 
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4 mt-8">
      {recipes.map((recipe, index) => (
        <AccordionItem value={`recipe-${index}`} key={index} className="border border-border bg-card rounded-lg shadow-sm overflow-hidden">
          <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline text-primary w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <CookingPot className="h-6 w-6" />
                <span className="text-left">{recipe.name}</span>
              </div>
              {/* ChevronDown is part of AccordionTrigger by default */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="space-y-6">
              {recipe.imageUrl ? (
                <div className="mb-4 overflow-hidden rounded-md shadow aspect-[16/10] relative">
                  <Image 
                    src={recipe.imageUrl} 
                    alt={`Image de ${recipe.name}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-md object-cover"
                    data-ai-hint={recipe.name.toLowerCase().split(' ').slice(0,2).join(' ')}
                  />
                </div>
              ) : (
                <div className="mb-4 flex flex-col items-center justify-center h-40 bg-muted/50 rounded-md border border-dashed border-border">
                  <ImageOff className="h-12 w-12 text-muted-foreground mb-3"/>
                  <p className="text-md text-muted-foreground">Aperçu non disponible</p>
                </div>
              )}
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFavoriteToggle(recipe)}
                className="w-full sm:w-auto flex items-center gap-2 group text-muted-foreground hover:text-primary"
                aria-label={isFavorited(recipe.name) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-5 w-5 transition-colors duration-200 ${isFavorited(recipe.name) ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-500'}`} />
                {isFavorited(recipe.name) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
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
                <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-foreground">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Instructions
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed prose prose-sm max-w-none">
                  {recipe.instructions.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>

              {recipe.nutritionalInfo && (Object.keys(recipe.nutritionalInfo).length > 0) && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-foreground">
                    <Info className="h-5 w-5 text-primary" />
                    Informations Nutritionnelles (Estimations)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <NutritionItem icon={Flame} label="Calories" value={recipe.nutritionalInfo.calories} />
                    <NutritionItem icon={Beef} label="Protéines" value={recipe.nutritionalInfo.protein} />
                    <NutritionItem icon={Wheat} label="Glucides" value={recipe.nutritionalInfo.carbs} />
                    <NutritionItem icon={Droplet} label="Lipides" value={recipe.nutritionalInfo.fat} />
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
