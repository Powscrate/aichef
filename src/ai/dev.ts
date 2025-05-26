import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-recipe-image-flow.ts';
import '@/ai/flows/suggest-recipe-variations-flow.ts'; // Ajout du nouveau flux
