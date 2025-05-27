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

export async function getRecipesAction(
  ingredients: string,
  dietaryPreferences?: string[],
  allergies?: string
): Promise<RecipeActionResult> {
  if (!ingredients || ingredients.trim() === "") {
    return { data: null, error: "Veuillez entrer quelques ingrédients." };
  }

  try {
    const recipeTextInput: SuggestRecipesInput = { 
      ingredients,
      dietaryPreferences: dietaryPreferences && dietaryPreferences.length > 0 ? dietaryPreferences : undefined,
      allergies: allergies && allergies.trim() !== "" ? allergies : undefined,
    };
    
    const recipeTextResult: SuggestRecipesGenkitOutput = await suggestRecipes(recipeTextInput);
    
    if (!recipeTextResult || !recipeTextResult.recipes) {
      return { data: null, error: "Impossible de générer des recettes. L'IA a renvoyé un format inattendu." };
    }

    // Filter out placeholder/error recipes before image generation
    const validRecipesBase = recipeTextResult.recipes.filter(
      recipe => recipe.name !== "Erreur de l'IA" && recipe.name !== "Aucune recette trouvée" && recipe.ingredients.length > 0
    );
    
    const recipesWithImagesPromises = validRecipesBase.map(async (recipeBase) => {
      try {
        const imageInput: GenerateRecipeImageInput = { recipeName: recipeBase.name };
        const imageUrl = await generateRecipeImage(imageInput);
        return { ...recipeBase, imageUrl };
      } catch (imageError) {
        console.error(`Erreur lors de la génération de l'image pour la recette "${recipeBase.name}":`, imageError);
        return { ...recipeBase, imageUrl: undefined }; // Garder la recette même si l'image échoue
      }
    });

    const recipesWithImages: Recipe[] = await Promise.all(recipesWithImagesPromises);

    // If the original response only contained error/placeholder recipes, reflect that.
    if (validRecipesBase.length === 0 && recipeTextResult.recipes.length > 0) {
        const placeholderMessage = recipeTextResult.recipes[0].notesOnAdaptation || "Aucune recette compatible trouvée.";
        // Afficher ce message à l'utilisateur via le mécanisme d'erreur ou une recette spéciale
         return { data: [{
            name: recipeTextResult.recipes[0].name, // "Aucune recette trouvée" ou "Erreur de l'IA"
            ingredients: [],
            instructions: "",
            notesOnAdaptation: placeholderMessage,
            imageUrl: undefined // Pas d'image pour les placeholders
        }], error: null };
    }


    return { data: recipesWithImages, error: null };

  } catch (e) {
    console.error("Erreur dans getRecipesAction:", e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la récupération des recettes.";
    return { data: null, error: errorMessage };
  }
}


interface VariationActionResult {
  data: SuggestRecipeVariationsOutput | null; 
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
    const result: SuggestRecipeVariationsGenkitOutput = await suggestRecipeVariations(input);
    if (!result || !result.variations || result.variations.length === 0) {
      return { data: null, error: "L'IA n'a pas pu suggérer de variations pour cette recette." };
    }
    return { data: result as SuggestRecipeVariationsOutput, error: null };
  } catch (e) {
    console.error(`Erreur dans getRecipeVariationsAction pour "${recipeName}":`, e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la suggestion de variations.";
    return { data: null, error: errorMessage };
  }
}
