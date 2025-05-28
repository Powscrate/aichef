
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-recipe-image-flow.ts';
import '@/ai/flows/suggest-recipe-variations-flow.ts';
import '@/ai/flows/get-daily-cooking-tip-flow.ts';
import '@/ai/flows/suggest-ingredient-substitution-flow.ts';
import '@/ai/flows/generate-shopping-list-flow.ts';
import '@/ai/flows/culinary-assistant-flow.ts'; // Ajout du nouveau flux
