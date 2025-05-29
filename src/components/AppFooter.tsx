
// src/components/AppFooter.tsx
"use client";

import { useState, useEffect } from "react";
import { getDailyCookingTipAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";

const DAILY_TIP_STORAGE_KEY = 'chefIA_dailyTip';
const DAILY_TIP_DATE_STORAGE_KEY = 'chefIA_dailyTipDate';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(true);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const fetchOrLoadTip = async () => {
      setIsLoadingTip(true);
      const today = new Date().toDateString();
      const storedTip = localStorage.getItem(DAILY_TIP_STORAGE_KEY);
      const storedDate = localStorage.getItem(DAILY_TIP_DATE_STORAGE_KEY);

      if (storedTip && storedDate === today) {
        setDailyTip(storedTip);
        setIsLoadingTip(false);
      } else {
        try {
          const result = await getDailyCookingTipAction();
          if (result.data) {
            setDailyTip(result.data);
            localStorage.setItem(DAILY_TIP_STORAGE_KEY, result.data);
            localStorage.setItem(DAILY_TIP_DATE_STORAGE_KEY, today);
          } else if (result.error) {
            console.error("Erreur de l'astuce du jour:", result.error);
            setDailyTip(null); 
          }
        } catch (e) {
          console.error("Exception lors de la récupération de l'astuce du jour:", e);
          setDailyTip(null);
        } finally {
          setIsLoadingTip(false);
        }
      }
    };
    
    // Only run on client
    if (typeof window !== 'undefined') {
        fetchOrLoadTip();
    } else {
        setIsLoadingTip(false); // No tip on SSR or if window is undefined
    }

  }, []);

  return (
    <footer className="py-6 border-t border-border text-sm text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isLoadingTip && typeof window !== 'undefined' && (
          <div className="mb-4 p-3 max-w-2xl mx-auto">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {!isLoadingTip && dailyTip && typeof window !== 'undefined' && (
          <Alert className="mb-6 border-primary/50 bg-primary/10 max-w-2xl mx-auto text-center">
            <Lightbulb className="h-5 w-5 text-primary mx-auto mb-1 sm:mx-0 sm:absolute sm:left-4 sm:top-4" />
            <AlertTitle className="text-primary font-semibold mt-0 sm:mt-0 [&+div]:pt-0 sm:[&>svg~*]:pl-7">Astuce Culinaire du Jour</AlertTitle>
            <AlertDescription className="text-foreground/80 whitespace-pre-line">
              {dailyTip}
            </AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          {currentYear !== null ? (
            <p>&copy; {currentYear} AI Chef.</p>
          ) : (
            <p>Chargement du copyright...</p>
          )}
        </div>
      </div>
    </footer>
  );
}

