// src/ai/flows/suggest-recipe-variations-flow.ts
'use server';
/**
 * @fileOverview Flux pour suggérer des variations d'une recette existante.
 *
 * - suggestRecipeVariations - Fonction principale pour obtenir des variations.
 * - SuggestRecipeVariationsInput - Type d'entrée pour la fonction.
 * - SuggestRecipeVariationsOutput - Type de retour pour la fonction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SuggestRecipeVariationsOutput as ISuggestRecipeVariationsOutput } from '@/lib/types';


const SuggestRecipeVariationsInputSchema = z.object({
  originalRecipeName: z.string().describe("Le nom de la recette originale."),
  originalIngredients: z.array(z.string()).describe("La liste des ingrédients de la recette originale."),
  originalInstructions: z.string().describe("Les instructions de la recette originale."),
});
export type SuggestRecipeVariationsInput = z.infer<typeof SuggestRecipeVariationsInputSchema>;

const RecipeVariationSchema = z.object({
  variationName: z.string().describe("Le nom de la variation suggérée (ex: 'Version Végétarienne', 'Touche d'Agrumes Fraîche')."),
  description: z.string().describe("Une brève description de ce qui caractérise cette variation."),
  changesToIngredients: z.array(z.string()).optional().describe("Liste des changements spécifiques aux ingrédients (ex: 'Remplacer le poulet par 200g de tofu fumé, coupé en dés', 'Ajouter le zeste d'un citron vert')."),
  changesToInstructions: z.string().optional().describe("Description des modifications à apporter aux étapes de préparation (ex: 'Mariner le tofu pendant 30 minutes avant l'étape 2.', 'Incorporer le zeste de citron en fin de cuisson, juste avant de servir.').")
});

const SuggestRecipeVariationsOutputSchema = z.object({
  variations: z.array(RecipeVariationSchema).min(1).describe("Une liste d'au moins une, et idéalement 2 à 3, variations suggérées pour la recette.")
});
// Exporter le type Zod inféré pour l'utiliser dans actions.ts
export type SuggestRecipeVariationsOutput = z.infer<typeof SuggestRecipeVariationsOutputSchema>;


export async function suggestRecipeVariations(input: SuggestRecipeVariationsInput): Promise<ISuggestRecipeVariationsOutput> {
  const result = await suggestRecipeVariationsFlow(input);
  // Assurer la conformité avec l'interface TypeScript si nécessaire, bien que Zod devrait garantir cela.
  return result as ISuggestRecipeVariationsOutput;
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeVariationsPrompt',
  input: {schema: SuggestRecipeVariationsInputSchema},
  output: {schema: SuggestRecipeVariationsOutputSchema},
  prompt: `Vous êtes un expert culinaire créatif, spécialisé dans la réinvention de plats existants.
Pour la recette suivante fournie par l'utilisateur :
Nom Original : {{{originalRecipeName}}}
Ingrédients Originaux :
{{#each originalIngredients}}
- {{{this}}}
{{/each}}
Instructions Originales :
{{{originalInstructions}}}

Votre tâche est de proposer 2 à 3 variations intéressantes et distinctes pour cette recette. Chaque variation doit être clairement décrite.

Pour chaque variation, vous devez fournir :
1.  **variationName** : Un nom accrocheur et descriptif pour la variation (en français).
2.  **description** : Une courte phrase expliquant l'esprit ou le principal changement de cette variation (en français).
3.  **changesToIngredients** (optionnel) : Une liste de modifications claires et concises à apporter à la liste d'ingrédients. Soyez précis (ex: "Remplacer 200g de boeuf par 250g de champignons de Paris", "Ajouter 1 cuillère à café de gingembre frais râpé"). Si aucun ingrédient ne change mais que la manière de les préparer change radicalement pour la variation, ce champ peut être omis.
4.  **changesToInstructions** (optionnel) : Des instructions claires sur comment modifier la préparation originale pour réaliser cette variation. Référencez les étapes de la recette originale si possible (ex: "À l'étape 3, après avoir ajouté les oignons, incorporez également...", "Sauter l'étape 4 et la remplacer par..."). Ce champ peut être omis si les changements sont mineurs et déjà couverts par \\\`changesToIngredients\\\`.

Assurez-vous que les variations soient pertinentes et réalisables. Les instructions de modification doivent être en français.
Concentrez-vous sur la transformation de la recette existante. Ne suggérez pas de recettes complètement différentes.
Le but est d'offrir des alternatives créatives à l'utilisateur pour un plat qu'il connaît ou qu'il envisage de faire.

Formatez votre réponse en tant qu'objet JSON avec un champ "variations".
`,
});

const suggestRecipeVariationsFlow = ai.defineFlow(
  {
    name: 'suggestRecipeVariationsFlow',
    inputSchema: SuggestRecipeVariationsInputSchema,
    outputSchema: SuggestRecipeVariationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("L'IA n'a pas pu générer de variations pour cette recette.");
    }
    return output;
  }
);
