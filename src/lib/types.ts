// src/lib/types.ts
export interface NutritionalInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  // Potentially more detailed fields if AI can provide them
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
  goalAlignment?: string; // New: Explanation of how it meets nutritional goals
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

// Types for Ingredient Substitution Flow
export interface SuggestIngredientSubstitutionInput {
  originalRecipeName: string;
  ingredientToSubstitute: string;
  originalIngredientsList: string[];
  originalInstructions: string;
  substitutionConstraints?: string; // e.g., "vegetarian", "gluten-free", "low-sodium"
}

export interface SuggestedSubstitute {
  substitute: string;
  notes: string; // Impact on recipe, preparation, taste, etc.
  confidence?: string; // Optional: AI's confidence or suitability
}

export interface SuggestIngredientSubstitutionOutput {
  substitutions: SuggestedSubstitute[];
}
