// src/app/actions.ts
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput } from "@/ai/flows/suggest-recipes";
import type { Recipe } from "@/lib/types";

interface ActionResult {
  data: Recipe[] | null;
  error: string | null;
}

export async function getRecipesAction(ingredients: string): Promise<ActionResult> {
  if (!ingredients || ingredients.trim() === "") {
    return { data: null, error: "Please enter some ingredients." };
  }

  try {
    const input: SuggestRecipesInput = { ingredients };
    const result: SuggestRecipesOutput = await suggestRecipes(input);
    
    if (result && result.recipes) {
      return { data: result.recipes, error: null };
    } else {
      return { data: null, error: "Could not generate recipes. The AI returned an unexpected format." };
    }
  } catch (e) {
    console.error("Error suggesting recipes:", e);
    // Check if 'e' is an Error instance and has a message property
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while fetching recipes.";
    return { data: null, error: errorMessage };
  }
}
