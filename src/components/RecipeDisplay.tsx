// src/components/RecipeDisplay.tsx
"use client";

import React, { useState } from "react"; 
import type { Recipe, RecipeVariation, RecipeWithVariations, SuggestIngredientSubstitutionInput, SuggestedSubstitute } from "@/lib/types"; 
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle as ShadcnCardTitle } from "@/components/ui/card"; 
import { UtensilsCrossed, ListChecks, CookingPot, AlertCircle, ImageOff, Heart, Flame, Beef, Wheat, Droplet, Info, ClipboardCopy, Lightbulb, Loader2, Megaphone, Clock3, Timer, Award, Target, CheckCircle, Replace, ChefHat } from "lucide-react"; 
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { getRecipeVariationsAction, getIngredientSubstitutionAction } from "@/app/actions"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";


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

interface SubstitutionDialogProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

function SubstitutionDialog({ recipe, isOpen, onClose }: SubstitutionDialogProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [constraints, setConstraints] = useState<string>("");
  const [isLoadingSubstitutions, setIsLoadingSubstitutions] = useState(false);
  const [substitutionSuggestions, setSubstitutionSuggestions] = useState<SuggestedSubstitute[]>([]);
  const [substitutionError, setSubstitutionError] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // Reset state when dialog opens or recipe changes
    if (isOpen) {
      setSelectedIngredient(recipe.ingredients[0] || "");
      setConstraints("");
      setSubstitutionSuggestions([]);
      setSubstitutionError(null);
    }
  }, [isOpen, recipe]);

  const handleFetchSubstitutions = async () => {
    if (!selectedIngredient) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un ingrédient.", variant: "destructive" });
      return;
    }
    setIsLoadingSubstitutions(true);
    setSubstitutionSuggestions([]);
    setSubstitutionError(null);

    const input: SuggestIngredientSubstitutionInput = {
      originalRecipeName: recipe.name,
      ingredientToSubstitute: selectedIngredient,
      originalIngredientsList: recipe.ingredients,
      originalInstructions: recipe.instructions,
      substitutionConstraints: constraints.trim() !== "" ? constraints : undefined,
    };

    const result = await getIngredientSubstitutionAction(input);
    setIsLoadingSubstitutions(false);

    if (result.error) {
      setSubstitutionError(result.error);
      toast({ title: "Erreur de Substitution", description: result.error, variant: "destructive" });
    } else if (result.data && result.data.substitutions.length > 0) {
      setSubstitutionSuggestions(result.data.substitutions);
      toast({ title: "Substitutions Trouvées!", description: `L'IA a trouvé ${result.data.substitutions.length} idée(s) pour remplacer ${selectedIngredient}.` });
    } else {
      setSubstitutionError("L'IA n'a pas pu suggérer de substitutions pour cet ingrédient avec ces contraintes.");
      toast({ title: "Aucune Substitution Trouvée", description: "L'IA n'a pas pu suggérer de substitutions pour cet ingrédient avec ces contraintes.", variant: "default" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Replace className="h-6 w-6 text-primary" />
            Conseiller en Substitution d'Ingrédients
          </DialogTitle>
          <DialogDescription>
            Pour la recette : <span className="font-semibold text-foreground">{recipe.name}</span>.
            Choisissez un ingrédient à remplacer et spécifiez des contraintes si besoin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="ingredient-select">Ingrédient à remplacer</Label>
            <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
              <SelectTrigger id="ingredient-select" className="w-full mt-1">
                <SelectValue placeholder="Sélectionnez un ingrédient" />
              </SelectTrigger>
              <SelectContent>
                {recipe.ingredients.map((ing, idx) => (
                  <SelectItem key={idx} value={ing}>{ing}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="substitution-constraints">Contraintes (optionnel)</Label>
            <Input
              id="substitution-constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="ex: végétarien, sans gluten, moins épicé"
              className="mt-1"
            />
          </div>
          <Button onClick={handleFetchSubstitutions} disabled={isLoadingSubstitutions || !selectedIngredient} className="w-full">
            {isLoadingSubstitutions ? (
              <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche de substitutions...</>
            ) : (
              <> <ChefHat className="mr-2 h-4 w-4" /> Obtenir des suggestions </>
            )}
          </Button>
        </div>

        {isLoadingSubstitutions && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        )}

        {substitutionError && !isLoadingSubstitutions && (
          <div className="mt-4 p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>{substitutionError}</p>
          </div>
        )}

        {substitutionSuggestions.length > 0 && !isLoadingSubstitutions && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
            <h4 className="text-md font-semibold text-foreground">Suggestions de l'IA :</h4>
            {substitutionSuggestions.map((sub, idx) => (
              <Card key={idx} className="bg-muted/50 p-3">
                <p className="font-semibold text-primary">{sub.substitute}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub.notes}</p>
                {sub.confidence && <p className="text-xs text-accent mt-1">Confiance : {sub.confidence}</p>}
              </Card>
            ))}
          </div>
        )}

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function RecipeDisplay({ recipes: initialRecipes, isLoading, error }: RecipeDisplayProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { toast } = useToast();
  
  const [recipesWithVariations, setRecipesWithVariations] = useState<RecipeWithVariations[]>(
    initialRecipes.map(r => ({...r, variations: [], isLoadingVariations: false, variationsError: null}))
  );

  const [isSubstitutionDialogOpen, setIsSubstitutionDialogOpen] = useState(false);
  const [currentRecipeForSubstitution, setCurrentRecipeForSubstitution] = useState<Recipe | null>(null);

  React.useEffect(() => {
    setRecipesWithVariations(initialRecipes.map(r => ({
      ...r, 
      variations: recipesWithVariations.find(rwv => rwv.name === r.name)?.variations || [],
      isLoadingVariations: recipesWithVariations.find(rwv => rwv.name === r.name)?.isLoadingVariations || false,
      variationsError: recipesWithVariations.find(rwv => rwv.name === r.name)?.variationsError || null,
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
    const recipeIndex = recipesWithVariations.findIndex(r => r.name === recipeName);
    if (recipeIndex === -1) return;

    const currentRecipe = recipesWithVariations[recipeIndex];

    setRecipesWithVariations(prev => prev.map(r => r.name === recipeName ? {...r, isLoadingVariations: true, variationsError: null, variations: [] } : r));

    const result = await getRecipeVariationsAction(currentRecipe.name, currentRecipe.ingredients, currentRecipe.instructions);

    if (result.error) {
      setRecipesWithVariations(prev => prev.map(r => r.name === recipeName ? {...r, isLoadingVariations: false, variationsError: result.error } : r));
      toast({
        title: "Erreur de Variations",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data && result.data.variations) {
      setRecipesWithVariations(prev => prev.map(r => r.name === recipeName ? {...r, isLoadingVariations: false, variations: result.data?.variations } : r));
      toast({
        title: "Variations Suggérées!",
        description: `L'IA a trouvé ${result.data.variations.length} variation(s) pour "${recipeName}".`,
      });
    } else {
       setRecipesWithVariations(prev => prev.map(r => r.name === recipeName ? {...r, isLoadingVariations: false, variationsError: "Aucune variation n'a été trouvée." } : r));
    }
  };
  
  const openSubstitutionModal = (recipe: Recipe) => {
    setCurrentRecipeForSubstitution(recipe);
    setIsSubstitutionDialogOpen(true);
  };


  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border border-border">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </CardHeader>
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
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
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
    return (
      <div className="mt-8 p-6 border border-border rounded-lg bg-card text-card-foreground shadow">
        <div className="flex items-center gap-3 mb-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-semibold">{initialRecipes[0].name}</h3>
        </div>
        <p className="text-muted-foreground">{initialRecipes[0].notesOnAdaptation || initialRecipes[0].goalAlignment}</p>
      </div>
    );
  }
  
  if (initialRecipes.length === 0) {
    return null; 
  }


  return (
    <>
    <Accordion type="single" collapsible className="w-full space-y-4 mt-8">
      {recipesWithVariations.map((recipe, index) => (
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
                    src={recipe.imageUrl} 
                    alt={`Image de ${recipe.name}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-md object-cover"
                    data-ai-hint={recipe.name.toLowerCase().split(' ').slice(0,2).join(' ')}
                  />
                </div>
              ) : (
                 recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" &&
                <div className="mb-4 flex flex-col items-center justify-center h-40 bg-muted/50 rounded-md border border-dashed border-border">
                  <ImageOff className="h-12 w-12 text-muted-foreground mb-3"/>
                  <p className="text-md text-muted-foreground">Aperçu non disponible</p>
                </div>
              )}
              { recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" && (
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
                  <Megaphone className="h-5 w-5 mt-0.5 shrink-0 text-accent" />
                  <p>{recipe.notesOnAdaptation}</p>
                </div>
              )}

              {recipe.goalAlignment && (
                <div className="p-3 border border-primary/50 rounded-md bg-primary/10 text-primary-foreground flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <p><strong className="text-primary">Alignement aux objectifs :</strong> {recipe.goalAlignment}</p>
                </div>
              )}


              {(recipe.estimatedPreparationTime || recipe.estimatedCookingTime || recipe.difficultyLevel) && (
                 <div className="pt-4 border-t border-border">
                  <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-foreground">
                    <Info className="h-5 w-5 text-primary" />
                    Détails de la Recette
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
                    <Target className="h-5 w-5 text-primary" />
                    Informations Nutritionnelles (Estimations par portion)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <InfoItem icon={Flame} label="Calories" value={recipe.nutritionalInfo.calories} />
                    <InfoItem icon={Beef} label="Protéines" value={recipe.nutritionalInfo.protein} />
                    <InfoItem icon={Wheat} label="Glucides" value={recipe.nutritionalInfo.carbs} />
                    <InfoItem icon={Droplet} label="Lipides" value={recipe.nutritionalInfo.fat} />
                    {recipe.nutritionalInfo.fiber && <InfoItem icon={ListChecks} label="Fibres" value={recipe.nutritionalInfo.fiber} />}
                    {/* On pourrait ajouter d'autres nutriments ici (sucre, sodium) si l'IA les fournit */}
                  </div>
                </div>
              )}

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium flex items-center gap-2 text-foreground">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Ingrédients
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(recipe.ingredients.join('\n'), 'ingrédients')}
                      className="text-muted-foreground hover:text-primary"
                      aria-label="Copier les ingrédients"
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" /> Copier
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recipe.instructions && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium flex items-center gap-2 text-foreground">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                      Instructions
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(recipe.instructions, 'instructions')}
                      className="text-muted-foreground hover:text-primary"
                      aria-label="Copier les instructions"
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" /> Copier
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed prose prose-sm max-w-none">
                    {recipe.instructions.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-1">{line}</p>
                    ))}
                  </div>
                </div>
              )}


              { recipe.name !== "Aucune recette trouvée" && recipe.name !== "Erreur de l'IA" && (
                <div className="pt-6 border-t border-border space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-start sm:gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleSuggestVariations(recipe.name)} 
                    disabled={recipe.isLoadingVariations}
                    className="w-full sm:w-auto"
                  >
                    {recipe.isLoadingVariations ? (
                      <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche ... </>
                    ) : (
                      <> <Lightbulb className="mr-2 h-4 w-4" /> Suggérer des Variations </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => openSubstitutionModal(recipe)}
                    className="w-full sm:w-auto"
                  >
                    <Replace className="mr-2 h-4 w-4" /> Idées de Substitution
                  </Button>

                </div>
              )}

                {recipe.isLoadingVariations && (
                  <div className="mt-4 space-y-3">
                    <Skeleton className="h-6 w-1/2 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                )}

                {recipe.variationsError && (
                  <div className="mt-4 p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>{recipe.variationsError}</p>
                  </div>
                )}

                {recipe.variations && recipe.variations.length > 0 && !recipe.isLoadingVariations && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-base font-medium text-foreground">Idées de Variations :</h4>
                    {recipe.variations.map((variation, vIndex) => (
                      <Card key={vIndex} className="bg-muted/50 border-border shadow-sm">
                        <CardHeader className="pb-3">
                          <ShadcnCardTitle className="text-md text-primary">{variation.variationName}</ShadcnCardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <p className="text-muted-foreground italic">{variation.description}</p>
                          {variation.changesToIngredients && variation.changesToIngredients.length > 0 && (
                            <div>
                              <strong className="text-foreground">Changements d'ingrédients :</strong>
                              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                                {variation.changesToIngredients.map((change, ciIndex) => (
                                  <li key={ciIndex}>{change}</li>
                                ))}
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
      ))}
    </Accordion>
    {currentRecipeForSubstitution && (
        <SubstitutionDialog
          recipe={currentRecipeForSubstitution}
          isOpen={isSubstitutionDialogOpen}
          onClose={() => setIsSubstitutionDialogOpen(false)}
        />
      )}
    </>
  );
}

export { Card, CardContent, CardHeader };
