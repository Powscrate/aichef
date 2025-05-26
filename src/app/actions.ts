// src/app/actions.ts
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput } from "@/ai/flows/suggest-recipes";
import { generateRecipeImage, type GenerateRecipeImageInput } from "@/ai/flows/generate-recipe-image-flow";
import type { Recipe } from "@/lib/types";

interface ActionResult {
  data: Recipe[] | null;
  error: string | null;
}

export async function getRecipesAction(ingredients: string): Promise<ActionResult> {
  if (!ingredients || ingredients.trim() === "") {
    return { data: null, error: "Veuillez entrer quelques ingrédients." };
  }

  try {
    const recipeTextInput: SuggestRecipesInput = { ingredients };
    const recipeTextResult: SuggestRecipesOutput = await suggestRecipes(recipeTextInput);
    
    if (!recipeTextResult || !recipeTextResult.recipes) {
      return { data: null, error: "Impossible de générer des recettes. L'IA a renvoyé un format inattendu." };
    }

    const recipesWithImages: Recipe[] = [];

    for (const recipeBase of recipeTextResult.recipes) {
      let imageUrl: string | undefined = undefined;
      try {
        const imageInput: GenerateRecipeImageInput = { recipeName: recipeBase.name };
        imageUrl = await generateRecipeImage(imageInput);
      } catch (imageError) {
        console.error(`Error generating image for recipe "${recipeBase.name}":`, imageError);
        // Optionally, you could inform the user that the image failed for this specific recipe.
        // For now, we'll just proceed without an image for this recipe.
      }
      
      recipesWithImages.push({
        ...recipeBase,
        imageUrl: imageUrl,
      });
    }

    return { data: recipesWithImages, error: null };

  } catch (e) {
    console.error("Error in getRecipesAction:", e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la récupération des recettes.";
    
    if (errorMessage.startsWith("Failed to generate image for recipe")) {
         return { data: null, error: `Une erreur s'est produite lors de la génération d'une image : ${errorMessage}` };
    }
    return { data: null, error: errorMessage };
  }
}
