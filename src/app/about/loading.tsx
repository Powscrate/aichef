// src/app/about/loading.tsx
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/AppHeader";

export default function AboutLoading() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
            <Skeleton className="h-6 w-full mx-auto rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-8 w-1/2 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-8 w-1/2 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-10 w-40 mx-auto rounded-lg" />
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
