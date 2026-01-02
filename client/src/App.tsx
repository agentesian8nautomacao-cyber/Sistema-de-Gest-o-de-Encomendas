import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "./components/AppLayout";
import PorteiroPage from "./pages/Porteiro";
import MoradorPage from "./pages/Morador";
import SindicoPage from "./pages/Sindico";
import NotificacoesPage from "./pages/Notificacoes";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType; 
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Rotas do Porteiro */}
      <Route path="/porteiro">
        <ProtectedRoute 
          component={PorteiroPage} 
          allowedRoles={["porteiro", "sindico", "admin"]} 
        />
      </Route>

      {/* Rotas do Morador */}
      <Route path="/morador">
        <ProtectedRoute 
          component={MoradorPage} 
          allowedRoles={["morador"]} 
        />
      </Route>

      {/* Rotas do Síndico */}
      <Route path="/sindico">
        <ProtectedRoute 
          component={SindicoPage} 
          allowedRoles={["sindico", "admin"]} 
        />
      </Route>

      {/* Notificações (todos os usuários autenticados) */}
      <Route path="/notificacoes">
        <ProtectedRoute component={NotificacoesPage} />
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
