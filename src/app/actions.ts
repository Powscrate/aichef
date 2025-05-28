// src/app/actions.ts
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput as SuggestRecipesGenkitOutput } from "@/ai/flows/suggest-recipes";
import { generateRecipeImage, type GenerateRecipeImageInput } from "@/ai/flows/generate-recipe-image-flow";
import { suggestRecipeVariations, type SuggestRecipeVariationsInput, type SuggestRecipeVariationsOutput as SuggestRecipeVariationsGenkitOutput } from "@/ai/flows/suggest-recipe-variations-flow";
import { getDailyCookingTip, type GetDailyCookingTipOutput } from "@/ai/flows/get-daily-cooking-tip-flow";
import { suggestIngredientSubstitution, type SuggestIngredientSubstitutionInput, type SuggestIngredientSubstitutionOutput as SuggestIngredientSubstitutionGenkitOutput } from "@/ai/flows/suggest-ingredient-substitution-flow";
import { generateShoppingList, type GenerateShoppingListInput, type GenerateShoppingListOutput as GenerateShoppingListGenkitOutput } from "@/ai/flows/generate-shopping-list-flow";


import type { Recipe, SuggestRecipeVariationsOutput, SuggestIngredientSubstitutionOutput, GenerateShoppingListOutput } from "@/lib/types";

interface RecipeActionResult {
  data: Recipe[] | null;
  error: string | null;
}

export async function getRecipesAction(
  ingredients: string,
  dietaryPreferences?: string[],
  allergies?: string,
  targetCalories?: string,
  macronutrientProfile?: string
): Promise<RecipeActionResult> {
  if (!ingredients || ingredients.trim() === "") {
    return { data: null, error: "Veuillez entrer quelques ingrédients." };
  }

  try {
    const recipeTextInput: SuggestRecipesInput = {
      ingredients,
      dietaryPreferences: dietaryPreferences && dietaryPreferences.length > 0 ? dietaryPreferences : undefined,
      allergies: allergies && allergies.trim() !== "" ? allergies : undefined,
      targetCalories: targetCalories && targetCalories.trim() !== "" ? targetCalories : undefined,
      macronutrientProfile: macronutrientProfile && macronutrientProfile.trim() !== "" ? macronutrientProfile : undefined,
    };

    const recipeTextResult: SuggestRecipesGenkitOutput = await suggestRecipes(recipeTextInput);

    if (!recipeTextResult || !recipeTextResult.recipes) {
      return { data: null, error: "Impossible de générer des recettes. L'IA a renvoyé un format inattendu." };
    }

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
        return { ...recipeBase, imageUrl: undefined };
      }
    });

    const recipesWithImages: Recipe[] = await Promise.all(recipesWithImagesPromises);

    if (validRecipesBase.length === 0 && recipeTextResult.recipes.length > 0) {
        const placeholderMessage = recipeTextResult.recipes[0].notesOnAdaptation || recipeTextResult.recipes[0].goalAlignment || "Aucune recette compatible trouvée.";
         return { data: [{
            name: recipeTextResult.recipes[0].name,
            ingredients: [],
            instructions: "",
            notesOnAdaptation: placeholderMessage,
            imageUrl: undefined
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

interface DailyTipActionResult {
  data: string | null;
  error: string | null;
}

export async function getDailyCookingTipAction(): Promise<DailyTipActionResult> {
  try {
    const result: GetDailyCookingTipOutput = await getDailyCookingTip();
    if (!result || !result.tip) {
      return { data: null, error: "L'IA n'a pas pu fournir d'astuce aujourd'hui." };
    }
    return { data: result.tip, error: null };
  } catch (e) {
    console.error("Erreur dans getDailyCookingTipAction:", e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la récupération de l'astuce du jour.";
    return { data: null, error: errorMessage };
  }
}


interface SubstitutionActionResult {
  data: SuggestIngredientSubstitutionOutput | null;
  error: string | null;
}

export async function getIngredientSubstitutionAction(
  input: SuggestIngredientSubstitutionInput
): Promise<SubstitutionActionResult> {
  if (!input.originalRecipeName || !input.ingredientToSubstitute || input.originalIngredientsList.length === 0 || !input.originalInstructions) {
    return { data: null, error: "Les détails de la recette et l'ingrédient à substituer sont nécessaires." };
  }

  try {
    const result: SuggestIngredientSubstitutionGenkitOutput = await suggestIngredientSubstitution(input);
    if (!result || !result.substitutions || result.substitutions.length === 0) {
      return { data: null, error: "L'IA n'a pas pu suggérer de substitutions pour cet ingrédient dans cette recette." };
    }
    return { data: result, error: null };
  } catch (e) {
    console.error(`Erreur dans getIngredientSubstitutionAction pour "${input.ingredientToSubstitute}" dans "${input.originalRecipeName}":`, e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la suggestion de substitutions.";
    return { data: null, error: errorMessage };
  }
}

interface ShoppingListActionResult {
  data: GenerateShoppingListOutput | null;
  error: string | null;
}

export async function getShoppingListAction(
  recipeName: string,
  recipeIngredients: string[]
): Promise<ShoppingListActionResult> {
  if (!recipeName || recipeIngredients.length === 0) {
    return { data: null, error: "Le nom de la recette et les ingrédients sont nécessaires pour générer une liste de courses." };
  }

  const input: GenerateShoppingListInput = {
    recipeName,
    recipeIngredients,
  };

  try {
    const result: GenerateShoppingListGenkitOutput = await generateShoppingList(input);
    if (!result || !result.shoppingList || result.shoppingList.length === 0) {
      return { data: null, error: "L'IA n'a pas pu générer de liste de courses pour cette recette." };
    }
    return { data: result as GenerateShoppingListOutput, error: null };
  } catch (e) {
    console.error(`Erreur dans getShoppingListAction pour "${recipeName}":`, e);
    const errorMessage = e instanceof Error ? e.message : "Une erreur inattendue s'est produite lors de la génération de la liste de courses.";
    return { data: null, error: errorMessage };
  }
}
