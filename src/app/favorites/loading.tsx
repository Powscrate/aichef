// src/app/favorites/loading.tsx
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/AppHeader";

export default function FavoritesLoading() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </main>
       <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        {currentYear !== null ? (
            <p>&copy; {currentYear} AI Chef.</p>
            ) : (
            <p>Chargement...</p>
            )}
      </footer>
    </div>
  );
}
