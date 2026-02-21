import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <SignIn
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
