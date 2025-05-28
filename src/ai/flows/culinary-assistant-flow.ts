
// src/ai/flows/culinary-assistant-flow.ts
'use server';
/**
 * @fileOverview Flow to get answers to general culinary questions.
 *
 * - getCulinaryAdvice - Main function to get advice.
 * - CulinaryAssistantInput - Input type for the function.
 * - CulinaryAssistantOutput - Return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CulinaryAssistantInputSchema = z.object({
  question: z.string().describe("La question culinaire posée par l'utilisateur."),
});
export type CulinaryAssistantInput = z.infer<typeof CulinaryAssistantInputSchema>;

const CulinaryAssistantOutputSchema = z.object({
  answer: z.string().describe("La réponse fournie par l'IA à la question culinaire."),
});
export type CulinaryAssistantOutput = z.infer<typeof CulinaryAssistantOutputSchema>;

export async function getCulinaryAdvice(input: CulinaryAssistantInput): Promise<CulinaryAssistantOutput> {
  return culinaryAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'culinaryAssistantPrompt',
  input: {schema: CulinaryAssistantInputSchema},
  output: {schema: CulinaryAssistantOutputSchema},
  prompt: `Vous êtes un assistant culinaire IA expert, amical et très compétent. Votre rôle est de répondre clairement et de manière concise aux questions de cuisine que les utilisateurs vous posent.
Fournissez des conseils pratiques, des explications sur des techniques, des astuces pour la conservation des aliments, des idées pour résoudre des problèmes courants en cuisine, ou des informations sur des ingrédients.
La question de l'utilisateur est : "{{{question}}}"

Répondez en français. Soyez direct et informatif. Structurez votre réponse pour qu'elle soit facile à lire, en utilisant des paragraphes courts ou des listes à puces si cela améliore la clarté.
Par exemple, si on vous demande "Comment puis-je empêcher mes avocats de brunir ?", vous pourriez expliquer la méthode du jus de citron, du film plastique au contact, etc.
Si la question est vague, essayez de fournir une réponse utile et générale.
Ne suggérez pas de recettes complètes à moins que la question ne le demande très spécifiquement. Concentrez-vous sur l'aide ponctuelle.
`,
});

const culinaryAssistantFlow = ai.defineFlow(
  {
    name: 'culinaryAssistantFlow',
    inputSchema: CulinaryAssistantInputSchema,
    outputSchema: CulinaryAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.answer) {
      throw new Error("L'IA n'a pas pu fournir de réponse à cette question.");
    }
    return output;
  }
);
