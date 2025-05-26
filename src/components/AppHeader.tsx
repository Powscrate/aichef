// src/components/AppHeader.tsx
import Link from 'next/link';
import { ChefHatIcon } from '@/components/icons/ChefHatIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Star } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-4 bg-background sticky top-0 z-40 w-full border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ChefHatIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chef IA <span className="text-primary">Simplifié</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/favorites" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Star className="h-5 w-5" />
            Mes Favoris
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
