"use client";
import { cn } from "@/app/Dashboard/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Settings,
  LogOut as Logout,
  SettingsIcon as Functions,
  PanelLeft,
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Barre latéral */}
      <div
        className={cn(
          "border-r bg-muted/10 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Header Barre latéral */}
        <div className="h-14 border-b px-4 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sidebarOpen
                  ? "Fermer la barre latérale"
                  : "Ouvrir la barre latérale"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="ml-2 font-medium text-sm">
            Historique de conversation
          </span>
        </div>

        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="flex flex-col h-full p-4 space-y-60">
            <div className="flex-grow">{/* Contenu principal ici */}</div>

            {/* Séparateur */}
            <div className="pt-60 border-t"></div>

            {/* Boutons en bas */}
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/");
                }}
              >
                <Logout className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          </div>
        </ScrollArea>
      </div>

      {/* Toggle Button - Visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="h-14 border-b px-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ouvrir la barre latérale</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b px-4 flex items-center justify-between">
            <h1 className="text-sm font-medium">Conversation</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Télécharger toute la conversation
              </Button>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
