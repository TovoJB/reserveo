"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart3,
  Sparkles,
  Share2,
  Plus,
  FilePlus,
  UserPlus,
  Github,
  Mail,
  Link2,
  Users,
  Building,
  Code,
  Headphones,
  Calendar,
  Layers,
  Globe,
  Settings,
  MousePointerClick,
  CheckSquare,
  Database,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

import { useDashboardStore } from "@/store/dashboard-store";
import { Badge } from "@/components/ui/badge";
import { useAccountSync } from "@/hooks/use-account-sync";
import { useWorkgroupStore } from "@/store/workgroup-store";
import { NotificationDropdown } from "./notification-dropdown";

export function DashboardHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams?.get("view");
  const { workspaceType } = useDashboardStore();
  const { me, refetch } = useAccountSync();
  const { groups } = useWorkgroupStore();

  const [hasDraftProfile, setHasDraftProfile] = useState(false);

  useEffect(() => {
    // Check if there is a draft stored in DB.
    if (!me?.onboardingData) {
      setHasDraftProfile(false);
      return;
    }

    try {
      const parsed = typeof me.onboardingData === 'string' ? JSON.parse(me.onboardingData) : me.onboardingData;
      setHasDraftProfile(parsed?.isComplete === false);
    } catch (e) {
      setHasDraftProfile(false);
    }
  }, [me]);

  useEffect(() => {
    const handleDraftUpdate = () => {
      if (refetch) refetch();
    };
    window.addEventListener("profileDraftUpdated", handleDraftUpdate);
    return () => {
      window.removeEventListener("profileDraftUpdated", handleDraftUpdate);
    };
  }, [refetch]);

  const getHeaderTitle = () => {
    switch (view) {
      case "calendar": return "Calendrier";
      case "bookmarks": return "Modèles d'Espaces";
      case "clients": return "Gestion Clients";
      case "tasks": return "Liste des Réservations";
      case "bookings": return "Plan de Salle";
      case "admin-reservation": return "Réservation Admin";
      case "development": return "Développement";
      case "support": return "Support";
      case "profile": return "Profil";
      case "teams": return "Equipes";
      case "clients-import": return "Sync Google Forms";
      case "organization": return "Organisation";
      case "organization-setup": return "Configuration Initiale";
      default: return "Dashboard";
    }
  };

  const getHeaderIcon = () => {
    switch (view) {
      case "calendar": return <Calendar className="size-4" />;
      case "bookmarks": return <Layers className="size-4" />;
      case "clients": return <UserPlus className="size-4" />;
      case "tasks": return <CheckSquare className="size-4" />;
      case "bookings": return <Globe className="size-4" />;
      case "admin-reservation": return <MousePointerClick className="size-4" />;
      case "development": return <Code className="size-4" />;
      case "support": return <Headphones className="size-4" />;
      case "profile": return <Building className="size-4" />;
      case "teams": return <Users className="size-4" />;
      case "clients-import": return <Database className="size-4" />;
      case "organization": return <Globe className="size-4" />;
      case "organization-setup": return <Sparkles className="size-4" />;
      default: return <BarChart3 className="size-4" />;
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b bg-card sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
          {getHeaderIcon()}
          <span className="text-sm font-medium">{getHeaderTitle()}</span>
          {hasDraftProfile && (
            <span className="relative flex size-2 ml-1" aria-label="Profil incomplet">
              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-orange-600" />
            </span>
          )}
          {workspaceType && (
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest">
              {workspaceType === "fixed" ? "Établissement" : "Événement"}
            </Badge>
          )}
          {hasDraftProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard?view=profile")}
              className="ml-4 h-7 border-orange-500/50 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700 font-medium"
            >
              <AlertCircle className="size-3.5 mr-1.5" />
              Reprendre le profil
            </Button>
          )}
          {groups.length === 0 && view !== "organization-setup" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard?view=organization-setup")}
              className="ml-4 h-7 border-blue-500/50 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 font-medium"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              Initialiser mon organisation
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex -space-x-2 mr-3 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="size-6 border-2 border-card">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="size-6 border-2 border-card">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="size-6 border-2 border-card">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <div className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted">
                  <Plus className="size-3" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Team Members
                </p>
              </div>
              <DropdownMenuItem>
                <Avatar className="size-5 mr-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <span>Sarah M.</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Avatar className="size-5 mr-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <span>James K.</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Avatar className="size-5 mr-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <span>Emily R.</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="size-4 mr-2" />
                <span>Invite by email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="size-4 mr-2" />
                <span>Copy invite link</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="size-4 mr-2" />
                <span>Manage team</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-5 w-px bg-border mx-2" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 hidden sm:flex"
            >
              <Sparkles className="size-3.5" />
              <span className="text-sm">Ask AI</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Generate report</DropdownMenuItem>
            <DropdownMenuItem>Analyze leads</DropdownMenuItem>
            <DropdownMenuItem>Suggest follow-ups</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 hidden sm:flex"
            >
              <Share2 className="size-3.5" />
              <span className="text-sm">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share with team</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationDropdown />
        <ThemeToggle />

        <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
          <Link
            href="https://github.com/ln-dev7/square-ui/tree/master/templates/dashboard-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function WelcomeSection() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Bonjour LN!
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Voici le récapitulatif de vos réservations aujourd&apos;hui.
        </p>
      </div>
    </div>
  );
}
