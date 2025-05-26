// src/lib/types.ts
export interface NutritionalInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  nutritionalInfo?: NutritionalInfo;
}
