
// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { getRecipesAction } from "./actions";
import type { Recipe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Settings2, Target, BarChart3 } from "lucide-react";


const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Veuillez entrer au moins un ingrédient (minimum 3 caractères)." }),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  allergies: z.string().optional(),
  targetCalories: z.string().optional(),
  macronutrientProfile: z.string().optional(),
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
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergies: "",
      targetCalories: "",
      macronutrientProfile: "",
    }
  });

  const isVegan = watch("isVegan");

  useEffect(() => {
    if (isVegan) {
      setValue("isVegetarian", true);
    }
  }, [isVegan, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecipes([]); 

    const dietaryPreferences: string[] = [];
    if (data.isVegetarian) dietaryPreferences.push("végétarien");
    if (data.isVegan) dietaryPreferences.push("vegan");
    if (data.isGlutenFree) dietaryPreferences.push("sans gluten");

    const result = await getRecipesAction(
      data.ingredients, 
      dietaryPreferences, 
      data.allergies,
      data.targetCalories,
      data.macronutrientProfile
    );

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
      if (result.data.length === 0 || (result.data.length === 1 && result.data[0].name === "Aucune recette trouvée")) {
        toast({
          title: "Aucune recette trouvée",
          description: result.data[0]?.notesOnAdaptation || "L'IA n'a trouvé aucune recette pour les ingrédients et contraintes fournis. Essayez-en d'autres !",
        });
      } else if (result.data.length === 1 && result.data[0].name === "Erreur de l'IA") {
         toast({
          title: "Erreur de l'IA",
          description: result.data[0]?.notesOnAdaptation || "Un problème est survenu avec l'IA.",
          variant: "destructive",
        });
      }
      
      else {
        toast({
          title: "Recettes trouvées!",
          description: `L'IA a concocté ${result.data.length} recette(s) pour vous.`,
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 xl:grid-cols-5 xl:gap-12">
          <div className="lg:col-span-1 xl:col-span-2">
            <Card className="shadow-xl lg:sticky lg:top-24 bg-card text-card-foreground border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl lg:text-4xl font-extrabold tracking-tight text-primary">
                  Qu'y a-t-il dans votre garde-manger ?
                </CardTitle>
                <CardDescription className="text-md lg:text-lg text-muted-foreground pt-2">
                  Entrez vos ingrédients et laissez notre chef IA vous concocter des idées !
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-1">
                      Vos ingrédients (séparés par une virgule)
                    </Label>
                    <Textarea
                      id="ingredients"
                      {...register("ingredients")}
                      placeholder="ex: blanc de poulet, brocoli, sauce soja, riz"
                      className="min-h-[100px] text-base bg-input border-border focus:ring-primary"
                      aria-invalid={errors.ingredients ? "true" : "false"}
                    />
                    {errors.ingredients && (
                      <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>
                    )}
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="preferences" className="border-b-0">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-2">
                        <div className="flex items-center">
                          <Settings2 className="h-5 w-5 mr-2 text-primary" />
                          Préférences, Restrictions & Objectifs (Optionnel)
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        <div className="space-y-3">
                          <Label className="text-xs font-medium text-foreground">Restrictions Alimentaires</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="isVegetarian" {...register("isVegetarian")} disabled={isVegan} />
                            <Label htmlFor="isVegetarian" className="text-sm font-normal text-muted-foreground">Végétarien</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="isVegan" {...register("isVegan")} />
                            <Label htmlFor="isVegan" className="text-sm font-normal text-muted-foreground">Vegan</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="isGlutenFree" {...register("isGlutenFree")} />
                            <Label htmlFor="isGlutenFree" className="text-sm font-normal text-muted-foreground">Sans Gluten</Label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="allergies" className="block text-xs font-medium text-foreground mt-3 mb-1">
                            Autres allergies ou restrictions (ex: arachides, lactose)
                          </Label>
                          <Input
                            id="allergies"
                            {...register("allergies")}
                            placeholder="ex: fruits à coque, soja"
                            className="text-sm bg-input border-border focus:ring-primary"
                          />
                        </div>
                        <div className="pt-3 border-t border-border">
                          <Label className="text-xs font-medium text-foreground">Objectifs Nutritionnels</Label>
                          <div className="mt-2 space-y-3">
                             <div>
                                <Label htmlFor="targetCalories" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center">
                                  <Target className="h-4 w-4 mr-1 text-primary/80" />
                                  Calories cibles par portion
                                </Label>
                                <Input
                                  id="targetCalories"
                                  {...register("targetCalories")}
                                  placeholder="ex: 500 kcal, < 400 kcal"
                                  className="text-sm bg-input border-border focus:ring-primary"
                                />
                              </div>
                              <div>
                                <Label htmlFor="macronutrientProfile" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center">
                                   <BarChart3 className="h-4 w-4 mr-1 text-primary/80" />
                                  Profil macronutritionnel souhaité
                                </Label>
                                <Input
                                  id="macronutrientProfile"
                                  {...register("macronutrientProfile")}
                                  placeholder="ex: riche en protéines, faible en glucides"
                                  className="text-sm bg-input border-border focus:ring-primary"
                                />
                              </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>


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
      <AppFooter />
    </div>
  );
}
