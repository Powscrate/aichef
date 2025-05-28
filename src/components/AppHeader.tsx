
// src/components/AppHeader.tsx
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Star, Info, MessageSquareQuestion } from 'lucide-react'; 

export function AppHeader() {
  return (
    <header className="py-4 bg-background sticky top-0 z-40 w-full border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <img src='/favicon.ico' className="h-8 w-8 text-primary" alt="AI Chef Logo" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI <span className="text-primary">Chef</span>
          </h1>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <Link href="/culinary-assistant" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <MessageSquareQuestion className="h-5 w-5" />
            Aide IA
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Star className="h-5 w-5" />
            Mes Favoris
          </Link>
          <Link href="/about" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Info className="h-5 w-5" />
            À Propos
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
