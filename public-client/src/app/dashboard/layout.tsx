import { AppHeader } from "@/components/app-header";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <AppHeader />

            <div className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-24">
                        <DashboardNav />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
