// src/app/page.tsx
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { getRecipesAction } from "./actions";
import type { Recipe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Please enter at least one ingredient." }),
});

type FormData = z.infer<typeof formSchema>;

export default function AIPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecipes([]); // Clear previous recipes

    const result = await getRecipesAction(data.ingredients);

    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data) {
      setRecipes(result.data);
      if (result.data.length === 0) {
        toast({
          title: "No Recipes Found",
          description: "The AI couldn't find any recipes for the provided ingredients. Try different ones!",
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                What's in Your Pantry?
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">
                Enter your ingredients, and our AI chef will whip up some recipe ideas!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-1">
                    Your Ingredients
                  </Label>
                  <Textarea
                    id="ingredients"
                    {...register("ingredients")}
                    placeholder="e.g., chicken breast, broccoli, soy sauce, rice"
                    className="min-h-[100px] text-base"
                    aria-invalid={errors.ingredients ? "true" : "false"}
                  />
                  {errors.ingredients && (
                    <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Conjuring Recipes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Recipes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <RecipeDisplay recipes={recipes} isLoading={isLoading} error={error} />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} AI Chef Simplified. Powered by Delicious AI.</p>
      </footer>
    </div>
  );
}
