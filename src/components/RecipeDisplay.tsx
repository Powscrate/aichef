
// src/components/RecipeDisplay.tsx
"use client";

import React, { useState } from "react";
import type { Recipe, RecipeWithVariations, GenerateShoppingListOutput, RecipeWithShoppingList } from "@/lib/types";
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle as ShadcnCardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ListChecks, CookingPot, AlertCircle, ImageOff, Heart, Flame, Beef, Wheat, Droplet, Info, ClipboardCopy, Lightbulb, Loader2, Megaphone, Clock3, Timer, Award, Target, CheckCircle, Replace, ChefHat, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { getRecipeVariationsAction, getShoppingListAction } from "@/app/actions";
import { SubstitutionDialog } from "./dialogs/SubstitutionDialog";
import { ShoppingListDialog } from "./dialogs/ShoppingListDialog";


interface RecipeDisplayProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
}

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value?: string, srOnlyLabel?: string }> = ({ icon: Icon, label, value, srOnlyLabel }) => {
  if (!value) return null;
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-2 text-primary" aria-hidden="true" />
      <span className="sr-only">{srOnlyLabel || label}: </span>
      <span>{value}</span>
    </div>
  );
};

export function RecipeDisplay({ recipes: initialRecipes, isLoading, error }: RecipeDisplayProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { toast } = useToast();

  const [recipesState, setRecipesState] = useState<RecipeWithShoppingList[]>([]);

  const [isSubstitutionDialogOpen, setIsSubstitutionDialogOpen] = useState(false);
  const [currentRecipeForDialogs, setCurrentRecipeForDialogs] = useState<Recipe | null>(null);

  const [isShoppingListDialogOpen, setIsShoppingListDialogOpen] = useState(false);
  const [shoppingListData, setShoppingListData] = useState<GenerateShoppingListOutput | null>(null);
  const [isLoadingShoppingList, setIsLoadingShoppingList] = useState(false);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);


  React.useEffect(() => {
    setRecipesState(initialRecipes.map(r => ({
      ...r,
      variations: recipesState.find(rs => rs.name === r.name)?.variations || [],
      isLoadingVariations: recipesState.find(rs => rs.name === r.name)?.isLoadingVariations || false,
      variationsError: recipesState.find(rs => rs.name === r.name)?.variationsError || null,
      shoppingList: recipesState.find(rs => rs.name === r.name)?.shoppingList || undefined,
      isLoadingShoppingList: recipesState.find(rs => rs.name === r.name)?.isLoadingShoppingList || false,
      shoppingListError: recipesState.find(rs => rs.name === r.name)?.shoppingListError || null,
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecipes]);


  const isFavorited = (recipeName: string) => {
    return favorites.some(fav => fav.name === recipeName);
  };

  const handleFavoriteToggle = (recipe: Recipe) => {
    if (isFavorited(recipe.name)) {
      removeFavorite(recipe.name);
      toast({
        title: "Retirée des favoris",
        description: `"${recipe.name}" a été retirée de vos favoris.`,
      });
    } else {
      addFavorite(recipe);
      toast({
        title: "Ajoutée aux favoris!",
        description: `"${recipe.name}" a été ajoutée à vos favoris.`,
      });
    }
  };

  const handleCopyToClipboard = async (textToCopy: string, type: 'ingrédients' | 'instructions') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copié !",
        description: `Les ${type} ont été copiés dans le presse-papiers.`,
      });
    } catch (err) {
      console.error(`Échec de la copie des ${type}: `, err);
      toast({
        title: "Erreur de copie",
        description: `Impossible de copier les ${type}.`,
        variant: "destructive",
      });
    }
  };

  const handleSuggestVariations = async (recipeName: string) => {
    const recipeIndex = recipesState.findIndex(r => r.name === recipeName);
    if (recipeIndex === -1) return;
    const currentRecipe = recipesState[recipeIndex];

    setRecipesState(prev => prev.map(r => r.name === recipeName ? { ...r, isLoadingVariations: true, variationsError: null, variations: [] } : r));
    const result = await getRecipeVariationsAction(currentRecipe.name, currentRecipe.ingredients, currentRecipe.instructions);

    if (result.error) {
      setRecipesState(prev => prev.map(r => r.name === recipeName ? { ...r, isLoadingVariations: false, variationsError: result.error } : r));
      toast({ title: "Erreur de Variations", description: result.error, variant: "destructive" });
    } else if (result.data && result.data.variations) {
      setRecipesState(prev => prev.map(r => r.name === recipeName ? { ...r, isLoadingVariations: false, variations: result.data?.variations } : r));
      toast({ title: "Variations Suggérées!", description: `L'IA a trouvé ${result.data.variations.length} variation(s) pour "${recipeName}".` });
    } else {
      setRecipesState(prev => prev.map(r => r.name === recipeName ? { ...r, isLoadingVariations: false, variationsError: "Aucune variation n'a été trouvée." } : r));
    }
  };

  const openSubstitutionModal = (recipe: Recipe) => {
    setCurrentRecipeForDialogs(recipe);
    setIsSubstitutionDialogOpen(true);
  };
  
  const handleGenerateShoppingList = async (recipe: Recipe) => {
    setCurrentRecipeForDialogs(recipe); // Needed if the dialog eventually needs the full recipe for context
    setIsLoadingShoppingList(true);
    setShoppingListData(null);
    setShoppingListError(null);
    setIsShoppingListDialogOpen(true);

    const result = await getShoppingListAction(recipe.name, recipe.ingredients);
    setIsLoadingShoppingList(false);

    if (result.error) {
      setShoppingListError(result.error);
      toast({ title: "Erreur de Liste de Courses", description: result.error, variant: "destructive" });
    } else if (result.data) {
      setShoppingListData(result.data); // This is GenerateShoppingListOutput
      toast({ title: "Liste de Courses Générée!", description: `Votre liste de courses pour "${recipe.name}" est prête.` });
    } else {
      setShoppingListError("L'IA n'a pas pu générer de liste de courses.");
      toast({ title: "Aucune Liste de Courses", description: "L'IA n'a pas pu générer de liste de courses.", variant: "default" });
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border border-border">
            <CardHeader> <Skeleton className="h-8 w-3/4 rounded-md" /> </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 shadow">
        <AlertCircle className="h-5 w-5" /> <p>{error}</p>
      </div>
    );
  }

  if (initialRecipes.length === 0 && !isLoading) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10">
        <UtensilsCrossed className="mx-auto h-12 w-12 mb-4" />
        <p>Aucune recette à afficher. Essayez d'entrer des ingrédients et cliquez sur "Obtenir des recettes".</p>
      </div>
    );
  }

  if (initialRecipes.length === 1 && (initialRecipes[0].name === "Aucune recette trouvée" || initialRecipes[0].name === "Erreur de l'IA")) {
    const recipe = initialRecipes[0];
    const aiHint = recipe.name.toLowerCase().split(' ').slice(0,2).join(' ');
    return (
      <div className="mt-8 p-6 border border-border rounded-lg bg-card text-card-foreground shadow">
         {recipe.imageUrl && recipe.imageUrl.startsWith('https://placehold.co') ? (
            <div className="mb-4 overflow-hidden rounded-md shadow aspect-[16/10] relative">
              <Image
                src={recipe.imageUrl}
                alt={`Image de ${recipe.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-md object-cover"
                data-ai-hint={aiHint}
              />
            </div>
          ) : recipe.imageUrl ? (
             <div className="mb-4 overflow-hidden rounded-md shadow aspect-[16/10] relative">
              <Image
                src={recipe.imageUrl}
                alt={`Image de ${recipe.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-md object-cover"
                data-ai-hint={aiHint}
              />
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center justify-center h-40 bg-muted/50 rounded-md border border-dashed border-border">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-md text-muted-foreground">Aperçu non disponible</p>
            </div>
          )}
        <div className="flex items-center gap-3 mb-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-semibold">{recipe.name}</h3>
        </div>
        <p className="text-muted-foreground">{recipe.notesOnAdaptation || recipe.goalAlignment}</p>
      </div>
    );
  }

  if (recipesState.length === 0) { 
    return null;
  }


  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-4 mt-8">
        {recipesState.map((recipe, index) => {
          const aiHint = recipe.aiHint || recipe.name.toLowerCase().split(' ').slice(0,2).join(' ');
          return (
            <AccordionItem value={`recipe-${index}`} key={recipe.name + index} className="border border-border bg-card rounded-lg shadow-sm overflow-hidden">
              <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline text-primary w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <CookingPot className="h-6 w-6" />
                    <span className="text-left">{recipe.name}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-6">
                  {recipe.imageUrl ? (
                    <div className="mb-4 overflow-hidden rounded-md shadow aspect-[16/10] relative">
                      <Image
                        src={recipe.imageUrl} // Can be data URI or placehold.co
                        alt={`Image de ${recipe.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-md object-cover"
                        data-ai-hint={aiHint}
                      />
                    </div>
                  ) : (
                    recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" &&
                    <div className="mb-4 flex flex-col items-center justify-center h-40 bg-muted/50 rounded-md border border-dashed border-border">
                      <ImageOff className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-md text-muted-foreground">Aperçu non disponible</p>
                    </div>
                  )}
                  {recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavoriteToggle(recipe)}
                      className="w-full sm:w-auto flex items-center gap-2 group text-muted-foreground hover:text-primary"
                      aria-label={isFavorited(recipe.name) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className={`h-5 w-5 transition-colors duration-200 ${isFavorited(recipe.name) ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-500'}`} />
                      {isFavorited(recipe.name) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                  )}

                  {recipe.notesOnAdaptation && (
                    <div className="p-3 border border-accent/50 rounded-md bg-accent/10 text-accent-foreground flex items-start gap-2 text-sm">
                      <Megaphone className="h-5 w-5 mt-0.5 shrink-0 text-accent" /> <p>{recipe.notesOnAdaptation}</p>
                    </div>
                  )}

                  {recipe.goalAlignment && (
                    <div className="p-3 border border-primary/50 rounded-md bg-primary/10 text-primary-foreground flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                      <p className="text-primary"><strong className="text-primary">Alignement aux objectifs :</strong> {recipe.goalAlignment}</p>
                    </div>
                  )}


                  {(recipe.estimatedPreparationTime || recipe.estimatedCookingTime || recipe.difficultyLevel) && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-foreground">
                        <Info className="h-5 w-5 text-primary" /> Détails de la Recette
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        <InfoItem icon={Clock3} label="Préparation" value={recipe.estimatedPreparationTime} srOnlyLabel="Temps de préparation estimé" />
                        <InfoItem icon={Timer} label="Cuisson" value={recipe.estimatedCookingTime} srOnlyLabel="Temps de cuisson estimé" />
                        <InfoItem icon={Award} label="Difficulté" value={recipe.difficultyLevel} srOnlyLabel="Niveau de difficulté estimé" />
                      </div>
                    </div>
                  )}

                  {recipe.nutritionalInfo && (Object.values(recipe.nutritionalInfo).some(val => val)) && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-foreground">
                        <Target className="h-5 w-5 text-primary" /> Informations Nutritionnelles (Estimations par portion)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InfoItem icon={Flame} label="Calories" value={recipe.nutritionalInfo.calories} />
                        <InfoItem icon={Beef} label="Protéines" value={recipe.nutritionalInfo.protein} />
                        <InfoItem icon={Wheat} label="Glucides" value={recipe.nutritionalInfo.carbs} />
                        <InfoItem icon={Droplet} label="Lipides" value={recipe.nutritionalInfo.fat} />
                        {recipe.nutritionalInfo.fiber && <InfoItem icon={ListChecks} label="Fibres" value={recipe.nutritionalInfo.fiber} />}
                      </div>
                    </div>
                  )}

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-medium flex items-center gap-2 text-foreground">
                          <ListChecks className="h-5 w-5 text-primary" /> Ingrédients
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(recipe.ingredients.join('\n'), 'ingrédients')} className="text-muted-foreground hover:text-primary" aria-label="Copier les ingrédients">
                          <ClipboardCopy className="h-4 w-4 mr-2" /> Copier
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                        {recipe.ingredients.map((ingredient, i) => ( <li key={i}>{ingredient}</li> ))}
                      </ul>
                    </div>
                  )}

                  {recipe.instructions && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-medium flex items-center gap-2 text-foreground">
                          <UtensilsCrossed className="h-5 w-5 text-primary" /> Instructions
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(recipe.instructions, 'instructions')} className="text-muted-foreground hover:text-primary" aria-label="Copier les instructions">
                          <ClipboardCopy className="h-4 w-4 mr-2" /> Copier
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed prose prose-sm max-w-none">
                        {recipe.instructions.split('\n').map((line, idx) => ( <p key={idx} className="mb-1">{line}</p> ))}
                      </div>
                    </div>
                  )}


                  {recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" && (
                    <div className="pt-6 border-t border-border flex flex-wrap items-center justify-start gap-3">
                      <Button variant="secondary" onClick={() => handleSuggestVariations(recipe.name)} disabled={recipe.isLoadingVariations} className="flex-grow sm:flex-grow-0">
                        {recipe.isLoadingVariations ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche ... </> ) : ( <> <Lightbulb className="mr-2 h-4 w-4" /> Suggérer Variations </> )}
                      </Button>
                      <Button variant="outline" onClick={() => openSubstitutionModal(recipe)} className="flex-grow sm:flex-grow-0">
                        <Replace className="mr-2 h-4 w-4" /> Idées de Substitution
                      </Button>
                       <Button variant="outline" onClick={() => handleGenerateShoppingList(recipe)} className="flex-grow sm:flex-grow-0">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Liste de Courses
                      </Button>
                    </div>
                  )}

                  {recipe.isLoadingVariations && (
                    <div className="mt-4 space-y-3">
                      <Skeleton className="h-6 w-1/2 rounded" /> <Skeleton className="h-4 w-3/4 rounded" /> <Skeleton className="h-4 w-full rounded" />
                    </div>
                  )}
                  {recipe.variationsError && (
                    <div className="mt-4 p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" /> <p>{recipe.variationsError}</p>
                    </div>
                  )}
                  {recipe.variations && recipe.variations.length > 0 && !recipe.isLoadingVariations && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-base font-medium text-foreground">Idées de Variations :</h4>
                      {recipe.variations.map((variation, vIndex) => (
                        <Card key={vIndex} className="bg-muted/50 border-border shadow-sm">
                          <CardHeader className="pb-3"> <ShadcnCardTitle className="text-md text-primary">{variation.variationName}</ShadcnCardTitle> </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground italic">{variation.description}</p>
                            {variation.changesToIngredients && variation.changesToIngredients.length > 0 && (
                              <div>
                                <strong className="text-foreground">Changements d'ingrédients :</strong>
                                <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                                  {variation.changesToIngredients.map((change, ciIndex) => ( <li key={ciIndex}>{change}</li> ))}
                                </ul>
                              </div>
                            )}
                            {variation.changesToInstructions && (
                              <div>
                                <strong className="text-foreground">Changements d'instructions :</strong>
                                <p className="mt-1 text-muted-foreground whitespace-pre-line">{variation.changesToInstructions}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {currentRecipeForDialogs && (
        <SubstitutionDialog
          recipe={currentRecipeForDialogs}
          isOpen={isSubstitutionDialogOpen}
          onClose={() => setIsSubstitutionDialogOpen(false)}
        />
      )}
      
      <ShoppingListDialog
        shoppingListOutput={shoppingListData}
        isLoading={isLoadingShoppingList}
        error={shoppingListError}
        isOpen={isShoppingListDialogOpen}
        onClose={() => setIsShoppingListDialogOpen(false)}
      />
    </>
  );
}

export { Card, CardContent, CardHeader };
