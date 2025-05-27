// src/app/about/page.tsx
"use client";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, Server, Database, Wind } from "lucide-react";

export default function AboutPage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">
              À Propos de Chef IA Simplifié
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-2">
              Votre assistant culinaire intelligent pour ne plus jamais être à court d'idées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p>
              <strong>Chef IA Simplifié</strong> est une application web conçue pour vous aider à découvrir de nouvelles recettes
              passionnantes en fonction des ingrédients que vous avez déjà chez vous. Fini le gaspillage et les prises de tête
              pour savoir quoi cuisiner !
            </p>
            <p>
              Notre intelligence artificielle analyse vos ingrédients, prend en compte vos préférences alimentaires et allergies,
              et vous propose des plats adaptés, complets avec instructions détaillées, estimations nutritionnelles, temps de
              préparation et de cuisson, et même un niveau de difficulté.
            </p>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Fonctionnalités Clés :</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Suggestions de recettes personnalisées basées sur vos ingrédients.</li>
                <li>Prise en compte des préférences (végétarien, vegan, sans gluten) et allergies.</li>
                <li>Génération d'images d'aperçu pour chaque plat.</li>
                <li>Estimations nutritionnelles, temps de préparation/cuisson et niveau de difficulté.</li>
                <li>Possibilité de sauvegarder vos recettes favorites.</li>
                <li>Suggestions de variations créatives pour chaque recette.</li>
                <li>Interface utilisateur épurée avec mode sombre et clair.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Technologies Utilisées :</h3>
              <p className="mb-2">
                Cette application a été construite avec des technologies modernes pour offrir une expérience rapide,
                réactive et intelligente :
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <strong>Next.js & React :</strong> Pour une interface utilisateur dynamique et performante.
                </li>
                <li className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <strong>Genkit (Google AI) :</strong> Pour les fonctionnalités d'intelligence artificielle générative.
                </li>
                <li className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <strong>Tailwind CSS & ShadCN/UI :</strong> Pour un design moderne et des composants réutilisables.
                </li>
                 <li className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <strong>TypeScript :</strong> Pour un code plus robuste et maintenable.
                </li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button asChild>
                <Link href="/">Retourner aux Recettes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        {currentYear !== null ? (
          <p>&copy; {currentYear} Chef IA Simplifié. Propulsé par Genkit.</p>
        ) : (
          <p>Chargement...</p>
        )}
      </footer>
    </div>
  );
}
