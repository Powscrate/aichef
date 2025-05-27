// src/ai/flows/suggest-recipes.ts
'use server';
/**
 * @fileOverview Recipe suggestion flow based on a list of ingredients, dietary preferences, and allergies.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients, preferences, and allergies.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients.'),
  dietaryPreferences: z.array(z.string()).optional().describe('An optional list of dietary preferences (e.g., "végétarien", "vegan", "sans gluten").'),
  allergies: z.string().optional().describe('An optional comma-separated string listing allergies (e.g., "arachides, lactose").'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const NutritionalInfoSchema = z.object({
  calories: z.string().optional().describe('Calories estimées (par exemple, "environ 350 kcal").'),
  protein: z.string().optional().describe('Protéines estimées (par exemple, "environ 30g").'),
  carbs: z.string().optional().describe('Glucides estimés (par exemple, "environ 40g").'),
  fat: z.string().optional().describe('Lipides estimés (par exemple, "environ 15g").')
}).describe("Informations nutritionnelles estimées par portion.").optional();

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.string().describe('The instructions for the recipe.'),
      nutritionalInfo: NutritionalInfoSchema,
      notesOnAdaptation: z.string().optional().describe('Optional notes if the recipe was adapted due to preferences/allergies, or if no compatible recipe could be found.'),
      estimatedPreparationTime: z.string().optional().describe("Temps de préparation estimé (ex: 'environ 20 minutes', '10-15 minutes')."),
      estimatedCookingTime: z.string().optional().describe("Temps de cuisson estimé (ex: 'environ 30 minutes', '45 min - 1 heure')."),
    }))
    .describe('A list of suggested recipes. If no recipes can be made due to constraints, this list might be empty and a note provided in notesOnAdaptation.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `Vous êtes un chef cuisinier de renommée mondiale, expert dans la création de recettes claires, inspirantes et adaptées aux besoins spécifiques. Votre tâche est de suggérer des recettes basées sur la liste d'ingrédients fournie par l'utilisateur, en tenant compte de ses préférences alimentaires et allergies.

**INSTRUCTION CRITIQUE : Vous ne DEVEZ PAS, en aucun cas, ajouter ou suggérer des ingrédients qui ne sont pas explicitement listés par l'utilisateur dans la liste '{{{ingredients}}}'. Les recettes doivent exclusivement utiliser ces ingrédients fournis.**

Ingrédients fournis par l'utilisateur : {{{ingredients}}}

{{#if dietaryPreferences.length}}
Préférences alimentaires spécifiques à respecter :
{{#each dietaryPreferences}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if allergies}}
Allergies ou restrictions à prendre impérativement en compte (ne pas inclure ces éléments) : {{{allergies}}}
{{/if}}

Pour chaque recette :
1.  Tous les noms de recettes, les ingrédients (qui doivent être un sous-ensemble de la liste de l'utilisateur) et les instructions doivent être en **français**.
2.  Les **Instructions** doivent être :
    *   **Complètes et Détaillées :** Fournissez un guidage étape par étape, ne laissant aucune place à l'ambiguïté. Supposez que l'utilisateur peut être un cuisinier novice.
    *   **Faciles à Comprendre :** Utilisez un langage clair et simple. Évitez le jargon trop technique.
    *   **Lisibles Visuellement :** Structurez les instructions pour faciliter la lecture rapide. Utilisez des étapes numérotées pour la séquence principale. Si une étape implique plusieurs actions, envisagez d'utiliser des puces (par exemple, « - Hacher les oignons », « - Émincer l'ail ») à l'intérieur de cette étape numérotée.
    *   **Orientées vers l'Action :** Commencez les étapes par des verbes d'action.
3.  **Informations Nutritionnelles Estimées :** Pour chaque recette, fournissez une **estimation** des informations nutritionnelles par portion, si possible : calories, protéines, glucides et lipides. Indiquez clairement que ce sont des estimations. Si une information n'est pas disponible, omettez-la simplement.
4.  **Estimations des Temps :** Fournissez une estimation pour le 'estimatedPreparationTime' (temps de préparation) et 'estimatedCookingTime' (temps de cuisson). Ces temps doivent être réalistes et exprimés de manière claire (ex: "20 minutes", "1 heure", "10-15 min"). Si une estimation fiable n'est pas possible, omettez le champ.
5.  **Adaptation aux Préférences et Allergies :**
    *   Si des préférences alimentaires (ex: végétarien, vegan) sont spécifiées, adaptez les recettes pour qu'elles respectent scrupuleusement ces préférences en utilisant UNIQUEMENT les ingrédients fournis.
    *   Si des allergies sont listées, assurez-vous que les recettes ne contiennent AUCUN des allergènes mentionnés, en utilisant UNIQUEMENT les ingrédients fournis.
    *   **Cas de Conflit Important :** Si les ingrédients fournis par l'utilisateur et les préférences/allergies sont contradictoires (par exemple, "poulet" comme ingrédient et "végétarien" comme préférence), vous devez impérativement le signaler dans le champ 'notesOnAdaptation' de la recette concernée (ou pour une note globale si aucune recette n'est possible). Ne proposez PAS de recette qui viole ces contraintes. Vous pouvez :
        a) Proposer une recette qui utilise un sous-ensemble compatible des ingrédients fournis.
        b) Indiquer clairement dans 'notesOnAdaptation' qu'aucune recette compatible ne peut être élaborée avec les ingrédients fournis et les contraintes spécifiées.
    *   Si une adaptation a été faite (par exemple, une recette initialement non-végétarienne a été rendue végétarienne en utilisant uniquement les ingrédients fournis compatibles), mentionnez-le brièvement dans 'notesOnAdaptation'.

Suggérez au moins une à trois recettes si possible avec les ingrédients donnés et les contraintes. Si aucune recette n'est possible, le tableau "recipes" peut être vide, mais expliquez pourquoi dans 'notesOnAdaptation' sur un objet recette "fictif" ou une note globale.

Formatez votre réponse en tant qu'objet JSON avec un champ "recipes". Chaque objet recette dans ce tableau doit avoir les champs suivants :
- "name": Le nom de la recette (en français).
- "ingredients": Un tableau de chaînes de caractères, listant UNIQUEMENT les ingrédients utilisés pour CETTE recette spécifique, tirés EXCLUSIVEMENT de la liste fournie par l'utilisateur : '{{{ingredients}}}' et compatibles avec les contraintes.
- "instructions": Une chaîne de caractères contenant les instructions détaillées et bien formatées (en français).
- "nutritionalInfo": Un objet optionnel avec les champs "calories", "protein", "carbs", "fat" (tous optionnels et de type string).
- "estimatedPreparationTime": Une chaîne optionnelle (ex: "environ 20 minutes").
- "estimatedCookingTime": Une chaîne optionnelle (ex: "environ 45 minutes").
- "notesOnAdaptation": Une chaîne optionnelle pour les notes sur l'adaptation ou les conflits.
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
    if (!output) {
      // Gérer le cas où l'IA ne renvoie rien ou une structure inattendue
      return { recipes: [{
        name: "Erreur de l'IA",
        ingredients: [],
        instructions: "L'IA n'a pas pu générer de suggestion de recette ou la réponse était malformée.",
        notesOnAdaptation: "L'IA n'a pas pu générer de suggestion de recette ou la réponse était malformée."
      }]};
    }
    // Si l'IA renvoie un tableau vide mais aucune note, ajouter une note générique.
    if (output.recipes.length === 0 && !output.recipes.some(r => r.notesOnAdaptation)) {
        return { recipes: [{
            name: "Aucune recette trouvée",
            ingredients: [],
            instructions: "Aucune recette n'a pu être générée avec les ingrédients et contraintes fournis.",
            notesOnAdaptation: "Aucune recette n'a pu être générée avec les ingrédients et contraintes fournis. Essayez de modifier vos ingrédients ou contraintes."
        }]};
    }
    return output;
  }
);

    