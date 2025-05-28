// src/lib/types.ts
export interface NutritionalInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  nutritionalInfo?: NutritionalInfo;
  notesOnAdaptation?: string;
  estimatedPreparationTime?: string;
  estimatedCookingTime?: string;
  difficultyLevel?: string;
  goalAlignment?: string;
}

export interface RecipeVariation {
  variationName: string;
  description: string;
  changesToIngredients?: string[];
  changesToInstructions?: string;
}

export interface SuggestRecipeVariationsOutput {
  variations: RecipeVariation[];
}

export interface RecipeWithVariations extends Recipe {
  variations?: RecipeVariation[];
  isLoadingVariations?: boolean;
  variationsError?: string | null;
}

export interface SuggestIngredientSubstitutionInput {
  originalRecipeName: string;
  ingredientToSubstitute: string;
  originalIngredientsList: string[];
  originalInstructions: string;
  substitutionConstraints?: string;
}

export interface SuggestedSubstitute {
  substitute: string;
  notes: string;
  confidence?: string;
}

export interface SuggestIngredientSubstitutionOutput {
  substitutions: SuggestedSubstitute[];
}

// Types for Shopping List Generation
export interface ShoppingListCategory {
  categoryName: string;
  items: string[];
}

export interface GenerateShoppingListOutput {
  recipeName: string;
  shoppingList: ShoppingListCategory[];
  // notes?: string; // Potentially add notes from AI later
}

export interface RecipeWithShoppingList extends RecipeWithVariations {
  shoppingList?: ShoppingListCategory[];
  isLoadingShoppingList?: boolean;
  shoppingListError?: string | null;
}
