// src/app/actions.ts
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput as SuggestRecipesGenkitOutput } from "@/ai/flows/suggest-recipes";
import { generateRecipeImage, type GenerateRecipeImageInput } from "@/ai/flows/generate-recipe-image-flow";
import { suggestRecipeVariations, type SuggestRecipeVariationsInput, type SuggestRecipeVariationsOutput as SuggestRecipeVariationsGenkitOutput } from "@/ai/flows/suggest-recipe-variations-flow";

import type { Recipe, SuggestRecipeVariationsOutput } from "@/lib/types";

interface RecipeActionResult {
  data: Recipe[] | null;
  error: string | null;
}

export async function getRecipesAction(ingredients: string): Promise<RecipeActionResult> {
  if (!ingredients || ingredients.trim() === "") {
    return { data: null, error: "Veuillez entrer quelques ingrédients." };
  }

  try {
    const recipeTextInput: SuggestRecipesInput = { ingredients };
    // Utiliser le type de Genkit pour la sortie ici
    const recipeTextResult: SuggestRecipesGenkitOutput = await suggestRecipes(recipeTextInput);
    
    if (!recipeTextResult || !recipeTextResult.recipes) {
      return { data: null, error: "Impossible de générer des recettes. L'IA a renvoyé un format inattendu." };
    }

    const recipesWithImagesPromises = recipeTextResult.recipes.map(async (recipeBase) => {
      try {
        const imageInput: GenerateRecipeImageInput = { recipeName: recipeBase.name };
        const imageUrl = await generateRecipeImage(imageInput);
        return { ...recipeBase, imageUrl };
      } catch (imageError) {
        console.error(`Erreur lors de la génération de l'image pour la recette "${recipeBase.name}":`, imageError);
        return { ...recipeBase, imageUrl: undefined };
      }
    });

    const recipesWithImages: Recipe[] = await Promise.all(recipesWithImagesPromises);

    return { data: recipesWithImages, error: null };

  } catch (e) {
    console.error("Erreur dans getRecipesAction:", e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la récupération des recettes.";
    return { data: null, error: errorMessage };
  }
}


interface VariationActionResult {
  data: SuggestRecipeVariationsOutput | null; // Utilise le type de lib/types.ts
  error: string | null;
}

export async function getRecipeVariationsAction(
  recipeName: string,
  ingredients: string[],
  instructions: string
): Promise<VariationActionResult> {
  if (!recipeName || ingredients.length === 0 || !instructions) {
    return { data: null, error: "Les détails de la recette originale sont nécessaires pour suggérer des variations." };
  }

  const input: SuggestRecipeVariationsInput = {
    originalRecipeName: recipeName,
    originalIngredients: ingredients,
    originalInstructions: instructions,
  };

  try {
    // Utiliser le type de Genkit pour la sortie ici
    const result: SuggestRecipeVariationsGenkitOutput = await suggestRecipeVariations(input);
    if (!result || !result.variations || result.variations.length === 0) {
      return { data: null, error: "L'IA n'a pas pu suggérer de variations pour cette recette." };
    }
    // Le type de retour de cette action est SuggestRecipeVariationsOutput de lib/types.ts
    return { data: result as SuggestRecipeVariationsOutput, error: null };
  } catch (e) {
    console.error(`Erreur dans getRecipeVariationsAction pour "${recipeName}":`, e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la suggestion de variations.";
    return { data: null, error: errorMessage };
  }
}
