// src/hooks/use-favorites.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';

const FAVORITES_STORAGE_KEY = 'chefIA_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des favoris depuis localStorage:", error);
        // Potentially corrupted data, clear it
        // localStorage.removeItem(FAVORITES_STORAGE_KEY); 
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
         console.error("Erreur lors de la sauvegarde des favoris dans localStorage:", error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((recipe: Recipe) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.some(fav => fav.name === recipe.name)) {
        return [...prevFavorites, recipe];
      }
      return prevFavorites;
    });
  }, []);

  const removeFavorite = useCallback((recipeName: string) => {
    setFavorites((prevFavorites) => prevFavorites.filter(fav => fav.name !== recipeName));
  }, []);

  const removeAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const isFavorited = useCallback((recipeName: string) => {
    return favorites.some(fav => fav.name === recipeName);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, removeAllFavorites, isFavorited, isLoaded };
}
