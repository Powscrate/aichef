// src/ai/flows/generate-recipe-image-flow.ts
'use server';
/**
 * @fileOverview Generates an image for a given recipe name.
 *
 * - generateRecipeImage - A function that generates an image Data URI for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function (the Data URI string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to generate an image for.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.string().describe('The generated image as a Base64 encoded data URI.');
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;


export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    const imagePrompt = `Generate a visually appealing, appetizing, well-lit, high-quality photograph of the following dish: ${input.recipeName}. The image should look professional, suitable for a recipe website. Focus on the food itself.`;

    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (media && media.url) {
      return media.url; // This should be the data URI
    } else {
      console.error('Image generation failed, no media URL in response. Text response from model:', text);
      // It's better to let the action layer handle this and potentially return a partial success (recipes without image)
      // or a specific error message to the user. For now, we'll return an empty string or throw.
      // Throwing an error will make the whole recipe generation fail for that item if not caught properly in actions.ts
      // Returning an empty string allows the UI to skip the image.
      // Let's throw, and handle in actions.ts.
      throw new Error(`Failed to generate image for recipe: ${input.recipeName}.`);
    }
  }
);
