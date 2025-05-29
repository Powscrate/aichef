
// src/app/culinary-assistant/page.tsx
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getCulinaryAdviceAction } from "@/app/actions";
import { Lightbulb, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  question: z.string().min(10, { message: "Votre question doit contenir au moins 10 caractères." }),
});

type FormData = z.infer<typeof formSchema>;

export default function CulinaryAssistantPage() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // reset, // Removed reset as per user's previous preference
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAnswer(null);

    const result = await getCulinaryAdviceAction(data.question);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      toast({
        title: "Erreur de l'IA",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data) {
      setAnswer(result.data);
      toast({
        title: "Réponse de l'IA",
        description: "L'IA a répondu à votre question !",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8" /> Aide Culinaire IA
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-2">
              Posez n'importe quelle question de cuisine à notre assistant IA !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="question" className="block text-sm font-medium text-foreground mb-1">
                  Votre question culinaire
                </Label>
                <Textarea
                  id="question"
                  {...register("question")}
                  placeholder="Ex: Comment savoir si mon poisson est assez cuit ? Quelle est la différence entre mijoter et frémir ?"
                  className="min-h-[100px] text-base bg-input border-border focus:ring-primary"
                  aria-invalid={errors.question ? "true" : "false"}
                />
                {errors.question && (
                  <p className="text-sm text-destructive mt-1">{errors.question.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    L'IA réfléchit...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Demander à l'IA
                  </>
                )}
              </Button>
            </form>

            {isLoading && (
              <div className="space-y-3 mt-6">
                <Skeleton className="h-6 w-1/3 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            )}

            {error && !isLoading && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {answer && !isLoading && !error && (
              <Card className="mt-6 bg-muted/30 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <Lightbulb className="h-6 w-6" />
                    Réponse de l'IA :
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                    {answer}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
