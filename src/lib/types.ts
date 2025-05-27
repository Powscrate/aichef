// src/lib/types.ts
export interface NutritionalInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  nutritionalInfo?: NutritionalInfo;
  notesOnAdaptation?: string; // Ajouté pour les notes d'adaptation/conflits
}

// Nouveaux types pour les variations de recettes
export interface RecipeVariation {
  variationName: string;
  description: string;
  changesToIngredients?: string[];
  changesToInstructions?: string;
}

export interface SuggestRecipeVariationsOutput {
  variations: RecipeVariation[];
}

// Pour l'état dans RecipeDisplay
export interface RecipeWithVariations extends Recipe {
  variations?: RecipeVariation[];
  isLoadingVariations?: boolean;
  variationsError?: string | null;
}

```