
// src/app/loading.tsx
"use client"; 

import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";


export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 xl:grid-cols-5 xl:gap-12">
           <div className="lg:col-span-1 xl:col-span-2">
            <Skeleton className="h-[380px] w-full rounded-lg" />
           </div>
           <div className="lg:col-span-1 xl:col-span-3 mt-8 lg:mt-0 space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
