import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, Package, Users, BarChart3, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notificacoesNaoLidas } = trpc.notificacoes.listNaoLidas.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const handleLogout = () => {
    logout();
  };

  // Navegação baseada no perfil do usuário
  const getNavigation = () => {
    if (!user) return [];

    const baseNav: Array<{
      name: string;
      href: string;
      icon: typeof Bell;
      badge?: number;
    }> = [
      {
        name: "Notificações",
        href: "/notificacoes",
        icon: Bell,
        badge: notificacoesNaoLidas?.length || 0,
      },
    ];

    if (user.role === "porteiro" || user.role === "sindico" || user.role === "admin") {
      return [
        {
          name: "Encomendas",
          href: "/porteiro",
          icon: Package,
        },
        ...baseNav,
      ];
    }

    if (user.role === "morador") {
      return [
        {
          name: "Minhas Encomendas",
          href: "/morador",
          icon: Package,
        },
        ...baseNav,
      ];
    }

    if (user.role === "sindico" || user.role === "admin") {
      return [
        {
          name: "Dashboard",
          href: "/sindico",
          icon: BarChart3,
        },
        {
          name: "Moradores",
          href: "/sindico/moradores",
          icon: Users,
        },
        ...baseNav,
      ];
    }

    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="flex items-center gap-2 font-semibold text-xl text-foreground hover:text-primary transition-colors">
                <Package className="h-6 w-6 text-primary" />
                <span>Gestão de Encomendas</span>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-3 mr-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <nav className="container py-4 flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto px-2 py-0.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                );
              })}
              {user && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start px-4"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8">{children}</main>
    </div>
  );
}
