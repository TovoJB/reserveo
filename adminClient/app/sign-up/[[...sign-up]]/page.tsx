"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    // Pass the chosen type to the dashboard after registration
    const redirectUrl = type ? `/dashboard?setup=${type}` : "/dashboard";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <SignUp
                fallbackRedirectUrl={redirectUrl}
                forceRedirectUrl={redirectUrl}
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                        card: 'shadow-xl',
                        headerTitle: 'text-2xl font-bold',
                        headerSubtitle: 'text-muted-foreground',
                    },
                }}
            />
        </div>
    );
}
