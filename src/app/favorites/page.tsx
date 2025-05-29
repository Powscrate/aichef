
// src/app/favorites/page.tsx
"use client";

import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, HeartCrack } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const { favorites, removeAllFavorites, isLoaded } = useFavorites(); 
  const { toast } = useToast();

  const handleRemoveAllFavorites = () => {
    if (favorites.length > 0) {
      removeAllFavorites(); 
      toast({
        title: "Favoris supprimés",
        description: "Toutes vos recettes favorites ont été supprimées.",
      });
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>Chargement des favoris...</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary mb-4 sm:mb-0">
            Mes Recettes Favorites
          </h2>
          {favorites.length > 0 && (
            <Button variant="destructive" onClick={handleRemoveAllFavorites} size="sm">
              <HeartCrack className="mr-2 h-4 w-4" />
              Tout supprimer
            </Button>
          )}
        </div>

        {favorites.length > 0 ? (
          <RecipeDisplay recipes={favorites} isLoading={false} error={null} />
        ) : (
          <div className="text-center text-muted-foreground py-20">
            <UtensilsCrossed className="mx-auto h-16 w-16 mb-6" />
            <h3 className="text-xl font-semibold mb-2">Aucune recette favorite pour le moment.</h3>
            <p className="mb-6">Commencez par ajouter des recettes que vous aimez !</p>
            <Button asChild>
              <Link href="/">Trouver des recettes</Link>
            </Button>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
