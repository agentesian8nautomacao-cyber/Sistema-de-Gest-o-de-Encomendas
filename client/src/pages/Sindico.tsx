import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle2, TrendingUp, Users, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SindicoPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "last">("current");
  
  const dataInicio = useMemo(() => {
    const base = selectedPeriod === "current" ? new Date() : subMonths(new Date(), 1);
    return startOfMonth(base);
  }, [selectedPeriod]);

  const dataFim = useMemo(() => {
    const base = selectedPeriod === "current" ? new Date() : subMonths(new Date(), 1);
    return endOfMonth(base);
  }, [selectedPeriod]);

  const { data: dashboard } = trpc.relatorios.dashboard.useQuery();
  const { data: condominio } = trpc.condominio.get.useQuery();
  const { data: moradores } = trpc.moradores.list.useQuery();
  const { data: encomendas } = trpc.encomendas.listByPeriodo.useQuery({
    dataInicio,
    dataFim,
  });

  const stats = useMemo(() => {
    if (!encomendas) return { total: 0, pendentes: 0, retiradas: 0, porTipo: {} };

    const pendentes = encomendas.filter((e) => e.status === "pendente").length;
    const retiradas = encomendas.filter((e) => e.status === "retirada").length;

    const porTipo = encomendas.reduce((acc, e) => {
      acc[e.tipo] = (acc[e.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: encomendas.length,
      pendentes,
      retiradas,
      porTipo,
    };
  }, [encomendas]);

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      carta: "Cartas",
      pacote: "Pacotes",
      delivery: "Deliveries",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard do Síndico</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral e relatórios do condomínio {condominio?.nome}
        </p>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes Agora</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboard?.totalPendentes || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando retirada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalMes || 0}</div>
            <p className="text-xs text-muted-foreground">Encomendas recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retiradas do Mês</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalRetiradas || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.totalMes
                ? `${Math.round((dashboard.totalRetiradas / dashboard.totalMes) * 100)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moradores?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="periodo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="periodo">Relatório por Período</TabsTrigger>
          <TabsTrigger value="moradores">Moradores</TabsTrigger>
        </TabsList>

        <TabsContent value="periodo" className="mt-6 space-y-4">
          {/* Seletor de Período */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Período de Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant={selectedPeriod === "current" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("current")}
              >
                Mês Atual
              </Button>
              <Button
                variant={selectedPeriod === "last" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("last")}
              >
                Mês Anterior
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas do Período */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total de Encomendas</CardTitle>
                <CardDescription>
                  {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                  {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pendentes</CardTitle>
                <CardDescription>Ainda não retiradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.pendentes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retiradas</CardTitle>
                <CardDescription>Já entregues aos moradores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.retiradas}</div>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
              <CardDescription>Quantidade de encomendas por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.porTipo).map(([tipo, quantidade]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getTipoLabel(tipo)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${stats.total > 0 ? (quantidade / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <Badge variant="outline">{quantidade}</Badge>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.porTipo).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma encomenda neste período
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Encomendas do Período</CardTitle>
              <CardDescription>{stats.total} encomenda(s) registrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {encomendas && encomendas.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {encomendas.map((encomenda) => (
                    <div
                      key={encomenda.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Apto {encomenda.apartamento}</p>
                          <Badge variant="outline" className="text-xs">
                            {encomenda.tipo}
                          </Badge>
                          <Badge
                            variant={encomenda.status === "pendente" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {encomenda.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(encomenda.dataHoraRegistro), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma encomenda neste período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moradores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Moradores</CardTitle>
              <CardDescription>{moradores?.length || 0} morador(es) cadastrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {moradores && moradores.length > 0 ? (
                <div className="space-y-2">
                  {moradores.map((morador) => (
                    <div
                      key={morador.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{morador.nome}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Apartamento: {morador.apartamento}
                          </p>
                          {morador.telefone && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">{morador.telefone}</p>
                            </>
                          )}
                          {morador.email && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">{morador.email}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={morador.ativo ? "default" : "secondary"}>
                        {morador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum morador cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
