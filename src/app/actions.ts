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

    // Paralléliser la génération d'images
    const recipesWithImagesPromises = recipeTextResult.recipes.map(async (recipeBase) => {
      try {
        const imageInput: GenerateRecipeImageInput = { recipeName: recipeBase.name };
        const imageUrl = await generateRecipeImage(imageInput);
        return { ...recipeBase, imageUrl };
      } catch (imageError) {
        console.error(`Erreur lors de la génération de l'image pour la recette "${recipeBase.name}":`, imageError);
        // Retourner la recette avec imageUrl: undefined en cas d'erreur de génération d'image
        return { ...recipeBase, imageUrl: undefined };
      }
    });

    const recipesWithImages: Recipe[] = await Promise.all(recipesWithImagesPromises);

    return { data: recipesWithImages, error: null };

  } catch (e) {
    console.error("Erreur dans getRecipesAction:", e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la récupération des recettes.";
    
    // Note: L'erreur spécifique de génération d'image est maintenant gérée dans la boucle map/catch ci-dessus.
    // Cette section d'erreur est pour les erreurs plus générales de `suggestRecipes` ou des problèmes inattendus.
    return { data: null, error: errorMessage };
  }
}
