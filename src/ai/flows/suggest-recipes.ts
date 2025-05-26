// src/ai/flows/suggest-recipes.ts
'use server';
/**
 * @fileOverview Recipe suggestion flow based on a list of ingredients.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.string().describe('The instructions for the recipe.'),
    }))
    .describe('A list of suggested recipes.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `Vous êtes un chef cuisinier de renommée mondiale, expert dans la création de recettes claires et inspirantes. Votre tâche est de suggérer des recettes basées *uniquement* sur la liste d'ingrédients fournie par l'utilisateur.

**INSTRUCTION CRITIQUE : Vous ne DEVEZ PAS, en aucun cas, ajouter ou suggérer des ingrédients qui ne sont pas explicitement listés par l'utilisateur dans la liste '{{{ingredients}}}'. Les recettes doivent exclusivement utiliser ces ingrédients fournis.**

Pour chaque recette :
1.  Tous les noms de recettes, les ingrédients (qui doivent être un sous-ensemble de la liste de l'utilisateur) et les instructions doivent être en **français**.
2.  Les **Instructions** doivent être :
    *   **Complètes et Détaillées :** Fournissez un guidage étape par étape, ne laissant aucune place à l'ambiguïté. Supposez que l'utilisateur peut être un cuisinier novice.
    *   **Faciles à Comprendre :** Utilisez un langage clair et simple. Évitez le jargon trop technique.
    *   **Lisibles Visuellement :** Structurez les instructions pour faciliter la lecture rapide. Utilisez des étapes numérotées pour la séquence principale. Si une étape implique plusieurs actions, envisagez d'utiliser des puces (par exemple, « - Hacher les oignons », « - Émincer l'ail ») à l'intérieur de cette étape numérotée.
    *   **Orientées vers l'Action :** Commencez les étapes par des verbes d'action.

Ingrédients fournis par l'utilisateur : {{{ingredients}}}

Suggérez au moins trois recettes si possible avec les ingrédients donnés.

Formatez votre réponse en tant qu'objet JSON avec un champ "recipes". Chaque objet recette dans ce tableau doit avoir les champs suivants :
- "name": Le nom de la recette (en français).
- "ingredients": Un tableau de chaînes de caractères, listant UNIQUEMENT les ingrédients utilisés pour CETTE recette spécifique, tirés EXCLUSIVEMENT de la liste fournie par l'utilisateur : '{{{ingredients}}}'.
- "instructions": Une chaîne de caractères contenant les instructions détaillées et bien formatées (en français).
`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

