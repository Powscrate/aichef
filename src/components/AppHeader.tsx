// src/components/AppHeader.tsx
import Link from 'next/link';
import { ChefHatIcon } from '@/components/icons/ChefHatIcon';

export function AppHeader() {
  return (
    <header className="py-6 bg-background sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ChefHatIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chef IA <span className="text-primary">Simplifié</span>
          </h1>
        </Link>
        {/* Navigation links can go here if needed */}
      </div>
    </header>
  );
}
