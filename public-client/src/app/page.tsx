"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Search } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from "@/components/app-header";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Rediriger automatiquement si déjà connecté
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/discover");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <Sparkles className="size-4" />
          Nouvelle plateforme de réservation
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
          Votre place préférée, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            réservée en 3 clics.
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Visualisez le plan interactif, choisissez votre emplacement idéal et confirmez votre réservation instantanément.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg mx-auto">
          <Button size="lg" className="gap-2 h-14 px-8 text-base flex-1 shadow-lg shadow-primary/20" asChild>
            <Link href="/discover">
              <Search className="size-5" />
              Trouver un espace
            </Link>
          </Button>
          <SignedOut>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base flex-1" asChild>
              <Link href="/discover">Mode Invité</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base flex-1" asChild>
              <Link href="/dashboard">Mon espace</Link>
            </Button>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
