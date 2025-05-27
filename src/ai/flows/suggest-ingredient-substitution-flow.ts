// src/ai/flows/suggest-ingredient-substitution-flow.ts
'use server';
/**
 * @fileOverview Flow to suggest ingredient substitutions for a given recipe.
 *
 * - suggestIngredientSubstitution - Main function to get substitutions.
 * - SuggestIngredientSubstitutionInput - Input type for the function.
 * - SuggestIngredientSubstitutionOutput - Return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SuggestIngredientSubstitutionOutput as ISuggestIngredientSubstitutionOutput } from '@/lib/types'; // Use the interface

const SuggestIngredientSubstitutionInputSchema = z.object({
  originalRecipeName: z.string().describe("Le nom de la recette originale."),
  ingredientToSubstitute: z.string().describe("L'ingrédient spécifique de la recette originale que l'utilisateur souhaite remplacer."),
  originalIngredientsList: z.array(z.string()).describe("La liste complète des ingrédients de la recette originale."),
  originalInstructions: z.string().describe("Les instructions complètes de la recette originale."),
  substitutionConstraints: z.string().optional().describe("Contraintes ou préférences pour la substitution (ex: 'végétarien', 'sans gluten', 'option moins chère', 'pour un goût plus épicé')."),
});
export type SuggestIngredientSubstitutionInput = z.infer<typeof SuggestIngredientSubstitutionInputSchema>;

const SuggestedSubstituteSchema = z.object({
  substitute: z.string().describe("L'ingrédient suggéré en remplacement."),
  notes: z.string().describe("Explications sur la substitution : comment l'utiliser, l'impact sur le goût, la texture, le temps de cuisson, et toute modification nécessaire aux instructions originales."),
  confidence: z.string().optional().describe("Une indication de la pertinence ou de la confiance de l'IA dans cette suggestion (ex: 'Bonne alternative', 'Alternative possible avec ajustements', 'Option créative').")
});

const SuggestIngredientSubstitutionOutputSchema = z.object({
  substitutions: z.array(SuggestedSubstituteSchema).min(1).describe("Une liste d'au moins une (idéalement 2-3) suggestions de substitution pour l'ingrédient spécifié."),
});
// Export the Zod inferred type for use in actions.ts
export type SuggestIngredientSubstitutionOutput = z.infer<typeof SuggestIngredientSubstitutionOutputSchema>;


export async function suggestIngredientSubstitution(input: SuggestIngredientSubstitutionInput): Promise<ISuggestIngredientSubstitutionOutput> {
  const result = await suggestIngredientSubstitutionFlow(input);
  return result as ISuggestIngredientSubstitutionOutput;
}

const prompt = ai.definePrompt({
  name: 'suggestIngredientSubstitutionPrompt',
  input: {schema: SuggestIngredientSubstitutionInputSchema},
  output: {schema: SuggestIngredientSubstitutionOutputSchema},
  prompt: `Vous êtes un chef cuisinier expert et un scientifique alimentaire, spécialisé dans l'adaptation créative de recettes et la compréhension des interactions entre ingrédients.
L'utilisateur souhaite remplacer un ingrédient spécifique dans une recette existante.

Détails de la requête de l'utilisateur :
- Nom de la recette originale : {{{originalRecipeName}}}
- Ingrédient à remplacer : {{{ingredientToSubstitute}}}
- Liste des ingrédients originaux :
{{#each originalIngredientsList}}
  - {{{this}}}
{{/each}}
- Instructions originales :
{{{originalInstructions}}}
{{#if substitutionConstraints}}
- Contraintes ou préférences pour la substitution : {{{substitutionConstraints}}}
{{/if}}

Votre tâche est de fournir 1 à 3 suggestions de substitution pour l'ingrédient '{{{ingredientToSubstitute}}}'. Pour chaque suggestion, vous devez fournir :
1.  **substitute** : Le nom de l'ingrédient de remplacement (en français). Soyez précis (ex: "1 tasse de purée de pommes non sucrée" au lieu de juste "purée de pommes").
2.  **notes** : Des explications détaillées et pratiques (en français) :
    *   Comment cet ingrédient de remplacement affectera-t-il le goût, la texture, et potentiellement la couleur du plat final ?
    *   Quelles quantités du substitut utiliser par rapport à l'ingrédient original ? (ex: "Utiliser la même quantité", "Utiliser moitié moins de...")
    *   Y a-t-il des ajustements à apporter aux instructions de préparation ou de cuisson ? (ex: "Ajouter le substitut à la fin", "Réduire le temps de cuisson de 5 minutes"). Soyez aussi précis que possible.
    *   Si la substitution vise une contrainte (ex: rendre végétarien, sans gluten), confirmez que le substitut respecte cette contrainte.
3.  **confidence** (optionnel) : Une brève évaluation de la pertinence de cette substitution (ex: 'Excellente correspondance', 'Bonne alternative fonctionnelle', 'Option créative avec des changements notables').

Conseils pour vos suggestions :
- Priorisez les substitutions qui maintiennent l'esprit général de la recette '{{{originalRecipeName}}}' autant que possible, sauf si les contraintes suggèrent le contraire.
- Assurez-vous que les substituts soient relativement courants et accessibles.
- Si l'ingrédient à remplacer est crucial pour la structure ou le goût principal, et qu'une substitution est difficile, expliquez pourquoi et proposez la meilleure alternative possible, même si elle altère significativement le plat.
- Si plusieurs options de substitution existent, essayez d'en proposer avec des profils de saveur ou des complexités légèrement différents.
- Les substitutions doivent être en français.

Formatez votre réponse en tant qu'objet JSON avec un champ "substitutions".
`,
});

const suggestIngredientSubstitutionFlow = ai.defineFlow(
  {
    name: 'suggestIngredientSubstitutionFlow',
    inputSchema: SuggestIngredientSubstitutionInputSchema,
    outputSchema: SuggestIngredientSubstitutionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.substitutions || output.substitutions.length === 0) {
      throw new Error("L'IA n'a pas pu générer de suggestions de substitution pour cet ingrédient dans cette recette.");
    }
    return output;
  }
);
