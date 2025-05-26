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
  ingredients: z.string().min(3, { message: "Veuillez entrer au moins un ingrédient." }),
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
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data) {
      setRecipes(result.data);
      if (result.data.length === 0) {
        toast({
          title: "Aucune recette trouvée",
          description: "L'IA n'a trouvé aucune recette pour les ingrédients fournis. Essayez-en d'autres !",
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 xl:grid-cols-5 xl:gap-12">
          <div className="lg:col-span-1 xl:col-span-2">
            <Card className="shadow-xl lg:sticky lg:top-24">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl lg:text-4xl font-extrabold tracking-tight text-primary">
                  Qu'y a-t-il dans votre garde-manger ?
                </CardTitle>
                <CardDescription className="text-md lg:text-lg text-muted-foreground pt-2">
                  Entrez vos ingrédients, et notre chef IA vous concoctera des idées de recettes !
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-1">
                      Vos ingrédients
                    </Label>
                    <Textarea
                      id="ingredients"
                      {...register("ingredients")}
                      placeholder="ex: blanc de poulet, brocoli, sauce soja, riz"
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
                        Préparation des recettes...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Obtenir des recettes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 xl:col-span-3 mt-8 lg:mt-0">
            <RecipeDisplay recipes={recipes} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Chef IA Simplifié. Propulsé par Genkit.</p>
      </footer>
    </div>
  );
}
