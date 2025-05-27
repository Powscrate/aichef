'use server';
/**
 * @fileOverview Flux pour obtenir une astuce culinaire quotidienne.
 *
 * - getDailyCookingTip - Fonction principale pour obtenir une astuce.
 * - GetDailyCookingTipOutput - Type de retour pour la fonction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Pas de schéma d'entrée spécifique pour une astuce aléatoire pour l'instant.
// On pourrait ajouter un input pour les astuces précédentes afin d'assurer la diversité.

const GetDailyCookingTipOutputSchema = z.object({
  tip: z.string().describe("L'astuce culinaire du jour, concise et pratique."),
});
export type GetDailyCookingTipOutput = z.infer<typeof GetDailyCookingTipOutputSchema>;

export async function getDailyCookingTip(): Promise<GetDailyCookingTipOutput> {
  return getDailyCookingTipFlow();
}

const prompt = ai.definePrompt({
  name: 'getDailyCookingTipPrompt',
  output: {schema: GetDailyCookingTipOutputSchema},
  prompt: `Vous êtes un chef cuisinier expérimenté et pédagogue.
Votre rôle est de fournir UNE astuce culinaire quotidienne.
L'astuce doit être :
- Courte (1-2 phrases maximum).
- Pratique et utile pour un large public (des débutants aux cuisiniers plus avancés).
- Clairement expliquée.
- Originale si possible, ou un rappel utile.
- En français.

Voici quelques exemples de types d'astuces :
- Une technique de coupe.
- Un conseil pour conserver un aliment.
- Une astuce pour rehausser le goût d'un plat.
- Un "hack" de cuisine pour gagner du temps.
- Un conseil sur l'utilisation d'un ustensile.

Ne vous répétez pas trop si vous étiez appelé plusieurs fois (bien que pour cette version simple, la gestion de l'unicité sur plusieurs jours n'est pas implémentée dans le flux lui-même).
Fournissez simplement l'astuce.
`,
});

const getDailyCookingTipFlow = ai.defineFlow(
  {
    name: 'getDailyCookingTipFlow',
    outputSchema: GetDailyCookingTipOutputSchema,
  },
  async () => {
    const {output} = await prompt({}); // Pas d'input pour ce prompt simple
    if (!output || !output.tip) {
      throw new Error("L'IA n'a pas pu générer d'astuce culinaire.");
    }
    return output;
  }
);
