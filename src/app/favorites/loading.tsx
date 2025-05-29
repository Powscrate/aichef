
// src/app/favorites/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

export default function FavoritesLoading() {
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
      <AppFooter />
    </div>
  );
}
