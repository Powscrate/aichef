// src/ai/flows/generate-shopping-list-flow.ts
'use server';
/**
 * @fileOverview Flow to generate a categorized shopping list for a recipe.
 *
 * - generateShoppingList - Main function to get the shopping list.
 * - GenerateShoppingListInput - Input type for the function.
 * - GenerateShoppingListOutput - Return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShoppingListInputSchema = z.object({
  recipeName: z.string().describe("Le nom de la recette."),
  recipeIngredients: z.array(z.string()).describe("La liste des ingrédients requis pour la recette, idéalement avec les quantités (ex: '200g de poulet', '1 oignon')."),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const ShoppingListItemSchema = z.string().describe("Un article à acheter, incluant la quantité si spécifiée dans l'ingrédient original de la recette (ex: 'Poulet - 200g', 'Oignon - 1 moyen').");

const ShoppingListCategorySchema = z.object({
  categoryName: z.string().describe("Le nom de la catégorie de la liste de courses (ex: 'Fruits & Légumes', 'Produits Laitiers & Oeufs', 'Épicerie', 'Viandes & Poissons')."),
  items: z.array(ShoppingListItemSchema).min(1).describe("Une liste d'articles appartenant à cette catégorie."),
});

const GenerateShoppingListOutputSchema = z.object({
  recipeName: z.string().describe("Le nom de la recette pour laquelle la liste de courses a été générée."),
  shoppingList: z.array(ShoppingListCategorySchema).min(1).describe("La liste de courses catégorisée."),
  // notes: z.string().optional().describe("Toutes notes de l'IA, par exemple si certains ingrédients étaient difficiles à catégoriser."),
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `Vous êtes un expert en création de listes de courses organisées à partir d'ingrédients de recettes.
Pour la recette nommée "{{{recipeName}}}", avec les ingrédients suivants :
{{#each recipeIngredients}}
- {{{this}}}
{{/each}}

Veuillez générer une liste de courses catégorisée. Les catégories doivent être des sections courantes de supermarché comme 'Fruits & Légumes', 'Produits Laitiers & Oeufs', 'Viandes & Poissons', 'Épicerie', 'Épices & Herbes', 'Surgelés', 'Boissons', 'Boulangerie & Pâtisserie', 'Autres'.
**Si un ingrédient spécifie clairement une quantité (ex: "2 carottes", "1 tasse de farine", "200g de blanc de poulet"), incluez cette quantité dans l'article de la liste de courses.**
Assurez-vous que tous les ingrédients de la recette soient inclus dans la liste de courses.

Retournez la sortie sous forme d'objet JSON avec un champ "recipeName" (qui est "{{{recipeName}}}") et un champ "shoppingList". Le champ "shoppingList" doit être un tableau d'objets, où chaque objet a un "categoryName" et un tableau "items" (liste de chaînes d'ingrédients avec leurs quantités si spécifiées).
Si un ingrédient semble pouvoir appartenir à plusieurs catégories, choisissez la plus courante.
**Exemple d'un article dans la liste de courses : "2 gros oignons", "1 boîte (400g) de tomates concassées", "Persil frais, un petit bouquet".**
Assurez-vous que la langue pour les catégories et les articles soit le Français.
Si un ingrédient n'a pas de quantité explicite (ex: "sel"), listez-le simplement (ex: "Sel").
`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.shoppingList || output.shoppingList.length === 0) {
      throw new Error("L'IA n'a pas pu générer de liste de courses pour cette recette.");
    }
    // Assurer que recipeName est transmis, même si l'IA l'oublie
    return { ...output, recipeName: input.recipeName };
  }
);

