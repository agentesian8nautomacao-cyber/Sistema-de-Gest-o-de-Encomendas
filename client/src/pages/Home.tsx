import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Package, Shield, Users, BarChart3, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // Redirecionar baseado no perfil do usuário
      if (user.role === "porteiro" || user.role === "admin") {
        setLocation("/porteiro");
      } else if (user.role === "morador") {
        setLocation("/morador");
      } else if (user.role === "sindico") {
        setLocation("/sindico");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center mb-6">
            <Package className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Sistema de Gestão de Encomendas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solução profissional para gerenciamento de encomendas em condomínios. 
            Simples, rápido e seguro.
          </p>
          <div className="pt-4">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href={getLoginUrl()}>
                Entrar no Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestão de Portaria</CardTitle>
              </div>
              <CardDescription>
                Registro rápido de encomendas com foto, tipo e informações do morador. 
                Interface otimizada para operação em menos de 10 segundos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Portal do Morador</CardTitle>
              </div>
              <CardDescription>
                Notificações automáticas quando encomendas chegam. 
                Histórico completo e visualização de encomendas pendentes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Relatórios e Analytics</CardTitle>
              </div>
              <CardDescription>
                Dashboard completo para síndicos com estatísticas, relatórios por período 
                e gestão de moradores.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Segurança e Isolamento</CardTitle>
              </div>
              <CardDescription>
                Controle de acesso baseado em perfis (RBAC). 
                Isolamento completo de dados entre condomínios.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Registro de Retirada</CardTitle>
              </div>
              <CardDescription>
                Confirmação de retirada com nome, data/hora automática e observações. 
                Rastreabilidade completa.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fácil de Usar</CardTitle>
              </div>
              <CardDescription>
                Interface minimalista e intuitiva. Responsivo para desktop, tablet e celular. 
                Sem curva de aprendizado.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            Pronto para modernizar seu condomínio?
          </h2>
          <p className="text-muted-foreground">
            Substitua cadernos de protocolo físicos por um sistema profissional e confiável.
          </p>
          <Button size="lg" variant="outline" className="mt-4" asChild>
            <a href={getLoginUrl()}>
              Acessar Sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
