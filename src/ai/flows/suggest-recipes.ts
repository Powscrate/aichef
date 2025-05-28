
// src/ai/flows/suggest-recipes.ts
'use server';
/**
 * @fileOverview Recipe suggestion flow based on a list of ingredients, dietary preferences, allergies, and nutritional goals.
 *
 * - suggestRecipes - A function that suggests recipes.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients.'),
  dietaryPreferences: z.array(z.string()).optional().describe('An optional list of dietary preferences (e.g., "végétarien", "vegan", "sans gluten").'),
  allergies: z.string().optional().describe('An optional comma-separated string listing allergies (e.g., "arachides, lactose").'),
  targetCalories: z.string().optional().describe('Optional target calorie count per serving (e.g., "environ 500 kcal", "moins de 400 kcal").'),
  macronutrientProfile: z.string().optional().describe('Optional desired macronutrient profile (e.g., "riche en protéines, faible en glucides", "équilibré", "riche en fibres").'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const NutritionalInfoSchema = z.object({
  calories: z.string().optional().describe('Calories estimées (par exemple, "environ 350 kcal").'),
  protein: z.string().optional().describe('Protéines estimées (par exemple, "environ 30g").'),
  carbs: z.string().optional().describe('Glucides estimés (par exemple, "environ 40g").'),
  fat: z.string().optional().describe('Lipides estimés (par exemple, "environ 15g").'),
  fiber: z.string().optional().describe('Fibres estimées (par exemple, "environ 5g").'),
  sugar: z.string().optional().describe('Sucres estimés (par exemple, "environ 10g").'),
  sodium: z.string().optional().describe('Sodium estimé (par exemple, "environ 500mg").'),
}).describe("Informations nutritionnelles estimées et détaillées par portion.").optional();

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe, including estimated quantities for each (e.g., "200g de poulet", "1 oignon moyen").'),
      instructions: z.string().describe('The instructions for the recipe.'),
      nutritionalInfo: NutritionalInfoSchema,
      notesOnAdaptation: z.string().optional().describe('Optional notes if the recipe was adapted due to preferences/allergies, or if no compatible recipe could be found.'),
      estimatedPreparationTime: z.string().optional().describe("Temps de préparation estimé (ex: 'environ 20 minutes', '10-15 minutes')."),
      estimatedCookingTime: z.string().optional().describe("Temps de cuisson estimé, dérivé de l'analyse des instructions (ex: 'environ 30 minutes', '45 min - 1 heure')."),
      difficultyLevel: z.string().optional().describe("Niveau de difficulté estimé (ex: 'Facile', 'Moyen', 'Difficile') basé sur les ingrédients, les instructions et le temps total."),
      goalAlignment: z.string().optional().describe("Explication de la manière dont la recette correspond aux objectifs nutritionnels spécifiés par l'utilisateur (targetCalories, macronutrientProfile). Si aucun objectif n'est spécifié, ce champ peut être omis ou indiquer une adéquation générale."),
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
  prompt: `Vous êtes un chef cuisinier et nutritionniste expert, capable de créer des recettes délicieuses, saines et parfaitement adaptées aux besoins des utilisateurs. Votre mission est de suggérer des recettes basées sur les ingrédients fournis, en respectant scrupuleusement les préférences alimentaires, allergies, et objectifs nutritionnels spécifiés.

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

{{#if targetCalories}}
Objectif calorique par portion : {{{targetCalories}}}
{{/if}}

{{#if macronutrientProfile}}
Profil macronutritionnel souhaité : {{{macronutrientProfile}}}
{{/if}}

Pour chaque recette suggérée :
1.  **Langue :** Tous les noms de recettes, listes d'ingrédients et instructions doivent être en **français**.
2.  **Liste d'Ingrédients Détaillée pour Chaque Recette :**
    *   Pour chaque ingrédient de la recette que vous proposez (exclusivement tirés de '{{{ingredients}}}'), **spécifiez une quantité réaliste et appropriée** (ex: "200g de blancs de poulet", "1 gros oignon", "2 cuillères à soupe d'huile d'olive", "sel et poivre au goût").
    *   La liste des ingrédients doit être prête à être utilisée pour faire les courses.
3.  **Instructions Détaillées et Lisibles :**
    *   **Complètes :** Guidage étape par étape, précis, adapté même aux novices.
    *   **Claires :** Langage simple, sans jargon excessif.
    *   **Structurées :** Étapes numérotées. Pour les étapes complexes, utilisez des sous-puces.
    *   **Orientées Action :** Commencez les étapes par des verbes.
4.  **Informations Nutritionnelles Estimées (Détaillées si possible) :**
    *   Fournissez une **estimation** des informations nutritionnelles par portion : calories, protéines, glucides, lipides. Si possible, ajoutez des estimations pour les fibres, sucres, et sodium.
    *   Indiquez clairement que ce sont des estimations. Omettez les champs si une estimation fiable est impossible.
5.  **Estimations des Temps :**
    *   \`estimatedPreparationTime\` : Réaliste et clair (ex: "20 minutes").
    *   \`estimatedCookingTime\` : **Analysez attentivement les 'instructions'** pour déduire une estimation réaliste (ex: "environ 30 minutes", "45 min - 1 heure"). Si aucune cuisson n'est requise (ex: salade), indiquez "Aucun" ou "N/A".
6.  **Niveau de Difficulté Estimé (\`difficultyLevel\`) :**
    *   Évaluez la difficulté (Facile, Moyen, Difficile) en considérant la complexité des techniques, le nombre d'ingrédients à gérer, et le temps total.
7.  **Adaptation et Alignement aux Objectifs :**
    *   Respectez scrupuleusement les \`dietaryPreferences\` et \`allergies\` en utilisant UNIQUEMENT les ingrédients fournis.
    *   **\`goalAlignment\` :**
        *   Si des \`targetCalories\` ou \`macronutrientProfile\` sont spécifiés, expliquez clairement et brièvement (1-2 phrases) dans ce champ comment la recette proposée s'aligne (ou tente de s'aligner) avec ces objectifs, en se basant sur vos estimations nutritionnelles. Par exemple: "Cette recette est estimée à X calories, ce qui correspond bien à votre objectif de Y calories. Son profil riche en Z et pauvre en W s'aligne avec votre demande."
        *   Si la recette ne peut pas parfaitement atteindre l'objectif avec les ingrédients fournis, expliquez pourquoi et comment elle s'en approche au mieux.
        *   Si aucun objectif nutritionnel n'est spécifié par l'utilisateur, ce champ peut être omis ou contenir une note générale sur la salubrité de la recette.
    *   **\`notesOnAdaptation\` :**
        *   Utilisez ce champ pour toute note importante sur l'adaptation de la recette (ex: si une recette a été rendue végétarienne, ou si un ingrédient allergène a été omis, impactant potentiellement le plat).
        *   **Conflits :** Si les ingrédients fournis et les contraintes (préférences, allergies, objectifs nutritionnels) sont fortement contradictoires, signalez-le clairement ici. Proposez une recette qui utilise un sous-ensemble compatible des ingrédients ou indiquez qu'aucune recette viable ne peut être élaborée.

Suggérez 1 à 3 recettes. Si aucune recette n'est possible en raison des contraintes, le tableau "recipes" peut être vide, mais fournissez une explication dans 'notesOnAdaptation' d'un objet recette "fictif" ou une note globale.

Formatez votre réponse en tant qu'objet JSON avec un champ "recipes". Chaque objet recette doit avoir les champs décrits ci-dessus.
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
      return { recipes: [{
        name: "Erreur de l'IA",
        ingredients: [],
        instructions: "L'IA n'a pas pu générer de suggestion de recette ou la réponse était malformée.",
        notesOnAdaptation: "L'IA n'a pas pu générer de suggestion de recette ou la réponse était malformée."
      }]};
    }
    if (output.recipes.length === 0 && !output.recipes.some(r => r.notesOnAdaptation || r.goalAlignment)) {
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

